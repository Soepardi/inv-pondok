<?php

namespace App\Http\Controllers;

use App\Models\Institution;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InstitutionController extends Controller
{
    //Tampilkan daftar instansi
    public function index()
    {
        $institutions = Institution::all();

        return Inertia::render('Institutions/Index', [
            'institutions' => $institutions,
        ]);
    }

    //Form tambah instansi
    public function create()
    {
        return Inertia::render('Institutions/Create');
    }

    //Simpan instansi baru
    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'code'        => 'required|string|max:50|unique:institutions,code',
            'description' => 'nullable|string',
        ]);

        Institution::create($request->only('name', 'code', 'description'));

        return redirect()->route('institutions.index')->with('success', 'Instansi berhasil ditambahkan');
    }

    //Form edit instansi
    public function edit(Institution $institution)
    {
        return Inertia::render('Institutions/Edit', [
            'institution' => $institution,
        ]);
    }

    //Update instansi
    public function update(Request $request, Institution $institution)
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'code'        => 'required|string|max:50|unique:institutions,code,' . $institution->id,
            'description' => 'nullable|string',
        ]);

        $institution->update($request->only('name', 'code', 'description'));

        return redirect()->route('institutions.index')->with('success', 'Instansi berhasil diperbarui');
    }

    //Hapus instansi
    public function destroy(Institution $institution)
    {
        $institution->delete();

        return redirect()->route('institutions.index')->with('success', 'Instansi berhasil dihapus');
    }
}
