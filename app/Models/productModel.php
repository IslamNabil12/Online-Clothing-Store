<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class productModel extends Model
{
    use HasFactory;
    protected $table = 'product';
    protected $fillable = [
        'name',
        'description',
        'price',
        'category_id',
        'images',
        'is_active',
        'size',
        'color',    
        'stock',    
    ];
    protected $casts = [
        'images' => 'array', 
    ];
}
