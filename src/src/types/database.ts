export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      empresas: {
        Row: {
          id: string
          nome: string
          tipo: Database['public']['Enums']['tipo_empresa']
          status: Database['public']['Enums']['status_generico']
          cnpj: string | null
          inscricao_estadual: string | null
          inscricao_municipal: string | null
          nome_fantasia: string | null
          razao_social: string | null
          telefone: string | null
          telefone_secundario: string | null
          email: string | null
          site: string | null
          endereco_completo: Json | null
          dados_bancarios: Json | null
          cor_primaria: string | null
          cor_secundaria: string | null
          logo_url: string | null
          logo_url_white: string | null
          timbrado_url: string | null
          configuracoes: Json | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id: string
          nome: string
          tipo: Database['public']['Enums']['tipo_empresa']
          status?: Database['public']['Enums']['status_generico']
          cnpj?: string | null
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          nome_fantasia?: string | null
          razao_social?: string | null
          telefone?: string | null
          telefone_secundario?: string | null
          email?: string | null
          site?: string | null
          endereco_completo?: Json | null
          dados_bancarios?: Json | null
          cor_primaria?: string | null
          cor_secundaria?: string | null
          logo_url?: string | null
          logo_url_white?: string | null
          timbrado_url?: string | null
          configuracoes?: Json | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['empresas']['Insert']>
      }
      users: {
        Row: {
          id: string
          email: string
          nome: string
          empresa_id: string | null
          empresas_ids: string[] | null
          perfil: Database['public']['Enums']['perfil_usuario']
          permissoes_customizadas: Json | null
          telefone: string | null
          avatar_url: string | null
          status: Database['public']['Enums']['status_generico'] | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id: string
          email: string
          nome: string
          empresa_id?: string | null
          empresas_ids?: string[] | null
          perfil: Database['public']['Enums']['perfil_usuario']
          permissoes_customizadas?: Json | null
          telefone?: string | null
          avatar_url?: string | null
          status?: Database['public']['Enums']['status_generico'] | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      clientes: {
        Row: {
          id: string
          empresa_id: string
          tipo: Database['public']['Enums']['tipo_pessoa']
          nome: string
          nome_fantasia: string | null
          cpf_cnpj: string
          rg_ie: string | null
          email: string | null
          telefone: string | null
          whatsapp: string | null
          endereco_completo: Json | null
          dados_bancarios: Json | null
          observacoes: string | null
          status: Database['public']['Enums']['status_cliente']
          created_at: string | null
          updated_at: string | null
          created_by: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          empresa_id: string
          tipo: Database['public']['Enums']['tipo_pessoa']
          nome: string
          nome_fantasia?: string | null
          cpf_cnpj: string
          rg_ie?: string | null
          email?: string | null
          telefone?: string | null
          whatsapp?: string | null
          endereco_completo?: Json | null
          dados_bancarios?: Json | null
          observacoes?: string | null
          status?: Database['public']['Enums']['status_cliente']
          created_at?: string | null
          updated_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['clientes']['Insert']>
      }
      fornecedores: {
        Row: {
          id: string
          empresa_id: string
          tipo: Database['public']['Enums']['tipo_pessoa']
          nome: string
          nome_fantasia: string | null
          cpf_cnpj: string
          rg_ie: string | null
          categoria_servico: string | null
          email: string | null
          telefone: string | null
          endereco_completo: Json | null
          dados_bancarios: Json | null
          observacoes: string | null
          status: Database['public']['Enums']['status_generico']
          created_at: string | null
          updated_at: string | null
          created_by: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          empresa_id: string
          tipo: Database['public']['Enums']['tipo_pessoa']
          nome: string
          nome_fantasia?: string | null
          cpf_cnpj: string
          rg_ie?: string | null
          categoria_servico?: string | null
          email?: string | null
          telefone?: string | null
          endereco_completo?: Json | null
          dados_bancarios?: Json | null
          observacoes?: string | null
          status?: Database['public']['Enums']['status_generico']
          created_at?: string | null
          updated_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['fornecedores']['Insert']>
      }
      cargos: {
        Row: {
          id: string
          empresa_id: string
          nome: string
          descricao: string | null
          departamento: string | null
          salario_minimo: number | null
          salario_maximo: number | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          empresa_id: string
          nome: string
          descricao?: string | null
          departamento?: string | null
          salario_minimo?: number | null
          salario_maximo?: number | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['cargos']['Insert']>
      }
      colaboradores: {
        Row: {
          id: string
          empresa_id: string
          nome: string
          cpf: string
          rg: string | null
          data_nascimento: string
          genero: string | null
          estado_civil: string | null
          email: string | null
          email_corporativo: string | null
          telefone: string | null
          celular: string | null
          endereco_completo: Json | null
          tipo_contrato: Database['public']['Enums']['tipo_contrato_colaborador']
          cargo_id: string | null
          departamento: string | null
          matricula: string | null
          salario_base: number
          vale_transporte: number | null
          vale_alimentacao: number | null
          plano_saude: number | null
          outros_beneficios: Json | null
          data_admissao: string
          data_demissao: string | null
          data_ultimo_reajuste: string | null
          rateio_empresas: Json | null
          dados_bancarios: Json | null
          documentos_urls: Json | null
          foto_url: string | null
          horas_contratadas_dia: number | null
          dias_trabalho_semana: number | null
          horario_entrada: string | null
          horario_saida: string | null
          status: Database['public']['Enums']['status_colaborador'] | null
          observacoes: string | null
          created_at: string | null
          updated_at: string | null
          created_by: string | null
          deleted_at: string | null
        }
        Insert: {
            id?: string
            empresa_id: string
            nome: string
            cpf: string
            rg?: string | null
            data_nascimento: string
            genero?: string | null
            estado_civil?: string | null
            email?: string | null
            email_corporativo?: string | null
            telefone?: string | null
            celular?: string | null
            endereco_completo?: Json | null
            tipo_contrato: Database['public']['Enums']['tipo_contrato_colaborador']
            cargo_id?: string | null
            departamento?: string | null
            matricula?: string | null
            salario_base: number
            vale_transporte?: number | null
            vale_alimentacao?: number | null
            plano_saude?: number | null
            outros_beneficios?: Json | null
            data_admissao: string
            data_demissao?: string | null
            data_ultimo_reajuste?: string | null
            rateio_empresas?: Json | null
            dados_bancarios?: Json | null
            documentos_urls?: Json | null
            foto_url?: string | null
            horas_contratadas_dia?: number | null
            dias_trabalho_semana?: number | null
            horario_entrada?: string | null
            horario_saida?: string | null
            status?: Database['public']['Enums']['status_colaborador'] | null
            observacoes?: string | null
            created_at?: string | null
            updated_at?: string | null
            created_by?: string | null
            deleted_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['colaboradores']['Insert']>
      }
      contratos: {
        Row: {
            id: string
            empresa_id: string
            numero_contrato: string
            tipo: Database['public']['Enums']['tipo_contrato']
            cliente_id: string | null
            fornecedor_id: string | null
            descricao: string | null
            objeto: string | null
            valor_total: number
            desconto: number | null
            acrescimo: number | null
            data_inicio: string
            data_fim: string | null
            data_assinatura: string | null
            tipo_parcelamento: Database['public']['Enums']['tipo_parcelamento']
            numero_parcelas: number | null
            dia_vencimento: number | null
            renovacao_automatica: boolean | null
            meses_renovacao: number | null
            arquivo_pdf_url: string | null
            arquivos_anexos: Json | null
            status: Database['public']['Enums']['status_contrato'] | null
            observacoes: string | null
            clausulas_especiais: string | null
            created_at: string | null
            updated_at: string | null
            created_by: string | null
            deleted_at: string | null
        }
        Insert: {
            id?: string
            empresa_id: string
            numero_contrato: string
            tipo: Database['public']['Enums']['tipo_contrato']
            cliente_id?: string | null
            fornecedor_id?: string | null
            descricao?: string | null
            objeto?: string | null
            valor_total: number
            desconto?: number | null
            acrescimo?: number | null
            data_inicio: string
            data_fim?: string | null
            data_assinatura?: string | null
            tipo_parcelamento: Database['public']['Enums']['tipo_parcelamento']
            numero_parcelas?: number | null
            dia_vencimento?: number | null
            renovacao_automatica?: boolean | null
            meses_renovacao?: number | null
            arquivo_pdf_url?: string | null
            arquivos_anexos?: Json | null
            status?: Database['public']['Enums']['status_contrato'] | null
            observacoes?: string | null
            clausulas_especiais?: string | null
            created_at?: string | null
            updated_at?: string | null
            created_by?: string | null
            deleted_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['contratos']['Insert']>
      }
      parcelas: {
        Row: {
            id: string
            contrato_id: string
            numero_parcela: number
            descricao: string | null
            valor: number
            valor_pago: number | null
            multa: number | null
            juros: number | null
            desconto: number | null
            data_vencimento: string
            data_pagamento: string | null
            forma_pagamento: Database['public']['Enums']['forma_pagamento_enum'] | null
            comprovante_url: string | null
            numero_documento: string | null
            status: Database['public']['Enums']['status_parcela'] | null
            observacoes: string | null
            created_at: string | null
            updated_at: string | null
            pago_por: string | null
            deleted_at: string | null
        }
        Insert: {
            id?: string
            contrato_id: string
            numero_parcela: number
            descricao?: string | null
            valor: number
            valor_pago?: number | null
            multa?: number | null
            juros?: number | null
            desconto?: number | null
            data_vencimento: string
            data_pagamento?: string | null
            forma_pagamento?: Database['public']['Enums']['forma_pagamento_enum'] | null
            comprovante_url?: string | null
            numero_documento?: string | null
            status?: Database['public']['Enums']['status_parcela'] | null
            observacoes?: string | null
            created_at?: string | null
            updated_at?: string | null
            pago_por?: string | null
            deleted_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['parcelas']['Insert']>
      }
      veiculos: {
        Row: {
          id: string
          empresa_id: string
          placa: string
          modelo: string
          marca: string
          ano: string
          tipo: Database['public']['Enums']['tipo_veiculo']
          status: Database['public']['Enums']['status_veiculo']
          km_atual: string
          combustivel: Database['public']['Enums']['tipo_combustivel']
          cor: string | null
          renavam: string | null
          chassi: string | null
          foto_url: string | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          empresa_id: string
          placa: string
          modelo: string
          marca: string
          ano: string
          tipo?: Database['public']['Enums']['tipo_veiculo']
          status?: Database['public']['Enums']['status_veiculo']
          km_atual?: string
          combustivel?: Database['public']['Enums']['tipo_combustivel']
          cor?: string | null
          renavam?: string | null
          chassi?: string | null
          foto_url?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['veiculos']['Insert']>
      }
    }
    Enums: {
      perfil_usuario: 'admin_grupo' | 'admin' | 'gestor' | 'financeiro' | 'rh' | 'operacional' | 'cliente'
      status_generico: 'ativo' | 'inativo' | 'bloqueado' | 'arquivado'
      tipo_empresa: 'grupo' | '2s_locacoes' | '2s_marketing' | '2s_producoes'
      tipo_pessoa: 'pessoa_fisica' | 'pessoa_juridica'
      status_contrato: 'ativo' | 'concluido' | 'cancelado' | 'suspenso' | 'em_negociacao'
      tipo_contrato: 'cliente' | 'fornecedor' | 'parceria'
      tipo_parcelamento: 'mensal' | 'quinzenal' | 'semanal' | 'personalizado' | 'vista'
      status_parcela: 'pendente' | 'pago' | 'pago_parcial' | 'atrasado' | 'cancelado' | 'renegociado'
      forma_pagamento_enum: 'dinheiro' | 'pix' | 'transferencia' | 'ted' | 'doc' | 'boleto' | 'cartao_credito' | 'cartao_debito' | 'cheque' | 'deposito' | 'outros'
      categoria_despesa: 'fixa' | 'variavel' | 'folha_pagamento' | 'impostos' | 'aluguel' | 'energia' | 'agua' | 'internet' | 'telefone' | 'marketing' | 'manutencao' | 'combustivel' | 'alimentacao' | 'outros'
      tipo_contrato_colaborador: 'pj' | 'clt' | 'estagiario' | 'temporario' | 'autonomo'
      status_colaborador: 'ativo' | 'inativo' | 'ferias' | 'licenca_medica' | 'licenca_maternidade' | 'afastado' | 'demitido'
      status_ponto: 'normal' | 'falta' | 'falta_justificada' | 'atraso' | 'hora_extra' | 'meio_periodo' | 'home_office'
      status_pagamento: 'pendente' | 'processando' | 'pago' | 'cancelado' | 'estornado'
      status_material: 'ativo' | 'inativo' | 'manutencao' | 'bloqueado' | 'danificado' | 'extraviado' | 'descartado'
      tipo_vinculacao: 'locacao' | 'consumo' | 'patrimonio' | 'revenda'
      status_ordem_servico: 'criada' | 'aprovada' | 'em_andamento' | 'em_montagem' | 'montada' | 'em_desmontagem' | 'concluida' | 'cancelada' | 'reagendada'
      status_veiculo: 'disponivel' | 'em_uso' | 'manutencao' | 'reservado' | 'indisponivel' | 'ativo' | 'inativo'
      tipo_veiculo: 'carro' | 'moto' | 'van' | 'caminhao' | 'onibus'
      tipo_combustivel: 'gasolina' | 'etanol' | 'flex' | 'diesel' | 'eletrico' | 'hibrido'
      status_nota_fiscal: 'emitida' | 'enviada' | 'cancelada' | 'inutilizada' | 'denegada'
      status_cliente: 'ativo' | 'inativo' | 'inadimplente' | 'bloqueado' | 'prospeccao'
      tipo_historico_material: 'entrada' | 'saida' | 'ajuste' | 'bloqueio' | 'desbloqueio' | 'transferencia' | 'baixa' | 'devolucao'
    }
  }
}