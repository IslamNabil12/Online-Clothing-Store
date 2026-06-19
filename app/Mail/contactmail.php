<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class contactmail extends Mailable
{
    use Queueable, SerializesModels;

   public $userName;
   public $userEmail;
   public $governorate;
    public $phone;
    public $productDetails; 
    public $paymentMethod;
    public $totalPrice;
    public $status;

   public function __construct($userName, $userEmail, $governorate, $phone, $productDetails, $paymentMethod, $totalPrice, $status)
{
    $this->userName = $userName;
    $this->userEmail = $userEmail;
    $this->governorate = $governorate;
    $this->phone = $phone;
    $this->productDetails = $productDetails; // now contains all products
    $this->paymentMethod = $paymentMethod;
    $this->totalPrice = $totalPrice;
    $this->status = $status;
}


    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Contactmail',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'Mails.contact',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }

   public function build()
{
    return $this
        ->from($this->userEmail, $this->userName) // sender
        ->subject("Status of your order: " . $this->status)
        ->view('emails.contactmail') // make sure this blade exists
        ->with([
            'name' => $this->userName,
            'email' => $this->userEmail,
            'governorate' => $this->governorate,
            'phone' => $this->phone,
            'products' => $this->productDetails, // <-- pass full products list
            'payment_method' => $this->paymentMethod,
            'total_price' => $this->totalPrice,
            'status' => $this->status
        ]);
}

}
