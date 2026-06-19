<?php

namespace App\Http\Controllers;

use App\Models\CategoryModel;
use Illuminate\Http\Request;

class categoryController extends Controller
{
    
    public function index()
    {
     
        $data = CategoryModel::all();
        return response()->json(
           [
             'msg' => 'success',
            'data' => $data 
           ],
           200  
           );
    }

    public function add_category(Request $request)
    {
      $data = $request->validate([
        'name' => 'required|string|max:255',
      ]);

      $category = CategoryModel::create($data);
      return response()->json([
        'msg' => 'Category created successfully',
        'data' => $category
      ], 201);
    }

    public function update_category(Request $request, $id)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $category = CategoryModel::findOrFail($id);
        $category->update($data);

        return response()->json([
            'msg' => 'Category updated successfully',
            'data' => $category
        ], 201);
    }

    public function delete_category($id)
    {
        $category = CategoryModel::findOrFail($id);
        $category->delete();


        return response()->json([
            'msg' => 'Category deleted successfully'
        ], 200);
    }
}
