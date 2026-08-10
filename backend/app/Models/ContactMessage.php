<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    public const STATUSES = ['new', 'in_progress', 'resolved', 'closed'];

    protected $fillable = [
        'name',
        'email',
        'subject',
        'message',
        'is_read',
        'status',
        'priority',
        'assigned_to',
        'admin_notes',
        'responded_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'responded_at' => 'datetime',
    ];

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
