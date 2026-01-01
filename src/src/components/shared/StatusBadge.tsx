'use client';

import { Badge } from '../ui/badge';

interface StatusBadgeProps {
  status: string;
}

// Inline utils
const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    ativo: 'Ativo',
    inativo: 'Inativo',
    pago: 'Pago',
    pendente: 'Pendente',
    inadimplente: 'Inadimplente',
    concluido: 'Concluído',
    concluida: 'Concluída',
    cancelado: 'Cancelado',
    cancelada: 'Cancelada',
    criada: 'Criada',
    bloqueado: 'Bloqueado',
    arquivado: 'Arquivado',
    prospeccao: 'Prospecção',
  };
  return labels[status] || status;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const getVariant = (status: string): 'default' | 'secondary' | 'success' | 'destructive' | 'warning' | 'outline' => {
    if (status === 'ativo' || status === 'pago' || status === 'concluido' || status === 'concluida') {
      return 'success';
    }
    if (status === 'inativo' || status === 'cancelado' || status === 'cancelada') {
      return 'secondary';
    }
    if (status === 'pendente' || status === 'criada') {
      return 'warning';
    }
    if (status === 'inadimplente' || status === 'bloqueado') {
      return 'destructive';
    }
    if (status === 'arquivado') {
      return 'secondary';
    }
    if (status === 'prospeccao') {
      return 'outline'; // or default/secondary
    }
    return 'default';
  };

  return (
    <Badge variant={getVariant(status)}>
      {getStatusLabel(status)}
    </Badge>
  );
}
