<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class paymentModel extends Model
{
    use HasFactory;
    protected $table = 'payment';
    protected $fillable = [
     
        'user_id',
        'total_price',
        'payment_method',
        'status',
        'payment_date',
        'products',
       
    ];  

    protected $casts = [
        'products' => 'array', 
    ];
    
}
