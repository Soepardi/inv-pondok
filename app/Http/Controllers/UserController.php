<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Institution;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Tampilkan semua user
     */
    public function index()
    {
        if (auth()->user()->institution_id) {
            abort(403);
        }
        $users = User::latest()->get();
        $institutions = Institution::all();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'institutions' => $institutions,
        ]);
    }

    /**
     * Form tambah user
     */
    public function create()
    {
        if (auth()->user()->institution_id) {
            abort(403);
        }
        return Inertia::render('Users/Create');
    }

    /**
     * Simpan user baru
     */
    public function store(Request $request)
    {
        if (auth()->user()->institution_id) {
            abort(403);
        }
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'required|in:admin,user',
            'institution_id' => 'nullable|exists:institutions,id',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'institution_id' => $validated['role'] === 'admin' ? $validated['institution_id'] : null,
        ]);

        return redirect()->route('users.index')->with('success', 'User berhasil dibuat.');
    }

    /**
     * Form edit user
     */
    public function edit(User $user)
    {
        if (auth()->user()->institution_id) {
            abort(403);
        }
        // Not used directly if using modal, but kept for completeness
        return Inertia::render('Users/Edit', [
            'user' => $user,
        ]);
    }

    /**
     * Update user
     */
    public function update(Request $request, User $user)
    {
        if (auth()->user()->institution_id) {
            abort(403);
        }
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6|confirmed',
            'role' => 'required|in:admin,user',
            'institution_id' => 'nullable|exists:institutions,id',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'institution_id' => $validated['role'] === 'admin' ? $validated['institution_id'] : null,
        ];

        if ($validated['password']) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        return redirect()->route('users.index')->with('success', 'User berhasil diperbarui.');
    }

    /**
     * Hapus user
     */
    public function destroy(User $user)
    {
        if (auth()->user()->institution_id) {
            abort(403);
        }

        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'Anda tidak dapat menghapus akun anda sendiri.');
        }
        $user->delete();

        return redirect()->route('users.index')->with('success', 'User berhasil dihapus.');
    }
}
