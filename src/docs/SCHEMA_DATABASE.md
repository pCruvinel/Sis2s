# 📊 Documentação Completa do Schema do Banco de Dados

## Sistema ERP Grupo 2S - Supabase PostgreSQL

**Versão:** 2.0  
**Última Atualização:** Novembro 2025  
**Arquivo SQL:** `/supabase/schema-completo.sql`

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Características Principais](#características-principais)
3. [Arquitetura Multi-Tenancy](#arquitetura-multi-tenancy)
4. [Tipos ENUM](#tipos-enum)
5. [Estrutura de Tabelas](#estrutura-de-tabelas)
6. [Regras de Negócio Implementadas](#regras-de-negócio-implementadas)
7. [Row Level Security (RLS)](#row-level-security-rls)
8. [Triggers e Functions](#triggers-e-functions)
9. [Views e Relatórios](#views-e-relatórios)
10. [Índices e Performance](#índices-e-performance)
11. [Como Usar](#como-usar)

---

## 🎯 Visão Geral

O schema do banco de dados foi projetado para suportar um **Sistema ERP completo** para o Grupo 2S, gerenciando 3 empresas com 7 módulos principais:

### 🏢 Empresas
- **Grupo 2S** (Holding)
- **2S Locações** 
- **2S Marketing**
- **2S Produções e Eventos**

### 📦 Módulos
1. **Admin** - Gestão de empresas e usuários
2. **Financeiro** - Contratos, despesas, parcelas
3. **RH** - Colaboradores, ponto, folha de pagamento
4. **Estoque** - Materiais com controle de bloqueio
5. **Operacional** - Ordens de serviço, veículos
6. **Fiscal** - Notas fiscais eletrônicas
7. **Catálogo** - Serviços multi-empresa

---

## ✨ Características Principais

### 🔐 Segurança
- ✅ **Row Level Security (RLS)** habilitado em todas as tabelas
- ✅ Autenticação JWT integrada ao Supabase Auth
- ✅ Políticas de acesso por perfil de usuário
- ✅ Auditoria completa de operações (audit_log)
- ✅ Soft delete com campo `deleted_at`

### 🏗️ Arquitetura
- ✅ **Multi-tenancy** com segregação por `empresa_id`
- ✅ Suporte a usuários multi-empresa (array `empresas_ids`)
- ✅ Campos de auditoria padrão (`created_at`, `updated_at`, `created_by`)
- ✅ UUIDs como chave primária para melhor distribuição
- ✅ Campos calculados (GENERATED ALWAYS AS)

### 🚀 Performance
- ✅ 50+ índices estratégicos
- ✅ Índices GiST para geolocalização (PostGIS)
- ✅ Views materializadas para relatórios
- ✅ Triggers automáticos para cálculos

### 🌍 Recursos Avançados
- ✅ Geolocalização (GPS tracking)
- ✅ JSONB para dados flexíveis
- ✅ Suporte a múltiplos anexos e documentos
- ✅ Sistema de notificações
- ✅ Histórico de alterações completo

---

## 🏢 Arquitetura Multi-Tenancy

### RN-001: Segregação por Empresa

Todas as tabelas principais possuem `empresa_id` que garante isolamento dos dados:

```sql
-- IDs das empresas (VARCHAR para legibilidade)
'grupo-2s'      -- Grupo 2S (Holding)
'2s-locacoes'   -- 2S Locações
'2s-marketing'  -- 2S Marketing
'2s-producoes'  -- 2S Produções
```

### Usuários Multi-Empresa

Usuários podem ter acesso a múltiplas empresas:

```sql
-- Usuário de uma empresa
empresa_id: '2s-locacoes'
empresas_ids: ['2s-locacoes']

-- Usuário multi-empresa (admin_grupo, gestor)
empresa_id: 'grupo-2s'
empresas_ids: ['grupo-2s', '2s-locacoes', '2s-marketing', '2s-producoes']
```

### Políticas RLS

```sql
-- Exemplo de política RLS para filtragem por empresa
CREATE POLICY "Empresa filtering"
  ON materiais FOR ALL
  USING (
    empresa_id IN (
      SELECT empresa_id FROM users WHERE id = auth.uid()
      UNION
      SELECT unnest(empresas_ids) FROM users WHERE id = auth.uid()
    )
    AND deleted_at IS NULL
  );
```

---

## 🎨 Tipos ENUM

### Perfis de Usuário
```sql
perfil_usuario: 
  - admin_grupo      → Acesso total a todas as empresas
  - admin            → Admin de uma empresa específica
  - gestor           → Gestor multi-departamento
  - financeiro       → Acesso ao financeiro
  - rh               → Recursos humanos
  - operacional      → Operações e logística
  - cliente          → Portal do cliente (view-only)
```

### Status Genéricos
```sql
status_generico: ativo | inativo | bloqueado | arquivado
```

### Tipos de Empresa
```sql
tipo_empresa: grupo | 2s_locacoes | 2s_marketing | 2s_producoes
```

### Status de Contrato
```sql
status_contrato: ativo | concluido | cancelado | suspenso | em_negociacao
```

### Status de Parcela
```sql
status_parcela: pendente | pago | pago_parcial | atrasado | cancelado | renegociado
```

### Formas de Pagamento
```sql
forma_pagamento_enum: 
  dinheiro | pix | transferencia | ted | doc | boleto |
  cartao_credito | cartao_debito | cheque | deposito | outros
```

### Categorias de Despesa
```sql
categoria_despesa:
  fixa | variavel | folha_pagamento | impostos | aluguel |
  energia | agua | internet | telefone | marketing |
  manutencao | combustivel | alimentacao | outros
```

### Status de Material
```sql
status_material:
  ativo | inativo | manutencao | bloqueado | danificado | extraviado | descartado
```

### Status de Ordem de Serviço
```sql
status_ordem_servico:
  criada | aprovada | em_andamento | em_montagem | montada |
  em_desmontagem | concluida | cancelada | reagendada
```

### Status de Ponto
```sql
status_ponto:
  normal | falta | falta_justificada | atraso | hora_extra |
  meio_periodo | home_office
```

---

## 📊 Estrutura de Tabelas

### 🔑 Tabelas Principais

#### 1. **empresas**
Empresas do Grupo 2S
- ID: VARCHAR(50) - Ex: 'grupo-2s', '2s-locacoes'
- Dados cadastrais completos
- Identidade visual (cores, logos)
- Configurações por empresa

#### 2. **users**
Usuários do sistema (integrado com Supabase Auth)
- Perfis de acesso
- Multi-empresa via array `empresas_ids`
- Hash de senha com bcrypt
- Preferências personalizadas

#### 3. **clientes**
Clientes das empresas
- Pessoa física ou jurídica
- Dados completos de contato
- Limite de crédito
- Histórico de relacionamento

#### 4. **fornecedores**
Fornecedores e prestadores
- Categorização por serviço
- Dados bancários
- Prazo de pagamento

---

### 💰 Módulo Financeiro

#### 5. **contratos**
Contratos com clientes e fornecedores
- Tipo: cliente, fornecedor, parceria
- **RN-003**: Sistema de parcelamento flexível
- Renovação automática
- Múltiplos anexos

#### 6. **parcelas**
Parcelas dos contratos
- **RN-003**: Datas personalizadas
- Cálculo automático de juros/multa
- Status detalhado

#### 7. **despesas**
Despesas das empresas
- **RN-002**: Rateio automático entre empresas
- Recorrência automática
- Vinculação a contratos/fornecedores

```sql
-- Exemplo de rateio_empresas (JSONB)
[
  { "empresa_id": "2s-locacoes", "percentual": 50, "valor": 500.00 },
  { "empresa_id": "2s-marketing", "percentual": 30, "valor": 300.00 },
  { "empresa_id": "2s-producoes", "percentual": 20, "valor": 200.00 }
]
```

#### 8. **categorias_servicos** & **servicos_catalogo**
Catálogo de serviços multi-empresa
- Precificação por empresa
- Disponibilidade configurável
- Tags e categorização

---

### 👥 Módulo RH

#### 9. **cargos**
Cargos e funções
- Faixa salarial
- Requisitos e responsabilidades
- Organizado por empresa

#### 10. **colaboradores**
Colaboradores das empresas
- Tipos de contrato: PJ, CLT, estagiário
- **RN-002**: Rateio de custo entre empresas
- Controle de benefícios
- Documentação completa

#### 11. **registros_ponto**
Controle de ponto eletrônico
- **RN-004**: Banco de horas centralizado
- 4 registros por dia (entrada/saída manhã/tarde)
- Cálculo automático de horas
- Geolocalização GPS
- Justificativas e atestados

```sql
-- Cálculo automático via trigger
horas_trabalhadas = (saida_almoco - entrada_manha) + (saida_noite - entrada_tarde)
horas_extras = horas_trabalhadas - horas_contratadas
banco_horas = horas_trabalhadas - horas_contratadas
```

#### 12. **pagamentos**
Folha de pagamento
- **RN-007**: Separação clara de bônus e descontos
- Campos calculados automaticamente
- Geração de holerite/recibo

**Estrutura de Pagamento:**
```
Salário Base
+ Benefícios (vale transporte, alimentação, plano saúde)
+ Bônus (comissão, hora extra, adicionais)
- Descontos (INSS, IRPF, pensão, empréstimos)
= Salário Líquido
```

---

### 📦 Módulo Estoque

#### 13. **categorias_material**
Categorias de materiais
- Tipo de vinculação (locação, consumo, patrimônio)

#### 14. **materiais**
Controle de estoque
- **RN-006**: Bloqueio de estoque por vinculação
- Estoque disponível = atual - bloqueado
- Alertas de estoque mínimo
- Histórico completo de movimentações
- Especificações técnicas

```sql
estoque_disponivel = estoque_atual - estoque_bloqueado (GENERATED)
```

#### 15. **historico_materiais**
Log de todas as movimentações
- Entrada, saída, ajuste, bloqueio
- Snapshot de saldos
- Rastreabilidade completa

---

### 🚚 Módulo Operacional

#### 16. **veiculos**
Frota de veículos
- Dados completos do veículo
- IPVA, seguro, licenciamento
- Rastreamento GPS
- Controle de manutenção

#### 17. **ordens_servico**
Ordens de serviço / Eventos
- Montagem e desmontagem
- Equipe e veículo
- Geolocalização do evento
- Checklist digital
- Assinaturas digitais de entrega/retirada

#### 18. **itens_ordem_servico**
Materiais vinculados à OS
- **RN-006**: Bloqueio automático de estoque
- Controle de quantidade entregue/devolvida
- Registro de danos

---

### 📄 Módulo Fiscal

#### 19. **notas_fiscais**
Notas fiscais de serviço (NFS-e)
- Chave de acesso
- Cálculo de impostos (ISS, PIS, COFINS, etc.)
- XML e PDF
- Rastreamento de envio

---

### 🔧 Tabelas de Sistema

#### 20. **audit_log**
Log de auditoria completo
- Todas as operações (INSERT, UPDATE, DELETE)
- Snapshot de dados antes/depois
- Usuário, IP, timestamp

#### 21. **notificacoes**
Sistema de notificações
- Por usuário
- Categorização
- Status de leitura

---

## 📜 Regras de Negócio Implementadas

### RN-001: Multi-Tenancy com Segregação por Empresa
✅ **Implementação:**
- Todas as tabelas possuem `empresa_id`
- RLS filtra automaticamente por empresa do usuário
- Usuários multi-empresa via array `empresas_ids`

### RN-002: Rateio Automático Entre Empresas
✅ **Implementação:**
- Campo `rateio_empresas` (JSONB) em `despesas` e `colaboradores`
- Estrutura: `[{ empresa_id, percentual, valor }]`
- Validação de 100% na aplicação

```sql
-- Exemplo de despesa rateada
{
  "valor": 1000.00,
  "rateio_empresas": [
    { "empresa_id": "2s-locacoes", "percentual": 60, "valor": 600.00 },
    { "empresa_id": "2s-marketing", "percentual": 40, "valor": 400.00 }
  ]
}
```

### RN-003: Parcelamento Flexível
✅ **Implementação:**
- Tabela `parcelas` desacoplada de `contratos`
- Permite datas personalizadas
- Tipos: mensal, quinzenal, semanal, personalizado, à vista
- Campos para juros, multa, desconto

### RN-004: Controle de Ponto Centralizado
✅ **Implementação:**
- Tabela `registros_ponto` com 4 horários
- Trigger automático para calcular horas trabalhadas
- Campo `banco_horas` acumulativo
- Geolocalização GPS (PostGIS)
- Justificativas e aprovações

### RN-005: Exclusão Lógica (Soft Delete)
✅ **Implementação:**
- Campo `deleted_at` em todas as tabelas
- RLS filtra automaticamente `WHERE deleted_at IS NULL`
- Dados nunca são perdidos

### RN-006: Bloqueio de Estoque por Vinculação
✅ **Implementação:**
- Campo `estoque_bloqueado` em `materiais`
- Campo calculado `estoque_disponivel = estoque_atual - estoque_bloqueado`
- Ao vincular material a OS, o estoque é bloqueado
- Histórico de bloqueios em `historico_materiais`

```sql
-- Ao criar item_ordem_servico
UPDATE materiais 
SET estoque_bloqueado = estoque_bloqueado + quantidade
WHERE id = material_id;

-- Ao finalizar OS
UPDATE materiais 
SET estoque_bloqueado = estoque_bloqueado - quantidade
WHERE id = material_id;
```

### RN-007: Separação de Bônus e Descontos
✅ **Implementação:**
- Tabela `pagamentos` com campos separados:
  - **Benefícios**: vale transporte, alimentação, plano saúde
  - **Bônus**: comissão, hora extra, adicionais
  - **Descontos**: INSS, IRPF, pensão, empréstimos
- Campos calculados automaticamente (GENERATED)
- Transparência total na folha de pagamento

---

## 🔐 Row Level Security (RLS)

### Políticas Principais

#### 1. Usuários
```sql
-- Usuário pode ver seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Admin grupo pode ver todos os usuários
CREATE POLICY "Admin grupo can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND perfil = 'admin_grupo'
    )
  );
```

#### 2. Empresas
```sql
-- Admin grupo pode ver todas as empresas
CREATE POLICY "Admin grupo can view all empresas"
  ON empresas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND perfil = 'admin_grupo'
    )
  );

-- Usuários podem ver suas próprias empresas
CREATE POLICY "Users can view own empresas"
  ON empresas FOR SELECT
  USING (
    id IN (
      SELECT empresa_id FROM users WHERE id = auth.uid()
      UNION
      SELECT unnest(empresas_ids) FROM users WHERE id = auth.uid()
    )
  );
```

#### 3. Filtragem Genérica por Empresa
```sql
-- Aplica-se a todas as tabelas com empresa_id
CREATE POLICY "Empresa filtering"
  ON [tabela] FOR ALL
  USING (
    empresa_id IN (
      SELECT empresa_id FROM users WHERE id = auth.uid()
      UNION
      SELECT unnest(empresas_ids) FROM users WHERE id = auth.uid()
    )
    AND deleted_at IS NULL  -- RN-005: Soft delete
  );
```

#### 4. Acesso Transitivo
```sql
-- Parcelas acessíveis via contrato
CREATE POLICY "Access via contrato"
  ON parcelas FOR ALL
  USING (
    contrato_id IN (
      SELECT id FROM contratos
      WHERE empresa_id IN (
        SELECT empresa_id FROM users WHERE id = auth.uid()
        UNION
        SELECT unnest(empresas_ids) FROM users WHERE id = auth.uid()
      )
    )
    AND deleted_at IS NULL
  );

-- Itens OS acessíveis via ordem de serviço
CREATE POLICY "Access via ordem_servico"
  ON itens_ordem_servico FOR ALL
  USING (
    ordem_servico_id IN (
      SELECT id FROM ordens_servico
      WHERE empresa_id IN (...)
    )
  );
```

---

## ⚡ Triggers e Functions

### 1. Atualização Automática de `updated_at`
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicado em todas as tabelas com updated_at
CREATE TRIGGER update_[tabela]_updated_at BEFORE UPDATE ON [tabela]
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. Auditoria Automática
```sql
CREATE OR REPLACE FUNCTION audit_log_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_log (tabela, registro_id, acao, usuario_id, dados_antigos)
    VALUES (TG_TABLE_NAME, OLD.id, TG_OP, auth.uid(), row_to_json(OLD));
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_log (tabela, registro_id, acao, usuario_id, dados_antigos, dados_novos)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, auth.uid(), row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_log (tabela, registro_id, acao, usuario_id, dados_novos)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, auth.uid(), row_to_json(NEW));
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Aplicado em tabelas críticas
CREATE TRIGGER audit_[tabela] AFTER INSERT OR UPDATE OR DELETE ON [tabela]
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();
```

### 3. Cálculo Automático de Horas (Ponto)
```sql
CREATE OR REPLACE FUNCTION calcular_horas_ponto()
RETURNS TRIGGER AS $$
DECLARE
  total_minutos INTEGER;
  horas_manha INTERVAL;
  horas_tarde INTERVAL;
BEGIN
  -- Calcular período da manhã
  IF NEW.entrada_manha IS NOT NULL AND NEW.saida_almoco IS NOT NULL THEN
    horas_manha := NEW.saida_almoco - NEW.entrada_manha;
  ELSE
    horas_manha := INTERVAL '0';
  END IF;
  
  -- Calcular período da tarde
  IF NEW.entrada_tarde IS NOT NULL AND NEW.saida_noite IS NOT NULL THEN
    horas_tarde := NEW.saida_noite - NEW.entrada_tarde;
  ELSE
    horas_tarde := INTERVAL '0';
  END IF;
  
  -- Total em minutos
  total_minutos := EXTRACT(EPOCH FROM (horas_manha + horas_tarde)) / 60;
  
  -- Converter para horas decimais
  NEW.horas_trabalhadas := ROUND((total_minutos / 60.0)::NUMERIC, 2);
  
  -- Calcular horas extras
  IF NEW.horas_trabalhadas > NEW.horas_contratadas THEN
    NEW.horas_extras := NEW.horas_trabalhadas - NEW.horas_contratadas;
  ELSE
    NEW.horas_extras := 0;
  END IF;
  
  -- Calcular banco de horas
  NEW.banco_horas := NEW.horas_trabalhadas - NEW.horas_contratadas;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calcular_horas BEFORE INSERT OR UPDATE ON registros_ponto
  FOR EACH ROW EXECUTE FUNCTION calcular_horas_ponto();
```

### 4. Histórico Automático de Estoque
```sql
CREATE OR REPLACE FUNCTION criar_historico_material()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.estoque_atual <> NEW.estoque_atual) THEN
    INSERT INTO historico_materiais (
      material_id, empresa_id, tipo, quantidade,
      estoque_anterior, estoque_atual, estoque_bloqueado,
      observacoes, created_by
    ) VALUES (
      NEW.id, NEW.empresa_id,
      CASE WHEN NEW.estoque_atual > OLD.estoque_atual THEN 'entrada' ELSE 'saida' END,
      ABS(NEW.estoque_atual - OLD.estoque_atual),
      OLD.estoque_atual, NEW.estoque_atual, NEW.estoque_bloqueado,
      'Alteração automática de estoque', auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER historico_estoque AFTER UPDATE ON materiais
  FOR EACH ROW EXECUTE FUNCTION criar_historico_material();
```

---

## 📈 Views e Relatórios

### 1. Contratos com Saldo de Parcelas
```sql
CREATE VIEW vw_contratos_saldo AS
SELECT 
  c.id,
  c.numero_contrato,
  c.empresa_id,
  c.cliente_id,
  c.valor_final,
  c.status,
  COUNT(p.id) AS total_parcelas,
  COUNT(p.id) FILTER (WHERE p.status = 'pago') AS parcelas_pagas,
  COUNT(p.id) FILTER (WHERE p.status = 'pendente') AS parcelas_pendentes,
  COALESCE(SUM(p.valor) FILTER (WHERE p.status = 'pago'), 0) AS valor_pago,
  COALESCE(SUM(p.valor) FILTER (WHERE p.status = 'pendente'), 0) AS saldo_pendente
FROM contratos c
LEFT JOIN parcelas p ON p.contrato_id = c.id
WHERE c.deleted_at IS NULL
GROUP BY c.id;
```

### 2. Materiais com Estoque Baixo
```sql
CREATE VIEW vw_materiais_estoque_baixo AS
SELECT 
  m.*,
  c.nome AS categoria_nome
FROM materiais m
LEFT JOIN categorias_material c ON c.id = m.categoria_id
WHERE m.estoque_disponivel < m.estoque_minimo
  AND m.status = 'ativo'
  AND m.deleted_at IS NULL;
```

### 3. Colaboradores com Banco de Horas
```sql
CREATE VIEW vw_colaboradores_banco_horas AS
SELECT 
  c.id,
  c.nome,
  c.empresa_id,
  c.cargo_id,
  COALESCE(SUM(rp.banco_horas), 0) AS banco_horas_total,
  COUNT(rp.id) AS dias_registrados,
  MAX(rp.data) AS ultimo_registro
FROM colaboradores c
LEFT JOIN registros_ponto rp ON rp.colaborador_id = c.id
WHERE c.deleted_at IS NULL AND c.status = 'ativo'
GROUP BY c.id;
```

### 4. Dashboard Financeiro Consolidado
```sql
CREATE VIEW vw_dashboard_financeiro AS
SELECT 
  empresa_id,
  DATE_TRUNC('month', data_vencimento) AS mes,
  COALESCE(SUM(valor) FILTER (WHERE status IN ('pendente', 'pago')), 0) AS receita_total,
  COALESCE(SUM(valor) FILTER (WHERE status = 'pago'), 0) AS receita_recebida,
  COALESCE(SUM(valor) FILTER (WHERE status = 'pendente'), 0) AS receita_pendente,
  COUNT(*) FILTER (WHERE status IN ('pendente', 'pago')) AS total_parcelas,
  COUNT(*) FILTER (WHERE status = 'pago') AS parcelas_pagas,
  COUNT(*) FILTER (WHERE status = 'pendente') AS parcelas_pendentes
FROM parcelas p
JOIN contratos c ON c.id = p.contrato_id
WHERE p.deleted_at IS NULL
GROUP BY empresa_id, DATE_TRUNC('month', data_vencimento);
```

---

## 🚀 Índices e Performance

### Estratégia de Indexação

#### Índices de Relacionamento
```sql
-- Foreign keys principais
CREATE INDEX idx_users_empresa ON users(empresa_id);
CREATE INDEX idx_clientes_empresa ON clientes(empresa_id);
CREATE INDEX idx_contratos_empresa ON contratos(empresa_id);
CREATE INDEX idx_contratos_cliente ON contratos(cliente_id);
CREATE INDEX idx_parcelas_contrato ON parcelas(contrato_id);
```

#### Índices de Queries Frequentes
```sql
-- Status e filtros comuns
CREATE INDEX idx_clientes_status ON clientes(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_contratos_status ON contratos(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_parcelas_status ON parcelas(status);
CREATE INDEX idx_parcelas_vencimento ON parcelas(data_vencimento);
```

#### Índices Compostos
```sql
-- Queries de dashboard
CREATE INDEX idx_ponto_empresa_data ON registros_ponto(empresa_id, data);
CREATE INDEX idx_os_empresa_status ON ordens_servico(empresa_id, status);
```

#### Índices Geográficos (PostGIS)
```sql
-- Geolocalização
CREATE INDEX idx_ponto_localizacao_entrada 
  ON registros_ponto USING GIST(localizacao_entrada);
  
CREATE INDEX idx_os_localizacao_evento 
  ON ordens_servico USING GIST(localizacao_evento);
```

#### Índices de Busca Textual
```sql
-- Busca por código, número, nome
CREATE INDEX idx_materiais_codigo ON materiais(codigo);
CREATE INDEX idx_contratos_numero ON contratos(numero_contrato);
CREATE INDEX idx_veiculos_placa ON veiculos(placa);
CREATE INDEX idx_nf_numero ON notas_fiscais(numero, serie);
```

---

## 🛠️ Como Usar

### 1. Instalação Inicial

```bash
# 1. Acesse o Supabase Dashboard
# 2. Navegue até SQL Editor
# 3. Cole o conteúdo do arquivo /supabase/schema-completo.sql
# 4. Execute o script

# Ou via CLI do Supabase
supabase db push
```

### 2. Criar Primeiro Usuário Admin

```sql
-- 1. Criar usuário no Supabase Auth primeiro (via dashboard ou API)
-- 2. Depois inserir na tabela users

INSERT INTO users (
  id, 
  email, 
  nome, 
  empresa_id, 
  empresas_ids, 
  perfil, 
  senha_hash
) VALUES (
  '[UUID_DO_AUTH_USERS]',
  'admin@grupo2s.com',
  'Administrador do Grupo',
  'grupo-2s',
  ARRAY['grupo-2s', '2s-locacoes', '2s-marketing', '2s-producoes'],
  'admin_grupo',
  '[HASH_BCRYPT_DA_SENHA]'
);
```

### 3. Queries Comuns

#### Buscar contratos de uma empresa
```sql
SELECT * FROM contratos 
WHERE empresa_id = '2s-locacoes' 
  AND status = 'ativo'
  AND deleted_at IS NULL;
```

#### Relatório de estoque baixo
```sql
SELECT * FROM vw_materiais_estoque_baixo
WHERE empresa_id = '2s-locacoes';
```

#### Banco de horas dos colaboradores
```sql
SELECT * FROM vw_colaboradores_banco_horas
WHERE empresa_id = '2s-locacoes'
ORDER BY banco_horas_total DESC;
```

#### Dashboard financeiro mensal
```sql
SELECT * FROM vw_dashboard_financeiro
WHERE empresa_id = '2s-marketing'
  AND mes >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months')
ORDER BY mes DESC;
```

---

## 📝 Notas Importantes

### ⚠️ Atenção

1. **PostGIS Obrigatório**: A extensão PostGIS é necessária para geolocalização. Se não estiver disponível, remova os campos `GEOGRAPHY(POINT)`.

2. **Tamanho do Schema**: O schema completo tem ~2500 linhas. Considere dividir em arquivos menores para manutenção.

3. **Backup Regular**: Sempre faça backup antes de aplicar alterações no schema.

4. **Migrations**: Use o sistema de migrations do Supabase para alterações incrementais.

### 🔄 Migrations Futuras

Para adicionar novos campos ou tabelas:

```sql
-- Exemplo de migration
ALTER TABLE materiais 
ADD COLUMN codigo_barras VARCHAR(50);

CREATE INDEX idx_materiais_codigo_barras 
ON materiais(codigo_barras);
```

### 🧪 Testes

Recomenda-se testar em ambiente de desenvolvimento antes de aplicar em produção:

```bash
# Criar projeto de teste
supabase init
supabase start
supabase db push
```

---

## 📚 Referências

- [Documentação Supabase](https://supabase.com/docs)
- [PostgreSQL 15 Documentation](https://www.postgresql.org/docs/15/)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✅ Checklist de Implementação

- [x] Estrutura de tabelas criada
- [x] ENUMs definidos
- [x] RLS habilitado
- [x] Políticas de segurança aplicadas
- [x] Índices criados
- [x] Triggers configurados
- [x] Views de relatório criadas
- [x] Dados seed inseridos
- [x] Auditoria configurada
- [ ] Testes de carga realizados
- [ ] Documentação de API gerada
- [ ] Backup automático configurado

---

**Última atualização:** Novembro 2025  
**Mantido por:** Equipe de Desenvolvimento Grupo 2S
