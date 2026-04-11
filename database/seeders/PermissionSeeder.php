<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    private const ACTIONS = ['view', 'create', 'update', 'delete'];

    private const MODULES = [
        // Menu
        'dashboard',
        'calendar',

        // Master
        'event',
        'catalog',
        'addon',
        'speaker',
        'venue',
        'voucher',
        'event_template',
        'article',
        'faq',
        'subscription_plan',
        'subscription_feature',

        // Operational
        'order',
        'customer',
        'check_in',
        'testimonial',
        'survey',
        'subscription_order',

        // Setting
        'landing_page',
        'operational_setting',
        'setting',
        'role',
        'user',
        'page',
    ];

    public function run(): void
    {
        foreach (self::MODULES as $module) {
            foreach (self::ACTIONS as $action) {
                Permission::firstOrCreate([
                    'name' => "{$module}.{$action}",
                    'guard_name' => 'web',
                ]);
            }
        }

        $superAdmin = Role::firstOrCreate([
            'name' => 'super-admin',
            'guard_name' => 'web',
        ]);

        $superAdmin->syncPermissions(Permission::all());
    }
}
