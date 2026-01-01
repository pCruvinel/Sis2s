# 📝 Exemplos de Queries SQL Úteis

## Sistema ERP Grupo 2S - Cookbook de Queries

---

## 📋 Índice

1. [Queries de Consulta (SELECT)](#queries-de-consulta-select)
2. [Relatórios Financeiros](#relatórios-financeiros)
3. [Relatórios de RH](#relatórios-de-rh)
4. [Relatórios de Estoque](#relatórios-de-estoque)
5. [Relatórios Operacionais](#relatórios-operacionais)
6. [Queries de Análise](#queries-de-análise)
7. [Queries de Manutenção](#queries-de-manutenção)
8. [Queries Administrativas](#queries-administrativas)

---

## 🔍 Queries de Consulta (SELECT)

### 1. Listar Todos os Contratos Ativos

```sql
SELECT 
  c.numero_contrato,
  c.tipo,
  CASE 
    WHEN c.tipo = 'cliente' THEN cl.nome_razao_social
    WHEN c.tipo = 'fornecedor' THEN f.nome_razao_social
  END AS parte_contratante,
  c.valor_final,
  c.data_inicio,
  c.data_fim,
  c.status,
  e.nome AS empresa
FROM contratos c
LEFT JOIN clientes cl ON cl.id = c.cliente_id
LEFT JOIN fornecedores f ON f.id = c.fornecedor_id
JOIN empresas e ON e.id = c.empresa_id
WHERE c.status = 'ativo'
  AND c.deleted_at IS NULL
ORDER BY c.data_inicio DESC;
```

### 2. Buscar Cliente por CPF/CNPJ

```sql
SELECT 
  c.*,
  e.nome AS empresa,
  COUNT(ct.id) AS total_contratos
FROM clientes c
JOIN empresas e ON e.id = c.empresa_id
LEFT JOIN contratos ct ON ct.cliente_id = c.id AND ct.deleted_at IS NULL
WHERE c.cpf_cnpj = '123.456.789-00'
  AND c.deleted_at IS NULL
GROUP BY c.id, e.nome;
```

### 3. Listar Colaboradores Ativos por Empresa

```sql
SELECT 
  c.matricula,
  c.nome,
  c.email,
  cg.nome AS cargo,
  c.salario_base,
  c.data_admissao,
  EXTRACT(YEAR FROM AGE(CURRENT_DATE, c.data_admissao)) AS anos_empresa
FROM colaboradores c
LEFT JOIN cargos cg ON cg.id = c.cargo_id
WHERE c.empresa_id = '2s-locacoes'
  AND c.status = 'ativo'
  AND c.deleted_at IS NULL
ORDER BY c.nome;
```

### 4. Verificar Estoque de Materiais

```sql
SELECT 
  m.codigo,
  m.nome,
  cm.nome AS categoria,
  m.estoque_atual,
  m.estoque_bloqueado,
  m.estoque_disponivel,
  m.estoque_minimo,
  m.estoque_maximo,
  m.valor_unitario,
  m.localizacao,
  m.status,
  CASE 
    WHEN m.estoque_disponivel <= 0 THEN '🔴 SEM ESTOQUE'
    WHEN m.estoque_disponivel < m.estoque_minimo THEN '🟡 ESTOQUE BAIXO'
    WHEN m.estoque_disponivel >= m.estoque_maximo THEN '🔵 ESTOQUE ALTO'
    ELSE '🟢 ESTOQUE OK'
  END AS alerta
FROM materiais m
LEFT JOIN categorias_material cm ON cm.id = m.categoria_id
WHERE m.empresa_id = '2s-locacoes'
  AND m.deleted_at IS NULL
ORDER BY m.estoque_disponivel ASC;
```

### 5. Ordens de Serviço Pendentes

```sql
SELECT 
  os.numero_os,
  os.titulo,
  cl.nome_razao_social AS cliente,
  os.data_montagem,
  os.data_desmontagem,
  os.status,
  os.prioridade,
  v.placa AS veiculo,
  m.nome AS motorista,
  COUNT(ios.id) AS total_itens
FROM ordens_servico os
JOIN clientes cl ON cl.id = os.cliente_id
LEFT JOIN veiculos v ON v.id = os.veiculo_id
LEFT JOIN colaboradores m ON m.id = os.motorista_id
LEFT JOIN itens_ordem_servico ios ON ios.ordem_servico_id = os.id
WHERE os.empresa_id = '2s-locacoes'
  AND os.status IN ('criada', 'em_andamento', 'em_montagem')
  AND os.deleted_at IS NULL
GROUP BY os.id, cl.nome_razao_social, v.placa, m.nome
ORDER BY 
  CASE os.prioridade
    WHEN 'urgente' THEN 1
    WHEN 'alta' THEN 2
    WHEN 'normal' THEN 3
    WHEN 'baixa' THEN 4
  END,
  os.data_montagem;
```

---

## 💰 Relatórios Financeiros

### 6. Dashboard Financeiro Mensal

```sql
WITH receitas AS (
  SELECT 
    DATE_TRUNC('month', p.data_vencimento) AS mes,
    SUM(p.valor) FILTER (WHERE p.status = 'pago') AS recebido,
    SUM(p.valor) FILTER (WHERE p.status = 'pendente') AS a_receber,
    SUM(p.valor) FILTER (WHERE p.status = 'atrasado') AS atrasado
  FROM parcelas p
  JOIN contratos c ON c.id = p.contrato_id
  WHERE c.empresa_id = '2s-locacoes'
    AND c.tipo = 'cliente'
    AND p.deleted_at IS NULL
  GROUP BY DATE_TRUNC('month', p.data_vencimento)
),
despesas_mes AS (
  SELECT 
    DATE_TRUNC('month', d.data_vencimento) AS mes,
    SUM(d.valor_final) FILTER (WHERE d.status = 'pago') AS pago,
    SUM(d.valor_final) FILTER (WHERE d.status = 'pendente') AS a_pagar
  FROM despesas d
  WHERE d.empresa_id = '2s-locacoes'
    AND d.deleted_at IS NULL
  GROUP BY DATE_TRUNC('month', d.data_vencimento)
)
SELECT 
  TO_CHAR(r.mes, 'MM/YYYY') AS mes,
  COALESCE(r.recebido, 0) AS receita_recebida,
  COALESCE(r.a_receber, 0) AS receita_a_receber,
  COALESCE(r.atrasado, 0) AS receita_atrasada,
  COALESCE(d.pago, 0) AS despesas_pagas,
  COALESCE(d.a_pagar, 0) AS despesas_a_pagar,
  COALESCE(r.recebido, 0) - COALESCE(d.pago, 0) AS saldo_mensal
FROM receitas r
FULL OUTER JOIN despesas_mes d ON d.mes = r.mes
WHERE r.mes >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months')
ORDER BY r.mes DESC;
```

### 7. Contratos com Saldo Pendente

```sql
SELECT 
  c.numero_contrato,
  cl.nome_razao_social AS cliente,
  c.valor_final AS valor_total,
  COUNT(p.id) AS total_parcelas,
  COUNT(p.id) FILTER (WHERE p.status = 'pago') AS parcelas_pagas,
  COUNT(p.id) FILTER (WHERE p.status = 'pendente') AS parcelas_pendentes,
  COALESCE(SUM(p.valor) FILTER (WHERE p.status = 'pago'), 0) AS valor_recebido,
  COALESCE(SUM(p.valor) FILTER (WHERE p.status = 'pendente'), 0) AS saldo_pendente,
  ROUND((COALESCE(SUM(p.valor) FILTER (WHERE p.status = 'pago'), 0) / c.valor_final * 100)::NUMERIC, 2) AS percentual_recebido
FROM contratos c
JOIN clientes cl ON cl.id = c.cliente_id
LEFT JOIN parcelas p ON p.contrato_id = c.id AND p.deleted_at IS NULL
WHERE c.empresa_id = '2s-locacoes'
  AND c.tipo = 'cliente'
  AND c.status = 'ativo'
  AND c.deleted_at IS NULL
GROUP BY c.id, cl.nome_razao_social
HAVING COALESCE(SUM(p.valor) FILTER (WHERE p.status = 'pendente'), 0) > 0
ORDER BY saldo_pendente DESC;
```

### 8. Parcelas Vencidas (Inadimplência)

```sql
SELECT 
  p.numero_parcela,
  c.numero_contrato,
  cl.nome_razao_social AS cliente,
  cl.telefone,
  cl.whatsapp,
  p.valor,
  p.data_vencimento,
  CURRENT_DATE - p.data_vencimento AS dias_atraso,
  p.status
FROM parcelas p
JOIN contratos c ON c.id = p.contrato_id
JOIN clientes cl ON cl.id = c.cliente_id
WHERE c.empresa_id = '2s-locacoes'
  AND p.status IN ('pendente', 'atrasado')
  AND p.data_vencimento < CURRENT_DATE
  AND p.deleted_at IS NULL
ORDER BY p.data_vencimento ASC;
```

### 9. Ranking de Clientes por Faturamento

```sql
SELECT 
  cl.nome_razao_social AS cliente,
  COUNT(DISTINCT c.id) AS total_contratos,
  SUM(c.valor_final) AS valor_total_contratado,
  COALESCE(SUM(p.valor) FILTER (WHERE p.status = 'pago'), 0) AS valor_total_pago,
  COALESCE(SUM(p.valor) FILTER (WHERE p.status = 'pendente'), 0) AS saldo_pendente
FROM clientes cl
JOIN contratos c ON c.cliente_id = cl.id AND c.deleted_at IS NULL
LEFT JOIN parcelas p ON p.contrato_id = c.id AND p.deleted_at IS NULL
WHERE cl.empresa_id = '2s-locacoes'
  AND cl.deleted_at IS NULL
GROUP BY cl.id
ORDER BY valor_total_pago DESC
LIMIT 20;
```

### 10. Despesas por Categoria (Mensal)

```sql
SELECT 
  TO_CHAR(DATE_TRUNC('month', d.data_competencia), 'MM/YYYY') AS mes,
  d.categoria,
  COUNT(*) AS quantidade,
  SUM(d.valor_final) AS total
FROM despesas d
WHERE d.empresa_id = '2s-locacoes'
  AND d.data_competencia >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')
  AND d.deleted_at IS NULL
GROUP BY DATE_TRUNC('month', d.data_competencia), d.categoria
ORDER BY DATE_TRUNC('month', d.data_competencia) DESC, total DESC;
```

---

## 👥 Relatórios de RH

### 11. Banco de Horas por Colaborador

```sql
SELECT 
  c.matricula,
  c.nome,
  cg.nome AS cargo,
  COUNT(rp.id) AS dias_registrados,
  ROUND(COALESCE(SUM(rp.horas_trabalhadas), 0)::NUMERIC, 2) AS total_horas_trabalhadas,
  ROUND(COALESCE(SUM(rp.horas_extras), 0)::NUMERIC, 2) AS total_horas_extras,
  ROUND(COALESCE(SUM(rp.banco_horas), 0)::NUMERIC, 2) AS banco_horas_acumulado,
  CASE 
    WHEN COALESCE(SUM(rp.banco_horas), 0) > 0 THEN 'POSITIVO'
    WHEN COALESCE(SUM(rp.banco_horas), 0) < 0 THEN 'NEGATIVO'
    ELSE 'ZERADO'
  END AS status_banco_horas
FROM colaboradores c
LEFT JOIN cargos cg ON cg.id = c.cargo_id
LEFT JOIN registros_ponto rp ON rp.colaborador_id = c.id
  AND rp.data >= DATE_TRUNC('month', CURRENT_DATE)
WHERE c.empresa_id = '2s-locacoes'
  AND c.status = 'ativo'
  AND c.deleted_at IS NULL
GROUP BY c.id, cg.nome
ORDER BY banco_horas_acumulado DESC;
```

### 12. Faltas e Atrasos do Mês

```sql
SELECT 
  c.nome AS colaborador,
  rp.data,
  rp.entrada_manha,
  rp.saida_almoco,
  rp.entrada_tarde,
  rp.saida_noite,
  rp.horas_trabalhadas,
  rp.status,
  rp.justificativa
FROM registros_ponto rp
JOIN colaboradores c ON c.id = rp.colaborador_id
WHERE rp.empresa_id = '2s-locacoes'
  AND rp.data >= DATE_TRUNC('month', CURRENT_DATE)
  AND rp.status IN ('falta', 'atraso', 'falta_justificada')
  AND rp.deleted_at IS NULL
ORDER BY rp.data DESC, c.nome;
```

### 13. Folha de Pagamento Consolidada

```sql
SELECT 
  c.nome AS colaborador,
  c.matricula,
  cg.nome AS cargo,
  p.competencia,
  p.salario_base,
  p.total_adicionais,
  p.total_descontos,
  p.salario_liquido,
  p.status,
  p.data_pagamento
FROM pagamentos p
JOIN colaboradores c ON c.id = p.colaborador_id
LEFT JOIN cargos cg ON cg.id = c.cargo_id
WHERE p.empresa_id = '2s-locacoes'
  AND p.competencia = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
  AND p.deleted_at IS NULL
ORDER BY c.nome;
```

### 14. Aniversariantes do Mês

```sql
SELECT 
  c.nome,
  c.email,
  c.telefone,
  c.data_nascimento,
  EXTRACT(DAY FROM c.data_nascimento) AS dia_aniversario,
  EXTRACT(YEAR FROM AGE(CURRENT_DATE, c.data_nascimento)) AS idade
FROM colaboradores c
WHERE c.empresa_id = '2s-locacoes'
  AND EXTRACT(MONTH FROM c.data_nascimento) = EXTRACT(MONTH FROM CURRENT_DATE)
  AND c.status = 'ativo'
  AND c.deleted_at IS NULL
ORDER BY EXTRACT(DAY FROM c.data_nascimento);
```

### 15. Custo Total de Pessoal por Empresa

```sql
SELECT 
  e.nome AS empresa,
  COUNT(c.id) AS total_colaboradores,
  SUM(c.salario_base) AS total_salarios_base,
  SUM(c.vale_transporte) AS total_vale_transporte,
  SUM(c.vale_alimentacao) AS total_vale_alimentacao,
  SUM(c.plano_saude) AS total_plano_saude,
  SUM(c.salario_base + c.vale_transporte + c.vale_alimentacao + c.plano_saude) AS custo_total_mensal
FROM colaboradores c
JOIN empresas e ON e.id = c.empresa_id
WHERE c.status = 'ativo'
  AND c.deleted_at IS NULL
GROUP BY e.id
ORDER BY custo_total_mensal DESC;
```

---

## 📦 Relatórios de Estoque

### 16. Materiais com Estoque Crítico

```sql
SELECT 
  m.codigo,
  m.nome,
  cm.nome AS categoria,
  m.estoque_disponivel,
  m.estoque_minimo,
  m.estoque_bloqueado,
  m.valor_unitario,
  m.estoque_disponivel * m.valor_unitario AS valor_estoque,
  m.localizacao,
  ROUND(((m.estoque_disponivel::NUMERIC / NULLIF(m.estoque_minimo, 0)) * 100)::NUMERIC, 2) AS percentual_minimo
FROM materiais m
LEFT JOIN categorias_material cm ON cm.id = m.categoria_id
WHERE m.empresa_id = '2s-locacoes'
  AND m.estoque_disponivel < m.estoque_minimo
  AND m.status = 'ativo'
  AND m.deleted_at IS NULL
ORDER BY percentual_minimo ASC, m.codigo;
```

### 17. Histórico de Movimentações de Material

```sql
SELECT 
  hm.created_at::DATE AS data,
  hm.tipo,
  hm.quantidade,
  hm.estoque_anterior,
  hm.estoque_atual,
  hm.observacoes,
  hm.documento,
  u.nome AS usuario
FROM historico_materiais hm
LEFT JOIN users u ON u.id = hm.created_by
WHERE hm.material_id = '[UUID_MATERIAL]'
ORDER BY hm.created_at DESC
LIMIT 50;
```

### 18. Valor Total do Estoque

```sql
SELECT 
  cm.nome AS categoria,
  COUNT(m.id) AS quantidade_itens,
  SUM(m.estoque_atual) AS quantidade_total,
  SUM(m.estoque_atual * m.valor_unitario) AS valor_total
FROM materiais m
LEFT JOIN categorias_material cm ON cm.id = m.categoria_id
WHERE m.empresa_id = '2s-locacoes'
  AND m.status = 'ativo'
  AND m.deleted_at IS NULL
GROUP BY cm.id
ORDER BY valor_total DESC;
```

### 19. Materiais Mais Utilizados em OS

```sql
SELECT 
  m.codigo,
  m.nome,
  COUNT(DISTINCT ios.ordem_servico_id) AS total_os,
  SUM(ios.quantidade_solicitada) AS quantidade_total_utilizada,
  AVG(ios.quantidade_solicitada) AS media_por_os,
  MAX(ios.created_at) AS ultima_utilizacao
FROM itens_ordem_servico ios
JOIN materiais m ON m.id = ios.material_id
WHERE m.empresa_id = '2s-locacoes'
  AND ios.created_at >= CURRENT_DATE - INTERVAL '90 days'
  AND ios.deleted_at IS NULL
GROUP BY m.id
ORDER BY quantidade_total_utilizada DESC
LIMIT 20;
```

### 20. Materiais Bloqueados (Em Uso)

```sql
SELECT 
  m.codigo,
  m.nome,
  m.estoque_bloqueado,
  os.numero_os,
  os.titulo AS evento,
  ios.quantidade_solicitada,
  os.data_montagem,
  os.data_desmontagem,
  os.status AS status_os
FROM materiais m
JOIN itens_ordem_servico ios ON ios.material_id = m.id
JOIN ordens_servico os ON os.id = ios.ordem_servico_id
WHERE m.empresa_id = '2s-locacoes'
  AND ios.estoque_bloqueado = TRUE
  AND os.status NOT IN ('concluida', 'cancelada')
  AND m.deleted_at IS NULL
  AND os.deleted_at IS NULL
ORDER BY os.data_montagem;
```

---

## 🚚 Relatórios Operacionais

### 21. Agenda de Ordens de Serviço (Próximos 30 Dias)

```sql
SELECT 
  os.data_montagem::DATE AS data,
  os.numero_os,
  os.titulo,
  cl.nome_razao_social AS cliente,
  os.local_evento,
  v.placa AS veiculo,
  m.nome AS motorista,
  os.status,
  os.prioridade
FROM ordens_servico os
JOIN clientes cl ON cl.id = os.cliente_id
LEFT JOIN veiculos v ON v.id = os.veiculo_id
LEFT JOIN colaboradores m ON m.id = os.motorista_id
WHERE os.empresa_id = '2s-locacoes'
  AND os.data_montagem BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
  AND os.status NOT IN ('cancelada', 'concluida')
  AND os.deleted_at IS NULL
ORDER BY os.data_montagem, os.prioridade;
```

### 22. Veículos e Status de Disponibilidade

```sql
SELECT 
  v.placa,
  v.modelo,
  v.marca,
  v.status,
  v.km_atual,
  CASE 
    WHEN v.proxima_revisao_km - v.km_atual <= 1000 THEN '⚠️ REVISÃO PRÓXIMA'
    WHEN v.data_vencimento_ipva <= CURRENT_DATE + INTERVAL '30 days' THEN '⚠️ IPVA VENCENDO'
    WHEN v.data_vencimento_seguro <= CURRENT_DATE + INTERVAL '30 days' THEN '⚠️ SEGURO VENCENDO'
    ELSE '✅ OK'
  END AS alerta,
  os.numero_os AS os_atual,
  os.data_montagem,
  os.data_desmontagem
FROM veiculos v
LEFT JOIN ordens_servico os ON os.veiculo_id = v.id 
  AND os.status IN ('em_andamento', 'em_montagem')
  AND os.deleted_at IS NULL
WHERE v.empresa_id = '2s-locacoes'
  AND v.deleted_at IS NULL
ORDER BY v.status, v.placa;
```

### 23. Tempo Médio de Execução de OS

```sql
SELECT 
  cl.nome_razao_social AS cliente,
  COUNT(os.id) AS total_os,
  ROUND(AVG(EXTRACT(EPOCH FROM (os.data_desmontagem - os.data_montagem)) / 3600)::NUMERIC, 2) AS media_horas,
  MIN(os.data_montagem) AS primeira_os,
  MAX(os.data_montagem) AS ultima_os
FROM ordens_servico os
JOIN clientes cl ON cl.id = os.cliente_id
WHERE os.empresa_id = '2s-locacoes'
  AND os.status = 'concluida'
  AND os.data_desmontagem IS NOT NULL
  AND os.deleted_at IS NULL
GROUP BY cl.id
HAVING COUNT(os.id) >= 3
ORDER BY total_os DESC;
```

---

## 📊 Queries de Análise

### 24. Crescimento MoM (Month over Month) - Receitas

```sql
WITH receitas_mensais AS (
  SELECT 
    DATE_TRUNC('month', p.data_pagamento) AS mes,
    SUM(p.valor) AS total
  FROM parcelas p
  JOIN contratos c ON c.id = p.contrato_id
  WHERE c.empresa_id = '2s-locacoes'
    AND p.status = 'pago'
    AND p.data_pagamento >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')
    AND p.deleted_at IS NULL
  GROUP BY DATE_TRUNC('month', p.data_pagamento)
)
SELECT 
  TO_CHAR(rm.mes, 'MM/YYYY') AS mes,
  rm.total AS receita,
  LAG(rm.total) OVER (ORDER BY rm.mes) AS receita_mes_anterior,
  rm.total - LAG(rm.total) OVER (ORDER BY rm.mes) AS variacao_absoluta,
  ROUND((
    (rm.total - LAG(rm.total) OVER (ORDER BY rm.mes)) / 
    NULLIF(LAG(rm.total) OVER (ORDER BY rm.mes), 0) * 100
  )::NUMERIC, 2) AS crescimento_percentual
FROM receitas_mensais rm
ORDER BY rm.mes DESC;
```

### 25. Taxa de Inadimplência

```sql
WITH totais AS (
  SELECT 
    COUNT(*) AS total_parcelas,
    COUNT(*) FILTER (WHERE status = 'pago') AS pagas,
    COUNT(*) FILTER (WHERE status IN ('pendente', 'atrasado') AND data_vencimento < CURRENT_DATE) AS atrasadas,
    SUM(valor) AS valor_total,
    SUM(valor) FILTER (WHERE status = 'pago') AS valor_pago,
    SUM(valor) FILTER (WHERE status IN ('pendente', 'atrasado') AND data_vencimento < CURRENT_DATE) AS valor_atrasado
  FROM parcelas p
  JOIN contratos c ON c.id = p.contrato_id
  WHERE c.empresa_id = '2s-locacoes'
    AND c.tipo = 'cliente'
    AND p.deleted_at IS NULL
)
SELECT 
  total_parcelas,
  pagas,
  atrasadas,
  ROUND((atrasadas::NUMERIC / NULLIF(total_parcelas, 0) * 100)::NUMERIC, 2) AS taxa_inadimplencia_quantidade,
  valor_total,
  valor_pago,
  valor_atrasado,
  ROUND((valor_atrasado / NULLIF(valor_total, 0) * 100)::NUMERIC, 2) AS taxa_inadimplencia_valor
FROM totais;
```

### 26. Comparativo Anual (YoY - Year over Year)

```sql
SELECT 
  EXTRACT(MONTH FROM data_vencimento) AS mes,
  TO_CHAR(DATE_TRUNC('month', data_vencimento), 'Month') AS nome_mes,
  SUM(valor) FILTER (WHERE EXTRACT(YEAR FROM data_vencimento) = EXTRACT(YEAR FROM CURRENT_DATE)) AS ano_atual,
  SUM(valor) FILTER (WHERE EXTRACT(YEAR FROM data_vencimento) = EXTRACT(YEAR FROM CURRENT_DATE) - 1) AS ano_anterior,
  ROUND((
    (SUM(valor) FILTER (WHERE EXTRACT(YEAR FROM data_vencimento) = EXTRACT(YEAR FROM CURRENT_DATE)) -
     SUM(valor) FILTER (WHERE EXTRACT(YEAR FROM data_vencimento) = EXTRACT(YEAR FROM CURRENT_DATE) - 1)) /
    NULLIF(SUM(valor) FILTER (WHERE EXTRACT(YEAR FROM data_vencimento) = EXTRACT(YEAR FROM CURRENT_DATE) - 1), 0) * 100
  )::NUMERIC, 2) AS crescimento_yoy
FROM parcelas p
JOIN contratos c ON c.id = p.contrato_id
WHERE c.empresa_id = '2s-locacoes'
  AND c.tipo = 'cliente'
  AND p.status = 'pago'
  AND EXTRACT(YEAR FROM data_vencimento) IN (EXTRACT(YEAR FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE) - 1)
  AND p.deleted_at IS NULL
GROUP BY EXTRACT(MONTH FROM data_vencimento), TO_CHAR(DATE_TRUNC('month', data_vencimento), 'Month')
ORDER BY EXTRACT(MONTH FROM data_vencimento);
```

---

## 🔧 Queries de Manutenção

### 27. Limpar Registros Deletados (Soft Delete)

```sql
-- ATENÇÃO: Execute com cuidado! Isso remove permanentemente dados.
-- Recomenda-se fazer backup antes.

-- Remover registros deletados há mais de 1 ano
DELETE FROM parcelas WHERE deleted_at < CURRENT_DATE - INTERVAL '1 year';
DELETE FROM contratos WHERE deleted_at < CURRENT_DATE - INTERVAL '1 year';
DELETE FROM despesas WHERE deleted_at < CURRENT_DATE - INTERVAL '1 year';
-- ... repetir para outras tabelas
```

### 28. Reindexar Tabelas

```sql
-- Reindexar todas as tabelas (melhora performance)
REINDEX DATABASE [nome_database];

-- Ou reindexar tabelas específicas
REINDEX TABLE materiais;
REINDEX TABLE contratos;
REINDEX TABLE parcelas;
```

### 29. Analisar Uso de Espaço

```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;
```

### 30. Verificar Índices Não Utilizados

```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

---

## 👨‍💼 Queries Administrativas

### 31. Auditoria: Últimas Alterações em Contratos

```sql
SELECT 
  al.created_at,
  al.acao,
  u.nome AS usuario,
  u.email,
  al.dados_antigos->>'numero_contrato' AS numero_contrato,
  al.dados_novos->>'status' AS novo_status,
  al.ip_address
FROM audit_log al
LEFT JOIN users u ON u.id = al.usuario_id
WHERE al.tabela = 'contratos'
  AND al.created_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY al.created_at DESC
LIMIT 50;
```

### 32. Usuários Ativos por Perfil

```sql
SELECT 
  perfil,
  COUNT(*) AS total_usuarios,
  COUNT(*) FILTER (WHERE ultimo_acesso >= CURRENT_DATE - INTERVAL '7 days') AS ativos_ultima_semana,
  COUNT(*) FILTER (WHERE ultimo_acesso >= CURRENT_DATE - INTERVAL '30 days') AS ativos_ultimo_mes
FROM users
WHERE deleted_at IS NULL
  AND status = 'ativo'
GROUP BY perfil
ORDER BY total_usuarios DESC;
```

### 33. Notificações Não Lidas por Usuário

```sql
SELECT 
  u.nome,
  u.email,
  COUNT(n.id) AS total_nao_lidas,
  COUNT(n.id) FILTER (WHERE n.tipo = 'warning') AS warnings,
  COUNT(n.id) FILTER (WHERE n.tipo = 'error') AS errors
FROM users u
LEFT JOIN notificacoes n ON n.usuario_id = u.id 
  AND n.lida = FALSE 
  AND n.deleted_at IS NULL
WHERE u.deleted_at IS NULL
  AND u.status = 'ativo'
GROUP BY u.id
HAVING COUNT(n.id) > 0
ORDER BY total_nao_lidas DESC;
```

---

## 📌 Dicas de Performance

### Usar EXPLAIN ANALYZE

```sql
EXPLAIN ANALYZE
SELECT * FROM contratos 
WHERE empresa_id = '2s-locacoes' 
  AND status = 'ativo';
```

### Criar Índices Temporários para Queries Pesadas

```sql
CREATE INDEX CONCURRENTLY idx_temp_analise 
ON parcelas(data_vencimento, status) 
WHERE deleted_at IS NULL;

-- Após uso
DROP INDEX idx_temp_analise;
```

### Usar LIMIT em Desenvolvimento

```sql
-- Em desenvolvimento/testes, sempre use LIMIT
SELECT * FROM materiais LIMIT 100;

-- Em produção, ajuste conforme necessário
```

---

**Última atualização:** Novembro 2025  
**Mantido por:** Equipe de Desenvolvimento Grupo 2S
