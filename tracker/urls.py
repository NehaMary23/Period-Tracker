from django.urls import path
from . import views

app_name = 'tracker'

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('log-period/', views.log_period, name='log_period'),
    path('period/<int:pk>/', views.period_detail, name='period_detail'),
    path('period/<int:pk>/edit/', views.edit_period, name='edit_period'),
    path('period/<int:pk>/delete/', views.delete_period, name='delete_period'),
    path('history/', views.cycle_history, name='cycle_history'),
    path('symptom/<int:pk>/delete/', views.delete_symptom, name='delete_symptom'),
    path('settings/', views.settings, name='settings'),
]
