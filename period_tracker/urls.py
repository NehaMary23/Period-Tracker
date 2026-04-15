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

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api_health, name='api_health'),
    path('api/tracker/', include('tracker.urls')),
]
