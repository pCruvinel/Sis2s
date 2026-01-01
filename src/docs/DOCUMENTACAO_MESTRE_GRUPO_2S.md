# 📋 DOCUMENTAÇÃO MESTRE - PROJETO GRUPO 2S (REBOOT)

## Sistema ERP Integrado de Gestão Empresarial

---

## Informações Gerais do Projeto

| Campo | Valor |
|-------|-------|
| **Nome do Projeto** | Sistema de Gestão Integrado Grupo 2S |
| **Cliente** | Grupo 2S (Lucas Khristophy - PO, Roberto - Fundador) |
| **Data de Criação** | 01/01/2026 |
| **Versão do Documento** | 3.0 (Reboot) |
| **Stack de Desenvolvimento** | React + Vite + Supabase + Tailwind CSS + shadcn/ui |

---

## Histórico de Atualizações

| Versão | Descrição | Data | Responsável |
|--------|-----------|------|-------------|
| 3.0 | Reboot completo - Migração para React+Vite+Supabase | 01/01/2026 | Dizevolv |
| 2.0 | Consolidação final (desenvolvimento anterior) | 15/11/2025 | Dizevolv |
| 1.0 | Criação inicial da documentação | 22/08/2025 | Dizevolv |

---

# PARTE 1: VISÃO DO NEGÓCIO

## 1. Resumo do Negócio do Cliente

### 1.1 Sobre o Grupo 2S

- **Nome do Negócio:** Grupo 2S
- **O que a empresa faz:** O Grupo 2S é um conglomerado empresarial que opera em três vertentes distintas de negócio, oferecendo soluções completas para eventos corporativos e gestão de patrimônio.

### 1.2 Empresas do Grupo

| Empresa | Core Business | Público-Alvo |
|---------|---------------|--------------|
| **Grupo 2S (Holding)** | Gestão consolidada e administrativa | Gestores e diretoria |
| **2S Locações** | Aluguel de equipamentos e estruturas para eventos (som, palcos, iluminação, tendas) | Empresas de eventos, casas de shows, corporações |
| **2S Marketing** | Gestão de patrimônio institucional (notebooks, computadores, impressoras, materiais promocionais) | Empresas que terceirizam gestão de ativos |
| **2S Produções e Eventos** | Organização de eventos com bebidas e alimentos perecíveis | Clientes corporativos e particulares |

### 1.3 Principais Produtos/Serviços

- Locação de equipamentos de som e iluminação
- Montagem e desmontagem de estruturas para eventos
- Gestão e manutenção de patrimônio corporativo
- Produção e organização de eventos completos
- Logística e transporte de equipamentos
- Serviços de buffet e catering (via 2S Produções)

### 1.4 Diferenciais Competitivos

- Operação verticalizada (estrutura + equipamentos + produção)
- Rateio transparente de custos entre empresas do grupo
- Controle unificado com visibilidade por empresa
- Flexibilidade de parcelamento para contratos de locação

**Fonte das Informações:** Transcrições de reuniões (10/11/2025, 02/10/2025, 10/09/2025, 15/08/2025), Documentação técnica anterior, Briefings por e-mail

---

## 2. Documento de Situação-Problema

### 2.1 Cenário Atual

A empresa opera com processos fragmentados e manuais:

| Área | Problema Atual |
|------|----------------|
| **Contratos** | Gestão via e-mails e planilhas Excel sem padronização |
| **Financeiro** | Controle descentralizado por empresa, sem visão consolidada |
| **Estoque** | Controle manual sem rastreamento em tempo real |
| **RH** | Folha de pagamento e ponto em planilhas separadas |
| **Rateio** | Cálculo manual de custos compartilhados entre empresas |
| **Relatórios** | Geração manual e demorada, dados desatualizados |

### 2.2 Problema Principal

A operação descentralizada causa impactos significativos:

| Impacto | Descrição | Quantificação |
|---------|-----------|---------------|
| **Ineficiência Operacional** | Processos repetitivos e manuais consomem tempo excessivo | +60% tempo operacional |
| **Falta de Rastreabilidade** | Impossibilidade de saber localização/status de equipamentos | Perda de controle de ativos |
| **Inconsistência de Dados** | Informações desatualizadas entre departamentos | Decisões baseadas em dados errados |
| **Rateio Complexo** | Dificuldade em distribuir custos corretamente | Margens incorretas por empresa |
| **Ausência de Visibilidade** | Falta de relatórios consolidados para gestão | Decisões sem embasamento |

### 2.3 Justificativa e Impacto

**Por que resolver agora?**

- **Impacto Financeiro:** Perda de controle sobre custos, margens e inadimplência
- **Impacto Operacional:** Atrasos em eventos e dificuldade de atender demandas simultaneamente
- **Impacto Estratégico:** Impossibilidade de escalar operações com processos manuais
- **Risco de Compliance:** Dificuldade em manter conformidade fiscal e trabalhista

### 2.4 Objetivos do Projeto (SMART)

| Critério | Objetivo |
|----------|----------|
| **Específico** | Implementar sistema integrado de gestão para as 3 empresas do Grupo 2S |
| **Mensurável** | Reduzir 70% tempo de relatórios; automatizar 80% dos processos manuais |
| **Atingível** | Desenvolvimento em React+Vite com Supabase pela equipe Dizevolv |
| **Relevante** | Centralizar operações em única plataforma com rateio automático |
| **Prazo** | MVP em 16 semanas (4 meses) |

### 2.5 Escopo Proposto

#### ✅ DENTRO DO ESCOPO (MVP)

| Módulo | Funcionalidades |
|--------|-----------------|
| **Autenticação** | Login JWT, recuperação de senha, gestão de perfis (5 tipos) |
| **Administrativo** | Gestão de empresas, usuários, painel consolidado Grupo 2S |
| **Financeiro** | Contratos (cliente/fornecedor), parcelas, despesas, dashboard financeiro |
| **RH** | Colaboradores, cargos, ponto eletrônico, folha de pagamento |
| **Estoque** | Materiais por vertente, controle de bloqueio, histórico de movimentações |
| **Operacional** | Ordens de serviço, veículos, itens vinculados |
| **Relatórios** | Exportação Excel/PDF, relatórios financeiros e operacionais |

#### ❌ FORA DO ESCOPO (Pós-MVP)

- Portal para clientes finais (self-service)
- Integração direta com bancos para pagamentos automáticos
- Módulo de gestão de tarefas (Trello-like)
- App mobile nativo (React Native)
- Integração com ERPs de terceiros
- Assinatura digital de contratos
- Emissão automatizada de NF-e (será manual inicialmente)

---

# PARTE 2: REGRAS DE NEGÓCIO

## 3. Regras de Negócio Detalhadas

### RN-001: Segregação por Empresa (Multi-Tenancy)

| Atributo | Descrição |
|----------|-----------|
| **Nome** | Controle de Acesso por Empresa |
| **Descrição** | Usuários só podem visualizar e manipular dados da empresa à qual estão vinculados |
| **Implementação** | Row Level Security (RLS) no Supabase com filtro por `empresa_id` |
| **Exceção** | Usuários com perfil `admin_grupo` têm acesso a todas as empresas |
| **Impacto** | Todas as tabelas principais devem ter coluna `empresa_id` |

**Código SQL:**

```sql
CREATE POLICY "empresa_segregation" ON [tabela]
FOR ALL USING (
  empresa_id IN (
    SELECT empresa_id FROM users WHERE id = auth.uid()
    UNION
    SELECT unnest(empresas_ids) FROM users WHERE id = auth.uid()
  )
  AND deleted_at IS NULL
);
```

---

### RN-002: Rateio Automático de Custos

| Atributo | Descrição |
|----------|-----------|
| **Nome** | Rateio Automático entre Empresas |
| **Descrição** | Colaboradores e despesas que atuam/impactam múltiplas empresas têm custos rateados automaticamente |
| **Implementação** | Campo JSONB `rateio_empresas` com array de percentuais |
| **Validação** | Soma dos percentuais deve ser exatamente 100% |
| **Visualização** | Relatórios mostram valores calculados por empresa |

**Estrutura do Rateio:**

```json
{
  "rateio_empresas": [
    { "empresa_id": "2s-locacoes", "percentual": 50, "valor": 2500.00 },
    { "empresa_id": "2s-marketing", "percentual": 30, "valor": 1500.00 },
    { "empresa_id": "2s-producoes", "percentual": 20, "valor": 1000.00 }
  ]
}
```

---

### RN-003: Parcelamento Flexível de Contratos

| Atributo | Descrição |
|----------|-----------|
| **Nome** | Sistema de Parcelamento Flexível |
| **Descrição** | Contratos podem ter parcelamento automático (mensal) ou personalizado (datas manuais) |
| **Tipos** | `mensal` (automático) ou `personalizado` (manual) |
| **Automático** | Sistema calcula parcelas iguais com vencimentos mensais |
| **Personalizado** | Usuário define valor e data de cada parcela individualmente |

**Comportamento:**

1. **Tipo Mensal:** Usuário informa valor total, número de parcelas e data da primeira. Sistema gera as demais.
2. **Tipo Personalizado:** Usuário cadastra cada parcela com valor e vencimento específico.

---

### RN-004: Controle de Ponto Centralizado

| Atributo | Descrição |
|----------|-----------|
| **Nome** | Sistema Centralizado de Ponto |
| **Descrição** | Apenas gestores de RH podem cadastrar e editar registros de ponto |
| **Registros** | 4 marcações por dia: entrada, saída almoço, retorno almoço, saída |
| **Cálculo Automático** | `horas_trabalhadas`, `horas_extras`, `banco_horas` |
| **GPS** | Opcional - registra coordenadas no momento da marcação |

**Fórmula de Cálculo:**

```
horas_trabalhadas = (saida_almoco - entrada_manha) + (saida_noite - entrada_tarde)
horas_extras = MAX(0, horas_trabalhadas - horas_contratadas)
banco_horas = horas_trabalhadas - horas_contratadas
```

---

### RN-005: Exclusão Lógica (Soft Delete)

| Atributo | Descrição |
|----------|-----------|
| **Nome** | Exclusão Lógica de Dados |
| **Descrição** | Nenhum dado é fisicamente excluído do banco, apenas marcado como inativo |
| **Implementação** | Campo `deleted_at` em tabelas principais |
| **Filtro** | Todas as queries devem incluir `WHERE deleted_at IS NULL` |
| **Recuperação** | Dados podem ser restaurados setando `deleted_at = NULL` |

**Tabelas com Soft Delete:**

- `colaboradores`
- `contratos`
- `materiais`
- `clientes`
- `fornecedores`
- `ordens_servico`

---

### RN-006: Bloqueio de Estoque

| Atributo | Descrição |
|----------|-----------|
| **Nome** | Bloqueio de Materiais em Uso |
| **Descrição** | Materiais vinculados a uma OS ficam bloqueados até conclusão/cancelamento |
| **Campos** | `estoque_bloqueado`, `motivo_bloqueio`, `bloqueado_por`, `bloqueado_em` |
| **Cálculo** | `estoque_disponivel = estoque_atual - estoque_bloqueado` |
| **Liberação** | Automática quando OS é concluída ou cancelada |

---

### RN-007: Separação de Bônus e Descontos na Folha

| Atributo | Descrição |
|----------|-----------|
| **Nome** | Estrutura Separada de Adicionais e Descontos |
| **Descrição** | Folha de pagamento separa claramente valores positivos e negativos |
| **Adicionais** | Vale transporte, vale alimentação, bônus, comissão, horas extras |
| **Descontos** | INSS, IRPF, plano de saúde, adiantamentos, pensão, empréstimos |
| **Fórmula** | `salario_liquido = salario_base + total_adicionais - total_descontos` |

---

# PARTE 3: REQUISITOS DO SISTEMA

## 4. Requisitos Funcionais (RF)

### Módulo de Autenticação

| Cód | Requisito | Descrição |
|-----|-----------|-----------|
| RF-001 | Login com Email/Senha | O sistema deve permitir autenticação via email e senha com JWT |
| RF-002 | Recuperação de Senha | O sistema deve enviar código de recuperação por email |
| RF-003 | Gestão de Sessão | O sistema deve manter sessão com timeout configurável |
| RF-004 | Logout Seguro | O sistema deve invalidar token e limpar sessão local |

### Módulo Administrativo

| Cód | Requisito | Descrição |
|-----|-----------|-----------|
| RF-005 | CRUD de Empresas | O sistema deve permitir cadastrar, editar e visualizar empresas do grupo |
| RF-006 | Gestão de Usuários | O sistema deve permitir criar usuários com diferentes perfis de acesso |
| RF-007 | Reset de Senha | O sistema deve permitir que admin resete senha de usuários |
| RF-008 | Painel Consolidado | O sistema deve exibir dashboard consolidado para admin_grupo com KPIs de todas empresas |
| RF-009 | Tema Dinâmico | O sistema deve aplicar cores corporativas conforme empresa selecionada |

### Módulo Financeiro

| Cód | Requisito | Descrição |
|-----|-----------|-----------|
| RF-010 | CRUD de Clientes | O sistema deve permitir cadastrar clientes PF/PJ com dados completos |
| RF-011 | CRUD de Fornecedores | O sistema deve permitir cadastrar fornecedores com categorização |
| RF-012 | Cadastro de Contratos | O sistema deve permitir criar contratos tipo Cliente (a receber) ou Fornecedor (a pagar) |
| RF-013 | Geração de Parcelas | O sistema deve gerar parcelas automáticas (mensal) ou permitir cadastro personalizado (RN-003) |
| RF-014 | Registro de Pagamentos | O sistema deve registrar pagamentos de parcelas com comprovante |
| RF-015 | Gestão de Despesas | O sistema deve categorizar despesas como Fixa, Variável ou Folha de Pagamento |
| RF-016 | Rateio de Despesas | O sistema deve permitir rateio de despesas entre empresas (RN-002) |
| RF-017 | Dashboard Financeiro | O sistema deve exibir cards de Total a Receber, Total a Pagar, Inadimplência |
| RF-018 | Alertas de Vencimento | O sistema deve alertar sobre parcelas a vencer nos próximos 7 dias |

### Módulo de RH

| Cód | Requisito | Descrição |
|-----|-----------|-----------|
| RF-019 | CRUD de Cargos | O sistema deve permitir cadastrar cargos com faixa salarial |
| RF-020 | Cadastro de Colaboradores | O sistema deve permitir cadastrar colaboradores PJ/CLT com rateio (RN-002) |
| RF-021 | Registro de Ponto | O sistema deve permitir que RH registre ponto dos colaboradores (RN-004) |
| RF-022 | Cálculo de Horas | O sistema deve calcular automaticamente horas trabalhadas, extras e banco |
| RF-023 | Justificativas de Ausência | O sistema deve permitir registrar justificativas (atestado, férias, falta) |
| RF-024 | Folha de Pagamento | O sistema deve gerar folha mensal com bônus e descontos separados (RN-007) |
| RF-025 | Geração de Holerite | O sistema deve gerar PDF de holerite individual |
| RF-026 | Histórico de Pagamentos | O sistema deve manter histórico de todos pagamentos realizados |

### Módulo de Estoque

| Cód | Requisito | Descrição |
|-----|-----------|-----------|
| RF-027 | CRUD de Categorias | O sistema deve permitir categorizar materiais |
| RF-028 | Cadastro de Materiais | O sistema deve permitir cadastrar materiais com estoque mínimo/máximo |
| RF-029 | Controle de Estoque | O sistema deve atualizar estoque em tempo real com movimentações |
| RF-030 | Bloqueio de Material | O sistema deve bloquear material vinculado a OS (RN-006) |
| RF-031 | Histórico de Movimentações | O sistema deve registrar todas entradas/saídas com motivo e usuário |
| RF-032 | Alertas de Estoque Baixo | O sistema deve alertar quando estoque atingir nível mínimo |

### Módulo Operacional

| Cód | Requisito | Descrição |
|-----|-----------|-----------|
| RF-033 | CRUD de Veículos | O sistema deve permitir cadastrar veículos da frota |
| RF-034 | Criar Ordem de Serviço | O sistema deve permitir criar OS vinculando cliente, materiais, veículo e responsável |
| RF-035 | Gerenciar Itens da OS | O sistema deve permitir adicionar/remover materiais com quantidade |
| RF-036 | Fluxo de Status da OS | O sistema deve controlar status: Criada → Aprovada → Em Andamento → Concluída |
| RF-037 | Assinatura de Entrega/Retirada | O sistema deve permitir upload de assinatura digital |

---

## 5. Requisitos Não Funcionais (RNF)

| Cód | Categoria | Descrição | Métrica |
|-----|-----------|-----------|---------|
| RNF-001 | Performance | Telas devem carregar rapidamente | < 3 segundos com 100 usuários |
| RNF-002 | Disponibilidade | Sistema deve estar disponível em horário comercial | 99% uptime (8h-18h) |
| RNF-003 | Segurança | Segregação rigorosa de dados por empresa | RLS em todas as tabelas |
| RNF-004 | Usabilidade | Interface responsiva e intuitiva | Mobile-first, Desktop-optimized |
| RNF-005 | Escalabilidade | Suportar crescimento da operação | Até 500 usuários e 10.000+ contratos |
| RNF-006 | Backup | Proteção contra perda de dados | Backup automático diário |
| RNF-007 | Auditoria | Rastreabilidade de operações | Log completo de alterações |
| RNF-008 | Compatibilidade | Funcionar em navegadores modernos | Chrome, Firefox, Safari, Edge |

---

# PARTE 4: USER STORIES

## 6. User Stories e Critérios de Aceitação

### US-001: Autenticação Segura

**Como um** usuário do sistema,  
**Eu quero** fazer login com email e senha,  
**Para que** eu possa acessar as funcionalidades do sistema de forma segura.

#### Critérios de Aceitação:

**Cenário 1: Login bem-sucedido**
- **Dado** que estou na tela de login
- **Quando** informo email e senha válidos
- **Então** sou redirecionado para o dashboard da minha empresa

**Cenário 2: Credenciais inválidas**
- **Dado** que estou na tela de login
- **Quando** informo email ou senha incorretos
- **Então** vejo mensagem de erro "Email ou senha inválidos"

**Cenário 3: Recuperação de senha**
- **Dado** que esqueci minha senha
- **Quando** clico em "Esqueci minha senha" e informo meu email
- **Então** recebo um código de recuperação por email

---

### US-002: Parcelamento de Contratos (RN-003)

**Como um** usuário financeiro,  
**Eu quero** escolher entre parcelamento Mensal ou Personalizado,  
**Para que** eu adapte as datas de vencimento às estruturas dos contratos de locação.

#### Critérios de Aceitação:

**Cenário 1: Parcelamento Mensal (Automático)**
- **Dado** que estou criando um contrato de R$ 10.000,00
- **Quando** seleciono tipo "Mensal", 3 parcelas, primeira em 05/01/2026
- **Então** o sistema gera: 3x R$ 3.333,33 com vencimentos em 05/01, 05/02, 05/03

**Cenário 2: Parcelamento Personalizado (Manual)**
- **Dado** que estou criando um contrato de R$ 10.000,00
- **Quando** seleciono tipo "Personalizado"
- **Então** posso definir cada parcela individualmente (ex: R$ 5.000 em 10/01, R$ 3.000 em 25/01, R$ 2.000 em 15/02)

**Cenário 3: Validação de soma**
- **Dado** que estou no modo Personalizado
- **Quando** a soma das parcelas difere do valor total do contrato
- **Então** vejo alerta "Soma das parcelas deve ser igual ao valor do contrato"

---

### US-003: Controle de Ponto com Banco de Horas (RN-004)

**Como um** gestor de RH,  
**Eu quero** cadastrar registros de ponto com cálculo automático de banco de horas,  
**Para que** eu tenha controle preciso da frequência dos colaboradores.

#### Critérios de Aceitação:

**Cenário 1: Dia normal (sem hora extra)**
- **Dado** que registro: Entrada 08:00, Almoço 12:00-13:00, Saída 17:00, Contratado 8h
- **Quando** o sistema calcula
- **Então** exibe: Trabalhado = 8h, Extras = 0h, Banco = 0h

**Cenário 2: Dia com hora extra**
- **Dado** que registro: Entrada 08:00, Almoço 12:00-13:00, Saída 20:00, Contratado 8h
- **Quando** o sistema calcula
- **Então** exibe: Trabalhado = 11h, Extras = 3h, Banco = +3h

**Cenário 3: Final de semana (sem carga contratada)**
- **Dado** que registro: Entrada 08:00, Saída 16:00, Contratado = 0h (domingo)
- **Quando** o sistema calcula
- **Então** exibe: Trabalhado = 8h, Banco = +8h (tudo vai para banco)

---

### US-004: Rateio de Despesas (RN-002)

**Como um** usuário financeiro,  
**Eu quero** ratear despesas entre as empresas do grupo,  
**Para que** cada vertente assuma sua parcela proporcional dos custos.

#### Critérios de Aceitação:

**Cenário 1: Rateio percentual**
- **Dado** que cadastro despesa de R$ 1.000,00 de combustível
- **Quando** defino rateio: 2S Locações 50%, 2S Marketing 30%, 2S Produções 20%
- **Então** o sistema calcula: R$ 500 + R$ 300 + R$ 200

**Cenário 2: Validação de 100%**
- **Dado** que estou definindo rateio
- **Quando** a soma dos percentuais não é 100%
- **Então** vejo erro "A soma dos percentuais deve ser exatamente 100%"

**Cenário 3: Visualização em relatório**
- **Dado** que existem despesas rateadas
- **Quando** acesso o relatório de despesas da 2S Locações
- **Então** vejo apenas a parcela de 50% (R$ 500) desta empresa

---

### US-005: Bloqueio de Estoque em OS (RN-006)

**Como um** usuário operacional,  
**Eu quero** que materiais vinculados a uma OS fiquem bloqueados,  
**Para que** não sejam alocados em outra ordem simultaneamente.

#### Critérios de Aceitação:

**Cenário 1: Bloqueio automático ao criar OS**
- **Dado** que crio OS com 10 unidades do Material X (estoque atual = 50)
- **Quando** a OS é criada
- **Então** Material X: estoque_bloqueado = 10, estoque_disponivel = 40

**Cenário 2: Tentativa de uso em outra OS**
- **Dado** que Material X tem 40 disponíveis e 10 bloqueados
- **Quando** tento criar OS com 45 unidades
- **Então** vejo erro "Quantidade indisponível. Estoque disponível: 40"

**Cenário 3: Liberação ao concluir OS**
- **Dado** que OS está concluída
- **Quando** status muda para "Concluída"
- **Então** Material X: estoque_bloqueado = 0, estoque_disponivel = 50

---

### US-006: Folha de Pagamento com Separação de Valores (RN-007)

**Como um** gestor de RH,  
**Eu quero** gerar folha de pagamento com bônus e descontos separados,  
**Para que** tenha clareza nos cálculos salariais e holerites.

#### Critérios de Aceitação:

**Cenário 1: Cálculo de salário líquido**
- **Dado** colaborador com Salário Base = R$ 3.000
- **Quando** adiciono VT R$ 200, VR R$ 400 (bônus) e INSS R$ 360, IRPF R$ 150 (descontos)
- **Então** sistema calcula: Líquido = 3000 + 600 - 510 = R$ 3.090

**Cenário 2: Visualização no holerite**
- **Dado** que gero holerite em PDF
- **Quando** abro o documento
- **Então** vejo seções separadas para "Proventos" e "Descontos"

---

### US-007: Dashboard Consolidado do Grupo

**Como um** admin_grupo,  
**Eu quero** visualizar KPIs consolidados de todas as empresas,  
**Para que** tenha visão executiva do desempenho do grupo.

#### Critérios de Aceitação:

**Cenário 1: Acesso consolidado**
- **Dado** que sou admin_grupo logado
- **Quando** acesso o Painel Grupo 2S
- **Então** vejo totais somados de todas as empresas

**Cenário 2: Filtro por empresa**
- **Dado** que estou no painel consolidado
- **Quando** seleciono filtro "2S Locações"
- **Então** vejo apenas dados da 2S Locações

**Cenário 3: Gráfico comparativo**
- **Dado** que estou no painel consolidado
- **Quando** visualizo gráfico de receitas
- **Então** vejo barras/linhas comparando as 3 empresas

---

# PARTE 5: ARQUITETURA TÉCNICA

## 7. Stack Tecnológica

### 7.1 Frontend

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| React | 18.x | Biblioteca de UI |
| Vite | 5.x | Build tool e dev server |
| TypeScript | 5.x | Tipagem estática |
| Tailwind CSS | 3.x | Framework de estilos |
| shadcn/ui | Latest | Componentes UI |
| React Hook Form | 7.x | Gerenciamento de formulários |
| Zod | 3.x | Validação de schemas |
| Recharts | 2.x | Gráficos e visualizações |
| Lucide React | Latest | Ícones |
| Sonner | 2.x | Notificações toast |

### 7.2 Backend (BaaS)

| Tecnologia | Propósito |
|------------|-----------|
| Supabase | Backend as a Service |
| PostgreSQL | Banco de dados relacional |
| Supabase Auth | Autenticação JWT |
| Row Level Security | Segurança de dados |
| Supabase Storage | Armazenamento de arquivos |
| Edge Functions | Lógica serverless (quando necessário) |

### 7.3 Bibliotecas Auxiliares

| Biblioteca | Propósito |
|------------|-----------|
| xlsx (SheetJS) | Exportação para Excel |
| jsPDF | Geração de PDFs |
| date-fns | Manipulação de datas |
| clsx + tailwind-merge | Classes condicionais |

---

## 8. Estrutura de Pastas do Projeto

```
/
├── src/
│   ├── app/                          # Rotas da aplicação
│   │   ├── (auth)/                   # Rotas públicas (login)
│   │   │   ├── login/
│   │   │   └── recuperar-senha/
│   │   └── (app)/                    # Rotas protegidas
│   │       ├── admin/
│   │       │   ├── empresas/
│   │       │   └── usuarios/
│   │       ├── financeiro/
│   │       │   ├── dashboard/
│   │       │   ├── clientes/
│   │       │   ├── fornecedores/
│   │       │   ├── contratos/
│   │       │   └── despesas/
│   │       ├── rh/
│   │       │   ├── dashboard/
│   │       │   ├── colaboradores/
│   │       │   ├── cargos/
│   │       │   ├── ponto/
│   │       │   ├── folha-pagamento/
│   │       │   └── pagamentos/
│   │       ├── estoque/
│   │       │   ├── categorias/
│   │       │   ├── materiais/
│   │       │   └── historico/
│   │       └── operacional/
│   │           ├── veiculos/
│   │           └── ordens-servico/
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── shared/                   # Componentes reutilizáveis
│   │   │   ├── DataTable.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── ExportButton.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Breadcrumbs.tsx
│   │   │   └── MobileMenu.tsx
│   │   └── modals/
│   │       ├── NovoContratoModal.tsx
│   │       ├── NovoPagamentoModal.tsx
│   │       ├── NovoVeiculoModal.tsx
│   │       └── RegistroPontoModal.tsx
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx           # Autenticação
│   │   ├── EmpresaContext.tsx        # Multi-tenancy
│   │   └── ThemeContext.tsx          # Tema dinâmico
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useEmpresa.ts
│   │   ├── useSupabase.ts
│   │   └── usePagination.ts
│   │
│   ├── lib/
│   │   ├── supabase.ts               # Cliente Supabase
│   │   ├── utils.ts                  # Funções utilitárias
│   │   ├── formatters.ts             # Formatação de dados
│   │   └── validators.ts             # Validações
│   │
│   ├── types/
│   │   ├── database.ts               # Tipos do Supabase
│   │   └── domain.ts                 # Tipos de domínio
│   │
│   └── styles/
│       └── globals.css               # Tailwind + temas
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── seed.sql
│
├── public/
│   └── logos/
│
└── docs/
    └── DOCUMENTACAO_MESTRE.md
```

---

## 9. Database Schema

### 9.1 Visão Geral das Tabelas

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SCHEMA ERP GRUPO 2S                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ADMIN          FINANCEIRO         RH              ESTOQUE/OPER     │
│  ─────          ──────────         ──              ────────────     │
│  empresas       clientes           cargos          categorias_mat   │
│  users          fornecedores       colaboradores   materiais        │
│                 contratos          registros_ponto historico_mat    │
│                 parcelas           pagamentos      veiculos         │
│                 despesas                           ordens_servico   │
│                                                    itens_os         │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 9.2 Tabelas Principais

#### empresas

```sql
CREATE TABLE empresas (
  id VARCHAR(50) PRIMARY KEY,  -- 'grupo-2s', '2s-locacoes', etc
  nome VARCHAR(100) NOT NULL,
  razao_social VARCHAR(200),
  cnpj VARCHAR(18) UNIQUE,
  email VARCHAR(255),
  telefone VARCHAR(20),
  endereco_completo JSONB,
  dados_bancarios JSONB,
  cor_primaria VARCHAR(7) DEFAULT '#1F4788',
  cor_secundaria VARCHAR(7) DEFAULT '#28A745',
  logo_url TEXT,
  status status_generico DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
```

#### users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  nome VARCHAR(150) NOT NULL,
  empresa_id VARCHAR(50) REFERENCES empresas(id),
  empresas_ids VARCHAR(50)[] DEFAULT '{}',  -- Array para multi-empresa
  perfil perfil_usuario NOT NULL,
  telefone VARCHAR(20),
  avatar_url TEXT,
  status status_generico DEFAULT 'ativo',
  ultimo_acesso TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  deleted_at TIMESTAMPTZ
);
```

#### contratos

```sql
CREATE TABLE contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id VARCHAR(50) REFERENCES empresas(id) NOT NULL,
  numero_contrato VARCHAR(50) UNIQUE NOT NULL,
  tipo tipo_contrato NOT NULL,  -- 'cliente', 'fornecedor'
  cliente_id UUID REFERENCES clientes(id),
  fornecedor_id UUID REFERENCES fornecedores(id),
  descricao TEXT,
  valor_total DECIMAL(12,2) NOT NULL,
  desconto DECIMAL(12,2) DEFAULT 0,
  acrescimo DECIMAL(12,2) DEFAULT 0,
  valor_final DECIMAL(12,2) GENERATED ALWAYS AS (valor_total - desconto + acrescimo) STORED,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  tipo_parcelamento tipo_parcelamento NOT NULL,  -- 'mensal', 'personalizado'
  numero_parcelas INTEGER DEFAULT 1,
  dia_vencimento INTEGER,
  arquivo_pdf_url TEXT,
  status status_contrato DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  deleted_at TIMESTAMPTZ
);
```

#### parcelas

```sql
CREATE TABLE parcelas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID REFERENCES contratos(id) NOT NULL,
  numero_parcela INTEGER NOT NULL,
  valor DECIMAL(12,2) NOT NULL,
  valor_pago DECIMAL(12,2) DEFAULT 0,
  multa DECIMAL(12,2) DEFAULT 0,
  juros DECIMAL(12,2) DEFAULT 0,
  desconto DECIMAL(12,2) DEFAULT 0,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  forma_pagamento forma_pagamento_enum,
  comprovante_url TEXT,
  status status_parcela DEFAULT 'pendente',
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  pago_por UUID REFERENCES users(id),
  deleted_at TIMESTAMPTZ
);
```

#### colaboradores

```sql
CREATE TABLE colaboradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id VARCHAR(50) REFERENCES empresas(id) NOT NULL,
  nome VARCHAR(150) NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  rg VARCHAR(20),
  data_nascimento DATE NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(20),
  endereco_completo JSONB,
  tipo_contrato tipo_contrato_trabalho NOT NULL,  -- 'clt', 'pj', 'estagiario'
  cargo_id UUID REFERENCES cargos(id),
  departamento VARCHAR(100),
  salario_base DECIMAL(10,2) NOT NULL,
  vale_transporte DECIMAL(10,2) DEFAULT 0,
  vale_alimentacao DECIMAL(10,2) DEFAULT 0,
  plano_saude DECIMAL(10,2) DEFAULT 0,
  data_admissao DATE NOT NULL,
  data_demissao DATE,
  rateio_empresas JSONB,  -- RN-002
  horas_contratadas_dia DECIMAL(4,2) DEFAULT 8,
  foto_url TEXT,
  status status_colaborador DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  deleted_at TIMESTAMPTZ
);
```

#### registros_ponto

```sql
CREATE TABLE registros_ponto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID REFERENCES colaboradores(id) NOT NULL,
  empresa_id VARCHAR(50) REFERENCES empresas(id) NOT NULL,
  data DATE NOT NULL,
  entrada_manha TIME,
  saida_almoco TIME,
  entrada_tarde TIME,
  saida_noite TIME,
  horas_contratadas DECIMAL(4,2) DEFAULT 8,
  horas_trabalhadas DECIMAL(4,2),  -- Calculado por trigger
  horas_extras DECIMAL(4,2),       -- Calculado por trigger
  banco_horas DECIMAL(4,2),        -- Calculado por trigger
  status status_ponto DEFAULT 'normal',
  justificativa TEXT,
  tipo_justificativa tipo_justificativa,
  localizacao_entrada GEOGRAPHY(POINT),  -- GPS
  localizacao_saida GEOGRAPHY(POINT),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  deleted_at TIMESTAMPTZ,
  UNIQUE(colaborador_id, data)
);
```

#### materiais

```sql
CREATE TABLE materiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id VARCHAR(50) REFERENCES empresas(id) NOT NULL,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  categoria_id UUID REFERENCES categorias_material(id),
  unidade_medida VARCHAR(20) DEFAULT 'UN',
  estoque_atual DECIMAL(10,2) DEFAULT 0,
  estoque_bloqueado DECIMAL(10,2) DEFAULT 0,
  estoque_disponivel DECIMAL(10,2) GENERATED ALWAYS AS (estoque_atual - estoque_bloqueado) STORED,
  estoque_minimo DECIMAL(10,2) DEFAULT 0,
  estoque_maximo DECIMAL(10,2),
  valor_unitario DECIMAL(10,2),
  localizacao VARCHAR(100),
  imagem_url TEXT,
  status status_material DEFAULT 'ativo',
  motivo_bloqueio TEXT,
  bloqueado_por UUID REFERENCES users(id),
  bloqueado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  deleted_at TIMESTAMPTZ
);
```

#### ordens_servico

```sql
CREATE TABLE ordens_servico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id VARCHAR(50) REFERENCES empresas(id) NOT NULL,
  numero_os VARCHAR(50) UNIQUE NOT NULL,
  contrato_id UUID REFERENCES contratos(id),
  cliente_id UUID REFERENCES clientes(id) NOT NULL,
  descricao_evento TEXT NOT NULL,
  local_evento TEXT,
  data_montagem TIMESTAMPTZ,
  data_desmontagem TIMESTAMPTZ,
  veiculo_id UUID REFERENCES veiculos(id),
  motorista_id UUID REFERENCES colaboradores(id),
  responsavel_evento VARCHAR(150),
  valor_total DECIMAL(12,2),
  status status_ordem_servico DEFAULT 'criada',
  observacoes TEXT,
  assinatura_entrega_url TEXT,
  assinatura_retirada_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  deleted_at TIMESTAMPTZ
);
```

### 9.3 ENUMs Principais

```sql
CREATE TYPE perfil_usuario AS ENUM (
  'admin_grupo', 'admin', 'gestor', 'financeiro', 'rh', 'operacional', 'cliente'
);

CREATE TYPE status_generico AS ENUM ('ativo', 'inativo', 'bloqueado', 'arquivado');

CREATE TYPE status_contrato AS ENUM ('ativo', 'concluido', 'cancelado', 'suspenso', 'em_negociacao');

CREATE TYPE status_parcela AS ENUM ('pendente', 'pago', 'pago_parcial', 'atrasado', 'cancelado', 'renegociado');

CREATE TYPE tipo_parcelamento AS ENUM ('mensal', 'personalizado', 'avista');

CREATE TYPE tipo_contrato AS ENUM ('cliente', 'fornecedor', 'parceria');

CREATE TYPE tipo_contrato_trabalho AS ENUM ('clt', 'pj', 'estagiario', 'temporario', 'terceirizado');

CREATE TYPE status_colaborador AS ENUM ('ativo', 'afastado', 'ferias', 'licenca', 'demitido');

CREATE TYPE status_ponto AS ENUM ('normal', 'falta', 'falta_justificada', 'atraso', 'hora_extra', 'meio_periodo', 'home_office');

CREATE TYPE status_material AS ENUM ('ativo', 'inativo', 'manutencao', 'bloqueado', 'danificado', 'extraviado', 'descartado');

CREATE TYPE status_ordem_servico AS ENUM ('criada', 'aprovada', 'em_andamento', 'em_montagem', 'montada', 'em_desmontagem', 'concluida', 'cancelada', 'reagendada');

CREATE TYPE forma_pagamento_enum AS ENUM ('dinheiro', 'pix', 'transferencia', 'ted', 'doc', 'boleto', 'cartao_credito', 'cartao_debito', 'cheque', 'deposito', 'outros');
```

### 9.4 Triggers Críticos

```sql
-- Trigger para calcular horas do ponto (RN-004)
CREATE OR REPLACE FUNCTION calcular_horas_ponto()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular horas trabalhadas
  IF NEW.entrada_manha IS NOT NULL AND NEW.saida_noite IS NOT NULL THEN
    NEW.horas_trabalhadas := EXTRACT(EPOCH FROM (
      COALESCE(NEW.saida_almoco, NEW.saida_noite) - NEW.entrada_manha +
      COALESCE(NEW.saida_noite - NEW.entrada_tarde, INTERVAL '0')
    )) / 3600;
  END IF;
  
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

CREATE TRIGGER calcular_horas
  BEFORE INSERT OR UPDATE ON registros_ponto
  FOR EACH ROW EXECUTE FUNCTION calcular_horas_ponto();
```

```sql
-- Trigger para histórico de estoque
CREATE OR REPLACE FUNCTION criar_historico_material()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.estoque_atual <> NEW.estoque_atual) THEN
    INSERT INTO historico_materiais (
      material_id, empresa_id, tipo, quantidade,
      estoque_anterior, estoque_atual, observacoes, created_by
    ) VALUES (
      NEW.id, NEW.empresa_id,
      CASE WHEN NEW.estoque_atual > OLD.estoque_atual THEN 'entrada' ELSE 'saida' END,
      ABS(NEW.estoque_atual - OLD.estoque_atual),
      OLD.estoque_atual, NEW.estoque_atual,
      'Alteração automática de estoque', auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER historico_estoque
  AFTER UPDATE ON materiais
  FOR EACH ROW EXECUTE FUNCTION criar_historico_material();
```

---

# PARTE 6: PRODUCT BACKLOG E CRONOGRAMA

## 10. Product Backlog Priorizado

### Regra de Estimativa (Story Points)

| Pontos | Complexidade | Exemplos |
|--------|--------------|----------|
| 1 | Muito Baixa | Ajustes de UI, correções simples |
| 2 | Baixa | CRUD simples, formulários básicos |
| 3 | Média | Tela com filtros e paginação, validações |
| 5 | Alta | Lógica de negócio complexa, integrações |
| 8 | Muito Alta | Funcionalidades críticas com múltiplas dependências |

### Backlog Completo

| ID | Item | Módulo | Prioridade | Pontos | Justificativa |
|----|------|--------|------------|--------|---------------|
| **ÉPICO 1: INFRAESTRUTURA** |||||
| PB-001 | Setup projeto Vite + React + TS | Infra | 🔴 Crítica | 3 | Base do projeto |
| PB-002 | Configurar Supabase (schema + RLS) | Infra | 🔴 Crítica | 8 | Fundação do backend |
| PB-003 | Sistema de autenticação JWT | Auth | 🔴 Crítica | 5 | Segurança base |
| PB-004 | Layout principal (Sidebar + Header) | UI | 🔴 Crítica | 5 | Navegação |
| PB-005 | Contextos globais (Auth, Empresa, Theme) | Infra | 🔴 Crítica | 3 | Estado global |
| **ÉPICO 2: ADMINISTRAÇÃO** |||||
| PB-006 | CRUD de Empresas | Admin | 🔴 Crítica | 5 | Multi-tenancy base |
| PB-007 | CRUD de Usuários + Perfis | Admin | 🔴 Crítica | 8 | Controle de acesso |
| PB-008 | Company Switcher (troca de empresa) | Admin | 🟡 Alta | 3 | UX multi-empresa |
| PB-009 | Tema dinâmico por empresa | Admin | 🟡 Alta | 3 | Identidade visual |
| PB-010 | Painel consolidado Grupo 2S | Admin | 🟡 Alta | 8 | Visão executiva |
| **ÉPICO 3: FINANCEIRO** |||||
| PB-011 | CRUD de Clientes (PF/PJ) | Financeiro | 🔴 Crítica | 5 | Cadastro base |
| PB-012 | CRUD de Fornecedores | Financeiro | 🔴 Crítica | 5 | Cadastro base |
| PB-013 | CRUD de Contratos | Financeiro | 🔴 Crítica | 8 | Core financeiro |
| PB-014 | Sistema de Parcelamento (RN-003) | Financeiro | 🔴 Crítica | 8 | Regra crítica |
| PB-015 | Gestão de Parcelas + Pagamentos | Financeiro | 🔴 Crítica | 5 | Controle financeiro |
| PB-016 | CRUD de Despesas | Financeiro | 🟡 Alta | 5 | Fluxo de caixa |
| PB-017 | Rateio de Despesas (RN-002) | Financeiro | 🟡 Alta | 5 | Regra crítica |
| PB-018 | Dashboard Financeiro | Financeiro | 🟡 Alta | 8 | KPIs |
| **ÉPICO 4: RH** |||||
| PB-019 | CRUD de Cargos | RH | 🔴 Crítica | 3 | Base para colaboradores |
| PB-020 | CRUD de Colaboradores | RH | 🔴 Crítica | 8 | Gestão de pessoas |
| PB-021 | Rateio de Colaboradores (RN-002) | RH | 🟡 Alta | 5 | Regra crítica |
| PB-022 | Controle de Ponto (RN-004) | RH | 🔴 Crítica | 8 | Frequência |
| PB-023 | Cálculo automático de horas | RH | 🔴 Crítica | 5 | Banco de horas |
| PB-024 | Folha de Pagamento (RN-007) | RH | 🟡 Alta | 8 | Pagamentos |
| PB-025 | Geração de Holerite PDF | RH | 🟡 Alta | 5 | Documento legal |
| PB-026 | Histórico de Pagamentos | RH | 🟢 Média | 3 | Consulta |
| **ÉPICO 5: ESTOQUE** |||||
| PB-027 | CRUD de Categorias | Estoque | 🟡 Alta | 2 | Organização |
| PB-028 | CRUD de Materiais | Estoque | 🔴 Crítica | 5 | Controle de ativos |
| PB-029 | Bloqueio de Estoque (RN-006) | Estoque | 🟡 Alta | 5 | Regra crítica |
| PB-030 | Histórico de Movimentações | Estoque | 🟡 Alta | 3 | Auditoria |
| **ÉPICO 6: OPERACIONAL** |||||
| PB-031 | CRUD de Veículos | Operacional | 🟡 Alta | 3 | Frota |
| PB-032 | CRUD de Ordens de Serviço | Operacional | 🔴 Crítica | 8 | Core operacional |
| PB-033 | Itens da OS (materiais vinculados) | Operacional | 🔴 Crítica | 5 | Alocação |
| **ÉPICO 7: RELATÓRIOS** |||||
| PB-034 | Exportação Excel genérica | Relatórios | 🟡 Alta | 3 | Utilitário |
| PB-035 | Exportação PDF genérica | Relatórios | 🟡 Alta | 5 | Utilitário |
| PB-036 | Relatórios Financeiros | Relatórios | 🟢 Média | 8 | Análise |
| PB-037 | Relatórios de RH | Relatórios | 🟢 Média | 5 | Análise |

### Resumo de Pontos

| Épico | Total de Pontos |
|-------|-----------------|
| Infraestrutura | 24 |
| Administração | 27 |
| Financeiro | 49 |
| RH | 45 |
| Estoque | 15 |
| Operacional | 16 |
| Relatórios | 21 |
| **TOTAL** | **197 pontos** |

---

## 11. Cronograma Estimado

### Premissas

- **Conversão:** 1 Ponto = 1 dia de desenvolvimento (com 2 desenvolvedores)
- **Sprint:** 10 dias úteis (2 semanas)
- **Capacidade por Sprint:** ~20 pontos
- **Fator de segurança:** +20% para imprevistos

### Cálculo

- **Total de Pontos:** 197
- **Dias de Desenvolvimento:** 197 / 2 devs = ~99 dias
- **Número de Sprints:** 99 / 10 = ~10 sprints
- **Com buffer (+20%):** 12 sprints = **24 semanas**

### Fases do Projeto

| Fase | Duração | Entregáveis |
|------|---------|-------------|
| 1. Setup e Arquitetura | 2 semanas | Projeto configurado, Supabase, Auth, Layout |
| 2. Módulos Base | 4 semanas | Empresas, Usuários, Clientes, Fornecedores |
| 3. Core Financeiro | 4 semanas | Contratos, Parcelas, Despesas, Dashboard |
| 4. Core RH | 4 semanas | Colaboradores, Ponto, Folha, Pagamentos |
| 5. Estoque e Operacional | 4 semanas | Materiais, OS, Veículos |
| 6. Relatórios e Ajustes | 4 semanas | Exportações, refinamentos, testes |
| 7. Homologação | 2 semanas | Testes com cliente, correções |

### Marcos (Milestones)

| Marco | Semana | Entrega |
|-------|--------|---------|
| M1 | Semana 2 | Ambiente configurado, autenticação funcionando |
| M2 | Semana 6 | MVP Financeiro (Contratos + Parcelas) |
| M3 | Semana 10 | MVP RH (Colaboradores + Ponto) |
| M4 | Semana 14 | MVP Operacional (Estoque + OS) |
| M5 | Semana 18 | Beta Release (todos os módulos) |
| M6 | Semana 22 | Homologação |
| M7 | Semana 24 | **Go-Live** |

---

# PARTE 7: PERFIS E PERMISSÕES

## 12. Matriz de Perfis de Usuário

### 12.1 Definição de Perfis

| Perfil | Código | Descrição | Escopo |
|--------|--------|-----------|--------|
| Administrador do Grupo | `admin_grupo` | Acesso total a todas as empresas e módulos | Grupo 2S (Holding) |
| Administrador | `admin` | Acesso total à sua empresa | Empresa específica |
| Gestor | `gestor` | Visualização ampla + aprovações | Empresa específica |
| Financeiro | `financeiro` | Módulo financeiro completo | Empresa específica |
| RH | `rh` | Módulo de recursos humanos | Empresa específica |
| Operacional | `operacional` | Estoque e ordens de serviço | Empresa específica |
| Cliente | `cliente` | Portal restrito (contratos, NFs) | Portal externo |

### 12.2 Matriz de Permissões

| Funcionalidade | admin_grupo | admin | gestor | financeiro | rh | operacional | cliente |
|----------------|-------------|-------|--------|------------|-----|-------------|---------|
| **ADMIN** ||||||||
| Ver todas empresas | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Gerenciar empresas | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Gerenciar usuários | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Painel consolidado | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **FINANCEIRO** ||||||||
| Ver clientes | ✅ | ✅ | ✅ | ✅ | 👁️ | 👁️ | ❌ |
| Gerenciar clientes | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ver contratos | ✅ | ✅ | ✅ | ✅ | 👁️ | 👁️ | 👁️ |
| Gerenciar contratos | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Registrar pagamentos | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ver despesas | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Gerenciar despesas | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Dashboard financeiro | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **RH** ||||||||
| Ver colaboradores | ✅ | ✅ | ✅ | 👁️ | ✅ | 👁️ | ❌ |
| Gerenciar colaboradores | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Registrar ponto | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Ver folha pagamento | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Gerar folha | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **ESTOQUE** ||||||||
| Ver materiais | ✅ | ✅ | ✅ | 👁️ | ❌ | ✅ | ❌ |
| Gerenciar materiais | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Bloquear materiais | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **OPERACIONAL** ||||||||
| Ver OS | ✅ | ✅ | ✅ | 👁️ | ❌ | ✅ | ❌ |
| Criar OS | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Gerenciar veículos | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **RELATÓRIOS** ||||||||
| Exportar Excel | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Exportar PDF | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Legenda:** ✅ Acesso total | 👁️ Somente leitura | ❌ Sem acesso

---

# PARTE 8: IDENTIDADE VISUAL

## 13. Cores por Empresa

| Empresa | Cor Primária | Cor Secundária | Uso |
|---------|--------------|----------------|-----|
| **Grupo 2S (Holding)** | #F97316 (Laranja) | #FB923C | Painel consolidado |
| **2S Locações** | #3B82F6 (Azul) | #60A5FA | Operações de locação |
| **2S Marketing** | #3B82F6 (Azul) | #8B5CF6 (Ametista) | Gestão de patrimônio |
| **2S Produções** | #7E22CE (Roxo) | #3B82F6 | Eventos e produção |

### Implementação CSS

```css
/* Grupo 2S */
.theme-grupo-2s {
  --color-primary: #F97316;
  --color-secondary: #FB923C;
}

/* 2S Locações */
.theme-2s-locacoes {
  --color-primary: #3B82F6;
  --color-secondary: #60A5FA;
}

/* 2S Marketing */
.theme-2s-marketing {
  --color-primary: #3B82F6;
  --color-secondary: #8B5CF6;
}

/* 2S Produções */
.theme-2s-producoes {
  --color-primary: #7E22CE;
  --color-secondary: #3B82F6;
}
```

---

# PARTE 9: PRÓXIMOS PASSOS

## 14. Ações Imediatas

### 14.1 Revisão Interna (Equipe Dizevolv)

- [ ] Revisar este documento em equipe
- [ ] Validar estimativas de esforço
- [ ] Confirmar disponibilidade de recursos
- [ ] Definir líder técnico do projeto

### 14.2 Validação com Cliente

- [ ] Apresentar documentação ao Lucas Khristophy (PO)
- [ ] Confirmar escopo e prioridades
- [ ] Alinhar expectativas de prazo
- [ ] Obter aprovação formal para início

### 14.3 Preenchimento de Lacunas

| Lacuna | Ação Necessária |
|--------|-----------------|
| Integração NF-e | Definir qual API será usada (futura implementação) |
| GPS Tracking | Definir se será obrigatório ou opcional |
| Templates de documentos | Cliente deve fornecer modelos de holerite/OS |
| Conformidade LGPD | Avaliar necessidade de consentimento explícito |

### 14.4 Início do Desenvolvimento

- **Semana 1:** Setup do projeto (Vite + React + Supabase)
- **Semana 2:** Schema do banco + RLS + Auth
- **Semana 3:** Layout principal + navegação
- **Semana 4:** Módulo de Empresas e Usuários

---

## 15. Referências

### Documentos de Origem

| Documento | Data | Conteúdo |
|-----------|------|----------|
| DOCUMENTAÇÃO_DE_PROJETO_-_GRUPO_2S.md | Nov/2025 | Requisitos e regras de negócio |
| SCHEMA_DATABASE.md | Nov/2025 | Estrutura completa do banco |
| FUNCIONALIDADES.md | Nov/2025 | Lista de funcionalidades implementadas |
| ESTRUTURA_BANCO_DADOS.md | Nov/2025 | Detalhamento de tabelas |
| DIAGRAMA_ER.md | Nov/2025 | Relacionamentos entre entidades |
| DOCUMENTACAO_TECNICA.md | Nov/2025 | Stack e arquitetura |
| RESUMO_MODAIS.md | Nov/2025 | Componentes de modal |
| MULTI_TENANCY_IMPLEMENTACAO.md | Nov/2025 | Sistema multi-empresa |
| RESUMO_CONTRATOS.md | Nov/2025 | Módulo de contratos |

### Transcrições de Reuniões

- Reunião Zipcall 10/11/2025
- Reunião Zipcall 02/10/2025
- Reunião Zipcall 10/09/2025
- Reunião Zipcall 15/08/2025

---

## 16. Glossário

| Termo | Definição |
|-------|-----------|
| **Multi-Tenancy** | Arquitetura onde múltiplas empresas compartilham o mesmo sistema com dados segregados |
| **RLS (Row Level Security)** | Mecanismo do PostgreSQL para restringir acesso a linhas específicas |
| **Rateio** | Distribuição proporcional de custos entre empresas do grupo |
| **Parcelamento Flexível** | Sistema que permite escolher entre parcelas automáticas ou manuais |
| **Soft Delete** | Exclusão lógica que marca registros como deletados sem removê-los fisicamente |
| **Banco de Horas** | Saldo de horas trabalhadas além ou aquém do contratado |
| **OS (Ordem de Serviço)** | Documento que registra serviço a ser executado com materiais e recursos |

---

**Documento gerado em:** 01/01/2026  
**Responsável:** Pedro Cruvinel - Dizevolv  
**Versão:** 3.0 (Reboot)  
**Status:** Pronto para validação com cliente

---

> *Este documento consolida toda a documentação existente do projeto Grupo 2S e serve como base única para o reboot do desenvolvimento em React + Vite + Supabase.*
