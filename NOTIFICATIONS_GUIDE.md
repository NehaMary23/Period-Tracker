# Period Notification System - Quick Reference

## 🎯 What Was Implemented

Your Period Tracker now automatically sends email notifications:

### **Notification Triggers**

| Event              | When                                         | Message                                               |
| ------------------ | -------------------------------------------- | ----------------------------------------------------- |
| **3-Day Reminder** | 3 days before expected period                | "Period expected in 3 days - stay prepared!"          |
| **Period Due**     | On the day of expected period                | "Period expected today - please log it!"              |
| **Late Alert**     | 5 days after expected period (if not logged) | "Period is 5 days late - consult healthcare provider" |

---

## 🚀 How to Use

### **Option 1: Automatic Daily Execution** (Recommended for Production)

#### Windows Task Scheduler

1. Create file: `C:\run_notifications.bat`

```batch
@echo off
cd C:\Neha\Projects\React_Projects\period_tracker
python manage.py send_period_notifications
```

2. Open Task Scheduler → New Task
   - Name: "Period Tracker Notifications"
   - Trigger: Daily at 7:00 AM
   - Action: Run `run_notifications.bat`

#### Linux/Mac Crontab

```bash
# Run every day at 7 AM
0 7 * * * cd /path/to/period_tracker && python manage.py send_period_notifications
```

### **Option 2: Manual Testing**

```bash
# Run once to check for notifications
python manage.py send_period_notifications

# Run the test script
python test_notifications.py

# Run with custom period date
python test_notifications.py custom
```

### **Option 3: API Endpoint** (For Testing)

```bash
# Test notification system via API
POST http://localhost:8000/tracker/notifications/test/
Headers: Authorization: Bearer YOUR_TOKEN
```

Response:

```json
{
  "success": true,
  "message": "Notification system test executed",
  "user": "testuser",
  "recent_notifications": [
    {
      "type": "period_reminder_3days",
      "date": "15/4/2026 17:15:29",
      "success": true,
      "subject": "Period Prediction: Your period is expected in 3 days",
      "email": "test@example.com"
    }
  ]
}
```

---

## 📧 Email Configuration

### **Development (Current)**

Emails print to console - great for testing!

### **Production Email Setup**

Edit `period_tracker/settings.py`:

```python
# Gmail Example
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-specific-password'  # NOT regular password!
DEFAULT_FROM_EMAIL = 'noreply@yourapp.com'
```

#### Gmail App Password Setup:

1. Enable 2-Factor Authentication on Google Account
2. Go to: https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer"
4. Copy the 16-character password
5. Use in `EMAIL_HOST_PASSWORD` above

---

## 📊 Monitor Notifications

### **Django Admin**

```
http://127.0.0.1:8000/admin/tracker/notificationlog/
```

View all sent/failed notifications with details:

- When sent
- Success/failure status
- Error messages
- Email content

### **Database Query**

```bash
python manage.py shell
```

```python
from tracker.models import NotificationLog
from django.contrib.auth.models import User

user = User.objects.get(username='testuser')
logs = NotificationLog.objects.filter(user=user).order_by('-sent_date')

for log in logs[:5]:
    print(f"{log.notification_type}: {log.subject}")
    print(f"  Sent: {log.sent_date}")
    print(f"  Success: {log.success}\n")
```

---

## 🧪 Test Scenarios

### **Scenario 1: Test 3-Day Reminder**

```bash
python test_notifications.py
# Automatically creates test period 25 days ago (next period in 3 days)
```

### **Scenario 2: Test Period Due Today**

```bash
python test_notifications.py custom
# Choose: 28 days (creates period 28 days ago, due today)
```

### **Scenario 3: Test Late Period Alert**

```bash
python test_notifications.py custom
# Choose: 33 days (creates period 33 days ago, 5 days late)
```

---

## ⚙️ Files Created/Modified

### **New Files**

- `tracker/management/commands/send_period_notifications.py` - Main notification system
- `test_notifications.py` - Testing script
- `NOTIFICATIONS_SETUP.md` - Detailed setup guide

### **Modified Files**

- `tracker/models.py` - Added new notification types to NotificationLog
- `tracker/views.py` - Added API endpoint for testing
- `tracker/urls.py` - Registered test endpoint
- `tracker/migrations/0004_*` - Database migration for notification types

---

## 🔍 Troubleshooting

### **Emails not sending?**

1. Check Django console output for email content (in development)
2. Verify user email addresses in database
3. For production, test with:
   ```python
   from django.core.mail import send_mail
   send_mail('Test', 'Body', 'from@example.com', ['to@example.com'])
   ```

### **Notifications not showing?**

1. Check if user has `cycle_reminder.reminder_enabled = True`
2. Check if user has logged a period (required to calculate next period)
3. Run test script: `python test_notifications.py`
4. Check database logs: `http://127.0.0.1:8000/admin/tracker/notificationlog/`

### **Want to modify messages?**

Edit the email messages in:
`send_period_notifications.py` → Look for `send_notification()` method calls

---

## 📋 Summary

✅ **System Status**: Active and tested  
✅ **Email Backend**: Console (dev), SMTP ready (production)  
✅ **Notifications**: 3-day, same-day, and 5-day late alerts  
✅ **Logging**: Complete audit trail in database  
✅ **API**: Test endpoint available at `/tracker/notifications/test/`

**Next Step**: Set up daily scheduling (Windows Task Scheduler or cron) for automated reminders!

---

## 🧪 Recently Tested

✓ 3-day reminder successfully sent to test@example.com  
✓ Notifications logged in database  
✓ Email formatting verified  
✓ Management command working properly

This will send actual email notifications.

### Step 4: Check the Output

When you run the command, you'll see output like:

```
Checking for periods in 3 days...
✓ Notification sent to username (user@example.com)
```

### Step 5: View Sent Notifications (Django Admin)

1. Go to `http://localhost:8000/admin/`
2. Login with admin credentials
3. Navigate to **Notification Logs**
4. You'll see all sent notifications with:
   - User name
   - Notification type
   - Predicted date
   - Sent date
   - Success status
   - Email address
   - Full email content

## Email Backend Configuration

### Development (Default - Console Output)

By default, emails are printed to the Django console instead of actually sending emails. This is configured in `settings.py`:

```python
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```

Check your Django server terminal to see email content being printed.

### Production (Real Email Sending)

To send actual emails in production, configure SMTP in `settings.py`:

```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'  # or your email provider
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'
DEFAULT_FROM_EMAIL = 'your-email@gmail.com'
```

For Gmail: [Generate App Password](https://support.google.com/accounts/answer/185833)

## Command Options

### Send reminder for a specific number of days before period

```bash
python manage.py check_period_notifications --days-before=5
```

This will send notifications 5 days before the predicted period (instead of default 3).

### Test run with detailed output

```bash
python manage.py check_period_notifications --dry-run -v 2
```

## Testing Workflow

### Complete Test:

1. **Log a period** in the app (or use Django admin to add one)
2. **Calculate the predicted date**: last_period_end_date + cycle_length
3. **Run command with --dry-run**: See what would happen
4. **Check admin**: View notification logs
5. **Run actual command**: Send real notifications

### Example Test Dates:

If today is **15/4/2026**:

- Last period ended: **5/4/2026**
- Cycle length: **28 days**
- Next period predicted: **3/5/2026** (5/4/2026 + 28 days)
- Notification sends: **30/4/2026** (3 days before 3/5/2026)

## Automation in Production

For production, you'd typically use:

1. **Django-APScheduler** - Schedule the command to run daily
2. **Celery + Beat** - More robust task scheduling
3. **Cron Job** - Simple Linux/Mac/Docker scheduling
4. **Windows Task Scheduler** - For Windows servers

### Simple Cron Example (Linux/Mac):

```bash
# Run notification check daily at 8 AM
0 8 * * * cd /path/to/period_tracker && python manage.py check_period_notifications
```

## Troubleshooting

### Notifications not sending?

1. Check **notifications are enabled** in Settings (toggle should be pink/ON)
2. Verify **period data exists** - run: `python manage.py shell`
   ```python
   from tracker.models import PeriodCycle
   PeriodCycle.objects.all()  # Should show periods
   ```
3. Check **email configuration** in Django admin
4. Run command with **--dry-run** to see what's happening

### No email history?

- Check the **NotificationLog** in Django admin
- Search by user or date
- See if notifications were marked as successful

### Email not arriving?

1. Check **spam folder**
2. Verify **email address is correct** in user profile
3. For Gmail: Allow "Less secure apps" or use [App Password](https://support.google.com/accounts/answer/185833)
4. Check **mail server logs** for delivery errors

## Useful Django Commands

```bash
# View all periods
python manage.py shell
>>> from tracker.models import PeriodCycle
>>> from django.contrib.auth.models import User
>>> user = User.objects.first()
>>> user.period_cycles.all()

# View notification logs
>>> from tracker.models import NotificationLog
>>> NotificationLog.objects.all()

# Check user's cycle settings
>>> user.cycle_reminder.average_cycle_length
>>> user.cycle_reminder.reminder_enabled
```

## Next Steps

- [ ] Set up email service (Gmail, SendGrid, etc.)
- [ ] Configure SMTP credentials
- [ ] Set up automated daily schedule (Celery/APScheduler)
- [ ] Test with real period data
- [ ] Monitor notification logs in admin

Happy tracking! 🎉
