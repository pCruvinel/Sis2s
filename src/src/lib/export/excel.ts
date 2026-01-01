/**
 * Exporta dados para formato compatível com Excel (XLS via HTML)
 * Substitui bibliotecas pesadas como exceljs/xlsx
 */
export async function exportToExcel<T extends Record<string, any>>(
  data: T[],
  columns: { key: keyof T; header: string; width?: number }[],
  fileName: string = 'export.xls',
  sheetName: string = 'Dados'
) {
  // Construir tabela HTML
  let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
  html += '<head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>' + sheetName + '</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>';
  html += '<table border="1">';
  
  // Cabeçalho com estilo básico
  html += '<tr style="background-color: #1F4788; color: white; font-weight: bold;">';
  columns.forEach(col => {
    html += `<th style="padding: 10px;">${col.header}</th>`;
  });
  html += '</tr>';

  // Dados
  data.forEach((item, index) => {
    const bg = index % 2 === 0 ? '#FFFFFF' : '#F5F5F5';
    html += `<tr style="background-color: ${bg};">`;
    columns.forEach(col => {
      let value = item[col.key];
      if (value === null || value === undefined) value = '';
      
      // Tratar tipos específicos
      if (typeof value === 'number') {
        value = value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
      } else if (value instanceof Date) {
        value = value.toLocaleDateString('pt-BR');
      } else if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
      
      html += `<td style="padding: 5px;">${value}</td>`;
    });
    html += '</tr>';
  });

  html += '</table></body></html>';

  // Criar Blob
  const blob = new Blob([html], {
    type: 'application/vnd.ms-excel;charset=utf-8'
  });
  
  // Download
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  // Forçar extensão .xls
  link.download = fileName.replace(/\.xlsx?$/, '.xls');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// Funções específicas de exportação
export async function exportContratos(contratos: any[]) {
  const data = contratos.map((contrato) => ({
    numero: contrato.numero || contrato.numero_contrato || '-',
    tipo: contrato.tipo === 'cliente' ? 'Cliente' : 'Fornecedor',
    nome: contrato.cliente_nome || contrato.cliente?.nome_razao_social || '-',
    valor: contrato.valor_total,
    data_inicio: contrato.data_inicio ? new Date(contrato.data_inicio).toLocaleDateString('pt-BR') : '-',
    data_fim: contrato.data_fim ? new Date(contrato.data_fim).toLocaleDateString('pt-BR') : 'Indeterminado',
    status: contrato.status,
  }));

  await exportToExcel(
    data,
    [
      { key: 'numero', header: 'Número', width: 15 },
      { key: 'tipo', header: 'Tipo', width: 12 },
      { key: 'nome', header: 'Cliente/Fornecedor', width: 30 },
      { key: 'valor', header: 'Valor Total', width: 15 },
      { key: 'data_inicio', header: 'Data Início', width: 15 },
      { key: 'data_fim', header: 'Data Fim', width: 15 },
      { key: 'status', header: 'Status', width: 12 },
    ],
    `contratos_${new Date().toISOString().split('T')[0]}.xls`,
    'Contratos'
  );
}

export async function exportColaboradores(colaboradores: any[]) {
  const data = colaboradores.map((colab) => ({
    nome: colab.nome,
    cpf: colab.cpf,
    cargo: colab.cargo_nome || colab.cargo?.nome || '-',
    salario: colab.salario_base,
    data_admissao: colab.data_admissao ? new Date(colab.data_admissao).toLocaleDateString('pt-BR') : '-',
    status: colab.status,
    email: colab.email || '-',
    telefone: colab.telefone || '-',
  }));

  await exportToExcel(
    data,
    [
      { key: 'nome', header: 'Nome', width: 30 },
      { key: 'cpf', header: 'CPF', width: 15 },
      { key: 'cargo', header: 'Cargo', width: 20 },
      { key: 'salario', header: 'Salário', width: 15 },
      { key: 'data_admissao', header: 'Admissão', width: 15 },
      { key: 'status', header: 'Status', width: 12 },
      { key: 'email', header: 'Email', width: 25 },
      { key: 'telefone', header: 'Telefone', width: 15 },
    ],
    `colaboradores_${new Date().toISOString().split('T')[0]}.xls`,
    'Colaboradores'
  );
}

export async function exportMateriais(materiais: any[]) {
  const data = materiais.map((mat) => ({
    codigo: mat.codigo || '-',
    nome: mat.nome,
    categoria: mat.categoria || mat.categoria?.nome || '-',
    estoque_atual: mat.quantidade_total || mat.estoque_atual,
    disponivel: mat.quantidade_disponivel,
    bloqueado: mat.quantidade_bloqueada || 0,
    valor_unitario: mat.valor_unitario || 0,
    status: mat.status,
  }));

  await exportToExcel(
    data,
    [
      { key: 'codigo', header: 'Código', width: 15 },
      { key: 'nome', header: 'Nome', width: 30 },
      { key: 'categoria', header: 'Categoria', width: 20 },
      { key: 'estoque_atual', header: 'Total', width: 15 },
      { key: 'disponivel', header: 'Disponível', width: 15 },
      { key: 'bloqueado', header: 'Bloqueado', width: 15 },
      { key: 'valor_unitario', header: 'Valor Un.', width: 15 },
      { key: 'status', header: 'Status', width: 12 },
    ],
    `materiais_${new Date().toISOString().split('T')[0]}.xls`,
    'Materiais'
  );
}

export async function exportDespesas(despesas: any[]) {
  const data = despesas.map((desp) => ({
    descricao: desp.descricao,
    categoria: desp.categoria,
    valor: desp.valor_total || desp.valor,
    data: desp.data || desp.data_vencimento ? new Date(desp.data || desp.data_vencimento).toLocaleDateString('pt-BR') : '-',
    tipo_rateio: desp.tipo_rateio || '-',
    status: desp.status,
  }));

  await exportToExcel(
    data,
    [
      { key: 'descricao', header: 'Descrição', width: 30 },
      { key: 'categoria', header: 'Categoria', width: 15 },
      { key: 'valor', header: 'Valor', width: 15 },
      { key: 'data', header: 'Data', width: 15 },
      { key: 'tipo_rateio', header: 'Rateio', width: 15 },
      { key: 'status', header: 'Status', width: 12 },
    ],
    `despesas_${new Date().toISOString().split('T')[0]}.xls`,
    'Despesas'
  );
}

export async function exportOrdensServico(ordens: any[]) {
  const data = ordens.map((os) => ({
    numero: os.numero,
    cliente: os.cliente_nome,
    tipo: os.tipo || '-',
    data_inicio: os.data_inicio ? new Date(os.data_inicio).toLocaleDateString('pt-BR') : '-',
    data_fim: os.data_fim ? new Date(os.data_fim).toLocaleDateString('pt-BR') : '-',
    status: os.status,
    responsavel: os.responsavel,
    valor: os.valor_total || os.valor || 0,
  }));

  await exportToExcel(
    data,
    [
      { key: 'numero', header: 'Número OS', width: 15 },
      { key: 'cliente', header: 'Cliente', width: 30 },
      { key: 'tipo', header: 'Tipo', width: 20 },
      { key: 'data_inicio', header: 'Data Início', width: 15 },
      { key: 'data_fim', header: 'Data Fim', width: 15 },
      { key: 'status', header: 'Status', width: 15 },
      { key: 'responsavel', header: 'Responsável', width: 25 },
      { key: 'valor', header: 'Valor Total', width: 15 },
    ],
    `ordens_servico_${new Date().toISOString().split('T')[0]}.xls`,
    'Ordens de Serviço'
  );
}
