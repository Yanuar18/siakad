<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\ClassroomStudent;
use App\Models\ClassroomSubjectTeacher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AbsensiController extends Controller
{
    private function checkRole(Request $request): void
    {
        abort_if(!$request->user() || $request->user()->role !== 'teacher', 403, 'Unauthorized.');
    }

    public function index(Request $request): Response
    {
        $this->checkRole($request);
        $teacher = $request->user();

        // Get all classrooms, subjects taught by this teacher
        $assignedClasses = ClassroomSubjectTeacher::with(['classroom.academicYear', 'subject'])
            ->where('teacher_id', $teacher->id)
            ->get();

        $selectedClassId = $request->input('classroom_subject_teacher_id', $assignedClasses->first()?->id);
        $selectedDate = $request->input('date', date('Y-m-d'));

        $assignedIds = $assignedClasses->pluck('id');

        $history = Attendance::with(['classroomSubjectTeacher.classroom', 'classroomSubjectTeacher.subject'])
            ->whereIn('classroom_subject_teacher_id', $assignedIds)
            ->selectRaw('classroom_subject_teacher_id, date, 
                count(*) as total_students,
                sum(case when status = "present" then 1 else 0 end) as present_count,
                sum(case when status = "sick" then 1 else 0 end) as sick_count,
                sum(case when status = "permission" then 1 else 0 end) as permission_count,
                sum(case when status = "absent" then 1 else 0 end) as absent_count')
            ->groupBy('classroom_subject_teacher_id', 'date')
            ->orderBy('date', 'desc')
            ->get();

        $students = [];
        $attendances = [];

        if ($selectedClassId) {
            // Verify ownership
            $assignedClass = $assignedClasses->where('id', $selectedClassId)->first();
            if ($assignedClass) {
                // Get classroom students
                $students = ClassroomStudent::with('student.studentDetail')
                    ->where('classroom_id', $assignedClass->classroom_id)
                    ->get();

                // Get recorded attendances
                $attendances = Attendance::where('classroom_subject_teacher_id', $selectedClassId)
                    ->where('date', $selectedDate)
                    ->get()
                    ->keyBy('classroom_student_id');
            }
        }

        return Inertia::render('guru/absen', [
            'assignedClasses' => $assignedClasses,
            'selectedClassId' => $selectedClassId ? (int) $selectedClassId : null,
            'selectedDate' => $selectedDate,
            'students' => $students,
            'attendances' => $attendances,
            'history' => $history,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->checkRole($request);
        
        $data = $request->validate([
            'classroom_subject_teacher_id' => 'required|exists:classroom_subject_teachers,id',
            'date' => 'required|date',
            'attendances' => 'required|array',
            'attendances.*' => 'required|string|in:present,sick,permission,absent',
        ]);

        // Verify ownership
        ClassroomSubjectTeacher::where('id', $data['classroom_subject_teacher_id'])
            ->where('teacher_id', $request->user()->id)
            ->firstOrFail();

        foreach ($data['attendances'] as $classroomStudentId => $status) {
            Attendance::updateOrCreate(
                [
                    'classroom_student_id' => $classroomStudentId,
                    'classroom_subject_teacher_id' => $data['classroom_subject_teacher_id'],
                    'date' => $data['date'],
                ],
                [
                    'status' => $status,
                ]
            );
        }

        return back()->with('status', 'Absensi siswa berhasil disimpan.');
    }
}
