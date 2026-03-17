<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('session_attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('session_index');
            $table->timestamp('checked_in_at');
            $table->timestamps();

            $table->unique(['order_id', 'session_index']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('session_attendances');
    }
};
