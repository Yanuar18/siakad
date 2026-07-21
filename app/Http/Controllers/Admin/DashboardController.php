<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Subject;
use App\Models\AcademicYear;
use App\Models\Classroom;
use App\Models\ClassroomStudent;
use App\Models\ClassroomSubjectTeacher;
use App\Models\StudentDetail;
use App\Models\TeacherDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private function checkRole(Request $request): void
    {
        abort_if(!$request->user() || $request->user()->role !== 'admin', 403, 'Unauthorized.');
    }

    public function __invoke(Request $request): Response
    {
        $this->checkRole($request);

        // Ensure at least one default Academic Year exists
        if (AcademicYear::count() === 0) {
            AcademicYear::create([
                'year' => '2026/2027',
                'semester' => 'odd',
                'is_active' => true,
            ]);
        }

        $users = User::with(['studentDetail', 'teacherDetail'])->latest()->get();
        $subjects = Subject::latest()->get();
        $academicYears = AcademicYear::latest()->get();
        
        $classrooms = Classroom::with(['academicYear', 'classroomStudents.student', 'classroomSubjectTeachers.subject', 'classroomSubjectTeachers.teacher'])
            ->latest()
            ->get();

        return Inertia::render('admin/dashboard', [
            'users' => $users,
            'subjects' => $subjects,
            'academicYears' => $academicYears,
            'classrooms' => $classrooms,
        ]);
    }

    public function createUser(Request $request)
    {
        $this->checkRole($request);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|string|in:admin,teacher,student',
            'identity_number' => 'nullable|string|max:50', // NIS or NIP
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'],
        ]);

        if ($data['role'] === 'student') {
            StudentDetail::create([
                'user_id' => $user->id,
                'nis' => $data['identity_number'] ?? 'NIS-' . rand(100000, 999999),
            ]);
        } elseif ($data['role'] === 'teacher') {
            TeacherDetail::create([
                'user_id' => $user->id,
                'nip' => $data['identity_number'] ?? 'NIP-' . rand(100000, 999999),
            ]);
        }

        return back()->with('status', 'User created successfully.');
    }

    public function createSubject(Request $request)
    {
        $this->checkRole($request);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:subjects',
        ]);

        Subject::create($data);

        return back()->with('status', 'Subject created successfully.');
    }

    public function createClassroom(Request $request)
    {
        $this->checkRole($request);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'academic_year_id' => 'required|exists:academic_years,id',
        ]);

        Classroom::create($data);

        return back()->with('status', 'Classroom created successfully.');
    }

    public function enrollStudent(Request $request)
    {
        $this->checkRole($request);

        $data = $request->validate([
            'classroom_id' => 'required|exists:classrooms,id',
            'student_id' => 'required|exists:users,id',
        ]);

        // Check if student already enrolled in this class
        $exists = ClassroomStudent::where('classroom_id', $data['classroom_id'])
            ->where('student_id', $data['student_id'])
            ->exists();

        if (!$exists) {
            ClassroomStudent::create([
                'classroom_id' => $data['classroom_id'],
                'student_id' => $data['student_id'],
            ]);
        }

        return back()->with('status', 'Student enrolled successfully.');
    }

    public function assignTeacher(Request $request)
    {
        $this->checkRole($request);

        $data = $request->validate([
            'classroom_id' => 'required|exists:classrooms,id',
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'required|exists:users,id',
        ]);

        $exists = ClassroomSubjectTeacher::where('classroom_id', $data['classroom_id'])
            ->where('subject_id', $data['subject_id'])
            ->where('teacher_id', $data['teacher_id'])
            ->exists();

        if (!$exists) {
            ClassroomSubjectTeacher::create([
                'classroom_id' => $data['classroom_id'],
                'subject_id' => $data['subject_id'],
                'teacher_id' => $data['teacher_id'],
            ]);
        }

        return back()->with('status', 'Teacher assigned successfully.');
    }
}
