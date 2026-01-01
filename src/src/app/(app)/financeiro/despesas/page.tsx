'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useEmpresaContext } from '../../../../contexts/EmpresaContext';
import { DataTable } from '../../../../components/shared/DataTable';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Plus, DollarSign, Loader2, TrendingDown, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { DespesaDialog } from '../../../../components/financeiro/DespesaDialog';
import { type Despesa } from '../../../../lib/schemas';
import { formatCurrency } from '../../../../lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../../components/ui/alert-dialog';

// MOCK DATA for Despesas (ready for Supabase migration)
const MOCK_DESPESAS: Despesa[] = [
  {
    id: '1',
    empresa_id: '1',
    descricao: 'Aluguel Escritório Central',
    categoria: 'aluguel',
    valor: 5500.00,
    data_vencimento: '2026-01-10',
    status: 'pago',
    forma_pagamento: 'boleto',
    observacoes: 'Referente ao mês de Janeiro/2026',
    rateio_empresas: { '1': 40, '2': 30, '3': 30 }
  },
  {
    id: '2',
    empresa_id: '1',
    descricao: 'Energia Elétrica - Dezembro',
    categoria: 'energia',
    valor: 1250.45,
    data_vencimento: '2026-01-15',
    status: 'pendente',
    forma_pagamento: 'pix',
  },
  {
    id: '3',
    empresa_id: '1',
    descricao: 'Internet Fibra Óptica',
    categoria: 'internet',
    valor: 299.90,
    data_vencimento: '2026-01-20',
    status: 'pendente',
    forma_pagamento: 'transferencia',
  },
  {
    id: '4',
    empresa_id: '1',
    descricao: 'Manutenção de Ar Condicionado',
    categoria: 'manutencao',
    valor: 450.00,
    data_vencimento: '2026-01-05',
    status: 'pago',
    forma_pagamento: 'dinheiro',
  }
];

export default function Despesas() {
  const { empresaAtiva, loading: loadingEmpresa } = useEmpresaContext();
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [despesaToEdit, setDespesaToEdit] = useState<Despesa | null>(null);
  const [despesaToDelete, setDespesaToDelete] = useState<Despesa | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    // Simulating API call with mock data
    setTimeout(() => {
      setDespesas(MOCK_DESPESAS);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (data: Despesa) => {
    // In a real migration, we would call Supabase here
    if (despesaToEdit) {
      setDespesas(prev => prev.map(d => d.id === despesaToEdit.id ? { ...data, id: d.id } : d));
      toast.success('Despesa atualizada com sucesso!');
    } else {
      const newDespesa = { ...data, id: Math.random().toString(36).substr(2, 9) };
      setDespesas(prev => [newDespesa, ...prev]);
      toast.success('Despesa cadastrada com sucesso!');
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!despesaToDelete) return;
    setDespesas(prev => prev.filter(d => d.id !== despesaToDelete.id));
    toast.success('Despesa excluída com sucesso!');
    setDespesaToDelete(null);
  };

  const stats = useMemo(() => {
    const total = despesas.reduce((acc, d) => acc + d.valor, 0);
    const pendente = despesas.filter(d => d.status === 'pendente').reduce((acc, d) => acc + d.valor, 0);
    const pago = despesas.filter(d => d.status === 'pago').reduce((acc, d) => acc + d.valor, 0);
    return { total, pendente, pago };
  }, [despesas]);

  const columns = [
    { 
      key: 'descricao', 
      label: 'Descrição',
      render: (item: Despesa) => (
        <div>
          <div className="font-medium text-gray-900">{item.descricao}</div>
          <div className="text-xs text-gray-500 uppercase">{item.categoria}</div>
        </div>
      )
    },
    { 
      key: 'data_vencimento', 
      label: 'Vencimento',
      render: (item: Despesa) => new Date(item.data_vencimento).toLocaleDateString('pt-BR')
    },
    { 
      key: 'valor', 
      label: 'Valor',
      render: (item: Despesa) => (
        <span className="font-medium text-gray-900">{formatCurrency(item.valor)}</span>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (item: Despesa) => (
        <Badge variant={item.status === 'pago' ? 'success' : 'warning' as any} className="capitalize">
          {item.status.replace('_', ' ')}
        </Badge>
      )
    },
    { 
      key: 'rateio', 
      label: 'Rateio',
      render: (item: Despesa) => item.rateio_empresas ? (
        <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
          Ativo
        </Badge>
      ) : (
        <span className="text-gray-400">Não</span>
      )
    },
  ];

  if (loadingEmpresa) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-gray-900 text-2xl font-semibold mb-2 flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-red-500" />
              Despesas
            </h1>
            <p className="text-gray-600">Acompanhamento e gestão de custos operacionais</p>
          </div>
          <Button 
            className="bg-[#1F4788] hover:bg-blue-800"
            onClick={() => {
              setDespesaToEdit(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Despesa
          </Button>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Despesas</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.total)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">A Pagar (Pendente)</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.pendente)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pago</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.pago)}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          {loading ? (
             <div className="flex justify-center py-12">
               <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
             </div>
          ) : despesas.length > 0 ? (
            <DataTable
              data={despesas}
              columns={columns}
              searchable
              searchPlaceholder="Buscar por descrição ou categoria..."
              onEdit={(item) => {
                setDespesaToEdit(item);
                setIsDialogOpen(true);
              }}
              onDelete={(item) => setDespesaToDelete(item)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <DollarSign className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-gray-900 mb-2 font-medium">Nenhuma despesa encontrada</h3>
              <p className="text-gray-600 mb-6">
                Registre suas despesas para ter controle financeiro
              </p>
              <Button 
                className="bg-[#1F4788] hover:bg-blue-800"
                onClick={() => {
                  setDespesaToEdit(null);
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Despesa
              </Button>
            </div>
          )}
        </Card>
      </div>

      <DespesaDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        initialData={despesaToEdit || { empresa_id: empresaAtiva?.id || '1' }}
        title={despesaToEdit ? 'Editar Despesa' : 'Nova Despesa'}
      />

      <AlertDialog open={!!despesaToDelete} onOpenChange={(open) => !open && setDespesaToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Despesa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a despesa 
              <span className="font-semibold text-gray-900"> {despesaToDelete?.descricao} </span>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
