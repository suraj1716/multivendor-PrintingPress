<?php

namespace Database\Seeders;

use App\Models\User;
use App\Enums\RolesEnum;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'User',
            'email' => 'user@gmail.com',
            'password'=>'Qwerty123'
        ])->assignRole(RolesEnum::User->value);

        User::factory()->create([
            'name' => 'Vendor',
            'email' => 'vendor@gmail.com',
            'password'=>'Qwerty123'

        ])->assignRole(RolesEnum::Vendor->value);


        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@gmail.com',
            'password'=>'Qwerty123'

        ])->assignRole(RolesEnum::Admin->value);
    }
}
