<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create multiple regular user accounts
        $users = [
            [
                'name'           => 'Admin User',
                'email'          => 'admin@example.com',
                'password'       => Hash::make('ad1min23$'), // Change 'admin' to a strong password
                'role'           => 'admin', // Ensures this user has admin privileges
                'is_active'      => true,
                'is_restricted'  => false,
            ],
            [
                'name'           => 'John Doe',
                'email'          => 'john.doe@example.com',
                'password'       => Hash::make('user123$'),
                'role'           => 'user',
                'is_active'      => true,
                'is_restricted'  => false,
            ],
            [
                'name'           => 'Jane Smith',
                'email'          => 'jane.smith@example.com',
                'password'       => Hash::make('user456$'),
                'role'           => 'user',
                'is_active'      => true,
                'is_restricted'  => false,
            ],
            [
                'name'           => 'Michael Johnson',
                'email'          => 'michael.johnson@example.com',
                'password'       => Hash::make('user789$'),
                'role'           => 'user',
                'is_active'      => true,
                'is_restricted'  => false,
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']], // Unique identifier
                $userData
            );
        }

        $this->command->info(count($users) . ' regular user accounts seeded successfully.');
    }
}
