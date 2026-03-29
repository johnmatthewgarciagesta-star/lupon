<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            \Illuminate\Session\Middleware\AuthenticateSession::class,
        ]);
        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->stopIgnoring([\Symfony\Component\HttpKernel\Exception\NotFoundHttpException::class]);

        $exceptions->reportable(function (\Throwable $e) {
            try {
                $action = 'SYSTEM_ERROR';
                $module = 'System Kernel';
                $readableMessage = $e->getMessage() ?: 'An unexpected system error occurred.';
                
                if ($e instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException) {
                    $action = 'PAGE_NOT_FOUND';
                    $module = 'Website Navigation';
                    $readableMessage = 'A user tried to visit a page or file that does not exist or was removed.';
                } elseif ($e instanceof \Illuminate\Database\QueryException) {
                    $action = 'DATABASE_ERROR';
                    $module = 'Database System';
                    $readableMessage = 'The system encountered an error while trying to read or insert database records.';
                } elseif ($e instanceof \ParseError || $e instanceof \Error) {
                    $action = 'FATAL_CODE_ERROR';
                    $module = 'System Codebase';
                    $readableMessage = 'A critical programming error was detected (e.g. missing code, broken function, or syntax error).';
                } elseif ($e instanceof \Illuminate\Validation\ValidationException) {
                    $action = 'VALIDATION_FAILED';
                    $module = 'Form Submission';
                    $readableMessage = 'A form was submitted with invalid or missing data.';
                } elseif ($e instanceof \Illuminate\Auth\AuthenticationException || $e instanceof \Illuminate\Auth\Access\AuthorizationException) {
                    $action = 'ACCESS_DENIED';
                    $module = 'Authentication & Security';
                    $readableMessage = 'An unauthorized access attempt was blocked by the system.';
                }

                $url = request()->fullUrl() ?? 'Unknown URL';
                $details = "Error Type: {$readableMessage} | Tech Details: " . $e->getMessage() . " | File: " . basename($e->getFile()) . " (Line " . $e->getLine() . ") | URL: {$url}";

                // Fallback User ID para pumasok pa rin sa Database kahit nakalog-out ang user (e.g. 404 pagkabukas pa lang ng site)
                $fallbackUserId = \Illuminate\Support\Facades\DB::table('users')->orderBy('id', 'asc')->value('id') ?? 1;
                $userId = \Illuminate\Support\Facades\Auth::id() ?: $fallbackUserId;

                \App\Services\AuditService::log(
                    $action,
                    $module,
                    substr($details, 0, 1000), // Prevent DB overflow
                    null,
                    $userId
                );
            } catch (\Exception $auditError) {
                // Fail silently if audit logging itself fails during an exception
            }
        });

        // Handle "Too Many Requests" 429 errors gracefully
        $exceptions->render(function (\Illuminate\Http\Exceptions\ThrottleRequestsException $e, \Illuminate\Http\Request $request) {
            if ($request->isMethod('POST')) {
                return back()->withErrors([
                    'email' => 'Too many login attempts. Please try again in ' . $e->getHeaders()['Retry-After'] . ' seconds.',
                ]);
            }
        });
    })->create();
