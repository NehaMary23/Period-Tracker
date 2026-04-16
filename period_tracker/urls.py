"""
URL configuration for period_tracker project.
API endpoints for Next.js frontend.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

# API health check
def api_health(request):
    return JsonResponse({'status': 'ok', 'message': 'Period Tracker API'})

from . import views

urlpatterns = [
    path('', views.homepage, name='homepage'),

    path('admin/', admin.site.urls),
    path('api/health/', api_health, name='api_health'),  # ✅ separate route
    path('api/', include('tracker.urls')),               # ✅ keep API routes
]
