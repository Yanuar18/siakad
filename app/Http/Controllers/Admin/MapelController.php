<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MapelController extends Controller
{
    private function checkRole(Request $request): void
    {
        abort_if(!$request->user() || $request->user()->role !== 'admin', 403, 'Unauthorized.');
    }

    public function index(Request $request): Response
    {
        $this->checkRole($request);

        $subjects = Subject::latest()->get();

        return Inertia::render('admin/mapel', [
            'subjects' => $subjects,
        ]);
    }

    public function store(Request $request)
    {
        $this->checkRole($request);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:subjects',
        ]);

        Subject::create($data);

        return back()->with('status', 'Subject created successfully.');
    }

    public function update(Request $request, Subject $subject)
    {
        $this->checkRole($request);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'code' => ['required', 'string', 'max:50', Rule::unique('subjects')->ignore($subject->id)],
        ]);

        $subject->update($data);

        return back()->with('status', 'Subject updated successfully.');
    }

    public function destroy(Request $request, Subject $subject)
    {
        $this->checkRole($request);

        $subject->delete();

        return back()->with('status', 'Subject deleted successfully.');
    }
}
