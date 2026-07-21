<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Classroom;
use App\Models\AcademicYear;
use App\Models\Subject;
use App\Models\User;
use App\Models\ClassroomStudent;
use App\Models\ClassroomSubjectTeacher;
use App\Models\StudentDetail;
use App\Models\TeacherDetail;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class KelasController extends Controller
{
    private function checkRole(Request $request): void
    {
        abort_if(!$request->user() || $request->user()->role !== 'admin', 403, 'Unauthorized.');
    }

    public function index(Request $request): Response
    {
        $this->checkRole($request);

        $classrooms = Classroom::with(['academicYear', 'classroomStudents.student.studentDetail', 'classroomSubjectTeachers.subject', 'classroomSubjectTeachers.teacher'])
            ->latest()
            ->get();

        $academicYears = AcademicYear::latest()->get();
        $subjects = Subject::latest()->get();
        
        $teachers = User::where('role', 'teacher')
            ->with('teacherDetail')
            ->latest()
            ->get();

        $students = User::where('role', 'student')
            ->with('studentDetail')
            ->latest()
            ->get();

        return Inertia::render('admin/kelas', [
            'classrooms' => $classrooms,
            'academicYears' => $academicYears,
            'subjects' => $subjects,
            'teachers' => $teachers,
            'students' => $students,
        ]);
    }

    public function store(Request $request)
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
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:users,id',
        ]);

        foreach ($data['student_ids'] as $studentId) {
            $exists = ClassroomStudent::where('classroom_id', $data['classroom_id'])
                ->where('student_id', $studentId)
                ->exists();

            if (!$exists) {
                ClassroomStudent::create([
                    'classroom_id' => $data['classroom_id'],
                    'student_id' => $studentId,
                ]);
            }
        }

        return back()->with('status', 'Student enrolled successfully.');
    }

    public function unenrollStudent(Request $request, ClassroomStudent $classroomStudent)
    {
        $this->checkRole($request);

        $classroomStudent->delete();

        return back()->with('status', 'Student unenrolled successfully.');
    }

    public function assignTeacher(Request $request)
    {
        $this->checkRole($request);

        $data = $request->validate([
            'classroom_id' => 'required|exists:classrooms,id',
            'subject_ids' => 'required|array',
            'subject_ids.*' => 'exists:subjects,id',
            'teacher_ids' => 'required|array',
            'teacher_ids.*' => 'exists:users,id',
        ]);

        foreach ($data['subject_ids'] as $subjectId) {
            foreach ($data['teacher_ids'] as $teacherId) {
                $exists = ClassroomSubjectTeacher::where('classroom_id', $data['classroom_id'])
                    ->where('subject_id', $subjectId)
                    ->where('teacher_id', $teacherId)
                    ->exists();

                if (!$exists) {
                    ClassroomSubjectTeacher::create([
                        'classroom_id' => $data['classroom_id'],
                        'subject_id' => $subjectId,
                        'teacher_id' => $teacherId,
                    ]);
                }
            }
        }

        return back()->with('status', 'Teacher assigned successfully.');
    }

    public function dismissTeacher(Request $request, ClassroomSubjectTeacher $classroomSubjectTeacher)
    {
        $this->checkRole($request);

        $classroomSubjectTeacher->delete();

        return back()->with('status', 'Teacher assignment removed successfully.');
    }

    public function update(Request $request, Classroom $classroom)
    {
        $this->checkRole($request);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'academic_year_id' => 'required|exists:academic_years,id',
        ]);

        $classroom->update($data);

        return back()->with('status', 'Classroom updated successfully.');
    }

    public function destroy(Request $request, Classroom $classroom)
    {
        $this->checkRole($request);

        $classroom->delete();

        return back()->with('status', 'Classroom deleted successfully.');
    }

    public function downloadTemplate(Request $request): StreamedResponse
    {
        $this->checkRole($request);

        $years = AcademicYear::latest()->get();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="template-kelas.csv"',
        ];

        $callback = function () use ($years) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF)); // UTF-8 BOM
            fputcsv($handle, ['Nama Kelas', 'Tahun Ajaran', '', 'NIS', '', 'Kode Mapel', 'NIP'], ';');

            $activeYear = $years->first();
            $yearExample = $activeYear ? ($activeYear->code ?? 'TA2627GJ') : 'TA2627GJ';

            fputcsv($handle, ['Kelas 8A', $yearExample, '', '2024001', '', 'MAT-08', '198501012010011001'], ';');
            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        $this->checkRole($request);

        $classrooms = Classroom::with([
            'academicYear',
            'classroomStudents.student.studentDetail',
            'classroomSubjectTeachers.subject',
            'classroomSubjectTeachers.teacher.teacherDetail'
        ])->latest()->get();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="data-kelas.csv"',
        ];

        $callback = function () use ($classrooms) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF)); // UTF-8 BOM
            fputcsv($handle, ['Nama Kelas', 'Tahun Ajaran', '', 'NIS', '', 'Kode Mapel', 'NIP'], ';');

            $firstClass = true;

            foreach ($classrooms as $classroom) {
                if (!$firstClass) {
                    fputcsv($handle, ['', '', '', '', '', '', ''], ';');
                }
                $firstClass = false;

                $students = $classroom->classroomStudents;
                $subjectTeachers = $classroom->classroomSubjectTeachers;
                $maxRows = max($students->count(), $subjectTeachers->count(), 1);

                for ($i = 0; $i < $maxRows; $i++) {
                    $student = $students->get($i);
                    $subjectTeacher = $subjectTeachers->get($i);

                    fputcsv($handle, [
                        $i === 0 ? $classroom->name : '',
                        $i === 0 ? ($classroom->academicYear?->code ?? '') : '',
                        '',
                        $student?->student?->studentDetail?->nis ?? '',
                        '',
                        $subjectTeacher?->subject?->code ?? '',
                        $subjectTeacher?->teacher?->teacherDetail?->nip ?? '',
                    ], ';');
                }
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function importCsv(Request $request): \Illuminate\Http\JsonResponse
    {
        $this->checkRole($request);

        $request->validate([
            'file' => 'required|file|mimes:csv,txt,xlsx|max:2048',
        ], [
            'file.required' => 'File wajib diunggah.',
            'file.mimes'    => 'File harus berformat CSV atau XLSX.',
            'file.max'      => 'Ukuran file maksimal 2MB.',
        ]);

        $path      = $request->file('file')->getRealPath();
        $rows      = [];
        $extension = strtolower($request->file('file')->getClientOriginalExtension());

        if ($extension === 'xlsx') {
            $rows = $this->parseXlsx($path);
            if (empty($rows)) {
                return response()->json([
                    'imported' => 0,
                    'failed'   => 1,
                    'errors'   => ['File XLSX tidak valid atau kosong.'],
                ], 422);
            }
        } else {
            $handle  = fopen($path, 'r');
            $firstLine = fgets($handle);
            $delimiter = (substr_count($firstLine, ';') > substr_count($firstLine, ',')) ? ';' : ',';
            rewind($handle);

            while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
                $rows[] = $row;
            }
            fclose($handle);
        }

        $imported = 0;
        $errors  = [];
        $rowNum  = 0;
        $lastClassroom = null;

        foreach ($rows as $row) {
            $rowNum++;

            // Skip header row
            if ($rowNum === 1) {
                continue;
            }

            // Skip empty rows
            if (empty(array_filter($row))) {
                continue;
            }

            $name        = isset($row[0]) ? trim((string) $row[0]) : '';
            $ayCode      = isset($row[1]) ? trim((string) $row[1]) : '';
            $nis         = isset($row[3]) ? trim((string) $row[3]) : '';
            $subjectCode = isset($row[5]) ? trim((string) $row[5]) : '';
            $nip         = isset($row[6]) ? trim((string) $row[6]) : '';

            $classroom = null;

            if ($name !== '' && $ayCode !== '') {
                $academicYear = AcademicYear::where('code', $ayCode)->first();
                if (!$academicYear) {
                    $errors[] = "Baris {$rowNum}: Tahun Ajaran dengan kode '{$ayCode}' tidak ditemukan.";
                    continue;
                }

                // Find or create classroom
                $classroom = Classroom::firstOrCreate([
                    'name'             => $name,
                    'academic_year_id' => $academicYear->id,
                ]);
                $lastClassroom = $classroom;
            } else {
                if ($lastClassroom) {
                    $classroom = $lastClassroom;
                } else {
                    $errors[] = "Baris {$rowNum}: Nama kelas dan Kode Tahun Ajaran wajib diisi.";
                    continue;
                }
            }

            $rowHasDetails = false;
            $rowSuccess = true;

            // 1. Enroll Student (NIS)
            if ($nis !== '') {
                $rowHasDetails = true;
                $studentDetail = StudentDetail::where('nis', $nis)->first();
                if (!$studentDetail) {
                    $errors[] = "Baris {$rowNum}: Siswa dengan NIS '{$nis}' tidak ditemukan.";
                    $rowSuccess = false;
                } else {
                    ClassroomStudent::firstOrCreate([
                        'classroom_id' => $classroom->id,
                        'student_id'   => $studentDetail->user_id,
                    ]);
                }
            }

            // 2. Assign Subject Teacher (Kode Mapel & NIP)
            if ($subjectCode !== '' || $nip !== '') {
                $rowHasDetails = true;
                if ($subjectCode === '' || $nip === '') {
                    $errors[] = "Baris {$rowNum}: Kode Mapel dan NIP Guru harus diisi lengkap untuk asosiasi mata pelajaran.";
                    $rowSuccess = false;
                } else {
                    $subject = Subject::where('code', $subjectCode)->first();
                    $teacherDetail = TeacherDetail::where('nip', $nip)->first();

                    if (!$subject) {
                        $errors[] = "Baris {$rowNum}: Mata pelajaran dengan kode '{$subjectCode}' tidak ditemukan.";
                        $rowSuccess = false;
                    }
                    if (!$teacherDetail) {
                        $errors[] = "Baris {$rowNum}: Guru dengan NIP '{$nip}' tidak ditemukan.";
                        $rowSuccess = false;
                    }

                    if ($subject && $teacherDetail) {
                        ClassroomSubjectTeacher::firstOrCreate([
                            'classroom_id' => $classroom->id,
                            'subject_id'   => $subject->id,
                            'teacher_id'   => $teacherDetail->user_id,
                        ]);
                    }
                }
            }

            if ($rowSuccess) {
                $imported++;
            }
        }

        return response()->json([
            'imported' => $imported,
            'failed'   => count($errors),
            'errors'   => $errors,
        ]);
    }

    private function parseXlsx(string $path): array
    {
        $zip = new \ZipArchive();
        if ($zip->open($path) !== true) {
            return [];
        }

        $sharedStrings = [];
        $sharedStringsXml = $zip->getFromName('xl/sharedStrings.xml');
        if ($sharedStringsXml) {
            $sharedStringsXml = $this->cleanXmlNamespaces($sharedStringsXml);
            $xml = simplexml_load_string($sharedStringsXml);
            if ($xml) {
                foreach ($xml->si as $si) {
                    if (isset($si->t)) {
                        $sharedStrings[] = (string) $si->t;
                    } elseif (isset($si->r)) {
                        $text = '';
                        foreach ($si->r as $r) {
                            $text .= (string) $r->t;
                        }
                        $sharedStrings[] = $text;
                    } else {
                        $sharedStrings[] = '';
                    }
                }
            }
        }

        $rows = [];
        $sheetXml = $zip->getFromName('xl/worksheets/sheet1.xml');
        if ($sheetXml) {
            $sheetXml = $this->cleanXmlNamespaces($sheetXml);
            $xml = simplexml_load_string($sheetXml);
            if ($xml && isset($xml->sheetData)) {
                foreach ($xml->sheetData->row as $row) {
                    $rowData = [];
                    foreach ($row->c as $c) {
                        $attr = $c->attributes();
                        $rAttr = (string) $attr['r'];
                        $tAttr = (string) $attr['t'];

                        preg_match('/^[A-Z]+/', $rAttr, $matches);
                        $colLetter = $matches[0] ?? 'A';

                        $colIndex = 0;
                        $len = strlen($colLetter);
                        for ($i = 0; $i < $len; $i++) {
                            $colIndex = $colIndex * 26 + (ord($colLetter[$i]) - 64);
                        }
                        $colIndex--;

                        $val = '';
                        if (isset($c->v)) {
                            $val = (string) $c->v;
                            if ($tAttr === 's') {
                                $val = $sharedStrings[(int) $val] ?? '';
                            }
                        }

                        $rowData[$colIndex] = $val;
                    }

                    $maxIndex = count($rowData) > 0 ? max(array_keys($rowData)) : -1;
                    for ($i = 0; $i <= $maxIndex; $i++) {
                        if (!isset($rowData[$i])) {
                            $rowData[$i] = '';
                        }
                    }
                    ksort($rowData);

                    $rows[] = $rowData;
                }
            }
        }

        $zip->close();
        return $rows;
    }

    private function cleanXmlNamespaces(string $xmlString): string
    {
        $xmlString = preg_replace('/xmlns[^=]*="[^"]*"/i', '', $xmlString);
        $xmlString = preg_replace('/<([a-zA-Z0-9_]+):/', '<', $xmlString);
        $xmlString = preg_replace('/<\/([a-zA-Z0-9_]+):/', '</', $xmlString);
        $xmlString = preg_replace('/\s([a-zA-Z0-9_]+):([a-zA-Z0-9_]+)=/i', ' $2=', $xmlString);
        return $xmlString;
    }
}
