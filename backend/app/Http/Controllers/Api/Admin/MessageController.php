<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $query = ContactMessage::query()->with('assignee:id,name,email');

        if ($request->input('filter') === 'unread') {
            $query->where('is_read', false);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->string('priority'));
        }

        if ($request->boolean('assigned_to_me')) {
            $query->where('assigned_to', $request->user()->id);
        }

        if ($request->filled('search')) {
            $term = '%' . str_replace(['%', '_'], ['\\%', '\\_'], $request->string('search')) . '%';
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', $term)
                    ->orWhere('email', 'like', $term)
                    ->orWhere('subject', 'like', $term)
                    ->orWhere('message', 'like', $term);
            });
        }

        return response()->json($query->latest()->paginate((int) $request->input('per_page', 15))->withQueryString());
    }

    public function update(Request $request, ContactMessage $message)
    {
        $data = $request->validate([
            'status' => ['sometimes', Rule::in(ContactMessage::STATUSES)],
            'priority' => ['sometimes', Rule::in(['low', 'normal', 'high', 'urgent'])],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
            'admin_notes' => ['nullable', 'string', 'max:5000'],
            'is_read' => ['sometimes', 'boolean'],
        ]);

        if (array_key_exists('status', $data) && in_array($data['status'], ['resolved', 'closed'], true) && $message->responded_at === null) {
            $data['responded_at'] = now();
            $data['is_read'] = true;
        }

        if (array_key_exists('assigned_to', $data) && $data['assigned_to'] !== null && ! array_key_exists('status', $data) && $message->status === 'new') {
            $data['status'] = 'in_progress';
        }

        $message->update($data);

        return response()->json([
            'message' => $message->fresh()->load('assignee:id,name,email'),
        ]);
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
