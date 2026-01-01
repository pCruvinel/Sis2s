import { z } from 'zod';

// Enum values from Database
export const STATUS_GENERICO = ['ativo', 'inativo', 'bloqueado', 'arquivado'] as const;
export const TIPO_PESSOA = ['pessoa_fisica', 'pessoa_juridica'] as const;
export const CATEGORIA_DESPESA = [
  'fixa', 'variavel', 'folha_pagamento', 'impostos', 'aluguel', 'energia', 
  'agua', 'internet', 'telefone', 'marketing', 'manutencao', 'combustivel', 
  'alimentacao', 'outros'
] as const;
export const STATUS_PARCELA = ['pendente', 'pago', 'pago_parcial', 'atrasado', 'cancelado', 'renegociado'] as const;
export const FORMA_PAGAMENTO = [
  'dinheiro', 'pix', 'transferencia', 'ted', 'doc', 'boleto', 
  'cartao_credito', 'cartao_debito', 'cheque', 'deposito', 'outros'
] as const;
export const STATUS_MATERIAL = ['ativo', 'inativo', 'manutencao', 'bloqueado', 'danificado', 'extraviado', 'descartado'] as const;

// Schemas
export const despesaSchema = z.z.object({
  id: z.string().optional(),
  empresa_id: z.string().min(1, 'Empresa é obrigatória'),
  descricao: z.string().min(3, 'Descrição deve ter no mínimo 3 caracteres'),
  categoria: z.enum(CATEGORIA_DESPESA),
  valor: z.number().min(0.01, 'Valor deve ser maior que zero'),
  data_vencimento: z.string().min(1, 'Data de vencimento é obrigatória'),
  data_pagamento: z.string().optional().nullable(),
  status: z.enum(STATUS_PARCELA).default('pendente'),
  forma_pagamento: z.enum(FORMA_PAGAMENTO).optional().nullable(),
  fornecedor_id: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
  rateio_empresas: z.record(z.number()).optional().nullable(),
});

export const materialSchema = z.z.object({
  id: z.string().optional(),
  empresa_id: z.string().min(1, 'Empresa é obrigatória'),
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  codigo: z.string().min(1, 'Código é obrigatório'),
  descricao: z.string().optional().nullable(),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  quantidade_total: z.number().min(0, 'Quantidade não pode ser negativa'),
  quantidade_disponivel: z.number().min(0, 'Quantidade não pode ser negativa'),
  unidade_medida: z.string().default('un'),
  preco_custo: z.number().optional().nullable(),
  status: z.enum(STATUS_MATERIAL).default('ativo'),
  localizacao: z.string().optional().nullable(),
});

export type Despesa = z.infer<typeof despesaSchema>;
export type Material = z.infer<typeof materialSchema>;
