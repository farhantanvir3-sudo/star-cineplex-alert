import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkTicketAvailability } from '@/lib/scraper';
import { sendTicketAlert } from '@/lib/email';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const alerts = await prisma.alertRequest.findMany({
      where: {
        isFulfilled: false,
      },
    });

    const results = [];

    for (const alert of alerts) {
      const { isAvailable } = await checkTicketAvailability(alert.targetDate);
      
      if (isAvailable) {
        await sendTicketAlert(alert.targetDate);
        await prisma.alertRequest.update({
          where: { id: alert.id },
          data: { isFulfilled: true },
        });
        results.push({ id: alert.id, targetDate: alert.targetDate, status: 'fulfilled' });
      } else {
        results.push({ id: alert.id, targetDate: alert.targetDate, status: 'pending' });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
