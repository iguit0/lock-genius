import { NextRequest, NextResponse } from 'next/server';

interface GeneratePasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: GeneratePasswordOptions = await request.json();

    // Character sets matching Python backend
    const charSets = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~',
    };

    // Build selected character sets
    const selectedSets: string[] = [];

    if (body.uppercase) selectedSets.push(charSets.uppercase);
    if (body.lowercase) selectedSets.push(charSets.lowercase);
    if (body.numbers) selectedSets.push(charSets.numbers);
    if (body.symbols) selectedSets.push(charSets.symbols);

    // Validate at least one option is selected
    if (selectedSets.length === 0) {
      return NextResponse.json(
        { detail: 'At least one option should be selected' },
        { status: 400 }
      );
    }

    // Combine all selected character sets
    const chars = selectedSets.join('');

    // Generate cryptographically secure random password
    const password = Array.from({ length: body.length }, () => {
      const randomIndex = getSecureRandomInt(chars.length);
      return chars[randomIndex];
    }).join('');

    return NextResponse.json({ password }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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
