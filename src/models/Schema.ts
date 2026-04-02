import {
  check,
  bigint,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// It automatically run the command `db-server:file`, which apply the migration before Next.js starts in development mode,
// Alternatively, if your database is running, you can run `npm run db:migrate` and there is no need to restart the server.

// Need a database for production? Check out https://www.prisma.io/?via=nextjsboilerplate
// Tested and compatible with Next.js Boilerplate

export const counterSchema = pgTable('counter', {
  id: serial('id').primaryKey(),
  count: integer('count').default(0),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// =============================================================================
// Users + Assets
// =============================================================================

/** Application role for dashboard access and moderation. Stored as lowercase text. */
export const USER_ROLES = ['admin', 'moderator', 'user'] as const;

/** New Clerk signups get this role unless `ADMIN_EMAILS` promotes them to `admin`. */
export const DEFAULT_USER_ROLE: (typeof USER_ROLES)[number] = 'user';

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    authProvider: text('auth_provider').notNull(),
    authSubject: text('auth_subject').notNull().unique(),
    email: text('email').unique(),
    displayName: text('display_name').notNull(),
    /** `admin` and `moderator` may use the staff dashboard; default is {@link DEFAULT_USER_ROLE} (trader). */
    role: text('role').notNull().default(DEFAULT_USER_ROLE),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    check('users_display_name_not_empty', sql`${t.displayName} <> ''`),
    check(
      'users_role_valid',
      sql`${t.role} IN ('admin', 'moderator', 'user')`,
    ),
  ],
);

/**
 * In v1 we only support USDC, but modeling as `assets` keeps the schema
 * extensible for future collateral assets / external chain tokens.
 */
export const assets = pgTable(
  'assets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    symbol: text('symbol').notNull().unique(), // ex: USDC
    name: text('name').notNull(),
    decimals: smallint('decimals').notNull(),
    chain: text('chain').notNull(),
    contractAddress: text('contract_address'),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [check('assets_decimals_range', sql`${t.decimals} >= 0 AND ${t.decimals} <= 18`)],
);

// =============================================================================
// Markets + Outcomes (binary CPMM-ready)
// =============================================================================

export const markets = pgTable(
  'markets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    creatorUserId: uuid('creator_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    collateralAssetId: uuid('collateral_asset_id')
      .notNull()
      .references(() => assets.id, { onDelete: 'restrict' }),

    status: text('status').notNull().default('DRAFT'),
    model: text('model').notNull().default('CPMM_BINARY'),

    question: text('question').notNull(),
    description: text('description'),
    slug: text('slug').notNull().unique(),

    startTime: timestamp('start_time', { mode: 'date', withTimezone: true }),
    endTime: timestamp('end_time', { mode: 'date', withTimezone: true }),

    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [check('markets_slug_not_empty', sql`${t.slug} <> ''`)],
);

export const marketOutcomes = pgTable(
  'market_outcomes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    marketId: uuid('market_id')
      .notNull()
      .references(() => markets.id, { onDelete: 'cascade' }),

    outcomeKey: text('outcome_key').notNull(), // YES|NO|OPTION_3...
    label: text('label').notNull(),

    payoutNumerator: bigint('payout_numerator', { mode: 'bigint' })
      .notNull()
      .default(sql`1`),
    payoutDenominator: bigint('payout_denominator', { mode: 'bigint' })
      .notNull()
      .default(sql`1`),

    sortOrder: smallint('sort_order').notNull().default(0),

    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    check(
      'market_outcomes_payout_denominator_positive',
      sql`${t.payoutDenominator} > 0`,
    ),
    check(
      'market_outcomes_payout_numerator_non_negative',
      sql`${t.payoutNumerator} >= 0`,
    ),
    uniqueIndex('market_outcomes_market_key_unique').on(t.marketId, t.outcomeKey),
    index('market_outcomes_market_sort').on(t.marketId, t.sortOrder),
  ],
);

// One-time resolution for each market (typical prediction market).
export const marketResolutions = pgTable(
  'market_resolutions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    marketId: uuid('market_id')
      .notNull()
      .unique()
      .references(() => markets.id, { onDelete: 'cascade' }),

    resolvedOutcomeId: uuid('resolved_outcome_id')
      .notNull()
      .references(() => marketOutcomes.id, { onDelete: 'restrict' }),

    resolvedByUserId: uuid('resolved_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),

    resolvedAt: timestamp('resolved_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),

    resolutionPayload: jsonb('resolution_payload').notNull().default(sql`'{}'::jsonb`),
  },
  (t) => [index('market_resolutions_market').on(t.marketId)],
);

/**
 * CPMM state for binary markets (mirrors `src/libs/amm.ts`).
 * We store pools as integers (atomic units) to avoid rounding drift.
 */
export const marketCpmmBinaryState = pgTable(
  'market_cpmm_binary_state',
  {
    marketId: uuid('market_id')
      .primaryKey()
      .references(() => markets.id, { onDelete: 'cascade' }),

    yesOutcomeId: uuid('yes_outcome_id')
      .notNull()
      .references(() => marketOutcomes.id, { onDelete: 'restrict' }),
    noOutcomeId: uuid('no_outcome_id')
      .notNull()
      .references(() => marketOutcomes.id, { onDelete: 'restrict' }),

    feeBps: smallint('fee_bps').notNull().default(0), // ex: 2% => 200

    yesPoolAmount: bigint('yes_pool_amount', { mode: 'bigint' })
      .notNull()
      .default(sql`0`),
    noPoolAmount: bigint('no_pool_amount', { mode: 'bigint' })
      .notNull()
      .default(sql`0`),
    feePoolAmount: bigint('fee_pool_amount', { mode: 'bigint' })
      .notNull()
      .default(sql`0`),

    k: numeric('k', { precision: 78, scale: 0, mode: 'bigint' })
      .notNull()
      .default(sql`0`),

    volumeCollateralAmount: bigint('volume_collateral_amount', { mode: 'bigint' })
      .notNull()
      .default(sql`0`),

    clock: bigint('clock', { mode: 'bigint' }).notNull().default(sql`0`),

    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    check(
      'market_cpmm_binary_state_yes_no_outcomes_distinct',
      sql`${t.yesOutcomeId} <> ${t.noOutcomeId}`,
    ),
    check(
      'market_cpmm_binary_state_fee_bps_valid',
      sql`${t.feeBps} >= 0 AND ${t.feeBps} < 10000`,
    ),
    check(
      'market_cpmm_binary_state_pools_non_negative',
      sql`${t.yesPoolAmount} >= 0 AND ${t.noPoolAmount} >= 0 AND ${t.feePoolAmount} >= 0`,
    ),
    check('market_cpmm_binary_state_clock_non_negative', sql`${t.clock} >= 0`),
  ],
);

// =============================================================================
// User wallets + cached balances (fast reads)
// =============================================================================

export const userWalletAddresses = pgTable(
  'user_wallet_addresses',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    assetId: uuid('asset_id')
      .notNull()
      .references(() => assets.id, { onDelete: 'restrict' }),
    chain: text('chain').notNull(),
    address: text('address').notNull(),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex('user_wallet_addresses_unique').on(t.userId, t.assetId, t.chain, t.address),
    index('user_wallet_addresses_user').on(t.userId),
  ],
);

export const userCollateralBalances = pgTable(
  'user_collateral_balances',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    assetId: uuid('asset_id')
      .notNull()
      .references(() => assets.id, { onDelete: 'restrict' }),

    availableAmount: bigint('available_amount', { mode: 'bigint' })
      .notNull()
      .default(sql`0`),
    reservedAmount: bigint('reserved_amount', { mode: 'bigint' })
      .notNull()
      .default(sql`0`),

    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    uniqueIndex('user_collateral_balances_pk').on(t.userId, t.assetId),
    check(
      'user_collateral_balances_non_negative',
      sql`${t.availableAmount} >= 0 AND ${t.reservedAmount} >= 0`,
    ),
  ],
);

export const userOutcomeShareBalances = pgTable(
  'user_outcome_share_balances',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    marketOutcomeId: uuid('market_outcome_id')
      .notNull()
      .references(() => marketOutcomes.id, { onDelete: 'cascade' }),
    sharesAmount: bigint('shares_amount', { mode: 'bigint' })
      .notNull()
      .default(sql`0`),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    uniqueIndex('user_outcome_share_balances_pk').on(t.userId, t.marketOutcomeId),
    check('user_outcome_share_balances_non_negative', sql`${t.sharesAmount} >= 0`),
  ],
);

export const userLpShareBalances = pgTable(
  'user_lp_share_balances',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    marketId: uuid('market_id')
      .notNull()
      .references(() => markets.id, { onDelete: 'cascade' }),
    lpSharesAmount: bigint('lp_shares_amount', { mode: 'bigint' })
      .notNull()
      .default(sql`0`),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    uniqueIndex('user_lp_share_balances_pk').on(t.userId, t.marketId),
    check('user_lp_share_balances_non_negative', sql`${t.lpSharesAmount} >= 0`),
  ],
);

// =============================================================================
// On-chain integration (optional later)
// =============================================================================

export const onchainTransfers = pgTable(
  'onchain_transfers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    assetId: uuid('asset_id')
      .notNull()
      .references(() => assets.id, { onDelete: 'restrict' }),
    chain: text('chain').notNull(),
    txHash: text('tx_hash').notNull(),
    logIndex: bigint('log_index', { mode: 'bigint' }).notNull(),
    fromAddress: text('from_address'),
    toAddress: text('to_address'),
    amountAtomic: bigint('amount_atomic', { mode: 'bigint' }).notNull(),
    blockNumber: bigint('block_number', { mode: 'bigint' }),
    status: text('status').notNull().default('SEEN'),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    check('onchain_transfers_amount_positive', sql`${t.amountAtomic} > 0`),
    uniqueIndex('onchain_transfers_unique_tx_log').on(t.txHash, t.logIndex),
    index('onchain_transfers_asset').on(t.assetId),
  ],
);

// =============================================================================
// Trades + Audit Ledger
// =============================================================================

export const trades = pgTable(
  'trades',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    marketId: uuid('market_id')
      .notNull()
      .references(() => markets.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Nullable for future order-book fills.
    orderId: uuid('order_id'),

    tradeType: text('trade_type').notNull().default('AMM_BUY'),
    outcomeId: uuid('outcome_id').references(() => marketOutcomes.id, {
      onDelete: 'restrict',
    }),

    collateralAssetId: uuid('collateral_asset_id')
      .notNull()
      .references(() => assets.id, { onDelete: 'restrict' }),

    collateralInAmount: bigint('collateral_in_amount', { mode: 'bigint' })
      .notNull()
      .default(sql`0`),
    collateralOutAmount: bigint('collateral_out_amount', { mode: 'bigint' })
      .notNull()
      .default(sql`0`),

    sharesInAmount: bigint('shares_in_amount', { mode: 'bigint' })
      .notNull()
      .default(sql`0`),
    sharesOutAmount: bigint('shares_out_amount', { mode: 'bigint' })
      .notNull()
      .default(sql`0`),

    feeAmount: bigint('fee_amount', { mode: 'bigint' }).notNull().default(sql`0`),

    // Fixed-point snapshots (optional but helpful for reconciliation).
    priceBeforeScaled: numeric('price_before_scaled', { precision: 38, scale: 18 })
      .notNull(),
    priceAfterScaled: numeric('price_after_scaled', { precision: 38, scale: 18 })
      .notNull(),

    yesPoolBefore: bigint('yes_pool_before', { mode: 'bigint' }),
    noPoolBefore: bigint('no_pool_before', { mode: 'bigint' }),
    yesPoolAfter: bigint('yes_pool_after', { mode: 'bigint' }),
    noPoolAfter: bigint('no_pool_after', { mode: 'bigint' }),

    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    check(
      'trades_amounts_non_negative',
      sql`
        ${t.collateralInAmount} >= 0 AND
        ${t.collateralOutAmount} >= 0 AND
        ${t.sharesInAmount} >= 0 AND
        ${t.sharesOutAmount} >= 0 AND
        ${t.feeAmount} >= 0
      `,
    ),
    index('trades_market_time').on(t.marketId, t.createdAt),
    index('trades_user_time').on(t.userId, t.createdAt),
  ],
);

export const payouts = pgTable(
  'payouts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    marketId: uuid('market_id')
      .notNull()
      .references(() => markets.id, { onDelete: 'cascade' }),
    winningOutcomeId: uuid('winning_outcome_id')
      .notNull()
      .references(() => marketOutcomes.id, { onDelete: 'restrict' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    sharesRedeemedAmount: bigint('shares_redeemed_amount', { mode: 'bigint' })
      .notNull(),
    collateralPayoutAmount: bigint('collateral_payout_amount', { mode: 'bigint' })
      .notNull(),

    status: text('status').notNull().default('CREATED'),
    claimLedgerTransactionId: uuid('claim_ledger_transaction_id'),

    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    claimedAt: timestamp('claimed_at', { mode: 'date', withTimezone: true }),
  },
  (t) => [
    check('payout_shares_non_negative', sql`${t.sharesRedeemedAmount} >= 0`),
    check('payout_collateral_non_negative', sql`${t.collateralPayoutAmount} >= 0`),
    check(
      'payout_is_1_to_1',
      sql`${t.collateralPayoutAmount} = ${t.sharesRedeemedAmount}`,
    ),
    index('payouts_market_user').on(t.marketId, t.userId),
  ],
);

export const ledgerTransactions = pgTable(
  'ledger_transactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    txType: text('tx_type').notNull(),
    status: text('status').notNull().default('PENDING'),

    initiatedByUserId: uuid('initiated_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),

    marketId: uuid('market_id').references(() => markets.id, { onDelete: 'set null' }),
    tradeId: uuid('trade_id').references(() => trades.id, { onDelete: 'set null' }),
    payoutId: uuid('payout_id').references(() => payouts.id, { onDelete: 'set null' }),

    onchainTransferId: uuid('onchain_transfer_id').references(() => onchainTransfers.id, {
      onDelete: 'set null',
    }),

    externalReference: text('external_reference'),

    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    postedAt: timestamp('posted_at', { mode: 'date', withTimezone: true }),
  },
  (t) => [index('ledger_transactions_user_time').on(t.userId, t.createdAt)],
);

export const balanceLedgerEntries = pgTable(
  'balance_ledger_entries',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    ledgerTransactionId: uuid('ledger_transaction_id')
      .notNull()
      .references(() => ledgerTransactions.id, { onDelete: 'cascade' }),

    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    balanceKind: text('balance_kind').notNull(),

    assetId: uuid('asset_id').references(() => assets.id, { onDelete: 'set null' }),
    marketOutcomeId: uuid('market_outcome_id').references(() => marketOutcomes.id, {
      onDelete: 'set null',
    }),
    marketId: uuid('market_id').references(() => markets.id, { onDelete: 'set null' }),

    deltaAmount: bigint('delta_amount', { mode: 'bigint' }).notNull(),
    beforeAmount: bigint('before_amount', { mode: 'bigint' }).notNull(),
    afterAmount: bigint('after_amount', { mode: 'bigint' }).notNull(),

    memo: text('memo'),

    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    check(
      'balance_ledger_entries_non_negative_before_after',
      sql`
        ${t.beforeAmount} >= 0 AND
        ${t.afterAmount} >= 0
      `,
    ),
    uniqueIndex('balance_ledger_entries_uniq').on(
      t.ledgerTransactionId,
      t.userId,
      t.balanceKind,
      t.assetId,
      t.marketOutcomeId,
      t.marketId,
    ),
    index('balance_ledger_entries_tx').on(t.ledgerTransactionId),
  ],
);

// =============================================================================
// Future: Orders (order-book style, optional later)
// =============================================================================

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    marketId: uuid('market_id')
      .notNull()
      .references(() => markets.id, { onDelete: 'cascade' }),
    outcomeId: uuid('outcome_id')
      .notNull()
      .references(() => marketOutcomes.id, { onDelete: 'restrict' }),

    side: text('side').notNull(), // BUY|SELL
    orderType: text('order_type').notNull().default('LIMIT'),

    limitPriceScaled: numeric('limit_price_scaled', { precision: 38, scale: 18 })
      .notNull(),

    amountCollateralAtomic: bigint('amount_collateral_atomic', { mode: 'bigint' }),
    amountSharesAtomic: bigint('amount_shares_atomic', { mode: 'bigint' }),

    status: text('status').notNull().default('OPEN'),

    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),

    cancelledReason: text('cancelled_reason'),
  },
  (t) => [index('orders_market_time').on(t.marketId, t.createdAt)],
);

// =============================================================================
// Market activity feed
// =============================================================================

export const marketEvents = pgTable(
  'market_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    marketId: uuid('market_id')
      .notNull()
      .references(() => markets.id, { onDelete: 'cascade' }),
    eventType: text('event_type').notNull(),
    actorUserId: uuid('actor_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    tradeId: uuid('trade_id').references(() => trades.id, { onDelete: 'set null' }),
    resolutionId: uuid('resolution_id').references(() => marketResolutions.id, {
      onDelete: 'set null',
    }),
    payload: jsonb('payload').notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index('market_events_market_time').on(t.marketId, t.createdAt)],
);
