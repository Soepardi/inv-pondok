<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Institution;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ItemController extends Controller
{
    // Tampilkan daftar item
    public function index()
    {
        $items = Item::with('institution')->get();
        $institutions = Institution::all();

        return Inertia::render('Items/Index', [
            'items' => $items,
            'institutions' => $institutions,
        ]);
    }

    // Form tambah item
    public function create()
    {
        $institutions = Institution::all();
        return Inertia::render('Items/Create', [
            'institutions' => $institutions,
        ]);
    }

    // Simpan item baru
    public function store(Request $request)
    {
        $request->validate([
            'number_code'    => 'required|string',
            'name'           => 'required|string|max:255',
            'description'    => 'nullable|string',
            'price'          => 'required|numeric',
            'stock'          => 'nullable|integer',
            'location'       => 'required|string|max:255',
            'status'         => 'required|in:baik,rusak,diperbaiki',
            'condition'      => 'required|in:tersedia,dipinjam,hilang',
            'institution_id' => 'required|exists:institutions,id',
            'photo'          => 'nullable|image|max:2048',
        ]);

        $institution = Institution::findOrFail($request->institution_id);

        $data = $request->only([
            'name', 'description', 'price', 'stock', 'location', 'status', 'condition', 'institution_id'
        ]);

        $data['item_code'] = $institution->code . '-' . $request->number_code;

        if ($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')->store('items', 'public');
        }

        Item::create($data);

        return redirect()->route('items.index')->with('success', 'Item berhasil ditambahkan');
    }

    // Form edit item
    public function edit(Item $item)
    {
        $institutions = Institution::all();
        return Inertia::render('Items/Edit', [
            'item' => $item,
            'institutions' => $institutions,
        ]);
    }

    // Update item - FIXED VERSION
    public function update(Request $request, Item $item)
    {
        //Log::info('🎯 === UPDATE ITEM START ===');
        //Log::info('📦 Request Data:', $request->all());
        //Log::info('📁 Files:', $request->allFiles());
        //Log::info('🔍 Item ID: ' . $item->id);
            $request->merge([
        'price' => $request->price ? (float) $request->price : 0,
        'stock' => $request->stock ? (int) $request->stock : 0,
    ]);
        // Validasi input
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'location' => 'required|string|max:255',
            'status' => 'required|in:baik,rusak,diperbaiki',
            'condition' => 'required|in:tersedia,dipinjam,hilang',
            'institution_id' => 'required|exists:institutions,id',
            'photo' => 'nullable|image|max:2048',
        ]);

        Log::info('✅ Validation passed:', $validated);

        // Update data - manual assignment untuk memastikan
        $item->name = $validated['name'];
        $item->description = $validated['description'] ?? null;
        $item->price = $validated['price'];
        $item->stock = $validated['stock'] ?? 0;
        $item->location = $validated['location'];
        $item->status = $validated['status'];
        $item->condition = $validated['condition'];
        $item->institution_id = $validated['institution_id'];

        // Handle file upload
        if ($request->hasFile('photo')) {
            //Log::info('🖼️ Processing photo upload: ' . $request->file('photo')->getClientOriginalName());
            
            // Hapus foto lama jika ada
            if ($item->photo && \Storage::disk('public')->exists($item->photo)) {
                \Storage::disk('public')->delete($item->photo);
            }
            
            $item->photo = $request->file('photo')->store('items', 'public');
            Log::info('📸 Photo stored at: ' . $item->photo);
        }

        $saved = $item->save();

        //Log::info('💾 Save result: ' . ($saved ? 'SUCCESS' : 'FAILED'));
        
        if ($saved) {
            $item->refresh();
            Log::info('🆕 Updated item data:', $item->toArray());
            Log::info('🎉 === UPDATE SUCCESS ===');
            
            return redirect()->route('items.index')
                            ->with('success', 'Item berhasil diupdate');
        }

        //Log::error('❌ === UPDATE FAILED ===');
        return back()->with('error', 'Gagal mengupdate item');
    }

    // Hapus item
    public function destroy(Item $item)
    {
        $item->delete();
        return redirect()->route('items.index')->with('success', 'Item berhasil dihapus');
    }

    // Tampilkan detail item (optional)
    public function show(Item $item)
    {
        return Inertia::render('Items/Show', [
            'item' => $item
        ]);
    }
}