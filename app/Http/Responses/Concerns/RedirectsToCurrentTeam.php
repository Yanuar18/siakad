<?php

namespace App\Http\Responses\Concerns;

use Illuminate\Http\Request;

trait RedirectsToCurrentTeam
{
    protected function redirectPathForCurrentTeam(Request $request, string $redirect): string
    {
        $user = $request->user();
        if ($user && $user->role === 'admin') {
            return "/admin/dashboard";
        } elseif ($user && $user->role === 'teacher') {
            return "/guru/dashboard";
        }

        return "/siswa/dashboard";
    }
}
