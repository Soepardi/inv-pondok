<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class Loan extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'item_id',
        'status',
        'due_date',
        'notes',
        'stock',
        'loan_date',
        'return_date',
        'return_proof',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function item()
    {
        return $this->belongsTo(Item::class);
    }
 public function getLoanDateAttribute($value)
    {
        return $value ? Carbon::parse($value) : null;
    }

    public function getDueDateAttribute($value)
    {
        return $value ? Carbon::parse($value) : null;
    }

    public function getReturnDateAttribute($value)
    {
        return $value ? Carbon::parse($value) : null;
    }


    public function scopeOverdue($query)
{
    return $query->where('return_date', '<', now())->where('status', 'approved');
}

public function scopeUpcomingDue($query)
{
    return $query->whereBetween('return_date', [now(), now()->addDays(3)])
                 ->where('status', 'approved');
}
}
