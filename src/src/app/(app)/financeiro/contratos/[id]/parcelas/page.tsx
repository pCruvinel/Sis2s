'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createClient } from '../../../../../../lib/supabase/client';
import { Button } from '../../../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../components/ui/card';
import { Badge } from '../../../../../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../../../components/ui/dialog';
import { Input } from '../../../../../../components/ui/input';
import { Label } from '../../../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../../components/ui/select';
import { toast } from 'sonner@2.0.3';
import { formatCurrency, formatDate } from '../../../../../../lib/utils';
import { ArrowLeft, CheckCircle, AlertCircle, Clock, Upload, FileText } from 'lucide-react';
import { FileUpload } from '../../../../../../components/shared/FileUpload';

interface Parcela {
  id: string;
  numero_parcela: number;
  valor: number;
  data_vencimento: string;
  status: 'pendente' | 'pago' | 'atrasado';
  data_pagamento?: string;
  valor_pago?: number;
  forma_pagamento?: string;
  multa?: number;
  juros?: number;
  desconto?: number;
  comprovante_url?: string;
  observacoes?: string;
}

interface Contrato {
  id: string;
  numero_contrato: string;
  cliente: { nome: string };
  valor_total: number;
  valor_final: number;
}

export default function ParcelasContrato() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contrato, setContrato] = useState<Contrato | null>(null);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedParcela, setSelectedParcela] = useState<Parcela | null>(null);
  
  // Payment Form State
  const [paymentData, setPaymentData] = useState({
    valor_pago: 0,
    data_pagamento: new Date().toISOString().split('T')[0],
    forma_pagamento: 'pix',
    multa: 0,
    juros: 0,
    desconto: 0,
    comprovante_url: '',
    observacoes: ''
  });

  const supabase = createClient();
  const contratoId = id as string;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch Contrato
      const { data: contratoData, error: contratoError } = await supabase
        .from('contratos')
        .select('id, numero_contrato, valor_total, valor_final, cliente:clientes(nome)')
        .eq('id', contratoId)
        .single();

      if (contratoError) throw contratoError;
      setContrato(contratoData);

      // Fetch Parcelas
      const { data: parcelasData, error: parcelasError } = await supabase
        .from('parcelas')
        .select('*')
        .eq('contrato_id', contratoId)
        .order('numero_parcela');

      if (parcelasError) throw parcelasError;
      
      // Check status update (atrasado)
      const hoje = new Date().toISOString().split('T')[0];
      const parcelasAtualizadas = parcelasData.map((p: Parcela) => {
        if (p.status === 'pendente' && p.data_vencimento < hoje) {
          return { ...p, status: 'atrasado' as const };
        }
        return p;
      });

      setParcelas(parcelasAtualizadas);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do contrato');
    } finally {
      setLoading(false);
    }
  }, [contratoId, supabase]);

  useEffect(() => {
    if (contratoId) {
      fetchData();
    }
  }, [fetchData, contratoId]);

  const handleOpenPayment = (parcela: Parcela) => {
    setSelectedParcela(parcela);
    setPaymentData({
      valor_pago: parcela.valor,
      data_pagamento: new Date().toISOString().split('T')[0],
      forma_pagamento: 'pix',
      multa: 0,
      juros: 0,
      desconto: 0,
      comprovante_url: '',
      observacoes: ''
    });
    setPaymentModalOpen(true);
  };

  const handleRegisterPayment = async () => {
    if (!selectedParcela) return;

    try {
      const { error } = await supabase
        .from('parcelas')
        .update({
          status: 'pago',
          data_pagamento: paymentData.data_pagamento,
          valor_pago: paymentData.valor_pago,
          forma_pagamento: paymentData.forma_pagamento,
          multa: paymentData.multa,
          juros: paymentData.juros,
          desconto: paymentData.desconto,
          comprovante_url: paymentData.comprovante_url,
          observacoes: paymentData.observacoes,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedParcela.id);

      if (error) throw error;

      toast.success('Pagamento registrado com sucesso!');
      setPaymentModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      toast.error('Erro ao registrar pagamento');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pago':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" /> Pago</Badge>;
      case 'atrasado':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><AlertCircle className="w-3 h-3 mr-1" /> Atrasado</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>;
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Gestão de Parcelas</h1>
          <p className="text-gray-500">Contrato: {contrato?.numero_contrato} - {contrato?.cliente?.nome}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parcelas do Contrato</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor Original</TableHead>
                <TableHead>Valor Pago</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Comprovante</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parcelas.map((parcela) => (
                <TableRow key={parcela.id}>
                  <TableCell>{parcela.numero_parcela}</TableCell>
                  <TableCell>{formatDate(parcela.data_vencimento)}</TableCell>
                  <TableCell>{formatCurrency(parcela.valor)}</TableCell>
                  <TableCell>
                    {parcela.valor_pago ? formatCurrency(parcela.valor_pago) : '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(parcela.status)}</TableCell>
                  <TableCell>
                    {parcela.comprovante_url && (
                      <a href={parcela.comprovante_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Ver
                      </a>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {parcela.status !== 'pago' && (
                      <Button size="sm" onClick={() => handleOpenPayment(parcela)}>
                        Registrar Pagamento
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento - Parcela {selectedParcela?.numero_parcela}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data Pagamento</Label>
                <Input 
                  type="date" 
                  value={paymentData.data_pagamento}
                  onChange={(e) => setPaymentData({...paymentData, data_pagamento: e.target.value})}
                />
              </div>
              <div>
                <Label>Forma Pagamento</Label>
                <Select 
                  value={paymentData.forma_pagamento} 
                  onValueChange={(val) => setPaymentData({...paymentData, forma_pagamento: val})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor Original</Label>
                <Input value={formatCurrency(selectedParcela?.valor || 0)} disabled className="bg-gray-100" />
              </div>
              <div>
                <Label>Valor Pago</Label>
                <Input 
                  type="number" 
                  value={paymentData.valor_pago}
                  onChange={(e) => setPaymentData({...paymentData, valor_pago: parseFloat(e.target.value)})}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs">Multa</Label>
                <Input 
                  type="number" 
                  value={paymentData.multa}
                  onChange={(e) => setPaymentData({...paymentData, multa: parseFloat(e.target.value)})}
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs">Juros</Label>
                <Input 
                  type="number" 
                  value={paymentData.juros}
                  onChange={(e) => setPaymentData({...paymentData, juros: parseFloat(e.target.value)})}
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs">Desconto</Label>
                <Input 
                  type="number" 
                  value={paymentData.desconto}
                  onChange={(e) => setPaymentData({...paymentData, desconto: parseFloat(e.target.value)})}
                  className="h-8"
                />
              </div>
            </div>

            <div>
              <Label>Comprovante</Label>
              {paymentData.comprovante_url ? (
                <div className="flex items-center gap-2 mt-1 p-2 bg-gray-50 border rounded">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm truncate flex-1">Comprovante anexado</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setPaymentData({...paymentData, comprovante_url: ''})}
                    className="text-red-500 h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
              ) : (
                <FileUpload 
                  bucket="comprovantes"
                  path={`parcelas/${selectedParcela?.id}`}
                  onUploadComplete={(url) => setPaymentData({...paymentData, comprovante_url: url})}
                />
              )}
            </div>

            <div>
              <Label>Observações</Label>
              <Input 
                value={paymentData.observacoes}
                onChange={(e) => setPaymentData({...paymentData, observacoes: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleRegisterPayment}>Confirmar Pagamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}