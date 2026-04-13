"""
URL configuration for period_tracker project.
"""
from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from tracker import views as tracker_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('tracker/', include('tracker.urls')),
    
    # Authentication URLs
    path('login/', auth_views.LoginView.as_view(template_name='auth/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('signup/', tracker_views.signup, name='signup'),
    
    # Redirect root to login
    path('', auth_views.LoginView.as_view(template_name='auth/login.html'), name='home'),
]
