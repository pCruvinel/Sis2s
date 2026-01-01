import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form@7.55.0';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../components/ui/form';
import { Input } from '../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { useEmpresaContext } from '../../../../contexts/EmpresaContext';
import { createClient } from '../../../../lib/supabase/client';
import { toast } from 'sonner@2.0.3';
import { Database } from '../../../../types/database';
import { Plus, Trash2 } from 'lucide-react';

type Colaborador = Database['public']['Tables']['colaboradores']['Row'];
type Cargo = Database['public']['Tables']['cargos']['Row'];

const formSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpf: z.string().min(11, 'CPF inválido'),
  rg: z.string().optional(),
  data_nascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  
  cargo_id: z.string().min(1, 'Selecione um cargo'),
  tipo_contrato: z.enum(['clt', 'pj', 'estagiario', 'temporario', 'autonomo']),
  data_admissao: z.string().min(1, 'Data de admissão é obrigatória'),
  
  salario_base: z.coerce.number().min(0, 'Valor inválido'),
  vale_transporte: z.coerce.number().optional(),
  vale_alimentacao: z.coerce.number().optional(),
  plano_saude: z.coerce.number().optional(),
  
  foto_url: z.string().optional(),
  
  rateio: z.array(z.object({
    empresa_id: z.string(),
    percentual: z.coerce.number().min(0).max(100)
  })).refine((items) => {
    const total = items.reduce((acc, item) => acc + item.percentual, 0);
    return Math.abs(total - 100) < 0.1;
  }, { message: 'A soma dos percentuais deve ser 100%' }),
});

interface ColaboradorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  colaboradorToEdit?: Colaborador | null;
  onSuccess: () => void;
}

export function ColaboradorFormDialog({
  open,
  onOpenChange,
  colaboradorToEdit,
  onSuccess,
}: ColaboradorFormDialogProps) {
  const { empresaAtiva, empresasDisponiveis } = useEmpresaContext();
  const supabase = createClient();
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [activeTab, setActiveTab] = useState('pessoal');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      cpf: '',
      rg: '',
      data_nascimento: '',
      email: '',
      telefone: '',
      cargo_id: '',
      tipo_contrato: 'clt',
      data_admissao: '',
      salario_base: 0,
      vale_transporte: 0,
      vale_alimentacao: 0,
      plano_saude: 0,
      foto_url: '',
      rateio: empresaAtiva ? [{ empresa_id: empresaAtiva.id, percentual: 100 }] : [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rateio",
  });

  useEffect(() => {
    const fetchCargos = async () => {
      if (!empresaAtiva?.id) return;
      const { data } = await supabase
        .from('cargos')
        .select('*')
        .eq('empresa_id', empresaAtiva.id)
        .is('deleted_at', null)
        .order('nome');
      if (data) setCargos(data);
    };
    fetchCargos();
  }, [empresaAtiva?.id]);

  useEffect(() => {
    if (colaboradorToEdit) {
      const rateioArray = colaboradorToEdit.rateio_empresas 
        ? Object.entries(colaboradorToEdit.rateio_empresas as Record<string, number>).map(([empresa_id, percentual]) => ({ empresa_id, percentual }))
        : (empresaAtiva ? [{ empresa_id: empresaAtiva.id, percentual: 100 }] : []);

      form.reset({
        nome: colaboradorToEdit.nome,
        cpf: colaboradorToEdit.cpf,
        rg: colaboradorToEdit.rg || '',
        data_nascimento: colaboradorToEdit.data_nascimento.split('T')[0],
        email: colaboradorToEdit.email || '',
        telefone: colaboradorToEdit.telefone || '',
        cargo_id: colaboradorToEdit.cargo_id || '',
        tipo_contrato: colaboradorToEdit.tipo_contrato as any,
        data_admissao: colaboradorToEdit.data_admissao.split('T')[0],
        salario_base: colaboradorToEdit.salario_base,
        vale_transporte: colaboradorToEdit.vale_transporte || 0,
        vale_alimentacao: colaboradorToEdit.vale_alimentacao || 0,
        plano_saude: colaboradorToEdit.plano_saude || 0,
        foto_url: colaboradorToEdit.foto_url || '',
        rateio: rateioArray,
      });
    } else {
      form.reset({
        nome: '',
        cpf: '',
        rg: '',
        data_nascimento: '',
        email: '',
        telefone: '',
        cargo_id: '',
        tipo_contrato: 'clt',
        data_admissao: '',
        salario_base: 0,
        vale_transporte: 0,
        vale_alimentacao: 0,
        plano_saude: 0,
        foto_url: '',
        rateio: empresaAtiva ? [{ empresa_id: empresaAtiva.id, percentual: 100 }] : [],
      });
    }
  }, [colaboradorToEdit, form, open, empresaAtiva]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!empresaAtiva?.id) {
      toast.error('Empresa não identificada');
      return;
    }

    try {
      // Convert rateio array to object
      const rateioObj: Record<string, number> = {};
      values.rateio.forEach(item => {
        rateioObj[item.empresa_id] = item.percentual;
      });

      const selectedCargo = cargos.find(c => c.id === values.cargo_id);

      const colaboradorData = {
        empresa_id: empresaAtiva.id, // Empresa principal
        nome: values.nome,
        cpf: values.cpf,
        rg: values.rg,
        data_nascimento: values.data_nascimento,
        email: values.email || null,
        telefone: values.telefone,
        cargo_id: values.cargo_id,
        departamento: selectedCargo?.departamento || null,
        tipo_contrato: values.tipo_contrato,
        data_admissao: values.data_admissao,
        salario_base: values.salario_base,
        vale_transporte: values.vale_transporte,
        vale_alimentacao: values.vale_alimentacao,
        plano_saude: values.plano_saude,
        foto_url: values.foto_url,
        rateio_empresas: rateioObj,
      };

      if (colaboradorToEdit) {
        const { error } = await supabase
          .from('colaboradores')
          .update(colaboradorData)
          .eq('id', colaboradorToEdit.id);

        if (error) throw error;
        toast.success('Colaborador atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('colaboradores')
          .insert({ ...colaboradorData, status: 'ativo' });

        if (error) throw error;
        toast.success('Colaborador criado com sucesso!');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar colaborador:', error);
      toast.error('Erro ao salvar colaborador. Tente novamente.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{colaboradorToEdit ? 'Editar Colaborador' : 'Novo Colaborador'}</DialogTitle>
          <DialogDescription>
            Preencha os dados do colaborador abaixo.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pessoal">Pessoal</TabsTrigger>
                <TabsTrigger value="profissional">Profissional</TabsTrigger>
                <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pessoal" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF</FormLabel>
                        <FormControl>
                          <Input placeholder="000.000.000-00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="rg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RG</FormLabel>
                        <FormControl>
                          <Input placeholder="00.000.000-0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="data_nascimento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Nascimento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                        <FormLabel>Telefone / Celular</FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 00000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="foto_url"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Foto URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormDescription>Link para a foto do colaborador</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="profissional" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="cargo_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um cargo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cargos.map((cargo) => (
                            <SelectItem key={cargo.id} value={cargo.id}>
                              {cargo.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tipo_contrato"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Contrato</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="clt">CLT</SelectItem>
                          <SelectItem value="pj">PJ</SelectItem>
                          <SelectItem value="estagiario">Estagiário</SelectItem>
                          <SelectItem value="temporario">Temporário</SelectItem>
                          <SelectItem value="autonomo">Autônomo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="data_admissao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Admissão</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="financeiro" className="space-y-4 mt-4">
                 <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="salario_base"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salário Base (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="vale_transporte"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vale Transporte (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="vale_alimentacao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vale Alimentação (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="plano_saude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plano de Saúde (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="border-t pt-4">
                  <FormLabel className="block mb-2">Rateio entre Empresas (RN-002)</FormLabel>
                  <FormDescription className="mb-4">
                    Distribuição do custo do colaborador entre as empresas do grupo. O total deve ser 100%.
                  </FormDescription>
                  
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2 mb-2">
                      <FormField
                        control={form.control}
                        name={`rateio.${index}.empresa_id`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Empresa" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {empresasDisponiveis.map((emp) => (
                                  <SelectItem key={emp.id} value={emp.id}>
                                    {emp.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`rateio.${index}.percentual`}
                        render={({ field }) => (
                          <FormItem className="w-24">
                            <FormControl>
                              <div className="relative">
                                <Input type="number" min="0" max="100" {...field} />
                                <span className="absolute right-2 top-2 text-xs text-gray-500">%</span>
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => append({ empresa_id: '', percentual: 0 })}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Empresa
                  </Button>
                  
                  <FormMessage>
                    {form.formState.errors.rateio?.root?.message}
                  </FormMessage>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
