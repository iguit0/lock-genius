import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const passwords = await prisma.password.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(passwords);
  } catch (error) {
    console.error('Error fetching passwords:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { password, length, uppercase, lowercase, numbers, symbols } = body;

    const newPassword = await prisma.password.create({
      data: {
        password,
        length,
        uppercase,
        lowercase,
        numbers,
        symbols,
        userId: session.user.id,
      },
    });

    return NextResponse.json(newPassword, { status: 201 });
  } catch (error) {
    console.error('Error saving password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
