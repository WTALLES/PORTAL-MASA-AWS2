-- =============================================
-- INIT.SQL - Criação completa do banco MASA
-- =============================================

-- 1. Tabela de Administradores (com role)
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(30) DEFAULT 'editor',   -- 'admin' ou 'editor'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Notícias
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    image_url TEXT,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_by INTEGER REFERENCES admins(id),
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Denúncias/Reclamações
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    protocol VARCHAR(30) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    relation VARCHAR(100) NOT NULL,
    area VARCHAR(150) NOT NULL,
    category VARCHAR(100),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    occurrence_date DATE,
    is_identified BOOLEAN DEFAULT FALSE,
    reporter_name VARCHAR(150),
    reporter_email VARCHAR(150),
    reporter_phone VARCHAR(30),
    attached_files JSONB DEFAULT '[]'::JSONB,
    status VARCHAR(50) DEFAULT 'Recebido',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
CREATE INDEX IF NOT EXISTS idx_news_published ON news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_protocol ON reports(protocol);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at DESC);

-- =============================================
-- USUÁRIOS INICIAIS
-- =============================================

-- Administrador (admin@masaplasticos.com)
INSERT INTO admins (name, email, password_hash, role)
VALUES ('Administrador', 'admin@masaplasticos.com', '$2a$12$U57rAsrUjb8rQYvQH27Y.eAwLVOou4COyFh1p0bDh2lSwhrd3LAPm', 'admin')
ON CONFLICT (email) DO NOTHING;



-- Editor de Notícias 2 (e-mail oficial da empresa)
INSERT INTO admins (name, email, password_hash, role)
VALUES ('Editor de Notícias', 'rhnoticias@masaplasticos.com', '$2a$12$XYh/ettdhLJvz1917ruyKOgSPzAOPC3k95qmn7Q9KnCq7nxHXEbmW', 'editor')
ON CONFLICT (email) DO NOTHING;

-- Garante que o usuário admin@masaplasticos.com seja admin (caso já exista)
UPDATE admins 
SET role = 'admin' 
WHERE email = 'admin@masaplasticos.com';

-- =============================================
-- Verificação final
SELECT id, name, email, role FROM admins;