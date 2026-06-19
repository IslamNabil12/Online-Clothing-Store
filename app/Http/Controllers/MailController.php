<?php

namespace App\Http\Controllers;

use App\Mail\contactmail;
use App\Models\productModel;
use App\Models\userModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class MailController extends Controller
{
  public function sendEmailNotification($payment)
{
    // Get the user
    $user = userModel::findOrFail($payment->user_id);

    // Prepare products array safely
    $productsArray = [];
    foreach ($payment->products ?? [] as $p) {
        $productId = $p['product_id'] ?? null;
        $quantity  = $p['quantity'] ?? 0;

        if ($productId) {
            $product = productModel::find($productId);
            if ($product) {
                $productsArray[] = [
                    'id'       => $product->id,
                    'name'     => $product->name,
                    'quantity' => $quantity,
                    'price'    => $product->price,
                    'subtotal' => $product->price * $quantity, // subtotal per product
                ];
            } else {
                $productsArray[] = [
                    'id'       => $productId,
                    'name'     => 'Product not found',
                    'quantity' => $quantity,
                    'price'    => 0,
                    'subtotal' => 0,
                ];
            }
        }
    }

    // Send the email
    Mail::to(config('mail.from.address'))->send(new contactmail(
        $user->name,
        $user->email,
        $user->governorate,
        $user->phone,
        $productsArray,        
        $payment->payment_method,
        $payment->total_price,
        $payment->status
    ));
}


}


