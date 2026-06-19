<?php

namespace App\Http\Controllers;

use App\Mail\contactmail;
use App\Models\paymentModel;
use App\Models\productModel;
use App\Models\userModel;
use App\Http\Controllers\MailController;
use App\Models\Cart;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class paymentController extends Controller
{

    public function showPayments()
    {

        $payment = paymentModel::all();
        return response()->json([
            'msg' => 'success',
            'data' => $payment
        ], 200);
    }

   
  public function addPayment(Request $request)
    {
        $data = $request->validate([

            'payment_method' => 'required|in:on_delivery,credit_card',

        ]);

       

        // Get all cart items for the user
        $cartItems = Cart::where('user_id', Auth::user()->id)->with('product')->get();
        if ($cartItems->isEmpty()) {
            return response()->json([
                'msg' => 'Cart is empty. Please add products before payment.'
            ], 400);
        }
  $products = [];
        $totalPrice = 0;
        foreach ($cartItems as $item) {
            $products[] = [
            'product_id' => $item->product_id,
            'quantity'   => $item->quantity,
            'price'      => $item->product->price,
        ];
            $item->product->stock -= $item->quantity;
            $item->product->save();

            $totalPrice += (($item->product->price * $item->quantity ) );
        }
        $totalPrice += 30;
// dd($products);
       $payment = paymentModel::create([
        'user_id'        => Auth::user()->id,
        'total_price'    => $totalPrice,
        'payment_method' => $data['payment_method'],
        'status'         => 'pending',
        'payment_date'   => null,
        'products'       => $products, 
    ]);

    // dd($payment);
        Cart::where('user_id', Auth::user()->id)->delete();
        $mailController = new MailController();
        $mailController->sendEmailNotification($payment);
     
        return response()->json([

            'msg' => 'Payment created successfully',
            'data' => $payment
        ], 201);
    }



    public function completePayment(Request $request, $id)
    {
        $payment = paymentModel::findOrFail($id);
        if ($payment->status !== 'pending') {
            return response()->json([
                'msg' => 'Only pending payments can be completed'
            ], 400);
        }

        $payment->status = 'completed';
        $payment->payment_date =  now()->addHours(3);
        $payment->save();
        $mailController = new MailController();
        $mailController->sendEmailNotification($payment);
        return response()->json([
            'msg' => 'Payment completed successfully',
            'data' => $payment
        ], 200);
    }

    public function cancelPayment($id)
    {
        $payment = paymentModel::findOrFail($id);
        if ($payment->status !== 'pending') {
            return response()->json([
                'msg' => 'Only pending payments can be cancelled'
            ], 400);
        }
        if ($payment->status === 'cancelled') {
            return response()->json([
                'msg' => 'Payment is already cancelled'
            ], 400);
        }

        $paymentDate = $payment->created_at;
        $deadline = $paymentDate->copy()->addHours(6);

        if (now()->addHours(3)->lte($deadline)) {
            $payment = paymentModel::findOrFail($id);
            $payment->status = 'cancelled';
      
      foreach ($payment->products ?? [] as $item) {
    $productId = $item['product_id'] ?? null;
    $quantity  = $item['quantity'] ?? 0;
    if ($productId) {
        $product = productModel::find($productId);
        if ($product) {
            $product->stock += $quantity;
            $product->save();
        }
    }
}
            $payment->payment_date = now()->addHours(3);   

            
            $payment->save();
            $mailController = new MailController();
            $mailController->sendEmailNotification($payment);
            return response()->json([
                'msg' => 'Payment cancelled successfully'
            ], 200);
        } else {
            return response()->json([
                'msg' => 'Payment cannot be cancelled after 6 hours'
            ], 400);
        }
    }
    public function pendingPayment($id)
    {
        $payment = paymentModel::findOrFail($id);
        if ($payment->status !== 'Refund') {
            return response()->json([
                'msg' => 'Only  refund payment can be set to pending'
            ], 400);
        }
         foreach ($payment->products ?? [] as $item) {
    $productId = $item['product_id'] ?? null;
    $quantity  = $item['quantity'] ?? 0;
    if ($productId) {
        $product = productModel::find($productId);
        if ($product) {
            $product->stock += $quantity;
            $product->save();
        }
    }
}
        $payment->status = 'pending';
        $payment->save();
        $mailController = new MailController();
        $mailController->sendEmailNotification($payment);
        return response()->json([
            'msg' => 'Payment set to pending successfully',
            'data' => $payment
        ], 200);
    }
    public function refundPayment($id)
    {
        $payment = paymentModel::findOrFail($id);
        if ($payment->status !== 'completed') {
            return response()->json([
                'msg' => 'Only completed payments can be refunded'
            ], 400);
        }
        $orderDate = $payment->created_at;
        $refundDeadline = $orderDate->copy()->addDays(14);

        if (now()->lte($refundDeadline)) {
            $payment->status = 'Refund';

            $payment->save();
            $mailController = new MailController();
            $mailController->sendEmailNotification($payment);
            return response()->json([
                'msg' => 'Payment refunded successfully'
            ], 200);
        } else {
            return response()->json([
                'msg' => 'Refund period has expired'
            ], 400);
        }
    }


    public function showPaymentById($id)
    {
        $payment = paymentModel::findOrFail($id);

        return response()->json([
            'msg' => 'Payment retrieved successfully',
            'data' => $payment
        ], 200);
    }

    public function showPaymentsByUserId($userId)
    {
        $payments = paymentModel::where('user_id', Auth::user()->id)->get();

        return response()->json([
            'msg' => 'Payments retrieved successfully',
            'data' => $payments
        ], 200);
    }

  public function showPaymentsByProductId($productId)
{
    $payments = paymentModel::whereJsonContains('products', ['product_id' => (int)$productId])->get();

    return response()->json([
        'msg' => 'Payments retrieved successfully',
        'data' => $payments
    ], 200);
}




    public function showPaymentsByStatus($status)
    {
        $payments = paymentModel::where('status', $status)->get();

        return response()->json([
            'msg' => 'Payments retrieved successfully',
            'data' => $payments
        ], 200);
    }

    public function showPaymentsByDateRange(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $payments = paymentModel::whereBetween('payment_date', [$startDate, $endDate])->get();

        return response()->json([
            'msg' => 'Payments retrieved successfully',
            'data' => $payments
        ], 200);
    }

    public function showPaymentByMethod($paymentMethod)
    {
        $payments = paymentModel::where('payment_method', $paymentMethod)->get();

        return response()->json([
            'msg' => 'Payments retrieved successfully',
            'data' => $payments
        ], 200);
    }

    public function showPaymentsByTotalPriceRange(Request $request)
    {
        $minPrice = $request->input('min_price');
        $maxPrice = $request->input('max_price');

        $payments = paymentModel::whereBetween('total_price', [$minPrice, $maxPrice])->get();

        return response()->json([
            'msg' => 'Payments retrieved successfully',
            'data' => $payments
        ], 200);
    }

    public function deletePayment($id)
    {
        $payment = paymentModel::findOrFail($id);
        if ($payment->status === 'completed') {
            return response()->json([
                'msg' => 'Completed payments cannot be deleted'
            ], 400);
        }
        if ($payment->status === 'Refund') {
            return response()->json([
                'msg' => 'Refunded payments cannot be deleted'
            ], 400);
        }
             foreach ($payment->products ?? [] as $item) {
    $productId = $item['product_id'] ?? null;
    $quantity  = $item['quantity'] ?? 0;
    if ($productId) {
        $product = productModel::find($productId);
        if ($product) {
            $product->stock += $quantity;
            $product->save();
        }
    }
}
$payment->delete();


        return response()->json([
            'msg' => 'Payment deleted successfully'
        ], 200);
    }

    //get payment by user name
    public function showPaymentsByUserName($name)
    {
        $user = userModel::where('name', $name)->first();
        if (!$user) {
            return response()->json([
                'msg' => 'User not found'
            ], 404);
        }

        $payments = paymentModel::where('user_id', $user->id)->get();

        return response()->json([
            'msg' => 'Payments retrieved successfully',
            'data' => $payments
        ], 200);
    }
}
