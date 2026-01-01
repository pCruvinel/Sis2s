import { useState, useEffect, useCallback } from 'react';
import { useEmpresaContext } from '../../../../contexts/EmpresaContext';
import { createClient } from '../../../../lib/supabase/client';
import { DataTable } from '../../../../components/shared/DataTable';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Plus, Briefcase, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Database } from '../../../../types/database';
import { CargoFormDialog } from './CargoFormDialog';
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

type Cargo = Database['public']['Tables']['cargos']['Row'];

export default function Cargos() {
  const { empresaAtiva, loading: loadingEmpresa } = useEmpresaContext();
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [cargoToEdit, setCargoToEdit] = useState<Cargo | null>(null);
  const [cargoToDelete, setCargoToDelete] = useState<Cargo | null>(null);

  const supabase = createClient();

  const fetchCargos = useCallback(async () => {
    if (!empresaAtiva?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cargos')
        .select('*')
        .eq('empresa_id', empresaAtiva.id)
        .is('deleted_at', null)
        .order('nome');

      if (error) throw error;
      setCargos(data || []);
    } catch (error) {
      console.error('Erro ao buscar cargos:', error);
      toast.error('Erro ao carregar cargos.');
    } finally {
      setLoading(false);
    }
  }, [empresaAtiva?.id]);

  useEffect(() => {
    fetchCargos();
  }, [fetchCargos]);

  const handleDelete = async () => {
    if (!cargoToDelete) return;

    try {
      const { error } = await supabase
        .from('cargos')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', cargoToDelete.id);

      if (error) throw error;
      
      toast.success('Cargo removido com sucesso!');
      fetchCargos();
    } catch (error) {
      console.error('Erro ao excluir cargo:', error);
      toast.error('Erro ao excluir cargo.');
    } finally {
      setCargoToDelete(null);
    }
  };

  const columns = [
    { 
      key: 'nome', 
      label: 'Cargo' 
    },
    { 
      key: 'departamento', 
      label: 'Departamento',
      render: (item: Cargo) => item.departamento || '-'
    },
    { 
      key: 'faixa_salarial', 
      label: 'Faixa Salarial',
      render: (item: Cargo) => {
        const min = item.salario_minimo?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const max = item.salario_maximo?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        
        if (!min && !max) return '-';
        if (min && max) return `${min} - ${max}`;
        return min || max;
      }
    },
    { 
      key: 'descricao', 
      label: 'Descrição',
      render: (item: Cargo) => (
        <span className="truncate max-w-[200px] block" title={item.descricao || ''}>
          {item.descricao || '-'}
        </span>
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
            <h1 className="text-gray-900 text-2xl font-semibold mb-2">Cargos</h1>
            <p className="text-gray-600">Gerencie os cargos e faixas salariais da empresa</p>
          </div>
          <Button 
            className="bg-[#1F4788] hover:bg-blue-800"
            onClick={() => {
              setCargoToEdit(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Cargo
          </Button>
        </div>

        <Card className="p-6">
          {loading ? (
             <div className="flex justify-center py-12">
               <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
             </div>
          ) : cargos.length > 0 ? (
            <DataTable
              data={cargos}
              columns={columns}
              searchable
              searchPlaceholder="Buscar cargos..."
              onEdit={(cargo) => {
                setCargoToEdit(cargo);
                setIsDialogOpen(true);
              }}
              onDelete={(cargo) => setCargoToDelete(cargo)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Briefcase className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-gray-900 mb-2 font-medium">Nenhum cargo cadastrado</h3>
              <p className="text-gray-600 mb-6">
                Comece criando o primeiro cargo da empresa
              </p>
              <Button 
                className="bg-[#1F4788] hover:bg-blue-800"
                onClick={() => {
                  setCargoToEdit(null);
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Cargo
              </Button>
            </div>
          )}
        </Card>
      </div>

      <CargoFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        cargoToEdit={cargoToEdit}
        onSuccess={fetchCargos}
      />

      <AlertDialog open={!!cargoToDelete} onOpenChange={(open) => !open && setCargoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o cargo
              <span className="font-semibold text-gray-900"> {cargoToDelete?.nome} </span>
              e o removerá dos nossos servidores.
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
