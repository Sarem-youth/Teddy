<?php

namespace App\Observers;

use App\Models\User;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user)
    {
        // Customer profile synchronization is intentionally disabled in this app.
        // The system stores customer data on the users table, so there is no
        // separate Customer model or table to create records in.
        return;
    }
}
