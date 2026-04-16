from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
# Utility function to send a styled HTML password reset email
def send_password_reset_email(user_email, user_name, reset_link):
    subject = "Reset Your Period Tracker Password"
    from_email = "no-reply@periodtracker.com"
    to = [user_email]
    year = timezone.now().year

    html_content = render_to_string("emails/password_reset.html", {
        "user_name": user_name,
        "reset_link": reset_link,
        "year": year,
    })
    text_content = strip_tags(html_content)

    msg = EmailMultiAlternatives(subject, text_content, from_email, to)
    msg.attach_alternative(html_content, "text/html")
    msg.send()
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib import messages
from django.views.decorators.http import require_POST, require_http_methods
from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from datetime import timedelta, date
import json
from django.core.mail import send_mail
from django.conf import settings as django_settings
from .models import PeriodCycle, HealthSymptom, CycleReminder, UserToken
from .forms import PeriodCycleForm, HealthSymptomForm, CycleReminderForm, SignUpForm


def get_cycle_phase(current_day, cycle_length=28):
    """
    Determine menstrual cycle phase based on current day.
    
    Standard cycle phases:
    - Menstruation: Days 1-5
    - Follicular: Days 1-13
    - Ovulation: Day 14
    - Luteal: Days 15-28 (or to end of cycle)
    
    Args:
        current_day: Current day in cycle (1-indexed)
        cycle_length: Total cycle length in days (default 28)
    
    Returns:
        dict with phase info
    """
    if not current_day or current_day < 1:
        return {
            'phase': 'unknown',
            'name': 'Unknown',
            'description': 'Log a period to track your cycle',
            'color': 'gray'
        }
    
    # Normalize current_day to cycle_length if it exceeds
    day_in_cycle = ((current_day - 1) % cycle_length) + 1
    
    if day_in_cycle <= 5:
        return {
            'phase': 'menstruation',
            'name': 'Menstruation',
            'description': 'Menstrual phase - Shedding uterine lining',
            'color': 'rose',
            'day': day_in_cycle,
            'days_remaining': 5 - day_in_cycle + 1
        }
    elif day_in_cycle <= 13:
        return {
            'phase': 'follicular',
            'name': 'Follicular',
            'description': 'Follicular phase - Hormone levels rising, energy increasing',
            'color': 'blue',
            'day': day_in_cycle,
            'days_remaining': 13 - day_in_cycle + 1
        }
    elif day_in_cycle == 14:
        return {
            'phase': 'ovulation',
            'name': 'Ovulation',
            'description': 'Ovulation phase - Most fertile day, energy peak',
            'color': 'amber',
            'day': day_in_cycle,
            'days_remaining': 1
        }
    else:  # days 15-28
        return {
            'phase': 'luteal',
            'name': 'Luteal',
            'description': 'Luteal phase - Progesterone rises, energy may decrease',
            'color': 'purple',
            'day': day_in_cycle,
            'days_remaining': cycle_length - day_in_cycle + 1
        }


def get_authenticated_user(request):
    """Extract and validate user from Bearer token in Authorization header"""
    auth_header = request.META.get('HTTP_AUTHORIZATION', '').strip()
    
    print(f"DEBUG: Auth header received: {auth_header[:50] if auth_header else 'No header'}")
    
    if not auth_header or not auth_header.startswith('Bearer '):
        print("DEBUG: No Bearer token found")
        return None
    
    token_str = auth_header[7:].strip()  # Remove 'Bearer ' prefix (7 characters)
    if not token_str:
        print("DEBUG: Token string is empty")
        return None
    
    print(f"DEBUG: Validating token: {token_str[:20]}...")
    user = UserToken.validate_token(token_str)
    print(f"DEBUG: Token validation result: {user}")
    return user


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


# API Endpoints for Next.js Frontend

@csrf_exempt
@require_http_methods(["POST"])
def api_signup(request):
    """API endpoint for user signup"""
    try:
        data = json.loads(request.body)
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        print(f"[SIGNUP] username={username}, email={email}, password_len={len(password)}")
        # Validation
        if not username:
            print("[SIGNUP] Username missing")
            return JsonResponse({'error': 'Username is required'}, status=400)
        if not email:
            print("[SIGNUP] Email missing")
            return JsonResponse({'error': 'Email is required'}, status=400)
        if not password or len(password) < 8:
            print("[SIGNUP] Password too short")
            return JsonResponse({'error': 'Password must be at least 8 characters'}, status=400)
        # Check if email already exists (email must be unique)
        if User.objects.filter(email=email).exists():
            print("[SIGNUP] Email already exists")
            return JsonResponse({'error': 'Email already exists'}, status=400)
        # Create user (username can be duplicated)
        user = User.objects.create_user(username=username, email=email, password=password)
        print(f"[SIGNUP] User created: id={user.id}, username={user.username}, email={user.email}")
        # Generate and store token
        token_str = UserToken.generate_token(user)
        print(f"[SIGNUP] Token generated: {token_str[:8]}...")
        return JsonResponse({
            'token': token_str,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
            }
        }, status=201)
    
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def api_login(request):
    """API endpoint for user login"""
    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip()
        password = data.get('password', '')
        print(f"[LOGIN] email={email}, password_len={len(password)}")
        # Validation
        if not email:
            print("[LOGIN] Email missing")
            return JsonResponse({'error': 'Email is required'}, status=400)
        if not password:
            print("[LOGIN] Password missing")
            return JsonResponse({'error': 'Password is required'}, status=400)
        # Get user by email
        try:
            user = User.objects.get(email=email)
            print(f"[LOGIN] User found: id={user.id}, username={user.username}, email={user.email}")
        except User.DoesNotExist:
            print("[LOGIN] User not found for email")
            return JsonResponse({'error': 'Invalid email or password'}, status=401)
        # Authenticate user
        user = authenticate(username=user.username, password=password)
        if not user:
            print("[LOGIN] Authentication failed for user")
            return JsonResponse({'error': 'Invalid email or password'}, status=401)
        # Generate and store token
        token_str = UserToken.generate_token(user)
        print(f"[LOGIN] Token generated: {token_str[:8]}...")
        return JsonResponse({
            'token': token_str,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
            }
        }, status=200)
    except json.JSONDecodeError:
        print("[LOGIN] Invalid JSON")
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        print(f"[LOGIN] Exception: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def api_logout(request):
    """API endpoint for user logout"""
    try:
        # Just return success - token is stored on client and will be cleared there
        return JsonResponse({
            'message': 'Logged out successfully'
        }, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET", "POST"])
def api_periods(request):
    """API endpoint for listing and creating periods"""
    # Authenticate user
    user = get_authenticated_user(request)
    if not user:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    try:
        if request.method == 'GET':
            # List periods for authenticated user
            periods = PeriodCycle.objects.filter(user=user).values(
                'id', 'start_date', 'end_date', 'flow_intensity', 'notes', 'created_at'
            )
            return JsonResponse(list(periods), safe=False, status=200)
        
        elif request.method == 'POST':
            # Create a new period
            data = json.loads(request.body)
            start_date = data.get('start_date')
            end_date = data.get('end_date')
            flow_intensity = data.get('flow_intensity')
            notes = data.get('notes', '')
            
            # Validation
            if not start_date or not end_date or not flow_intensity:
                return JsonResponse({'error': 'Missing required fields'}, status=400)
            
            # Validate flow_intensity
            if flow_intensity not in ['light', 'moderate', 'heavy']:
                return JsonResponse({'error': 'Invalid flow_intensity value'}, status=400)
            
            # Create period in database
            period = PeriodCycle.objects.create(
                user=user,
                start_date=start_date,
                end_date=end_date,
                flow_intensity=flow_intensity,
                notes=notes
            )
            
            return JsonResponse({
                'id': period.id,
                'start_date': period.start_date,
                'end_date': period.end_date,
                'flow_intensity': period.flow_intensity,
                'notes': period.notes,
                'message': 'Period logged successfully'
            }, status=201)
    
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET", "PUT", "DELETE"])
def api_period_detail(request, pk):
    """API endpoint for getting, updating, or deleting a specific period"""
    # Authenticate user
    user = get_authenticated_user(request)
    if not user:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    try:
        # Get the period
        period = PeriodCycle.objects.get(id=pk, user=user)
        
        if request.method == 'GET':
            # Return period details
            return JsonResponse({
                'id': period.id,
                'start_date': period.start_date.isoformat(),
                'end_date': period.end_date.isoformat(),
                'flow_intensity': period.flow_intensity,
                'notes': period.notes,
            }, status=200)
        
        elif request.method == 'PUT':
            # Update period
            data = json.loads(request.body)
            
            if 'start_date' in data:
                start_date_str = data['start_date']
                period.start_date = date.fromisoformat(start_date_str)
            if 'end_date' in data:
                end_date_str = data['end_date']
                period.end_date = date.fromisoformat(end_date_str)
            if 'flow_intensity' in data:
                flow_intensity = data['flow_intensity']
                if flow_intensity not in ['light', 'moderate', 'heavy']:
                    return JsonResponse({'error': 'Invalid flow_intensity value'}, status=400)
                period.flow_intensity = flow_intensity
            if 'notes' in data:
                period.notes = data['notes']
            
            period.save()
            
            return JsonResponse({
                'id': period.id,
                'start_date': period.start_date.isoformat(),
                'end_date': period.end_date.isoformat(),
                'flow_intensity': period.flow_intensity,
                'notes': period.notes,
                'message': 'Period updated successfully'
            }, status=200)
        
        elif request.method == 'DELETE':
            # Delete period
            period.delete()
            return JsonResponse({'message': 'Period deleted successfully'}, status=200)
    
    except PeriodCycle.DoesNotExist:
        return JsonResponse({'error': 'Period not found'}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def api_stats_cycle_info(request):
    """API endpoint for cycle statistics with phase information"""
    try:
        # Authenticate user
        user = get_authenticated_user(request)
        if not user:
            return JsonResponse({'error': 'Unauthorized'}, status=401)
        
        # Get user's cycle settings
        try:
            reminder = user.cycle_reminder
            cycle_length = reminder.average_cycle_length
        except CycleReminder.DoesNotExist:
            cycle_length = 28
        
        # Get most recent period
        last_period = PeriodCycle.objects.filter(user=user).first()
        
        current_day = None
        next_period_date = None
        last_period_date = None
        phase_info = None
        
        if last_period:
            last_period_date = last_period.start_date.isoformat()
            
            # Calculate next period date
            next_date = last_period.start_date + timedelta(days=cycle_length)
            next_period_date = next_date.isoformat()
            
            # Calculate current day in cycle
            current_date = date.today()
            
            # If we're past the last period, calculate from last period start
            if current_date >= last_period.start_date:
                days_since_start = (current_date - last_period.start_date).days + 1
                # Pass actual days, don't use modulo - this allows frontend to detect late periods
                current_day = days_since_start
            else:
                # If current date is before last period (shouldn't happen), set to day 1
                current_day = 1
            
            # Get phase information
            phase_info = get_cycle_phase(current_day, cycle_length)
        else:
            # No period logged yet
            phase_info = get_cycle_phase(None, cycle_length)
        
        return JsonResponse({
            'current_day': current_day,
            'cycle_length': cycle_length,
            'next_period_date': next_period_date,
            'last_period_date': last_period_date,
            'phase': phase_info,
        }, status=200)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def api_stats_prediction(request):
    """API endpoint for period prediction"""
    try:
        return JsonResponse({
            'predicted_date': None,
            'confidence': 0,
        }, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def api_stats_history(request):
    """API endpoint for cycle history statistics"""
    try:
        return JsonResponse({
            'total_periods': 0,
            'average_duration': 0,
            'average_cycle_length': 28,
        }, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET", "PUT"])
def api_settings(request):
    """API endpoint for user settings"""
    # Validate token from Authorization header
    user = get_authenticated_user(request)
    if not user:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    try:
        if request.method == 'GET':
            # Get user's cycle reminder settings
            reminder, _ = CycleReminder.objects.get_or_create(user=user)
            
            return JsonResponse({
                'cycle_length': reminder.average_cycle_length,
                'period_length': reminder.average_period_length,
                'send_notifications': reminder.reminder_enabled,
                'email': user.email,
                'username': user.username,
            }, status=200)
        
        elif request.method == 'PUT':
            data = json.loads(request.body)
            cycle_length = data.get('cycle_length')
            period_length = data.get('period_length')
            send_notifications = data.get('send_notifications')
            email = data.get('email')
            username = data.get('username')
            password = data.get('password')
            
            # Validate email if provided
            if email and '@' not in email:
                return JsonResponse({'error': 'Invalid email format'}, status=400)
            
            # Validate password if provided
            if password and len(password) < 8:
                return JsonResponse({'error': 'Password must be at least 8 characters'}, status=400)
            
            # Update user account info
            if email:
                user.email = email
            if username:
                user.username = username
            if password:
                user.set_password(password)
            user.save()
            
            # Update cycle reminder settings
            reminder, _ = CycleReminder.objects.get_or_create(user=user)
            if cycle_length is not None:
                reminder.average_cycle_length = cycle_length
            if period_length is not None:
                reminder.average_period_length = period_length
            if send_notifications is not None:
                reminder.reminder_enabled = send_notifications
            reminder.save()
            
            return JsonResponse({
                'cycle_length': reminder.average_cycle_length,
                'period_length': reminder.average_period_length,
                'send_notifications': reminder.reminder_enabled,
                'email': user.email,
                'username': user.username,
                'message': 'Settings updated successfully'
            }, status=200)
    
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def api_send_notification(request):
    """API endpoint for sending notifications"""
    try:
        data = json.loads(request.body)
        user_email = data.get('email')
        notification_type = data.get('type', 'period_reminder')  # period_reminder, symptom_alert, etc.
        
        if not user_email:
            return JsonResponse({'error': 'Email is required'}, status=400)
        
        # In production, you would use Django's email backend or a service like SendGrid
        # For now, we'll simulate sending an email
        notification_messages = {
            'period_reminder': f'Reminder: Your period is expected in 3 days! Track your health with Period Tracker.',
            'symptom_alert': 'Remember to log your symptoms for better health insights.',
            'cycle_update': 'Your cycle information has been updated successfully.',
        }
        
        message = notification_messages.get(notification_type, 'You have a notification from Period Tracker')
        
        # Simulate sending email (in production, use Django's send_mail)
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f'Notification sent to {user_email}: {message}')
        
        return JsonResponse({
            'success': True,
            'message': 'Notification sent successfully',
            'email': user_email,
            'type': notification_type,
            'content': message
        }, status=200)
    
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def api_test_period_notifications(request):
    """Test endpoint for period notification system"""
    try:
        user = get_authenticated_user(request)
        if not user:
            return JsonResponse({'error': 'Unauthorized'}, status=401)
        
        # Import the management command
        from tracker.management.commands.send_period_notifications import Command
        
        # Create command instance
        command = Command()
        
        # Process user
        from datetime import date
        today = date.today()
        
        try:
            command.process_user(user, today)
            
            # Get recent notification logs for this user
            from tracker.models import NotificationLog
            recent_logs = NotificationLog.objects.filter(user=user).order_by('-sent_date')[:5]
            
            return JsonResponse({
                'success': True,
                'message': 'Notification system test executed',
                'user': user.username,
                'recent_notifications': [
                    {
                        'type': log.notification_type,
                        'date': log.sent_date.isoformat(),
                        'success': log.success,
                        'subject': log.subject,
                        'email': log.recipient_email,
                    }
                    for log in recent_logs
                ]
            }, status=200)
        
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

from .models import PasswordResetToken  # add to your existing imports

@csrf_exempt
def api_password_reset_request(request):
    """Send password reset email"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip()
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    # Always return success to prevent email enumeration
    try:
        user = User.objects.get(email=email)
        token_str = PasswordResetToken.generate_token(user)
        reset_url = f"{django_settings.FRONTEND_URL}/reset-password?token={token_str}"

            send_password_reset_email(
                user_email=user.email,
                user_name=user.username,
                reset_link=reset_url
            )
    except User.DoesNotExist:
        pass  # Don't reveal whether email exists

    return JsonResponse({'message': 'If that email exists, a reset link was sent.'})


@csrf_exempt
def api_password_reset_confirm(request):
    """Confirm password reset with token"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        data = json.loads(request.body)
        token_str = data.get('token', '').strip()
        new_password = data.get('password', '')
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    if not token_str or not new_password:
        return JsonResponse({'error': 'Token and password are required.'}, status=400)

    if len(new_password) < 6:
        return JsonResponse({'error': 'Password must be at least 6 characters.'}, status=400)

    try:
        token_obj = PasswordResetToken.objects.get(token=token_str)
    except PasswordResetToken.DoesNotExist:
        return JsonResponse({'error': 'Invalid or expired reset link.'}, status=400)

    if token_obj.is_expired():
        token_obj.delete()
        return JsonResponse({'error': 'Reset link has expired. Please request a new one.'}, status=400)

    user = token_obj.user
    user.set_password(new_password)
    user.save()
    token_obj.delete()  # One-time use

    return JsonResponse({'message': 'Password reset successful.'})