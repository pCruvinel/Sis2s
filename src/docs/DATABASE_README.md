# 🗄️ Documentação Completa do Banco de Dados

## Sistema ERP Grupo 2S - Supabase PostgreSQL

---

## 📚 Documentação Disponível

Este é o índice principal da documentação do banco de dados do Sistema ERP Grupo 2S. Todos os arquivos estão localizados no diretório `/docs/` e `/supabase/`.

---

## 📋 Arquivos de Documentação

### 1. **Schema Completo SQL** 📄
**Arquivo:** `/supabase/schema-completo.sql` (2500+ linhas)

**Conteúdo:**
- ✅ Script SQL completo pronto para executar
- ✅ 21 tabelas principais + 2 de sistema
- ✅ 20+ tipos ENUM
- ✅ 50+ índices otimizados
- ✅ Row Level Security (RLS) completo
- ✅ Triggers e functions automáticas
- ✅ Views de relatórios
- ✅ Dados seed iniciais

**Quando usar:** Para criar o banco de dados do zero ou entender a estrutura completa.

---

### 2. **Documentação do Schema** 📖
**Arquivo:** `/docs/SCHEMA_DATABASE.md`

**Conteúdo:**
- 📊 Visão geral da arquitetura
- 🏢 Explicação do multi-tenancy
- 🎨 Todos os tipos ENUM detalhados
- 📊 Estrutura de cada tabela
- 📜 Regras de negócio implementadas (RN-001 a RN-007)
- 🔐 Políticas RLS explicadas
- ⚡ Triggers e functions
- 📈 Views de relatórios
- 🚀 Índices e performance
- 🛠️ Como usar e instalar

**Quando usar:** Para entender como o banco de dados funciona e como foi estruturado.

---

### 3. **Diagrama Entidade-Relacionamento (ER)** 🎯
**Arquivo:** `/docs/DIAGRAMA_ER.md`

**Conteúdo:**
- 📐 Diagrama ER completo em Mermaid
- 🔗 Todos os relacionamentos entre tabelas
- 📊 Cardinalidades (1:1, 1:N, N:N)
- 🎨 Legenda de tipos de dados
- 📊 Estatísticas do schema
- 🔍 Queries de exemplo

**Quando usar:** Para visualizar a estrutura do banco e entender relacionamentos.

---

### 4. **Guia de Migrações** 🔄
**Arquivo:** `/supabase/migrations-guia.md`

**Conteúdo:**
- 🚀 Como fazer migrations no Supabase
- 📝 10+ exemplos práticos de migrations
- 🔙 Estratégias de rollback
- ✅ Boas práticas
- 📊 Templates prontos para usar
- 🎯 Checklist de migration

**Quando usar:** Sempre que precisar alterar a estrutura do banco de dados.

---

### 5. **Exemplos de Queries SQL** 💻
**Arquivo:** `/docs/SQL_QUERIES_EXEMPLOS.md`

**Conteúdo:**
- 🔍 33 queries prontas para usar
- 💰 Relatórios financeiros
- 👥 Relatórios de RH
- 📦 Relatórios de estoque
- 🚚 Relatórios operacionais
- 📊 Queries de análise (MoM, YoY)
- 🔧 Queries de manutenção
- 👨‍💼 Queries administrativas

**Quando usar:** Para consultar dados, gerar relatórios ou criar novos reports.

---

## 🎯 Roadmap de Uso

### Para Desenvolvedores Novos no Projeto

1. **Comece aqui:** Leia este `DATABASE_README.md` (você está aqui! ✅)
2. **Entenda a estrutura:** Leia `/docs/SCHEMA_DATABASE.md`
3. **Visualize:** Veja o diagrama em `/docs/DIAGRAMA_ER.md`
4. **Pratique:** Use as queries de `/docs/SQL_QUERIES_EXEMPLOS.md`
5. **Implemente:** Siga o guia de migrations quando precisar alterar o banco

### Para Aplicar o Schema em Produção

```bash
# 1. Acesse o Supabase Dashboard
# https://supabase.com/dashboard

# 2. Vá em SQL Editor

# 3. Cole o conteúdo de /supabase/schema-completo.sql

# 4. Execute (RUN ou Ctrl+Enter)

# 5. Verifique se tudo foi criado corretamente
```

### Para Desenvolver Novas Features

1. **Planeje:** Identifique quais tabelas serão afetadas
2. **Crie migration:** Siga `/supabase/migrations-guia.md`
3. **Teste:** Sempre teste em desenvolvimento primeiro
4. **Documente:** Atualize a documentação se necessário
5. **Aplique:** Execute em produção com backup

---

## 📊 Estatísticas do Schema

| Métrica | Quantidade |
|---------|-----------|
| **Tabelas Principais** | 21 |
| **Tabelas de Sistema** | 2 |
| **Total de Tabelas** | 23 |
| **Tipos ENUM** | 20+ |
| **Campos Totais** | 300+ |
| **Índices** | 50+ |
| **Triggers** | 15+ |
| **Functions** | 5+ |
| **RLS Policies** | 30+ |
| **Views** | 4+ |
| **Linhas de SQL** | 2500+ |

---

## 🏗️ Arquitetura do Banco de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                 SISTEMA ERP GRUPO 2S                         │
│                  Supabase PostgreSQL                         │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
    ┌───▼────┐        ┌────▼─────┐       ┌────▼─────┐
    │ ADMIN  │        │FINANCEIRO│       │    RH    │
    └────────┘        └──────────┘       └──────────┘
        │                   │                   │
    ┌───┴────┐        ┌────┴─────┐       ┌────┴─────┐
    │ESTOQUE │        │OPERACION.│       │  FISCAL  │
    └────────┘        └──────────┘       └──────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                      ┌─────▼──────┐
                      │  CATÁLOGO  │
                      └────────────┘
```

### Módulos

1. **ADMIN** - Empresas, Usuários
2. **FINANCEIRO** - Contratos, Parcelas, Despesas, Clientes, Fornecedores
3. **RH** - Colaboradores, Cargos, Ponto, Pagamentos
4. **ESTOQUE** - Materiais, Categorias, Histórico
5. **OPERACIONAL** - Ordens de Serviço, Veículos
6. **FISCAL** - Notas Fiscais
7. **CATÁLOGO** - Serviços e Categorias

---

## 🔐 Segurança

### Row Level Security (RLS)

✅ **Habilitado em todas as tabelas**

Políticas implementadas:
- 🔒 Segregação por `empresa_id` (RN-001)
- 🔒 Usuários multi-empresa via `empresas_ids`
- 🔒 Perfis de acesso (admin_grupo, admin, gestor, etc.)
- 🔒 Soft delete com `deleted_at` (RN-005)
- 🔒 Auditoria completa via `audit_log`

### Autenticação

- ✅ Integração com Supabase Auth
- ✅ JWT tokens
- ✅ Hash bcrypt para senhas
- ✅ Controle de tentativas de login
- ✅ Bloqueio temporário de conta

---

## 📜 Regras de Negócio Implementadas

### RN-001: Multi-Tenancy com Segregação por Empresa
✅ Todas as tabelas têm `empresa_id`  
✅ RLS filtra automaticamente por empresa do usuário  
✅ Suporte a usuários multi-empresa

### RN-002: Rateio Automático Entre Empresas
✅ Campo `rateio_empresas` (JSONB) em despesas e colaboradores  
✅ Permite dividir custos entre múltiplas empresas

### RN-003: Parcelamento Flexível
✅ Datas personalizadas por parcela  
✅ Tipos: mensal, quinzenal, semanal, personalizado, vista  
✅ Campos para juros, multa, desconto

### RN-004: Controle de Ponto Centralizado
✅ 4 horários por dia (entrada/saída manhã/tarde)  
✅ Cálculo automático de horas via trigger  
✅ Banco de horas acumulativo  
✅ Geolocalização GPS

### RN-005: Exclusão Lógica (Soft Delete)
✅ Campo `deleted_at` em todas as tabelas  
✅ RLS filtra automaticamente dados deletados  
✅ Dados nunca são perdidos

### RN-006: Bloqueio de Estoque por Vinculação
✅ Campo `estoque_bloqueado` em materiais  
✅ Campo calculado `estoque_disponivel`  
✅ Bloqueio automático ao vincular a OS  
✅ Histórico completo de bloqueios

### RN-007: Separação de Bônus e Descontos
✅ Campos separados para cada tipo de adicional/desconto  
✅ Cálculos automáticos (GENERATED)  
✅ Transparência total na folha de pagamento

---

## 🚀 Performance

### Índices Implementados

- ✅ 50+ índices estratégicos
- ✅ Índices compostos para queries frequentes
- ✅ Índices parciais (WHERE deleted_at IS NULL)
- ✅ Índices GiST para geolocalização (PostGIS)
- ✅ Índices em foreign keys

### Otimizações

- ✅ Campos calculados (GENERATED ALWAYS AS)
- ✅ Triggers para cálculos automáticos
- ✅ Views materializadas para relatórios
- ✅ JSONB para dados flexíveis
- ✅ Particionamento preparado para escala

---

## 🔧 Ferramentas e Tecnologias

| Tecnologia | Uso |
|-----------|-----|
| **PostgreSQL 15** | Banco de dados relacional |
| **Supabase** | Backend as a Service |
| **PostGIS** | Geolocalização (GPS) |
| **RLS** | Row Level Security |
| **JSONB** | Dados flexíveis |
| **Triggers** | Automação de cálculos |
| **Functions** | Lógica de negócio |
| **Views** | Relatórios otimizados |

---

## 📞 Suporte

### Problemas Comuns

#### Erro: "permission denied for table X"
**Solução:** Verificar se RLS está habilitado e se o usuário tem permissão

```sql
-- Verificar RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Verificar políticas
SELECT * FROM pg_policies 
WHERE tablename = 'nome_tabela';
```

#### Erro: "duplicate key value violates unique constraint"
**Solução:** Verificar se já existe registro com o mesmo valor único

```sql
-- Exemplo: buscar CNPJ duplicado
SELECT * FROM clientes 
WHERE cpf_cnpj = '12.345.678/0001-01';
```

#### Query lenta
**Solução:** Usar EXPLAIN ANALYZE para identificar gargalo

```sql
EXPLAIN ANALYZE
SELECT * FROM contratos 
WHERE empresa_id = '2s-locacoes';
```

---

## 📅 Changelog

### Versão 2.0 (Novembro 2025)
- ✅ Schema completo criado
- ✅ 23 tabelas implementadas
- ✅ RLS completo
- ✅ 7 regras de negócio implementadas
- ✅ Documentação completa

### Próximas Versões
- ⏳ Adicionar tabela de mensagens internas
- ⏳ Implementar sistema de anexos genérico
- ⏳ Adicionar tabela de configurações por módulo
- ⏳ Criar views materializadas para dashboards

---

## 📚 Referências Externas

- [Documentação PostgreSQL 15](https://www.postgresql.org/docs/15/)
- [Supabase Documentation](https://supabase.com/docs)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [SQL Style Guide](https://www.sqlstyle.guide/)

---

## ✅ Checklist de Implementação

### Desenvolvimento
- [x] Schema SQL criado
- [x] ENUMs definidos
- [x] Tabelas criadas
- [x] RLS habilitado
- [x] Índices criados
- [x] Triggers implementados
- [x] Views criadas
- [x] Dados seed preparados
- [ ] Testes unitários
- [ ] Testes de carga

### Documentação
- [x] Schema documentado
- [x] Diagrama ER criado
- [x] Guia de migrations
- [x] Exemplos de queries
- [x] README geral
- [ ] Vídeo tutorial
- [ ] Documentação de API

### Produção
- [ ] Backup automático configurado
- [ ] Monitoramento ativo
- [ ] Alertas configurados
- [ ] Disaster recovery testado
- [ ] Performance baseline estabelecida

---

## 🎓 Para Aprender Mais

### Tutoriais Recomendados

1. **PostgreSQL Básico**
   - [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
   - [SQL for Beginners](https://www.w3schools.com/sql/)

2. **Supabase**
   - [Quickstart Guide](https://supabase.com/docs/guides/getting-started)
   - [Database Functions](https://supabase.com/docs/guides/database/functions)

3. **Performance**
   - [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)
   - [Query Optimization](https://use-the-index-luke.com/)

---

## 🤝 Contribuindo

Para contribuir com melhorias no banco de dados:

1. **Crie uma migration** seguindo o guia
2. **Teste em desenvolvimento** primeiro
3. **Documente** a alteração
4. **Atualize** este README se necessário
5. **Solicite revisão** antes de aplicar em produção

---

## 📄 Licença

© 2025 Grupo 2S. Todos os direitos reservados.  
Uso interno restrito.

---

**Última atualização:** Novembro 2025  
**Versão da Documentação:** 2.0  
**Mantido por:** Equipe de Desenvolvimento Grupo 2S

---

## 🚀 Quick Start

```bash
# 1. Clone o repositório
git clone [repo_url]

# 2. Acesse o diretório
cd grupo-2s-erp

# 3. Configure o Supabase
# Crie um projeto em https://supabase.com

# 4. Aplique o schema
# Cole /supabase/schema-completo.sql no SQL Editor

# 5. Configure variáveis de ambiente
# SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

# 6. Inicie o desenvolvimento
npm run dev
```

---

**Pronto para começar!** 🎉

Consulte os arquivos de documentação conforme necessário e boa sorte no desenvolvimento!
