<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeacherDetail extends Model
{
    protected $fillable = ['user_id', 'nip'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
