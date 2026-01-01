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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { useEmpresaContext } from '../../../../contexts/EmpresaContext';
import { createClient } from '../../../../lib/supabase/client';
import { toast } from 'sonner@2.0.3';

const formSchema = z.object({
  placa: z.string().min(7, 'Placa inválida').max(10),
  modelo: z.string().min(2, 'Modelo obrigatório'),
  marca: z.string().min(2, 'Marca obrigatória'),
  ano_fabricacao: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  cor: z.string().optional(),
  tipo_veiculo: z.string().min(1, 'Tipo obrigatório'),
  status: z.enum(['disponivel', 'em_uso', 'manutencao', 'reservado', 'indisponivel']),
});

export function VeiculoFormDialog({
  open,
  onOpenChange,
  veiculoToEdit,
  onSuccess,
}) {
  const { empresaAtiva } = useEmpresaContext();
  const supabase = createClient();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      placa: '',
      modelo: '',
      marca: '',
      ano_fabricacao: new Date().getFullYear(),
      cor: '',
      tipo_veiculo: 'carro',
      status: 'disponivel',
    },
  });

  useEffect(() => {
    if (veiculoToEdit) {
      form.reset({
        placa: veiculoToEdit.placa,
        modelo: veiculoToEdit.modelo,
        marca: veiculoToEdit.marca,
        ano_fabricacao: veiculoToEdit.ano_fabricacao,
        cor: veiculoToEdit.cor || '',
        tipo_veiculo: veiculoToEdit.tipo_veiculo || 'carro',
        status: veiculoToEdit.status,
      });
    } else {
      form.reset({
        placa: '',
        modelo: '',
        marca: '',
        ano_fabricacao: new Date().getFullYear(),
        cor: '',
        tipo_veiculo: 'carro',
        status: 'disponivel',
      });
    }
  }, [veiculoToEdit, form, open]);

  const onSubmit = async (values) => {
    if (!empresaAtiva?.id) {
      toast.error('Empresa não identificada');
      return;
    }

    try {
      if (veiculoToEdit) {
        const { error } = await supabase
          .from('veiculos')
          .update(values)
          .eq('id', veiculoToEdit.id);

        if (error) throw error;
        toast.success('Veículo atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('veiculos')
          .insert({ ...values, empresa_id: empresaAtiva.id });

        if (error) throw error;
        toast.success('Veículo cadastrado com sucesso!');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar veículo:', error);
      toast.error('Erro ao salvar veículo. Verifique se a placa já existe.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{veiculoToEdit ? 'Editar Veículo' : 'Novo Veículo'}</DialogTitle>
          <DialogDescription>
            Preencha os dados técnicos do veículo abaixo.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="placa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placa</FormLabel>
                    <FormControl>
                      <Input placeholder="ABC1D23" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tipo_veiculo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="carro">Carro</SelectItem>
                        <SelectItem value="van">Van</SelectItem>
                        <SelectItem value="caminhao">Caminhão</SelectItem>
                        <SelectItem value="moto">Moto</SelectItem>
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
                name="marca"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Ford" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="modelo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Transit" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ano_fabricacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Branco" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="disponivel">Disponível</SelectItem>
                      <SelectItem value="em_uso">Em Uso</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                      <SelectItem value="reservado">Reservado</SelectItem>
                      <SelectItem value="indisponivel">Indisponível</SelectItem>
                    </SelectContent>
                  </Select>
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
