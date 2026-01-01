# 📐 Diagrama Entidade-Relacionamento (ER)

## Sistema ERP Grupo 2S - Database Schema

---

## 🎯 Visão Geral do Schema

O banco de dados é organizado em **7 módulos principais** com relacionamentos complexos e suporte a multi-tenancy.

```
┌─────────────────────────────────────────────────────────────┐
│                    SISTEMA ERP GRUPO 2S                      │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  ADMIN   │  │FINANCEIRO│  │    RH    │  │ ESTOQUE  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │OPERACION.│  │  FISCAL  │  │ CATÁLOGO │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Diagrama ER Completo (Mermaid)

```mermaid
erDiagram
    %% ===================================
    %% MÓDULO ADMIN
    %% ===================================
    
    EMPRESAS ||--o{ USERS : possui
    EMPRESAS ||--o{ CLIENTES : possui
    EMPRESAS ||--o{ FORNECEDORES : possui
    EMPRESAS ||--o{ CONTRATOS : possui
    EMPRESAS ||--o{ DESPESAS : possui
    EMPRESAS ||--o{ COLABORADORES : possui
    EMPRESAS ||--o{ MATERIAIS : possui
    EMPRESAS ||--o{ VEICULOS : possui
    EMPRESAS ||--o{ ORDENS_SERVICO : possui
    
    EMPRESAS {
        varchar id PK "grupo-2s, 2s-locacoes, etc"
        varchar nome
        enum tipo "grupo, 2s_locacoes, 2s_marketing, 2s_producoes"
        varchar cnpj UK
        varchar email
        jsonb endereco_completo
        jsonb dados_bancarios
        varchar cor_primaria
        varchar cor_secundaria
        text logo_url
        enum status
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    USERS {
        uuid id PK "FK auth.users"
        varchar email UK
        varchar nome
        varchar empresa_id FK
        array empresas_ids "Multi-empresa"
        enum perfil "admin_grupo, admin, gestor, etc"
        jsonb permissoes_customizadas
        varchar telefone
        text avatar_url
        enum status
        text senha_hash "bcrypt"
        timestamp ultimo_acesso
        jsonb preferencias
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    %% ===================================
    %% MÓDULO FINANCEIRO
    %% ===================================
    
    CLIENTES ||--o{ CONTRATOS : "tem contratos com"
    FORNECEDORES ||--o{ CONTRATOS : "tem contratos com"
    CONTRATOS ||--o{ PARCELAS : "dividido em"
    CONTRATOS ||--o{ ORDENS_SERVICO : gera
    CONTRATOS ||--o{ NOTAS_FISCAIS : gera
    
    CLIENTES {
        uuid id PK
        varchar empresa_id FK
        enum tipo "PF ou PJ"
        varchar nome_razao_social
        varchar cpf_cnpj UK
        varchar email
        varchar telefone
        varchar whatsapp
        jsonb endereco_completo
        jsonb dados_bancarios
        decimal limite_credito
        int dia_vencimento_preferencial
        uuid responsavel_id FK
        enum status
        timestamp created_at
        timestamp updated_at
        uuid created_by FK
        timestamp deleted_at
    }
    
    FORNECEDORES {
        uuid id PK
        varchar empresa_id FK
        enum tipo "PF ou PJ"
        varchar nome_razao_social
        varchar cpf_cnpj UK
        varchar email
        varchar telefone
        varchar categoria_servico
        jsonb dados_bancarios
        int prazo_pagamento_dias
        enum status
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    CONTRATOS {
        uuid id PK
        varchar empresa_id FK
        varchar numero_contrato UK
        enum tipo "cliente, fornecedor, parceria"
        uuid cliente_id FK
        uuid fornecedor_id FK
        text descricao
        decimal valor_total
        decimal desconto
        decimal acrescimo
        decimal valor_final "GENERATED"
        date data_inicio
        date data_fim
        enum tipo_parcelamento
        int numero_parcelas
        int dia_vencimento
        boolean renovacao_automatica
        text arquivo_pdf_url
        jsonb arquivos_anexos
        enum status
        timestamp created_at
        timestamp updated_at
        uuid created_by FK
        timestamp deleted_at
    }
    
    PARCELAS {
        uuid id PK
        uuid contrato_id FK
        int numero_parcela
        varchar descricao
        decimal valor
        decimal valor_pago
        decimal multa
        decimal juros
        decimal desconto
        date data_vencimento
        date data_pagamento
        int dias_atraso "GENERATED"
        enum forma_pagamento
        text comprovante_url
        varchar numero_documento
        enum status
        text observacoes
        timestamp created_at
        timestamp updated_at
        uuid pago_por FK
        timestamp deleted_at
    }
    
    DESPESAS {
        uuid id PK
        varchar empresa_id FK
        varchar numero_documento
        varchar descricao
        enum categoria
        decimal valor
        decimal desconto
        decimal acrescimo
        decimal valor_final "GENERATED"
        date data_competencia
        date data_vencimento
        date data_pagamento
        enum forma_pagamento
        text comprovante_url
        uuid fornecedor_id FK
        uuid contrato_id FK
        jsonb rateio_empresas "RN-002"
        enum status
        boolean recorrente
        varchar frequencia_recorrencia
        timestamp created_at
        timestamp updated_at
        uuid created_by FK
        timestamp deleted_at
    }
    
    %% ===================================
    %% MÓDULO CATÁLOGO
    %% ===================================
    
    CATEGORIAS_SERVICOS ||--o{ SERVICOS_CATALOGO : categoriza
    
    CATEGORIAS_SERVICOS {
        uuid id PK
        varchar nome
        text descricao
        varchar icone
        int ordem
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    SERVICOS_CATALOGO {
        uuid id PK
        uuid categoria_id FK
        varchar codigo UK
        varchar nome
        text descricao
        jsonb precos_por_empresa "Preços por empresa"
        varchar unidade_medida
        varchar tempo_execucao
        text imagem_url
        array tags
        boolean disponivel
        array empresas_disponiveis
        timestamp created_at
        timestamp updated_at
        uuid created_by FK
        timestamp deleted_at
    }
    
    %% ===================================
    %% MÓDULO RH
    %% ===================================
    
    CARGOS ||--o{ COLABORADORES : possui
    COLABORADORES ||--o{ REGISTROS_PONTO : registra
    COLABORADORES ||--o{ PAGAMENTOS : recebe
    COLABORADORES ||--o{ ORDENS_SERVICO : "participa como motorista"
    
    CARGOS {
        uuid id PK
        varchar empresa_id FK
        varchar nome
        text descricao
        varchar nivel
        varchar departamento
        decimal salario_base_min
        decimal salario_base_max
        text requisitos
        text responsabilidades
        enum status
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    COLABORADORES {
        uuid id PK
        varchar empresa_id FK
        varchar nome
        varchar cpf UK
        varchar rg
        date data_nascimento
        varchar email
        varchar telefone
        jsonb endereco_completo
        enum tipo_contrato "PJ, CLT, etc"
        uuid cargo_id FK
        varchar departamento
        varchar matricula UK
        decimal salario_base
        decimal vale_transporte
        decimal vale_alimentacao
        decimal plano_saude
        jsonb outros_beneficios
        date data_admissao
        date data_demissao
        date data_ultimo_reajuste
        jsonb rateio_empresas "RN-002"
        jsonb dados_bancarios
        jsonb documentos_urls
        text foto_url
        decimal horas_contratadas_dia
        int dias_trabalho_semana
        time horario_entrada
        time horario_saida
        enum status
        text observacoes
        timestamp created_at
        timestamp updated_at
        uuid created_by FK
        timestamp deleted_at
    }
    
    REGISTROS_PONTO {
        uuid id PK
        varchar empresa_id FK
        uuid colaborador_id FK
        date data UK
        time entrada_manha
        time saida_almoco
        time entrada_tarde
        time saida_noite
        decimal horas_trabalhadas "Calculado"
        decimal horas_contratadas
        decimal horas_extras "Calculado"
        decimal horas_falta
        decimal banco_horas "RN-004"
        decimal banco_horas_acumulado
        text justificativa
        text atestado_url
        uuid aprovado_por FK
        geography localizacao_entrada "GPS"
        geography localizacao_saida "GPS"
        inet ip_entrada
        inet ip_saida
        enum status
        text observacoes
        timestamp created_at
        timestamp updated_at
        uuid created_by FK
        timestamp deleted_at
    }
    
    PAGAMENTOS {
        uuid id PK
        varchar empresa_id FK
        uuid colaborador_id FK
        date mes_referencia UK
        varchar competencia
        decimal salario_base
        decimal vale_transporte "RN-007"
        decimal vale_alimentacao "RN-007"
        decimal plano_saude_empresa "RN-007"
        decimal bonus "RN-007: Separado"
        decimal comissao "RN-007"
        decimal hora_extra "RN-007"
        decimal adicional_noturno "RN-007"
        decimal adicional_periculosidade "RN-007"
        decimal adicional_insalubridade "RN-007"
        decimal outros_adicionais "RN-007"
        jsonb outros_adicionais_detalhes
        decimal plano_saude_colaborador "RN-007"
        decimal adiantamento "RN-007"
        decimal falta "RN-007"
        decimal atraso "RN-007"
        decimal inss "RN-007"
        decimal irpf "RN-007"
        decimal pensao_alimenticia "RN-007"
        decimal emprestimo "RN-007"
        decimal outros_descontos "RN-007"
        jsonb outros_descontos_detalhes
        decimal total_adicionais "GENERATED"
        decimal total_descontos "GENERATED"
        decimal salario_liquido "GENERATED"
        date data_pagamento
        enum forma_pagamento
        text comprovante_url
        text recibo_url
        text holerite_url
        enum status
        text observacoes
        timestamp created_at
        timestamp updated_at
        uuid created_by FK
        uuid processado_por FK
        timestamp deleted_at
    }
    
    %% ===================================
    %% MÓDULO ESTOQUE
    %% ===================================
    
    CATEGORIAS_MATERIAL ||--o{ MATERIAIS : categoriza
    MATERIAIS ||--o{ HISTORICO_MATERIAIS : "possui histórico"
    MATERIAIS ||--o{ ITENS_ORDEM_SERVICO : "usado em"
    
    CATEGORIAS_MATERIAL {
        uuid id PK
        varchar empresa_id FK
        varchar nome UK
        text descricao
        enum tipo_vinculacao "locacao, consumo, patrimonio"
        varchar icone
        int ordem
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    MATERIAIS {
        uuid id PK
        varchar empresa_id FK
        varchar codigo UK
        varchar nome
        uuid categoria_id FK
        text descricao
        varchar unidade_medida
        decimal estoque_atual
        decimal estoque_minimo
        decimal estoque_maximo
        decimal estoque_bloqueado "RN-006"
        decimal estoque_disponivel "GENERATED = atual - bloqueado"
        decimal valor_unitario
        decimal valor_locacao
        decimal valor_ultima_compra
        date data_ultima_compra
        varchar localizacao
        varchar corredor
        varchar prateleira
        jsonb especificacoes_tecnicas
        uuid fornecedor_principal_id FK
        varchar codigo_fabricante
        varchar ncm
        date data_validade
        varchar lote
        varchar numero_serie
        text imagem_url
        jsonb imagens_adicionais
        text manual_url
        enum status
        text observacoes
        timestamp created_at
        timestamp updated_at
        uuid created_by FK
        timestamp deleted_at
    }
    
    HISTORICO_MATERIAIS {
        uuid id PK
        uuid material_id FK
        varchar empresa_id FK
        enum tipo "entrada, saida, ajuste, bloqueio"
        decimal quantidade
        decimal estoque_anterior
        decimal estoque_atual
        decimal estoque_bloqueado
        uuid ordem_servico_id
        uuid colaborador_id FK
        uuid fornecedor_id FK
        text observacoes
        varchar documento
        timestamp created_at
        uuid created_by FK
    }
    
    %% ===================================
    %% MÓDULO OPERACIONAL
    %% ===================================
    
    VEICULOS ||--o{ ORDENS_SERVICO : "usado em"
    ORDENS_SERVICO ||--o{ ITENS_ORDEM_SERVICO : "contém itens"
    CLIENTES ||--o{ ORDENS_SERVICO : solicita
    
    VEICULOS {
        uuid id PK
        varchar empresa_id FK
        varchar placa UK
        varchar chassi UK
        varchar renavam
        varchar modelo
        varchar marca
        int ano_fabricacao
        int ano_modelo
        varchar cor
        varchar tipo_veiculo
        decimal capacidade_carga
        int capacidade_passageiros
        decimal valor_ipva
        date data_vencimento_ipva
        date data_vencimento_licenciamento
        varchar seguradora
        varchar apolice
        decimal valor_seguro
        date data_vencimento_seguro
        boolean tem_rastreador
        varchar codigo_rastreador
        int km_atual
        int ultima_revisao_km
        int proxima_revisao_km
        date data_ultima_revisao
        text crlv_url
        jsonb fotos_urls
        enum status
        text observacoes
        timestamp created_at
        timestamp updated_at
        uuid created_by FK
        timestamp deleted_at
    }
    
    ORDENS_SERVICO {
        uuid id PK
        varchar empresa_id FK
        varchar numero_os UK
        varchar titulo
        uuid contrato_id FK
        uuid cliente_id FK
        text descricao_evento
        text local_evento
        jsonb endereco_evento
        geography localizacao_evento "GPS"
        timestamp data_montagem
        timestamp data_desmontagem
        timestamp data_evento
        int duracao_estimada_horas
        varchar responsavel_evento
        varchar contato_evento
        varchar telefone_contato
        uuid veiculo_id FK
        uuid motorista_id FK
        array equipe_montagem "UUIDs colaboradores"
        decimal valor_servico
        decimal valor_adicional
        decimal desconto
        jsonb checklist_montagem
        jsonb checklist_desmontagem
        jsonb fotos_montagem
        jsonb fotos_desmontagem
        text assinatura_entrega_url
        varchar assinatura_entrega_nome
        timestamp assinatura_entrega_data
        text assinatura_retirada_url
        varchar assinatura_retirada_nome
        timestamp assinatura_retirada_data
        enum status
        varchar prioridade
        text observacoes
        text observacoes_internas
        timestamp created_at
        timestamp updated_at
        uuid created_by FK
        timestamp deleted_at
    }
    
    ITENS_ORDEM_SERVICO {
        uuid id PK
        uuid ordem_servico_id FK
        uuid material_id FK
        decimal quantidade_solicitada
        decimal quantidade_entregue
        decimal quantidade_devolvida
        decimal quantidade_danificada
        boolean estoque_bloqueado "RN-006"
        timestamp data_bloqueio
        timestamp data_desbloqueio
        decimal valor_unitario
        decimal valor_total "GENERATED"
        boolean conferido_entrega
        boolean conferido_devolucao
        text observacoes
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    %% ===================================
    %% MÓDULO FISCAL
    %% ===================================
    
    CLIENTES ||--o{ NOTAS_FISCAIS : recebe
    CONTRATOS ||--o{ NOTAS_FISCAIS : gera
    ORDENS_SERVICO ||--o{ NOTAS_FISCAIS : gera
    
    NOTAS_FISCAIS {
        uuid id PK
        varchar empresa_id FK
        varchar numero
        varchar serie
        varchar chave_acesso UK
        varchar numero_rps
        uuid cliente_id FK
        uuid contrato_id FK
        uuid ordem_servico_id FK
        timestamp data_emissao
        date data_competencia
        timestamp data_envio_email
        decimal valor_servicos
        decimal valor_deducoes
        decimal desconto_incondicionado
        decimal desconto_condicionado
        decimal base_calculo
        decimal aliquota_iss
        decimal valor_iss
        decimal valor_cofins
        decimal valor_pis
        decimal valor_ir
        decimal valor_csll
        decimal valor_inss
        decimal valor_liquido
        decimal valor_total
        text descricao_servicos
        jsonb itens_servico
        varchar codigo_servico
        varchar codigo_tributacao_municipio
        varchar regime_tributacao
        boolean optante_simples_nacional
        text xml_url
        text pdf_url
        enum status
        boolean cancelada
        timestamp data_cancelamento
        text motivo_cancelamento
        text observacoes
        timestamp created_at
        timestamp updated_at
        uuid created_by FK
        timestamp deleted_at
    }
    
    %% ===================================
    %% TABELAS DE SISTEMA
    %% ===================================
    
    USERS ||--o{ AUDIT_LOG : gera
    USERS ||--o{ NOTIFICACOES : recebe
    
    AUDIT_LOG {
        uuid id PK
        varchar tabela
        uuid registro_id
        varchar acao "INSERT, UPDATE, DELETE"
        uuid usuario_id FK
        varchar usuario_nome
        varchar usuario_email
        varchar empresa_id FK
        jsonb dados_antigos
        jsonb dados_novos
        array campos_alterados
        inet ip_address
        text user_agent
        timestamp created_at
    }
    
    NOTIFICACOES {
        uuid id PK
        uuid usuario_id FK
        varchar titulo
        text mensagem
        varchar tipo "info, warning, error, success"
        varchar categoria "financeiro, rh, estoque, operacional"
        varchar entidade_tipo
        uuid entidade_id
        text link_acao
        varchar botao_acao
        boolean lida
        timestamp data_leitura
        boolean arquivada
        timestamp created_at
        timestamp deleted_at
    }
```

---

## 🔗 Relacionamentos Principais

### 1. Multi-Tenancy (RN-001)
```
EMPRESAS (1) ----< (N) TODAS_AS_TABELAS
  └─ empresa_id garante isolamento de dados
```

### 2. Contratos e Parcelas (RN-003)
```
CONTRATOS (1) ----< (N) PARCELAS
  └─ Parcelamento flexível com datas personalizadas
```

### 3. Rateio (RN-002)
```
DESPESAS (1) ----< (N) EMPRESAS (via JSONB rateio_empresas)
COLABORADORES (1) ----< (N) EMPRESAS (via JSONB rateio_empresas)
```

### 4. Ponto e Banco de Horas (RN-004)
```
COLABORADORES (1) ----< (N) REGISTROS_PONTO
  └─ Cálculo automático de horas e banco de horas
```

### 5. Estoque e Bloqueio (RN-006)
```
MATERIAIS (1) ----< (N) ITENS_ORDEM_SERVICO
  └─ estoque_bloqueado impede uso em outras OS
MATERIAIS (1) ----< (N) HISTORICO_MATERIAIS
  └─ Log completo de movimentações
```

### 6. Ordens de Serviço Complexas
```
ORDENS_SERVICO:
  ├─> CONTRATOS (opcional)
  ├─> CLIENTES (obrigatório)
  ├─> VEICULOS (opcional)
  ├─> COLABORADORES (motorista)
  └─> ITENS_ORDEM_SERVICO
        └─> MATERIAIS
```

### 7. Notas Fiscais
```
NOTAS_FISCAIS:
  ├─> EMPRESAS (emitente)
  ├─> CLIENTES (tomador)
  ├─> CONTRATOS (opcional)
  └─> ORDENS_SERVICO (opcional)
```

---

## 📐 Cardinalidades

| Relacionamento | Tipo | Descrição |
|---|---|---|
| EMPRESAS → USERS | 1:N | Uma empresa tem vários usuários |
| EMPRESAS → CLIENTES | 1:N | Uma empresa tem vários clientes |
| CLIENTES → CONTRATOS | 1:N | Um cliente pode ter vários contratos |
| CONTRATOS → PARCELAS | 1:N | Um contrato tem N parcelas |
| COLABORADORES → PONTO | 1:N | Um colaborador tem N registros de ponto |
| MATERIAIS → HISTORICO | 1:N | Um material tem N movimentações |
| OS → ITENS_OS | 1:N | Uma OS tem N itens |
| MATERIAIS → ITENS_OS | 1:N | Um material pode estar em N OSs |

---

## 🎨 Legenda de Campos

### Tipos de Dados
- `uuid` - Identificador único universal
- `varchar(n)` - Texto variável com limite
- `text` - Texto sem limite
- `decimal(p,s)` - Número decimal com precisão
- `int` - Número inteiro
- `date` - Data (YYYY-MM-DD)
- `time` - Horário (HH:MM:SS)
- `timestamp` - Data e hora completa
- `boolean` - Verdadeiro/Falso
- `jsonb` - JSON binário (flexível)
- `array` - Array/Lista de valores
- `enum` - Tipo enumerado
- `inet` - Endereço IP
- `geography` - Coordenadas geográficas (PostGIS)

### Constraints
- `PK` - Primary Key (Chave Primária)
- `FK` - Foreign Key (Chave Estrangeira)
- `UK` - Unique Key (Valor único)
- `GENERATED` - Campo calculado automaticamente

### Campos Padrão
- `empresa_id` - Multi-tenancy (RN-001)
- `created_at` - Data de criação
- `updated_at` - Data de atualização
- `created_by` - Usuário que criou
- `deleted_at` - Soft delete (RN-005)

---

## 📊 Estatísticas do Schema

| Métrica | Quantidade |
|---|---|
| **Tabelas Principais** | 21 |
| **Tabelas de Sistema** | 2 |
| **Views** | 4+ |
| **ENUMs** | 20+ |
| **Índices** | 50+ |
| **Triggers** | 15+ |
| **Functions** | 5+ |
| **RLS Policies** | 30+ |

---

## 🔍 Queries de Exemplo

### Buscar todos os contratos ativos de uma empresa
```sql
SELECT c.*, cl.nome_razao_social AS cliente
FROM contratos c
JOIN clientes cl ON cl.id = c.cliente_id
WHERE c.empresa_id = '2s-locacoes'
  AND c.status = 'ativo'
  AND c.deleted_at IS NULL
ORDER BY c.created_at DESC;
```

### Calcular saldo de contrato
```sql
SELECT 
  c.numero_contrato,
  c.valor_final,
  COALESCE(SUM(p.valor) FILTER (WHERE p.status = 'pago'), 0) AS pago,
  COALESCE(SUM(p.valor) FILTER (WHERE p.status = 'pendente'), 0) AS pendente
FROM contratos c
LEFT JOIN parcelas p ON p.contrato_id = c.id
WHERE c.id = '[UUID_CONTRATO]'
GROUP BY c.id;
```

### Banco de horas de colaborador
```sql
SELECT 
  c.nome,
  COALESCE(SUM(rp.banco_horas), 0) AS banco_horas_total
FROM colaboradores c
LEFT JOIN registros_ponto rp ON rp.colaborador_id = c.id
WHERE c.id = '[UUID_COLABORADOR]'
GROUP BY c.id;
```

### Estoque disponível de materiais
```sql
SELECT 
  codigo,
  nome,
  estoque_atual,
  estoque_bloqueado,
  estoque_disponivel,
  estoque_minimo,
  CASE 
    WHEN estoque_disponivel < estoque_minimo THEN 'CRÍTICO'
    WHEN estoque_disponivel < (estoque_minimo * 1.5) THEN 'BAIXO'
    ELSE 'OK'
  END AS alerta
FROM materiais
WHERE empresa_id = '2s-locacoes'
  AND status = 'ativo'
  AND deleted_at IS NULL
ORDER BY estoque_disponivel ASC;
```

---

## 🎯 Próximos Passos

1. ✅ Schema criado e documentado
2. ⏳ Aplicar em ambiente de desenvolvimento
3. ⏳ Criar dados seed para testes
4. ⏳ Implementar integração com frontend
5. ⏳ Criar views adicionais para relatórios
6. ⏳ Otimizar queries críticas
7. ⏳ Configurar backup automático
8. ⏳ Implementar auditoria avançada

---

**Última atualização:** Novembro 2025  
**Mantido por:** Equipe de Desenvolvimento Grupo 2S
