#!/usr/bin/env python
"""
Test script to verify the Period Notification System is working correctly
Run this script to test all aspects of the notification system
"""

import os
import django
import sys
from datetime import date, timedelta

# Setup Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'period_tracker.settings')
django.setup()

from django.contrib.auth.models import User
from tracker.models import PeriodCycle, CycleReminder, NotificationLog
from tracker.management.commands.send_period_notifications import Command


def create_test_user():
    """Create a test user if it doesn't exist"""
    user, created = User.objects.get_or_create(
        username='testuser',
        defaults={
            'email': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'User',
        }
    )
    return user


def setup_cycle_reminder(user):
    """Ensure user has cycle reminder settings"""
    reminder, created = CycleReminder.objects.get_or_create(
        user=user,
        defaults={
            'average_cycle_length': 28,
            'average_period_length': 5,
            'reminder_enabled': True,
        }
    )
    return reminder


def create_test_period(user, days_ago=25):
    """Create a test period for testing notifications"""
    period, created = PeriodCycle.objects.get_or_create(
        user=user,
        start_date=date.today() - timedelta(days=days_ago),
        defaults={
            'flow_intensity': 'moderate',
            'notes': 'Test period for notification system',
        }
    )
    return period


def run_notification_test():
    """Run the notification system test"""
    
    print("\n" + "="*60)
    print("PERIOD NOTIFICATION SYSTEM TEST")
    print("="*60 + "\n")
    
    # Step 1: Create test user
    print("[1/5] Creating test user...")
    user = create_test_user()
    print(f"✓ Test user: {user.username} ({user.email})")
    
    # Step 2: Setup cycle reminder
    print("\n[2/5] Setting up cycle reminder...")
    reminder = setup_cycle_reminder(user)
    print(f"✓ Reminders enabled: {reminder.reminder_enabled}")
    print(f"✓ Average cycle length: {reminder.average_cycle_length} days")
    print(f"✓ Average period length: {reminder.average_period_length} days")
    
    # Step 3: Create test period
    print("\n[3/5] Creating test period...")
    period = create_test_period(user, days_ago=25)
    next_period_date = period.start_date + timedelta(days=28)
    print(f"✓ Last period started: {period.start_date}")
    print(f"✓ Expected next period: {next_period_date}")
    print(f"✓ Days until next period: {(next_period_date - date.today()).days} days")
    
    # Step 4: Run notification command
    print("\n[4/5] Running notification system...")
    command = Command()
    try:
        command.process_user(user, date.today())
        print("✓ Notification processing completed")
    except Exception as e:
        print(f"✗ Error processing notifications: {str(e)}")
        return False
    
    # Step 5: Check notification logs
    print("\n[5/5] Checking notification logs...")
    logs = NotificationLog.objects.filter(user=user).order_by('-sent_date')[:10]
    
    if logs.count() > 0:
        print(f"✓ Found {logs.count()} notification log(s):\n")
        for log in logs:
            status = "✓ SUCCESS" if log.success else "✗ FAILED"
            print(f"  {status} | {log.notification_type}")
            print(f"       Date: {log.sent_date.strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"       To: {log.recipient_email}")
            print(f"       Subject: {log.subject}")
            if not log.success:
                print(f"       Error: {log.error_message}")
            print()
    else:
        print("ℹ No notifications sent today (this is normal if no conditions are met)")
        print("\nNotification Schedule for this user:")
        print(f"  - 3 days before: {next_period_date - timedelta(days=3)}")
        print(f"  - On period day: {next_period_date}")
        print(f"  - Late alert (5 days): {next_period_date + timedelta(days=5)}")
    
    print("\n" + "="*60)
    print("TEST COMPLETE")
    print("="*60 + "\n")
    
    print("Next Steps:")
    print("1. Run this test daily to verify notifications are sent at the right times")
    print("2. Check Django admin: http://127.0.0.1:8000/admin/tracker/notificationlog/")
    print("3. Run scheduled command: python manage.py send_period_notifications")
    print("4. For production, set up a cron job or task scheduler")
    
    return True


def test_with_custom_period_date():
    """Allow testing with a custom period date"""
    
    user = create_test_user()
    reminder = setup_cycle_reminder(user)
    
    print("\n" + "="*60)
    print("CUSTOM TEST SETUP")
    print("="*60 + "\n")
    
    print("This allows you to set a specific period date for testing\n")
    
    # Option to set custom date
    days_input = input("How many days ago was the last period? (default: 25): ").strip()
    
    try:
        days_ago = int(days_input) if days_input else 25
    except ValueError:
        days_ago = 25
    
    period = create_test_period(user, days_ago=days_ago)
    next_period_date = period.start_date + timedelta(days=28)
    
    print(f"\n✓ Period set for: {period.start_date}")
    print(f"✓ Next period expected: {next_period_date}")
    print(f"✓ Days from today: {(next_period_date - date.today()).days}")
    
    command = Command()
    command.process_user(user, date.today())
    
    logs = NotificationLog.objects.filter(user=user).order_by('-sent_date')[:5]
    if logs:
        print(f"\n✓ {logs.count()} notification(s) processed")
        for log in logs:
            print(f"  - {log.notification_type}: {log.subject}")


if __name__ == '__main__':
    
    if len(sys.argv) > 1 and sys.argv[1] == 'custom':
        test_with_custom_period_date()
    else:
        run_notification_test()
