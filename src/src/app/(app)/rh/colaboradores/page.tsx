import { useState, useEffect, useCallback } from 'react';
import { useEmpresaContext } from '../../../../contexts/EmpresaContext';
import { createClient } from '../../../../lib/supabase/client';
import { DataTable } from '../../../../components/shared/DataTable';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../../../components/ui/avatar';
import { Plus, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Database } from '../../../../types/database';
import { ColaboradorFormDialog } from './ColaboradorFormDialog';
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

type Colaborador = Database['public']['Tables']['colaboradores']['Row'];
type Cargo = Database['public']['Tables']['cargos']['Row'];

export default function Colaboradores() {
  const { empresaAtiva, loading: loadingEmpresa, empresasDisponiveis } = useEmpresaContext();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [cargos, setCargos] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [colaboradorToEdit, setColaboradorToEdit] = useState<Colaborador | null>(null);
  const [colaboradorToDelete, setColaboradorToDelete] = useState<Colaborador | null>(null);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    if (!empresaAtiva?.id) return;

    try {
      setLoading(true);

      // Fetch Cargos for mapping
      const { data: cargosData } = await supabase
        .from('cargos')
        .select('id, nome')
        .eq('empresa_id', empresaAtiva.id);
      
      const cargosMap: Record<string, string> = {};
      cargosData?.forEach(c => cargosMap[c.id] = c.nome);
      setCargos(cargosMap);

      // Fetch Colaboradores
      const { data, error } = await supabase
        .from('colaboradores')
        .select('*')
        .eq('empresa_id', empresaAtiva.id)
        .neq('status', 'demitido') // Show active/vacation etc, but maybe filter out 'deleted'?
        .is('deleted_at', null)
        .order('nome');

      if (error) throw error;
      setColaboradores(data || []);
    } catch (error) {
      console.error('Erro ao buscar colaboradores:', error);
      toast.error('Erro ao carregar colaboradores.');
    } finally {
      setLoading(false);
    }
  }, [empresaAtiva?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    if (!colaboradorToDelete) return;

    try {
      // Soft delete
      const { error } = await supabase
        .from('colaboradores')
        .update({ 
            deleted_at: new Date().toISOString(),
            status: 'demitido' // Or just keep status but set deleted_at? Prompt says "Soft delete". Usually deleted_at is enough.
        })
        .eq('id', colaboradorToDelete.id);

      if (error) throw error;
      
      toast.success('Colaborador removido com sucesso!');
      fetchData();
    } catch (error) {
      console.error('Erro ao excluir colaborador:', error);
      toast.error('Erro ao excluir colaborador.');
    } finally {
      setColaboradorToDelete(null);
    }
  };

  const columns = [
    { 
      key: 'nome', 
      label: 'Colaborador',
      render: (item: Colaborador) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={item.foto_url || ''} />
            <AvatarFallback>{item.nome.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-gray-900">{item.nome}</div>
            <div className="text-sm text-gray-500">{item.email}</div>
          </div>
        </div>
      )
    },
    { 
      key: 'cargo', 
      label: 'Cargo',
      render: (item: Colaborador) => (
        <div>
           <div className="text-sm font-medium text-gray-900">
             {item.cargo_id ? cargos[item.cargo_id] || 'Cargo desconhecido' : '-'}
           </div>
           <div className="text-xs text-gray-500 capitalize">{item.tipo_contrato}</div>
        </div>
      )
    },
    { 
      key: 'rateio', 
      label: 'Rateio (RN-002)',
      render: (item: Colaborador) => {
        if (!item.rateio_empresas) return <span className="text-gray-400">-</span>;
        
        const rateio = item.rateio_empresas as Record<string, number>;
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {Object.entries(rateio).map(([empId, perc]) => {
              const emp = empresasDisponiveis.find(e => e.id === empId);
              return (
                <Badge key={empId} variant="secondary" className="text-[10px] px-1">
                  {emp?.nome.split(' ')[0]}: {perc}%
                </Badge>
              );
            })}
          </div>
        );
      }
    },
    { 
        key: 'salario',
        label: 'Salário Base',
        render: (item: Colaborador) => item.salario_base.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (item: Colaborador) => (
        <Badge variant={item.status === 'ativo' ? 'default' : 'secondary'} className="capitalize">
          {item.status?.replace('_', ' ')}
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
            <h1 className="text-gray-900 text-2xl font-semibold mb-2">Colaboradores</h1>
            <p className="text-gray-600">Gestão de equipe e rateio de custos entre empresas</p>
          </div>
          <Button 
            className="bg-[#1F4788] hover:bg-blue-800"
            onClick={() => {
              setColaboradorToEdit(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Colaborador
          </Button>
        </div>

        <Card className="p-6">
          {loading ? (
             <div className="flex justify-center py-12">
               <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
             </div>
          ) : colaboradores.length > 0 ? (
            <DataTable
              data={colaboradores}
              columns={columns}
              searchable
              searchPlaceholder="Buscar por nome, email ou CPF..."
              onEdit={(colab) => {
                setColaboradorToEdit(colab);
                setIsDialogOpen(true);
              }}
              onDelete={(colab) => setColaboradorToDelete(colab)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-gray-900 mb-2 font-medium">Nenhum colaborador cadastrado</h3>
              <p className="text-gray-600 mb-6">
                Cadastre os colaboradores e defina o rateio de custos
              </p>
              <Button 
                className="bg-[#1F4788] hover:bg-blue-800"
                onClick={() => {
                  setColaboradorToEdit(null);
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Colaborador
              </Button>
            </div>
          )}
        </Card>
      </div>

      <ColaboradorFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        colaboradorToEdit={colaboradorToEdit}
        onSuccess={fetchData}
      />

      <AlertDialog open={!!colaboradorToDelete} onOpenChange={(open) => !open && setColaboradorToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação marcará o colaborador 
              <span className="font-semibold text-gray-900"> {colaboradorToDelete?.nome} </span>
              como demitido/removido.
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
