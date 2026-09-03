-- ============================================================
-- REVIVEAI — PostgreSQL / Supabase Database Schema
-- Production Schema for AI Revenue Recovery Controller
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Merchants (Tenants)
CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    business_email VARCHAR(255) UNIQUE NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    razorpay_account_id VARCHAR(100),
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Users & Roles
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'FINANCE_MANAGER', 'SUPPORT_AGENT', 'VIEWER')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Customers
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    external_customer_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    segment VARCHAR(50) DEFAULT 'SMB' CHECK (segment IN ('ENTERPRISE', 'SMB', 'STARTUP', 'CONSUMER')),
    tenure_days INT DEFAULT 0,
    previous_successes INT DEFAULT 0,
    previous_failures INT DEFAULT 0,
    historical_recovery_rate NUMERIC(5,4) DEFAULT 0.0000,
    customer_opted_out BOOLEAN DEFAULT FALSE,
    lifetime_value NUMERIC(12,2) DEFAULT 0.00,
    last_payment_days_ago INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    plan_name VARCHAR(255) NOT NULL,
    plan_amount NUMERIC(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    billing_cycle VARCHAR(50) DEFAULT 'MONTHLY',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    next_billing_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    due_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) DEFAULT 'ISSUED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    razorpay_payment_id VARCHAR(100),
    razorpay_order_id VARCHAR(100),
    amount NUMERIC(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    failure_reason VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Webhook Events (Raw Ingestion & Idempotency)
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
    source VARCHAR(50) DEFAULT 'RAZORPAY',
    event_id VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    signature VARCHAR(255),
    signature_verified BOOLEAN DEFAULT FALSE,
    processed BOOLEAN DEFAULT FALSE,
    idempotency_key VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Recovery Events (Normalized Events)
CREATE TABLE IF NOT EXISTS recovery_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_method VARCHAR(50) NOT NULL,
    failure_reason VARCHAR(100) NOT NULL,
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    source VARCHAR(50) DEFAULT 'RAZORPAY_WEBHOOK',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Model Versions
CREATE TABLE IF NOT EXISTS model_versions (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    algorithm VARCHAR(100) NOT NULL,
    precision NUMERIC(5,4),
    recall NUMERIC(5,4),
    f1_score NUMERIC(5,4),
    roc_auc NUMERIC(5,4),
    pr_auc NUMERIC(5,4),
    brier_score NUMERIC(5,4),
    is_active BOOLEAN DEFAULT FALSE,
    trained_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 10. Recovery Cases (Core State Machine Entity)
CREATE TABLE IF NOT EXISTS recovery_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    event_id UUID REFERENCES recovery_events(id),
    event_type VARCHAR(100) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_method VARCHAR(50) NOT NULL,
    failure_reason VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DETECTED' CHECK (
        status IN (
            'DETECTED', 'ANALYZING', 'PREDICTED', 'POLICY_REVIEW',
            'AWAITING_HUMAN', 'ACTION_READY', 'EXECUTING', 'VERIFYING',
            'RECOVERED', 'FAILED', 'STOPPED', 'ESCALATED'
        )
    ),
    days_overdue INT DEFAULT 0,
    retry_count INT DEFAULT 0,
    reminder_count INT DEFAULT 0,
    recovery_probability NUMERIC(5,4) DEFAULT 0.0000,
    risk_level VARCHAR(20) DEFAULT 'MEDIUM' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    expected_recovery_value NUMERIC(12,2) DEFAULT 0.00,
    ml_model_version VARCHAR(100) DEFAULT 'xgboost-v1',
    proposed_action VARCHAR(50) DEFAULT 'RETRY_PAYMENT',
    executed_action VARCHAR(50),
    action_id UUID,
    policy_decision VARCHAR(50) DEFAULT 'ALLOW',
    policy_reason TEXT,
    policy_version VARCHAR(50) DEFAULT 'policy-v1',
    recovered_amount NUMERIC(12,2) DEFAULT 0.00,
    intervention_cost NUMERIC(12,2) DEFAULT 0.00,
    actual_recovery_value NUMERIC(12,2) DEFAULT 0.00,
    outcome_verified BOOLEAN DEFAULT FALSE,
    outcome_status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 11. Predictions
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES recovery_cases(id) ON DELETE CASCADE,
    model_version VARCHAR(100) NOT NULL,
    recovery_probability NUMERIC(5,4) NOT NULL,
    risk_level VARCHAR(50) NOT NULL,
    features JSONB NOT NULL,
    contributing_factors JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. AI Decisions & Diagnoses
CREATE TABLE IF NOT EXISTS ai_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES recovery_cases(id) ON DELETE CASCADE,
    diagnosis TEXT NOT NULL,
    confidence NUMERIC(5,4) NOT NULL,
    recommended_action VARCHAR(50) NOT NULL,
    reasoning JSONB NOT NULL,
    customer_risk VARCHAR(50) NOT NULL,
    requires_human_review BOOLEAN DEFAULT FALSE,
    is_fallback BOOLEAN DEFAULT FALSE,
    model_name VARCHAR(100) DEFAULT 'gemini-3.8-flash',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Policy Decisions
CREATE TABLE IF NOT EXISTS policy_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES recovery_cases(id) ON DELETE CASCADE,
    decision VARCHAR(50) NOT NULL CHECK (decision IN ('ALLOW', 'HUMAN_REVIEW', 'STOP', 'ESCALATE')),
    reason TEXT NOT NULL,
    policy_version VARCHAR(50) NOT NULL,
    rules_evaluated JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Recovery Actions
CREATE TABLE IF NOT EXISTS recovery_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recovery_case_id UUID NOT NULL REFERENCES recovery_cases(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    result JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    executed_at TIMESTAMPTZ
);

-- 15. Human Reviews
CREATE TABLE IF NOT EXISTS human_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recovery_case_id UUID NOT NULL REFERENCES recovery_cases(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id),
    reviewer_name VARCHAR(255) NOT NULL,
    reviewer_role VARCHAR(50) NOT NULL,
    decision VARCHAR(50) NOT NULL CHECK (decision IN ('APPROVED', 'REJECTED', 'ESCALATED', 'STOPPED')),
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Audit Logs (Immutable)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES recovery_cases(id) ON DELETE SET NULL,
    actor_type VARCHAR(50) NOT NULL CHECK (actor_type IN ('SYSTEM', 'AI', 'USER', 'WEBHOOK')),
    actor_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    reason TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    model_version VARCHAR(100),
    policy_version VARCHAR(100),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Experiments (A/B Baseline vs ReviveAI Strategy)
CREATE TABLE IF NOT EXISTS experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    strategy_a VARCHAR(100) DEFAULT 'BASELINE_RETRY_ONCE',
    strategy_b VARCHAR(100) DEFAULT 'REVIVEAI_INTELLIGENT',
    sample_size INT DEFAULT 1000,
    baseline_recovered NUMERIC(12,2) DEFAULT 0.00,
    revive_recovered NUMERIC(12,2) DEFAULT 0.00,
    incremental_recovered NUMERIC(12,2) DEFAULT 0.00,
    actions_avoided INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ============================================================
-- INDEXES FOR SCALE & LOOKUP
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_customers_merchant ON customers(merchant_id);
CREATE INDEX IF NOT EXISTS idx_recovery_cases_merchant ON recovery_cases(merchant_id);
CREATE INDEX IF NOT EXISTS idx_recovery_cases_customer ON recovery_cases(customer_id);
CREATE INDEX IF NOT EXISTS idx_recovery_cases_status ON recovery_cases(status);
CREATE INDEX IF NOT EXISTS idx_recovery_cases_created ON recovery_cases(created_at);
CREATE INDEX IF NOT EXISTS idx_recovery_cases_probability ON recovery_cases(recovery_probability);
CREATE INDEX IF NOT EXISTS idx_recovery_cases_amount ON recovery_cases(amount);
CREATE INDEX IF NOT EXISTS idx_recovery_events_type ON recovery_events(event_type);
CREATE INDEX IF NOT EXISTS idx_recovery_events_idempotency ON recovery_events(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_webhook_events_idempotency ON webhook_events(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_recovery_actions_idempotency ON recovery_actions(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_audit_logs_case ON audit_logs(case_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
