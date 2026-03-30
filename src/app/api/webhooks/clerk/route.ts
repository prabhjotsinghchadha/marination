import { eq, sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import type { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/libs/DB';
import { Env } from '@/libs/Env';
import { logger } from '@/libs/Logger';
import { users } from '@/models/Schema';

type ClerkUserPayload = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  primary_email_address_id: string | null;
  email_addresses: Array<{
    id: string;
    email_address: string;
  }>;
};

function getDisplayNameFromEvent(data: ClerkUserPayload): string {
  const firstName = data.first_name?.trim();
  const lastName = data.last_name?.trim();
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

  if (fullName) {
    return fullName;
  }

  const username = data.username?.trim();

  if (username) {
    return username;
  }

  const primaryEmail = data.email_addresses.find(
    email => email.id === data.primary_email_address_id,
  )?.email_address;

  if (primaryEmail) {
    return primaryEmail.split('@')[0] ?? 'User';
  }

  return 'User';
}

function getPrimaryEmailFromEvent(data: ClerkUserPayload): string | null {
  return data.email_addresses.find(
    email => email.id === data.primary_email_address_id,
  )?.email_address ?? null;
}

export const POST = async (request: Request) => {
  const signingSecret = Env.CLERK_WEBHOOK_SIGNING_SECRET;

  if (!signingSecret) {
    logger.error('CLERK_WEBHOOK_SIGNING_SECRET is not set');
    return NextResponse.json({ message: 'Webhook secret is not configured' }, { status: 500 });
  }

  const requestHeaders = await headers();
  const svixId = requestHeaders.get('svix-id');
  const svixTimestamp = requestHeaders.get('svix-timestamp');
  const svixSignature = requestHeaders.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ message: 'Missing Svix headers' }, { status: 400 });
  }

  const payload = await request.text();

  let event: WebhookEvent;

  try {
    event = new Webhook(signingSecret).verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent;
  } catch {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'user.created' || event.type === 'user.updated') {
    const data = event.data as ClerkUserPayload;
    const email = getPrimaryEmailFromEvent(data);
    const displayName = getDisplayNameFromEvent(data);

    await db
      .insert(users)
      .values({
        authProvider: 'clerk',
        authSubject: data.id,
        email,
        displayName,
      })
      .onConflictDoUpdate({
        target: users.authSubject,
        set: {
          email,
          displayName,
          updatedAt: sql`now()`,
        },
      });

    logger.info('Clerk user synced to Neon', {
      eventType: event.type,
      authSubject: data.id,
    });
  }

  if (event.type === 'user.deleted') {
    const data = event.data as { id?: string | null };

    if (!data.id) {
      return NextResponse.json({ ok: true });
    }

    await db
      .delete(users)
      .where(eq(users.authSubject, data.id));
  }

  return NextResponse.json({ ok: true });
};

