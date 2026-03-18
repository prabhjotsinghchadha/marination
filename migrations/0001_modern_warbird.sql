CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"symbol" text NOT NULL,
	"name" text NOT NULL,
	"decimals" smallint NOT NULL,
	"chain" text NOT NULL,
	"contract_address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assets_symbol_unique" UNIQUE("symbol"),
	CONSTRAINT "assets_decimals_range" CHECK ("assets"."decimals" >= 0 AND "assets"."decimals" <= 18)
);
--> statement-breakpoint
CREATE TABLE "balance_ledger_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ledger_transaction_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"balance_kind" text NOT NULL,
	"asset_id" uuid,
	"market_outcome_id" uuid,
	"market_id" uuid,
	"delta_amount" bigint NOT NULL,
	"before_amount" bigint NOT NULL,
	"after_amount" bigint NOT NULL,
	"memo" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "balance_ledger_entries_non_negative_before_after" CHECK (
        "balance_ledger_entries"."before_amount" >= 0 AND
        "balance_ledger_entries"."after_amount" >= 0
      )
);
--> statement-breakpoint
CREATE TABLE "ledger_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tx_type" text NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"initiated_by_user_id" uuid,
	"user_id" uuid,
	"market_id" uuid,
	"trade_id" uuid,
	"payout_id" uuid,
	"onchain_transfer_id" uuid,
	"external_reference" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"posted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "market_cpmm_binary_state" (
	"market_id" uuid PRIMARY KEY NOT NULL,
	"yes_outcome_id" uuid NOT NULL,
	"no_outcome_id" uuid NOT NULL,
	"fee_bps" smallint DEFAULT 0 NOT NULL,
	"yes_pool_amount" bigint DEFAULT 0 NOT NULL,
	"no_pool_amount" bigint DEFAULT 0 NOT NULL,
	"fee_pool_amount" bigint DEFAULT 0 NOT NULL,
	"k" numeric(78, 0) DEFAULT 0 NOT NULL,
	"volume_collateral_amount" bigint DEFAULT 0 NOT NULL,
	"clock" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "market_cpmm_binary_state_yes_no_outcomes_distinct" CHECK ("market_cpmm_binary_state"."yes_outcome_id" <> "market_cpmm_binary_state"."no_outcome_id"),
	CONSTRAINT "market_cpmm_binary_state_fee_bps_valid" CHECK ("market_cpmm_binary_state"."fee_bps" >= 0 AND "market_cpmm_binary_state"."fee_bps" < 10000),
	CONSTRAINT "market_cpmm_binary_state_pools_non_negative" CHECK ("market_cpmm_binary_state"."yes_pool_amount" >= 0 AND "market_cpmm_binary_state"."no_pool_amount" >= 0 AND "market_cpmm_binary_state"."fee_pool_amount" >= 0),
	CONSTRAINT "market_cpmm_binary_state_clock_non_negative" CHECK ("market_cpmm_binary_state"."clock" >= 0)
);
--> statement-breakpoint
CREATE TABLE "market_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"market_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"actor_user_id" uuid,
	"trade_id" uuid,
	"resolution_id" uuid,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_outcomes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"market_id" uuid NOT NULL,
	"outcome_key" text NOT NULL,
	"label" text NOT NULL,
	"payout_numerator" bigint DEFAULT 1 NOT NULL,
	"payout_denominator" bigint DEFAULT 1 NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "market_outcomes_payout_denominator_positive" CHECK ("market_outcomes"."payout_denominator" > 0),
	CONSTRAINT "market_outcomes_payout_numerator_non_negative" CHECK ("market_outcomes"."payout_numerator" >= 0)
);
--> statement-breakpoint
CREATE TABLE "market_resolutions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"market_id" uuid NOT NULL,
	"resolved_outcome_id" uuid NOT NULL,
	"resolved_by_user_id" uuid,
	"resolved_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolution_payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "market_resolutions_market_id_unique" UNIQUE("market_id")
);
--> statement-breakpoint
CREATE TABLE "markets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_user_id" uuid NOT NULL,
	"collateral_asset_id" uuid NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"model" text DEFAULT 'CPMM_BINARY' NOT NULL,
	"question" text NOT NULL,
	"description" text,
	"slug" text NOT NULL,
	"start_time" timestamp with time zone,
	"end_time" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "markets_slug_unique" UNIQUE("slug"),
	CONSTRAINT "markets_slug_not_empty" CHECK ("markets"."slug" <> '')
);
--> statement-breakpoint
CREATE TABLE "onchain_transfers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" uuid NOT NULL,
	"chain" text NOT NULL,
	"tx_hash" text NOT NULL,
	"log_index" bigint NOT NULL,
	"from_address" text,
	"to_address" text,
	"amount_atomic" bigint NOT NULL,
	"block_number" bigint,
	"status" text DEFAULT 'SEEN' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "onchain_transfers_amount_positive" CHECK ("onchain_transfers"."amount_atomic" > 0)
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"market_id" uuid NOT NULL,
	"outcome_id" uuid NOT NULL,
	"side" text NOT NULL,
	"order_type" text DEFAULT 'LIMIT' NOT NULL,
	"limit_price_scaled" numeric(38, 18) NOT NULL,
	"amount_collateral_atomic" bigint,
	"amount_shares_atomic" bigint,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"cancelled_reason" text
);
--> statement-breakpoint
CREATE TABLE "payouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"market_id" uuid NOT NULL,
	"winning_outcome_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"shares_redeemed_amount" bigint NOT NULL,
	"collateral_payout_amount" bigint NOT NULL,
	"status" text DEFAULT 'CREATED' NOT NULL,
	"claim_ledger_transaction_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"claimed_at" timestamp with time zone,
	CONSTRAINT "payout_shares_non_negative" CHECK ("payouts"."shares_redeemed_amount" >= 0),
	CONSTRAINT "payout_collateral_non_negative" CHECK ("payouts"."collateral_payout_amount" >= 0),
	CONSTRAINT "payout_is_1_to_1" CHECK ("payouts"."collateral_payout_amount" = "payouts"."shares_redeemed_amount")
);
--> statement-breakpoint
CREATE TABLE "trades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"market_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"order_id" uuid,
	"trade_type" text DEFAULT 'AMM_BUY' NOT NULL,
	"outcome_id" uuid,
	"collateral_asset_id" uuid NOT NULL,
	"collateral_in_amount" bigint DEFAULT 0 NOT NULL,
	"collateral_out_amount" bigint DEFAULT 0 NOT NULL,
	"shares_in_amount" bigint DEFAULT 0 NOT NULL,
	"shares_out_amount" bigint DEFAULT 0 NOT NULL,
	"fee_amount" bigint DEFAULT 0 NOT NULL,
	"price_before_scaled" numeric(38, 18) NOT NULL,
	"price_after_scaled" numeric(38, 18) NOT NULL,
	"yes_pool_before" bigint,
	"no_pool_before" bigint,
	"yes_pool_after" bigint,
	"no_pool_after" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trades_amounts_non_negative" CHECK (
        "trades"."collateral_in_amount" >= 0 AND
        "trades"."collateral_out_amount" >= 0 AND
        "trades"."shares_in_amount" >= 0 AND
        "trades"."shares_out_amount" >= 0 AND
        "trades"."fee_amount" >= 0
      )
);
--> statement-breakpoint
CREATE TABLE "user_collateral_balances" (
	"user_id" uuid NOT NULL,
	"asset_id" uuid NOT NULL,
	"available_amount" bigint DEFAULT 0 NOT NULL,
	"reserved_amount" bigint DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_collateral_balances_non_negative" CHECK ("user_collateral_balances"."available_amount" >= 0 AND "user_collateral_balances"."reserved_amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "user_lp_share_balances" (
	"user_id" uuid NOT NULL,
	"market_id" uuid NOT NULL,
	"lp_shares_amount" bigint DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_lp_share_balances_non_negative" CHECK ("user_lp_share_balances"."lp_shares_amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "user_outcome_share_balances" (
	"user_id" uuid NOT NULL,
	"market_outcome_id" uuid NOT NULL,
	"shares_amount" bigint DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_outcome_share_balances_non_negative" CHECK ("user_outcome_share_balances"."shares_amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "user_wallet_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"asset_id" uuid NOT NULL,
	"chain" text NOT NULL,
	"address" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_provider" text NOT NULL,
	"auth_subject" text NOT NULL,
	"email" text,
	"display_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_auth_subject_unique" UNIQUE("auth_subject"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_display_name_not_empty" CHECK ("users"."display_name" <> '')
);
--> statement-breakpoint
ALTER TABLE "balance_ledger_entries" ADD CONSTRAINT "balance_ledger_entries_ledger_transaction_id_ledger_transactions_id_fk" FOREIGN KEY ("ledger_transaction_id") REFERENCES "public"."ledger_transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_ledger_entries" ADD CONSTRAINT "balance_ledger_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_ledger_entries" ADD CONSTRAINT "balance_ledger_entries_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_ledger_entries" ADD CONSTRAINT "balance_ledger_entries_market_outcome_id_market_outcomes_id_fk" FOREIGN KEY ("market_outcome_id") REFERENCES "public"."market_outcomes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_ledger_entries" ADD CONSTRAINT "balance_ledger_entries_market_id_markets_id_fk" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_transactions" ADD CONSTRAINT "ledger_transactions_initiated_by_user_id_users_id_fk" FOREIGN KEY ("initiated_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_transactions" ADD CONSTRAINT "ledger_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_transactions" ADD CONSTRAINT "ledger_transactions_market_id_markets_id_fk" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_transactions" ADD CONSTRAINT "ledger_transactions_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_transactions" ADD CONSTRAINT "ledger_transactions_payout_id_payouts_id_fk" FOREIGN KEY ("payout_id") REFERENCES "public"."payouts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_transactions" ADD CONSTRAINT "ledger_transactions_onchain_transfer_id_onchain_transfers_id_fk" FOREIGN KEY ("onchain_transfer_id") REFERENCES "public"."onchain_transfers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_cpmm_binary_state" ADD CONSTRAINT "market_cpmm_binary_state_market_id_markets_id_fk" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_cpmm_binary_state" ADD CONSTRAINT "market_cpmm_binary_state_yes_outcome_id_market_outcomes_id_fk" FOREIGN KEY ("yes_outcome_id") REFERENCES "public"."market_outcomes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_cpmm_binary_state" ADD CONSTRAINT "market_cpmm_binary_state_no_outcome_id_market_outcomes_id_fk" FOREIGN KEY ("no_outcome_id") REFERENCES "public"."market_outcomes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_events" ADD CONSTRAINT "market_events_market_id_markets_id_fk" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_events" ADD CONSTRAINT "market_events_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_events" ADD CONSTRAINT "market_events_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_events" ADD CONSTRAINT "market_events_resolution_id_market_resolutions_id_fk" FOREIGN KEY ("resolution_id") REFERENCES "public"."market_resolutions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_outcomes" ADD CONSTRAINT "market_outcomes_market_id_markets_id_fk" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_resolutions" ADD CONSTRAINT "market_resolutions_market_id_markets_id_fk" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_resolutions" ADD CONSTRAINT "market_resolutions_resolved_outcome_id_market_outcomes_id_fk" FOREIGN KEY ("resolved_outcome_id") REFERENCES "public"."market_outcomes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_resolutions" ADD CONSTRAINT "market_resolutions_resolved_by_user_id_users_id_fk" FOREIGN KEY ("resolved_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "markets" ADD CONSTRAINT "markets_creator_user_id_users_id_fk" FOREIGN KEY ("creator_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "markets" ADD CONSTRAINT "markets_collateral_asset_id_assets_id_fk" FOREIGN KEY ("collateral_asset_id") REFERENCES "public"."assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onchain_transfers" ADD CONSTRAINT "onchain_transfers_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_market_id_markets_id_fk" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_outcome_id_market_outcomes_id_fk" FOREIGN KEY ("outcome_id") REFERENCES "public"."market_outcomes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_market_id_markets_id_fk" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_winning_outcome_id_market_outcomes_id_fk" FOREIGN KEY ("winning_outcome_id") REFERENCES "public"."market_outcomes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_market_id_markets_id_fk" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_outcome_id_market_outcomes_id_fk" FOREIGN KEY ("outcome_id") REFERENCES "public"."market_outcomes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_collateral_asset_id_assets_id_fk" FOREIGN KEY ("collateral_asset_id") REFERENCES "public"."assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_collateral_balances" ADD CONSTRAINT "user_collateral_balances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_collateral_balances" ADD CONSTRAINT "user_collateral_balances_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_lp_share_balances" ADD CONSTRAINT "user_lp_share_balances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_lp_share_balances" ADD CONSTRAINT "user_lp_share_balances_market_id_markets_id_fk" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_outcome_share_balances" ADD CONSTRAINT "user_outcome_share_balances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_outcome_share_balances" ADD CONSTRAINT "user_outcome_share_balances_market_outcome_id_market_outcomes_id_fk" FOREIGN KEY ("market_outcome_id") REFERENCES "public"."market_outcomes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_wallet_addresses" ADD CONSTRAINT "user_wallet_addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_wallet_addresses" ADD CONSTRAINT "user_wallet_addresses_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "balance_ledger_entries_uniq" ON "balance_ledger_entries" USING btree ("ledger_transaction_id","user_id","balance_kind","asset_id","market_outcome_id","market_id");--> statement-breakpoint
CREATE INDEX "balance_ledger_entries_tx" ON "balance_ledger_entries" USING btree ("ledger_transaction_id");--> statement-breakpoint
CREATE INDEX "ledger_transactions_user_time" ON "ledger_transactions" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "market_events_market_time" ON "market_events" USING btree ("market_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "market_outcomes_market_key_unique" ON "market_outcomes" USING btree ("market_id","outcome_key");--> statement-breakpoint
CREATE INDEX "market_outcomes_market_sort" ON "market_outcomes" USING btree ("market_id","sort_order");--> statement-breakpoint
CREATE INDEX "market_resolutions_market" ON "market_resolutions" USING btree ("market_id");--> statement-breakpoint
CREATE UNIQUE INDEX "onchain_transfers_unique_tx_log" ON "onchain_transfers" USING btree ("tx_hash","log_index");--> statement-breakpoint
CREATE INDEX "onchain_transfers_asset" ON "onchain_transfers" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "orders_market_time" ON "orders" USING btree ("market_id","created_at");--> statement-breakpoint
CREATE INDEX "payouts_market_user" ON "payouts" USING btree ("market_id","user_id");--> statement-breakpoint
CREATE INDEX "trades_market_time" ON "trades" USING btree ("market_id","created_at");--> statement-breakpoint
CREATE INDEX "trades_user_time" ON "trades" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_collateral_balances_pk" ON "user_collateral_balances" USING btree ("user_id","asset_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_lp_share_balances_pk" ON "user_lp_share_balances" USING btree ("user_id","market_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_outcome_share_balances_pk" ON "user_outcome_share_balances" USING btree ("user_id","market_outcome_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_wallet_addresses_unique" ON "user_wallet_addresses" USING btree ("user_id","asset_id","chain","address");--> statement-breakpoint
CREATE INDEX "user_wallet_addresses_user" ON "user_wallet_addresses" USING btree ("user_id");