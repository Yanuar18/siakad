<?php

use App\Http\Controllers\Siswa\DashboardController;
use App\Http\Controllers\Siswa\JadwalController;
use App\Http\Controllers\Siswa\AbsenController;
use App\Http\Controllers\Siswa\NilaiController;
use App\Http\Controllers\Siswa\ProfileController as SiswaProfileController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Guru\DashboardController as GuruDashboardController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login');

Route::middleware(['auth'])->group(function () {

        Route::prefix('siswa')->group(function () {
            Route::get('dashboard', DashboardController::class)->name('siswa.dashboard');
            Route::get('jadwal', JadwalController::class)->name('siswa.jadwal');
            Route::get('absen', AbsenController::class)->name('siswa.absen');
            Route::get('nilai', NilaiController::class)->name('siswa.nilai');
            Route::get('profile', [SiswaProfileController::class, 'index'])->name('siswa.profile.index');
            Route::post('profile', [SiswaProfileController::class, 'update'])->name('siswa.profile.update');
            Route::put('profile/password', [SiswaProfileController::class, 'updatePassword'])->name('siswa.profile.password');
        });

        // Admin dashboard & actions
        Route::prefix('admin')->group(function () {
            Route::get('dashboard', AdminDashboardController::class)->name('admin.dashboard');

            // Profile CRUD
            Route::get('profile', [App\Http\Controllers\Admin\ProfileController::class, 'edit'])->name('admin.profile.edit');
            Route::patch('profile', [App\Http\Controllers\Admin\ProfileController::class, 'update'])->name('admin.profile.update');
            Route::post('profile/admins', [App\Http\Controllers\Admin\ProfileController::class, 'storeAdmin'])->name('admin.profile.admins.store');
            Route::patch('profile/admins/{user}', [App\Http\Controllers\Admin\ProfileController::class, 'updateAdmin'])->name('admin.profile.admins.update');
            Route::delete('profile/admins/{user}', [App\Http\Controllers\Admin\ProfileController::class, 'destroyAdmin'])->name('admin.profile.admins.destroy');

            // Guru CRUD
            Route::get('guru/export', [App\Http\Controllers\Admin\GuruController::class, 'exportCsv'])->name('admin.guru.export');
            Route::get('guru/template', [App\Http\Controllers\Admin\GuruController::class, 'downloadTemplate'])->name('admin.guru.template');
            Route::post('guru/import', [App\Http\Controllers\Admin\GuruController::class, 'importCsv'])->name('admin.guru.import');
            Route::get('guru', [App\Http\Controllers\Admin\GuruController::class, 'index'])->name('admin.guru.index');
            Route::post('guru', [App\Http\Controllers\Admin\GuruController::class, 'store'])->name('admin.guru.store');
            Route::patch('guru/{user}', [App\Http\Controllers\Admin\GuruController::class, 'update'])->name('admin.guru.update');
            Route::delete('guru/{user}', [App\Http\Controllers\Admin\GuruController::class, 'destroy'])->name('admin.guru.destroy');

            // Siswa CRUD
            Route::get('siswa/export', [App\Http\Controllers\Admin\SiswaController::class, 'exportCsv'])->name('admin.siswa.export');
            Route::get('siswa/template', [App\Http\Controllers\Admin\SiswaController::class, 'downloadTemplate'])->name('admin.siswa.template');
            Route::post('siswa/import', [App\Http\Controllers\Admin\SiswaController::class, 'importCsv'])->name('admin.siswa.import');
            Route::get('siswa', [App\Http\Controllers\Admin\SiswaController::class, 'index'])->name('admin.siswa.index');
            Route::post('siswa', [App\Http\Controllers\Admin\SiswaController::class, 'store'])->name('admin.siswa.store');
            Route::patch('siswa/{user}', [App\Http\Controllers\Admin\SiswaController::class, 'update'])->name('admin.siswa.update');
            Route::delete('siswa/{user}', [App\Http\Controllers\Admin\SiswaController::class, 'destroy'])->name('admin.siswa.destroy');

            // Mapel CRUD
            Route::get('mapel', [App\Http\Controllers\Admin\MapelController::class, 'index'])->name('admin.mapel.index');
            Route::post('mapel', [App\Http\Controllers\Admin\MapelController::class, 'store'])->name('admin.mapel.store');
            Route::patch('mapel/{subject}', [App\Http\Controllers\Admin\MapelController::class, 'update'])->name('admin.mapel.update');
            Route::delete('mapel/{subject}', [App\Http\Controllers\Admin\MapelController::class, 'destroy'])->name('admin.mapel.destroy');

            // Tahun Ajaran CRUD
            Route::get('tahun-ajaran', [App\Http\Controllers\Admin\TahunAjaranController::class, 'index'])->name('admin.tahun-ajaran.index');
            Route::post('tahun-ajaran', [App\Http\Controllers\Admin\TahunAjaranController::class, 'store'])->name('admin.tahun-ajaran.store');
            Route::patch('tahun-ajaran/{academicYear}', [App\Http\Controllers\Admin\TahunAjaranController::class, 'update'])->name('admin.tahun-ajaran.update');
            Route::post('tahun-ajaran/{academicYear}/toggle', [App\Http\Controllers\Admin\TahunAjaranController::class, 'toggleActive'])->name('admin.tahun-ajaran.toggle');
            Route::delete('tahun-ajaran/{academicYear}', [App\Http\Controllers\Admin\TahunAjaranController::class, 'destroy'])->name('admin.tahun-ajaran.destroy');

            // Kelas CRUD
            Route::get('kelas/export', [App\Http\Controllers\Admin\KelasController::class, 'exportCsv'])->name('admin.kelas.export');
            Route::get('kelas/template', [App\Http\Controllers\Admin\KelasController::class, 'downloadTemplate'])->name('admin.kelas.template');
            Route::post('kelas/import', [App\Http\Controllers\Admin\KelasController::class, 'importCsv'])->name('admin.kelas.import');
            Route::get('kelas', [App\Http\Controllers\Admin\KelasController::class, 'index'])->name('admin.kelas.index');
            Route::post('kelas', [App\Http\Controllers\Admin\KelasController::class, 'store'])->name('admin.kelas.store');
            Route::patch('kelas/{classroom}', [App\Http\Controllers\Admin\KelasController::class, 'update'])->name('admin.kelas.update');
            Route::post('kelas/enroll', [App\Http\Controllers\Admin\KelasController::class, 'enrollStudent'])->name('admin.kelas.enroll');
            Route::post('kelas/assign-teacher', [App\Http\Controllers\Admin\KelasController::class, 'assignTeacher'])->name('admin.kelas.assign-teacher');
            Route::delete('kelas/enroll/{classroomStudent}', [App\Http\Controllers\Admin\KelasController::class, 'unenrollStudent'])->name('admin.kelas.unenroll');
            Route::delete('kelas/assign-teacher/{classroomSubjectTeacher}', [App\Http\Controllers\Admin\KelasController::class, 'dismissTeacher'])->name('admin.kelas.dismiss-teacher');
            Route::delete('kelas/{classroom}', [App\Http\Controllers\Admin\KelasController::class, 'destroy'])->name('admin.kelas.destroy');
        });

        // Guru dashboard & actions
        Route::prefix('guru')->group(function () {
            Route::get('dashboard', GuruDashboardController::class)->name('guru.dashboard');
            Route::post('schedules', [GuruDashboardController::class, 'createSchedule'])->name('guru.schedules.create');
            Route::post('attendances', [GuruDashboardController::class, 'storeAttendance'])->name('guru.attendances.store');
            Route::post('report-cards', [GuruDashboardController::class, 'storeReportCard'])->name('guru.report-cards.store');

            // Penjadwalan CRUD
            Route::get('penjadwalan/export', [\App\Http\Controllers\Guru\PenjadwalanController::class, 'exportCsv'])->name('guru.penjadwalan.export');
            Route::get('penjadwalan/template', [\App\Http\Controllers\Guru\PenjadwalanController::class, 'downloadTemplate'])->name('guru.penjadwalan.template');
            Route::post('penjadwalan/import', [\App\Http\Controllers\Guru\PenjadwalanController::class, 'importCsv'])->name('guru.penjadwalan.import');
            Route::get('penjadwalan', [\App\Http\Controllers\Guru\PenjadwalanController::class, 'index'])->name('guru.penjadwalan.index');
            Route::post('penjadwalan', [\App\Http\Controllers\Guru\PenjadwalanController::class, 'store'])->name('guru.penjadwalan.store');
            Route::patch('penjadwalan/{schedule}', [\App\Http\Controllers\Guru\PenjadwalanController::class, 'update'])->name('guru.penjadwalan.update');
            Route::delete('penjadwalan/{schedule}', [\App\Http\Controllers\Guru\PenjadwalanController::class, 'destroy'])->name('guru.penjadwalan.destroy');

            // Absensi CRUD
            Route::get('absen', [\App\Http\Controllers\Guru\AbsensiController::class, 'index'])->name('guru.absen.index');
            Route::post('absen', [\App\Http\Controllers\Guru\AbsensiController::class, 'store'])->name('guru.absen.store');

            // Penilaian CRUD
            Route::get('penilaian/export', [\App\Http\Controllers\Guru\PenilaianController::class, 'exportCsv'])->name('guru.penilaian.export');
            Route::get('penilaian/template', [\App\Http\Controllers\Guru\PenilaianController::class, 'downloadTemplate'])->name('guru.penilaian.template');
            Route::post('penilaian/import', [\App\Http\Controllers\Guru\PenilaianController::class, 'importCsv'])->name('guru.penilaian.import');
            Route::get('penilaian', [\App\Http\Controllers\Guru\PenilaianController::class, 'index'])->name('guru.penilaian.index');
            Route::post('penilaian', [\App\Http\Controllers\Guru\PenilaianController::class, 'store'])->name('guru.penilaian.store');

            // Profile CRUD
            Route::get('profile', [\App\Http\Controllers\Guru\ProfileController::class, 'index'])->name('guru.profile.index');
            Route::post('profile', [\App\Http\Controllers\Guru\ProfileController::class, 'update'])->name('guru.profile.update');
            Route::put('profile/password', [\App\Http\Controllers\Guru\ProfileController::class, 'updatePassword'])->name('guru.profile.password');
        });
    });

require __DIR__.'/settings.php';

