import { useState } from 'react';
import { PontoDashboard } from '../../../../components/PontoDashboard';
import { MOCK_REGISTROS_PONTO_30_DIAS } from '../../../../data/mockPontoData';
import { useAuth } from '../../../../hooks/useAuth';

export default function Ponto() {
  const [registros, setRegistros] = useState(MOCK_REGISTROS_PONTO_30_DIAS || []);
  const { user } = useAuth();
  const perfilUsuario = user?.perfil || 'operacional';

  const handleUpdate = () => {
    // Recarregar dados após atualização
    setRegistros([...MOCK_REGISTROS_PONTO_30_DIAS]);
  };

  return (
    <PontoDashboard
      registros={registros}
      perfilUsuario={perfilUsuario}
    />
  );
}