<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('require_additional_file')->default(false)->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
             if (Schema::hasColumn('products', 'require_additional_file')) {
            $table->dropColumn('require_additional_file');}
        });
    }
};
