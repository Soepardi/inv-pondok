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
        // Buat admin
        User::create([
            'name' => 'Supardi',
            'email' => 'akhiyat@gmail.com',
            'password' => Hash::make('1234567890'),
            'role' => 'admin',
        ]);

        // Buat user biasa
        User::create([
            'name' => 'sultan',
            'email' => 'sultan@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'user',
        ]);

        // Buat instansi
        $institution = Institution::create([
            'name' => 'Pesantren Teknologi Majapahit',
            'code' => 'PTM',
            'description' => 'Pesantren Teknologi Majapahit',
        ]);

        // Buat barang
        Item::create([
            'name' => 'Laptop Lenovo Thinkpad',
            'description' => 'Laptop untuk keperluan administrasi',
            'stock' => 1,
            'price' => 8500000,
            'location' => 'Ruang Tata Usaha',
            'status' => 'baik',
            'condition' => 'tersedia',
            'institution_id' => $institution->id,
        ]);

        Item::create([
            'name' => 'Proyektor Epson',
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
            'description' => 'Meja untuk santri kelas 10',
            'stock' => 20,
            'price' => 350000,
            'location' => 'Kelas 10A',
            'status' => 'baik',
            'condition' => 'tersedia',
            'institution_id' => $institution->id,
        ]);

        // Buat loan dengan due_date dan notes
        Loan::create([
            'user_id' => 2, // user 'sultan'
            'item_id' => 1, // Laptop Lenovo
            'loan_date' => Carbon::now()->subDays(5),
            'due_date' => Carbon::now()->addDays(2),
            'status' => 'approved',
            'notes' => 'Untuk administrasi TU',
        ]);

        Loan::create([
            'user_id' => 2,
            'item_id' => 2, // Proyektor Epson
            'loan_date' => Carbon::now()->subDays(10),
            'due_date' => Carbon::now()->subDays(1), // lewat jatuh tempo
            'status' => 'approved',
            'notes' => 'Dipakai di kelas 10A',
        ]);
    }
}
