'use client';

import { useState, useEffect, useCallback } from 'react';
import { useEmpresaContext } from '../../../../contexts/EmpresaContext';
import { DataTable } from '../../../../components/shared/DataTable';
import { Button } from '../../../../components/ui/button';
import { Plus, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ClienteDialog } from '../../../../components/financeiro/ClienteDialog';
import { StatusBadge } from '../../../../components/shared/StatusBadge';
import { Card } from '../../../../components/ui/card';

// MOCK DATA for Clientes
const MOCK_CLIENTES = [
  {
    id: '1',
    nome: 'Empresa de Eventos Alpha',
    tipo: 'pessoa_juridica',
    cpf_cnpj: '12.345.678/0001-90',
    email: 'contato@alpha.com',
    telefone: '(11) 4004-0000',
    status: 'ativo',
    endereco_completo: { cidade: 'São Paulo', estado: 'SP' }
  },
  {
    id: '2',
    nome: 'João Silva Produções',
    tipo: 'pessoa_fisica',
    cpf_cnpj: '123.456.789-00',
    email: 'joao@silva.com',
    telefone: '(11) 99999-8888',
    status: 'prospeccao',
    endereco_completo: { cidade: 'Rio de Janeiro', estado: 'RJ' }
  },
  {
    id: '3',
    nome: 'Prefeitura de Santos',
    tipo: 'pessoa_juridica',
    cpf_cnpj: '98.765.432/0001-10',
    email: 'licitacao@santos.sp.gov.br',
    telefone: '(13) 3201-0000',
    status: 'inadimplente',
    endereco_completo: { cidade: 'Santos', estado: 'SP' }
  }
];

export default function Clientes() {
  const { empresaAtiva, loading: loadingEmpresa } = useEmpresaContext();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [clienteToEdit, setClienteToEdit] = useState<any | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setTimeout(() => {
      setClientes(MOCK_CLIENTES);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (data: any) => {
    if (clienteToEdit) {
      setClientes(prev => prev.map(c => c.id === clienteToEdit.id ? { ...data, id: c.id } : c));
      toast.success('Cliente atualizado com sucesso!');
    } else {
      const newCliente = { ...data, id: Math.random().toString(36).substr(2, 9) };
      setClientes(prev => [newCliente, ...prev]);
      toast.success('Cliente cadastrado com sucesso!');
    }
    setIsDialogOpen(false);
  };

  const columns = [
    { 
      key: 'nome', 
      label: 'Cliente',
      render: (item: any) => (
        <div>
          <div className="font-medium text-gray-900">{item.nome}</div>
          <div className="text-xs text-gray-500">{item.cpf_cnpj}</div>
        </div>
      )
    },
    { 
      key: 'contato', 
      label: 'Contato',
      render: (item: any) => (
        <div className="text-sm">
          <div>{item.email}</div>
          <div className="text-xs text-gray-500">{item.telefone}</div>
        </div>
      )
    },
    { 
      key: 'localizacao', 
      label: 'Localização',
      render: (item: any) => (
        <span className="text-sm text-gray-600">
          {item.endereco_completo?.cidade}/{item.endereco_completo?.estado}
        </span>
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
              <Users className="w-6 h-6 text-blue-600" />
              Clientes
            </h1>
            <p className="text-gray-600">Gestão de clientes e parcerias</p>
          </div>
          <Button 
            className="bg-[#1F4788] hover:bg-blue-800"
            onClick={() => {
              setClienteToEdit(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        </div>

        <Card className="p-6">
          {loading ? (
             <div className="flex justify-center py-12">
               <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
             </div>
          ) : clientes.length > 0 ? (
            <DataTable
              data={clientes}
              columns={columns}
              searchable
              onEdit={(item) => {
                setClienteToEdit(item);
                setIsDialogOpen(true);
              }}
              onDelete={(item) => {
                if(confirm('Deseja excluir este cliente?')) {
                  setClientes(prev => prev.filter(c => c.id !== item.id));
                  toast.success('Cliente removido');
                }
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-gray-900 mb-2 font-medium">Nenhum cliente cadastrado</h3>
              <Button 
                className="bg-[#1F4788] hover:bg-blue-800"
                onClick={() => {
                  setClienteToEdit(null);
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Primeiro Cliente
              </Button>
            </div>
          )}
        </Card>
      </div>

      <ClienteDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        cliente={clienteToEdit}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
