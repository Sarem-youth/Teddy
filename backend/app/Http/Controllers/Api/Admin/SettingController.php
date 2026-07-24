<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SettingController extends Controller
{
    public function index()
    {
        return response()->json(['settings' => Setting::allCached()]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'settings' => ['required', 'array'],
            'settings.*' => ['nullable', 'string', 'max:5000'],
        ]);

        foreach ($data['settings'] as $key => $value) {
            if (! preg_match('/^[a-z0-9_]{2,120}$/', $key)) {
                continue;
            }
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        Cache::forget('app_settings');

        return response()->json(['settings' => Setting::allCached()]);
    }
}
