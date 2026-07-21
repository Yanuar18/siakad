<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TahunAjaranController extends Controller
{
    private function checkRole(Request $request): void
    {
        abort_if(!$request->user() || $request->user()->role !== 'admin', 403, 'Unauthorized.');
    }

    public function index(Request $request): Response
    {
        $this->checkRole($request);

        $academicYears = AcademicYear::latest()->get();

        return Inertia::render('admin/tahun-ajaran', [
            'academicYears' => $academicYears,
        ]);
    }

    public function store(Request $request)
    {
        $this->checkRole($request);

        $data = $request->validate([
            'code' => 'required|string|max:50|unique:academic_years,code',
            'year' => 'required|string|max:50',
            'semester' => 'required|string|in:odd,even',
            'is_active' => 'required|boolean',
        ]);

        if ($data['is_active']) {
            AcademicYear::query()->update(['is_active' => false]);
        }

        AcademicYear::create($data);

        return back()->with('status', 'Academic period registered.');
    }

    public function update(Request $request, AcademicYear $academicYear)
    {
        $this->checkRole($request);

        $data = $request->validate([
            'code' => 'required|string|max:50|unique:academic_years,code,' . $academicYear->id,
            'year' => 'required|string|max:50',
            'semester' => 'required|string|in:odd,even',
            'is_active' => 'required|boolean',
        ]);

        $statusChanged = (bool) $data['is_active'] !== (bool) $academicYear->is_active;

        if ($statusChanged) {
            if ($data['is_active']) {
                AcademicYear::query()->update(['is_active' => false]);
            }
        } else {
            $data['is_active'] = $academicYear->is_active;
        }

        $academicYear->update($data);

        return back()->with('status', 'Academic period updated.');
    }

    public function toggleActive(Request $request, AcademicYear $academicYear)
    {
        $this->checkRole($request);

        AcademicYear::query()->update(['is_active' => false]);
        $academicYear->update(['is_active' => true]);

        return back()->with('status', 'Active academic year switched.');
    }

    public function destroy(Request $request, AcademicYear $academicYear)
    {
        $this->checkRole($request);

        $academicYear->delete();

        return back()->with('status', 'Academic period deleted.');
    }
}
