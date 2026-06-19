<?php

namespace App\Http\Controllers;

use App\Models\userModel;
use Illuminate\Foundation\Auth\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class userController extends Controller
{
    public function index()
    {
        $user = userModel::all();
        return response()->json([
            'msg' => 'success',
            'data' => $user
        ], 200);
    }

    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:user,email',
            'password' => 'required|string|min:8|confirmed|max:255',
            'phone' => 'nullable|string|max:15',
            'address' => 'nullable|string|max:255',
            'governorate' => 'nullable|string|max:100',
          
        ]);
$userdata = userModel::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'phone' => $data['phone'],
            'address' => $data['address'],
            'governorate' => $data['governorate'],
            'is_active' => $request->input('is_active', true),
            'role_id' => 2,
        ]);

        $token = $userdata->createToken('auth_token')->plainTextToken;

        return response()->json([
            'msg' => 'User registered successfully',
            'data' => $userdata,
            'token' => $token
        ], 201);
        
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = userModel::where('email', $data['email'])->first();
        $passwordCheck = Hash::check($data['password'], $user->password);
        
        if (!$user || !$passwordCheck) {
            return response()->json([
                'msg' => 'Invalid credentials'
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'msg' => 'User is not active'
            ], 403);
        }
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'msg' => 'User logged in successfully',
            'data' => $user,
            'token' => $token
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'msg' => 'User logged out successfully'
        ], 200);
    }

    public function inactivate(Request $request, $id)
    {
        $user = userModel::findOrFail($id);
        $user->is_active = false;
        $user->save();

        return response()->json([
            'msg' => 'User inactivated successfully',
            'data' => $user
        ], 200);
    }

    public function deleteuser(Request $request, $id)
    {
        $user = userModel::findOrFail($id);
        $user->delete();

        return response()->json([
            'msg' => 'User deleted successfully'
        ], 200);

    }
    public function updateuser(Request $request, $id)
    {
        $data = $request->validate([
            'name' => 'string|max:255',
            'email' => 'string|email|max:255|unique:user,email,' . $id,
            'password' => 'string|min:8|max:255',
            'phone' => 'string|max:15',
            'address' => 'string|max:255',
            'governorate' => 'string|max:100',
            
        ]);
        $user = userModel::findOrFail($id);
        $user->update($data);

        return response()->json([
            'msg' => 'User updated successfully',
            'data' => $user
        ], 201);
    }

    public function showuserbyid($id)
    {
        $user = userModel::findOrFail($id);

        return response()->json([
            'msg' => 'User retrieved successfully',
            'data' => $user
        ], 200);
    }

}
