import { useState, useEffect, useCallback } from 'react';
import { useEmpresaContext } from '../../../../contexts/EmpresaContext';
import { createClient } from '../../../../lib/supabase/client';
import { VeiculosDashboard } from '../../../components/VeiculosDashboard';
import { VeiculoFormDialog } from './VeiculoFormDialog';
import { toast } from 'sonner@2.0.3';
import { Loader2 } from 'lucide-react';

export default function Veiculos() {
  const { empresaAtiva, loading: loadingEmpresa } = useEmpresaContext();
  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [veiculoToEdit, setVeiculoToEdit] = useState(null);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    if (!empresaAtiva?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('veiculos')
        .select('*')
        .eq('empresa_id', empresaAtiva.id)
        .is('deleted_at', null)
        .order('modelo');

      if (error) throw error;
      setVeiculos(data || []);
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
      toast.error('Erro ao carregar veículos.');
    } finally {
      setLoading(false);
    }
  }, [empresaAtiva?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loadingEmpresa) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <VeiculosDashboard
        veiculos={veiculos}
        loading={loading}
        onAdd={() => {
          setVeiculoToEdit(null);
          setIsDialogOpen(true);
        }}
        onEdit={(veiculo) => {
          setVeiculoToEdit(veiculo);
          setIsDialogOpen(true);
        }}
        onDelete={fetchData}
      />

      <VeiculoFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        veiculoToEdit={veiculoToEdit}
        onSuccess={fetchData}
      />
    </>
  );
}
