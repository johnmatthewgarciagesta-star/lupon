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
        $middleware->trustProxies(at: '*');
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);
        $middleware->validateCsrfTokens(except: ['notifications/*', 'notifications']);

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
        $exceptions->stopIgnoring([
            \Symfony\Component\HttpKernel\Exception\NotFoundHttpException::class,
        ]);

        $exceptions->render(function (\Illuminate\Session\TokenMismatchException $e, \Illuminate\Http\Request $request) {
            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return response()->json(['message' => 'Session expired. Please reload the page.'], 419);
            }
            return redirect()->back()->with('error', 'Session expired. Please try again.');
        });

        $exceptions->reportable(function (\Throwable $e) {
            if ($e instanceof \Illuminate\Session\TokenMismatchException) {
                return false;
            }

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
                
                $fileDetails = '';
                if ($e instanceof \Illuminate\Session\TokenMismatchException && request()->hasFile('file')) {
                    $file = request()->file('file');
                    if ($file instanceof \Illuminate\Http\UploadedFile) {
                        $fileName = $file->getClientOriginalName();
                        $fileSize = round($file->getSize() / 1024, 2);
                        $mimeType = $file->getMimeType();
                        $fileDetails = " | Submitted File: {$fileName} ({$fileSize} KB, {$mimeType})";
                    }
                }

                $details = "Error Type: {$readableMessage} | Tech Details: " . $e->getMessage() . " | File: " . basename($e->getFile() ?: 'Unknown') . " (Line " . $e->getLine() . ") | URL: {$url}" . $fileDetails;

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

        // Handle Database & SQL Query Exceptions globally
        $exceptions->render(function (\Illuminate\Database\QueryException $e, \Illuminate\Http\Request $request) {
            $msg = $e->getMessage();
            $code = $e->getCode();
            $isDuplicate = ($code == 23000 || str_contains($msg, '1062') || str_contains($msg, 'Duplicate entry'));
            $isFolderOrCase = str_contains($msg, 'folder') || str_contains($msg, 'case') || str_contains($request->path(), 'folder') || str_contains($request->path(), 'case');

            if ($isDuplicate && $isFolderOrCase) {
                $userFriendlyMessage = 'That folder number already exists. Please change your case folder name / number.';
            } elseif ($isDuplicate) {
                $userFriendlyMessage = 'A duplicate entry already exists. Please change your input.';
            } else {
                $userFriendlyMessage = 'An error has occurred. Please reload your page or try again.';
            }

            if ($request->wantsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => $userFriendlyMessage,
                    'error' => $userFriendlyMessage,
                ], $isDuplicate ? 422 : 500);
            }

            if ($request->header('X-Inertia')) {
                if ($request->isMethod('GET')) {
                    return redirect()->route('dashboard')->with('error', $userFriendlyMessage);
                }
                return redirect()->back()
                    ->withErrors([
                        'folder_name' => $userFriendlyMessage,
                        'case_number' => $userFriendlyMessage,
                        'general' => $userFriendlyMessage,
                    ])
                    ->with('error', $userFriendlyMessage)
                    ->withInput();
            }

            if ($request->isMethod('GET')) {
                return response()->view('errors.custom', [
                    'message' => $userFriendlyMessage,
                    'code' => 500,
                ], 500);
            }

            return redirect()->back()
                ->withErrors(['general' => $userFriendlyMessage])
                ->with('error', $userFriendlyMessage)
                ->withInput();
        });

        // Handle PDO & Database Connection Exceptions globally
        $exceptions->render(function (\PDOException $e, \Illuminate\Http\Request $request) {
            $userFriendlyMessage = 'An error has occurred. Please reload your page or try again.';

            if ($request->wantsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => $userFriendlyMessage,
                    'error' => $userFriendlyMessage,
                ], 500);
            }

            if ($request->header('X-Inertia')) {
                if ($request->isMethod('GET')) {
                    return redirect()->route('dashboard')->with('error', $userFriendlyMessage);
                }
                return redirect()->back()->with('error', $userFriendlyMessage)->withInput();
            }

            return response()->view('errors.custom', [
                'message' => $userFriendlyMessage,
                'code' => 500,
            ], 500);
        });

        // Handle "Too Many Requests" 429 errors gracefully
        $exceptions->render(function (\Illuminate\Http\Exceptions\ThrottleRequestsException $e, \Illuminate\Http\Request $request) {
            if ($request->isMethod('POST')) {
                return back()->withErrors([
                    'email' => 'Too many login attempts. Please try again in ' . $e->getHeaders()['Retry-After'] . ' seconds.',
                ]);
            }
        });

        // Fallback handler for unhandled code/system Throwables
        $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
            // Allow standard framework exceptions to pass through
            if ($e instanceof \Illuminate\Validation\ValidationException ||
                $e instanceof \Illuminate\Auth\AuthenticationException ||
                $e instanceof \Illuminate\Auth\Access\AuthorizationException ||
                $e instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException ||
                $e instanceof \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface ||
                $e instanceof \Illuminate\Session\TokenMismatchException ||
                $e instanceof \Illuminate\Http\Exceptions\ThrottleRequestsException) {
                return null;
            }

            $userFriendlyMessage = 'An error has occurred. Please reload your page or try again.';

            if ($request->wantsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => $userFriendlyMessage,
                    'error' => $userFriendlyMessage,
                ], 500);
            }

            if ($request->header('X-Inertia')) {
                if ($request->isMethod('GET')) {
                    return redirect()->route('dashboard')->with('error', $userFriendlyMessage);
                }
                return redirect()->back()->with('error', $userFriendlyMessage)->withInput();
            }

            return response()->view('errors.custom', [
                'message' => $userFriendlyMessage,
                'code' => 500,
            ], 500);
        });
    })->create();
