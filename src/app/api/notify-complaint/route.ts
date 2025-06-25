import { NextRequest, NextResponse } from 'next/server';

// WhatsApp notification function (server-side only)
let sendWhatsAppNotification: Function | null = null;

try {
  // Dynamically import the notification function from WhatsApp bot
  const whatsappNotifications = require('../../../../../WhatsapWellness/config/firebase');
  sendWhatsAppNotification = whatsappNotifications.sendComplaintStatusNotification;
} catch (error) {
  console.log('WhatsApp notifications not available in this environment');
  sendWhatsAppNotification = null;
}

export async function POST(request: NextRequest) {
  try {
    const { studentPhone, complaintDetails, status, notes } = await request.json();

    if (!studentPhone || !complaintDetails || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (sendWhatsAppNotification) {
      try {
        await sendWhatsAppNotification(studentPhone, complaintDetails, status, notes);
        return NextResponse.json({ success: true, message: 'Notification sent successfully' });
      } catch (error) {
        console.error('Failed to send WhatsApp notification:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to send notification' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'WhatsApp notifications not available' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 