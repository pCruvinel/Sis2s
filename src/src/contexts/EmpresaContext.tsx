/**
 * ╔════════════════════════════════════════════════════════════════╗
 * ║  CONTEXT DE EMPRESA - MULTI-TENANCY                            ║
 * ║  Gerencia a empresa ativa e aplica temas dinâmicos            ║
 * ╚════════════════════════════════════════════════════════════════╝
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { createClient } from '../lib/supabase/client';
import { Database } from '../types/database';

// Definição de temas padrão/fallback por ID conhecido
// Isso garante que mesmo sem buscar do banco, tenhamos as cores corretas para os IDs padrão
const DEFAULT_THEMES: Record<string, Partial<Empresa>> = {
  'grupo-2s': {
    primary: '#F97316', // Laranja
    primaryForeground: '#FFFFFF',
    secondary: '#FB923C',
    logo: '/logos/grupo-2s.svg',
    className: 'theme-grupo-2s',
  },
  '2s-locacoes': {
    primary: '#3B82F6', // Azul
    primaryForeground: '#FFFFFF',
    secondary: '#60A5FA',
    logo: '/logos/2s-locacoes.svg',
    className: 'theme-2s-locacoes',
  },
  '2s-marketing': {
    primary: '#3B82F6', // Azul
    primaryForeground: '#FFFFFF',
    secondary: '#8B5CF6', // Ametista
    logo: '/logos/2s-marketing.svg',
    className: 'theme-2s-marketing',
  },
  '2s-producoes': {
    primary: '#7E22CE', // Roxo
    primaryForeground: '#FFFFFF',
    secondary: '#3B82F6', // Azul
    logo: '/logos/2s-producoes.svg',
    className: 'theme-2s-producoes',
  },
};

export interface Empresa {
  id: string;
  nome: string;
  tipo: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  logo: string;
  className: string;
  acesso: 'master' | 'restrito';
}

interface EmpresaContextType {
  empresaAtiva: Empresa | null;
  empresasDisponiveis: Empresa[];
  setEmpresaAtiva: (empresaId: string) => void;
  isMasterAccess: boolean; // Se tem acesso a dados de todas as empresas (admin_grupo)
  loading: boolean;
}

const EmpresaContext = createContext<EmpresaContextType | undefined>(undefined);

interface EmpresaProviderProps {
  children: ReactNode;
}

export function EmpresaProvider({ children }: EmpresaProviderProps) {
  const { user } = useAuth();
  const [empresaAtiva, setEmpresaAtivaState] = useState<Empresa | null>(null);
  const [empresasDisponiveis, setEmpresasDisponiveis] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const loadEmpresas = async () => {
      console.log('🔄 EmpresaContext: Iniciando carregamento', { user });
      
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        let empresasData: Database['public']['Tables']['empresas']['Row'][] = [];

        // RN-001: Exceção - Usuários com perfil admin_grupo têm acesso a todas as empresas
        const isAdminGrupo = user.perfil === 'admin_grupo' || user.perfil === 'admin'; // Mantendo admin por compatibilidade

        if (isAdminGrupo) {
          console.log('👑 EmpresaContext: Usuário é admin_grupo, buscando todas as empresas');
          const { data, error } = await supabase
            .from('empresas')
            .select('*')
            .eq('status', 'ativo')
            .order('nome');
            
          if (error) throw error;
          empresasData = data || [];
        } else {
          // Busca empresas vinculadas ao usuário
          // RN-001: Usuários só podem visualizar dados da empresa à qual estão vinculados
          const empresasIds = user.empresas_ids || (user.empresa_id ? [user.empresa_id] : []);
          
          if (empresasIds.length > 0) {
            console.log('👤 EmpresaContext: Buscando empresas vinculadas', empresasIds);
            const { data, error } = await supabase
              .from('empresas')
              .select('*')
              .in('id', empresasIds)
              .eq('status', 'ativo')
              .order('nome');

            if (error) throw error;
            empresasData = data || [];
          }
        }

        // Mapear para o formato interno com temas
        const empresasMapeadas: Empresa[] = empresasData.map(emp => {
          const defaultTheme = DEFAULT_THEMES[emp.id] || {};
          
          // Prioridade: DB > Default Theme > Fallback Genérico
          return {
            id: emp.id,
            nome: emp.nome,
            tipo: emp.tipo,
            primary: emp.cor_primaria || defaultTheme.primary || '#0f172a',
            primaryForeground: '#FFFFFF', // Geralmente branco funciona bem
            secondary: emp.cor_secundaria || defaultTheme.secondary || '#94a3b8',
            logo: emp.logo_url || defaultTheme.logo || '', // URL do logo
            className: defaultTheme.className || `theme-${emp.id}`,
            acesso: (isAdminGrupo && emp.id === 'grupo-2s') ? 'master' : 'restrito'
          };
        });

        console.log('📊 EmpresaContext: Empresas disponíveis carregadas', empresasMapeadas.length);
        setEmpresasDisponiveis(empresasMapeadas);

        // Definir empresa ativa
        // 1. Tentar recuperar do localStorage
        const empresaSalvaId = typeof window !== 'undefined' ? localStorage.getItem('empresaAtiva') : null;
        const empresaSalva = empresasMapeadas.find(e => e.id === empresaSalvaId);

        if (empresaSalva) {
          console.log('✅ EmpresaContext: Restaurando empresa salva', empresaSalva.nome);
          setEmpresaAtivaState(empresaSalva);
          applyTheme(empresaSalva);
        } else if (empresasMapeadas.length > 0) {
          // 2. Se não houver salva, pegar a primeira (ou a do usuário se estiver na lista)
          const empresaPrincipal = empresasMapeadas.find(e => e.id === user.empresa_id) || empresasMapeadas[0];
          console.log('✅ EmpresaContext: Definindo empresa inicial', empresaPrincipal.nome);
          setEmpresaAtivaState(empresaPrincipal);
          applyTheme(empresaPrincipal);
        }

      } catch (error) {
        console.error('❌ EmpresaContext: Erro ao carregar empresas', error);
      } finally {
        setLoading(false);
      }
    };

    loadEmpresas();
  }, [user]);

  const applyTheme = (empresa: Empresa) => {
    if (typeof window === 'undefined') return;

    // Tenta limpar classes de tema anteriores (assumindo padrão theme-*)
    const classList = document.documentElement.classList;
    Array.from(classList).forEach(cls => {
      if (cls.startsWith('theme-')) {
        classList.remove(cls);
      }
    });

    // Adicionar classe do novo tema
    if (empresa.className) {
      document.documentElement.classList.add(empresa.className);
    }

    // Atualizar CSS variables
    document.documentElement.style.setProperty('--color-primary', empresa.primary);
    document.documentElement.style.setProperty('--color-primary-foreground', empresa.primaryForeground);
    document.documentElement.style.setProperty('--color-secondary', empresa.secondary);

    // Salvar no localStorage
    localStorage.setItem('empresaAtiva', empresa.id);
  };

  const setEmpresaAtiva = (empresaId: string) => {
    const empresa = empresasDisponiveis.find(e => e.id === empresaId);
    if (empresa) {
      console.log('🔄 EmpresaContext: Trocando para empresa', empresa.nome);
      setEmpresaAtivaState(empresa);
      applyTheme(empresa);
    }
  };

  // RN-001: Usuários com perfil admin_grupo têm acesso a todas as empresas
  const isMasterAccess = user?.perfil === 'admin_grupo' || user?.perfil === 'admin';

  const value = {
    empresaAtiva,
    empresasDisponiveis,
    setEmpresaAtiva,
    isMasterAccess,
    loading,
  };

  return (
    <EmpresaContext.Provider value={value}>
      {children}
    </EmpresaContext.Provider>
  );
}

export function useEmpresaContext() {
  const context = useContext(EmpresaContext);
  if (context === undefined) {
    throw new Error('useEmpresaContext must be used within an EmpresaProvider');
  }
  return context;
}
