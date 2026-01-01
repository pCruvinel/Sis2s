'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form@7.55.0';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Database } from '../../types/database';
import { isValidCPF, isValidCNPJ } from '../../utils/validators';

type Fornecedor = Database['public']['Tables']['fornecedores']['Row'];

const fornecedorSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  tipo: z.enum(['pessoa_fisica', 'pessoa_juridica']),
  cpf_cnpj: z.string().min(11, "Documento inválido").refine((val) => {
    const cleaned = val.replace(/\D/g, '');
    return cleaned.length === 11 ? isValidCPF(val) : isValidCNPJ(val);
  }, "CPF ou CNPJ inválido"),
  nome_fantasia: z.string().optional().or(z.literal('')),
  rg_ie: z.string().optional().or(z.literal('')),
  categoria_servico: z.string().optional().or(z.literal('')),
  email: z.string().email("Email inválido").optional().or(z.literal('')),
  telefone: z.string().optional().or(z.literal('')),
  
  // Endereço
  endereco_cep: z.string().optional().or(z.literal('')),
  endereco_logradouro: z.string().optional().or(z.literal('')),
  endereco_numero: z.string().optional().or(z.literal('')),
  endereco_bairro: z.string().optional().or(z.literal('')),
  endereco_cidade: z.string().optional().or(z.literal('')),
  endereco_estado: z.string().optional().or(z.literal('')),
  
  // Dados Bancários
  banco_nome: z.string().optional().or(z.literal('')),
  banco_agencia: z.string().optional().or(z.literal('')),
  banco_conta: z.string().optional().or(z.literal('')),
  banco_tipo_conta: z.enum(['corrente', 'poupanca']).optional(),
  banco_pix: z.string().optional().or(z.literal('')),

  observacoes: z.string().optional().or(z.literal('')),
  status: z.enum(['ativo', 'inativo', 'bloqueado', 'arquivado']),
});

type FornecedorFormValues = z.infer<typeof fornecedorSchema>;

interface FornecedorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fornecedor?: Fornecedor | null;
  onSubmit: (data: FornecedorFormValues) => Promise<void>;
}

export function FornecedorDialog({
  open,
  onOpenChange,
  fornecedor,
  onSubmit,
}: FornecedorDialogProps) {
  const form = useForm<FornecedorFormValues>({
    resolver: zodResolver(fornecedorSchema),
    defaultValues: {
      nome: '',
      tipo: 'pessoa_juridica',
      cpf_cnpj: '',
      nome_fantasia: '',
      rg_ie: '',
      categoria_servico: '',
      email: '',
      telefone: '',
      endereco_cep: '',
      endereco_logradouro: '',
      endereco_numero: '',
      endereco_bairro: '',
      endereco_cidade: '',
      endereco_estado: '',
      banco_nome: '',
      banco_agencia: '',
      banco_conta: '',
      banco_tipo_conta: 'corrente',
      banco_pix: '',
      observacoes: '',
      status: 'ativo',
    },
  });

  useEffect(() => {
    if (fornecedor) {
      const endereco = fornecedor.endereco_completo as any || {};
      const bancos = fornecedor.dados_bancarios as any || {};
      
      form.reset({
        nome: fornecedor.nome,
        tipo: fornecedor.tipo,
        cpf_cnpj: fornecedor.cpf_cnpj,
        nome_fantasia: fornecedor.nome_fantasia || '',
        rg_ie: fornecedor.rg_ie || '',
        categoria_servico: fornecedor.categoria_servico || '',
        email: fornecedor.email || '',
        telefone: fornecedor.telefone || '',
        
        endereco_cep: endereco.cep || '',
        endereco_logradouro: endereco.logradouro || '',
        endereco_numero: endereco.numero || '',
        endereco_bairro: endereco.bairro || '',
        endereco_cidade: endereco.cidade || '',
        endereco_estado: endereco.estado || '',
        
        banco_nome: bancos.banco || '',
        banco_agencia: bancos.agencia || '',
        banco_conta: bancos.conta || '',
        banco_tipo_conta: bancos.tipo_conta || 'corrente',
        banco_pix: bancos.pix || '',
        
        observacoes: fornecedor.observacoes || '',
        status: fornecedor.status || 'ativo',
      });
    } else {
      form.reset({
        nome: '',
        tipo: 'pessoa_juridica',
        cpf_cnpj: '',
        nome_fantasia: '',
        rg_ie: '',
        categoria_servico: '',
        email: '',
        telefone: '',
        endereco_cep: '',
        endereco_logradouro: '',
        endereco_numero: '',
        endereco_bairro: '',
        endereco_cidade: '',
        endereco_estado: '',
        banco_nome: '',
        banco_agencia: '',
        banco_conta: '',
        banco_tipo_conta: 'corrente',
        banco_pix: '',
        observacoes: '',
        status: 'ativo',
      });
    }
  }, [fornecedor, form]);

  const handleSubmit = async (data: FornecedorFormValues) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  const tipoPessoa = form.watch('tipo');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {fornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            
            {/* Dados Básicos */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium border-b pb-2">Dados Básicos</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Pessoa</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pessoa_fisica">Pessoa Física</SelectItem>
                          <SelectItem value="pessoa_juridica">Pessoa Jurídica</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cpf_cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tipoPessoa === 'pessoa_fisica' ? 'CPF' : 'CNPJ'}</FormLabel>
                      <FormControl>
                        <Input placeholder={tipoPessoa === 'pessoa_fisica' ? '000.000.000-00' : '00.000.000/0000-00'} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome / Razão Social</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo ou Razão Social" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nome_fantasia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Fantasia</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome Fantasia (Opcional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="categoria_servico"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria / Serviço</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Transporte, Manutenção..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="inativo">Inativo</SelectItem>
                          <SelectItem value="bloqueado">Bloqueado</SelectItem>
                          <SelectItem value="arquivado">Arquivado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="email@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 0000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium border-b pb-2">Endereço</h3>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="endereco_cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input placeholder="00000-000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="col-span-2">
                    <FormField
                    control={form.control}
                    name="endereco_logradouro"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Logradouro</FormLabel>
                        <FormControl>
                            <Input placeholder="Rua, Av..." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                 <FormField
                  control={form.control}
                  name="endereco_numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input placeholder="123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="col-span-2">
                    <FormField
                    control={form.control}
                    name="endereco_bairro"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                            <Input placeholder="Bairro" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
              </div>

               <div className="grid grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="endereco_cidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="endereco_estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Input placeholder="UF" maxLength={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Dados Bancários */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium border-b pb-2">Dados Bancários</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="banco_nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Banco</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do Banco" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="banco_pix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chave Pix</FormLabel>
                      <FormControl>
                        <Input placeholder="Chave Pix" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="banco_agencia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agência</FormLabel>
                      <FormControl>
                        <Input placeholder="0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="banco_conta"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conta</FormLabel>
                      <FormControl>
                        <Input placeholder="00000-0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="banco_tipo_conta"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="corrente">Corrente</SelectItem>
                          <SelectItem value="poupanca">Poupança</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Observações gerais sobre o fornecedor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {fornecedor ? 'Salvar Alterações' : 'Criar Fornecedor'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
