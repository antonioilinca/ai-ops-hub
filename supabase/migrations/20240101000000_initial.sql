-- ─────────────────────────────────────────────────────────────────────────────
-- OpsAI — Schéma initial
-- Migration: 20240101000000_initial
-- ─────────────────────────────────────────────────────────────────────────────

-- Extension pgvector pour les embeddings RAG
CREATE EXTENSION IF NOT EXISTS vector;

-- ─── ORGANIZATIONS (tenants) ─────────────────────────────────────────────────

CREATE TABLE public.organizations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  slug                  TEXT NOT NULL UNIQUE,
  plan                  TEXT NOT NULL DEFAULT 'free'
                          CHECK (plan IN ('free', 'starter', 'team', 'enterprise')),
  stripe_customer_id    TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  subscription_status   TEXT NOT NULL DEFAULT 'inactive'
                          CHECK (subscription_status IN ('active', 'inactive', 'trialing', 'past_due', 'canceled')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── USERS (extension de auth.users Supabase) ────────────────────────────────

CREATE TABLE public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: auto-créer un user public quand Supabase crée un auth.user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── ORG MEMBERS (liaison users ↔ organizations + rôle RBAC) ─────────────────

CREATE TABLE public.org_members (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role         TEXT NOT NULL DEFAULT 'member'
                 CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  invited_by   UUID REFERENCES public.users(id),
  accepted_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (org_id, user_id)
);

-- ─── WORKFLOWS ───────────────────────────────────────────────────────────────

CREATE TABLE public.workflows (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL
                CHECK (type IN ('email_triage', 'meeting_summary', 'weekly_report', 'proposal_generator', 'qa_bot')),
  config      JSONB NOT NULL DEFAULT '{}',
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_by  UUID REFERENCES public.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── WORKFLOW RUNS (exécutions / jobs) ───────────────────────────────────────

CREATE TABLE public.workflow_runs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  workflow_id      UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'running', 'completed', 'failed', 'retrying')),
  trigger          TEXT,  -- 'manual', 'scheduled', 'webhook'
  input            JSONB,
  output           JSONB,
  error            TEXT,
  attempt          INT NOT NULL DEFAULT 1,
  idempotency_key  TEXT UNIQUE,  -- évite les doublons
  started_at       TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour requêtes fréquentes
CREATE INDEX idx_workflow_runs_org_status ON public.workflow_runs(org_id, status);
CREATE INDEX idx_workflow_runs_workflow_id ON public.workflow_runs(workflow_id);
CREATE INDEX idx_workflow_runs_created_at ON public.workflow_runs(created_at DESC);

-- ─── INTEGRATIONS (outils connectés) ─────────────────────────────────────────

CREATE TABLE public.integrations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  provider         TEXT NOT NULL
                     CHECK (provider IN ('gmail', 'google_drive', 'notion', 'hubspot', 'slack', 'outlook')),
  -- Tokens chiffrés côté application (AES-256) avant stockage
  access_token_enc  TEXT,
  refresh_token_enc TEXT,
  token_expires_at  TIMESTAMPTZ,
  config            JSONB NOT NULL DEFAULT '{}',
  connected_by      UUID REFERENCES public.users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (org_id, provider)
);

-- ─── AUDIT LOGS ──────────────────────────────────────────────────────────────

CREATE TABLE public.audit_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id        UUID REFERENCES public.users(id),
  action         TEXT NOT NULL,  -- ex: 'workflow.created', 'member.invited', 'plan.upgraded'
  resource_type  TEXT,           -- ex: 'workflow', 'org_member', 'integration'
  resource_id    UUID,
  metadata       JSONB NOT NULL DEFAULT '{}',
  ip_address     INET,
  user_agent     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour recherches audit
CREATE INDEX idx_audit_logs_org_id ON public.audit_logs(org_id, created_at DESC);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

-- ─── DOCUMENTS (pour RAG) ────────────────────────────────────────────────────

CREATE TABLE public.documents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  source       TEXT,     -- 'upload', 'google_drive', 'notion'
  source_id    TEXT,     -- ID externe (Google Drive file id, etc.)
  metadata     JSONB NOT NULL DEFAULT '{}',
  created_by   UUID REFERENCES public.users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── DOCUMENT CHUNKS (embeddings RAG) ────────────────────────────────────────

CREATE TABLE public.document_chunks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_id  UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  content      TEXT NOT NULL,
  chunk_index  INT NOT NULL,
  -- OpenAI text-embedding-3-small = 1536 dimensions
  embedding    VECTOR(1536),
  metadata     JSONB NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index HNSW pour recherche vectorielle rapide
CREATE INDEX idx_chunks_embedding ON public.document_chunks
  USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_chunks_org_doc ON public.document_chunks(org_id, document_id);

-- ─── ROW LEVEL SECURITY (RLS) — isolation multi-tenant ───────────────────────

ALTER TABLE public.organizations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_runs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks  ENABLE ROW LEVEL SECURITY;

-- ── Fonction helper: orgs accessibles par l'utilisateur courant ───────────────
CREATE OR REPLACE FUNCTION public.user_org_ids()
RETURNS SETOF UUID AS $$
  SELECT org_id FROM public.org_members
  WHERE user_id = auth.uid() AND accepted_at IS NOT NULL;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ── Fonction helper: rôle de l'utilisateur courant dans une org ───────────────
CREATE OR REPLACE FUNCTION public.user_role_in_org(p_org_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.org_members
  WHERE org_id = p_org_id AND user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ── RLS: organizations ────────────────────────────────────────────────────────
CREATE POLICY "users_see_own_orgs" ON public.organizations
  FOR SELECT USING (id IN (SELECT public.user_org_ids()));

CREATE POLICY "owners_update_org" ON public.organizations
  FOR UPDATE USING (public.user_role_in_org(id) = 'owner');

-- ── RLS: users ────────────────────────────────────────────────────────────────
CREATE POLICY "users_see_own_profile" ON public.users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_see_org_members_profiles" ON public.users
  FOR SELECT USING (
    id IN (
      SELECT user_id FROM public.org_members
      WHERE org_id IN (SELECT public.user_org_ids())
    )
  );

CREATE POLICY "users_update_own_profile" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- ── RLS: org_members ─────────────────────────────────────────────────────────
CREATE POLICY "members_see_own_org_members" ON public.org_members
  FOR SELECT USING (org_id IN (SELECT public.user_org_ids()));

CREATE POLICY "admins_insert_members" ON public.org_members
  FOR INSERT WITH CHECK (
    public.user_role_in_org(org_id) IN ('owner', 'admin')
  );

CREATE POLICY "admins_update_members" ON public.org_members
  FOR UPDATE USING (
    public.user_role_in_org(org_id) IN ('owner', 'admin')
  );

CREATE POLICY "owners_delete_members" ON public.org_members
  FOR DELETE USING (
    public.user_role_in_org(org_id) = 'owner'
  );

-- ── RLS: workflows (pattern réutilisé pour toutes les tables org-scoped) ──────
CREATE POLICY "org_members_see_workflows" ON public.workflows
  FOR SELECT USING (org_id IN (SELECT public.user_org_ids()));

CREATE POLICY "members_create_workflows" ON public.workflows
  FOR INSERT WITH CHECK (
    org_id IN (SELECT public.user_org_ids())
    AND public.user_role_in_org(org_id) IN ('owner', 'admin', 'member')
  );

CREATE POLICY "members_update_workflows" ON public.workflows
  FOR UPDATE USING (
    org_id IN (SELECT public.user_org_ids())
    AND public.user_role_in_org(org_id) IN ('owner', 'admin', 'member')
  );

CREATE POLICY "admins_delete_workflows" ON public.workflows
  FOR DELETE USING (
    public.user_role_in_org(org_id) IN ('owner', 'admin')
  );

-- ── RLS: workflow_runs ────────────────────────────────────────────────────────
CREATE POLICY "org_members_see_runs" ON public.workflow_runs
  FOR SELECT USING (org_id IN (SELECT public.user_org_ids()));

-- ── RLS: integrations ────────────────────────────────────────────────────────
CREATE POLICY "org_members_see_integrations" ON public.integrations
  FOR SELECT USING (org_id IN (SELECT public.user_org_ids()));

CREATE POLICY "admins_manage_integrations" ON public.integrations
  FOR ALL USING (
    public.user_role_in_org(org_id) IN ('owner', 'admin')
  );

-- ── RLS: audit_logs ───────────────────────────────────────────────────────────
CREATE POLICY "admins_see_audit_logs" ON public.audit_logs
  FOR SELECT USING (
    org_id IN (SELECT public.user_org_ids())
    AND public.user_role_in_org(org_id) IN ('owner', 'admin')
  );

-- ── RLS: documents & chunks ───────────────────────────────────────────────────
CREATE POLICY "org_members_see_documents" ON public.documents
  FOR SELECT USING (org_id IN (SELECT public.user_org_ids()));

CREATE POLICY "members_manage_documents" ON public.documents
  FOR ALL USING (
    org_id IN (SELECT public.user_org_ids())
    AND public.user_role_in_org(org_id) IN ('owner', 'admin', 'member')
  );

CREATE POLICY "org_members_see_chunks" ON public.document_chunks
  FOR SELECT USING (org_id IN (SELECT public.user_org_ids()));

-- ─── SERVICE ROLE POLICIES (pour le backend serveur / worker) ────────────────
-- Le service role bypasse RLS automatiquement dans Supabase

-- ─── TRIGGERS updated_at ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_organizations_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_workflows_updated_at BEFORE UPDATE ON public.workflows
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_integrations_updated_at BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── FONCTION RAG: recherche vectorielle ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.match_chunks(
  query_embedding VECTOR(1536),
  match_org_id    UUID,
  match_count     INT DEFAULT 5,
  similarity_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  id          UUID,
  document_id UUID,
  content     TEXT,
  metadata    JSONB,
  similarity  FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.content,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM public.document_chunks dc
  WHERE
    dc.org_id = match_org_id
    AND 1 - (dc.embedding <=> query_embedding) > similarity_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
