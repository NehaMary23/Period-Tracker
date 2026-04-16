from django.http import HttpResponse

def homepage(request):
    return HttpResponse("""
    <!DOCTYPE html>
    <html lang='en'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>Period Tracker</title>
        <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff6f8; color: #222; margin: 0; }
            .container { max-width: 480px; margin: 60px auto; background: #fff; border-radius: 16px; box-shadow: 0 4px 24px #e11d4820; padding: 40px 32px; text-align: center; }
            h1 { color: #e11d48; font-size: 2.5rem; margin-bottom: 0.5em; }
            p { color: #444; font-size: 1.1rem; margin-bottom: 2em; }
            a.btn { display: inline-block; background: #e11d48; color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 1.1rem; transition: background 0.2s; }
            a.btn:hover { background: #be123c; }
            .admin-link { display: block; margin-top: 2em; color: #e11d48; font-size: 1rem; }
        </style>
    </head>
    <body>
        <div class='container'>
            <h1>Welcome to Period Tracker</h1>
            <p>Your trusted companion for menstrual health tracking.<br>Use the web app to log periods, view predictions, and manage your health with confidence.</p>
            <!-- Admin Login and API Health Check links removed as requested -->
        </div>
    </body>
    </html>
    """)