<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JadwalController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        // 1. Get the active academic year
        $activePeriod = \App\Models\AcademicYear::where('is_active', true)->first();

        if (!$activePeriod) {
            // fallback to the latest academic year if none is active
            $activePeriod = \App\Models\AcademicYear::orderBy('year', 'desc')
                ->orderBy('semester', 'desc')
                ->first();
        }

        $schedules = [];
        $classroom = null;

        if ($activePeriod) {
            // 2. Find the classroom for the student in this active period
            $classroomStudent = \App\Models\ClassroomStudent::where('student_id', $user->id)
                ->whereHas('classroom', function ($query) use ($activePeriod) {
                    $query->where('academic_year_id', $activePeriod->id);
                })
                ->with([
                    'classroom.classroomSubjectTeachers.subject',
                    'classroom.classroomSubjectTeachers.teacher',
                    'classroom.classroomSubjectTeachers.schedules'
                ])
                ->first();

            if ($classroomStudent) {
                $classroom = $classroomStudent->classroom;
                // Collect all schedules for the classroom
                foreach ($classroom->classroomSubjectTeachers as $cst) {
                    if ($cst->schedules->isEmpty()) {
                        $schedules[] = [
                            'id' => null,
                            'day' => 'unscheduled',
                            'start_time' => null,
                            'end_time' => null,
                            'subject' => [
                                'name' => $cst->subject?->name,
                                'code' => $cst->subject?->code,
                            ],
                            'teacher' => [
                                'name' => $cst->teacher?->name,
                                'avatar_url' => $cst->teacher?->avatar_url,
                            ],
                        ];
                    } else {
                        foreach ($cst->schedules as $schedule) {
                            $schedules[] = [
                                'id' => $schedule->id,
                                'day' => $schedule->day,
                                'start_time' => $schedule->start_time,
                                'end_time' => $schedule->end_time,
                                'subject' => [
                                    'name' => $cst->subject?->name,
                                    'code' => $cst->subject?->code,
                                ],
                                'teacher' => [
                                    'name' => $cst->teacher?->name,
                                    'avatar_url' => $cst->teacher?->avatar_url,
                                ],
                            ];
                        }
                    }
                }
            }
        }

        // Sort schedules by day of week then by start time
        $dayOrder = [
            'monday' => 1,
            'tuesday' => 2,
            'wednesday' => 3,
            'thursday' => 4,
            'friday' => 5,
            'saturday' => 6,
            'sunday' => 7,
            'unscheduled' => 8
        ];

        usort($schedules, function ($a, $b) use ($dayOrder) {
            $dayA = $dayOrder[strtolower($a['day'])] ?? 99;
            $dayB = $dayOrder[strtolower($b['day'])] ?? 99;
            if ($dayA === $dayB) {
                if ($a['start_time'] === null) return 1;
                if ($b['start_time'] === null) return -1;
                return strcmp($a['start_time'], $b['start_time']);
            }
            return $dayA <=> $dayB;
        });

        return Inertia::render('siswa/jadwal', [
            'schedules' => $schedules,
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
