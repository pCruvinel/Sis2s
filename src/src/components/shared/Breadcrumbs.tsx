import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeMap: Record<string, string> = {
  dashboard: 'Dashboard',
  financeiro: 'Financeiro',
  contratos: 'Contratos',
  despesas: 'Despesas',
  rh: 'Recursos Humanos',
  colaboradores: 'Colaboradores',
  cargos: 'Cargos',
  ponto: 'Ponto Eletrônico',
  operacional: 'Operacional',
  veiculos: 'Veículos',
  estoque: 'Estoque',
  materiais: 'Materiais',
  admin: 'Administração',
  usuarios: 'Usuários',
  empresas: 'Empresas',
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center text-sm text-gray-500 mb-4">
      <Link 
        to="/dashboard" 
        className="flex items-center hover:text-gray-900 transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const label = routeMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-4 h-4 mx-2" />
            {isLast ? (
              <span className="font-medium text-gray-900">{label}</span>
            ) : (
              <Link 
                to={to} 
                className="hover:text-gray-900 transition-colors"
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
