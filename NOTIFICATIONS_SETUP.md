# Period Notification System Setup

## Overview

The Period Tracker now includes an automated email notification system that sends reminders to users about their upcoming periods and alerts them if their period is late.

## Notification Types

### 1. **3 Days Before Period**

- **When**: Sent 3 days before the expected period date
- **Message**: Reminds user that their period is expected in 3 days
- **Purpose**: Helps users prepare for their period

### 2. **Period Due Today**

- **When**: Sent on the day the period is expected
- **Message**: Notifies user that their period is expected today
- **Purpose**: Encourages user to log their period when it starts

### 3. **Late Period Alert**

- **When**: Sent 5 days after the expected period date (if no new period has been logged)
- **Message**: Alerts user that their period is 5 days late and provides guidance
- **Purpose**: Encourages user to log their period or seek medical advice

## Setup Instructions

### Step 1: Create Database Migration

After pulling the code changes, run migrations to update the NotificationLog model:

```bash
python manage.py makemigrations
python manage.py migrate
```

### Step 2: Testing Notifications

To manually test the notification system, run:

```bash
python manage.py send_period_notifications
```

This will:

- Check all users with reminders enabled
- Determine if any notifications should be sent today
- Send emails if conditions are met
- Log all notification attempts

### Step 3: Production Email Configuration

For development, emails are printed to the console. For production, update `period_tracker/settings.py`:

```python
# Use Gmail or your preferred email service
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'  # Use app-specific password for Gmail
DEFAULT_FROM_EMAIL = 'noreply@periodtracker.com'
```

### Step 4: Schedule Automated Notifications (Optional)

To run notifications automatically every day, use a task scheduler:

#### Option A: Using Celery (Recommended for production)

```python
# tasks.py
from celery import shared_task
from tracker.management.commands.send_period_notifications import Command

@shared_task
def send_period_notifications():
    command = Command()
    command.handle()
```

#### Option B: Using Crontab (Linux/Mac)

```bash
# Add to crontab (crontab -e)
0 7 * * * cd /path/to/period_tracker && python manage.py send_period_notifications
```

This runs every day at 7 AM.

#### Option C: Using Windows Task Scheduler

1. Create a batch file: `run_notifications.bat`

   ```batch
   @echo off
   cd C:\path\to\period_tracker
   python manage.py send_period_notifications
   ```

2. Create a scheduled task to run this batch file daily

### Step 5: Monitor Notifications

View notification logs in Django Admin:

```
Admin > Tracker > Notification Logs
```

This shows:

- When emails were sent
- Whether they succeeded or failed
- Any error messages for failed attempts
- Which notification type was sent

## User Settings

Users can enable/disable reminders through:

- Django Admin > Cycle Reminder Settings
- Future: User dashboard settings page (to be implemented)

## Email Template Examples

The notification templates can be customized in the `send_period_notifications.py` file. Current templates include:

- **3-Day Reminder**: Encourages preparation
- **Day-Of Reminder**: Requests logging
- **Late Period Alert**: Provides medical guidance

## Troubleshooting

### Emails not sending?

1. Check `EMAIL_BACKEND` in settings.py
2. Verify user email addresses are correct in database
3. Check notification logs for errors
4. For Gmail: Use app-specific password, not regular password
5. Check console output for error messages

### Want to test with dummy data?

Run Django shell:

```bash
python manage.py shell
```

```python
from django.contrib.auth.models import User
from tracker.models import CycleReminder, PeriodCycle
from datetime import date, timedelta

user = User.objects.first()
reminder = CycleReminder.objects.get_or_create(user=user)[0]
reminder.reminder_enabled = True
reminder.save()

# Add a test period
period = PeriodCycle.objects.create(
    user=user,
    start_date=date.today() - timedelta(days=25),
    flow_intensity='moderate'
)
```

Then run the management command to test notifications.

## Notes

- Notification times are based on UTC timezone (can be customized in settings)
- Duplicate notifications are prevented by checking recent logs
- All notifications are logged for audit trail
- System gracefully handles missing or invalid user data
