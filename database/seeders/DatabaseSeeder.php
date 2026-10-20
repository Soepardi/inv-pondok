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
        $userSultan = User::firstOrCreate(
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

        // Buat barang (gunakan firstOrCreate agar tidak error duplicate item_code)
        $laptop = Item::firstOrCreate(
            ['item_code' => 'LNP-001'],
            [
                'name' => 'Laptop Lenovo Thinkpad',
                'description' => 'Laptop untuk keperluan administrasi',
                'stock' => 4, // 5 total - 1 dipinjam
                'price' => 8500000,
                'location' => 'Ruang Tata Usaha',
                'status' => 'baik',
                'condition' => 'tersedia',
                'institution_id' => $institution->id,
            ]
        );

        $proyektor = Item::firstOrCreate(
            ['item_code' => 'PRJ-001'],
            [
                'name' => 'Proyektor Epson',
                'description' => 'Digunakan untuk presentasi di kelas',
                'stock' => 1, // 2 total - 1 dipinjam
                'price' => 4500000,
                'location' => 'Aula',
                'status' => 'baik',
                'condition' => 'tersedia',
                'institution_id' => $institution->id,
            ]
        );

        $meja = Item::firstOrCreate(
            ['item_code' => 'MJB-001'],
            [
                'name' => 'Meja Belajar',
                'description' => 'Meja untuk santri kelas 10',
                'stock' => 20,
                'price' => 350000,
                'location' => 'Kelas 10A',
                'status' => 'baik',
                'condition' => 'tersedia',
                'institution_id' => $institution->id,
            ]
        );

        // Buat loan dengan due_date, notes, dan stock (gunakan firstOrCreate)
        if ($userSultan) {
            Loan::firstOrCreate(
                [
                    'user_id' => $userSultan->id,
                    'item_id' => $laptop->id,
                ],
                [
                    'loan_date' => Carbon::now()->subDays(5),
                    'due_date' => Carbon::now()->addDays(2),
                    'status' => 'approved',
                    'stock' => 1,
                    'notes' => 'Untuk administrasi TU',
                ]
            );

            Loan::firstOrCreate(
                [
                    'user_id' => $userSultan->id,
                    'item_id' => $proyektor->id,
                ],
                [
                    'loan_date' => Carbon::now()->subDays(10),
                    'due_date' => Carbon::now()->subDays(1), // lewat jatuh tempo
                    'status' => 'approved',
                    'stock' => 1,
                    'notes' => 'Dipakai di kelas 10A',
                ]
            );
        }
    }
}
