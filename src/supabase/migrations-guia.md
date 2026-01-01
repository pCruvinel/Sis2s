# 🔄 Guia de Migrações do Banco de Dados

## Sistema ERP Grupo 2S - Supabase Migrations

---

## 📋 Índice

1. [Como Fazer Migrations](#como-fazer-migrations)
2. [Exemplos de Migrations Comuns](#exemplos-de-migrations-comuns)
3. [Rollback e Recuperação](#rollback-e-recuperação)
4. [Boas Práticas](#boas-práticas)

---

## 🚀 Como Fazer Migrations

### Via Supabase CLI

```bash
# 1. Criar uma nova migration
supabase migration new nome_da_migration

# 2. Editar o arquivo criado em supabase/migrations/
# Exemplo: supabase/migrations/20250117_add_campo_exemplo.sql

# 3. Aplicar a migration
supabase db push

# 4. Verificar status
supabase db status
```

### Via Supabase Dashboard

1. Acesse o **SQL Editor** no dashboard
2. Cole o script SQL
3. Clique em **RUN** (ou Ctrl+Enter)
4. Verifique os resultados

---

## 📝 Exemplos de Migrations Comuns

### 1. Adicionar Nova Coluna

```sql
-- Migration: Adicionar campo telefone_secundario em clientes
-- Data: 2025-01-17

-- Adicionar coluna
ALTER TABLE clientes 
ADD COLUMN telefone_secundario VARCHAR(20);

-- Criar índice se necessário
CREATE INDEX idx_clientes_telefone_secundario 
ON clientes(telefone_secundario) 
WHERE telefone_secundario IS NOT NULL;

-- Comentário
COMMENT ON COLUMN clientes.telefone_secundario IS 'Telefone secundário do cliente';
```

### 2. Modificar Tipo de Coluna

```sql
-- Migration: Alterar tamanho do campo observacoes
-- Data: 2025-01-17

-- Aumentar limite de caracteres
ALTER TABLE materiais 
ALTER COLUMN observacoes TYPE TEXT;

-- Se precisar converter dados
UPDATE materiais 
SET observacoes = LEFT(observacoes, 500) 
WHERE LENGTH(observacoes) > 500;
```

### 3. Adicionar Nova Tabela

```sql
-- Migration: Criar tabela de mensagens
-- Data: 2025-01-17

CREATE TABLE mensagens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id VARCHAR(50) NOT NULL REFERENCES empresas(id),
  usuario_remetente_id UUID REFERENCES users(id),
  usuario_destinatario_id UUID REFERENCES users(id),
  
  assunto VARCHAR(255) NOT NULL,
  mensagem TEXT NOT NULL,
  
  lida BOOLEAN DEFAULT FALSE,
  data_leitura TIMESTAMP,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Índices
CREATE INDEX idx_mensagens_empresa ON mensagens(empresa_id);
CREATE INDEX idx_mensagens_remetente ON mensagens(usuario_remetente_id);
CREATE INDEX idx_mensagens_destinatario ON mensagens(usuario_destinatario_id);
CREATE INDEX idx_mensagens_lida ON mensagens(lida) WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE mensagens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON mensagens FOR SELECT
  USING (
    usuario_remetente_id = auth.uid() OR 
    usuario_destinatario_id = auth.uid()
  );

-- Triggers
CREATE TRIGGER update_mensagens_updated_at 
BEFORE UPDATE ON mensagens
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentário
COMMENT ON TABLE mensagens IS 'Sistema de mensagens internas entre usuários';
```

### 4. Adicionar Novo ENUM

```sql
-- Migration: Adicionar novo tipo de despesa
-- Data: 2025-01-17

-- Adicionar valor ao ENUM existente
ALTER TYPE categoria_despesa ADD VALUE 'treinamento';
ALTER TYPE categoria_despesa ADD VALUE 'viagem';

-- ATENÇÃO: Não é possível remover valores de ENUM.
-- Se precisar remover, deve criar novo ENUM e migrar dados.
```

### 5. Criar View de Relatório

```sql
-- Migration: View de contratos vencendo
-- Data: 2025-01-17

CREATE OR REPLACE VIEW vw_contratos_vencendo AS
SELECT 
  c.id,
  c.numero_contrato,
  c.empresa_id,
  e.nome AS empresa_nome,
  cl.nome_razao_social AS cliente_nome,
  c.data_fim,
  c.valor_final,
  (c.data_fim - CURRENT_DATE) AS dias_ate_vencimento,
  CASE 
    WHEN c.data_fim < CURRENT_DATE THEN 'vencido'
    WHEN c.data_fim <= CURRENT_DATE + INTERVAL '30 days' THEN 'vence_30_dias'
    WHEN c.data_fim <= CURRENT_DATE + INTERVAL '60 days' THEN 'vence_60_dias'
    ELSE 'no_prazo'
  END AS status_vencimento
FROM contratos c
JOIN empresas e ON e.id = c.empresa_id
LEFT JOIN clientes cl ON cl.id = c.cliente_id
WHERE c.status = 'ativo'
  AND c.deleted_at IS NULL
  AND c.data_fim IS NOT NULL
ORDER BY c.data_fim ASC;

-- Comentário
COMMENT ON VIEW vw_contratos_vencendo IS 'Contratos próximos ao vencimento ou vencidos';
```

### 6. Adicionar Função/Trigger

```sql
-- Migration: Notificação automática de estoque baixo
-- Data: 2025-01-17

CREATE OR REPLACE FUNCTION notificar_estoque_baixo()
RETURNS TRIGGER AS $$
BEGIN
  -- Se estoque disponível ficou abaixo do mínimo
  IF NEW.estoque_disponivel < NEW.estoque_minimo AND 
     OLD.estoque_disponivel >= OLD.estoque_minimo THEN
    
    -- Criar notificação para administradores da empresa
    INSERT INTO notificacoes (
      usuario_id,
      titulo,
      mensagem,
      tipo,
      categoria,
      entidade_tipo,
      entidade_id,
      created_at
    )
    SELECT 
      u.id,
      'Estoque Baixo',
      format('Material "%s" (código: %s) está com estoque abaixo do mínimo: %s %s disponíveis, mínimo: %s %s',
        NEW.nome, NEW.codigo, 
        NEW.estoque_disponivel, NEW.unidade_medida,
        NEW.estoque_minimo, NEW.unidade_medida
      ),
      'warning',
      'estoque',
      'material',
      NEW.id,
      NOW()
    FROM users u
    WHERE u.empresa_id = NEW.empresa_id
      AND u.perfil IN ('admin', 'admin_grupo', 'gestor', 'operacional')
      AND u.status = 'ativo'
      AND u.deleted_at IS NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notificar_estoque_baixo
AFTER UPDATE ON materiais
FOR EACH ROW 
WHEN (OLD.estoque_disponivel IS DISTINCT FROM NEW.estoque_disponivel)
EXECUTE FUNCTION notificar_estoque_baixo();

-- Comentário
COMMENT ON FUNCTION notificar_estoque_baixo IS 'Cria notificação automática quando estoque fica abaixo do mínimo';
```

### 7. Modificar RLS Policy

```sql
-- Migration: Permitir clientes visualizarem próprios contratos
-- Data: 2025-01-17

-- Remover política antiga (se existir)
DROP POLICY IF EXISTS "Clientes podem ver próprios contratos" ON contratos;

-- Criar nova política
CREATE POLICY "Clientes podem ver próprios contratos"
  ON contratos FOR SELECT
  USING (
    -- Usuários internos veem contratos da empresa
    (
      empresa_id IN (
        SELECT empresa_id FROM users WHERE id = auth.uid()
        UNION
        SELECT unnest(empresas_ids) FROM users WHERE id = auth.uid()
      )
      AND deleted_at IS NULL
    )
    OR
    -- Clientes veem apenas seus próprios contratos
    (
      tipo = 'cliente' 
      AND cliente_id IN (
        SELECT c.id 
        FROM clientes c
        JOIN users u ON u.email = c.email
        WHERE u.id = auth.uid()
      )
      AND deleted_at IS NULL
    )
  );
```

### 8. Adicionar Constraint

```sql
-- Migration: Adicionar constraint de validação
-- Data: 2025-01-17

-- Garantir que valor_total é positivo
ALTER TABLE contratos
ADD CONSTRAINT contratos_valor_total_positivo 
CHECK (valor_total > 0);

-- Garantir que data_fim é maior que data_inicio
ALTER TABLE contratos
ADD CONSTRAINT contratos_datas_validas 
CHECK (data_fim > data_inicio OR data_fim IS NULL);

-- Garantir que estoque_bloqueado não excede estoque_atual
ALTER TABLE materiais
ADD CONSTRAINT materiais_estoque_bloqueado_valido
CHECK (estoque_bloqueado <= estoque_atual);
```

### 9. Adicionar Dados Seed

```sql
-- Migration: Adicionar categorias padrão de materiais
-- Data: 2025-01-17

-- Inserir apenas se não existir
INSERT INTO categorias_material (empresa_id, nome, descricao, tipo_vinculacao)
SELECT '2s-locacoes', 'Iluminação', 'Equipamentos de iluminação para eventos', 'locacao'
WHERE NOT EXISTS (
  SELECT 1 FROM categorias_material 
  WHERE empresa_id = '2s-locacoes' AND nome = 'Iluminação'
);

INSERT INTO categorias_material (empresa_id, nome, descricao, tipo_vinculacao)
SELECT '2s-locacoes', 'Som', 'Equipamentos de áudio e som', 'locacao'
WHERE NOT EXISTS (
  SELECT 1 FROM categorias_material 
  WHERE empresa_id = '2s-locacoes' AND nome = 'Som'
);

INSERT INTO categorias_material (empresa_id, nome, descricao, tipo_vinculacao)
SELECT '2s-locacoes', 'Mobiliário', 'Mesas, cadeiras e móveis', 'locacao'
WHERE NOT EXISTS (
  SELECT 1 FROM categorias_material 
  WHERE empresa_id = '2s-locacoes' AND nome = 'Mobiliário'
);
```

### 10. Remover Coluna (Com Cuidado!)

```sql
-- Migration: Remover coluna obsoleta
-- Data: 2025-01-17

-- ATENÇÃO: Isso é DESTRUTIVO! Sempre faça backup primeiro!

-- 1. Remover índices relacionados
DROP INDEX IF EXISTS idx_clientes_campo_obsoleto;

-- 2. Remover constraints relacionadas
ALTER TABLE clientes 
DROP CONSTRAINT IF EXISTS clientes_campo_obsoleto_check;

-- 3. Remover a coluna
ALTER TABLE clientes 
DROP COLUMN IF EXISTS campo_obsoleto;
```

---

## 🔙 Rollback e Recuperação

### Rollback Manual

```sql
-- Migration de rollback: Reverter adição de coluna
-- Data: 2025-01-17

-- Para reverter a migration que adicionou telefone_secundario
ALTER TABLE clientes 
DROP COLUMN IF EXISTS telefone_secundario CASCADE;
```

### Backup Antes de Migration

```bash
# Fazer dump do banco antes de migrations grandes
supabase db dump > backup_pre_migration_$(date +%Y%m%d).sql

# Ou via pg_dump
pg_dump -h [HOST] -U [USER] -d [DATABASE] > backup.sql
```

### Restaurar Backup

```bash
# Restaurar do dump
psql -h [HOST] -U [USER] -d [DATABASE] < backup.sql

# Ou via Supabase CLI
supabase db restore backup.sql
```

---

## ✅ Boas Práticas

### 1. Sempre Teste em Desenvolvimento

```bash
# Criar ambiente de teste
supabase init
supabase start

# Testar migration
supabase db push

# Validar
supabase db status
```

### 2. Use Transações

```sql
BEGIN;

-- Suas alterações aqui
ALTER TABLE ...;
CREATE INDEX ...;

-- Se tudo OK, commit
COMMIT;

-- Se algo deu errado, rollback
-- ROLLBACK;
```

### 3. Documente Suas Migrations

```sql
-- ============================================
-- Migration: Adicionar campo X na tabela Y
-- Data: 2025-01-17
-- Autor: Nome do Desenvolvedor
-- Ticket: #123
-- Descrição: Esta migration adiciona...
-- ============================================

-- Código aqui
```

### 4. Nomeie Arquivos Adequadamente

```
supabase/migrations/
  20250117120000_add_telefone_secundario_clientes.sql
  20250117130000_create_mensagens_table.sql
  20250117140000_add_estoque_baixo_notification.sql
```

### 5. Mantenha Migrations Pequenas

❌ **Ruim:** Uma migration gigante com 50 alterações

✅ **Bom:** Várias migrations pequenas e focadas

### 6. Teste Rollback

Sempre teste se é possível reverter a migration:

```sql
-- Migration original
ALTER TABLE clientes ADD COLUMN campo_novo VARCHAR(50);

-- Migration de rollback
ALTER TABLE clientes DROP COLUMN campo_novo;
```

### 7. Verifique Performance

```sql
-- Antes de criar índice, verifique impacto
EXPLAIN ANALYZE 
SELECT * FROM materiais 
WHERE codigo = 'ABC123';

-- Criar índice
CREATE INDEX idx_materiais_codigo ON materiais(codigo);

-- Verificar novamente
EXPLAIN ANALYZE 
SELECT * FROM materiais 
WHERE codigo = 'ABC123';
```

### 8. Use IF EXISTS / IF NOT EXISTS

```sql
-- Evita erro se já existir
CREATE INDEX IF NOT EXISTS idx_clientes_cpf 
ON clientes(cpf);

-- Evita erro se não existir
DROP INDEX IF EXISTS idx_old_index;

-- Para tabelas
CREATE TABLE IF NOT EXISTS nova_tabela (...);
DROP TABLE IF EXISTS tabela_antiga CASCADE;
```

### 9. Cuide de Dados Existentes

```sql
-- Ao adicionar coluna NOT NULL, forneça default ou migre dados

-- Opção 1: Com default
ALTER TABLE clientes 
ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ativo';

-- Opção 2: Primeiro nullable, depois popular, depois NOT NULL
ALTER TABLE clientes ADD COLUMN status VARCHAR(20);
UPDATE clientes SET status = 'ativo' WHERE status IS NULL;
ALTER TABLE clientes ALTER COLUMN status SET NOT NULL;
```

### 10. Monitore Execução

```sql
-- Verificar progresso de migration longa
SELECT 
  pid,
  now() - query_start AS duration,
  state,
  query
FROM pg_stat_activity
WHERE state = 'active'
  AND query NOT LIKE '%pg_stat_activity%'
ORDER BY duration DESC;

-- Verificar locks
SELECT 
  locktype,
  relation::regclass,
  mode,
  granted
FROM pg_locks
WHERE NOT granted;
```

---

## 📊 Templates de Migrations

### Template: Nova Tabela Completa

```sql
-- ============================================
-- Migration: Criar tabela [NOME]
-- Data: YYYY-MM-DD
-- Autor: [SEU_NOME]
-- ============================================

-- Criar tabela
CREATE TABLE [nome_tabela] (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id VARCHAR(50) NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Campos específicos
  campo_1 VARCHAR(255) NOT NULL,
  campo_2 TEXT,
  campo_3 DECIMAL(12, 2) DEFAULT 0,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  deleted_at TIMESTAMP
);

-- Índices
CREATE INDEX idx_[nome_tabela]_empresa ON [nome_tabela](empresa_id);
CREATE INDEX idx_[nome_tabela]_campo ON [nome_tabela](campo_1);

-- RLS
ALTER TABLE [nome_tabela] ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Empresa filtering"
  ON [nome_tabela] FOR ALL
  USING (
    empresa_id IN (
      SELECT empresa_id FROM users WHERE id = auth.uid()
      UNION
      SELECT unnest(empresas_ids) FROM users WHERE id = auth.uid()
    )
    AND deleted_at IS NULL
  );

-- Triggers
CREATE TRIGGER update_[nome_tabela]_updated_at 
BEFORE UPDATE ON [nome_tabela]
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE [nome_tabela] IS 'Descrição da tabela';
COMMENT ON COLUMN [nome_tabela].campo_1 IS 'Descrição do campo';
```

### Template: Modificar Estrutura Existente

```sql
-- ============================================
-- Migration: Modificar [TABELA]
-- Data: YYYY-MM-DD
-- Autor: [SEU_NOME]
-- ============================================

BEGIN;

-- Adicionar colunas
ALTER TABLE [tabela] ADD COLUMN campo_novo VARCHAR(100);

-- Modificar colunas
ALTER TABLE [tabela] ALTER COLUMN campo_existente TYPE TEXT;

-- Adicionar constraints
ALTER TABLE [tabela] ADD CONSTRAINT [nome_constraint] CHECK (campo > 0);

-- Criar índices
CREATE INDEX idx_[tabela]_[campo] ON [tabela](campo_novo);

-- Atualizar dados existentes (se necessário)
UPDATE [tabela] SET campo_novo = 'valor_default' WHERE campo_novo IS NULL;

-- Adicionar NOT NULL (depois de popular)
ALTER TABLE [tabela] ALTER COLUMN campo_novo SET NOT NULL;

COMMIT;

-- Comentários
COMMENT ON COLUMN [tabela].campo_novo IS 'Descrição do novo campo';
```

---

## 🎯 Checklist de Migration

Antes de aplicar em produção:

- [ ] Testado em ambiente de desenvolvimento
- [ ] Backup do banco de dados realizado
- [ ] Migration documentada (comentários, descrição)
- [ ] Impacto em performance avaliado
- [ ] RLS policies atualizadas se necessário
- [ ] Índices criados para novos campos
- [ ] Triggers atualizados se necessário
- [ ] Dados existentes migrados corretamente
- [ ] Rollback testado e documentado
- [ ] Equipe notificada sobre a mudança

---

**Última atualização:** Novembro 2025  
**Mantido por:** Equipe de Desenvolvimento Grupo 2S
