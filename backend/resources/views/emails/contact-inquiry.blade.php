<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 14px rgba(2,44,79,.12);">
                    <tr>
                        <td style="background:linear-gradient(135deg,#06304f,#0a5c9e);padding:26px 32px;">
                            <h1 style="margin:0;color:#ffffff;font-size:19px;">💧 New Website Inquiry</h1>
                            <p style="margin:6px 0 0;color:#bfe0f8;font-size:13px;">Teddy General Trading — Contact Form</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:28px 32px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#0f172a;">
                                <tr>
                                    <td style="padding:8px 0;color:#64748b;width:110px;">From</td>
                                    <td style="padding:8px 0;font-weight:bold;">{{ $inquiry->name }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 0;color:#64748b;">Email</td>
                                    <td style="padding:8px 0;"><a href="mailto:{{ $inquiry->email }}" style="color:#0a5c9e;">{{ $inquiry->email }}</a></td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 0;color:#64748b;">Subject</td>
                                    <td style="padding:8px 0;font-weight:bold;">{{ $inquiry->subject }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 0;color:#64748b;">Received</td>
                                    <td style="padding:8px 0;">{{ $inquiry->created_at->format('M d, Y H:i') }}</td>
                                </tr>
                            </table>
                            <div style="margin-top:18px;padding:18px;background:#f8fafc;border-left:4px solid #0a5c9e;border-radius:8px;font-size:14px;line-height:1.7;color:#334155;white-space:pre-line;">{{ $inquiry->message }}</div>
                            <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">Reply directly to this email to answer {{ $inquiry->name }}.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
