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

type Cliente = Database['public']['Tables']['clientes']['Row'];

const clienteSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  tipo: z.enum(['pessoa_fisica', 'pessoa_juridica']),
  cpf_cnpj: z.string().min(11, "Documento inválido").refine((val) => {
    const cleaned = val.replace(/\D/g, '');
    return cleaned.length === 11 ? isValidCPF(val) : isValidCNPJ(val);
  }, "CPF ou CNPJ inválido"),
  nome_fantasia: z.string().optional().or(z.literal('')),
  rg_ie: z.string().optional().or(z.literal('')),
  email: z.string().email("Email inválido").optional().or(z.literal('')),
  telefone: z.string().optional().or(z.literal('')),
  whatsapp: z.string().optional().or(z.literal('')),
  endereco_cep: z.string().optional().or(z.literal('')),
  endereco_logradouro: z.string().optional().or(z.literal('')),
  endereco_numero: z.string().optional().or(z.literal('')),
  endereco_bairro: z.string().optional().or(z.literal('')),
  endereco_cidade: z.string().optional().or(z.literal('')),
  endereco_estado: z.string().optional().or(z.literal('')),
  observacoes: z.string().optional().or(z.literal('')),
  status: z.enum(['ativo', 'inativo', 'inadimplente', 'bloqueado', 'prospeccao']),
});

type ClienteFormValues = z.infer<typeof clienteSchema>;

interface ClienteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente?: Cliente | null;
  onSubmit: (data: ClienteFormValues) => Promise<void>;
}

export function ClienteDialog({
  open,
  onOpenChange,
  cliente,
  onSubmit,
}: ClienteDialogProps) {
  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nome: '',
      tipo: 'pessoa_fisica',
      cpf_cnpj: '',
      nome_fantasia: '',
      rg_ie: '',
      email: '',
      telefone: '',
      whatsapp: '',
      endereco_cep: '',
      endereco_logradouro: '',
      endereco_numero: '',
      endereco_bairro: '',
      endereco_cidade: '',
      endereco_estado: '',
      observacoes: '',
      status: 'ativo',
    },
  });

  useEffect(() => {
    if (cliente) {
      const endereco = cliente.endereco_completo as any || {};
      form.reset({
        nome: cliente.nome,
        tipo: cliente.tipo,
        cpf_cnpj: cliente.cpf_cnpj,
        nome_fantasia: cliente.nome_fantasia || '',
        rg_ie: cliente.rg_ie || '',
        email: cliente.email || '',
        telefone: cliente.telefone || '',
        whatsapp: cliente.whatsapp || '',
        endereco_cep: endereco.cep || '',
        endereco_logradouro: endereco.logradouro || '',
        endereco_numero: endereco.numero || '',
        endereco_bairro: endereco.bairro || '',
        endereco_cidade: endereco.cidade || '',
        endereco_estado: endereco.estado || '',
        observacoes: cliente.observacoes || '',
        status: cliente.status,
      });
    } else {
      form.reset({
        nome: '',
        tipo: 'pessoa_fisica',
        cpf_cnpj: '',
        nome_fantasia: '',
        rg_ie: '',
        email: '',
        telefone: '',
        whatsapp: '',
        endereco_cep: '',
        endereco_logradouro: '',
        endereco_numero: '',
        endereco_bairro: '',
        endereco_cidade: '',
        endereco_estado: '',
        observacoes: '',
        status: 'ativo',
      });
    }
  }, [cliente, form]);

  const handleSubmit = async (data: ClienteFormValues) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  const tipoPessoa = form.watch('tipo');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {cliente ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                name="rg_ie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tipoPessoa === 'pessoa_fisica' ? 'RG' : 'Inscrição Estadual'}</FormLabel>
                    <FormControl>
                      <Input placeholder="RG ou IE" {...field} />
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
                        <SelectItem value="inadimplente">Inadimplente</SelectItem>
                        <SelectItem value="bloqueado">Bloqueado</SelectItem>
                        <SelectItem value="prospeccao">Prospecção</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
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

              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Endereço</h3>
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

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Observações gerais sobre o cliente" {...field} />
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
                {cliente ? 'Salvar Alterações' : 'Criar Cliente'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
