'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase/client';
import { DataTable } from '../../../../components/shared/DataTable';
import { StatusBadge } from '../../../../components/shared/StatusBadge';
import { Button } from '../../../../components/ui/button';
import { Plus, Building2 } from 'lucide-react';
import { EmpresaDialog } from '../../../../components/admin/EmpresaDialog';
import { useAuth } from '../../../../hooks/useAuth';
import { toast } from 'sonner@2.0.3';
import { LoadingSpinner } from '../../../../components/shared/LoadingSpinner';
import { Database } from '../../../../types/database';
import { EmptyState } from '../../../../components/shared/EmptyState';

type Empresa = Database['public']['Tables']['empresas']['Row'];

export default function EmpresasPage() {
  const { user, loading: authLoading } = useAuth();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);

  useEffect(() => {
    if (user?.perfil === 'admin_grupo') {
      fetchEmpresas();
    } else if (!authLoading) {
      setLoading(false); // Stop loading if not allowed, so access denied shows
    }
  }, [user, authLoading]);

  const fetchEmpresas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmpresas(data || []);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
      toast.error('Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: any) => {
    try {
      // Generate ID slug from name if not provided
      const generatedId = data.nome.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphen
        .replace(/(^-|-$)/g, ''); // Remove leading/trailing hyphens

      const payload = {
        ...data,
        id: generatedId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('empresas').insert([payload]);
      
      if (error) throw error;

      toast.success('Empresa criada com sucesso');
      fetchEmpresas();
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      toast.error('Erro ao criar empresa. O ID pode já existir.');
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingEmpresa) return;

    try {
      const payload = {
        ...data,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('empresas')
        .update(payload)
        .eq('id', editingEmpresa.id);

      if (error) throw error;

      toast.success('Empresa atualizada com sucesso');
      fetchEmpresas();
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      toast.error('Erro ao atualizar empresa');
    }
  };

  const handleDelete = async (item: Empresa) => {
    if (!confirm(`Tem certeza que deseja excluir a empresa "${item.nome}"?`)) return;
      
    try {
      const { error } = await supabase
        .from('empresas')
        .update({ 
          deleted_at: new Date().toISOString(),
          status: 'inativo' 
        })
        .eq('id', item.id);

      if (error) throw error;

      toast.success('Empresa excluída com sucesso');
      fetchEmpresas();
    } catch (error) {
      console.error('Erro ao excluir empresa:', error);
      toast.error('Erro ao excluir empresa');
    }
  };

  const handleSubmit = async (data: any) => {
    if (editingEmpresa) {
      await handleUpdate(data);
    } else {
      await handleCreate(data);
    }
  };

  if (authLoading) return <LoadingSpinner className="h-[50vh]" />;

  if (user?.perfil !== 'admin_grupo') {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
        <Building2 className="w-16 h-16 text-gray-300" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Acesso Negado</h2>
          <p className="text-gray-500 mt-2">Apenas administradores do grupo podem acessar esta página.</p>
        </div>
      </div>
    );
  }

  const columns = [
    { key: 'nome', label: 'Nome' },
    { key: 'cnpj', label: 'CNPJ' },
    { 
      key: 'tipo', 
      label: 'Tipo',
      render: (item: Empresa) => (
        <span className="capitalize px-2 py-1 bg-gray-100 rounded-md text-sm">
          {item.tipo.replace('_', ' ')}
        </span>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (item: Empresa) => <StatusBadge status={item.status} />
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Empresas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as empresas do grupo e suas configurações.
          </p>
        </div>
        <Button onClick={() => {
          setEditingEmpresa(null);
          setDialogOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Empresa
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : empresas.length === 0 ? (
        <EmptyState 
          icon={Building2}
          title="Nenhuma empresa encontrada"
          description="Comece cadastrando as empresas do grupo para iniciar a operação."
          actionLabel="Cadastrar Primeira Empresa"
          onAction={() => {
            setEditingEmpresa(null);
            setDialogOpen(true);
          }}
        />
      ) : (
        <DataTable
          data={empresas}
          columns={columns}
          onEdit={(item) => {
            setEditingEmpresa(item);
            setDialogOpen(true);
          }}
          onDelete={handleDelete}
          searchPlaceholder="Buscar empresa..."
        />
      )}

      <EmpresaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        empresa={editingEmpresa}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
