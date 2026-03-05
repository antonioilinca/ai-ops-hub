-- Prospecting-oriented fields to turn leads into an actionable pipeline.
ALTER TABLE public.market_leads
  ADD COLUMN IF NOT EXISTS icp_fit_score INT CHECK (icp_fit_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS buying_intent_score INT CHECK (buying_intent_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS ease_of_access_score INT CHECK (ease_of_access_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS lead_temperature TEXT NOT NULL DEFAULT 'warm'
    CHECK (lead_temperature IN ('cold', 'warm', 'hot')),
  ADD COLUMN IF NOT EXISTS pipeline_stage TEXT NOT NULL DEFAULT 'sourced'
    CHECK (pipeline_stage IN ('sourced', 'enriched', 'ready_to_contact', 'contacted', 'meeting_booked', 'proposal_sent', 'won', 'lost')),
  ADD COLUMN IF NOT EXISTS enrichment_status TEXT NOT NULL DEFAULT 'todo'
    CHECK (enrichment_status IN ('todo', 'in_progress', 'done')),
  ADD COLUMN IF NOT EXISTS owner_name TEXT,
  ADD COLUMN IF NOT EXISTS decision_maker_name TEXT,
  ADD COLUMN IF NOT EXISTS decision_maker_title TEXT,
  ADD COLUMN IF NOT EXISTS decision_maker_linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS preferred_channel TEXT
    CHECK (preferred_channel IN ('email', 'linkedin', 'phone', 'partner', 'event', 'unknown')),
  ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS next_follow_up_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_market_leads_pipeline_stage
  ON public.market_leads (pipeline_stage);

CREATE INDEX IF NOT EXISTS idx_market_leads_next_follow_up
  ON public.market_leads (next_follow_up_at);

CREATE OR REPLACE VIEW public.market_leads_queue AS
SELECT
  id,
  company_name,
  sector,
  target_segment,
  hq_country,
  hq_city,
  website,
  contact_url,
  signal_title,
  signal_source_url,
  signal_date,
  priority_score,
  icp_fit_score,
  buying_intent_score,
  ease_of_access_score,
  ROUND(
    (
      COALESCE(icp_fit_score, priority_score) * 0.50
      + COALESCE(buying_intent_score, priority_score) * 0.35
      + COALESCE(
          ease_of_access_score,
          CASE
            WHEN target_segment = 'SMB and Mid-market' THEN 75
            ELSE 55
          END
        ) * 0.15
    )::numeric,
    0
  )::INT AS prospect_score,
  lead_temperature,
  pipeline_stage,
  enrichment_status,
  owner_name,
  decision_maker_name,
  decision_maker_title,
  decision_maker_linkedin_url,
  contact_email,
  contact_phone,
  preferred_channel,
  last_contacted_at,
  next_follow_up_at,
  lead_status,
  next_action,
  notes,
  created_at,
  updated_at
FROM public.market_leads
WHERE lead_status NOT IN ('won', 'lost');
