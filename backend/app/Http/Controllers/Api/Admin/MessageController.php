<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $query = ContactMessage::query();

        if ($request->input('filter') === 'unread') {
            $query->where('is_read', false);
        }

        return response()->json($query->latest()->paginate((int) $request->input('per_page', 15))->withQueryString());
    }

    public function markRead(ContactMessage $message)
    {
        $message->update(['is_read' => true]);

        return response()->json(['message' => $message]);
    }

    public function destroy(ContactMessage $message)
    {
        $message->delete();

        return response()->json(['message' => 'Inquiry deleted.']);
    }
}
