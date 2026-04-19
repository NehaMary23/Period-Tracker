"""
Google Calendar integration for period reminders
"""
import os
import requests
from datetime import datetime, timedelta
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from django.conf import settings
from django.utils import timezone
from .models import GoogleCalendarToken, GoogleCalendarReminder


# Google Calendar API scopes
SCOPES = ['https://www.googleapis.com/auth/calendar']

# Get client ID and secret from environment or settings
CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', getattr(settings, 'GOOGLE_CLIENT_ID', ''))
CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', getattr(settings, 'GOOGLE_CLIENT_SECRET', ''))
REDIRECT_URI = os.environ.get('GOOGLE_REDIRECT_URI', getattr(settings, 'GOOGLE_REDIRECT_URI', 'http://localhost:3000/settings'))


def get_google_oauth_flow():
    """Create and return Google OAuth flow"""
    client_config = {
        "installed": {
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "redirect_uris": [REDIRECT_URI],
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
        }
    }
    
    flow = Flow.from_client_config(
        client_config,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI,
        code_challenge_method=None  # Disable PKCE for server-to-server exchange
    )
    return flow


def get_authorization_url():
    """Get the Google OAuth authorization URL"""
    try:
        # Build authorization URL directly
        auth_uri = "https://accounts.google.com/o/oauth2/auth"
        
        params = {
            'client_id': CLIENT_ID,
            'redirect_uri': REDIRECT_URI,
            'response_type': 'code',
            'scope': ' '.join(SCOPES),
            'access_type': 'offline',
            'prompt': 'consent',
            'include_granted_scopes': 'true',
        }
        
        from urllib.parse import urlencode
        auth_url = f"{auth_uri}?{urlencode(params)}"
        
        import uuid
        state = str(uuid.uuid4())
        
        return auth_url, state
    except Exception as e:
        print(f"DEBUG: Error getting auth URL: {str(e)}")
        raise Exception(f"Failed to get authorization URL: {str(e)}")


def exchange_code_for_tokens(code):
    """Exchange authorization code for access and refresh tokens"""
    try:
        # Exchange code for tokens using Google's token endpoint
        token_url = "https://oauth2.googleapis.com/token"
        
        data = {
            'code': code,
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
            'redirect_uri': REDIRECT_URI,
            'grant_type': 'authorization_code',
        }
        
        print(f"DEBUG: Exchanging code with:")
        print(f"  client_id: {CLIENT_ID}")
        print(f"  redirect_uri: {REDIRECT_URI}")
        print(f"  code: {code[:20]}...")  # Only print first 20 chars of code
        
        response = requests.post(token_url, data=data)
        
        print(f"DEBUG: Google response status: {response.status_code}")
        print(f"DEBUG: Google response: {response.text}")
        
        response.raise_for_status()  # Raise exception for bad status codes
        
        token_response = response.json()
        
        # Parse expiry time if provided
        expiry = None
        if 'expires_in' in token_response:
            expiry = datetime.utcnow() + timedelta(seconds=token_response['expires_in'])
        
        return {
            'access_token': token_response.get('access_token'),
            'refresh_token': token_response.get('refresh_token'),
            'expiry': expiry,
        }
    except Exception as e:
        raise Exception(f"Failed to exchange code for tokens: {str(e)}")


def refresh_access_token(user):
    """Refresh Google access token if expired"""
    try:
        google_token = GoogleCalendarToken.objects.get(user=user)
        
        if google_token.is_expired():
            # Create credentials object
            credentials = Credentials(
                token=google_token.access_token,
                refresh_token=google_token.refresh_token,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=CLIENT_ID,
                client_secret=CLIENT_SECRET,
            )
            
            # Refresh the token
            request = Request()
            credentials.refresh(request)
            
            # Update database with new tokens
            google_token.access_token = credentials.token
            google_token.token_expiry = credentials.expiry
            google_token.save()
        
        return google_token.access_token
    except GoogleCalendarToken.DoesNotExist:
        return None
    except Exception as e:
        raise Exception(f"Failed to refresh token: {str(e)}")


def get_calendar_service(user):
    """Get Google Calendar API service for user"""
    try:
        google_token = GoogleCalendarToken.objects.get(user=user)
        access_token = refresh_access_token(user)
        
        if not access_token:
            return None
        
        credentials = Credentials(
            token=access_token,
            refresh_token=google_token.refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=CLIENT_ID,
            client_secret=CLIENT_SECRET,
        )
        
        service = build('calendar', 'v3', credentials=credentials)
        return service
    except GoogleCalendarToken.DoesNotExist:
        return None
    except Exception as e:
        raise Exception(f"Failed to get calendar service: {str(e)}")


def create_period_reminder_event(user, period, reminder_date):
    """Create a Google Calendar event for period reminder (1 day before period starts)"""
    try:
        print(f"DEBUG: Getting calendar service for user {user.username}")
        service = get_calendar_service(user)
        
        if not service:
            print(f"DEBUG: No calendar service available for user {user.username} - user likely not connected")
            return None
        
        print(f"DEBUG: Calendar service obtained, creating event")
        
        # Prepare event details
        event_summary = "Period Reminder"
        
        # Handle both string and date object for start_date
        if isinstance(period.start_date, str):
            start_date_str = period.start_date
        else:
            start_date_str = period.start_date.strftime('%B %d, %Y')
        
        event_description = f"Your period is expected to start tomorrow ({start_date_str})"
        
        # Create event for the reminder date (1 day before period)
        event = {
            'summary': event_summary,
            'description': event_description,
            'start': {
                'date': reminder_date.isoformat(),
                'timeZone': 'UTC',
            },
            'end': {
                'date': (reminder_date + timedelta(days=1)).isoformat(),
                'timeZone': 'UTC',
            },
            'reminders': {
                'useDefault': True,
            },
        }
        
        print(f"DEBUG: Event object: {event}")
        
        # Insert event into primary calendar
        created_event = service.events().insert(
            calendarId='primary',
            body=event
        ).execute()
        
        print(f"DEBUG: Event created with ID: {created_event['id']}")
        
        # Save event ID to database
        GoogleCalendarReminder.objects.update_or_create(
            period=period,
            defaults={
                'calendar_event_id': created_event['id'],
                'reminder_date': reminder_date,
            }
        )
        
        print(f"DEBUG: Reminder saved to database")
        return created_event
    except HttpError as e:
        print(f"DEBUG: Google Calendar API error: {str(e)}")
        raise Exception(f"Google Calendar API error: {str(e)}")
    except Exception as e:
        print(f"DEBUG: Failed to create reminder event: {str(e)}")
        raise Exception(f"Failed to create reminder event: {str(e)}")


def delete_period_reminder_event(period):
    """Delete Google Calendar reminder event for a period"""
    try:
        reminder = GoogleCalendarReminder.objects.get(period=period)
        service = get_calendar_service(period.user)
        
        if service:
            service.events().delete(
                calendarId='primary',
                eventId=reminder.calendar_event_id
            ).execute()
        
        reminder.delete()
        return True
    except GoogleCalendarReminder.DoesNotExist:
        return False
    except HttpError as e:
        raise Exception(f"Google Calendar API error: {str(e)}")
    except Exception as e:
        raise Exception(f"Failed to delete reminder event: {str(e)}")


def store_google_tokens(user, access_token, refresh_token, expiry):
    """Store Google OAuth tokens in database"""
    try:
        GoogleCalendarToken.objects.update_or_create(
            user=user,
            defaults={
                'access_token': access_token,
                'refresh_token': refresh_token,
                'token_expiry': expiry,
            }
        )
        return True
    except Exception as e:
        raise Exception(f"Failed to store tokens: {str(e)}")
