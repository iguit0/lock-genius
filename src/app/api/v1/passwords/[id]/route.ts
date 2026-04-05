import { type NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const password = await prisma.password.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!password) {
      return NextResponse.json({ error: 'Password not found' }, { status: 404 });
    }

    await prisma.password.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Password deleted successfully' });
  } catch (error) {
    console.error('Error deleting password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
