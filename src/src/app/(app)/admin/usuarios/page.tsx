'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase/client';
import { DataTable } from '../../../../components/shared/DataTable';
import { StatusBadge } from '../../../../components/shared/StatusBadge';
import { Button } from '../../../../components/ui/button';
import { Plus, Users, Filter, Lock } from 'lucide-react';
import { UsuarioDialog } from '../../../../components/admin/UsuarioDialog';
import { useAuth } from '../../../../hooks/useAuth';
import { toast } from 'sonner@2.0.3';
import { LoadingSpinner } from '../../../../components/shared/LoadingSpinner';
import { Database } from '../../../../types/database';
import { EmptyState } from '../../../../components/shared/EmptyState';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';

type User = Database['public']['Tables']['users']['Row'];
type Empresa = Database['public']['Tables']['empresas']['Row'];

export default function UsuariosPage() {
  const { user, loading: authLoading } = useAuth();
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<User | null>(null);
  const [empresaFilter, setEmpresaFilter] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch Empresas
      const { data: empresasData, error: empresasError } = await supabase
        .from('empresas')
        .select('*')
        .is('deleted_at', null)
        .order('nome');

      if (empresasError) throw empresasError;
      setEmpresas(empresasData || []);

      // Fetch Usuarios
      let query = supabase
        .from('users')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      // If filtering by company (and user is allowed to filter)
      if (empresaFilter !== 'all') {
        query = query.eq('empresa_id', empresaFilter);
      }

      const { data: usersData, error: usersError } = await query;

      if (usersError) throw usersError;
      setUsuarios(usersData || []);

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch users when filter changes
  useEffect(() => {
    if (!loading) {
      const fetchUsers = async () => {
        try {
          let query = supabase
            .from('users')
            .select('*')
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

          if (empresaFilter !== 'all') {
            query = query.eq('empresa_id', empresaFilter);
          }

          const { data, error } = await query;
          if (error) throw error;
          setUsuarios(data || []);
        } catch (error) {
           console.error('Erro ao filtrar usuários:', error);
        }
      };
      fetchUsers();
    }
  }, [empresaFilter]);

  const handleCreate = async (data: any) => {
    try {
      // NOTE: In a real implementation, this should call a Supabase Edge Function
      // to create the user in Auth system first.
      // For now, we simulate the DB insertion.
      
      // We need an ID. Since we can't create Auth user, we'll generate a UUID
      // This will fail if there is a foreign key constraint to auth.users
      // and the user doesn't exist there.
      // But we will try.
      const fakeId = crypto.randomUUID();

      const payload = {
        ...data,
        id: fakeId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('users').insert([payload]);
      
      if (error) {
        // If FK error, show specific message
        if (error.code === '23503') { // foreign_key_violation
            toast.error('Erro: Usuário precisa existir no sistema de Autenticação primeiro.');
        } else {
            throw error;
        }
      } else {
          toast.success('Usuário criado com sucesso');
          fetchData();
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast.error('Erro ao criar usuário');
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingUsuario) return;

    try {
      const payload = {
        ...data,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('users')
        .update(payload)
        .eq('id', editingUsuario.id);

      if (error) throw error;

      toast.success('Usuário atualizado com sucesso');
      fetchData();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error('Erro ao atualizar usuário');
    }
  };

  const handleToggleStatus = async (item: User) => {
      try {
        const newStatus = item.status === 'ativo' ? 'inativo' : 'ativo';
        const { error } = await supabase
            .from('users')
            .update({ status: newStatus })
            .eq('id', item.id);
            
        if (error) throw error;
        
        toast.success(`Usuário ${newStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso`);
        
        // Optimistic update
        setUsuarios(prev => prev.map(u => u.id === item.id ? { ...u, status: newStatus } : u));
      } catch (error) {
          console.error('Erro ao alterar status:', error);
          toast.error('Erro ao alterar status do usuário');
      }
  };

  const handleResetPassword = async (item: User) => {
      try {
          const { error } = await supabase.auth.resetPasswordForEmail(item.email, {
              redirectTo: window.location.origin + '/recuperar-senha',
          });
          
          if (error) throw error;
          
          toast.success(`Email de redefinição de senha enviado para ${item.email}`);
      } catch (error) {
          console.error('Erro ao resetar senha:', error);
          toast.error('Erro ao enviar email de redefinição');
      }
  };

  const handleSubmit = async (data: any) => {
    if (editingUsuario) {
      await handleUpdate(data);
    } else {
      await handleCreate(data);
    }
  };

  if (authLoading) return <LoadingSpinner className="h-[50vh]" />;

  const columns = [
    { key: 'nome', label: 'Nome' },
    { key: 'email', label: 'Email' },
    { 
      key: 'empresa_id', 
      label: 'Empresa',
      render: (item: User) => {
          const emp = empresas.find(e => e.id === item.empresa_id);
          return emp ? emp.nome : '-';
      }
    },
    { 
      key: 'perfil', 
      label: 'Perfil',
      render: (item: User) => (
        <span className="capitalize px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-200">
          {item.perfil.replace('_', ' ')}
        </span>
      )
    },
    { 
        key: 'status', 
        label: 'Status',
        render: (item: User) => <StatusBadge status={item.status || 'inativo'} />
    },
    {
        key: 'actions',
        label: 'Ações Extras',
        render: (item: User) => (
            <div className="flex gap-2">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    title="Resetar Senha"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleResetPassword(item);
                    }}
                >
                    <Lock className="w-4 h-4 text-gray-500" />
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    title={item.status === 'ativo' ? "Desativar" : "Ativar"}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(item);
                    }}
                >
                    <div className={`w-3 h-3 rounded-full ${item.status === 'ativo' ? 'bg-green-500' : 'bg-red-500'}`} />
                </Button>
            </div>
        )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os usuários, seus perfis e permissões de acesso.
          </p>
        </div>
        <Button onClick={() => {
          setEditingUsuario(null);
          setDialogOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="w-4 h-4" />
            <span>Filtrar por Empresa:</span>
        </div>
        <Select value={empresaFilter} onValueChange={setEmpresaFilter}>
            <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Todas as empresas" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Todas as empresas</SelectItem>
                {empresas.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.nome}</SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>

      {loading && usuarios.length === 0 ? (
        <LoadingSpinner />
      ) : usuarios.length === 0 ? (
        <EmptyState 
          icon={Users}
          title="Nenhum usuário encontrado"
          description="Cadastre os usuários do sistema."
          actionLabel="Cadastrar Usuário"
          onAction={() => {
            setEditingUsuario(null);
            setDialogOpen(true);
          }}
        />
      ) : (
        <DataTable
          data={usuarios}
          columns={columns}
          onEdit={(item) => {
            setEditingUsuario(item);
            setDialogOpen(true);
          }}
          searchPlaceholder="Buscar por nome ou email..."
        />
      )}

      <UsuarioDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        usuario={editingUsuario}
        empresas={empresas}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
