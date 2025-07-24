<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
         return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role,
                    'unread_notifications_count' => $request->user()
                        ? $request->user()->notifications()
                            ->where('created_at', '>=', now()->subHours(24))
                            ->count()
                        : 0,
                ] : null,
            ],
            
            // ADD THESE LINES to share flash messages
            'flash' => [
                'message' => fn () => $request->session()->get('flash.message'),
                'type' => fn () => $request->session()->get('flash.type'),
            ],
            
            // Alternative formats that might work
            'success' => fn () => $request->session()->get('success'),
            'error' => fn () => $request->session()->get('error'),
            'message' => fn () => $request->session()->get('message'),
        ]);
    
    }
}
