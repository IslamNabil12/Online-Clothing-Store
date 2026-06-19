<?php

namespace App\Http\Controllers;

use App\Models\RoleModel;
use Illuminate\Http\Request;

class roleController extends Controller
{
  public function index()
  {
    // This method can be used to list all roles if needed
    $data = RoleModel::all();
    return response()->json([
      'msg' => 'success',
      'data' => $data
    ], 200);
  }

  public function add_role(Request $request)
  {
    $data = $request->validate([
      'name' => 'required|string|max:255',
    ]);

    $role = RoleModel::create($data);
    return response()->json([
      'msg' => 'Role created successfully',
      'data' => $role
    ], 201);
  }

  public function update_role(Request $request, $id)
  {
    $data = $request->validate([
      'name' => 'required|string|max:255',
    ]);

    $role = RoleModel::findOrFail($id);
    $role->update($data);

    return response()->json([
      'msg' => 'Role updated successfully',
      'data' => $role
    ], 201);
  }

    public function delete_role($id)
    {
        $role = RoleModel::findOrFail($id);
        $role->delete();
    
        return response()->json([
        'msg' => 'Role deleted successfully'
        ], 200);
    }

    
}
