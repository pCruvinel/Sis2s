'use client';

import { useState, useEffect, useCallback } from 'react';
import { useEmpresaContext } from '../../../../contexts/EmpresaContext';
import { DataTable } from '../../../../components/shared/DataTable';
import { Button } from '../../../../components/ui/button';
import { Plus, FileText, Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { formatCurrency } from '../../../../lib/utils';

// MOCK DATA for Contratos
const MOCK_CONTRATOS = [
  {
    id: '1',
    numero_contrato: 'CNT-2026-001',
    tipo: 'cliente',
    descricao: 'Prestação de Serviços de Locação de Som e Luz',
    valor_total: 25000.00,
    data_inicio: '2026-01-01',
    data_fim: '2026-12-31',
    status: 'ativo',
    cliente_nome: 'Empresa Alpha'
  },
  {
    id: '2',
    numero_contrato: 'CNT-2026-002',
    tipo: 'fornecedor',
    descricao: 'Manutenção de Infraestrutura',
    valor_total: 12000.00,
    data_inicio: '2026-02-01',
    data_fim: '2027-01-31',
    status: 'em_negociacao',
    fornecedor_nome: 'Locação Total LTDA'
  }
];

export default function Contratos() {
  const { empresaAtiva, loading: loadingEmpresa } = useEmpresaContext();
  const [contratos, setContratos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setTimeout(() => {
      setContratos(MOCK_CONTRATOS);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = [
    { 
      key: 'numero', 
      label: 'Número/Ref',
      render: (item: any) => (
        <div>
          <div className="font-medium text-gray-900">{item.numero_contrato}</div>
          <div className="text-xs text-gray-500 capitalize">{item.tipo}</div>
        </div>
      )
    },
    { 
      key: 'descricao', 
      label: 'Descrição',
      render: (item: any) => (
        <div className="max-w-xs truncate" title={item.descricao}>
          {item.descricao}
        </div>
      )
    },
    { 
      key: 'parceiro', 
      label: 'Cliente/Fornecedor',
      render: (item: any) => item.cliente_nome || item.fornecedor_nome || '-'
    },
    { 
      key: 'vigencia', 
      label: 'Vigência',
      render: (item: any) => (
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Calendar className="w-3 h-3" />
          {new Date(item.data_inicio).toLocaleDateString('pt-BR')} - {item.data_fim ? new Date(item.data_fim).toLocaleDateString('pt-BR') : 'Indeterminado'}
        </div>
      )
    },
    { 
      key: 'valor', 
      label: 'Valor Total',
      render: (item: any) => (
        <span className="font-medium">{formatCurrency(item.valor_total)}</span>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (item: any) => (
        <Badge variant={item.status === 'ativo' ? 'success' : 'secondary' as any} className="capitalize">
          {item.status.replace('_', ' ')}
        </Badge>
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
              <FileText className="w-6 h-6 text-blue-600" />
              Contratos
            </h1>
            <p className="text-gray-600">Gestão de contratos de clientes e fornecedores</p>
          </div>
          <Button 
            className="bg-[#1F4788] hover:bg-blue-800"
            onClick={() => toast.info('Funcionalidade de novo contrato em migração')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Contrato
          </Button>
        </div>

        <Card className="p-6">
          {loading ? (
             <div className="flex justify-center py-12">
               <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
             </div>
          ) : contratos.length > 0 ? (
            <DataTable
              data={contratos}
              columns={columns}
              searchable
              searchPlaceholder="Buscar por número ou descrição..."
              onEdit={() => toast.info('Edição de contrato em migração')}
              onDelete={() => toast.info('Exclusão de contrato em migração')}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-gray-900 mb-2 font-medium">Nenhum contrato encontrado</h3>
              <Button 
                className="bg-[#1F4788] hover:bg-blue-800"
                onClick={() => toast.info('Funcionalidade de novo contrato em migração')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Contrato
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
