<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\InstitutionController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExportController;

// Halaman depan
Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Semua route butuh login & verifikasi email
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard (hanya admin)
    Route::get('dashboard', [DashboardController::class, 'index'])
        ->middleware('role:admin')
        ->name('dashboard');

    // ---------------- Admin ----------------
    Route::middleware('role:admin')->group(function () {
        Route::get('loans/all', [LoanController::class, 'index'])
            ->name('loans.admin.index'); // lihat semua pinjaman
        Route::resource('users', UserController::class);
        Route::resource('institutions', InstitutionController::class);
        Route::resource('items', ItemController::class);
        Route::resource('history', HistoryController::class)->only(['index']);
    });

    Route::prefix('export')->group(function () {
        Route::get('/items', [ExportController::class, 'exportItems'])->name('export.items');
        Route::get('/loans', [ExportController::class, 'exportLoans'])->name('export.loans');
        Route::get('/dashboard', [ExportController::class, 'exportDashboard'])->name('export.dashboard');
    });

    // ---------------- Pinjaman untuk semua user yang login ----------------
    Route::prefix('loans')->group(function () {
        // List pinjaman (admin lihat semua, user lihat sendiri)
        Route::get('/', [LoanController::class, 'index'])->name('loans.index');
        
        // Form buat pinjaman baru & simpan (user only)
        Route::middleware('role:user')->group(function () {
            Route::get('/create', [LoanController::class, 'create'])->name('loans.create');
            Route::post('/', [LoanController::class, 'store'])->name('loans.store');
        });

        // Aksi loan
        Route::put('/{loan}/approve', [LoanController::class, 'approve'])
            ->middleware('role:admin')->name('loans.approve');

        Route::put('/{loan}/reject', [LoanController::class, 'reject'])
            ->middleware('role:admin')->name('loans.reject');

        // Return barang - bisa diakses admin dan user (tanpa middleware role)
        Route::put('/{loan}/return', [LoanController::class, 'returnLoan'])
            ->name('loans.return');
    });

    // ---------------- History ----------------
    Route::get('history/my', [HistoryController::class, 'myHistory'])
        ->middleware('role:user')
        ->name('history.my');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';