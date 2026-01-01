import { useState } from 'react';
import { OrdensServicoDashboard } from '../../../../components/OrdensServicoDashboard';
import { MOCK_ORDENS_SERVICO, MOCK_EMPRESAS } from '../../../../data/mockData';
import { useEmpresaContext } from '../../../../contexts/EmpresaContext';

export default function OrdensServico() {
  const [ordens, setOrdens] = useState(MOCK_ORDENS_SERVICO || []);
  const [empresas] = useState(MOCK_EMPRESAS || []);
  const { empresaAtiva } = useEmpresaContext();
  const empresaAtual = empresaAtiva?.id || '1';

  const handleUpdate = () => {
    // Recarregar dados após atualização
    setOrdens([...MOCK_ORDENS_SERVICO]);
  };

  return (
    <OrdensServicoDashboard
      ordens={ordens}
      empresas={empresas}
      empresaAtual={empresaAtual}
      onUpdate={handleUpdate}
    />
  );
}