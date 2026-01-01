import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useEmpresaContext } from './EmpresaContext';

/**
 * ╔════════════════════════════════════════════════════════════════╗
 * ║  THEME CONTEXT - TEMA DINÂMICO                                 ║
 * ║  Gerencia a aplicação de cores baseada na empresa ativa.       ║
 * ║  Sincronizado com EmpresaContext.                              ║
 * ╚════════════════════════════════════════════════════════════════╝
 */

interface ThemeContextType {
  // O tema é derivado da empresa ativa, então não precisamos duplicar estado
  currentThemeClass: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { empresaAtiva } = useEmpresaContext();

  // Determinar a classe do tema baseada na empresa ativa
  // Se não houver empresa ativa, usa o fallback (Grupo 2S)
  const currentThemeClass = empresaAtiva?.className || 'theme-grupo-2s';

  useEffect(() => {
    // Aplicar a classe do tema ao elemento root (html)
    const root = document.documentElement;

    // Remover temas antigos (assumindo prefixo theme-)
    root.classList.forEach((cls) => {
      if (cls.startsWith('theme-')) {
        root.classList.remove(cls);
      }
    });

    // Adicionar novo tema
    root.classList.add(currentThemeClass);

    // Opcional: Se precisarmos forçar atualização de variáveis CSS inline 
    // (caso as classes não sejam suficientes ou para compatibilidade com código antigo)
    if (empresaAtiva) {
      root.style.setProperty('--color-primary', empresaAtiva.primary);
      root.style.setProperty('--color-secondary', empresaAtiva.secondary);
      
      // Variações de brilho (para compatibilidade com componentes legados)
      // root.style.setProperty('--color-primary-dark', adjustBrightness(empresaAtiva.primary, -20));
      // root.style.setProperty('--color-primary-light', adjustBrightness(empresaAtiva.primary, 20));
    }

  }, [currentThemeClass, empresaAtiva]);

  return (
    <ThemeContext.Provider value={{ currentThemeClass }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
}

// Helper para manipulação de cores (se necessário futuramente)
function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}
