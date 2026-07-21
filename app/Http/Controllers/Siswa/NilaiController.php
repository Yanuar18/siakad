<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\ClassroomStudent;
use App\Models\ReportCard;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NilaiController extends Controller
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

        $grades = [];
        $classroom = null;
        $stats = [
            'total_subjects' => 0,
            'graded_subjects' => 0,
            'average_score' => 0,
            'highest_score' => 0,
            'lowest_score' => 0,
        ];

        if ($activePeriod) {
            // Find the student's classroom registration for this academic period
            $classroomStudent = ClassroomStudent::where('student_id', $user->id)
                ->whereHas('classroom', function ($query) use ($activePeriod) {
                    $query->where('academic_year_id', $activePeriod->id);
                })
                ->with([
                    'classroom.classroomSubjectTeachers.subject',
                    'classroom.classroomSubjectTeachers.teacher',
                ])
                ->first();

            if ($classroomStudent) {
                $classroom = $classroomStudent->classroom;

                // Load existing report cards for this student
                $reportCards = ReportCard::where('classroom_student_id', $classroomStudent->id)
                    ->get()
                    ->keyBy('classroom_subject_teacher_id');

                $totalScore = 0;
                $scoresList = [];

                foreach ($classroom->classroomSubjectTeachers as $cst) {
                    $reportCard = $reportCards->get($cst->id);
                    $score = $reportCard ? $reportCard->score : null;
                    $grade = $reportCard ? $reportCard->grade : null;
                    $notes = $reportCard ? $reportCard->notes : null;

                    if ($score !== null) {
                        $totalScore += $score;
                        $scoresList[] = (float) $score;
                    }

                    $grades[] = [
                        'id' => $reportCard ? $reportCard->id : null,
                        'classroom_subject_teacher_id' => $cst->id,
                        'score' => $score !== null ? (float) $score : null,
                        'grade' => $grade,
                        'notes' => $notes,
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

                $stats['total_subjects'] = count($grades);
                $stats['graded_subjects'] = count($scoresList);
                if (count($scoresList) > 0) {
                    $stats['average_score'] = round($totalScore / count($scoresList), 1);
                    $stats['highest_score'] = max($scoresList);
                    $stats['lowest_score'] = min($scoresList);
                }
            }
        }

        return Inertia::render('siswa/nilai', [
            'grades' => $grades,
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
