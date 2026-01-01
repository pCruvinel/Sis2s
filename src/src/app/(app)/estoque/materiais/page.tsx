'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useEmpresaContext } from '../../../../contexts/EmpresaContext';
import { DataTable } from '../../../../components/shared/DataTable';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Plus, Package, Loader2, AlertTriangle, Layers, ArrowDownUp } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { MaterialDialog } from '../../../../components/estoque/MaterialDialog';
import { type Material } from '../../../../lib/schemas';
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

// MOCK DATA for Materiais
const MOCK_MATERIAIS: Material[] = [
  {
    id: '1',
    empresa_id: '1',
    nome: 'Cabo XLR 5m Neutrik',
    codigo: 'CAB-XLR-001',
    categoria: 'Áudio',
    quantidade_total: 50,
    quantidade_disponivel: 42,
    unidade_medida: 'un',
    preco_custo: 85.00,
    status: 'ativo',
    localizacao: 'Prateleira A1'
  },
  {
    id: '2',
    empresa_id: '1',
    nome: 'Microfone Shure SM58',
    codigo: 'MIC-SM58-002',
    categoria: 'Áudio',
    quantidade_total: 12,
    quantidade_disponivel: 8,
    unidade_medida: 'un',
    preco_custo: 750.00,
    status: 'ativo',
    localizacao: 'Armário B2'
  },
  {
    id: '3',
    empresa_id: '1',
    nome: 'Fita Gaffer Preta 50mm',
    codigo: 'SUP-GAF-003',
    categoria: 'Suprimentos',
    quantidade_total: 20,
    quantidade_disponivel: 5,
    unidade_medida: 'un',
    preco_custo: 120.00,
    status: 'ativo',
    localizacao: 'Gaveta C1'
  },
  {
    id: '4',
    empresa_id: '1',
    nome: 'Refletor LED Par 64',
    codigo: 'ILU-PAR64-004',
    categoria: 'Iluminação',
    quantidade_total: 24,
    quantidade_disponivel: 24,
    unidade_medida: 'un',
    preco_custo: 450.00,
    status: 'manutencao',
    localizacao: 'Prateleira D4'
  }
];

export default function Materiais() {
  const { empresaAtiva, loading: loadingEmpresa } = useEmpresaContext();
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [materialToEdit, setMaterialToEdit] = useState<Material | null>(null);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setTimeout(() => {
      setMateriais(MOCK_MATERIAIS);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (data: Material) => {
    if (materialToEdit) {
      setMateriais(prev => prev.map(m => m.id === materialToEdit.id ? { ...data, id: m.id } : m));
      toast.success('Material atualizado com sucesso!');
    } else {
      const newMaterial = { ...data, id: Math.random().toString(36).substr(2, 9) };
      setMateriais(prev => [newMaterial, ...prev]);
      toast.success('Material cadastrado com sucesso!');
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!materialToDelete) return;
    setMateriais(prev => prev.filter(m => m.id !== materialToDelete.id));
    toast.success('Material excluído com sucesso!');
    setMaterialToDelete(null);
  };

  const stats = useMemo(() => {
    const totalItens = materiais.reduce((acc, m) => acc + m.quantidade_total, 0);
    const baixoEstoque = materiais.filter(m => m.quantidade_disponivel <= 5).length;
    const emManutencao = materiais.filter(m => m.status === 'manutencao').length;
    return { totalItens, baixoEstoque, emManutencao };
  }, [materiais]);

  const columns = [
    { 
      key: 'nome', 
      label: 'Material',
      render: (item: Material) => (
        <div>
          <div className="font-medium text-gray-900">{item.nome}</div>
          <div className="text-xs text-gray-500">{item.codigo}</div>
        </div>
      )
    },
    { 
      key: 'categoria', 
      label: 'Categoria',
      render: (item: Material) => (
        <Badge variant="outline" className="bg-gray-50">
          {item.categoria}
        </Badge>
      )
    },
    { 
      key: 'quantidade', 
      label: 'Estoque (Disp/Total)',
      render: (item: Material) => (
        <div className="flex items-center gap-2">
          <span className={`font-medium ${item.quantidade_disponivel <= 5 ? 'text-red-600' : 'text-gray-900'}`}>
            {item.quantidade_disponivel}
          </span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">{item.quantidade_total}</span>
          <span className="text-xs text-gray-500 uppercase">{item.unidade_medida}</span>
        </div>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (item: Material) => (
        <Badge 
          variant={
            item.status === 'ativo' ? 'success' : 
            item.status === 'manutencao' ? 'warning' : 
            'secondary' as any
          } 
          className="capitalize"
        >
          {item.status}
        </Badge>
      )
    },
    { 
      key: 'localizacao', 
      label: 'Localização',
      render: (item: Material) => (
        <span className="text-sm text-gray-600">{item.localizacao || '-'}</span>
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
              <Package className="w-6 h-6 text-blue-600" />
              Estoque de Materiais
            </h1>
            <p className="text-gray-600">Gestão de equipamentos, suprimentos e patrimônio</p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" className="border-gray-200">
              <ArrowDownUp className="w-4 h-4 mr-2" />
              Movimentação
            </Button>
            <Button 
              className="bg-[#1F4788] hover:bg-blue-800"
              onClick={() => {
                setMaterialToEdit(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Material
            </Button>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total de Itens</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalItens}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Baixo Estoque</p>
                <p className="text-xl font-bold text-gray-900">{stats.baixoEstoque} itens</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Em Manutenção</p>
                <p className="text-xl font-bold text-gray-900">{stats.emManutencao} itens</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          {loading ? (
             <div className="flex justify-center py-12">
               <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
             </div>
          ) : materiais.length > 0 ? (
            <DataTable
              data={materiais}
              columns={columns}
              searchable
              searchPlaceholder="Buscar por nome, código ou categoria..."
              onEdit={(item) => {
                setMaterialToEdit(item);
                setIsDialogOpen(true);
              }}
              onDelete={(item) => setMaterialToDelete(item)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-gray-900 mb-2 font-medium">Nenhum material cadastrado</h3>
              <p className="text-gray-600 mb-6">
                Organize seu estoque cadastrando seus equipamentos e insumos
              </p>
              <Button 
                className="bg-[#1F4788] hover:bg-blue-800"
                onClick={() => {
                  setMaterialToEdit(null);
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Primeiro Material
              </Button>
            </div>
          )}
        </Card>
      </div>

      <MaterialDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        initialData={materialToEdit || { empresa_id: empresaAtiva?.id || '1' }}
        title={materialToEdit ? 'Editar Material' : 'Novo Material'}
      />

      <AlertDialog open={!!materialToDelete} onOpenChange={(open) => !open && setMaterialToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Material</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o material 
              <span className="font-semibold text-gray-900"> {materialToDelete?.nome} </span>?
              Esta ação removerá o registro permanentemente.
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
