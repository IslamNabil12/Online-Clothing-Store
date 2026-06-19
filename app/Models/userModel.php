<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class userModel extends Model
{
    use HasFactory,HasApiTokens;
    protected $table = 'user';
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'address',  
        'governorate',
        'is_active',
        'role_id',
    ];
    protected $hidden = [
        'password'
        
    ];
}
