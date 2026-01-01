import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner@2.0.3';
import { Car, FileText, Wrench, AlertCircle } from 'lucide-react';
import { Badge } from '../ui/badge';

interface Veiculo {
  id: string;
  placa: string;
  modelo: string;
  marca: string;
  ano: string;
  tipo: string;
  empresa_id: string;
  status: string;
  km_atual: string;
  combustivel: string;
  cor: string;
  renavam: string;
  chassi: string;
}

interface EditarVeiculoModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (veiculo: Veiculo) => void;
  veiculo: Veiculo | null;
  empresas: { id: string; nome: string }[];
}

export function EditarVeiculoModal({ open, onClose, onSave, veiculo, empresas }: EditarVeiculoModalProps) {
  const [formData, setFormData] = useState<Veiculo>({
    id: '',
    placa: '',
    modelo: '',
    marca: '',
    ano: '',
    tipo: 'carro',
    empresa_id: '',
    status: 'ativo',
    km_atual: '',
    combustivel: 'flex',
    cor: '',
    renavam: '',
    chassi: '',
  });

  useEffect(() => {
    if (veiculo) {
      setFormData(veiculo);
    }
  }, [veiculo]);

  const handleSubmit = () => {
    if (!formData.placa || !formData.modelo || !formData.marca || !formData.ano || !formData.empresa_id) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    onSave(formData);
    toast.success('Veículo atualizado com sucesso!');
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-700';
      case 'manutencao':
        return 'bg-yellow-100 text-yellow-700';
      case 'inativo':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-600" />
            Editar Veículo
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            {formData.placa && (
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-600 text-white">{formData.placa}</Badge>
                <Badge className={getStatusColor(formData.status)}>
                  {formData.status === 'ativo' ? '✅ Ativo' : formData.status === 'manutencao' ? '🔧 Manutenção' : '❌ Inativo'}
                </Badge>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="dados" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dados">🚗 Dados</TabsTrigger>
            <TabsTrigger value="documentacao">📄 Documentação</TabsTrigger>
            <TabsTrigger value="historico">📊 Histórico</TabsTrigger>
          </TabsList>

          {/* Tab: Dados */}
          <TabsContent value="dados" className="space-y-4 mt-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-3">Informações Básicas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Placa *</Label>
                  <Input
                    value={formData.placa}
                    onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                    placeholder="AAA-0000"
                    maxLength={8}
                  />
                </div>
                <div>
                  <Label>Empresa *</Label>
                  <Select value={formData.empresa_id} onValueChange={(value) => setFormData({ ...formData, empresa_id: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {empresas.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>{emp.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Marca *</Label>
                  <Input
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Modelo *</Label>
                  <Input
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Ano *</Label>
                  <Input
                    value={formData.ano}
                    onChange={(e) => setFormData({ ...formData, ano: e.target.value })}
                    type="number"
                  />
                </div>
                <div>
                  <Label>Cor</Label>
                  <Input
                    value={formData.cor}
                    onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Veículo</Label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="carro">🚗 Carro</SelectItem>
                    <SelectItem value="moto">🏍️ Moto</SelectItem>
                    <SelectItem value="van">🚐 Van</SelectItem>
                    <SelectItem value="caminhao">🚚 Caminhão</SelectItem>
                    <SelectItem value="onibus">🚌 Ônibus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Combustível</Label>
                <Select value={formData.combustivel} onValueChange={(value) => setFormData({ ...formData, combustivel: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gasolina">⛽ Gasolina</SelectItem>
                    <SelectItem value="etanol">🌱 Etanol</SelectItem>
                    <SelectItem value="flex">🔄 Flex</SelectItem>
                    <SelectItem value="diesel">🛢️ Diesel</SelectItem>
                    <SelectItem value="eletrico">⚡ Elétrico</SelectItem>
                    <SelectItem value="hibrido">🔋 Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quilometragem Atual</Label>
                <Input
                  value={formData.km_atual}
                  onChange={(e) => setFormData({ ...formData, km_atual: e.target.value })}
                  type="number"
                  min="0"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">✅ Ativo</SelectItem>
                    <SelectItem value="manutencao">🔧 Manutenção</SelectItem>
                    <SelectItem value="inativo">❌ Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Documentação */}
          <TabsContent value="documentacao" className="space-y-4 mt-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-gray-600" />
                <h3 className="font-medium text-gray-900">Documentos do Veículo</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>RENAVAM</Label>
                  <Input
                    value={formData.renavam}
                    onChange={(e) => setFormData({ ...formData, renavam: e.target.value })}
                    maxLength={11}
                  />
                </div>
                <div>
                  <Label>Chassi</Label>
                  <Input
                    value={formData.chassi}
                    onChange={(e) => setFormData({ ...formData, chassi: e.target.value.toUpperCase() })}
                    maxLength={17}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-900 mb-1">Documentação Adicional</h3>
                  <p className="text-sm text-yellow-700">
                    Em uma implementação completa, aqui você poderia fazer upload de documentos como CRLV, 
                    comprovante de seguro, certificado de vistorias, etc.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Histórico */}
          <TabsContent value="historico" className="space-y-4 mt-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="w-5 h-5 text-purple-600" />
                <h3 className="font-medium text-purple-900">Histórico de Manutenções</h3>
              </div>
              <p className="text-sm text-purple-700 mb-4">
                Registros de manutenções, abastecimentos e outros eventos do veículo apareceriam aqui.
              </p>
              <div className="text-center py-8 text-gray-500">
                <Wrench className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Nenhum histórico registrado ainda</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-[#1F4788] hover:bg-blue-800">
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}