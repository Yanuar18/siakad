<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\ClassroomSubjectTeacher;
use App\Models\ClassroomStudent;
use App\Models\Schedule;
use App\Models\Attendance;
use App\Models\ReportCard;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private function checkRole(Request $request): void
    {
        abort_if(!$request->user() || $request->user()->role !== 'teacher', 403, 'Unauthorized.');
    }

    public function __invoke(Request $request): Response
    {
        $this->checkRole($request);

        $teacher = $request->user();

        // Get all classrooms, subjects taught by this teacher
        $assignedClasses = ClassroomSubjectTeacher::with(['classroom.academicYear', 'subject', 'classroom.classroomStudents.student'])
            ->where('teacher_id', $teacher->id)
            ->get();

        // Pluck the classroom subject teacher IDs to scope other listings
        $assignedIds = $assignedClasses->pluck('id');

        $schedules = Schedule::with(['classroomSubjectTeacher.classroom', 'classroomSubjectTeacher.subject'])
            ->whereIn('classroom_subject_teacher_id', $assignedIds)
            ->get();

        $attendances = Attendance::with(['classroomStudent.student', 'classroomSubjectTeacher.subject'])
            ->whereIn('classroom_subject_teacher_id', $assignedIds)
            ->latest()
            ->get();

        $reportCards = ReportCard::with(['classroomStudent.student', 'classroomSubjectTeacher.subject'])
            ->whereIn('classroom_subject_teacher_id', $assignedIds)
            ->get();

        $activeAcademicYear = AcademicYear::where('is_active', true)->first();

        return Inertia::render('guru/dashboard', [
            'assignedClasses' => $assignedClasses,
            'schedules' => $schedules,
            'attendances' => $attendances,
            'reportCards' => $reportCards,
            'activeAcademicYear' => $activeAcademicYear,
        ]);
    }

    public function createSchedule(Request $request)
    {
        $this->checkRole($request);

        $data = $request->validate([
            'classroom_subject_teacher_id' => 'required|exists:classroom_subject_teachers,id',
            'day' => 'required|string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'start_time' => 'required',
            'end_time' => 'required',
        ]);

        Schedule::create($data);

        return back()->with('status', 'Schedule created successfully.');
    }

    public function storeAttendance(Request $request)
    {
        $this->checkRole($request);

        $data = $request->validate([
            'classroom_student_id' => 'required|exists:classroom_students,id',
            'classroom_subject_teacher_id' => 'required|exists:classroom_subject_teachers,id',
            'date' => 'required|date',
            'status' => 'required|string|in:present,sick,permission,absent',
        ]);

        Attendance::updateOrCreate(
            [
                'classroom_student_id' => $data['classroom_student_id'],
                'classroom_subject_teacher_id' => $data['classroom_subject_teacher_id'],
                'date' => $data['date'],
            ],
            [
                'status' => $data['status'],
            ]
        );

        return back()->with('status', 'Attendance recorded successfully.');
    }

    public function storeReportCard(Request $request)
    {
        $this->checkRole($request);

        $data = $request->validate([
            'classroom_student_id' => 'required|exists:classroom_students,id',
            'classroom_subject_teacher_id' => 'required|exists:classroom_subject_teachers,id',
            'score' => 'required|integer|min:0|max:100',
            'grade' => 'nullable|string|max:5',
            'notes' => 'nullable|string',
        ]);

        // Auto-assign letter grade if not provided
        if (empty($data['grade'])) {
            $score = $data['score'];
            if ($score >= 85) {
                $data['grade'] = 'A';
            } elseif ($score >= 75) {
                $data['grade'] = 'B';
            } elseif ($score >= 60) {
                $data['grade'] = 'C';
            } elseif ($score >= 50) {
                $data['grade'] = 'D';
            } else {
                $data['grade'] = 'E';
            }
        }

        ReportCard::updateOrCreate(
            [
                'classroom_student_id' => $data['classroom_student_id'],
                'classroom_subject_teacher_id' => $data['classroom_subject_teacher_id'],
            ],
            [
                'score' => $data['score'],
                'grade' => $data['grade'],
                'notes' => $data['notes'],
            ]
        );

        return back()->with('status', 'Report card grade saved successfully.');
    }
}
