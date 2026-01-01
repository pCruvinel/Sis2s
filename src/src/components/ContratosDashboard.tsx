import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Eye, Trash2, FileText, Calendar, DollarSign, CheckCircle, XCircle, Clock, AlertCircle, List, Grid, Check, X, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { ExportButton } from './shared/ExportButton';
import { Pagination } from './shared/Pagination';
import { createClient } from '../lib/supabase/client';
import { useAuth } from '../hooks/useAuth';
import { ConfirmDialog } from './shared/ConfirmDialog';
import { FileUpload } from '../../components/shared/FileUpload';

interface Contrato {
  id: string;
  numero: string;
  cliente_nome: string;
  cliente_cpf_cnpj?: string;
  cliente_email?: string;
  cliente_id?: string;
  fornecedor_id?: string;
  empresa_id: string;
  tipo: string;
  descricao?: string;
  valor_total: number;
  desconto?: number;
  acrescimo?: number;
  valor_final: number;
  status: 'ativo' | 'concluido' | 'cancelado' | 'suspenso' | 'em_negociacao';
  tipo_parcelamento: 'mensal' | 'personalizado';
  data_inicio: string;
  data_fim: string;
  num_parcelas?: number;
  documento_url?: string;
  parcelas?: Parcela[];
}

interface Parcela {
  id: string;
  numero: number;
  valor: number;
  vencimento: string;
  status: 'pendente' | 'pago' | 'atrasado';
  data_pagamento?: string;
}

interface ContratosDashboardProps {
  contratos: Contrato[];
  clientes?: { id: string; nome: string; cpf_cnpj: string }[];
  fornecedores?: { id: string; nome: string; cpf_cnpj: string }[];
  empresas: { id: string; nome: string }[];
  empresaAtual: string;
  onUpdate?: () => void;
}

export function ContratosDashboard({ contratos, clientes = [], fornecedores = [], empresas, empresaAtual, onUpdate }: ContratosDashboardProps) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showModal, setShowModal] = useState(false);
  const [showParcelasModal, setShowParcelasModal] = useState(false);
  const [selectedContrato, setSelectedContrato] = useState<Contrato | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [contratoToDelete, setContratoToDelete] = useState<Contrato | null>(null);

  const { user } = useAuth();
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    numero: '',
    cliente_id: '',
    fornecedor_id: '',
    empresa_id: empresaAtual,
    tipo: 'cliente', // Default to cliente
    descricao: '',
    valor_total: 0,
    desconto: 0,
    acrescimo: 0,
    valor_final: 0,
    data_inicio: '',
    data_fim: '',
    tipo_parcelamento: 'mensal' as 'mensal' | 'personalizado',
    status: 'ativo' as 'ativo' | 'concluido' | 'cancelado' | 'suspenso' | 'em_negociacao',
    num_parcelas: 0,
    cliente_nome: '', // Fallback for UI
    documento_url: '',
  });
  const [parcelasPersonalizadas, setParcelasPersonalizadas] = useState<Partial<Parcela>[]>([]);

  // Calculate valor_final automatically
  useEffect(() => {
    const total = Number(formData.valor_total) || 0;
    const desc = Number(formData.desconto) || 0;
    const acre = Number(formData.acrescimo) || 0;
    const final = total - desc + acre;
    setFormData(prev => ({ ...prev, valor_final: final }));
  }, [formData.valor_total, formData.desconto, formData.acrescimo]);

  // Proteção contra props undefined
  const safeContratos = contratos || [];
  const safeEmpresas = empresas || [];

  // Filtros
  const contratosFiltrados = safeContratos.filter(c => {
    const matchSearch = c.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       c.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'todos' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Paginação
  const totalPages = Math.ceil(contratosFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const contratosExibidos = contratosFiltrados.slice(startIndex, endIndex);

  // Gerar parcelas mensais automáticas (RN-003)
  const gerarParcelasMensais = (valorTotal: number, numParcelas: number, dataInicio: string): Partial<Parcela>[] => {
    const valorParcela = valorTotal / numParcelas;
    const parcelas: Partial<Parcela>[] = [];
    const inicio = new Date(dataInicio);

    for (let i = 0; i < numParcelas; i++) {
      const vencimento = new Date(inicio);
      vencimento.setMonth(vencimento.getMonth() + i);
      
      parcelas.push({
        numero: i + 1,
        valor: parseFloat(valorParcela.toFixed(2)),
        vencimento: vencimento.toISOString().split('T')[0],
        status: 'pendente',
      });
    }

    return parcelas;
  };

  const handleOpenModal = (contrato?: Contrato) => {
    if (contrato) {
      setIsEditing(true);
      setSelectedContrato(contrato);
      setFormData({
        numero: contrato.numero,
        cliente_id: contrato.cliente_id || '',
        fornecedor_id: contrato.fornecedor_id || '',
        empresa_id: contrato.empresa_id,
        tipo: contrato.tipo,
        descricao: contrato.descricao || '',
        valor_total: contrato.valor_total,
        desconto: contrato.desconto || 0,
        acrescimo: contrato.acrescimo || 0,
        valor_final: contrato.valor_final,
        data_inicio: contrato.data_inicio,
        data_fim: contrato.data_fim,
        tipo_parcelamento: contrato.tipo_parcelamento,
        status: contrato.status,
        num_parcelas: contrato.num_parcelas || 0,
        cliente_nome: contrato.cliente_nome,
        documento_url: contrato.documento_url || '',
      });
      if (contrato.parcelas) {
        setParcelasPersonalizadas(contrato.parcelas);
      }
    } else {
      setIsEditing(false);
      setSelectedContrato(null);
      setFormData({
        numero: '',
        cliente_id: '',
        fornecedor_id: '',
        empresa_id: empresaAtual,
        tipo: 'cliente',
        descricao: '',
        valor_total: 0,
        desconto: 0,
        acrescimo: 0,
        valor_final: 0,
        data_inicio: new Date().toISOString().split('T')[0],
        data_fim: '',
        tipo_parcelamento: 'mensal',
        status: 'ativo',
        num_parcelas: 12,
        cliente_nome: '',
        documento_url: '',
      });
      setParcelasPersonalizadas([]);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedContrato(null);
    setIsEditing(false);
    setParcelasPersonalizadas([]);
  };

  const handleAddParcelaPersonalizada = () => {
    setParcelasPersonalizadas([
      ...parcelasPersonalizadas,
      {
        numero: parcelasPersonalizadas.length + 1,
        valor: 0,
        vencimento: '',
        status: 'pendente',
      },
    ]);
  };

  const handleRemoveParcelaPersonalizada = (index: number) => {
    setParcelasPersonalizadas(parcelasPersonalizadas.filter((_, i) => i !== index));
  };

  const handleUpdateParcelaPersonalizada = (index: number, field: string, value: any) => {
    const updated = [...parcelasPersonalizadas];
    updated[index] = { ...updated[index], [field]: value };
    setParcelasPersonalizadas(updated);
  };

  const handleSave = async () => {
    // Validações
    if (!formData.numero || !formData.tipo || !formData.valor_total || !formData.data_inicio || !formData.data_fim) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (formData.tipo === 'cliente' && !formData.cliente_id) {
      toast.error('Selecione um cliente');
      return;
    }

    if (formData.tipo === 'fornecedor' && !formData.fornecedor_id) {
      toast.error('Selecione um fornecedor');
      return;
    }

    if (formData.tipo_parcelamento === 'mensal' && !formData.num_parcelas) {
      toast.error('Informe o número de parcelas');
      return;
    }

    // Calcular valor final para validação
    const valorFinalCalculado = formData.valor_total - formData.desconto + formData.acrescimo;

    if (formData.tipo_parcelamento === 'personalizado') {
      if (parcelasPersonalizadas.length === 0) {
        toast.error('Adicione pelo menos uma parcela personalizada');
        return;
      }

      const totalParcelas = parcelasPersonalizadas.reduce((acc, p) => acc + (p.valor || 0), 0);
      if (Math.abs(totalParcelas - valorFinalCalculado) > 0.1) {
        toast.error(`Soma das parcelas (R$ ${totalParcelas.toFixed(2)}) diferente do valor final (R$ ${valorFinalCalculado.toFixed(2)})`);
        return;
      }
    }

    setLoading(true);
    const supabase = createClient();

    try {
      // 1. Save Contrato
      const contratoData = {
        numero_contrato: formData.numero,
        cliente_id: formData.tipo === 'cliente' ? formData.cliente_id : null,
        fornecedor_id: formData.tipo === 'fornecedor' ? formData.fornecedor_id : null,
        empresa_id: formData.empresa_id,
        tipo: formData.tipo,
        descricao: formData.descricao,
        valor_total: formData.valor_total,
        desconto: formData.desconto,
        acrescimo: formData.acrescimo,
        valor_final: valorFinalCalculado,
        data_inicio: formData.data_inicio,
        data_fim: formData.data_fim,
        tipo_parcelamento: formData.tipo_parcelamento,
        numero_parcelas: formData.num_parcelas,
        status: formData.status,
        documento_url: formData.documento_url,
        created_by: user?.id,
      };

      let contratoId = selectedContrato?.id;

      if (isEditing && contratoId) {
        const { error } = await supabase
          .from('contratos')
          .update(contratoData)
          .eq('id', contratoId);
        
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('contratos')
          .insert(contratoData)
          .select()
          .single();
        
        if (error) throw error;
        contratoId = data.id;
      }

      // 2. Handle Parcelas (Only for creation for now to avoid complexity of update logic)
      if (!isEditing && contratoId) {
        let parcelasToInsert: any[] = [];

        if (formData.tipo_parcelamento === 'mensal') {
          // Use valor_final for parcel generation
          const parcelas = gerarParcelasMensais(valorFinalCalculado, formData.num_parcelas, formData.data_inicio);
          parcelasToInsert = parcelas.map(p => ({
            contrato_id: contratoId,
            numero_parcela: p.numero,
            valor: p.valor,
            data_vencimento: p.vencimento,
            status: 'pendente'
          }));
        } else {
          parcelasToInsert = parcelasPersonalizadas.map(p => ({
            contrato_id: contratoId,
            numero_parcela: p.numero,
            valor: p.valor,
            data_vencimento: p.vencimento,
            status: p.status || 'pendente'
          }));
        }

        const { error: parcelasError } = await supabase
          .from('parcelas')
          .insert(parcelasToInsert);

        if (parcelasError) throw parcelasError;
      } else if (isEditing && contratoId && formData.tipo_parcelamento === 'personalizado') {
        // Implement logic to update existing parcels if needed, for now just updating contract details
        // A robust implementation would compare/sync parcels
      }

      toast.success(isEditing ? 'Contrato atualizado com sucesso!' : 'Contrato criado com sucesso!');
      handleCloseModal();
      onUpdate?.();

    } catch (error: any) {
      console.error('Erro ao salvar contrato:', error);
      toast.error('Erro ao salvar contrato: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!contratoToDelete) return;

    setLoading(true);
    const supabase = createClient();

    try {
      // Soft delete
      const { error } = await supabase
        .from('contratos')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', contratoToDelete.id);

      if (error) throw error;

      toast.success('Contrato excluído com sucesso');
      setShowDeleteDialog(false);
      onUpdate?.();
    } catch (error: any) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir contrato');
    } finally {
      setLoading(false);
      setContratoToDelete(null);
    }
  };

  const handleVerParcelas = (contrato: Contrato) => {
    navigate(`/financeiro/contratos/${contrato.id}/parcelas`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'default';
      case 'concluido': return 'success';
      case 'cancelado': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-gray-900 mb-2">Contratos</h1>
            <p className="text-gray-600">Gestão completa de contratos</p>
            <Badge className="mt-2 bg-orange-100 text-orange-700">RN-003: Parcelamento Flexível</Badge>
          </div>
          
          {/* Botões de Ação */}
          <div className="flex gap-2">
            {/* Toggle de Visualização */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <Button
                onClick={() => setViewMode('table')}
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                title="Visualização em Tabela"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setViewMode('cards')}
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                title="Visualização em Cards"
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>

            {/* Botão de Exportação */}
            <ExportButton
              data={contratosFiltrados}
              filename="contratos"
              columns={[
                { key: 'numero', label: 'Número' },
                { key: 'cliente_nome', label: 'Cliente' },
                { key: 'cliente_cpf_cnpj', label: 'CPF/CNPJ' },
                { key: 'tipo', label: 'Tipo' },
                { key: 'valor_total', label: 'Valor Total' },
                { key: 'status', label: 'Status' },
                { key: 'tipo_parcelamento', label: 'Tipo Parcelamento' },
                { key: 'num_parcelas', label: 'Nº Parcelas' },
                { key: 'data_inicio', label: 'Data Início' },
                { key: 'data_fim', label: 'Data Fim' },
              ]}
            />

            {/* Botão Novo Contrato */}
            <Button 
              onClick={() => handleOpenModal()}
              className="bg-[#1F4788] hover:bg-blue-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Contrato
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por número ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Visualização em Tabela */}
      {viewMode === 'table' ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Parcelamento (RN-003)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contratosExibidos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    Nenhum contrato encontrado
                  </TableCell>
                </TableRow>
              ) : (
                contratosExibidos.map((contrato) => (
                  <TableRow key={contrato.id}>
                    <TableCell className="text-gray-900 font-medium">{contrato.numero}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-gray-900">{contrato.cliente_nome}</p>
                        {contrato.cliente_cpf_cnpj && (
                          <p className="text-xs text-gray-500">{contrato.cliente_cpf_cnpj}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{contrato.tipo}</TableCell>
                    <TableCell className="text-sm text-gray-900">
                      R$ {contrato.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {new Date(contrato.data_inicio).toLocaleDateString('pt-BR')} - {new Date(contrato.data_fim).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="text-xs w-fit">
                          {contrato.tipo_parcelamento === 'mensal' ? '📅 Mensal' : '✏️ Personalizado'}
                        </Badge>
                        {contrato.parcelas && (
                          <span className="text-xs text-gray-500">
                            {contrato.parcelas.length} parcelas
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(contrato.status) as any}>
                        {contrato.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button onClick={() => handleVerParcelas(contrato)} variant="ghost" size="sm" title="Ver Parcelas">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => handleOpenModal(contrato)} variant="ghost" size="sm" title="Editar">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          onClick={() => {
                            setContratoToDelete(contrato);
                            setShowDeleteDialog(true);
                          }} 
                          variant="ghost" 
                          size="sm"
                          title="Excluir"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </Card>
      ) : (
        /* Visualização em Cards */
        <div className="space-y-4">
          {contratosExibidos.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum contrato encontrado</p>
            </Card>
          ) : (
            contratosExibidos.map((contrato) => (
              <Card key={contrato.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-lg text-gray-900 font-bold">{contrato.numero}</h3>
                      <Badge variant={contrato.tipo_parcelamento === 'mensal' ? 'default' : 'secondary'}>
                        {contrato.tipo_parcelamento === 'mensal' ? '📅 Mensal' : '✏️ Personalizado'}
                      </Badge>
                      <Badge variant={getStatusColor(contrato.status) as any}>
                        {contrato.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-500">Cliente</p>
                        <p className="text-sm text-gray-900 font-medium">{contrato.cliente_nome}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tipo</p>
                        <p className="text-sm text-gray-900">{contrato.tipo}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Período</p>
                        <p className="text-sm text-gray-900">{new Date(contrato.data_inicio).toLocaleDateString('pt-BR')} a {new Date(contrato.data_fim).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Valor Total</p>
                        <p className="text-sm text-gray-900 font-bold">R$ {contrato.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button onClick={() => handleVerParcelas(contrato)} variant="outline" size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      Parcelas
                    </Button>
                    <Button onClick={() => handleOpenModal(contrato)} variant="outline" size="sm" className="w-full">
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button 
                      onClick={() => {
                        setContratoToDelete(contrato);
                        setShowDeleteDialog(true);
                      }}
                      variant="outline" 
                      size="sm"
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Modal de Criação/Edição */}
      <Dialog open={showModal} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Contrato' : 'Novo Contrato'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Atualize as informações do contrato' : 'Preencha os dados do novo contrato'}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="geral" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="geral">Dados Gerais</TabsTrigger>
              <TabsTrigger value="parcelas">Parcelas (RN-003)</TabsTrigger>
            </TabsList>

            <TabsContent value="geral" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <Label>Número do Contrato *</Label>
                  <Input
                    value={formData.numero || ''}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    placeholder="Ex: 2024.001"
                  />
                </div>
                <div>
                  <Label>Tipo de Contrato *</Label>
                  <Select value={formData.tipo} onValueChange={(value) => {
                    setFormData({ 
                      ...formData, 
                      tipo: value,
                      cliente_id: '',
                      fornecedor_id: ''
                    })
                  }}>
                    <SelectTrigger>
                       <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cliente">Cliente (A Receber)</SelectItem>
                      <SelectItem value="fornecedor">Fornecedor (A Pagar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.tipo === 'cliente' ? (
                  <div className="col-span-2 md:col-span-1">
                    <Label>Cliente *</Label>
                    <Select 
                      value={formData.cliente_id} 
                      onValueChange={(value) => {
                        const cliente = clientes.find(c => c.id === value);
                        setFormData({ 
                          ...formData, 
                          cliente_id: value,
                          cliente_nome: cliente?.nome || ''
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientes.map(cliente => (
                          <SelectItem key={cliente.id} value={cliente.id}>
                            {cliente.nome} {cliente.cpf_cnpj ? `(${cliente.cpf_cnpj})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="col-span-2 md:col-span-1">
                    <Label>Fornecedor *</Label>
                    <Select 
                      value={formData.fornecedor_id} 
                      onValueChange={(value) => {
                        const fornecedor = fornecedores.find(f => f.id === value);
                        setFormData({ 
                          ...formData, 
                          fornecedor_id: value,
                          cliente_nome: fornecedor?.nome || ''
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um fornecedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {fornecedores.map(fornecedor => (
                          <SelectItem key={fornecedor.id} value={fornecedor.id}>
                            {fornecedor.nome} {fornecedor.cpf_cnpj ? `(${fornecedor.cpf_cnpj})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                      <SelectItem value="suspenso">Suspenso</SelectItem>
                      <SelectItem value="em_negociacao">Em Negociação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Data Início *</Label>
                  <Input
                    value={formData.data_inicio || ''}
                    onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                    type="date"
                  />
                </div>
                <div>
                  <Label>Data Fim *</Label>
                  <Input
                    value={formData.data_fim || ''}
                    onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                    type="date"
                  />
                </div>

                <div className="col-span-2 border-t pt-4 mt-2">
                  <h4 className="font-medium mb-2">Valores</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Valor Bruto (R$) *</Label>
                      <Input
                        value={formData.valor_total || ''}
                        onChange={(e) => setFormData({ ...formData, valor_total: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div>
                      <Label>Desconto (R$)</Label>
                      <Input
                        value={formData.desconto || ''}
                        onChange={(e) => setFormData({ ...formData, desconto: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                        min="0"
                        className="text-red-600"
                      />
                    </div>
                    <div>
                      <Label>Acréscimo (R$)</Label>
                      <Input
                        value={formData.acrescimo || ''}
                        onChange={(e) => setFormData({ ...formData, acrescimo: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                        min="0"
                        className="text-green-600"
                      />
                    </div>
                    <div>
                      <Label>Valor Final (R$)</Label>
                      <Input
                        value={formData.valor_final?.toFixed(2) || '0.00'}
                        disabled
                        className="bg-gray-100 font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label>Descrição</Label>
                <Input
                  value={formData.descricao || ''}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Detalhes do contrato"
                />
              </div>

              <div className="mt-4">
                <Label className="mb-2 block">Documento do Contrato (PDF)</Label>
                {formData.documento_url ? (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <a href={formData.documento_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex-1 truncate">
                      Visualizar Contrato
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData({ ...formData, documento_url: '' })}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <FileUpload
                    bucket="documentos"
                    path={`contratos/${user?.id}`}
                    accept=".pdf,.doc,.docx"
                    onUploadComplete={(url) => setFormData({ ...formData, documento_url: url })}
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="parcelas" className="space-y-4 mt-4">
              <div>
                <Label>Tipo de Parcelamento (RN-003) *</Label>
                <Select value={formData.tipo_parcelamento} onValueChange={(value: any) => setFormData({ ...formData, tipo_parcelamento: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensal">📅 Mensal (Geração Automática)</SelectItem>
                    <SelectItem value="personalizado">✏️ Personalizado (Definição Manual)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.tipo_parcelamento === 'mensal' 
                    ? 'Sistema gera parcelas iguais automaticamente por mês' 
                    : 'Você define valor e data de cada parcela manualmente'}
                </p>
              </div>

              {formData.tipo_parcelamento === 'mensal' ? (
                <div>
                  <Label>Número de Parcelas *</Label>
                  <Input
                    value={formData.num_parcelas || ''}
                    onChange={(e) => setFormData({ ...formData, num_parcelas: parseInt(e.target.value) || 0 })}
                    placeholder="12"
                    type="number"
                    min="1"
                  />
                  {formData.num_parcelas && formData.num_parcelas > 0 && formData.valor_total && (
                    <p className="text-sm text-gray-600 mt-2">
                      {formData.num_parcelas}x de R$ {(formData.valor_total / formData.num_parcelas).toFixed(2)}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Parcelas Personalizadas</Label>
                    <Button onClick={handleAddParcelaPersonalizada} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar Parcela
                    </Button>
                  </div>

                  {parcelasPersonalizadas.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">Nenhuma parcela adicionada</p>
                  ) : (
                    <div className="space-y-2">
                      {parcelasPersonalizadas.map((parcela, index) => (
                        <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1 grid grid-cols-3 gap-2">
                            <div>
                              <Label className="text-xs">Parcela</Label>
                              <Input value={`${index + 1}ª`} disabled />
                            </div>
                            <div>
                              <Label className="text-xs">Valor *</Label>
                              <Input
                                value={parcela.valor || ''}
                                onChange={(e) => handleUpdateParcelaPersonalizada(index, 'valor', parseFloat(e.target.value) || 0)}
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Vencimento *</Label>
                              <Input
                                value={parcela.vencimento || ''}
                                onChange={(e) => handleUpdateParcelaPersonalizada(index, 'vencimento', e.target.value)}
                                type="date"
                              />
                            </div>
                          </div>
                          <Button
                            onClick={() => handleRemoveParcelaPersonalizada(index)}
                            variant="ghost"
                            size="sm"
                            className="mt-5"
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      ))}

                      <div className="p-3 bg-blue-50 rounded-lg flex justify-between">
                        <span className="text-sm text-gray-700">Total das Parcelas:</span>
                        <span className="text-sm text-gray-900">
                          R$ {parcelasPersonalizadas.reduce((acc, p) => acc + (p.valor || 0), 0).toFixed(2)}
                        </span>
                      </div>

                      {formData.valor_total && Math.abs(parcelasPersonalizadas.reduce((acc, p) => acc + (p.valor || 0), 0) - formData.valor_total) > 0.1 && (
                        <p className="text-xs text-red-600">
                          Atenção: A soma das parcelas difere do valor total do contrato.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button onClick={handleCloseModal} variant="outline">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-[#1F4788] hover:bg-blue-800" disabled={loading}>
              {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar Contrato')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Excluir Contrato"
        description={`Tem certeza que deseja excluir o contrato ${contratoToDelete?.numero}? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        loading={loading}
      />

       {/* Modal de Visualização de Parcelas */}
       <Dialog open={showParcelasModal} onOpenChange={setShowParcelasModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Parcelas do Contrato {selectedContrato?.numero}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
             {selectedContrato?.parcelas && selectedContrato.parcelas.length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Nº</TableHead>
                     <TableHead>Vencimento</TableHead>
                     <TableHead>Valor</TableHead>
                     <TableHead>Status</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {selectedContrato.parcelas.map((parcela) => (
                     <TableRow key={parcela.id}>
                       <TableCell>{parcela.numero}</TableCell>
                       <TableCell>{new Date(parcela.vencimento).toLocaleDateString('pt-BR')}</TableCell>
                       <TableCell>R$ {parcela.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                       <TableCell>
                         <Badge variant={parcela.status === 'pago' ? 'success' : parcela.status === 'atrasado' ? 'destructive' : 'secondary' as any}>
                           {parcela.status}
                         </Badge>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <p className="text-center text-gray-500 py-4">Nenhuma parcela encontrada.</p>
             )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}