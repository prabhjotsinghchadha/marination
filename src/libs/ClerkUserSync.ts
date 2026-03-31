import { sql } from 'drizzle-orm';
import { currentUser, type User } from '@clerk/nextjs/server';
import { cache } from 'react';
import { db } from '@/libs/DB';
import { users } from '@/models/Schema';

/** Shape of `event.data` for Clerk `user.created` / `user.updated` webhooks (snake_case). */
export type ClerkWebhookUserPayload = {
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

function displayNameFromIdentity(props: {
  firstName: string | null | undefined;
  lastName: string | null | undefined;
  username: string | null | undefined;
  primaryEmail: string | null;
}): string {
  const fullName = [props.firstName?.trim(), props.lastName?.trim()]
    .filter(Boolean)
    .join(' ')
    .trim();

  if (fullName) {
    return fullName;
  }

  const username = props.username?.trim();

  if (username) {
    return username;
  }

  if (props.primaryEmail) {
    return props.primaryEmail.split('@')[0] ?? 'User';
  }

  return 'User';
}

function primaryEmailFromWebhook(data: ClerkWebhookUserPayload): string | null {
  return data.email_addresses.find(email => email.id === data.primary_email_address_id)
    ?.email_address ?? null;
}

function primaryEmailFromClerkUser(user: User): string | null {
  return user.emailAddresses.find(email => email.id === user.primaryEmailAddressId)
    ?.emailAddress ?? null;
}

/**
 * Inserts or updates the Neon `users` row for a Clerk identity.
 * Idempotent on `auth_subject`.
 */
export async function upsertClerkUserInDb(props: {
  authSubject: string;
  email: string | null;
  displayName: string;
}) {
  await db
    .insert(users)
    .values({
      authProvider: 'clerk',
      authSubject: props.authSubject,
      email: props.email,
      displayName: props.displayName,
    })
    .onConflictDoUpdate({
      target: users.authSubject,
      set: {
        email: props.email,
        displayName: props.displayName,
        updatedAt: sql`now()`,
      },
    });
}

/** Applies webhook `user.created` / `user.updated` payloads to Neon. */
export async function syncClerkUserFromWebhookPayload(data: ClerkWebhookUserPayload) {
  const email = primaryEmailFromWebhook(data);
  const displayName = displayNameFromIdentity({
    firstName: data.first_name,
    lastName: data.last_name,
    username: data.username,
    primaryEmail: email,
  });

  await upsertClerkUserInDb({
    authSubject: data.id,
    email,
    displayName,
  });
}

/**
 * Ensures the signed-in Clerk user exists in Neon. Use when webhooks are unavailable
 * (e.g. local dev) or as a backup to webhook delivery.
 */
export async function syncClerkUserFromClerkUser(user: User) {
  const email = primaryEmailFromClerkUser(user);
  const displayName = displayNameFromIdentity({
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    primaryEmail: email,
  });

  await upsertClerkUserInDb({
    authSubject: user.id,
    email,
    displayName,
  });
}

/**
 * Resolves the signed-in Clerk user once per request and upserts Neon. Requires
 * `clerkMiddleware` on the route (see `src/proxy.ts`).
 */
export const syncClerkUserIfAuthed = cache(async () => {
  const user = await currentUser();

  if (user) {
    await syncClerkUserFromClerkUser(user);
  }
});
