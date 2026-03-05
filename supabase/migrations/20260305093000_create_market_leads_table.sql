-- Shared lead database for AI enablement prospecting.
CREATE TABLE IF NOT EXISTS public.market_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  sector TEXT NOT NULL,
  target_segment TEXT NOT NULL DEFAULT 'ETI and Enterprise',
  hq_country TEXT NOT NULL DEFAULT 'France',
  hq_city TEXT,
  website TEXT NOT NULL,
  contact_url TEXT,
  signal_title TEXT NOT NULL,
  signal_summary TEXT,
  signal_source_url TEXT NOT NULL,
  signal_date DATE,
  priority_score INT NOT NULL DEFAULT 50 CHECK (priority_score BETWEEN 0 AND 100),
  offer_angle TEXT,
  next_action TEXT,
  lead_status TEXT NOT NULL DEFAULT 'new'
    CHECK (lead_status IN ('new', 'to_contact', 'contacted', 'qualified', 'nurture', 'won', 'lost')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (company_name, signal_source_url)
);

CREATE INDEX IF NOT EXISTS idx_market_leads_priority
  ON public.market_leads (priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_market_leads_sector
  ON public.market_leads (sector);
CREATE INDEX IF NOT EXISTS idx_market_leads_status
  ON public.market_leads (lead_status);

ALTER TABLE public.market_leads ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'market_leads'
      AND policyname = 'authenticated_read_market_leads'
  ) THEN
    CREATE POLICY "authenticated_read_market_leads"
      ON public.market_leads
      FOR SELECT
      USING (auth.role() IN ('authenticated', 'service_role'));
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'market_leads'
      AND policyname = 'service_role_manage_market_leads'
  ) THEN
    CREATE POLICY "service_role_manage_market_leads"
      ON public.market_leads
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_market_leads_updated_at'
  ) THEN
    CREATE TRIGGER set_market_leads_updated_at
      BEFORE UPDATE ON public.market_leads
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;
