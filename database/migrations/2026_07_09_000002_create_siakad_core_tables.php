<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. student_details
        Schema::create('student_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('nis', 50)->unique();
            $table->timestamps();
        });

        // 2. teacher_details
        Schema::create('teacher_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('nip', 50)->unique();
            $table->timestamps();
        });

        // 3. subjects
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code', 50)->unique();
            $table->timestamps();
        });

        // 4. academic_years
        Schema::create('academic_years', function (Blueprint $table) {
            $table->id();
            $table->string('year', 20); // e.g. 2026/2027
            $table->string('semester', 10); // odd, even
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });

        // 5. classrooms
        Schema::create('classrooms', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('academic_year_id')->constrained('academic_years')->onDelete('cascade');
            $table->timestamps();
        });

        // 6. classroom_students (enrollment)
        Schema::create('classroom_students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classroom_id')->constrained('classrooms')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['classroom_id', 'student_id']);
        });

        // 7. classroom_subject_teachers
        Schema::create('classroom_subject_teachers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classroom_id')->constrained('classrooms')->onDelete('cascade');
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['classroom_id', 'subject_id', 'teacher_id'], 'class_sub_teacher_unique');
        });

        // 8. schedules
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classroom_subject_teacher_id')->constrained('classroom_subject_teachers')->onDelete('cascade');
            $table->string('day', 20); // monday, tuesday, etc.
            $table->time('start_time');
            $table->time('end_time');
            $table->timestamps();
        });

        // 9. attendances
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classroom_student_id')->constrained('classroom_students')->onDelete('cascade');
            $table->foreignId('classroom_subject_teacher_id')->constrained('classroom_subject_teachers')->onDelete('cascade');
            $table->date('date');
            $table->string('status', 20); // present, sick, permission, absent
            $table->timestamps();

            $table->unique(['classroom_student_id', 'classroom_subject_teacher_id', 'date'], 'student_subject_date_unique');
        });

        // 10. report_cards
        Schema::create('report_cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classroom_student_id')->constrained('classroom_students')->onDelete('cascade');
            $table->foreignId('classroom_subject_teacher_id')->constrained('classroom_subject_teachers')->onDelete('cascade');
            $table->integer('score');
            $table->string('grade', 5)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['classroom_student_id', 'classroom_subject_teacher_id'], 'student_subject_grade_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_cards');
        Schema::dropIfExists('attendances');
        Schema::dropIfExists('schedules');
        Schema::dropIfExists('classroom_subject_teachers');
        Schema::dropIfExists('classroom_students');
        Schema::dropIfExists('classrooms');
        Schema::dropIfExists('academic_years');
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('teacher_details');
        Schema::dropIfExists('student_details');
    }
};
