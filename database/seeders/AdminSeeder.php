<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if admin already exists
        if (!User::where('email', 'admin@siakad.com')->exists()) {
            User::create([
                'name' => 'Admin Siakad',
                'email' => 'admin@siakad.com',
                'password' => Hash::make('password123'),
                'role' => 'admin',
            ]);
        }
    }
}
