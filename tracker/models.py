from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
import secrets


class UserToken(models.Model):
    """Model to store user authentication tokens"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='auth_token')
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "User Token"
        verbose_name_plural = "User Tokens"
    
    def __str__(self):
        return f"Token for {self.user.username}"
    
    @classmethod
    def generate_token(cls, user):
        """Generate and store a new token for user"""
        token_str = secrets.token_hex(32)
        cls.objects.filter(user=user).delete()  # Remove old token
        token_obj = cls.objects.create(user=user, token=token_str)
        return token_str
    
    @classmethod
    def validate_token(cls, token_str):
        """Validate token and return user if valid"""
        try:
            token_obj = cls.objects.get(token=token_str)
            return token_obj.user
        except cls.DoesNotExist:
            return None

class PeriodCycle(models.Model):
    """Model to track period cycles"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='period_cycles')
    start_date = models.DateField(help_text="First day of period")
    end_date = models.DateField(null=True, blank=True, help_text="Last day of period")
    flow_intensity = models.CharField(
        max_length=10,
        choices=[
            ('light', 'Light'),
            ('moderate', 'Moderate'),
            ('heavy', 'Heavy'),
        ],
        default='moderate',
        help_text="Intensity of menstrual flow"
    )
    notes = models.TextField(blank=True, help_text="Additional notes about this cycle")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date']
        verbose_name = "Period Cycle"
        verbose_name_plural = "Period Cycles"

    def __str__(self):
        return f"Period: {self.start_date} - {self.end_date or 'Ongoing'}"

    def get_duration(self):
        """Calculate cycle duration in days"""
        if self.end_date:
            return (self.end_date - self.start_date).days + 1
        else:
            return (timezone.now().date() - self.start_date).days + 1


class HealthSymptom(models.Model):
    """Model to track symptoms during cycle"""
    SYMPTOM_CHOICES = [
        ('cramps', 'Cramps'),
        ('headache', 'Headache'),
        ('bloating', 'Bloating'),
        ('fatigue', 'Fatigue'),
        ('mood_swings', 'Mood Swings'),
        ('breast_tenderness', 'Breast Tenderness'),
        ('acne', 'Acne'),
        ('nausea', 'Nausea'),
        ('back_pain', 'Back Pain'),
        ('other', 'Other'),
    ]

    SEVERITY_CHOICES = [
        ('mild', 'Mild'),
        ('moderate', 'Moderate'),
        ('severe', 'Severe'),
    ]

    period = models.ForeignKey(PeriodCycle, on_delete=models.CASCADE, related_name='symptoms')
    symptom_type = models.CharField(max_length=20, choices=SYMPTOM_CHOICES)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='mild')
    logged_date = models.DateField(auto_now_add=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['logged_date']
        verbose_name = "Health Symptom"
        verbose_name_plural = "Health Symptoms"

    def __str__(self):
        return f"{self.get_symptom_type_display()} - {self.severity}"


class CycleReminder(models.Model):
    """Model for period reminders"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cycle_reminder')
    average_cycle_length = models.IntegerField(default=28, help_text="Average cycle length in days")
    average_period_length = models.IntegerField(default=5, help_text="Average period duration in days")
    reminder_enabled = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Cycle Reminder"
        verbose_name_plural = "Cycle Reminders"

    def __str__(self):
        return f"Reminder Settings for {self.user.username}"


class NotificationLog(models.Model):
    """Model to track sent notifications"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notification_logs')
    notification_type = models.CharField(
        max_length=30,
        choices=[
            ('period_reminder_3days', 'Period Reminder - 3 Days Before'),
            ('period_reminder_today', 'Period Reminder - Today'),
            ('period_late_alert', 'Late Period Alert'),
            ('symptom_reminder', 'Symptom Reminder'),
            ('cycle_prediction', 'Cycle Prediction'),
        ],
        default='period_reminder_3days'
    )
    predicted_date = models.DateField(help_text="The predicted period date")
    sent_date = models.DateTimeField(auto_now_add=True)
    recipient_email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    success = models.BooleanField(default=True)
    error_message = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-sent_date']
        verbose_name = "Notification Log"
        verbose_name_plural = "Notification Logs"

    def __str__(self):
        return f"{self.notification_type} for {self.user.username} on {self.sent_date.date()}"

class PasswordResetToken(models.Model):
    """Model to store password reset tokens"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Password Reset Token"
        verbose_name_plural = "Password Reset Tokens"

    def __str__(self):
        return f"Reset token for {self.user.username}"

    def is_expired(self):
        return timezone.now() > self.created_at + timezone.timedelta(hours=1)

    @classmethod
    def generate_token(cls, user):
        """Delete old tokens and create a new one"""
        cls.objects.filter(user=user).delete()
        token_str = secrets.token_hex(32)
        cls.objects.create(user=user, token=token_str)
        return token_str


class GoogleCalendarToken(models.Model):
    """Model to store Google Calendar OAuth tokens"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='google_calendar_token')
    access_token = models.TextField(help_text="Google OAuth access token")
    refresh_token = models.TextField(help_text="Google OAuth refresh token")
    token_expiry = models.DateTimeField(help_text="Token expiration datetime")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Google Calendar Token"
        verbose_name_plural = "Google Calendar Tokens"

    def __str__(self):
        return f"Google Calendar Token for {self.user.username}"

    def is_expired(self):
        """Check if token is expired"""
        return timezone.now() > self.token_expiry


class GoogleCalendarReminder(models.Model):
    """Model to track Google Calendar event reminders for periods"""
    period = models.OneToOneField(PeriodCycle, on_delete=models.CASCADE, related_name='google_reminder')
    calendar_event_id = models.CharField(max_length=255, help_text="Google Calendar event ID")
    reminder_date = models.DateField(help_text="Date of the reminder (1 day before period start)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Google Calendar Reminder"
        verbose_name_plural = "Google Calendar Reminders"

    def __str__(self):
        return f"Reminder for {self.period.user.username} on {self.reminder_date}"