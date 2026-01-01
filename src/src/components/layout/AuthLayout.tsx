import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-900 rounded-lg flex items-center justify-center mb-4">
             {/* Logo Placeholder */}
             <span className="text-white text-2xl font-bold">2S</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {title}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {subtitle}
          </p>
        </div>
        {children}
        <div className="mt-4 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Grupo 2S. Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
}
