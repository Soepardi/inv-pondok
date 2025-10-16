<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
Schema::create('items', function (Blueprint $table) {
    $table->id();
    $table->string('item_code')->unique(); 
    $table->string('name');
    $table->text('description')->nullable();
    $table->integer('stock')->default(1);
    $table->decimal('price', 15, 2)->nullable(); // harga barang
    $table->string('location')->nullable(); // lokasi penyimpanan
    $table->enum('status', ['baik', 'rusak', 'diperbaiki'])->default('baik'); // kondisi fisik
    $table->enum('condition', ['tersedia', 'dipinjam', 'hilang'])->default('tersedia'); // ketersediaan
    $table->string('photo')->nullable();
    $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
