<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\TeacherDetail;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class GuruController extends Controller
{
    private function checkRole(Request $request): void
    {
        abort_if(!$request->user() || $request->user()->role !== 'admin', 403, 'Unauthorized.');
    }

    public function index(Request $request): Response
    {
        $this->checkRole($request);

        $teachers = User::with('teacherDetail')
            ->where('role', 'teacher')
            ->latest()
            ->get();

        return Inertia::render('admin/guru', [
            'teachers' => $teachers,
        ]);
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $this->checkRole($request);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'nip' => 'required|string|max:50|unique:teacher_details,nip',
            'avatar' => 'nullable|image|max:2048',
        ]);

        $avatarPath = null;
        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
        }

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => 'teacher',
            'avatar' => $avatarPath,
        ]);

        TeacherDetail::create([
            'user_id' => $user->id,
            'nip' => $data['nip'],
        ]);

        return back()->with('status', 'Guru registered successfully.');
    }

    public function update(Request $request, User $user): \Illuminate\Http\RedirectResponse
    {
        $this->checkRole($request);
        abort_if($user->role !== 'teacher', 400, 'Invalid user role.');

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:6',
            'nip' => ['required', 'string', 'max:50', Rule::unique('teacher_details')->ignore($user->teacherDetail?->id)],
            'avatar' => 'nullable|image|max:2048',
        ]);

        $user->name = $data['name'];
        $user->email = $data['email'];

        if (!empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($user->avatar);
            }
            $user->avatar = $request->file('avatar')->store('avatars', 'public');
        }

        $user->save();

        if ($user->teacherDetail) {
            $user->teacherDetail->update(['nip' => $data['nip']]);
        } else {
            TeacherDetail::create([
                'user_id' => $user->id,
                'nip' => $data['nip'],
            ]);
        }

        return back()->with('status', 'Guru profile updated.');
    }

    public function destroy(Request $request, User $user): \Illuminate\Http\RedirectResponse
    {
        $this->checkRole($request);
        abort_if($user->role !== 'teacher', 400, 'Invalid user role.');

        $user->delete();

        return back()->with('status', 'Guru deleted successfully.');
    }

    public function downloadTemplate(Request $request): StreamedResponse
    {
        $this->checkRole($request);

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="template-guru.csv"',
        ];

        $callback = function () {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF)); // UTF-8 BOM for Excel
            fputcsv($handle, ['Nama Lengkap', 'Email', 'Password', 'NIP'], ';');
            fputcsv($handle, ['Contoh Guru', 'guru@sekolah.com', 'password123', '198501012010011001'], ';');
            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        $this->checkRole($request);

        $teachers = User::with('teacherDetail')
            ->where('role', 'teacher')
            ->latest()
            ->get();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="data-guru.csv"',
        ];

        $callback = function () use ($teachers) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF)); // UTF-8 BOM
            fputcsv($handle, ['Nama Lengkap', 'Email', 'NIP'], ';');
            foreach ($teachers as $teacher) {
                fputcsv($handle, [
                    $teacher->name,
                    $teacher->email,
                    $teacher->teacherDetail?->nip ?? '',
                ], ';');
            }
            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function importCsv(Request $request): JsonResponse
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
            // Auto-detect delimiter
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

            [$name, $email, $password, $nip] = array_pad($row, 4, null);

            $validator = Validator::make([
                'name'     => trim((string) $name),
                'email'    => trim((string) $email),
                'password' => trim((string) $password),
                'nip'      => trim((string) $nip),
            ], [
                'name'     => 'required|string|max:255',
                'email'    => 'required|string|email|max:255|unique:users,email',
                'password' => 'required|string|min:6',
                'nip'      => 'required|string|max:50|unique:teacher_details,nip',
            ], [
                'name.required'     => 'Nama lengkap wajib diisi.',
                'email.required'    => 'Email wajib diisi.',
                'email.email'       => 'Format email tidak valid.',
                'email.unique'      => 'Email sudah terdaftar.',
                'password.required' => 'Password wajib diisi.',
                'password.min'      => 'Password minimal 6 karakter.',
                'nip.required'      => 'NIP wajib diisi.',
                'nip.unique'        => 'NIP sudah digunakan.',
            ]);

            if ($validator->fails()) {
                $errorMessages = implode(', ', $validator->errors()->all());
                $errors[] = "Baris {$rowNum}: {$errorMessages}";
                continue;
            }

            $user = User::create([
                'name'     => trim((string) $name),
                'email'    => trim((string) $email),
                'password' => Hash::make(trim((string) $password)),
                'role'     => 'teacher',
            ]);

            TeacherDetail::create([
                'user_id' => $user->id,
                'nip'     => trim((string) $nip),
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

        // 1. Read shared strings
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

        // 2. Read worksheet
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
