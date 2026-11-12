<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>System Notice - Lupon Tagapamayapa</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: linear-gradient(135deg, #0b0f19 0%, #171e2e 100%);
            color: #f3f4f6;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
        }
        .card {
            background: rgba(30, 41, 59, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(16px);
            border-radius: 1.25rem;
            padding: 2.5rem;
            max-width: 32rem;
            width: 100%;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .icon-box {
            width: 4.5rem;
            height: 4.5rem;
            margin: 0 auto 1.5rem;
            border-radius: 1rem;
            background: rgba(221, 139, 17, 0.15);
            border: 1px solid rgba(221, 139, 17, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #dd8b11;
        }
        h1 {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.75rem;
            color: #ffffff;
        }
        p {
            font-size: 0.925rem;
            line-height: 1.6;
            color: #94a3b8;
            margin-bottom: 2rem;
        }
        .actions {
            display: flex;
            gap: 0.75rem;
            justify-content: center;
        }
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.75rem 1.25rem;
            font-size: 0.875rem;
            font-weight: 600;
            border-radius: 0.625rem;
            text-decoration: none;
            transition: all 0.2s ease;
            cursor: pointer;
            border: none;
        }
        .btn-primary {
            background: #dd8b11;
            color: #ffffff;
        }
        .btn-primary:hover {
            background: #c47c0f;
            transform: translateY(-1px);
        }
        .btn-outline {
            background: rgba(255, 255, 255, 0.05);
            color: #e2e8f0;
            border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .btn-outline:hover {
            background: rgba(255, 255, 255, 0.1);
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon-box">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
        </div>
        <h1>System Notice</h1>
        <p>{{ $message ?? 'An error has occurred. Please reload your page or try again.' }}</p>
        <div class="actions">
            <button onclick="window.location.reload()" class="btn btn-primary">
                Reload Page
            </button>
            <a href="/dashboard" class="btn btn-outline">
                Return to Dashboard
            </a>
        </div>
    </div>
</body>
</html>
