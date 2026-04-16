from django.urls import path
from . import views

app_name = 'tracker'

urlpatterns = [
    
    # Auth API endpoints
    path('auth/signup/', views.api_signup, name='api_signup'),
    path('auth/login/', views.api_login, name='api_login'),
    path('auth/logout/', views.api_logout, name='api_logout'),
    path('auth/password-reset/', views.api_password_reset_request, name='api_password_reset_request'),       # 👈 new
    path('auth/password-reset-confirm/', views.api_password_reset_confirm, name='api_password_reset_confirm'), # 👈 new

    
    # Period API endpoints
    path('periods/', views.api_periods, name='api_periods'),
    path('periods/<int:pk>/', views.api_period_detail, name='api_period_detail'),
    
    # Stats API endpoints
    path('stats/cycle-info/', views.api_stats_cycle_info, name='api_stats_cycle_info'),
    path('stats/prediction/', views.api_stats_prediction, name='api_stats_prediction'),
    path('stats/history/', views.api_stats_history, name='api_stats_history'),
    
    # Settings API endpoints
    path('settings/', views.api_settings, name='api_settings'),
    
    # Notification API endpoints
    path('notifications/send/', views.api_send_notification, name='api_send_notification'),
    path('notifications/test/', views.api_test_period_notifications, name='api_test_period_notifications'),
]
