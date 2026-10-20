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
        Schema::table('items', function (Blueprint $table) {
            if (!Schema::hasColumn('items', 'source_of_funds')) {
                $table->string('source_of_funds')->nullable()->after('condition');
            }
            if (!Schema::hasColumn('items', 'purchase_year')) {
                $table->integer('purchase_year')->nullable()->after('condition');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('items', function (Blueprint $table) {
            if (Schema::hasColumn('items', 'source_of_funds')) {
                $table->dropColumn('source_of_funds');
            }
            if (Schema::hasColumn('items', 'purchase_year')) {
                $table->dropColumn('purchase_year');
            }
        });
    }
};
