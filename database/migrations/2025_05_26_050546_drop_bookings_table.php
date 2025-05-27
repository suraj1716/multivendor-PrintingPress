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
    Schema::create('bookings', function (Blueprint $table) {
        $table->id();
        $table->date('booking_date');
        $table->string('time_slot');
        $table->unsignedBigInteger('user_id');
        $table->timestamps();

        // Optional: foreign key constraint if users table exists
        $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    });
}

public function down()
{
    Schema::dropIfExists('bookings');
}

};
