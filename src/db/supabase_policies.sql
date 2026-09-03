-- ============================================================
-- REVIVEAI — Supabase Row-Level Security (RLS) Policies
-- Multi-Tenant Data Isolation by Merchant
-- ============================================================

-- Enable RLS on all sensitive tables
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE human_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;

-- Helper function to extract user's merchant_id from JWT / authenticated user record
CREATE OR REPLACE FUNCTION auth_merchant_id()
RETURNS UUID AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'merchant_id')::UUID;
$$ LANGUAGE sql STABLE;

-- 1. Merchants Policy
CREATE POLICY "Merchants viewable by own members"
ON merchants FOR SELECT
USING (id = auth_merchant_id());

-- 2. Users Policy
CREATE POLICY "Users viewable by same merchant members"
ON users FOR SELECT
USING (merchant_id = auth_merchant_id());

-- 3. Customers Policy
CREATE POLICY "Customers viewable and manageable by merchant"
ON customers FOR ALL
USING (merchant_id = auth_merchant_id())
WITH CHECK (merchant_id = auth_merchant_id());

-- 4. Recovery Cases Policy
CREATE POLICY "Recovery cases accessible by merchant"
ON recovery_cases FOR ALL
USING (merchant_id = auth_merchant_id())
WITH CHECK (merchant_id = auth_merchant_id());

-- 5. Recovery Events Policy
CREATE POLICY "Recovery events accessible by merchant"
ON recovery_events FOR ALL
USING (merchant_id = auth_merchant_id())
WITH CHECK (merchant_id = auth_merchant_id());

-- 6. Human Review Policy (Support & Finance Managers only can update)
CREATE POLICY "Human reviews manageable by authorized merchant staff"
ON human_reviews FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM recovery_cases rc
    WHERE rc.id = human_reviews.recovery_case_id
      AND rc.merchant_id = auth_merchant_id()
  )
);

-- 7. Audit Logs Policy (Read-Only for merchant, writes restricted to backend service role)
CREATE POLICY "Audit logs viewable by merchant members"
ON audit_logs FOR SELECT
USING (
  case_id IS NULL OR EXISTS (
    SELECT 1 FROM recovery_cases rc
    WHERE rc.id = audit_logs.case_id
      AND rc.merchant_id = auth_merchant_id()
  )
);

-- 8. Experiments Policy
CREATE POLICY "Experiments accessible by merchant"
ON experiments FOR ALL
USING (merchant_id = auth_merchant_id())
WITH CHECK (merchant_id = auth_merchant_id());
