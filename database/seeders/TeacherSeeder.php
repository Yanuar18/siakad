<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\TeacherDetail;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TeacherSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $teachers = [
            [
                'name' => 'Budi Hartono',
                'email' => 'teacher1@siakad.com',
                'nip' => '19850322',
            ],
            [
                'name' => 'Siti Aminah',
                'email' => 'teacher2@siakad.com',
                'nip' => '19900514',
            ]
        ];

        foreach ($teachers as $t) {
            if (!User::where('email', $t['email'])->exists()) {
                $user = User::create([
                    'name' => $t['name'],
                    'email' => $t['email'],
                    'password' => Hash::make('password123'),
                    'role' => 'teacher',
                ]);

                // Create detail NIP
                TeacherDetail::create([
                    'user_id' => $user->id,
                    'nip' => $t['nip'],
                ]);
            }
        }
    }
}
