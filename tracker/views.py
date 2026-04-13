from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.views.decorators.http import require_POST
from django.utils import timezone
from datetime import timedelta
from .models import PeriodCycle, HealthSymptom, CycleReminder
from .forms import PeriodCycleForm, HealthSymptomForm, CycleReminderForm, SignUpForm


def signup(request):
    """User registration/signup view"""
    if request.user.is_authenticated:
        return redirect('home')
    
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            messages.success(request, 'Account created successfully! Please log in.')
            return redirect('login')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"{field}: {error}")
    else:
        form = SignUpForm()
    
    return render(request, 'auth/signup.html', {'form': form})


@login_required
def dashboard(request):
    """Display user's period tracking dashboard"""
    user = request.user
    current_date = timezone.now().date()
    
    # Get current cycle
    current_cycle = PeriodCycle.objects.filter(
        user=user,
        start_date__lte=current_date
    ).exclude(end_date__lt=current_date).first()
    
    # Get recent cycles
    recent_cycles = PeriodCycle.objects.filter(user=user)[:6]
    
    # Get upcoming predicted cycle
    last_cycle = PeriodCycle.objects.filter(user=user).first()
    predicted_next_period = None
    
    try:
        reminder = user.cycle_reminder
        if last_cycle and last_cycle.end_date:
            predicted_next_period = last_cycle.end_date + timedelta(days=reminder.average_cycle_length)
    except CycleReminder.DoesNotExist:
        pass
    
    context = {
        'current_cycle': current_cycle,
        'recent_cycles': recent_cycles,
        'predicted_next_period': predicted_next_period,
        'current_date': current_date,
    }
    return render(request, 'tracker/dashboard.html', context)


@login_required
def log_period(request):
    """Log a new period cycle"""
    if request.method == 'POST':
        form = PeriodCycleForm(request.POST)
        if form.is_valid():
            period = form.save(commit=False)
            period.user = request.user
            period.save()
            messages.success(request, 'Period logged successfully!')
            return redirect('period_detail', pk=period.pk)
    else:
        form = PeriodCycleForm()
    
    return render(request, 'tracker/log_period.html', {'form': form})


@login_required
def period_detail(request, pk):
    """View details of a specific period cycle"""
    period = get_object_or_404(PeriodCycle, pk=pk, user=request.user)
    symptoms = period.symptoms.all()
    
    if request.method == 'POST':
        form = HealthSymptomForm(request.POST)
        if form.is_valid():
            symptom = form.save(commit=False)
            symptom.period = period
            symptom.save()
            messages.success(request, 'Symptom logged successfully!')
            return redirect('period_detail', pk=period.pk)
    else:
        form = HealthSymptomForm()
    
    context = {
        'period': period,
        'symptoms': symptoms,
        'form': form,
    }
    return render(request, 'tracker/period_detail.html', context)


@login_required
def edit_period(request, pk):
    """Edit a period cycle"""
    period = get_object_or_404(PeriodCycle, pk=pk, user=request.user)
    
    if request.method == 'POST':
        form = PeriodCycleForm(request.POST, instance=period)
        if form.is_valid():
            form.save()
            messages.success(request, 'Period updated successfully!')
            return redirect('period_detail', pk=period.pk)
    else:
        form = PeriodCycleForm(instance=period)
    
    return render(request, 'tracker/edit_period.html', {'form': form, 'period': period})


@login_required
def delete_period(request, pk):
    """Delete a period cycle"""
    period = get_object_or_404(PeriodCycle, pk=pk, user=request.user)
    
    if request.method == 'POST':
        period.delete()
        messages.success(request, 'Period deleted successfully!')
        return redirect('dashboard')
    
    return render(request, 'tracker/delete_period.html', {'period': period})


@login_required
def cycle_history(request):
    """View all period cycles"""
    cycles = PeriodCycle.objects.filter(user=request.user)
    
    # Calculate statistics
    if cycles.exists():
        durations = [c.get_duration() for c in cycles if c.end_date]
        avg_duration = round(sum(durations) / len(durations)) if durations else 0
    else:
        avg_duration = 0
    
    context = {
        'cycles': cycles,
        'avg_duration': avg_duration,
        'total_cycles': cycles.count(),
    }
    return render(request, 'tracker/cycle_history.html', context)


@login_required
def delete_symptom(request, pk):
    """Delete a symptom"""
    symptom = get_object_or_404(HealthSymptom, pk=pk, period__user=request.user)
    period_id = symptom.period.pk
    
    if request.method == 'POST':
        symptom.delete()
        messages.success(request, 'Symptom deleted successfully!')
    
    return redirect('period_detail', pk=period_id)


@login_required
def settings(request):
    """Update cycle reminder settings"""
    reminder, created = CycleReminder.objects.get_or_create(user=request.user)
    
    if request.method == 'POST':
        form = CycleReminderForm(request.POST, instance=reminder)
        if form.is_valid():
            form.save()
            messages.success(request, 'Settings updated successfully!')
            return redirect('dashboard')
    else:
        form = CycleReminderForm(instance=reminder)
    
    return render(request, 'tracker/settings.html', {'form': form})
