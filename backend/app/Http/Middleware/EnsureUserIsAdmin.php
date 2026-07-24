<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * NFR-4.2.3 Role-Based Access Control — terminates non-admin
 * requests at the routing perimeter.
 */
class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! $request->user()->is_admin) {
            return response()->json(['message' => 'Forbidden. Administrator access required.'], 403);
        }

        return $next($request);
    }
}
