import { type NextRequest, NextResponse } from 'next/server';

import { passwordOptionsSchema } from '@/lib/password-schemas';

export async function POST(request: NextRequest) {
  try {
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ detail: 'Invalid JSON request body' }, { status: 400 });
    }

    const parsed = passwordOptionsSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { detail: parsed.error.issues[0]?.message || 'Invalid request body' },
        { status: 400 }
      );
    }

    const { length, uppercase, lowercase, numbers, symbols } = parsed.data;
    const charSets = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~',
    };

    // Build selected character sets
    const selectedSets: string[] = [];

    if (uppercase) selectedSets.push(charSets.uppercase);
    if (lowercase) selectedSets.push(charSets.lowercase);
    if (numbers) selectedSets.push(charSets.numbers);
    if (symbols) selectedSets.push(charSets.symbols);

    // Combine all selected character sets
    const chars = selectedSets.join('');

    // Generate cryptographically secure random password
    const password = Array.from({ length: length }, () => {
      const randomIndex = getSecureRandomInt(chars.length);
      return chars[randomIndex];
    }).join('');

    return NextResponse.json({ password }, { status: 200 });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Generate a cryptographically secure random integer between 0 (inclusive) and max (exclusive)
 * Using Web Crypto API for security equivalent to Python's secrets.choice()
 */
function getSecureRandomInt(max: number): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
}
