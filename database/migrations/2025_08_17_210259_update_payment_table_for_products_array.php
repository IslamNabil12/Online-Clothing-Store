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
        Schema::table('payment', function (Blueprint $table) {
                // Remove old product_id and quantity
        $table->dropForeign(['product_id']);
        $table->dropColumn('product_id');
        $table->dropColumn('quantity');

        // Add products JSON
        $table->json('products')->nullable()->after('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment', function (Blueprint $table) {
            $table->unsignedBigInteger('product_id');
        $table->integer('quantity')->default(1);
        $table->foreign('product_id')->references('id')->on('product');
        $table->dropColumn('products');
        });
    }
};
