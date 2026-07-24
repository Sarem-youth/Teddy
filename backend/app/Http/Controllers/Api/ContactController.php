<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ContactInquiryMail;
use App\Models\ContactMessage;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    /**
     * REQ-3.5.1 structured lead capture + REQ-3.5.2 SMTP routing.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'subject' => ['required', 'string', 'max:190'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $message = ContactMessage::create($data);

        // Route the inquiry to the administrator's corporate inbox via SMTP.
        $adminEmail = Setting::get('store_email', config('mail.from.address'));

        if ($adminEmail) {
            try {
                Mail::to($adminEmail)->send(new ContactInquiryMail($message));
            } catch (\Throwable $e) {
                // The inquiry is stored either way; never fail the request because of SMTP.
                Log::warning('Contact inquiry email could not be sent: ' . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'Thank you for reaching out! Our team will get back to you shortly.',
        ], 201);
    }
}
