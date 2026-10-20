<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_code',
        'name',
        'description',
        'stock',
        'price',
        'location',
        'status',
        'condition',
        'photo',
        'institution_id',
        'source_of_funds',
        'purchase_year',
    ];



    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }

    public function loans()
{
    return $this->hasMany(Loan::class);
}
}
