<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentDetail extends Model
{
    protected $fillable = ['user_id', 'nis'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
