import { useEffect } from 'react';
import { useForm } from 'react-hook-form@7.55.0';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../components/ui/form';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { useEmpresaContext } from '../../../../contexts/EmpresaContext';
import { createClient } from '../../../../lib/supabase/client';
import { toast } from 'sonner@2.0.3';
import { Database } from '../../../../types/database';

type Cargo = Database['public']['Tables']['cargos']['Row'];

const formSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  descricao: z.string().optional(),
  departamento: z.string().min(2, 'Departamento deve ter pelo menos 2 caracteres'),
  salario_minimo: z.coerce.number().min(0, 'Salário deve ser positivo').optional(),
  salario_maximo: z.coerce.number().min(0, 'Salário deve ser positivo').optional(),
});

interface CargoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cargoToEdit?: Cargo | null;
  onSuccess: () => void;
}

export function CargoFormDialog({
  open,
  onOpenChange,
  cargoToEdit,
  onSuccess,
}: CargoFormDialogProps) {
  const { empresaAtiva } = useEmpresaContext();
  const supabase = createClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      departamento: '',
      salario_minimo: 0,
      salario_maximo: 0,
    },
  });

  useEffect(() => {
    if (cargoToEdit) {
      form.reset({
        nome: cargoToEdit.nome,
        descricao: cargoToEdit.descricao || '',
        departamento: cargoToEdit.departamento || '',
        salario_minimo: cargoToEdit.salario_minimo || 0,
        salario_maximo: cargoToEdit.salario_maximo || 0,
      });
    } else {
      form.reset({
        nome: '',
        descricao: '',
        departamento: '',
        salario_minimo: 0,
        salario_maximo: 0,
      });
    }
  }, [cargoToEdit, form, open]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!empresaAtiva?.id) {
      toast.error('Empresa não identificada');
      return;
    }

    try {
      const cargoData = {
        ...values,
        empresa_id: empresaAtiva.id,
      };

      if (cargoToEdit) {
        const { error } = await supabase
          .from('cargos')
          .update(cargoData)
          .eq('id', cargoToEdit.id);

        if (error) throw error;
        toast.success('Cargo atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('cargos')
          .insert(cargoData);

        if (error) throw error;
        toast.success('Cargo criado com sucesso!');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar cargo:', error);
      toast.error('Erro ao salvar cargo. Tente novamente.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{cargoToEdit ? 'Editar Cargo' : 'Novo Cargo'}</DialogTitle>
          <DialogDescription>
            {cargoToEdit
              ? 'Edite as informações do cargo abaixo.'
              : 'Preencha as informações para criar um novo cargo.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cargo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Analista Financeiro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="departamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departamento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Financeiro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="salario_minimo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salário Mínimo</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salario_maximo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salário Máximo</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição das responsabilidades..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
