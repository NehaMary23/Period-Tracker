from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

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
