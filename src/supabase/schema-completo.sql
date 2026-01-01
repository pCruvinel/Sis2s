-- ============================================
-- SCHEMA COMPLETO SUPABASE - SISTEMA ERP GRUPO 2S
-- Versão: 2.0 - Atualizado em 2025
-- ============================================
-- 
-- CARACTERÍSTICAS:
-- - Multi-tenancy com segregação por empresa_id
-- - Row Level Security (RLS) habilitado
-- - Soft delete (deleted_at) em todas as tabelas
-- - Auditoria completa (created_at, updated_at, created_by)
-- - Suporte a rateio de despesas entre empresas
-- - Controle de estoque com bloqueio
-- - Histórico de alterações em materiais
-- - Geolocalização para rastreamento
-- - Catálogo de serviços multi-empresa
-- - Sistema completo de permissões por perfil
--
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- Para geolocalização

-- ============================================
-- TIPOS ENUM
-- ============================================

-- Perfis de usuário
CREATE TYPE perfil_usuario AS ENUM (
  'admin_grupo',      -- Acesso total a todas as empresas
  'admin',            -- Admin de uma empresa específica
  'gestor',           -- Gestor multi-departamento
  'financeiro',       -- Acesso ao financeiro
  'rh',               -- Recursos humanos
  'operacional',      -- Operações e logística
  'cliente'           -- Portal do cliente (view-only)
);

-- Status genéricos
CREATE TYPE status_generico AS ENUM ('ativo', 'inativo', 'bloqueado', 'arquivado');

-- Tipos de empresa
CREATE TYPE tipo_empresa AS ENUM (
  'grupo',            -- Grupo 2S (holding)
  '2s_locacoes',      -- 2S Locações
  '2s_marketing',     -- 2S Marketing
  '2s_producoes'      -- 2S Produções
);

-- Tipos de pessoa
CREATE TYPE tipo_pessoa AS ENUM ('pessoa_fisica', 'pessoa_juridica');

-- Status e tipos de contrato
CREATE TYPE status_contrato AS ENUM ('ativo', 'concluido', 'cancelado', 'suspenso', 'em_negociacao');
CREATE TYPE tipo_contrato AS ENUM ('cliente', 'fornecedor', 'parceria');
CREATE TYPE tipo_parcelamento AS ENUM ('mensal', 'quinzenal', 'semanal', 'personalizado', 'vista');

-- Status de parcelas
CREATE TYPE status_parcela AS ENUM (
  'pendente',
  'pago',
  'pago_parcial',
  'atrasado',
  'cancelado',
  'renegociado'
);

-- Formas de pagamento
CREATE TYPE forma_pagamento_enum AS ENUM (
  'dinheiro',
  'pix',
  'transferencia',
  'ted',
  'doc',
  'boleto',
  'cartao_credito',
  'cartao_debito',
  'cheque',
  'deposito',
  'outros'
);

-- Categorias de despesa
CREATE TYPE categoria_despesa AS ENUM (
  'fixa',
  'variavel',
  'folha_pagamento',
  'impostos',
  'aluguel',
  'energia',
  'agua',
  'internet',
  'telefone',
  'marketing',
  'manutencao',
  'combustivel',
  'alimentacao',
  'outros'
);

-- Tipos de contrato de trabalho
CREATE TYPE tipo_contrato_colaborador AS ENUM ('pj', 'clt', 'estagiario', 'temporario', 'autonomo');

-- Status de colaborador
CREATE TYPE status_colaborador AS ENUM (
  'ativo',
  'inativo',
  'ferias',
  'licenca_medica',
  'licenca_maternidade',
  'afastado',
  'demitido'
);

-- Status de ponto
CREATE TYPE status_ponto AS ENUM (
  'normal',
  'falta',
  'falta_justificada',
  'atraso',
  'hora_extra',
  'meio_periodo',
  'home_office'
);

-- Status de pagamento
CREATE TYPE status_pagamento AS ENUM ('pendente', 'processando', 'pago', 'cancelado', 'estornado');

-- Status de material/estoque
CREATE TYPE status_material AS ENUM (
  'ativo',
  'inativo',
  'manutencao',
  'bloqueado',        -- RN-006: Bloqueio de estoque
  'danificado',
  'extraviado',
  'descartado'
);

-- Tipo de vinculação de material
CREATE TYPE tipo_vinculacao AS ENUM (
  'locacao',          -- Material alugado para eventos
  'consumo',          -- Material consumível
  'patrimonio',       -- Ativo fixo da empresa
  'revenda'           -- Material para venda
);

-- Status de ordem de serviço
CREATE TYPE status_ordem_servico AS ENUM (
  'criada',
  'aprovada',
  'em_andamento',
  'em_montagem',
  'montada',
  'em_desmontagem',
  'concluida',
  'cancelada',
  'reagendada'
);

-- Status de veículo
CREATE TYPE status_veiculo AS ENUM (
  'disponivel',
  'em_uso',
  'manutencao',
  'reservado',
  'indisponivel'
);

-- Status de nota fiscal
CREATE TYPE status_nota_fiscal AS ENUM (
  'emitida',
  'enviada',
  'cancelada',
  'inutilizada',
  'denegada'
);

-- Status de cliente
CREATE TYPE status_cliente AS ENUM (
  'ativo',
  'inativo',
  'inadimplente',
  'bloqueado',
  'prospeccao'
);

-- Tipo de histórico de material
CREATE TYPE tipo_historico_material AS ENUM (
  'entrada',
  'saida',
  'ajuste',
  'bloqueio',
  'desbloqueio',
  'transferencia',
  'baixa',
  'devolucao'
);

-- ============================================
-- TABELAS PRINCIPAIS
-- ============================================

-- EMPRESAS
-- RN-001: Multi-tenancy com empresa_id
CREATE TABLE empresas (
  id VARCHAR(50) PRIMARY KEY,  -- 'grupo-2s', '2s-locacoes', '2s-marketing', '2s-producoes'
  nome VARCHAR(255) NOT NULL,
  tipo tipo_empresa NOT NULL,
  status status_generico DEFAULT 'ativo',
  
  -- Dados cadastrais
  cnpj VARCHAR(18) UNIQUE,
  inscricao_estadual VARCHAR(20),
  inscricao_municipal VARCHAR(20),
  nome_fantasia VARCHAR(255),
  razao_social VARCHAR(255),
  
  -- Contatos
  telefone VARCHAR(20),
  telefone_secundario VARCHAR(20),
  email VARCHAR(255),
  site VARCHAR(255),
  
  -- Endereço completo
  endereco_completo JSONB DEFAULT '{}',
  -- Estrutura: { logradouro, numero, complemento, bairro, cidade, estado, cep, pais }
  
  -- Dados bancários
  dados_bancarios JSONB DEFAULT '[]',
  -- Estrutura: [{ banco, agencia, conta, tipo_conta, pix_keys: [] }]
  
  -- Identidade visual
  cor_primaria VARCHAR(7) DEFAULT '#1F4788',
  cor_secundaria VARCHAR(7) DEFAULT '#28A745',
  logo_url TEXT,
  logo_url_white TEXT,
  timbrado_url TEXT,
  
  -- Configurações específicas
  configuracoes JSONB DEFAULT '{}',
  -- Estrutura: { timezone, moeda, idioma, fiscal: {}, notificacoes: {} }
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  
  CONSTRAINT empresas_cnpj_format CHECK (cnpj ~ '^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$' OR cnpj IS NULL)
);

-- USERS (Integrado com auth.users do Supabase)
-- Suporta multi-empresa para usuários como admin_grupo
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  
  -- Empresa principal do usuário
  empresa_id VARCHAR(50) REFERENCES empresas(id),
  
  -- Para usuários multi-empresa (admin_grupo, gestores)
  empresas_ids VARCHAR(50)[] DEFAULT '{}',
  
  -- Perfil e permissões
  perfil perfil_usuario NOT NULL,
  permissoes_customizadas JSONB DEFAULT '{}',
  
  -- Dados adicionais
  telefone VARCHAR(20),
  avatar_url TEXT,
  
  -- Status e segurança
  status status_generico DEFAULT 'ativo',
  senha_hash TEXT, -- bcrypt hash da senha
  ultimo_acesso TIMESTAMP,
  tentativas_login_falhas INTEGER DEFAULT 0,
  bloqueado_ate TIMESTAMP,
  
  -- Preferências
  preferencias JSONB DEFAULT '{}',
  -- Estrutura: { tema, idioma, notificacoes_email, notificacoes_push }
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  
  CONSTRAINT users_perfil_empresa CHECK (
    perfil = 'admin_grupo' OR empresa_id IS NOT NULL
  )
);

-- CLIENTES
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id VARCHAR(50) NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Dados cadastrais
  tipo tipo_pessoa NOT NULL,
  nome_razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  cpf_cnpj VARCHAR(18) NOT NULL,
  rg_ie VARCHAR(20),
  
  -- Contatos
  email VARCHAR(255),
  email_nfe VARCHAR(255), -- Email para envio de NF-e
  telefone VARCHAR(20),
  celular VARCHAR(20),
  whatsapp VARCHAR(20),
  
  -- Endereço
  endereco_completo JSONB DEFAULT '{}',
  
  -- Dados bancários
  dados_bancarios JSONB DEFAULT '[]',
  
  -- Informações comerciais
  limite_credito DECIMAL(12, 2) DEFAULT 0,
  dia_vencimento_preferencial INTEGER CHECK (dia_vencimento_preferencial BETWEEN 1 AND 31),
  observacoes TEXT,
  tags VARCHAR(50)[],
  
  -- Responsável/Vendedor
  responsavel_id UUID REFERENCES users(id),
  
  -- Status
  status status_cliente DEFAULT 'ativo',
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  deleted_at TIMESTAMP,
  
  UNIQUE(empresa_id, cpf_cnpj)
);

-- FORNECEDORES
CREATE TABLE fornecedores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id VARCHAR(50) NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Dados cadastrais
  tipo tipo_pessoa NOT NULL,
  nome_razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  cpf_cnpj VARCHAR(18) NOT NULL,
  rg_ie VARCHAR(20),
  
  -- Classificação
  categoria_servico VARCHAR(100),
  tags VARCHAR(50)[],
  
  -- Contatos
  email VARCHAR(255),
  telefone VARCHAR(20),
  celular VARCHAR(20),
  contato_nome VARCHAR(255),
  
  -- Endereço
  endereco_completo JSONB DEFAULT '{}',
  
  -- Dados bancários
  dados_bancarios JSONB DEFAULT '[]',
  
  -- Informações comerciais
  observacoes TEXT,
  prazo_pagamento_dias INTEGER,
  
  -- Status
  status status_generico DEFAULT 'ativo',
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  deleted_at TIMESTAMP,
  
  UNIQUE(empresa_id, cpf_cnpj)
);

-- ============================================
-- MÓDULO FINANCEIRO
-- ============================================

-- CONTRATOS
-- RN-003: Sistema de parcelamento flexível
CREATE TABLE contratos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id VARCHAR(50) NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  numero_contrato VARCHAR(50) UNIQUE NOT NULL,
  
  -- Tipo e relacionamentos
  tipo tipo_contrato NOT NULL,
  cliente_id UUID REFERENCES clientes(id),
  fornecedor_id UUID REFERENCES fornecedores(id),
  
  -- Descrição e valores
  descricao TEXT,
  objeto TEXT, -- Objeto do contrato
  valor_total DECIMAL(12, 2) NOT NULL,
  desconto DECIMAL(12, 2) DEFAULT 0,
  acrescimo DECIMAL(12, 2) DEFAULT 0,
  valor_final DECIMAL(12, 2) GENERATED ALWAYS AS (valor_total - desconto + acrescimo) STORED,
  
  -- Datas
  data_inicio DATE NOT NULL,
  data_fim DATE,
  data_assinatura DATE,
  
  -- Parcelamento
  tipo_parcelamento tipo_parcelamento NOT NULL,
  numero_parcelas INTEGER,
  dia_vencimento INTEGER CHECK (dia_vencimento BETWEEN 1 AND 31),
  
  -- Renovação automática
  renovacao_automatica BOOLEAN DEFAULT FALSE,
  meses_renovacao INTEGER,
  
  -- Arquivos
  arquivo_pdf_url TEXT,
  arquivos_anexos JSONB DEFAULT '[]',
  -- Estrutura: [{ nome, url, tipo, tamanho, data_upload }]
  
  -- Status e observações
  status status_contrato DEFAULT 'ativo',
  observacoes TEXT,
  clausulas_especiais TEXT,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  deleted_at TIMESTAMP,
  
  CHECK (
    (tipo = 'cliente' AND cliente_id IS NOT NULL) OR 
    (tipo = 'fornecedor' AND fornecedor_id IS NOT NULL) OR
    tipo = 'parceria'
  )
);

-- PARCELAS
-- RN-003: Parcelamento flexível com datas personalizadas
CREATE TABLE parcelas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contrato_id UUID NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
  
  -- Identificação
  numero_parcela INTEGER NOT NULL,
  descricao VARCHAR(255),
  
  -- Valores
  valor DECIMAL(12, 2) NOT NULL,
  valor_pago DECIMAL(12, 2) DEFAULT 0,
  multa DECIMAL(12, 2) DEFAULT 0,
  juros DECIMAL(12, 2) DEFAULT 0,
  desconto DECIMAL(12, 2) DEFAULT 0,
  
  -- Datas
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  dias_atraso INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN data_pagamento IS NULL AND CURRENT_DATE > data_vencimento 
      THEN CURRENT_DATE - data_vencimento
      ELSE 0
    END
  ) STORED,
  
  -- Pagamento
  forma_pagamento forma_pagamento_enum,
  comprovante_url TEXT,
  numero_documento VARCHAR(100), -- Número do cheque, boleto, etc.
  
  -- Status
  status status_parcela DEFAULT 'pendente',
  observacoes TEXT,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  pago_por UUID REFERENCES users(id),
  deleted_at TIMESTAMP,
  
  UNIQUE(contrato_id, numero_parcela)
);

-- DESPESAS
-- RN-002: Rateio automático entre empresas
CREATE TABLE despesas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id VARCHAR(50) NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  numero_documento VARCHAR(100),
  descricao VARCHAR(255) NOT NULL,
  categoria categoria_despesa NOT NULL,
  
  -- Valores
  valor DECIMAL(12, 2) NOT NULL,
  desconto DECIMAL(12, 2) DEFAULT 0,
  acrescimo DECIMAL(12, 2) DEFAULT 0,
  valor_final DECIMAL(12, 2) GENERATED ALWAYS AS (valor - desconto + acrescimo) STORED,
  
  -- Datas
  data_competencia DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  
  -- Pagamento
  forma_pagamento forma_pagamento_enum,
  numero_comprovante VARCHAR(100),
  comprovante_url TEXT,
  
  -- Relacionamentos
  fornecedor_id UUID REFERENCES fornecedores(id),
  contrato_id UUID REFERENCES contratos(id),
  
  -- RN-002: Rateio entre empresas
  rateio_empresas JSONB DEFAULT '[]',
  /* Estrutura:
  [
    { empresa_id: '2s-locacoes', percentual: 50, valor: 500.00 },
    { empresa_id: '2s-marketing', percentual: 30, valor: 300.00 },
    { empresa_id: '2s-producoes', percentual: 20, valor: 200.00 }
  ]
  */
  
  -- Status
  status status_pagamento DEFAULT 'pendente',
  recorrente BOOLEAN DEFAULT FALSE,
  frequencia_recorrencia VARCHAR(20), -- 'mensal', 'trimestral', 'anual'
  
  observacoes TEXT,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  pago_por UUID REFERENCES users(id),
  deleted_at TIMESTAMP
);

-- CATEGORIAS DE SERVIÇOS (CATÁLOGO)
CREATE TABLE categorias_servicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  icone VARCHAR(50),
  ordem INTEGER DEFAULT 0,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- SERVIÇOS DO CATÁLOGO
CREATE TABLE servicos_catalogo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  categoria_id UUID REFERENCES categorias_servicos(id),
  
  -- Identificação
  codigo VARCHAR(50) UNIQUE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  
  -- Precificação por empresa
  precos_por_empresa JSONB DEFAULT '[]',
  /* Estrutura:
  [
    { empresa_id: '2s-locacoes', preco: 1500.00, moeda: 'BRL' },
    { empresa_id: '2s-marketing', preco: 2000.00, moeda: 'BRL' }
  ]
  */
  
  -- Detalhes
  unidade_medida VARCHAR(20),
  tempo_execucao VARCHAR(50), -- '2 horas', '1 dia', etc.
  imagem_url TEXT,
  tags VARCHAR(50)[],
  
  -- Disponibilidade
  disponivel BOOLEAN DEFAULT TRUE,
  empresas_disponiveis VARCHAR(50)[] DEFAULT '{}',
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  deleted_at TIMESTAMP
);

-- ============================================
-- MÓDULO RH
-- ============================================

-- CARGOS
CREATE TABLE cargos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id VARCHAR(50) NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  nivel VARCHAR(50), -- 'junior', 'pleno', 'senior', etc.
  departamento VARCHAR(100),
  
  -- Faixas salariais
  salario_base_min DECIMAL(12, 2),
  salario_base_max DECIMAL(12, 2),
  
  -- Requisitos
  requisitos TEXT,
  responsabilidades TEXT,
  
  -- Status
  status status_generico DEFAULT 'ativo',
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  
  UNIQUE(empresa_id, nome)
);

-- COLABORADORES
-- RN-002: Rateio de custo entre empresas
CREATE TABLE colaboradores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id VARCHAR(50) NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Dados pessoais
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  rg VARCHAR(20),
  data_nascimento DATE NOT NULL,
  genero VARCHAR(20),
  estado_civil VARCHAR(30),
  
  -- Contatos
  email VARCHAR(255),
  email_corporativo VARCHAR(255),
  telefone VARCHAR(20),
  celular VARCHAR(20),
  
  -- Endereço
  endereco_completo JSONB DEFAULT '{}',
  
  -- Dados profissionais
  tipo_contrato tipo_contrato_colaborador NOT NULL,
  cargo_id UUID REFERENCES cargos(id),
  departamento VARCHAR(100),
  matricula VARCHAR(50) UNIQUE,
  
  -- Remuneração
  salario_base DECIMAL(12, 2) NOT NULL,
  vale_transporte DECIMAL(12, 2) DEFAULT 0,
  vale_alimentacao DECIMAL(12, 2) DEFAULT 0,
  plano_saude DECIMAL(12, 2) DEFAULT 0,
  outros_beneficios JSONB DEFAULT '[]',
  
  -- Datas importantes
  data_admissao DATE NOT NULL,
  data_demissao DATE,
  data_ultimo_reajuste DATE,
  
  -- RN-002: Rateio entre empresas (custo compartilhado)
  rateio_empresas JSONB DEFAULT '[]',
  /* Estrutura: igual ao rateio de despesas */
  
  -- Dados bancários
  dados_bancarios JSONB DEFAULT '{}',
  
  -- Documentos
  documentos_urls JSONB DEFAULT '[]',
  foto_url TEXT,
  
  -- Controle de horas (RN-004)
  horas_contratadas_dia DECIMAL(5, 2) DEFAULT 8,
  dias_trabalho_semana INTEGER DEFAULT 5,
  horario_entrada TIME,
  horario_saida TIME,
  
  -- Status
  status status_colaborador DEFAULT 'ativo',
  observacoes TEXT,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  deleted_at TIMESTAMP,
  
  CONSTRAINT colaboradores_cpf_format CHECK (cpf ~ '^\d{3}\.\d{3}\.\d{3}-\d{2}$')
);

-- REGISTROS DE PONTO
-- RN-004: Controle de ponto centralizado com banco de horas
CREATE TABLE registros_ponto (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id VARCHAR(50) NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  
  -- Data e horários
  data DATE NOT NULL,
  entrada_manha TIME,
  saida_almoco TIME,
  entrada_tarde TIME,
  saida_noite TIME,
  
  -- Cálculos automáticos
  horas_trabalhadas DECIMAL(5, 2),
  horas_contratadas DECIMAL(5, 2) DEFAULT 8,
  horas_extras DECIMAL(5, 2) DEFAULT 0,
  horas_falta DECIMAL(5, 2) DEFAULT 0,
  
  -- RN-004: Banco de horas
  banco_horas DECIMAL(5, 2) DEFAULT 0,
  banco_horas_acumulado DECIMAL(7, 2),
  
  -- Justificativas
  justificativa TEXT,
  atestado_url TEXT,
  aprovado_por UUID REFERENCES users(id),
  
  -- Geolocalização (rastreamento GPS)
  localizacao_entrada GEOGRAPHY(POINT),
  localizacao_saida GEOGRAPHY(POINT),
  ip_entrada INET,
  ip_saida INET,
  
  -- Status
  status status_ponto DEFAULT 'normal',
  observacoes TEXT,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  deleted_at TIMESTAMP,
  
  UNIQUE(colaborador_id, data)
);

-- PAGAMENTOS / FOLHA DE PAGAMENTO
-- RN-007: Separação de bônus e descontos
CREATE TABLE pagamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id VARCHAR(50) NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id),
  
  -- Referência
  mes_referencia DATE NOT NULL,
  competencia VARCHAR(7) NOT NULL, -- 'YYYY-MM'
  
  -- Salário base
  salario_base DECIMAL(12, 2) NOT NULL,
  
  -- RN-007: Adicionais separados
  vale_transporte DECIMAL(12, 2) DEFAULT 0,
  vale_alimentacao DECIMAL(12, 2) DEFAULT 0,
  plano_saude_empresa DECIMAL(12, 2) DEFAULT 0,
  
  -- RN-007: Bônus (separados dos benefícios)
  bonus DECIMAL(12, 2) DEFAULT 0,
  comissao DECIMAL(12, 2) DEFAULT 0,
  hora_extra DECIMAL(12, 2) DEFAULT 0,
  adicional_noturno DECIMAL(12, 2) DEFAULT 0,
  adicional_periculosidade DECIMAL(12, 2) DEFAULT 0,
  adicional_insalubridade DECIMAL(12, 2) DEFAULT 0,
  outros_adicionais DECIMAL(12, 2) DEFAULT 0,
  outros_adicionais_detalhes JSONB DEFAULT '[]',
  
  -- RN-007: Descontos (separados)
  plano_saude_colaborador DECIMAL(12, 2) DEFAULT 0,
  adiantamento DECIMAL(12, 2) DEFAULT 0,
  falta DECIMAL(12, 2) DEFAULT 0,
  atraso DECIMAL(12, 2) DEFAULT 0,
  inss DECIMAL(12, 2) DEFAULT 0,
  irpf DECIMAL(12, 2) DEFAULT 0,
  pensao_alimenticia DECIMAL(12, 2) DEFAULT 0,
  emprestimo DECIMAL(12, 2) DEFAULT 0,
  outros_descontos DECIMAL(12, 2) DEFAULT 0,
  outros_descontos_detalhes JSONB DEFAULT '[]',
  
  -- Totalizadores calculados
  total_adicionais DECIMAL(12, 2) GENERATED ALWAYS AS (
    vale_transporte + vale_alimentacao + plano_saude_empresa +
    bonus + comissao + hora_extra + adicional_noturno +
    adicional_periculosidade + adicional_insalubridade + outros_adicionais
  ) STORED,
  
  total_descontos DECIMAL(12, 2) GENERATED ALWAYS AS (
    plano_saude_colaborador + adiantamento + falta + atraso +
    inss + irpf + pensao_alimenticia + emprestimo + outros_descontos
  ) STORED,
  
  salario_liquido DECIMAL(12, 2) GENERATED ALWAYS AS (
    salario_base +
    (vale_transporte + vale_alimentacao + plano_saude_empresa +
     bonus + comissao + hora_extra + adicional_noturno +
     adicional_periculosidade + adicional_insalubridade + outros_adicionais) -
    (plano_saude_colaborador + adiantamento + falta + atraso +
     inss + irpf + pensao_alimenticia + emprestimo + outros_descontos)
  ) STORED,
  
  -- Pagamento
  data_pagamento DATE,
  forma_pagamento forma_pagamento_enum,
  comprovante_url TEXT,
  recibo_url TEXT,
  holerite_url TEXT,
  
  -- Status
  status status_pagamento DEFAULT 'pendente',
  observacoes TEXT,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  processado_por UUID REFERENCES users(id),
  deleted_at TIMESTAMP,
  
  UNIQUE(colaborador_id, mes_referencia)
);

-- ============================================
-- MÓDULO ESTOQUE
-- ============================================

-- CATEGORIAS DE MATERIAL
CREATE TABLE categorias_material (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id VARCHAR(50) NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  tipo_vinculacao tipo_vinculacao DEFAULT 'consumo',
  icone VARCHAR(50),
  ordem INTEGER DEFAULT 0,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  
  UNIQUE(empresa_id, nome)
);

-- MATERIAIS
-- RN-006: Bloqueio de estoque por vinculação a OS
CREATE TABLE materiais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id VARCHAR(50) NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  codigo VARCHAR(50),
  nome VARCHAR(255) NOT NULL,
  categoria_id UUID REFERENCES categorias_material(id),
  descricao TEXT,
  
  -- Estoque
  unidade_medida VARCHAR(20) NOT NULL, -- 'UN', 'KG', 'L', 'M', 'M2', 'M3'
  estoque_atual DECIMAL(10, 2) DEFAULT 0,
  estoque_minimo DECIMAL(10, 2) DEFAULT 0,
  estoque_maximo DECIMAL(10, 2),
  
  -- RN-006: Bloqueio de estoque
  estoque_bloqueado DECIMAL(10, 2) DEFAULT 0,
  estoque_disponivel DECIMAL(10, 2) GENERATED ALWAYS AS (estoque_atual - estoque_bloqueado) STORED,
  
  -- Precificação
  valor_unitario DECIMAL(12, 2),
  valor_locacao DECIMAL(12, 2), -- Para materiais de locação
  valor_ultima_compra DECIMAL(12, 2),
  data_ultima_compra DATE,
  
  -- Localização física
  localizacao VARCHAR(100),
  corredor VARCHAR(20),
  prateleira VARCHAR(20),
  
  -- Dados técnicos
  especificacoes_tecnicas JSONB DEFAULT '{}',
  fornecedor_principal_id UUID REFERENCES fornecedores(id),
  codigo_fabricante VARCHAR(100),
  ncm VARCHAR(10), -- Nomenclatura Comum do Mercosul
  
  -- Controle de qualidade
  data_validade DATE,
  lote VARCHAR(50),
  numero_serie VARCHAR(100),
  
  -- Mídia
  imagem_url TEXT,
  imagens_adicionais JSONB DEFAULT '[]',
  manual_url TEXT,
  
  -- Status
  status status_material DEFAULT 'ativo',
  observacoes TEXT,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  deleted_at TIMESTAMP,
  
  UNIQUE(empresa_id, codigo)
);

-- HISTÓRICO DE MOVIMENTAÇÃO DE MATERIAIS
CREATE TABLE historico_materiais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID NOT NULL REFERENCES materiais(id) ON DELETE CASCADE,
  empresa_id VARCHAR(50) NOT NULL REFERENCES empresas(id),
  
  -- Movimentação
  tipo tipo_historico_material NOT NULL,
  quantidade DECIMAL(10, 2) NOT NULL,
  
  -- Saldos (snapshot do momento)
  estoque_anterior DECIMAL(10, 2),
  estoque_atual DECIMAL(10, 2),
  estoque_bloqueado DECIMAL(10, 2),
  
  -- Relacionamentos
  ordem_servico_id UUID, -- Se movimentação for vinculada a OS
  colaborador_id UUID REFERENCES colaboradores(id),
  fornecedor_id UUID REFERENCES fornecedores(id),
  
  -- Detalhes
  observacoes TEXT,
  documento VARCHAR(100), -- Nota fiscal, OS, etc.
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- ============================================
-- MÓDULO OPERACIONAL
-- ============================================

-- VEÍCULOS
CREATE TABLE veiculos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id VARCHAR(50) NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  placa VARCHAR(10) UNIQUE NOT NULL,
  chassi VARCHAR(17) UNIQUE,
  renavam VARCHAR(11),
  
  -- Dados do veículo
  modelo VARCHAR(100) NOT NULL,
  marca VARCHAR(100) NOT NULL,
  ano_fabricacao INTEGER,
  ano_modelo INTEGER,
  cor VARCHAR(50),
  tipo_veiculo VARCHAR(50), -- 'carro', 'van', 'caminhão', 'moto'
  
  -- Capacidade
  capacidade_carga DECIMAL(10, 2), -- Em KG ou M3
  capacidade_passageiros INTEGER,
  
  -- IPVA e documentos
  valor_ipva DECIMAL(12, 2),
  data_vencimento_ipva DATE,
  data_vencimento_licenciamento DATE,
  
  -- Seguro
  seguradora VARCHAR(100),
  apolice VARCHAR(50),
  valor_seguro DECIMAL(12, 2),
  data_vencimento_seguro DATE,
  
  -- Rastreamento
  tem_rastreador BOOLEAN DEFAULT FALSE,
  codigo_rastreador VARCHAR(50),
  
  -- Manutenção
  km_atual INTEGER,
  ultima_revisao_km INTEGER,
  proxima_revisao_km INTEGER,
  data_ultima_revisao DATE,
  
  -- Documentos e fotos
  crlv_url TEXT,
  fotos_urls JSONB DEFAULT '[]',
  
  -- Status
  status status_veiculo DEFAULT 'disponivel',
  observacoes TEXT,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  deleted_at TIMESTAMP,
  
  CONSTRAINT veiculos_placa_format CHECK (placa ~ '^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$')
);

-- ORDENS DE SERVIÇO
CREATE TABLE ordens_servico (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id VARCHAR(50) NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  numero_os VARCHAR(50) UNIQUE NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  
  -- Relacionamentos
  contrato_id UUID REFERENCES contratos(id),
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  
  -- Detalhes do evento
  descricao_evento TEXT NOT NULL,
  local_evento TEXT,
  endereco_evento JSONB DEFAULT '{}',
  localizacao_evento GEOGRAPHY(POINT), -- GPS do local
  
  -- Datas e horários
  data_montagem TIMESTAMP NOT NULL,
  data_desmontagem TIMESTAMP,
  data_evento TIMESTAMP,
  duracao_estimada_horas INTEGER,
  
  -- Responsáveis
  responsavel_evento VARCHAR(255),
  contato_evento VARCHAR(100),
  telefone_contato VARCHAR(20),
  
  -- Equipe
  veiculo_id UUID REFERENCES veiculos(id),
  motorista_id UUID REFERENCES colaboradores(id),
  equipe_montagem UUID[], -- Array de IDs de colaboradores
  
  -- Valores (se não vinculado a contrato)
  valor_servico DECIMAL(12, 2),
  valor_adicional DECIMAL(12, 2) DEFAULT 0,
  desconto DECIMAL(12, 2) DEFAULT 0,
  
  -- Checklist e qualidade
  checklist_montagem JSONB DEFAULT '[]',
  checklist_desmontagem JSONB DEFAULT '[]',
  fotos_montagem JSONB DEFAULT '[]',
  fotos_desmontagem JSONB DEFAULT '[]',
  
  -- Assinaturas digitais
  assinatura_entrega_url TEXT,
  assinatura_entrega_nome VARCHAR(255),
  assinatura_entrega_data TIMESTAMP,
  
  assinatura_retirada_url TEXT,
  assinatura_retirada_nome VARCHAR(255),
  assinatura_retirada_data TIMESTAMP,
  
  -- Status e prioridade
  status status_ordem_servico DEFAULT 'criada',
  prioridade VARCHAR(20) DEFAULT 'normal', -- 'baixa', 'normal', 'alta', 'urgente'
  
  observacoes TEXT,
  observacoes_internas TEXT, -- Não visível para o cliente
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  deleted_at TIMESTAMP
);

-- ITENS DA ORDEM DE SERVIÇO
-- RN-006: Vinculação de materiais bloqueia estoque
CREATE TABLE itens_ordem_servico (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ordem_servico_id UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES materiais(id),
  
  -- Quantidades
  quantidade_solicitada DECIMAL(10, 2) NOT NULL,
  quantidade_entregue DECIMAL(10, 2) DEFAULT 0,
  quantidade_devolvida DECIMAL(10, 2) DEFAULT 0,
  quantidade_danificada DECIMAL(10, 2) DEFAULT 0,
  
  -- RN-006: Bloqueio de estoque
  estoque_bloqueado BOOLEAN DEFAULT TRUE,
  data_bloqueio TIMESTAMP,
  data_desbloqueio TIMESTAMP,
  
  -- Valores
  valor_unitario DECIMAL(12, 2),
  valor_total DECIMAL(12, 2) GENERATED ALWAYS AS (quantidade_solicitada * valor_unitario) STORED,
  
  -- Status
  conferido_entrega BOOLEAN DEFAULT FALSE,
  conferido_devolucao BOOLEAN DEFAULT FALSE,
  
  observacoes TEXT,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- ============================================
-- MÓDULO FISCAL
-- ============================================

-- NOTAS FISCAIS
CREATE TABLE notas_fiscais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id VARCHAR(50) NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  numero VARCHAR(50) NOT NULL,
  serie VARCHAR(10) NOT NULL,
  chave_acesso VARCHAR(44) UNIQUE,
  numero_rps VARCHAR(50), -- Recibo Provisório de Serviços
  
  -- Relacionamentos
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  contrato_id UUID REFERENCES contratos(id),
  ordem_servico_id UUID REFERENCES ordens_servico(id),
  
  -- Datas
  data_emissao TIMESTAMP NOT NULL,
  data_competencia DATE,
  data_envio_email TIMESTAMP,
  
  -- Valores dos serviços
  valor_servicos DECIMAL(12, 2) NOT NULL,
  valor_deducoes DECIMAL(12, 2) DEFAULT 0,
  desconto_incondicionado DECIMAL(12, 2) DEFAULT 0,
  desconto_condicionado DECIMAL(12, 2) DEFAULT 0,
  
  -- Impostos
  base_calculo DECIMAL(12, 2),
  aliquota_iss DECIMAL(5, 2),
  valor_iss DECIMAL(12, 2),
  valor_cofins DECIMAL(12, 2) DEFAULT 0,
  valor_pis DECIMAL(12, 2) DEFAULT 0,
  valor_ir DECIMAL(12, 2) DEFAULT 0,
  valor_csll DECIMAL(12, 2) DEFAULT 0,
  valor_inss DECIMAL(12, 2) DEFAULT 0,
  
  -- Valor final
  valor_liquido DECIMAL(12, 2),
  valor_total DECIMAL(12, 2),
  
  -- Descrição dos serviços
  descricao_servicos TEXT NOT NULL,
  itens_servico JSONB DEFAULT '[]',
  codigo_servico VARCHAR(20), -- Código CNAE
  codigo_tributacao_municipio VARCHAR(20),
  
  -- Regime tributário
  regime_tributacao VARCHAR(20), -- 'simples_nacional', 'lucro_presumido', 'lucro_real'
  optante_simples_nacional BOOLEAN DEFAULT FALSE,
  
  -- Arquivos
  xml_url TEXT,
  pdf_url TEXT,
  
  -- Status
  status status_nota_fiscal DEFAULT 'emitida',
  cancelada BOOLEAN DEFAULT FALSE,
  data_cancelamento TIMESTAMP,
  motivo_cancelamento TEXT,
  
  observacoes TEXT,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  deleted_at TIMESTAMP,
  
  UNIQUE(empresa_id, numero, serie)
);

-- ============================================
-- TABELAS DE SISTEMA
-- ============================================

-- LOG DE AUDITORIA
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificação
  tabela VARCHAR(100) NOT NULL,
  registro_id UUID NOT NULL,
  acao VARCHAR(20) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  
  -- Usuário
  usuario_id UUID REFERENCES users(id),
  usuario_nome VARCHAR(255),
  usuario_email VARCHAR(255),
  
  -- Empresa
  empresa_id VARCHAR(50) REFERENCES empresas(id),
  
  -- Dados
  dados_antigos JSONB,
  dados_novos JSONB,
  campos_alterados TEXT[],
  
  -- Contexto
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW()
);

-- NOTIFICAÇÕES
CREATE TABLE notificacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Destinatário
  usuario_id UUID NOT NULL REFERENCES users(id),
  
  -- Conteúdo
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- 'info', 'warning', 'error', 'success'
  categoria VARCHAR(50), -- 'financeiro', 'rh', 'estoque', 'operacional'
  
  -- Relacionamentos (opcional)
  entidade_tipo VARCHAR(100),
  entidade_id UUID,
  
  -- Ação
  link_acao TEXT,
  botao_acao VARCHAR(100),
  
  -- Status
  lida BOOLEAN DEFAULT FALSE,
  data_leitura TIMESTAMP,
  arquivada BOOLEAN DEFAULT FALSE,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices de relacionamento e queries frequentes
CREATE INDEX idx_users_empresa ON users(empresa_id);
CREATE INDEX idx_users_perfil ON users(perfil);
CREATE INDEX idx_users_status ON users(status) WHERE deleted_at IS NULL;

CREATE INDEX idx_clientes_empresa ON clientes(empresa_id);
CREATE INDEX idx_clientes_cpf_cnpj ON clientes(cpf_cnpj);
CREATE INDEX idx_clientes_status ON clientes(status) WHERE deleted_at IS NULL;

CREATE INDEX idx_fornecedores_empresa ON fornecedores(empresa_id);

CREATE INDEX idx_contratos_empresa ON contratos(empresa_id);
CREATE INDEX idx_contratos_cliente ON contratos(cliente_id);
CREATE INDEX idx_contratos_status ON contratos(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_contratos_numero ON contratos(numero_contrato);

CREATE INDEX idx_parcelas_contrato ON parcelas(contrato_id);
CREATE INDEX idx_parcelas_status ON parcelas(status);
CREATE INDEX idx_parcelas_vencimento ON parcelas(data_vencimento);

CREATE INDEX idx_despesas_empresa ON despesas(empresa_id);
CREATE INDEX idx_despesas_competencia ON despesas(data_competencia);
CREATE INDEX idx_despesas_vencimento ON despesas(data_vencimento);
CREATE INDEX idx_despesas_status ON despesas(status);

CREATE INDEX idx_colaboradores_empresa ON colaboradores(empresa_id);
CREATE INDEX idx_colaboradores_cpf ON colaboradores(cpf);
CREATE INDEX idx_colaboradores_status ON colaboradores(status) WHERE deleted_at IS NULL;

CREATE INDEX idx_ponto_colaborador ON registros_ponto(colaborador_id);
CREATE INDEX idx_ponto_data ON registros_ponto(data);
CREATE INDEX idx_ponto_empresa_data ON registros_ponto(empresa_id, data);

CREATE INDEX idx_pagamentos_colaborador ON pagamentos(colaborador_id);
CREATE INDEX idx_pagamentos_competencia ON pagamentos(competencia);
CREATE INDEX idx_pagamentos_status ON pagamentos(status);

CREATE INDEX idx_materiais_empresa ON materiais(empresa_id);
CREATE INDEX idx_materiais_codigo ON materiais(codigo);
CREATE INDEX idx_materiais_categoria ON materiais(categoria_id);
CREATE INDEX idx_materiais_status ON materiais(status) WHERE deleted_at IS NULL;

CREATE INDEX idx_historico_materiais_material ON historico_materiais(material_id);
CREATE INDEX idx_historico_materiais_data ON historico_materiais(created_at);

CREATE INDEX idx_veiculos_empresa ON veiculos(empresa_id);
CREATE INDEX idx_veiculos_placa ON veiculos(placa);
CREATE INDEX idx_veiculos_status ON veiculos(status) WHERE deleted_at IS NULL;

CREATE INDEX idx_os_empresa ON ordens_servico(empresa_id);
CREATE INDEX idx_os_cliente ON ordens_servico(cliente_id);
CREATE INDEX idx_os_numero ON ordens_servico(numero_os);
CREATE INDEX idx_os_status ON ordens_servico(status);
CREATE INDEX idx_os_data_montagem ON ordens_servico(data_montagem);

CREATE INDEX idx_itens_os_ordem ON itens_ordem_servico(ordem_servico_id);
CREATE INDEX idx_itens_os_material ON itens_ordem_servico(material_id);

CREATE INDEX idx_nf_empresa ON notas_fiscais(empresa_id);
CREATE INDEX idx_nf_cliente ON notas_fiscais(cliente_id);
CREATE INDEX idx_nf_numero ON notas_fiscais(numero, serie);
CREATE INDEX idx_nf_chave ON notas_fiscais(chave_acesso);
CREATE INDEX idx_nf_emissao ON notas_fiscais(data_emissao);

CREATE INDEX idx_audit_log_tabela_registro ON audit_log(tabela, registro_id);
CREATE INDEX idx_audit_log_usuario ON audit_log(usuario_id);
CREATE INDEX idx_audit_log_data ON audit_log(created_at);

CREATE INDEX idx_notificacoes_usuario ON notificacoes(usuario_id);
CREATE INDEX idx_notificacoes_lida ON notificacoes(lida) WHERE deleted_at IS NULL;

-- Índices GiST para geolocalização (PostGIS)
CREATE INDEX idx_ponto_localizacao_entrada ON registros_ponto USING GIST(localizacao_entrada);
CREATE INDEX idx_os_localizacao_evento ON ordens_servico USING GIST(localizacao_evento);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos_catalogo ENABLE ROW LEVEL SECURITY;
ALTER TABLE cargos ENABLE ROW LEVEL SECURITY;
ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_ponto ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_material ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_ordem_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas_fiscais ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS
-- ============================================

-- USERS: Usuário pode ver seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- USERS: Admin grupo pode ver todos os usuários
CREATE POLICY "Admin grupo can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND perfil = 'admin_grupo'
    )
  );

-- EMPRESAS: Admin grupo pode ver todas as empresas
CREATE POLICY "Admin grupo can view all empresas"
  ON empresas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND perfil = 'admin_grupo'
    )
  );

-- EMPRESAS: Usuários podem ver suas próprias empresas
CREATE POLICY "Users can view own empresas"
  ON empresas FOR SELECT
  USING (
    id IN (
      SELECT empresa_id FROM users WHERE id = auth.uid()
      UNION
      SELECT unnest(empresas_ids) FROM users WHERE id = auth.uid()
    )
  );

-- POLÍTICA GENÉRICA: Filtragem por empresa_id
-- Aplica-se a: clientes, fornecedores, contratos, despesas, cargos, colaboradores,
-- registros_ponto, pagamentos, materiais, veiculos, ordens_servico, notas_fiscais

CREATE POLICY "Empresa filtering"
  ON clientes FOR ALL
  USING (
    empresa_id IN (
      SELECT empresa_id FROM users WHERE id = auth.uid()
      UNION
      SELECT unnest(empresas_ids) FROM users WHERE id = auth.uid()
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Empresa filtering"
  ON fornecedores FOR ALL
  USING (
    empresa_id IN (
      SELECT empresa_id FROM users WHERE id = auth.uid()
      UNION
      SELECT unnest(empresas_ids) FROM users WHERE id = auth.uid()
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Empresa filtering"
  ON contratos FOR ALL
  USING (
    empresa_id IN (
      SELECT empresa_id FROM users WHERE id = auth.uid()
      UNION
      SELECT unnest(empresas_ids) FROM users WHERE id = auth.uid()
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Empresa filtering"
  ON despesas FOR ALL
  USING (
    empresa_id IN (
      SELECT empresa_id FROM users WHERE id = auth.uid()
      UNION
      SELECT unnest(empresas_ids) FROM users WHERE id = auth.uid()
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Empresa filtering"
  ON cargos FOR ALL
  USING (
    empresa_id IN (
      SELECT empresa_id FROM users WHERE id = auth.uid()
      UNION
      SELECT unnest(empresas_ids) FROM users WHERE id = auth.uid()
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Empresa filtering"
  ON colaboradores FOR ALL
  USING (
    empresa_id IN (
      SELECT empresa_id FROM users WHERE id = auth.uid()
      UNION
      SELECT unnest(empresas_ids) FROM users WHERE id = auth.uid()
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Empresa filtering"
  ON registros_ponto FOR ALL
  USING (
    empresa_id IN (
      SELECT empresa_id FROM users WHERE id = auth.uid()
      UNION
      SELECT unnest(empresas_ids) FROM users WHERE id = auth.uid()
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Empresa filtering"
  ON pagamentos FOR ALL
  USING (
    empresa_id IN (
      SELECT empresa_id FROM users WHERE id = auth.uid()
      UNION
      SELECT unnest(empresas_ids) FROM users WHERE id = auth.uid()
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Empresa filtering"
  ON categorias_material FOR ALL
  USING (
    empresa_id IN (
      SELECT empresa_id FROM users WHERE id = auth.uid()
      UNION
      SELECT unnest(empresas_ids) FROM users WHERE id = auth.uid()
    )
    AND deleted_at IS NULL
  );

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

CREATE POLICY "Empresa filtering"
  ON historico_materiais FOR ALL
  USING (
    empresa_id IN (
      SELECT empresa_id FROM users WHERE id = auth.uid()
      UNION
      SELECT unnest(empresas_ids) FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Empresa filtering"
  ON veiculos FOR ALL
  USING (
    empresa_id IN (
      SELECT empresa_id FROM users WHERE id = auth.uid()
      UNION
      SELECT unnest(empresas_ids) FROM users WHERE id = auth.uid()
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Empresa filtering"
  ON ordens_servico FOR ALL
  USING (
    empresa_id IN (
      SELECT empresa_id FROM users WHERE id = auth.uid()
      UNION
      SELECT unnest(empresas_ids) FROM users WHERE id = auth.uid()
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Empresa filtering"
  ON notas_fiscais FOR ALL
  USING (
    empresa_id IN (
      SELECT empresa_id FROM users WHERE id = auth.uid()
      UNION
      SELECT unnest(empresas_ids) FROM users WHERE id = auth.uid()
    )
    AND deleted_at IS NULL
  );

-- ITENS ORDEM DE SERVIÇO: Acesso via OS
CREATE POLICY "Access via ordem_servico"
  ON itens_ordem_servico FOR ALL
  USING (
    ordem_servico_id IN (
      SELECT id FROM ordens_servico
      WHERE empresa_id IN (
        SELECT empresa_id FROM users WHERE id = auth.uid()
        UNION
        SELECT unnest(empresas_ids) FROM users WHERE id = auth.uid()
      )
    )
    AND deleted_at IS NULL
  );

-- PARCELAS: Acesso via contrato
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

-- CATÁLOGO: Todos podem visualizar
CREATE POLICY "Everyone can view catalogo"
  ON categorias_servicos FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY "Everyone can view servicos"
  ON servicos_catalogo FOR SELECT
  USING (deleted_at IS NULL);

-- AUDIT LOG: Admin grupo pode ver tudo
CREATE POLICY "Admin grupo can view all logs"
  ON audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND perfil = 'admin_grupo'
    )
  );

-- AUDIT LOG: Usuários podem ver logs de suas empresas
CREATE POLICY "Users can view own empresa logs"
  ON audit_log FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM users WHERE id = auth.uid()
      UNION
      SELECT unnest(empresas_ids) FROM users WHERE id = auth.uid()
    )
  );

-- NOTIFICAÇÕES: Usuário pode ver suas próprias notificações
CREATE POLICY "Users can view own notifications"
  ON notificacoes FOR ALL
  USING (usuario_id = auth.uid() AND deleted_at IS NULL);

-- ============================================
-- TRIGGERS E FUNCTIONS
-- ============================================

-- Function para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas com updated_at
CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON empresas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fornecedores_updated_at BEFORE UPDATE ON fornecedores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contratos_updated_at BEFORE UPDATE ON contratos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parcelas_updated_at BEFORE UPDATE ON parcelas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_despesas_updated_at BEFORE UPDATE ON despesas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_colaboradores_updated_at BEFORE UPDATE ON colaboradores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materiais_updated_at BEFORE UPDATE ON materiais
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_veiculos_updated_at BEFORE UPDATE ON veiculos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ordens_servico_updated_at BEFORE UPDATE ON ordens_servico
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function para criar entrada no audit_log
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
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger de auditoria nas tabelas críticas
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_contratos AFTER INSERT OR UPDATE OR DELETE ON contratos
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_despesas AFTER INSERT OR UPDATE OR DELETE ON despesas
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_pagamentos AFTER INSERT OR UPDATE OR DELETE ON pagamentos
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

-- Function para calcular horas trabalhadas no ponto
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
  
  -- Calcular horas extras (acima das horas contratadas)
  IF NEW.horas_trabalhadas > NEW.horas_contratadas THEN
    NEW.horas_extras := NEW.horas_trabalhadas - NEW.horas_contratadas;
  ELSE
    NEW.horas_extras := 0;
  END IF;
  
  -- Calcular banco de horas (pode ser negativo se faltou horas)
  NEW.banco_horas := NEW.horas_trabalhadas - NEW.horas_contratadas;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calcular_horas BEFORE INSERT OR UPDATE ON registros_ponto
  FOR EACH ROW EXECUTE FUNCTION calcular_horas_ponto();

-- Function para criar histórico ao alterar estoque
CREATE OR REPLACE FUNCTION criar_historico_material()
RETURNS TRIGGER AS $$
BEGIN
  -- Se estoque_atual mudou
  IF (TG_OP = 'UPDATE' AND OLD.estoque_atual <> NEW.estoque_atual) THEN
    INSERT INTO historico_materiais (
      material_id,
      empresa_id,
      tipo,
      quantidade,
      estoque_anterior,
      estoque_atual,
      estoque_bloqueado,
      observacoes,
      created_by
    ) VALUES (
      NEW.id,
      NEW.empresa_id,
      CASE 
        WHEN NEW.estoque_atual > OLD.estoque_atual THEN 'entrada'
        ELSE 'saida'
      END,
      ABS(NEW.estoque_atual - OLD.estoque_atual),
      OLD.estoque_atual,
      NEW.estoque_atual,
      NEW.estoque_bloqueado,
      'Alteração automática de estoque',
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER historico_estoque AFTER UPDATE ON materiais
  FOR EACH ROW EXECUTE FUNCTION criar_historico_material();

-- ============================================
-- DADOS INICIAIS (SEED)
-- ============================================

-- Inserir empresas do Grupo 2S
INSERT INTO empresas (id, nome, tipo, cnpj, email, status, cor_primaria, cor_secundaria) VALUES
('grupo-2s', 'Grupo 2S', 'grupo', NULL, 'diretoria@grupo2s.com', 'ativo', '#1F4788', '#28A745'),
('2s-locacoes', '2S Locações', '2s_locacoes', '12.345.678/0001-01', 'contato@2slocacoes.com.br', 'ativo', '#1F4788', '#28A745'),
('2s-marketing', '2S Marketing', '2s_marketing', '12.345.678/0002-02', 'contato@2smarketing.com.br', 'ativo', '#1F4788', '#DC3545'),
('2s-producoes', '2S Produções e Eventos', '2s_producoes', '12.345.678/0003-03', 'contato@2sproducoes.com.br', 'ativo', '#1F4788', '#6C757D');

-- Inserir categorias de serviços
INSERT INTO categorias_servicos (nome, descricao, icone, ordem) VALUES
('Locação de Equipamentos', 'Equipamentos para eventos', 'Package', 1),
('Marketing Digital', 'Serviços de marketing e publicidade', 'Megaphone', 2),
('Produção de Eventos', 'Organização e produção de eventos', 'Calendar', 3),
('Design Gráfico', 'Criação de materiais visuais', 'Palette', 4);

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View: Contratos com saldo de parcelas
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

-- View: Materiais com estoque baixo
CREATE VIEW vw_materiais_estoque_baixo AS
SELECT 
  m.*,
  c.nome AS categoria_nome
FROM materiais m
LEFT JOIN categorias_material c ON c.id = m.categoria_id
WHERE m.estoque_disponivel < m.estoque_minimo
  AND m.status = 'ativo'
  AND m.deleted_at IS NULL;

-- View: Colaboradores com banco de horas
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
WHERE c.deleted_at IS NULL
  AND c.status = 'ativo'
GROUP BY c.id;

-- View: Dashboard financeiro consolidado
CREATE VIEW vw_dashboard_financeiro AS
SELECT 
  empresa_id,
  DATE_TRUNC('month', data_vencimento) AS mes,
  
  -- Receitas (contratos a receber)
  COALESCE(SUM(valor) FILTER (WHERE status IN ('pendente', 'pago')), 0) AS receita_total,
  COALESCE(SUM(valor) FILTER (WHERE status = 'pago'), 0) AS receita_recebida,
  COALESCE(SUM(valor) FILTER (WHERE status = 'pendente'), 0) AS receita_pendente,
  
  -- Quantidade
  COUNT(*) FILTER (WHERE status IN ('pendente', 'pago')) AS total_parcelas,
  COUNT(*) FILTER (WHERE status = 'pago') AS parcelas_pagas,
  COUNT(*) FILTER (WHERE status = 'pendente') AS parcelas_pendentes
FROM parcelas p
JOIN contratos c ON c.id = p.contrato_id
WHERE p.deleted_at IS NULL
GROUP BY empresa_id, DATE_TRUNC('month', data_vencimento);

-- ============================================
-- COMENTÁRIOS NA ESTRUTURA
-- ============================================

COMMENT ON TABLE empresas IS 'Empresas do Grupo 2S com multi-tenancy';
COMMENT ON TABLE users IS 'Usuários do sistema com autenticação Supabase';
COMMENT ON TABLE contratos IS 'Contratos com clientes e fornecedores (RN-003)';
COMMENT ON TABLE despesas IS 'Despesas com rateio entre empresas (RN-002)';
COMMENT ON TABLE colaboradores IS 'Colaboradores com rateio multi-empresa (RN-002)';
COMMENT ON TABLE registros_ponto IS 'Controle de ponto centralizado com banco de horas (RN-004)';
COMMENT ON TABLE materiais IS 'Materiais com controle de bloqueio de estoque (RN-006)';
COMMENT ON TABLE pagamentos IS 'Folha de pagamento com separação de bônus e descontos (RN-007)';

-- ============================================
-- FIM DO SCHEMA
-- ============================================
