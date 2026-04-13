# Period Cycle Tracker - Django Application

A comprehensive Django web application for tracking menstrual cycles, monitoring symptoms, and predicting future periods.

## Features

✅ **Track Your Period**
- Log period start and end dates
- Record flow intensity (light, moderate, heavy)
- Add notes and observations

✅ **Monitor Symptoms**
- Log various symptoms (cramps, headache, bloating, etc.)
- Record severity levels (mild, moderate, severe)
- Track patterns over time

✅ **Predict Next Period**
- Automatic prediction based on your cycle history
- Customizable cycle length settings
- Upcoming period notifications (coming soon)

✅ **Cycle History**
- View all past periods and statistics
- Average cycle duration calculations
- Detailed cycle information

✅ **User Dashboard**
- Overview of current period status
- Quick access to common actions
- Cycle statistics and summary

✅ **Privacy First**
- Secure login system
- Personal data stored securely
- Only you can view your data

## Project Structure

```
period_tracker/
├── manage.py                      # Django management script
├── requirements.txt               # Python dependencies
├── db.sqlite3                     # Database (created after migration)
│
├── period_tracker/               # Main project directory
│   ├── __init__.py
│   ├── settings.py              # Django settings
│   ├── urls.py                  # Main URL configuration
│   ├── wsgi.py                  # WSGI configuration
│
├── tracker/                      # Django app
│   ├── models.py                # Database models
│   ├── views.py                 # View logic
│   ├── forms.py                 # Form definitions
│   ├── urls.py                  # App URL patterns
│   ├── admin.py                 # Django admin configuration
│   ├── apps.py
│   ├── __init__.py
│   │
│   ├── templates/
│   │   ├── base.html                      # Base template
│   │   ├── tracker/
│   │   │   ├── dashboard.html
│   │   │   ├── log_period.html
│   │   │   ├── period_detail.html
│   │   │   ├── edit_period.html
│   │   │   ├── delete_period.html
│   │   │   ├── cycle_history.html
│   │   │   └── settings.html
│   │   └── auth/
│   │       └── login.html
│   │
│   └── static/
│       └── css/                 # CSS files
│
└── templates/                   # Project-wide templates
```

## Installation & Setup

### 1. Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### 2. Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Database Setup

```bash
# Create database tables
python manage.py migrate

# Create a superuser for admin access
python manage.py createsuperuser
# Follow the prompts to set username, email, and password
```

### 5. Run Development Server

```bash
python manage.py runserver
```

The application will be available at: `http://127.0.0.1:8000/`

## Usage

### First-Time Setup
1. Access the admin panel: `http://127.0.0.1:8000/admin/`
2. Log in with your superuser credentials
3. Create user accounts as needed (Users section)

### For Users
1. Go to `http://127.0.0.1:8000/login/`
2. Log in with your credentials
3. Click "Log Period" to start tracking
4. Add symptoms as needed
5. Check "Settings" to customize your cycle information

## Models

### PeriodCycle
Stores information about each menstrual cycle.

**Fields:**
- `user` - ForeignKey to User
- `start_date` - DateField
- `end_date` - DateField (optional)
- `flow_intensity` - CharField (light, moderate, heavy)
- `notes` - TextField
- `created_at`, `updated_at` - Timestamps

### HealthSymptom
Tracks symptoms during a cycle.

**Fields:**
- `period` - ForeignKey to PeriodCycle
- `symptom_type` - CharField (cramps, headache, etc.)
- `severity` - CharField (mild, moderate, severe)
- `logged_date` - DateField
- `notes` - TextField

### CycleReminder
Stores user-specific cycle prediction settings.

**Fields:**
- `user` - OneToOneField to User
- `average_cycle_length` - IntegerField (default: 28 days)
- `average_period_length` - IntegerField (default: 5 days)
- `reminder_enabled` - BooleanField

## Django Admin

Access the Django admin at: `http://127.0.0.1:8000/admin/`

In the admin panel, you can:
- Manage users and their accounts
- View and edit all period cycles
- Manage health symptoms
- Configure cycle reminder settings

## Features in Development

🚀 **Coming Soon:**
- Email reminders for upcoming periods
- Dark mode theme
- Period prediction algorithm improvements
- Export data to CSV
- Mobile app
- Health insights and patterns

## Security Notes

⚠️ **Important for Production:**
1. Change `SECRET_KEY` in `settings.py`
2. Set `DEBUG = False`
3. Update `ALLOWED_HOSTS`
4. Use a production database (PostgreSQL recommended)
5. Use HTTPS
6. Set up proper authentication and permissions
7. Use environment variables for sensitive data

## Troubleshooting

### Database Issues
```bash
# Reset database (warning: deletes all data)
python manage.py flush
python manage.py migrate
```

### Static Files Not Loading
```bash
python manage.py collectstatic
```

### Create Superuser
```bash
python manage.py createsuperuser
```

## Support & Contributing

For issues or suggestions, please use the following:
- Check existing documentation
- Review model relationships
- Verify user permissions

## License

This project is created for personal health tracking purposes.

## Privacy Statement

Your period tracking data is:
- Private and secure
- Only accessible to you
- Never shared with third parties
- Stored locally on your server

---

**Remember:** This app is a personal tracking tool. If you have health concerns, always consult with a healthcare professional.
