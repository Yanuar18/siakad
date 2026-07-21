<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\ClassroomSubjectTeacher;
use App\Models\Schedule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PenjadwalanController extends Controller
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

        $assignedIds = $assignedClasses->pluck('id');

        $schedules = Schedule::with(['classroomSubjectTeacher.classroom.academicYear', 'classroomSubjectTeacher.subject'])
            ->whereIn('classroom_subject_teacher_id', $assignedIds)
            ->latest()
            ->get();

        return Inertia::render('guru/penjadwalan', [
            'assignedClasses' => $assignedClasses,
            'schedules' => $schedules,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->checkRole($request);

        $data = $request->validate([
            'classroom_subject_teacher_id' => 'required|exists:classroom_subject_teachers,id',
            'day' => 'required|string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'start_time' => 'required',
            'end_time' => 'required',
        ]);

        // Ensure this classroom_subject_teacher_id actually belongs to the authenticated teacher
        $relation = ClassroomSubjectTeacher::where('id', $data['classroom_subject_teacher_id'])
            ->where('teacher_id', $request->user()->id)
            ->firstOrFail();

        Schedule::create($data);

        return back()->with('status', 'Jadwal berhasil ditambahkan.');
    }

    public function update(Request $request, Schedule $schedule): RedirectResponse
    {
        $this->checkRole($request);

        // Ensure the schedule belongs to this teacher
        $relation = ClassroomSubjectTeacher::where('id', $schedule->classroom_subject_teacher_id)
            ->where('teacher_id', $request->user()->id)
            ->firstOrFail();

        $data = $request->validate([
            'classroom_subject_teacher_id' => 'required|exists:classroom_subject_teachers,id',
            'day' => 'required|string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'start_time' => 'required',
            'end_time' => 'required',
        ]);

        // Ensure the new classroom_subject_teacher_id also belongs to the teacher
        ClassroomSubjectTeacher::where('id', $data['classroom_subject_teacher_id'])
            ->where('teacher_id', $request->user()->id)
            ->firstOrFail();

        $schedule->update($data);

        return back()->with('status', 'Jadwal berhasil diperbarui.');
    }

    public function destroy(Request $request, Schedule $schedule): RedirectResponse
    {
        $this->checkRole($request);

        // Ensure the schedule belongs to this teacher
        ClassroomSubjectTeacher::where('id', $schedule->classroom_subject_teacher_id)
            ->where('teacher_id', $request->user()->id)
            ->firstOrFail();

        $schedule->delete();

        return back()->with('status', 'Jadwal berhasil dihapus.');
    }

    public function downloadTemplate(Request $request): StreamedResponse
    {
        $this->checkRole($request);

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="template-penjadwalan.csv"',
        ];

        $assignedClasses = ClassroomSubjectTeacher::with(['classroom.academicYear', 'subject'])
            ->where('teacher_id', $request->user()->id)
            ->get();

        $callback = function () use ($assignedClasses) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF)); // UTF-8 BOM
            fputcsv($handle, ['Nama Kelas', 'Tahun Ajaran', 'Kode Mapel', 'Hari', 'Jam Mulai', 'Jam Selesai'], ';');

            $first = $assignedClasses->first();
            if ($first) {
                fputcsv($handle, [
                    $first->classroom->name,
                    $first->classroom->academicYear->code ?? '',
                    $first->subject->code,
                    'Senin',
                    '07:00',
                    '08:30'
                ], ';');
            } else {
                fputcsv($handle, ['Kelas 8A', '202520261', 'MAT-08', 'Senin', '07:00', '08:30'], ';');
            }
            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        $this->checkRole($request);

        $teacher = $request->user();
        $assignedClasses = ClassroomSubjectTeacher::where('teacher_id', $teacher->id)->get();
        $assignedIds = $assignedClasses->pluck('id');

        $schedules = Schedule::with(['classroomSubjectTeacher.classroom.academicYear', 'classroomSubjectTeacher.subject'])
            ->whereIn('classroom_subject_teacher_id', $assignedIds)
            ->get();

        $activeAy = \App\Models\AcademicYear::where('is_active', true)->first();
        $periodStr = 'active';
        if ($activeAy) {
            if (preg_match('/20(\d{2})\/20(\d{2})/', $activeAy->year, $matches)) {
                $sem = ($activeAy->semester === 'odd') ? '1' : '2';
                $periodStr = $matches[1] . $matches[2] . $sem;
            }
        }
        $filename = "data-penjadwalan_TA{$periodStr}.csv";

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $dayMapIndo = [
            'monday' => 'Senin',
            'tuesday' => 'Selasa',
            'wednesday' => 'Rabu',
            'thursday' => 'Kamis',
            'friday' => 'Jumat',
            'saturday' => 'Sabtu',
            'sunday' => 'Minggu',
        ];

        $callback = function () use ($schedules, $dayMapIndo) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF)); // UTF-8 BOM
            fputcsv($handle, ['Nama Kelas', 'Tahun Ajaran', 'Kode Mapel', 'Hari', 'Jam Mulai', 'Jam Selesai'], ';');

            foreach ($schedules as $s) {
                $dayName = $dayMapIndo[strtolower($s->day)] ?? $s->day;
                fputcsv($handle, [
                    $s->classroomSubjectTeacher->classroom->name,
                    $s->classroomSubjectTeacher->classroom->academicYear->code ?? '',
                    $s->classroomSubjectTeacher->subject->code,
                    $dayName,
                    substr($s->start_time, 0, 5),
                    substr($s->end_time, 0, 5),
                ], ';');
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

        $dayMap = [
            'senin' => 'monday',
            'selasa' => 'tuesday',
            'rabu' => 'wednesday',
            'kamis' => 'thursday',
            'jumat' => 'friday',
            'sabtu' => 'saturday',
            'minggu' => 'sunday',
            'monday' => 'monday',
            'tuesday' => 'tuesday',
            'wednesday' => 'wednesday',
            'thursday' => 'thursday',
            'friday' => 'friday',
            'saturday' => 'saturday',
            'sunday' => 'sunday',
        ];

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
            $dayName     = isset($row[3]) ? trim((string) $row[3]) : '';
            $startTime   = isset($row[4]) ? trim((string) $row[4]) : '';
            $endTime     = isset($row[5]) ? trim((string) $row[5]) : '';

            // Normalize Excel time formats
            if (is_numeric($startTime) && floatval($startTime) > 0 && floatval($startTime) < 1) {
                $totalSeconds = (int) round(floatval($startTime) * 86400);
                $hours = (int) floor($totalSeconds / 3600);
                $minutes = (int) floor(($totalSeconds % 3600) / 60);
                $startTime = sprintf('%02d:%02d', $hours, $minutes);
            }
            if (is_numeric($endTime) && floatval($endTime) > 0 && floatval($endTime) < 1) {
                $totalSeconds = (int) round(floatval($endTime) * 86400);
                $hours = (int) floor($totalSeconds / 3600);
                $minutes = (int) floor(($totalSeconds % 3600) / 60);
                $endTime = sprintf('%02d:%02d', $hours, $minutes);
            }

            // Clean text format with dot delimiter or seconds
            $startTime = str_replace('.', ':', $startTime);
            $endTime = str_replace('.', ':', $endTime);
            if (strlen($startTime) > 5) {
                $startTime = substr($startTime, 0, 5);
            }
            if (strlen($endTime) > 5) {
                $endTime = substr($endTime, 0, 5);
            }

            if (!$className || !$ayCode || !$subjectCode || !$dayName || !$startTime || !$endTime) {
                $errors[] = "Baris {$rowNum}: Seluruh kolom wajib diisi.";
                continue;
            }

            // Find academic year
            $academicYear = \App\Models\AcademicYear::where('code', $ayCode)->first();
            if (!$academicYear) {
                $errors[] = "Baris {$rowNum}: Kode Tahun Ajaran '{$ayCode}' tidak ditemukan.";
                continue;
            }

            $dayLower = strtolower($dayName);
            if (!isset($dayMap[$dayLower])) {
                $errors[] = "Baris {$rowNum}: Hari '{$dayName}' tidak valid.";
                continue;
            }
            $dayValue = $dayMap[$dayLower];

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

            Schedule::create([
                'classroom_subject_teacher_id' => $relation->id,
                'day' => $dayValue,
                'start_time' => $startTime,
                'end_time' => $endTime,
            ]);

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
