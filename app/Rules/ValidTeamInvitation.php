<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\ValidationRule;

class ValidTeamInvitation implements ValidationRule
{
    public function validate(string $attribute, mixed $value, \Closure $fail): void
    {
        // No-op (Teams feature removed)
    }
}
