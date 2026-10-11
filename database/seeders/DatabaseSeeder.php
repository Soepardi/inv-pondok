<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Institution;
use App\Models\Item;
use App\Models\Loan;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Buat admin global (tanpa institution_id)
        User::firstOrCreate(
            ['email' => 'akhiyat@gmail.com'],
            [
                'name' => 'Supardi',
                'password' => Hash::make('1234567890'),
                'role' => 'admin',
                'institution_id' => null,
                'email_verified_at' => Carbon::now(),
            ]
        );

        // Buat user biasa
        User::firstOrCreate(
            ['email' => 'sultan@gmail.com'],
            [
                'name' => 'sultan',
                'password' => Hash::make('password'),
                'role' => 'user',
                'institution_id' => null,
                'email_verified_at' => Carbon::now(),
            ]
        );

        // Buat instansi
        $institution = Institution::firstOrCreate(
            ['code' => 'PTM'],
            [
                'name' => 'Pesantren Teknologi Majapahit',
                'description' => 'Pesantren Teknologi Majapahit',
            ]
        );

        // Buat Institution Admin (contoh)
        User::firstOrCreate(
            ['email' => 'admin.ptm@gmail.com'],
            [
                'name' => 'Admin PTM',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'institution_id' => $institution->id,
                'email_verified_at' => Carbon::now(),
            ]
        );

        // Buat barang
        Item::create([
            'name' => 'Laptop Lenovo Thinkpad',
            'item_code' => 'LNP-001',
            'description' => 'Laptop untuk keperluan administrasi',
            'stock' => 5, // Stok total
            'price' => 8500000,
            'location' => 'Ruang Tata Usaha',
            'status' => 'baik',
            'condition' => 'tersedia',
            'institution_id' => $institution->id,
        ]);

        Item::create([
            'name' => 'Proyektor Epson',
            'item_code' => 'PRJ-001',
            'description' => 'Digunakan untuk presentasi di kelas',
            'stock' => 2,
            'price' => 4500000,
            'location' => 'Aula',
            'status' => 'baik',
            'condition' => 'tersedia',
            'institution_id' => $institution->id,
        ]);

        Item::create([
            'name' => 'Meja Belajar',
            'item_code' => 'MJB-001',
            'description' => 'Meja untuk santri kelas 10',
            'stock' => 20,
            'price' => 350000,
            'location' => 'Kelas 10A',
            'status' => 'baik',
            'condition' => 'tersedia',
            'institution_id' => $institution->id,
        ]);

        // Buat loan dengan due_date, notes, dan stock
        Loan::create([
            'user_id' => 2, // user 'sultan'
            'item_id' => 1, // Laptop Lenovo
            'loan_date' => Carbon::now()->subDays(5),
            'due_date' => Carbon::now()->addDays(2),
            'status' => 'approved',
            'stock' => 1,
            'notes' => 'Untuk administrasi TU',
        ]);

        Loan::create([
            'user_id' => 2,
            'item_id' => 2, // Proyektor Epson
            'loan_date' => Carbon::now()->subDays(10),
            'due_date' => Carbon::now()->subDays(1), // lewat jatuh tempo
            'status' => 'approved',
            'stock' => 1,
            'notes' => 'Dipakai di kelas 10A',
        ]);

        // Decrement item stock manually to reflect loans?
        // In a seeder, if we want consistency, we should:
        // Item 1 (Laptop): Initial 5, Loaned 1 -> Should be 4 in DB?
        // Or we assume 'stock' in Item is "Current Available Stock".
        // Let's manually update them to match "reality".
        Item::find(1)->decrement('stock', 1);
        Item::find(2)->decrement('stock', 1);
    }
}
