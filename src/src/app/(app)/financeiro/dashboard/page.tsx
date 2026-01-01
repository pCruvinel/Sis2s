'use client';

import { useMemo, useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, FileText, PieChart, BarChart, AlertTriangle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { useAuth } from '../../../../hooks/useAuth';
import { formatCurrency } from '../../../../lib/utils';
import { createClient } from '../../../../lib/supabase/client';
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Bar,
  ComposedChart,
  Line,
  Legend,
  Cell,
  Pie,
  PieChart as RechartsPieChart
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '../../../../components/ui/chart';

export default function DashboardFinanceiroPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [contratos, setContratos] = useState<any[]>([]);
  const [parcelas, setParcelas] = useState<any[]>([]);
  const [despesas, setDespesas] = useState<any[]>([]);
  const [empresaNome, setEmpresaNome] = useState('');
  
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth()));
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.empresa_id) return;

      setLoading(true);
      const supabase = createClient();

      try {
        // Fetch Empresa Name
        const { data: empresaData } = await supabase
          .from('empresas')
          .select('nome')
          .eq('id', user.empresa_id)
          .single();
        
        if (empresaData) setEmpresaNome(empresaData.nome);

        // Fetch Contratos (Receitas)
        const { data: contratosData, error: contratosError } = await supabase
          .from('contratos')
          .select('*, clientes(nome_razao_social)')
          .eq('status', 'ativo')
          .eq('empresa_id', user.empresa_id);

        if (contratosError) throw contratosError;
        setContratos(contratosData || []);

        // Fetch Parcelas (Receitas Detalhadas)
        if (contratosData && contratosData.length > 0) {
            const contratoIds = contratosData.map(c => c.id);
            const { data: parcelasData, error: parcelasError } = await supabase
                .from('parcelas')
                .select('*')
                .in('contrato_id', contratoIds)
                .order('data_vencimento', { ascending: true });
            
            if (parcelasError) throw parcelasError;
            setParcelas(parcelasData || []);
        } else {
            setParcelas([]);
        }

        // Fetch Despesas (Custos)
        const { data: despesasData, error: despesasError } = await supabase
          .from('despesas')
          .select('*')
          .order('data_vencimento', { ascending: false });

        if (despesasError) throw despesasError;
        setDespesas(despesasData || []);

      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.empresa_id]);

  // Process Data
  const stats = useMemo(() => {
    if (!user?.empresa_id) return null;

    const month = parseInt(selectedMonth);
    const year = parseInt(selectedYear);
    const today = new Date();

    // 1. Receita (Baseada em Parcelas)
    // Filtra parcelas do mês/ano selecionado
    const parcelasMes = parcelas.filter(p => {
        const d = new Date(p.data_vencimento);
        return d.getMonth() === month && d.getFullYear() === year;
    });

    // Receita Potencial (Soma dos valores das parcelas do mês)
    const receitaMensalPotencial = parcelasMes.reduce((acc, p) => acc + (p.valor || 0), 0);

    // Receita Realizada (O que efetivamente entrou)
    const receitaMensalRealizada = parcelasMes
        .filter(p => p.status === 'pago' || p.status === 'pago_parcial')
        .reduce((acc, p) => acc + (p.valor_pago || (p.status === 'pago' ? p.valor : 0) || 0), 0);

    // Inadimplência (Vencidos e não pagos no período)
    const parcelasInadimplentes = parcelasMes.filter(p => {
        const d = new Date(p.data_vencimento);
        // É inadimplente se a data de vencimento é anterior a hoje E não está pago
        // Se estamos olhando um mês passado, qualquer coisa não paga é inadimplência
        // Se estamos olhando mês futuro, nada é inadimplente
        return d < today && p.status !== 'pago' && p.status !== 'pago_parcial' && p.status !== 'cancelado';
    });

    const valorInadimplencia = parcelasInadimplentes.reduce((acc, p) => acc + (p.valor || 0), 0);
    const countInadimplencia = parcelasInadimplentes.length;

    // Receita Total (Soma de todos os contratos ativos para referência - Valor Total do Contrato)
    const valorTotalContratos = contratos.reduce((acc, c) => acc + (c.valor_total || 0), 0);
    
    // 2. Despesas
    let despesaTotal = 0;
    let despesasComRateio = 0;
    const despesasProcessadas: any[] = [];

    despesas.forEach(d => {
      let valorConsiderado = 0;
      let isRateio = false;

      if (d.rateio_empresas) {
        // Se tem rateio, verifica se a empresa atual está incluída
        try {
          const rateio = typeof d.rateio_empresas === 'string' ? JSON.parse(d.rateio_empresas) : d.rateio_empresas;
          const userEmpresaIdStr = String(user.empresa_id);
          
          if (rateio && userEmpresaIdStr in rateio) {
            const percentual = rateio[userEmpresaIdStr];
            valorConsiderado = (d.valor * percentual) / 100;
            isRateio = true;
          } else if (String(d.empresa_id) === userEmpresaIdStr) {
             // Criado por mim, mas não estou no rateio? 
          }
        } catch (e) {
          console.error('Erro ao parsear rateio', e);
        }
      } else {
        // Sem rateio, se for da minha empresa, considera custo total
        if (String(d.empresa_id) === String(user.empresa_id)) {
          valorConsiderado = d.valor;
        }
      }

      if (valorConsiderado > 0) {
        despesaTotal += valorConsiderado;
        if (isRateio) despesasComRateio++;
        despesasProcessadas.push({ ...d, valor_considerado: valorConsiderado });
      }
    });

    // Despesa do Mês Selecionado
    const despesaMensalAtual = despesasProcessadas
        .filter(d => {
            const date = new Date(d.data_vencimento);
            return date.getMonth() === month && date.getFullYear() === year;
        })
        .reduce((acc, d) => acc + d.valor_considerado, 0);

    const lucroMensal = receitaMensalPotencial - despesaMensalAtual;
    const margemLucro = receitaMensalPotencial > 0 ? (lucroMensal / receitaMensalPotencial) * 100 : 0;

    return {
      receitaMensalAtual: receitaMensalPotencial,
      receitaRealizada: receitaMensalRealizada,
      valorInadimplencia,
      countInadimplencia,
      valorTotalContratos,
      despesaTotal,
      despesaMensalAtual,
      lucroMensal,
      margemLucro,
      contratosAtivos: contratos.length,
      despesasComRateio,
      despesasProcessadas
    };
  }, [contratos, parcelas, despesas, user?.empresa_id, selectedMonth, selectedYear]);

  // Prepare Chart Data
  const monthlyData = useMemo(() => {
    const months: Record<string, { name: string; receita: number; despesa: number }> = {};
    const selectedDate = new Date(parseInt(selectedYear), parseInt(selectedMonth), 1);
    
    // Initialize last 6 months ending in selected month
    for (let i = 5; i >= 0; i--) {
      const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = { 
        name: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }), 
        receita: 0, 
        despesa: 0 
      };
    }

    // Populate Receita (Based on Parcelas)
    parcelas.forEach(p => {
        const date = new Date(p.data_vencimento);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (months[key]) {
            // Se pago, usa valor pago, senão usa valor da parcela (projeção)
            const valor = (p.status === 'pago' || p.status === 'pago_parcial') && p.valor_pago 
                ? p.valor_pago 
                : p.valor;
            months[key].receita += valor;
        }
    });

    // Populate Despesas
    stats?.despesasProcessadas.forEach(d => {
      const date = new Date(d.data_vencimento);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (months[key]) {
        months[key].despesa += d.valor_considerado;
      }
    });

    return Object.values(months);
  }, [parcelas, stats?.despesasProcessadas, selectedMonth, selectedYear]);

  const categoryData = useMemo(() => {
      const cats: Record<string, number> = {};
      stats?.despesasProcessadas.forEach(d => {
          const cat = d.categoria === 'fixa' ? 'Despesas Fixas' : 
                      d.categoria === 'variavel' ? 'Despesas Variáveis' : 
                      d.categoria === 'folha_pagamento' ? 'Folha de Pagamento' : 'Outros';
          cats[cat] = (cats[cat] || 0) + d.valor_considerado;
      });
      return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [stats?.despesasProcessadas]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Carregando dashboard...</div>;
  }

  if (!stats) return <div>Erro ao carregar dados.</div>;

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-gray-900 mb-2 flex items-center gap-2 text-2xl font-bold">
            <DollarSign className="w-8 h-8 text-[#28A745]" />
            Dashboard Financeiro
          </h1>
          <p className="text-gray-600">Visão geral das finanças - {empresaNome}</p>
        </div>

        <div className="flex gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[140px] bg-white">
                    <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                    {Array.from({ length: 12 }).map((_, i) => (
                        <SelectItem key={i} value={String(i)}>
                            {new Date(0, i).toLocaleString('pt-BR', { month: 'long' }).charAt(0).toUpperCase() + new Date(0, i).toLocaleString('pt-BR', { month: 'long' }).slice(1)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[100px] bg-white">
                    <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                    {Array.from({ length: 5 }).map((_, i) => {
                        const y = new Date().getFullYear() - 2 + i;
                        return (
                            <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-50">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Receita Potencial</p>
          <p className="text-2xl text-gray-900 font-bold">{formatCurrency(stats.receitaMensalAtual)}</p>
          <p className="text-xs text-green-600 mt-2">
            Realizada: {formatCurrency(stats.receitaRealizada)}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-red-50">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Despesas</p>
          <p className="text-2xl text-gray-900 font-bold">{formatCurrency(stats.despesaMensalAtual)}</p>
          <p className="text-xs text-gray-600 mt-2">
            {stats.despesasComRateio} via rateio
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-50">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Lucro Estimado</p>
          <p className={`text-2xl font-bold ${stats.lucroMensal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(stats.lucroMensal)}
          </p>
          <p className="text-xs text-gray-600 mt-2">
            {stats.margemLucro.toFixed(1)}% margem
          </p>
        </Card>

        <Card className="p-6 border-red-200 bg-red-50/50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-red-100">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Inadimplência</p>
          <p className="text-2xl text-red-600 font-bold">{formatCurrency(stats.valorInadimplencia)}</p>
          <p className="text-xs text-red-500 mt-2">
            {stats.countInadimplencia} faturas vencidas
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-orange-50">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Contratos Ativos</p>
          <p className="text-2xl text-gray-900 font-bold">{stats.contratosAtivos}</p>
          <p className="text-xs text-blue-600 mt-2">
            Total: {formatCurrency(stats.valorTotalContratos)}
          </p>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Receita vs Despesa */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Fluxo de Caixa (Últimos 6 Meses)</CardTitle>
            <CardDescription>Projeção baseada em faturas e despesas</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
              receita: { label: "Receita", color: "#22c55e" },
              despesa: { label: "Despesa", color: "#ef4444" }
            }} className="h-[300px]">
              <ComposedChart data={monthlyData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={10} 
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                   tickLine={false} 
                   axisLine={false} 
                   tickFormatter={(val) => `R$${val/1000}k`}
                   style={{ fontSize: '12px' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend content={<ChartLegendContent />} />
                <Bar dataKey="receita" fill="var(--color-receita)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                <Line type="monotone" dataKey="despesa" stroke="var(--color-despesa)" strokeWidth={2} dot={true} />
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Despesas por Categoria */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Distribuição de Despesas</CardTitle>
            <CardDescription>Por categoria principal</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
              "Despesas Fixas": { label: "Fixas", color: "#3b82f6" },
              "Despesas Variáveis": { label: "Variáveis", color: "#f59e0b" },
              "Folha de Pagamento": { label: "Folha", color: "#8b5cf6" },
              "Outros": { label: "Outros", color: "#94a3b8" }
            }} className="h-[300px]">
              <RechartsPieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                        entry.name === 'Despesas Fixas' ? '#3b82f6' :
                        entry.name === 'Despesas Variáveis' ? '#f59e0b' :
                        entry.name === 'Folha de Pagamento' ? '#8b5cf6' : '#94a3b8'
                    } />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend content={<ChartLegendContent />} />
              </RechartsPieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Listas Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
           <CardHeader>
            <CardTitle>Últimos Contratos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contratos.slice(0, 5).map(c => (
                <div key={c.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{c.numero_contrato}</p>
                    <p className="text-xs text-gray-500">{c.clientes?.nome_razao_social}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatCurrency(c.valor_total)}</p>
                    <Badge variant="outline" className="text-[10px]">{c.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

         <Card>
           <CardHeader>
            <CardTitle>Últimas Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.despesasProcessadas.slice(0, 5).map((d: any) => (
                <div key={d.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-sm truncate max-w-[200px]">{d.descricao}</p>
                    <p className="text-xs text-gray-500">{d.categoria}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatCurrency(d.valor_considerado)}</p>
                    {d.rateio_empresas && <Badge variant="secondary" className="text-[10px]">Rateado</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
