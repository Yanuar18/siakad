<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\StudentDetail;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $students = [
            [
                'name' => 'Rian Hidayat',
                'email' => 'student1@siakad.com',
                'nis' => '10291',
            ],
            [
                'name' => 'Lina Marlina',
                'email' => 'student2@siakad.com',
                'nis' => '10292',
            ],
            [
                'name' => 'Joko Prasetyo',
                'email' => 'student3@siakad.com',
                'nis' => '10293',
            ]
        ];

        foreach ($students as $s) {
            if (!User::where('email', $s['email'])->exists()) {
                $user = User::create([
                    'name' => $s['name'],
                    'email' => $s['email'],
                    'password' => Hash::make('password123'),
                    'role' => 'student',
                ]);

                // Create detail NIS
                StudentDetail::create([
                    'user_id' => $user->id,
                    'nis' => $s['nis'],
                ]);
            }
        }
    }
}
