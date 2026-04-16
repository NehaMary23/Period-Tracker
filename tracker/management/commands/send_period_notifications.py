from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.utils import timezone
from django.contrib.auth.models import User
from datetime import timedelta, date
from tracker.models import PeriodCycle, CycleReminder, NotificationLog


class Command(BaseCommand):
    help = 'Send email notifications for period reminders and late periods'

    def handle(self, *args, **options):
        today = date.today()
        self.stdout.write(f"Running period notifications for {today}")
        
        # Get all users with reminders enabled
        users = User.objects.filter(cycle_reminder__reminder_enabled=True)
        
        for user in users:
            try:
                self.process_user(user, today)
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error processing user {user.username}: {str(e)}"))

    def process_user(self, user, today):
        """Process notifications for a single user"""
        
        # Get user's cycle reminder settings
        try:
            reminder = user.cycle_reminder
        except:
            self.stdout.write(f"No reminder settings for {user.username}")
            return
        
        if not reminder.reminder_enabled:
            return
        
        # Get the most recent period
        last_period = PeriodCycle.objects.filter(user=user).order_by('-start_date').first()
        
        if not last_period:
            self.stdout.write(f"No periods logged for {user.username}")
            return
        
        # Calculate next period date
        cycle_length = reminder.average_cycle_length
        next_period_date = last_period.start_date + timedelta(days=cycle_length)
        
        # Check if a new period was logged (if so, reset notifications)
        days_since_last = (today - last_period.start_date).days
        
        # SCENARIO 1: 3 days before next period
        if today == next_period_date - timedelta(days=3):
            self.send_notification(
                user,
                'period_reminder_3days',
                next_period_date,
                subject="Period Prediction: Your period is expected in 3 days",
                message=f"Hi {user.first_name or user.username},\n\n"
                        f"Based on your cycle, your period is expected to start in 3 days on {next_period_date.strftime('%B %d, %Y')}.\n\n"
                        f"Stay prepared and take care of yourself!\n\n"
                        f"Best regards,\nPeriod Tracker Team"
            )
        
        # SCENARIO 2: On the day of next period
        elif today == next_period_date:
            self.send_notification(
                user,
                'period_reminder_today',
                next_period_date,
                subject="Period Expected Today",
                message=f"Hi {user.first_name or user.username},\n\n"
                        f"Your period is expected today ({next_period_date.strftime('%B %d, %Y')}).\n\n"
                        f"Please log your period when it starts. If it hasn't started yet, don't worry - it may come in a few days.\n\n"
                        f"Best regards,\nPeriod Tracker Team"
            )
        
        # SCENARIO 3: Late period (5 days overdue)
        elif today == next_period_date + timedelta(days=5):
            # Check if a new period was logged after the expected date
            new_period_after_expected = PeriodCycle.objects.filter(
                user=user,
                start_date__gte=next_period_date
            ).exists()
            
            if not new_period_after_expected:
                # Period is late and not logged
                self.send_notification(
                    user,
                    'period_late_alert',
                    next_period_date,
                    subject="Your Period is 5 Days Late - Please Log or Consult",
                    message=f"Hi {user.first_name or user.username},\n\n"
                            f"Your period was expected on {next_period_date.strftime('%B %d, %Y')}, "
                            f"but it is now 5 days late.\n\n"
                            f"Please:\n"
                            f"1. Log your period if it has started\n"
                            f"2. Take a pregnancy test if applicable\n"
                            f"3. Consult a healthcare provider if you have any concerns\n\n"
                            f"If your period does come, please log it in your Period Tracker app.\n\n"
                            f"Best regards,\nPeriod Tracker Team"
                )

    def send_notification(self, user, notification_type, predicted_date, subject, message):
        """Send email notification and log it"""
        
        # Check if we already sent this notification today
        today = date.today()
        
        # Look for recent notifications of this type for this predicted date
        existing = NotificationLog.objects.filter(
            user=user,
            notification_type=notification_type,
            predicted_date=predicted_date,
            sent_date__date=today
        ).exists()
        
        if existing:
            self.stdout.write(f"Notification already sent to {user.email} for {notification_type}")
            return
        
        # Send email
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email='noreply@periodtracker.com',
                recipient_list=[user.email],
                fail_silently=False,
            )
            
            # Log successful notification
            NotificationLog.objects.create(
                user=user,
                notification_type=notification_type,
                predicted_date=predicted_date,
                recipient_email=user.email,
                subject=subject,
                message=message,
                success=True
            )
            
            self.stdout.write(
                self.style.SUCCESS(
                    f"✓ Sent {notification_type} to {user.email}"
                )
            )
        
        except Exception as e:
            # Log failed notification
            NotificationLog.objects.create(
                user=user,
                notification_type=notification_type,
                predicted_date=predicted_date,
                recipient_email=user.email,
                subject=subject,
                message=message,
                success=False,
                error_message=str(e)
            )
            
            self.stdout.write(
                self.style.ERROR(
                    f"✗ Failed to send {notification_type} to {user.email}: {str(e)}"
                )
            )
