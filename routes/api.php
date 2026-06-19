<?php

use App\Http\Controllers\CartController;
use App\Http\Controllers\categoryController;
use App\Http\Controllers\MailController;
use App\Http\Controllers\paymentController;
use App\Http\Controllers\productController;
use App\Http\Controllers\roleController;
use App\Http\Controllers\userController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Public Routes:    {
// Category Routes
Route::get('/show_categories', [categoryController::class, 'index']);
// Product Routes
Route::get('/show_products', [productController::class, 'show_products']);
Route::get('/show_specific_product/{id}', [productController::class, 'show_specific_product']);
Route::get('/sort-by-price-asc', [productController::class, 'showProductsByPrice']);
Route::get('/sort-by-price-desc', [productController::class, 'showProductsHighToLow']);
// User Routes
Route::post('/register', [userController::class, 'register']);
Route::post('/login', [userController::class, 'login']);
Route::post('/logout', [userController::class, 'logout'])->middleware('auth:sanctum');


    Route::get('/show_payment_by_user/{id}', [paymentController::class, 'showPaymentsByUserId'])->middleware('auth:sanctum');

//                     }









// Middleware for Admin 

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    // Role Routes
    Route::get('/show_roles', [roleController::class, 'index']);
    Route::post('/add_role', [roleController::class, 'add_role']);
    Route::patch('/update_role/{id}', [roleController::class, 'update_role']);
    Route::delete('/delete_role/{id}', [roleController::class, 'delete_role']);


    // Category Routes
    Route::post('/add_category', [categoryController::class, 'add_category']);
    Route::patch('/update_category/{id}', [categoryController::class, 'update_category']);
    Route::delete('/delete_category/{id}', [categoryController::class, 'delete_category']);


    // Product Routes
    Route::post('/add_product', [productController::class, 'add_product']);
    Route::post('/update_product/{id}', [productController::class, 'update_product']);
    Route::delete('/delete_product/{id}', [productController::class, 'delete_product']);
    Route::patch('/inactivate_product/{id}', [productController::class, 'inactivate_product']);
    Route::get('/show_product_admin', [productController::class, 'show_products_admin']);


    // User Routes
    Route::get('/show_users', [userController::class, 'index']);
    Route::get('/show_specific_user/{id}', [userController::class, 'showuserbyid']);
    Route::patch('/inactivate_user/{id}', [userController::class, 'inactivate']);
    Route::delete('/delete_user/{id}', [userController::class, 'deleteuser']);
    Route::patch('/update_user/{id}', [userController::class, 'updateuser']);


    // Payment Routes
    Route::get('/show_payments', [paymentController::class, 'showPayments']);
    Route::patch('/pendingPayment/{id}', [paymentController::class, 'pendingPayment']);
    Route::get('/show_payment/{id}', [paymentController::class, 'showPaymentById']);
    Route::patch('/complete_payment/{id}', [paymentController::class, 'completePayment']);
    Route::get('/show_payment_by_product/{id}', [paymentController::class, 'showPaymentsByProductId']);
    Route::get('/show_payment_by_status/{status}', [paymentController::class, 'showPaymentsByStatus']);
    Route::get('/show_payment_by_date/{date}', [paymentController::class, 'showPaymentsByDateRange']);
    Route::get('/show_payment_by_method/{method}', [paymentController::class, 'showPaymentByMethod']);
    Route::get('/showPaymentsByTotalPriceRange/{userId}', [paymentController::class, 'showPaymentsByTotalPriceRange']);
    Route::delete('/delete_payment/{id}', [paymentController::class, 'deletePayment']);
    Route::get('/showPaymentsByUserName/{name}', [paymentController::class, 'showPaymentsByUserName']);
});

// Middleware for User
Route::middleware(['auth:sanctum', 'user'])->group(function () {
    // Payment Routes
    Route::post('/add_payment', [paymentController::class, 'addPayment']);

    // Cart Routes
    Route::post('/add_to_cart', [CartController::class, 'addToCart']);
    Route::get('/show_cart', [CartController::class, 'showCart']);
    Route::delete('/remove_from_cart/{id}', [CartController::class, 'removeFromCart']);
    Route::patch('/update_quantity/{quantity}/{id}', [CartController::class, 'updatequantity']);

    // payment routes
    Route::patch('/refund_payment/{id}', [paymentController::class, 'refundPayment']);
    Route::patch('/cancel_payment/{id}', [paymentController::class, 'cancelPayment']);

    
});

Route::post('/send-email', [MailController::class, 'sendEmailNotification'])->middleware('auth:sanctum');
