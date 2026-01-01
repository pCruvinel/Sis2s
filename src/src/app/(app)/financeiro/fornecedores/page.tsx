'use client';

import { useState, useEffect, useCallback } from 'react';
import { useEmpresaContext } from '../../../../contexts/EmpresaContext';
import { DataTable } from '../../../../components/shared/DataTable';
import { Button } from '../../../../components/ui/button';
import { Plus, Building2, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { FornecedorDialog } from '../../../../components/financeiro/FornecedorDialog';
import { StatusBadge } from '../../../../components/shared/StatusBadge';
import { Card } from '../../../../components/ui/card';

// MOCK DATA for Fornecedores
const MOCK_FORNECEDORES = [
  {
    id: '1',
    nome: 'Locação Total LTDA',
    tipo: 'pessoa_juridica',
    cpf_cnpj: '22.333.444/0001-55',
    categoria_servico: 'Equipamentos de Som',
    email: 'comercial@loctotal.com',
    telefone: '(11) 5555-4444',
    status: 'ativo',
  },
  {
    id: '2',
    nome: 'Marketing Express',
    tipo: 'pessoa_juridica',
    cpf_cnpj: '33.444.555/0001-66',
    categoria_servico: 'Publicidade',
    email: 'contato@mktpress.com',
    telefone: '(11) 98888-7777',
    status: 'ativo',
  },
  {
    id: '3',
    nome: 'Auto Peças Silva',
    tipo: 'pessoa_juridica',
    cpf_cnpj: '44.555.666/0001-77',
    categoria_servico: 'Manutenção Veicular',
    email: 'oficina@silva.com',
    status: 'inativo',
  }
];

export default function Fornecedores() {
  const { empresaAtiva, loading: loadingEmpresa } = useEmpresaContext();
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [fornecedorToEdit, setFornecedorToEdit] = useState<any | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setTimeout(() => {
      setFornecedores(MOCK_FORNECEDORES);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (data: any) => {
    if (fornecedorToEdit) {
      setFornecedores(prev => prev.map(f => f.id === fornecedorToEdit.id ? { ...data, id: f.id } : f));
      toast.success('Fornecedor atualizado com sucesso!');
    } else {
      const newFornecedor = { ...data, id: Math.random().toString(36).substr(2, 9) };
      setFornecedores(prev => [newFornecedor, ...prev]);
      toast.success('Fornecedor cadastrado com sucesso!');
    }
    setIsDialogOpen(false);
  };

  const columns = [
    { 
      key: 'nome', 
      label: 'Fornecedor',
      render: (item: any) => (
        <div>
          <div className="font-medium text-gray-900">{item.nome}</div>
          <div className="text-xs text-gray-500">{item.cpf_cnpj}</div>
        </div>
      )
    },
    { 
      key: 'categoria', 
      label: 'Categoria',
      render: (item: any) => (
        <Badge variant="outline" className="bg-gray-50">
          {item.categoria_servico || 'Geral'}
        </Badge>
      )
    },
    { 
      key: 'contato', 
      label: 'Contato',
      render: (item: any) => (
        <div className="text-sm text-gray-600">
          <div>{item.email || '-'}</div>
          <div className="text-xs text-gray-400">{item.telefone || '-'}</div>
        </div>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (item: any) => <StatusBadge status={item.status} />
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
              <Building2 className="w-6 h-6 text-blue-600" />
              Fornecedores
            </h1>
            <p className="text-gray-600">Gestão de prestadores de serviços e insumos</p>
          </div>
          <Button 
            className="bg-[#1F4788] hover:bg-blue-800"
            onClick={() => {
              setFornecedorToEdit(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Fornecedor
          </Button>
        </div>

        <Card className="p-6">
          {loading ? (
             <div className="flex justify-center py-12">
               <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
             </div>
          ) : fornecedores.length > 0 ? (
            <DataTable
              data={fornecedores}
              columns={columns}
              searchable
              onEdit={(item) => {
                setFornecedorToEdit(item);
                setIsDialogOpen(true);
              }}
              onDelete={(item) => {
                if(confirm('Deseja excluir este fornecedor?')) {
                  setFornecedores(prev => prev.filter(f => f.id !== item.id));
                  toast.success('Fornecedor removido');
                }
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-gray-900 mb-2 font-medium">Nenhum fornecedor cadastrado</h3>
              <Button 
                className="bg-[#1F4788] hover:bg-blue-800"
                onClick={() => {
                  setFornecedorToEdit(null);
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Primeiro Fornecedor
              </Button>
            </div>
          )}
        </Card>
      </div>

      <FornecedorDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        fornecedor={fornecedorToEdit}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
