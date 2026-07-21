<?php

use App\Models\User;
use App\Models\Classroom;
use App\Models\AcademicYear;
use App\Models\Subject;
use App\Models\ClassroomStudent;
use App\Models\ClassroomSubjectTeacher;

test('admin can enroll multiple students at once', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    
    $academicYear = AcademicYear::create([
        'year' => '2026/2027',
        'semester' => 'odd',
        'is_active' => true,
    ]);

    $classroom = Classroom::create([
        'name' => 'Class A',
        'academic_year_id' => $academicYear->id,
    ]);

    $student1 = User::factory()->create(['role' => 'student']);
    $student2 = User::factory()->create(['role' => 'student']);

    $response = $this->actingAs($admin)
        ->post(route('admin.kelas.enroll'), [
            'classroom_id' => $classroom->id,
            'student_ids' => [$student1->id, $student2->id],
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('classroom_students', [
        'classroom_id' => $classroom->id,
        'student_id' => $student1->id,
    ]);
    $this->assertDatabaseHas('classroom_students', [
        'classroom_id' => $classroom->id,
        'student_id' => $student2->id,
    ]);
});

test('admin can assign multiple subjects to multiple teachers', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    
    $academicYear = AcademicYear::create([
        'year' => '2026/2027',
        'semester' => 'odd',
        'is_active' => true,
    ]);

    $classroom = Classroom::create([
        'name' => 'Class A',
        'academic_year_id' => $academicYear->id,
    ]);

    $subject1 = Subject::create(['name' => 'Math', 'code' => 'MTH']);
    $subject2 = Subject::create(['name' => 'Science', 'code' => 'SCI']);
    $teacher1 = User::factory()->create(['role' => 'teacher']);
    $teacher2 = User::factory()->create(['role' => 'teacher']);

    $response = $this->actingAs($admin)
        ->post(route('admin.kelas.assign-teacher'), [
            'classroom_id' => $classroom->id,
            'subject_ids' => [$subject1->id, $subject2->id],
            'teacher_ids' => [$teacher1->id, $teacher2->id],
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('classroom_subject_teachers', [
        'classroom_id' => $classroom->id,
        'subject_id' => $subject1->id,
        'teacher_id' => $teacher1->id,
    ]);
    $this->assertDatabaseHas('classroom_subject_teachers', [
        'classroom_id' => $classroom->id,
        'subject_id' => $subject2->id,
        'teacher_id' => $teacher2->id,
    ]);
});

test('admin can unenroll a student', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    
    $academicYear = AcademicYear::create([
        'year' => '2026/2027',
        'semester' => 'odd',
        'is_active' => true,
    ]);

    $classroom = Classroom::create([
        'name' => 'Class A',
        'academic_year_id' => $academicYear->id,
    ]);

    $student = User::factory()->create(['role' => 'student']);
    $enrollment = ClassroomStudent::create([
        'classroom_id' => $classroom->id,
        'student_id' => $student->id,
    ]);

    $response = $this->actingAs($admin)
        ->delete(route('admin.kelas.unenroll', $enrollment->id));

    $response->assertRedirect();
    $this->assertDatabaseMissing('classroom_students', [
        'id' => $enrollment->id,
    ]);
});

test('admin can dismiss a teacher assignment', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    
    $academicYear = AcademicYear::create([
        'year' => '2026/2027',
        'semester' => 'odd',
        'is_active' => true,
    ]);

    $classroom = Classroom::create([
        'name' => 'Class A',
        'academic_year_id' => $academicYear->id,
    ]);

    $subject = Subject::create(['name' => 'Math', 'code' => 'MTH']);
    $teacher = User::factory()->create(['role' => 'teacher']);
    $assignment = ClassroomSubjectTeacher::create([
        'classroom_id' => $classroom->id,
        'subject_id' => $subject->id,
        'teacher_id' => $teacher->id,
    ]);

    $response = $this->actingAs($admin)
        ->delete(route('admin.kelas.dismiss-teacher', $assignment->id));

    $response->assertRedirect();
    $this->assertDatabaseMissing('classroom_subject_teachers', [
        'id' => $assignment->id,
    ]);
});

test('non-admin cannot perform class operations', function () {
    $student = User::factory()->create(['role' => 'student']);
    
    $academicYear = AcademicYear::create([
        'year' => '2026/2027',
        'semester' => 'odd',
        'is_active' => true,
    ]);

    $classroom = Classroom::create([
        'name' => 'Class A',
        'academic_year_id' => $academicYear->id,
    ]);

    $response = $this->actingAs($student)
        ->post(route('admin.kelas.enroll'), [
            'classroom_id' => $classroom->id,
            'student_ids' => [$student->id],
        ]);

    $response->assertStatus(403);
});
