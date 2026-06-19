<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\productModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    public function addToCart(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|exists:product,id',
            'quantity'   => 'required|integer|min:1'
        ]);

        $product = productModel::findOrFail($data['product_id']);
        if ($product->stock < $data['quantity']) {
            return response()->json([
                'msg' => 'Insufficient stock for the requested quantity'
            ], 400);
        }

        $cartItem = Cart::where('user_id', Auth::user()->id)
            ->where('product_id', $data['product_id'])
            ->first();

        if ($cartItem) {
            $cartItem->quantity += $data['quantity'];
            $cartItem->save();
        } else {
            $cartItem = Cart::create([
                'user_id'    => Auth::user()->id,
                'product_id' => $data['product_id'],
                'quantity'   => $data['quantity'],
            ]);
        }

        return response()->json([
            'msg' => 'Product added to cart successfully',
            'data' => $cartItem
        ], 201);
    }

    public function updatequantity($quantity, $id)
    {
        $cartitem = Cart::findOrFail($id);
        $product = productModel::findOrFail($cartitem->product_id);
        if ($product->stock < $quantity) {
            return response()->json([
                'msg' => 'Insufficient stock for the requested quantity'
            ], 400);
        }
        $cartitem->quantity = $quantity;
        $cartitem->save();
        return response()->json([
            'msg' => 'Quantity updated successfully',
            'data' => $cartitem
        ], 200);
    }

    // Show user's cart
    public function showCart()
    {
        $cart = Cart::where('user_id', Auth::user()->id)
            ->with('product')
            ->get();

        return response()->json([
            'msg' => 'Cart retrieved successfully',
            'data' => $cart
        ], 200);
    }

    // Remove item from cart
    public function removeFromCart($id)
    {
        $cartItem = Cart::where('user_id', Auth::user()->id)
            ->where('id', $id)
            ->firstOrFail();

        $cartItem->delete();

        return response()->json([
            'msg' => 'Item removed from cart successfully'
        ], 200);
    }
}
