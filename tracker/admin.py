from django.contrib import admin
from .models import PeriodCycle, HealthSymptom, CycleReminder, NotificationLog

@admin.register(PeriodCycle)
class PeriodCycleAdmin(admin.ModelAdmin):
    list_display = ('user', 'start_date', 'end_date', 'get_duration', 'flow_intensity', 'created_at')
    list_filter = ('flow_intensity', 'created_at', 'user')
    search_fields = ('user__username', 'notes')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Period Details', {
            'fields': ('start_date', 'end_date', 'flow_intensity')
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_duration(self, obj):
        return f"{obj.get_duration()} days"
    get_duration.short_description = 'Duration'


@admin.register(HealthSymptom)
class HealthSymptomAdmin(admin.ModelAdmin):
    list_display = ('period', 'symptom_type', 'severity', 'logged_date')
    list_filter = ('symptom_type', 'severity', 'logged_date')
    search_fields = ('period__user__username', 'notes')
    fieldsets = (
        ('Period Reference', {
            'fields': ('period',)
        }),
        ('Symptom Information', {
            'fields': ('symptom_type', 'severity')
        }),
        ('Details', {
            'fields': ('logged_date', 'notes')
        }),
    )


@admin.register(CycleReminder)
class CycleReminderAdmin(admin.ModelAdmin):
    list_display = ('user', 'average_cycle_length', 'average_period_length', 'reminder_enabled')
    list_filter = ('reminder_enabled',)
    search_fields = ('user__username',)
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Cycle Settings', {
            'fields': ('average_cycle_length', 'average_period_length')
        }),
        ('Notifications', {
            'fields': ('reminder_enabled',)
        }),
    )


@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'notification_type', 'predicted_date', 'sent_date', 'success')
    list_filter = ('notification_type', 'success', 'sent_date')
    search_fields = ('user__username', 'recipient_email')
    readonly_fields = ('user', 'notification_type', 'predicted_date', 'sent_date', 'recipient_email', 'subject', 'message', 'error_message')
    fieldsets = (
        ('Notification Details', {
            'fields': ('user', 'notification_type', 'predicted_date')
        }),
        ('Email Information', {
            'fields': ('recipient_email', 'subject', 'message')
        }),
        ('Status', {
            'fields': ('success', 'error_message')
        }),
        ('Timestamps', {
            'fields': ('sent_date',)
        }),
    )

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
