<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
      public function up()
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->json('variation_type_option_ids')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->text('variation_type_option_ids')->change();
        });
    }
};
