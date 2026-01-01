import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { EmpresaProvider } from './src/contexts/EmpresaContext';
import LoginPage from './src/app/(auth)/login/page.tsx';
import RecuperarSenhaPage from './src/app/(auth)/recuperar-senha/page.tsx';
import Dashboard from './src/app/(app)/dashboard/page.tsx';
import ContratosPage from './src/app/(app)/financeiro/contratos/page.tsx';
import ClientesPage from './src/app/(app)/financeiro/clientes/page.tsx';
import FornecedoresPage from './src/app/(app)/financeiro/fornecedores/page.tsx';
import DespesasPage from './src/app/(app)/financeiro/despesas/page.tsx';
import FinanceiroDashboardPage from './src/app/(app)/financeiro/dashboard/page.tsx';
import AdminDashboardPage from './src/app/(app)/admin/dashboard/page.tsx';
import EmpresasPage from './src/app/(app)/admin/empresas/page.tsx';
import UsuariosPage from './src/app/(app)/admin/usuarios/page.tsx';
import CatalogosPage from './src/app/(app)/catalogos/page.tsx';
import MeusContratosPage from './src/app/(app)/cliente/meus-contratos/page.tsx';
import NotasFiscaisPage from './src/app/(app)/cliente/notas-fiscais/page.tsx';
import EstoqueMateriaisPage from './src/app/(app)/estoque/materiais/page.tsx';
import OrdensServicoPage from './src/app/(app)/operacional/ordens-servico/page.tsx';
import VeiculosPage from './src/app/(app)/operacional/veiculos/page.tsx';
import RhCargosPage from './src/app/(app)/rh/cargos/page.tsx';
import RhColaboradoresPage from './src/app/(app)/rh/colaboradores/page.tsx';
import RhDashboardPage from './src/app/(app)/rh/dashboard/page.tsx';
import RhFolhaPagamentoPage from './src/app/(app)/rh/folha-pagamento/page.tsx';
import RhPagamentosPage from './src/app/(app)/rh/pagamentos/page.tsx';
import RhPontoPage from './src/app/(app)/rh/ponto/page.tsx';
import { Sidebar } from './src/components/layout/Sidebar';
import { Header } from './src/components/layout/Header';
import { Loader2 } from 'lucide-react';
import { Sheet, SheetContent } from './src/components/ui/sheet';
import { Toaster } from './src/components/ui/sonner';
import './src/styles/globals.css';

// Componente para rotas protegidas
function ProtectedRoute() {
  const { session, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// Layout principal da aplicação
function AppLayout() {
  const { user, profile, signOut } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const userData = profile ? {
    ...profile,
    empresa_id: profile.empresa_id || '1',
    perfil: profile.perfil || 'cliente',
    nome: profile.nome || user?.email?.split('@')[0] || 'Usuário',
    email: user?.email || '',
  } : {
    nome: user?.user_metadata?.nome || user?.email?.split('@')[0] || 'Usuário',
    email: user?.email || '',
    perfil: user?.user_metadata?.perfil || 'cliente',
    empresa_id: user?.user_metadata?.empresa_id || '1',
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar Desktop */}
      <div className="hidden lg:block h-full">
        <Sidebar 
          user={userData} 
          currentPath={location.pathname} 
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      </div>

      {/* Sidebar Mobile (Sheet) */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64 border-r-0">
           <Sidebar 
            user={userData} 
            currentPath={location.pathname} 
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <EmpresaProvider>
        <ThemeProvider>
          <Router>
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/recuperar-senha" element={<RecuperarSenhaPage />} />
              
              {/* Rotas Protegidas */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                  <Route path="/admin/empresas" element={<EmpresasPage />} />
                  <Route path="/admin/usuarios" element={<UsuariosPage />} />
                  <Route path="/catalogos" element={<CatalogosPage />} />
                  <Route path="/cliente/meus-contratos" element={<MeusContratosPage />} />
                  <Route path="/cliente/notas-fiscais" element={<NotasFiscaisPage />} />
                  <Route path="/estoque/materiais" element={<EstoqueMateriaisPage />} />
                  <Route path="/financeiro/clientes" element={<ClientesPage />} />
                  <Route path="/financeiro/contratos" element={<ContratosPage />} />
                  <Route path="/financeiro/dashboard" element={<FinanceiroDashboardPage />} />
                  <Route path="/financeiro/despesas" element={<DespesasPage />} />
                  <Route path="/financeiro/fornecedores" element={<FornecedoresPage />} />
                  <Route path="/operacional/ordens" element={<OrdensServicoPage />} />
                  <Route path="/operacional/veiculos" element={<VeiculosPage />} />
                  <Route path="/rh/cargos" element={<RhCargosPage />} />
                  <Route path="/rh/colaboradores" element={<RhColaboradoresPage />} />
                  <Route path="/rh/dashboard" element={<RhDashboardPage />} />
                  <Route path="/rh/folha-pagamento" element={<RhFolhaPagamentoPage />} />
                  <Route path="/rh/pagamentos" element={<RhPagamentosPage />} />
                  <Route path="/rh/ponto" element={<RhPontoPage />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>
          <Toaster />
        </ThemeProvider>
      </EmpresaProvider>
    </AuthProvider>
  );
}