/**
 * @jest-environment node
 */
import type { NextRequest } from 'next/server';
import { POST as generateRoute } from '@/app/api/v1/passwords/generate/route';
import { POST as saveRoute } from '@/app/api/v1/passwords/route';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

jest.mock('next/headers', () => ({
  headers: jest.fn(async () => new Headers()),
}));

jest.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}));

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    password: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

const mockGetSession = auth.api.getSession as unknown as jest.Mock;
const mockCreatePassword = prisma.password.create as unknown as jest.Mock;

const BASE_URL = 'http://localhost';

const jsonRequest = (path: string, body: unknown) =>
  new Request(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;

const invalidJsonRequest = (path: string) =>
  new Request(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{invalid-json',
  }) as unknown as NextRequest;

describe('POST /api/v1/passwords/generate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects all character sets disabled', async () => {
    const response = await generateRoute(
      jsonRequest('/api/v1/passwords/generate', {
        length: 12,
        uppercase: false,
        lowercase: false,
        numbers: false,
        symbols: false,
      })
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.detail).toBe('At least one option should be selected');
  });

  it('rejects out-of-range length', async () => {
    const response = await generateRoute(
      jsonRequest('/api/v1/passwords/generate', {
        length: 256,
        uppercase: true,
        lowercase: false,
        numbers: false,
        symbols: false,
      })
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(typeof body.detail).toBe('string');
  });

  it('rejects malformed JSON', async () => {
    const response = await generateRoute(invalidJsonRequest('/api/v1/passwords/generate'));

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.detail).toMatch(/invalid/i);
  });

  it('accepts a valid body and returns a password of the requested length', async () => {
    const response = await generateRoute(
      jsonRequest('/api/v1/passwords/generate', {
        length: 16,
        uppercase: true,
        lowercase: true,
        numbers: false,
        symbols: false,
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(typeof body.password).toBe('string');
    expect(body.password.length).toBe(16);
  });
});

describe('POST /api/v1/passwords', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects invalid authenticated payloads before Prisma writes', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user_123' } });

    const response = await saveRoute(
      jsonRequest('/api/v1/passwords', {
        password: 'short',
        length: 12,
        uppercase: true,
        lowercase: false,
        numbers: false,
        symbols: false,
      })
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(typeof body.error).toBe('string');
    expect(mockCreatePassword).not.toHaveBeenCalled();
  });

  it('rejects malformed JSON before Prisma writes', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user_123' } });

    const response = await saveRoute(invalidJsonRequest('/api/v1/passwords'));

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/invalid/i);
    expect(mockCreatePassword).not.toHaveBeenCalled();
  });

  it('accepts valid authenticated payloads and ignores extra id/createdAt keys', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user_123' } });
    mockCreatePassword.mockResolvedValue({
      id: 'pw_456',
      password: 'passw0rd',
      length: 8,
      uppercase: true,
      lowercase: true,
      numbers: false,
      symbols: false,
      userId: 'user_123',
      createdAt: new Date(),
    });

    const response = await saveRoute(
      jsonRequest('/api/v1/passwords', {
        password: 'passw0rd',
        length: 8,
        uppercase: true,
        lowercase: true,
        numbers: false,
        symbols: false,
        id: 'some-external-id',
        createdAt: new Date(),
      })
    );

    expect(response.status).toBe(201);
    expect(mockCreatePassword).toHaveBeenCalledTimes(1);
    const createCall = mockCreatePassword.mock.calls[0][0];
    expect(createCall.data).toHaveProperty('userId', 'user_123');
    expect(createCall.data).not.toHaveProperty('id');
    expect(createCall.data).not.toHaveProperty('createdAt');
  });
});
