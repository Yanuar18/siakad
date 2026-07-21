<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Schedule extends Model
{
    protected $fillable = ['classroom_subject_teacher_id', 'day', 'start_time', 'end_time'];

    public function classroomSubjectTeacher(): BelongsTo
    {
        return $this->belongsTo(ClassroomSubjectTeacher::class);
    }
}
