-- Ajoute lead_qualifier comme type de workflow valide
ALTER TABLE public.workflows
  DROP CONSTRAINT IF EXISTS workflows_type_check;

ALTER TABLE public.workflows
  ADD CONSTRAINT workflows_type_check
  CHECK (type IN ('email_triage', 'meeting_summary', 'weekly_report', 'proposal_generator', 'qa_bot', 'lead_qualifier'));
