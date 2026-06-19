<?php

namespace App\Http\Controllers;

use App\Models\productModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class productController extends Controller
{
    public function show_products()
    {
      $products = productModel::where('is_active', 1)->get();

        $products->map(function ($product) {
            if (is_array($product->images)) {
                $product->images = collect($product->images)->map(function ($image) {
                    return asset('storage/' . $image);
                });
            }
            return $product;
        });

        return response()->json([
            'msg' => 'success',
            'data' => $products
        ], 200);
    }
    public function show_products_admin()
    {
        $products = productModel::all();

        $products->map(function ($product) {
            if (is_array($product->images)) {
                $product->images = collect($product->images)->map(function ($image) {
                    return asset('storage/' . $image);
                });
            }
            return $product;
        });

        return response()->json([
            'msg' => 'success',
            'data' => $products
        ], 200);
    }

    public function add_product(Request $request)
    {
        $request->validate([
            'name'        => 'required|string',
            'price'       => 'required|numeric',
            'description' => 'nullable|string',
            'images.*'    => 'image|mimes:jpg,jpeg,png,webp|max:2048',
            'size'        => 'required|string',
            'color'       => 'required|string',
            'stock'       => 'required|integer',
            'is_active'   => 'required|boolean',
            'category_id' => 'required|exists:category,id',
        ]);

        $imagePaths = [];

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('product_images', 'public');
                $imagePaths[] = $path;
            }
        }

        $product = productModel::create([
            'name'        => $request->name,
            'price'       => $request->price,
            'description' => $request->description,
            'size'        => $request->size,
            'color'       => $request->color,
            'stock'       => $request->stock,
            'images'      => $imagePaths, 
            'is_active'   => true,
            'category_id' => $request->category_id,
        ]);

       
        $product->images = collect($product->images)->map(function ($image) {
            return asset('storage/' . $image);
        });

        return response()->json([
            'msg' => 'Product created successfully',
            'data' => $product
        ], 201);
    }

   public function update_product(Request $request, $id)
{
    $product = productModel::findOrFail($id);
    
    $request->validate([
        'name'        => 'sometimes|string',
        'price'       => 'sometimes|numeric',
        'description' => 'sometimes|string',
        'images.*'    => 'image|mimes:jpg,jpeg,png,webp|max:2048',
        'size'        => 'sometimes|string',
        'color'       => 'sometimes|string',
        'stock'       => 'sometimes|integer',
        'is_active'   => 'sometimes|boolean',
        'category_id' => 'sometimes|exists:category,id',
    ]);
    $imagePaths = $product->images ?? [];
    if ($request->hasFile('images')) {
        foreach ($request->file('images') as $image) {
            $path = $image->store('product_images', 'public');
            $imagePaths[] = $path;
        }
    }
    $product->update([
        'name'        => $request->filled('name') ? $request->name : $product->name,
        'price'       => $request->filled('price') ? $request->price : $product->price,
        'description' => $request->filled('description') ? $request->description : $product->description,
        'size'        => $request->filled('size') ? $request->size : $product->size,
        'color'       => $request->filled('color') ? $request->color : $product->color,
        'stock'       => $request->filled('stock') ? $request->stock : $product->stock,
        'images'      => $imagePaths,
        'is_active'   => $request->filled('is_active') ? $request->is_active : $product->is_active,
        'category_id' => $request->filled('category_id') ? $request->category_id : $product->category_id,
    ]);
    return response()->json([
        'msg' => 'Product updated successfully',
        'data'    => $product->fresh()
    ], 200);
}

  public function delete_product($id)
{
    $product = productModel::findOrFail($id);
    if (is_array($product->images)) {
        foreach ($product->images as $image) {
            Storage::disk('public')->delete($image);
        }
    }
    $product->delete();
    return response()->json([
        'msg' => 'Product deleted successfully'
    ], 200);
}

    public function show_specific_product($id)
    {
        $product = productModel::findOrFail($id);

        if (is_array($product->images)) {
            $product->images = collect($product->images)->map(function ($image) {
                return asset('storage/' . $image);
            });
        }

        return response()->json([
            'msg' => 'success',
            'data' => $product
        ], 200);
    }


    //show product ascending 

   public function showProductsHighToLow()
{
    $products = productModel::orderBy('price', 'desc')->get();

    return response()->json([
        'msg' => 'Products retrieved successfully from highest to lowest price',
        'data' => $products
    ], 200);
}

public function showProductsByPrice()
{
    $products = productModel::orderBy('price', 'asc')->get();

    return response()->json([
        'msg' => 'Products retrieved successfully (low → high)',
        'data' => $products
    ], 200);
}

public function inactivate_product($id)
{
    $product = productModel::findOrFail($id);
    $product->is_active = !$product->is_active;
    $product->save();

    return response()->json([
        'msg' => 'Product status updated successfully',
        'data' => $product
    ], 200);    
}

}


