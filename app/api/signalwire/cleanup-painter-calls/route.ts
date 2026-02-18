import { NextRequest, NextResponse } from 'next/server';
import { getSignalWireConfig, listConferences } from '@/app/api/signalwire/_lib';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { painterDocId, keepConferenceId } = await request.json();
    const normalizedPainterDocId = String(painterDocId || '').trim();
    if (!normalizedPainterDocId) {
      return NextResponse.json(
        { error: 'painterDocId is required' },
        { status: 400 }
      );
    }

    const config = getSignalWireConfig();
    if (!config) {
      return NextResponse.json(
        { error: 'SignalWire credentials not configured' },
        { status: 500 }
      );
    }

    const conferences = await listConferences(config);
    const matches = conferences.filter((conference: any) => {
      const conferencePainter = String(conference?.meta?.painter_doc_id || '').trim();
      if (conferencePainter !== normalizedPainterDocId) return false;
      if (keepConferenceId && conference?.id === keepConferenceId) return false;
      return true;
    });

    let endedCount = 0;
    const errors: string[] = [];
    for (const conference of matches) {
      try {
        const response = await fetch(`https://${config.spaceUrl}/api/video/conferences/${conference.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Basic ${config.authHeader}`,
            Accept: 'application/json'
          }
        });
        if (response.ok || response.status === 404) {
          endedCount += 1;
        } else {
          errors.push(await response.text());
        }
      } catch (error) {
        errors.push((error as Error).message);
      }
    }

    return NextResponse.json({
      matched: matches.length,
      ended: endedCount,
      errors
    });
  } catch (error) {
    console.error('Cleanup painter calls API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

