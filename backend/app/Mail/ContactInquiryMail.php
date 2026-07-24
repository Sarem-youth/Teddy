<?php

namespace App\Mail;

use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactInquiryMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public ContactMessage $inquiry)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[Website Inquiry] ' . $this->inquiry->subject,
            replyTo: [$this->inquiry->email],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.contact-inquiry',
            with: ['inquiry' => $this->inquiry],
        );
    }
}
