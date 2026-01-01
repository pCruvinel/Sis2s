import { DataTable } from './shared/DataTable';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Plus, Car, Loader2, Trash2 } from 'lucide-react';
import { Badge } from './ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { useState } from 'react';
import { createClient } from '../lib/supabase/client';
import { toast } from 'sonner@2.0.3';

interface VeiculosDashboardProps {
  veiculos: any[];
  loading?: boolean;
  onAdd: () => void;
  onEdit: (veiculo: any) => void;
  onDelete: () => void;
}

export function VeiculosDashboard({ veiculos, loading, onAdd, onEdit, onDelete }: VeiculosDashboardProps) {
  const [veiculoToDelete, setVeiculoToDelete] = useState<any>(null);
  const supabase = createClient();

  const handleDelete = async () => {
    if (!veiculoToDelete) return;

    try {
      const { error } = await supabase
        .from('veiculos')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', veiculoToDelete.id);

      if (error) throw error;
      
      toast.success('Veículo removido com sucesso!');
      onDelete();
    } catch (error) {
      console.error('Erro ao excluir veículo:', error);
      toast.error('Erro ao excluir veículo.');
    } finally {
      setVeiculoToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponivel': return 'bg-green-100 text-green-700 border-green-200';
      case 'em_uso': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'manutencao': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'indisponivel': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const columns = [
    { 
        key: 'placa', 
        label: 'Placa',
        render: (item: any) => <span className="font-mono font-bold text-blue-900">{item.placa}</span>
    },
    { key: 'marca', label: 'Marca' },
    { key: 'modelo', label: 'Modelo' },
    { key: 'ano_fabricacao', label: 'Ano' },
    { key: 'tipo_veiculo', label: 'Tipo', render: (item: any) => <span className="capitalize">{item.tipo_veiculo}</span> },
    { 
        key: 'status', 
        label: 'Status',
        render: (item: any) => (
            <Badge className={`capitalize border ${getStatusColor(item.status)}`} variant="outline">
                {item.status.replace('_', ' ')}
            </Badge>
        )
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão de Veículos</h1>
            <p className="text-gray-500">Controle da frota e logística operacional</p>
        </div>
        <Button onClick={onAdd} className="bg-[#1F4788] hover:bg-blue-800">
            <Plus className="mr-2 h-4 w-4" /> Novo Veículo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 flex items-center space-x-4 border-l-4 border-l-blue-500">
            <div className="p-3 bg-blue-50 rounded-full">
                <Car className="h-6 w-6 text-blue-700" />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Total Frota</p>
                <p className="text-3xl font-bold text-gray-900">{veiculos.length}</p>
            </div>
        </Card>
         <Card className="p-6 flex items-center space-x-4 border-l-4 border-l-green-500">
            <div className="p-3 bg-green-50 rounded-full">
                <Car className="h-6 w-6 text-green-700" />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Disponíveis</p>
                <p className="text-3xl font-bold text-gray-900">{veiculos.filter(v => v.status === 'disponivel').length}</p>
            </div>
        </Card>
         <Card className="p-6 flex items-center space-x-4 border-l-4 border-l-yellow-500">
            <div className="p-3 bg-yellow-50 rounded-full">
                <Car className="h-6 w-6 text-yellow-700" />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Em Manutenção</p>
                <p className="text-3xl font-bold text-gray-900">{veiculos.filter(v => v.status === 'manutencao').length}</p>
            </div>
        </Card>
      </div>

      <Card className="p-6 overflow-hidden">
        {veiculos.length > 0 ? (
          <DataTable 
              data={veiculos} 
              columns={columns} 
              searchable 
              searchPlaceholder="Buscar por placa, marca ou modelo..."
              onEdit={onEdit}
              onDelete={(v) => setVeiculoToDelete(v)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Car className="w-16 h-16 text-gray-200 mb-4" />
            <h3 className="text-gray-900 font-medium">Nenhum veículo cadastrado</h3>
            <p className="text-gray-500 mb-6 max-w-xs">
              Sua frota aparecerá aqui após o primeiro cadastro.
            </p>
            <Button onClick={onAdd} variant="outline">
              Cadastrar Veículo
            </Button>
          </div>
        )}
      </Card>

      <AlertDialog open={!!veiculoToDelete} onOpenChange={(open) => !open && setVeiculoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Veículo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá o veículo <span className="font-bold text-gray-900">{veiculoToDelete?.placa}</span> do sistema. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Confirmar Exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
