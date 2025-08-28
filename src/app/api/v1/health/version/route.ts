import { NextRequest, NextResponse } from 'next/server';

import packageJson from '../../../../../../package.json';

export async function GET(request: NextRequest) {
  try {
    return new NextResponse(packageJson.version, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    return new NextResponse('Internal server error', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}
