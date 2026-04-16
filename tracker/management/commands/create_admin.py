from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Create admin user if not exists'

    def handle(self, *args, **options):
        User = get_user_model()
        username = 'NehaAdmin'
        password = 'adminneha@123456'  # Change this after first login
        email = 'nehapramo05@gmail.com'  # Change this to your email
        if not User.objects.filter(username=username).exists():
            User.objects.create_superuser(username=username, email=email, password=password)
            self.stdout.write(self.style.SUCCESS('Superuser created.'))
        else:
            self.stdout.write(self.style.WARNING('Superuser already exists.'))
