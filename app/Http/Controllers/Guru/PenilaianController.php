<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\ClassroomStudent;
use App\Models\ClassroomSubjectTeacher;
use App\Models\ReportCard;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PenilaianController extends Controller
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

        $students = [];
        $reportCards = [];

        if ($selectedClassId) {
            // Verify ownership
            $assignedClass = $assignedClasses->where('id', $selectedClassId)->first();
            if ($assignedClass) {
                // Get classroom students
                $students = ClassroomStudent::with('student.studentDetail')
                    ->where('classroom_id', $assignedClass->classroom_id)
                    ->get();

                // Get recorded grades / report cards
                $reportCards = ReportCard::where('classroom_subject_teacher_id', $selectedClassId)
                    ->get()
                    ->keyBy('classroom_student_id');
            }
        }

        $assignedIds = $assignedClasses->pluck('id');

        $history = ReportCard::with(['classroomStudent.student.studentDetail', 'classroomSubjectTeacher.classroom.academicYear', 'classroomSubjectTeacher.subject'])
            ->whereIn('classroom_subject_teacher_id', $assignedIds)
            ->get();

        return Inertia::render('guru/penilaian', [
            'assignedClasses' => $assignedClasses,
            'selectedClassId' => $selectedClassId ? (int) $selectedClassId : null,
            'students' => $students,
            'reportCards' => $reportCards,
            'history' => $history,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->checkRole($request);

        $data = $request->validate([
            'classroom_subject_teacher_id' => 'required|exists:classroom_subject_teachers,id',
            'scores' => 'required|array',
            'scores.*' => 'nullable|integer|min:0|max:100',
            'grades' => 'nullable|array',
            'notes' => 'nullable|array',
        ]);

        // Verify ownership
        ClassroomSubjectTeacher::where('id', $data['classroom_subject_teacher_id'])
            ->where('teacher_id', $request->user()->id)
            ->firstOrFail();

        foreach ($data['scores'] as $classroomStudentId => $score) {
            // If score is empty/null, we skip or don't save
            if ($score === null || $score === '') {
                continue;
            }

            $grade = $request->input("grades.{$classroomStudentId}");

            // Auto calculate grade if empty
            if (empty($grade)) {
                if ($score >= 85) {
                    $grade = 'A';
                } elseif ($score >= 75) {
                    $grade = 'B';
                } elseif ($score >= 60) {
                    $grade = 'C';
                } elseif ($score >= 50) {
                    $grade = 'D';
                } else {
                    $grade = 'E';
                }
            }

            ReportCard::updateOrCreate(
                [
                    'classroom_student_id' => $classroomStudentId,
                    'classroom_subject_teacher_id' => $data['classroom_subject_teacher_id'],
                ],
                [
                    'score' => $score,
                    'grade' => $grade,
                    'notes' => $request->input("notes.{$classroomStudentId}"),
                ]
            );
        }

        return back()->with('status', 'Penilaian siswa berhasil disimpan.');
    }

    public function downloadTemplate(Request $request): StreamedResponse
    {
        $this->checkRole($request);

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="template-penilaian.csv"',
        ];

        $callback = function () {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF)); // UTF-8 BOM
            fputcsv($handle, ['Nama Kelas', 'Tahun Ajaran', 'Kode Mapel', 'NIS', 'Nilai', 'Catatan'], ';');

            // 1 example row (example data, not actual database records)
            fputcsv($handle, [
                'Kelas 7A',
                '25261',
                'INF-07',
                '1234567890',
                '85',
                'Sangat Baik'
            ], ';');

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function formatAcademicYearCode(\App\Models\AcademicYear $ay): string
    {
        if (preg_match('/20(\d{2})\/20(\d{2})/', $ay->year, $matches)) {
            $sem = ($ay->semester === 'odd') ? '1' : '2';
            return $matches[1] . $matches[2] . $sem;
        }
        return $ay->code ?? '';
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        $this->checkRole($request);
        $teacher = $request->user();

        // Validate ids
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:classroom_subject_teachers,id',
        ]);

        $ids = $request->input('ids');

        // Fetch selected classroom subject teachers
        $assignedClasses = ClassroomSubjectTeacher::with(['classroom.academicYear', 'subject', 'classroom.classroomStudents.student.studentDetail'])
            ->whereIn('id', $ids)
            ->where('teacher_id', $teacher->id)
            ->get();

        if ($assignedClasses->isEmpty()) {
            abort(404, 'No assigned classes found.');
        }

        // Build filename
        // 1. Get class names
        $classNames = $assignedClasses->map(fn($ac) => $ac->classroom->name)->unique()->toArray();
        // 2. Get academic period string from the first assigned class in 26271 format
        $firstClass = $assignedClasses->first();
        $periodStr = 'active';
        if ($firstClass && $firstClass->classroom && $firstClass->classroom->academicYear) {
            $periodStr = $this->formatAcademicYearCode($firstClass->classroom->academicYear);
        }

        // 3. Get subject name
        $subjectName = $firstClass ? strtolower(str_replace(' ', '', $firstClass->subject->name)) : 'mapel';

        // 4. Construct filename
        $totalAssigned = ClassroomSubjectTeacher::where('teacher_id', $teacher->id)->count();
        if (count($ids) === $totalAssigned) {
            $filename = "data-penilaian_semuakelas-TA{$periodStr}_{$subjectName}.csv";
        } elseif (count($classNames) === 1) {
            $filename = "data-penilaian_{$classNames[0]}-TA{$periodStr}_{$subjectName}.csv";
        } else {
            $classNamesStr = implode('_', $classNames);
            $filename = "data-penilaian_{$classNamesStr}-TA{$periodStr}_{$subjectName}.csv";
        }

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        // Fetch report cards for the selected assignments
        $reportCards = ReportCard::whereIn('classroom_subject_teacher_id', $ids)
            ->get()
            ->groupBy(fn($rc) => $rc->classroom_student_id . '_' . $rc->classroom_subject_teacher_id);

        $callback = function () use ($assignedClasses, $reportCards) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF)); // UTF-8 BOM
            fputcsv($handle, ['Nama Kelas', 'Tahun Ajaran', 'Kode Mapel', 'NIS', 'Nilai', 'Catatan'], ';');

            $showSpace = $assignedClasses->count() > 1;
            $first = true;

            foreach ($assignedClasses as $ac) {
                if (!$first && $showSpace) {
                    // Add 1 blank row
                    fputcsv($handle, ['', '', '', '', '', ''], ';');
                }
                $first = false;

                foreach ($ac->classroom->classroomStudents as $cs) {
                    $key = $cs->id . '_' . $ac->id;
                    $rc = isset($reportCards[$key]) ? $reportCards[$key]->first() : null;

                    fputcsv($handle, [
                        $ac->classroom->name,
                        $this->formatAcademicYearCode($ac->classroom->academicYear),
                        $ac->subject->code,
                        $cs->student->studentDetail?->nis ?? '',
                        $rc ? $rc->score : '',
                        $rc ? ($rc->notes ?? '') : ''
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
        $teacher = $request->user();

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

            $className   = isset($row[0]) ? trim((string) $row[0]) : '';
            $ayCode      = isset($row[1]) ? trim((string) $row[1]) : '';
            $subjectCode = isset($row[2]) ? trim((string) $row[2]) : '';
            $nis         = isset($row[3]) ? trim((string) $row[3]) : '';
            $scoreStr    = isset($row[4]) ? trim((string) $row[4]) : '';
            $notes       = isset($row[5]) ? trim((string) $row[5]) : '';

            // Clean NIS to format correctly
            $nis = trim((string) $nis);
            if (is_numeric($nis)) {
                $nis = (string) intval($nis);
            }

            if (!$className || !$ayCode || !$subjectCode || !$nis || $scoreStr === '') {
                $errors[] = "Baris {$rowNum}: Kolom Nama Kelas, Tahun Ajaran, Kode Mapel, NIS, dan Nilai wajib diisi.";
                continue;
            }

            $score = (int) $scoreStr;
            if ($score < 0 || $score > 100) {
                $errors[] = "Baris {$rowNum}: Nilai '{$scoreStr}' harus di antara 0 dan 100.";
                continue;
            }

            // Clean/normalize academic year code input
            $cleanAyCode = preg_replace('/[^0-9]/', '', $ayCode); // e.g. "TA26271" -> "26271"
            
            $academicYear = \App\Models\AcademicYear::where('code', $ayCode)
                ->orWhere('code', $cleanAyCode)
                ->first();
                
            if (!$academicYear) {
                // If clean code is like "26271" (5 digits) and DB code is like "202620271" (9 digits)
                if (strlen($cleanAyCode) === 5) {
                    $year1 = '20' . substr($cleanAyCode, 0, 2);
                    $year2 = '20' . substr($cleanAyCode, 2, 2);
                    $sem = substr($cleanAyCode, 4, 1);
                    $dbFormatCode = $year1 . $year2 . $sem; // "202620271"
                    
                    $academicYear = \App\Models\AcademicYear::where('code', $dbFormatCode)->first();
                }
            }

            if (!$academicYear) {
                $errors[] = "Baris {$rowNum}: Kode Tahun Ajaran '{$ayCode}' tidak ditemukan.";
                continue;
            }

            // Find classroom subject teacher relation
            $relation = ClassroomSubjectTeacher::whereHas('classroom', function ($q) use ($className, $academicYear) {
                $q->where('name', $className)->where('academic_year_id', $academicYear->id);
            })
            ->whereHas('subject', function ($q) use ($subjectCode) {
                $q->where('code', $subjectCode);
            })
            ->where('teacher_id', $teacher->id)
            ->first();

            if (!$relation) {
                $errors[] = "Baris {$rowNum}: Kelas '{$className}' dengan kode Tahun Ajaran '{$ayCode}' dan mata pelajaran '{$subjectCode}' tidak ditugaskan untuk Anda.";
                continue;
            }

            // Find classroom student
            $classroomStudent = \App\Models\ClassroomStudent::where('classroom_id', $relation->classroom_id)
                ->whereHas('student.studentDetail', function ($q) use ($nis) {
                    $q->where('nis', $nis);
                })
                ->first();

            if (!$classroomStudent) {
                $errors[] = "Baris {$rowNum}: Siswa dengan NIS '{$nis}' tidak terdaftar di kelas '{$className}'.";
                continue;
            }

            // Auto calculate letter grade
            if ($score >= 85) {
                $grade = 'A';
            } elseif ($score >= 75) {
                $grade = 'B';
            } elseif ($score >= 60) {
                $grade = 'C';
            } elseif ($score >= 50) {
                $grade = 'D';
            } else {
                $grade = 'E';
            }

            ReportCard::updateOrCreate(
                [
                    'classroom_student_id' => $classroomStudent->id,
                    'classroom_subject_teacher_id' => $relation->id,
                ],
                [
                    'score' => $score,
                    'grade' => $grade,
                    'notes' => $notes ?: null,
                ]
            );

            $imported++;
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
