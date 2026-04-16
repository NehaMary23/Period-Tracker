from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.utils import timezone
from django.contrib.auth.models import User
from datetime import timedelta
from tracker.models import PeriodCycle, CycleReminder, NotificationLog


class Command(BaseCommand):
    help = 'Check for upcoming periods and send email notifications'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days-before',
            type=int,
            default=3,
            help='Number of days before period to send notification (default: 3)',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be sent without actually sending',
        )

    def handle(self, *args, **options):
        days_before = options['days_before']
        dry_run = options['dry_run']

        self.stdout.write(
            self.style.SUCCESS(
                f'Checking for periods in {days_before} days...'
            )
        )

        for user in User.objects.all():
            try:
                # Get user's cycle reminder settings
                reminder = user.cycle_reminder
                if not reminder.reminder_enabled:
                    self.stdout.write(
                        self.style.WARNING(
                            f'  Notifications disabled for {user.username}'
                        )
                    )
                    continue

                # Get user's last period
                last_period = PeriodCycle.objects.filter(user=user).order_by(
                    '-end_date'
                ).first()

                if not last_period or not last_period.end_date:
                    self.stdout.write(
                        self.style.WARNING(
                            f'  No period history for {user.username}'
                        )
                    )
                    continue

                # Calculate next predicted period
                predicted_date = last_period.end_date + timedelta(
                    days=reminder.average_cycle_length
                )

                # Check if notification should be sent today
                days_until_period = (predicted_date - timezone.now().date()).days

                if days_until_period == days_before:
                    self.send_notification(user, predicted_date, dry_run)
                elif days_until_period < days_before and days_until_period >= 0:
                    # Check if we already sent a notification for this date
                    existing = NotificationLog.objects.filter(
                        user=user,
                        notification_type='period_reminder',
                        predicted_date=predicted_date,
                    ).exists()

                    if not existing:
                        self.send_notification(user, predicted_date, dry_run)

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f'Error processing {user.username}: {str(e)}'
                    )
                )

    def send_notification(self, user, predicted_date, dry_run):
        """Send period reminder notification to user"""
        subject = 'Period Reminder: Your period is coming soon'
        message = f'''Hi {user.first_name or user.username},

Your period is predicted to start on {predicted_date.strftime('%B %d, %Y')}.

Make sure to:
- Stock up on period supplies
- Track your symptoms
- Take care of yourself

You can update your settings anytime at: http://localhost:3000/settings

Best,
Period Tracker Team
'''

        try:
            if dry_run:
                self.stdout.write(
                    self.style.SUCCESS(f'\n[DRY RUN] Would send to {user.email}:')
                )
                self.stdout.write(f'Subject: {subject}')
                self.stdout.write(f'Message:\n{message}')
            else:
                # Send email
                send_mail(
                    subject,
                    message,
                    'noreply@periodtracker.com',
                    [user.email],
                    fail_silently=False,
                )

                # Log the notification
                NotificationLog.objects.create(
                    user=user,
                    notification_type='period_reminder',
                    predicted_date=predicted_date,
                    recipient_email=user.email,
                    subject=subject,
                    message=message,
                    success=True,
                )

                self.stdout.write(
                    self.style.SUCCESS(
                        f'✓ Notification sent to {user.username} ({user.email})'
                    )
                )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'✗ Failed to send to {user.username}: {str(e)}')
            )

            # Log the failed notification
            NotificationLog.objects.create(
                user=user,
                notification_type='period_reminder',
                predicted_date=predicted_date,
                recipient_email=user.email,
                subject=subject,
                message=message,
                success=False,
                error_message=str(e),
            )
