<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\AcademicYear;
use App\Models\ClassroomStudent;
use App\Models\Attendance;

class DashboardController extends Controller
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

        $classroom = null;
        $todayClasses = [];
        $attendanceStats = [
            'present' => 0,
            'sick' => 0,
            'permission' => 0,
            'absent' => 0,
            'total' => 0,
        ];

        if ($activePeriod) {
            // Find the classroom for the student in this active period
            $classroomStudent = ClassroomStudent::where('student_id', $user->id)
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
                $classroom = [
                    'id' => $classroomStudent->classroom->id,
                    'name' => $classroomStudent->classroom->name,
                ];

                // Collect today's classes
                $todayDay = strtolower(date('l')); // 'monday', 'tuesday', etc.
                
                foreach ($classroomStudent->classroom->classroomSubjectTeachers as $cst) {
                    foreach ($cst->schedules as $schedule) {
                        if (strtolower($schedule->day) === $todayDay) {
                            $todayClasses[] = [
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

                // Sort classes by start_time
                usort($todayClasses, function ($a, $b) {
                    return strcmp($a['start_time'] ?? '', $b['start_time'] ?? '');
                });

                // Calculate attendance stats
                $records = Attendance::where('classroom_student_id', $classroomStudent->id)->get();
                foreach ($records as $record) {
                    $status = strtolower($record->status);
                    if ($status === 'present' || $status === 'hadir') {
                        $attendanceStats['present']++;
                    } elseif ($status === 'sick' || $status === 'sakit') {
                        $attendanceStats['sick']++;
                    } elseif ($status === 'permission' || $status === 'izin') {
                        $attendanceStats['permission']++;
                    } elseif ($status === 'absent' || $status === 'alfa' || $status === 'alpha') {
                        $attendanceStats['absent']++;
                    }
                }
                $attendanceStats['total'] = count($records);
            }
        }

        return Inertia::render('siswa/dashboard', [
            'classroom' => $classroom,
            'todayClasses' => $todayClasses,
            'attendanceStats' => $attendanceStats,
            'activePeriod' => $activePeriod ? [
                'id' => $activePeriod->id,
                'year' => $activePeriod->year,
                'semester' => $activePeriod->semester,
            ] : null,
        ]);
    }
}
