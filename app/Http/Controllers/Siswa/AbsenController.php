<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\ClassroomStudent;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AbsenController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        // 1. Get the active academic year
        $activePeriod = AcademicYear::where('is_active', true)->first();

        if (!$activePeriod) {
            $activePeriod = AcademicYear::orderBy('year', 'desc')
                ->orderBy('semester', 'desc')
                ->first();
        }

        $attendances = [];
        $classroom = null;
        $stats = [
            'present' => 0,
            'sick' => 0,
            'permission' => 0,
            'absent' => 0,
            'percentage' => 100,
        ];

        if ($activePeriod) {
            // Find the classroom student record in this active period
            $classroomStudent = ClassroomStudent::where('student_id', $user->id)
                ->whereHas('classroom', function ($query) use ($activePeriod) {
                    $query->where('academic_year_id', $activePeriod->id);
                })
                ->with(['classroom'])
                ->first();

            if ($classroomStudent) {
                $classroom = $classroomStudent->classroom;

                // Load all attendances for this student in this classroom
                $records = Attendance::where('classroom_student_id', $classroomStudent->id)
                    ->with(['classroomSubjectTeacher.subject', 'classroomSubjectTeacher.teacher'])
                    ->orderBy('date', 'desc')
                    ->get();

                foreach ($records as $record) {
                    $status = $record->status; // present, sick, permission, absent
                    if (array_key_exists($status, $stats)) {
                        $stats[$status]++;
                    }

                    $attendances[] = [
                        'id' => $record->id,
                        'date' => $record->date,
                        'status' => $status,
                        'subject' => [
                            'name' => $record->classroomSubjectTeacher?->subject?->name,
                            'code' => $record->classroomSubjectTeacher?->subject?->code,
                        ],
                        'teacher' => [
                            'name' => $record->classroomSubjectTeacher?->teacher?->name,
                        ]
                    ];
                }

                $total = count($attendances);
                if ($total > 0) {
                    $stats['percentage'] = round((($total - $stats['absent']) / $total) * 100);
                }
            }
        }

        return Inertia::render('siswa/absen', [
            'attendances' => $attendances,
            'stats' => $stats,
            'classroom' => $classroom ? [
                'id' => $classroom->id,
                'name' => $classroom->name,
            ] : null,
            'activePeriod' => $activePeriod ? [
                'id' => $activePeriod->id,
                'year' => $activePeriod->year,
                'semester' => $activePeriod->semester,
            ] : null,
        ]);
    }
}
