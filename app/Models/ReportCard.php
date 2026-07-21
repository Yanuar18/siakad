<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportCard extends Model
{
    protected $fillable = ['classroom_student_id', 'classroom_subject_teacher_id', 'score', 'grade', 'notes'];

    public function classroomStudent(): BelongsTo
    {
        return $this->belongsTo(ClassroomStudent::class);
    }

    public function classroomSubjectTeacher(): BelongsTo
    {
        return $this->belongsTo(ClassroomSubjectTeacher::class);
    }
}
