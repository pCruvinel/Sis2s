'use client';

import { useAuthContext } from '../contexts/AuthContext';

interface User {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  empresa_id?: string;
  empresas_ids?: string[];
}

export function useAuth() {
  const { user: supabaseUser, profile, loading } = useAuthContext();

  // Se não houver perfil carregado ainda, retorna null
  if (!profile) {
    return { user: null, loading };
  }

  // Mapeia o perfil do Supabase para o formato esperado pela aplicação
  const user: User = {
    id: profile.id,
    nome: profile.nome,
    email: profile.email,
    perfil: profile.perfil,
    empresa_id: profile.empresa_id || undefined,
    empresas_ids: profile.empresas_ids || undefined,
  };

  return { user, loading };
}
