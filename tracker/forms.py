from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from .models import PeriodCycle, HealthSymptom, CycleReminder

class PeriodCycleForm(forms.ModelForm):
    """Form for logging a new period cycle"""
    start_date = forms.DateField(
        widget=forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
        label="Period Start Date"
    )
    end_date = forms.DateField(
        required=False,
        widget=forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
        label="Period End Date (Optional)"
    )
    
    class Meta:
        model = PeriodCycle
        fields = ['start_date', 'end_date', 'flow_intensity', 'notes']
        widgets = {
            'flow_intensity': forms.Select(attrs={'class': 'form-control'}),
            'notes': forms.Textarea(attrs={'class': 'form-control', 'rows': 4}),
        }
        labels = {
            'flow_intensity': 'Flow Intensity',
            'notes': 'Notes (Optional)',
        }


class HealthSymptomForm(forms.ModelForm):
    """Form for logging symptoms"""
    class Meta:
        model = HealthSymptom
        fields = ['symptom_type', 'severity', 'notes']
        widgets = {
            'symptom_type': forms.Select(attrs={'class': 'form-control'}),
            'severity': forms.Select(attrs={'class': 'form-control'}),
            'notes': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }
        labels = {
            'symptom_type': 'Select Symptom',
            'severity': 'Severity Level',
            'notes': 'Additional Notes (Optional)',
        }


class CycleReminderForm(forms.ModelForm):
    """Form for cycle reminder settings"""
    class Meta:
        model = CycleReminder
        fields = ['average_cycle_length', 'average_period_length', 'reminder_enabled']
        widgets = {
            'average_cycle_length': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '15',
                'max': '50',
            }),
            'average_period_length': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '2',
                'max': '10',
            }),
            'reminder_enabled': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }
        labels = {
            'average_cycle_length': 'Average Cycle Length (days)',
            'average_period_length': 'Average Period Length (days)',
            'reminder_enabled': 'Enable Reminders',
        }


class SignUpForm(UserCreationForm):
    """Form for user registration/signup"""
    email = forms.EmailField(
        max_length=254,
        required=True,
        widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Email address'})
    )
    username = forms.CharField(
        max_length=150,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Username'})
    )

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].widget.attrs.update({'class': 'form-control', 'placeholder': 'Username'})
        self.fields['email'].widget.attrs.update({'class': 'form-control', 'placeholder': 'Email address'})
        self.fields['password1'].widget = forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Password'
        })
        self.fields['password2'].widget = forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Confirm Password'
        })
        self.fields['password1'].help_text = 'Password must contain at least 8 characters'
        self.fields['password2'].help_text = 'Re-enter your password for confirmation'

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError('This email is already registered.')
        return email
