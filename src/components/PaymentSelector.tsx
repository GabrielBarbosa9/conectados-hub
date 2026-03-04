import { useState, useRef } from 'react';
import { CreditCard, Smartphone, Check, Copy, Upload, Loader2, CalendarIcon, Lock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Event } from '@/hooks/useEvents';

export type PaymentType = 'pix' | 'credit_card';
export type PaymentMode = 'full' | 'installments';

export interface PaymentSelectionResult {
  paymentType: PaymentType;
  paymentMode: PaymentMode;
  installmentsTotal: number;
  proofUrl?: string;
  creditCardPaymentDate?: string;
}

interface PaymentSelectorProps {
  event: Event;
  pixKey: string;
  onChange: (result: PaymentSelectionResult) => void;
}

const PaymentSelector = ({ event, pixKey, onChange }: PaymentSelectorProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [paymentType, setPaymentType] = useState<PaymentType>(
    event.accepts_credit_card ? (event.payment_method === 'pix' ? 'pix' : 'credit_card') : 'pix'
  );
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('full');
  const [installmentsTotal, setInstallmentsTotal] = useState(1);
  const [proofUrl, setProofUrl] = useState('');
  const [creditCardDate, setCreditCardDate] = useState('');
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);

  const price = Number(event.price || 0);
  const maxInstallments = event.max_installments || 1;
  const installmentValue = paymentMode === 'installments' && installmentsTotal > 1
    ? (price / installmentsTotal).toFixed(2)
    : price.toFixed(2);

  const notify = (updates: Partial<PaymentSelectionResult> = {}) => {
    onChange({
      paymentType,
      paymentMode,
      installmentsTotal,
      proofUrl: proofUrl || undefined,
      creditCardPaymentDate: creditCardDate || undefined,
      ...updates,
    });
  };

  const handleTypeChange = (val: PaymentType) => {
    setPaymentType(val);
    setPaymentMode('full');
    setInstallmentsTotal(1);
    setProofUrl('');
    setCreditCardDate('');
    notify({ paymentType: val, paymentMode: 'full', installmentsTotal: 1, proofUrl: undefined, creditCardPaymentDate: undefined });
  };

  const handleModeChange = (val: PaymentMode) => {
    const newTotal = val === 'full' ? 1 : 2;
    setPaymentMode(val);
    setInstallmentsTotal(newTotal);
    notify({ paymentMode: val, installmentsTotal: newTotal });
  };

  const handleInstallmentsChange = (val: string) => {
    const n = parseInt(val);
    setInstallmentsTotal(n);
    notify({ installmentsTotal: n });
  };

  const handleCopyPix = async () => {
    await navigator.clipboard.writeText(pixKey);
    setCopied(true);
    toast.success('Chave PIX copiada!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUploadProof = async (file: File) => {
    setUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('payment-proofs').getPublicUrl(data.path);
      setProofUrl(urlData.publicUrl);
      notify({ proofUrl: urlData.publicUrl });
      toast.success('Comprovante enviado!');
    } catch {
      toast.error('Erro ao enviar comprovante');
    } finally {
      setUploading(false);
    }
  };

  const handleDateChange = (val: string) => {
    setCreditCardDate(val);
    notify({ creditCardPaymentDate: val });
  };

  const showPix = paymentType === 'pix';
  const showCard = paymentType === 'credit_card';
  const showInstallmentOption = event.accepts_installments && maxInstallments > 1;

  return (
    <div className="space-y-4 rounded-md border border-primary/30 bg-primary/5 p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-medium px-2 py-1 rounded-bl-lg flex items-center gap-1">
        <Lock className="w-3 h-3" />
        Ambiente Seguro
      </div>
      
      <div className="text-center pt-2">
        <p className="text-sm text-muted-foreground">Valor da inscrição</p>
        <p className="text-2xl font-bold text-primary">R$ {price.toFixed(2)}</p>
        {paymentMode === 'installments' && installmentsTotal > 1 && (
          <p className="text-sm text-muted-foreground mt-1">
            {installmentsTotal}x de R$ {installmentValue}
          </p>
        )}
      </div>

      {/* Tipo de pagamento */}
      {event.accepts_credit_card && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Forma de pagamento</Label>
          <RadioGroup
            value={paymentType}
            onValueChange={(v) => handleTypeChange(v as PaymentType)}
            className="grid grid-cols-2 gap-2"
          >
            <Label
              htmlFor="pix"
              className={`flex cursor-pointer items-center gap-2 rounded-md border p-3 transition-colors ${paymentType === 'pix' ? 'border-primary bg-primary/10' : 'border-border'}`}
            >
              <RadioGroupItem value="pix" id="pix" />
              <Smartphone className="h-4 w-4" />
              PIX
            </Label>
            <Label
              htmlFor="credit_card"
              className={`flex cursor-pointer items-center gap-2 rounded-md border p-3 transition-colors ${paymentType === 'credit_card' ? 'border-primary bg-primary/10' : 'border-border'}`}
            >
              <RadioGroupItem value="credit_card" id="credit_card" />
              <CreditCard className="h-4 w-4" />
              Cartão
            </Label>
          </RadioGroup>
        </div>
      )}

      {/* Parcelamento */}
      {showInstallmentOption && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Parcelamento</Label>
          <RadioGroup
            value={paymentMode}
            onValueChange={(v) => handleModeChange(v as PaymentMode)}
            className="grid grid-cols-2 gap-2"
          >
            <Label
              htmlFor="full"
              className={`flex cursor-pointer items-center gap-2 rounded-md border p-3 transition-colors ${paymentMode === 'full' ? 'border-primary bg-primary/10' : 'border-border'}`}
            >
              <RadioGroupItem value="full" id="full" />
              À vista
            </Label>
            <Label
              htmlFor="installments"
              className={`flex cursor-pointer items-center gap-2 rounded-md border p-3 transition-colors ${paymentMode === 'installments' ? 'border-primary bg-primary/10' : 'border-border'}`}
            >
              <RadioGroupItem value="installments" id="installments" />
              Parcelado
            </Label>
          </RadioGroup>

          {paymentMode === 'installments' && (
            <div className="space-y-1">
              <Label htmlFor="installments-count" className="text-sm">Número de parcelas</Label>
              <Select value={String(installmentsTotal)} onValueChange={handleInstallmentsChange}>
                <SelectTrigger id="installments-count">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: maxInstallments - 1 }, (_, i) => i + 2).map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}x de R$ {(price / n).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Seção PIX */}
      {showPix && pixKey && paymentMode === 'full' && (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-sm">Chave PIX</Label>
            <div className="flex gap-2">
              <Input value={pixKey} readOnly className="font-mono text-sm" />
              <Button type="button" variant="outline" size="icon" onClick={handleCopyPix}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-sm flex items-center gap-2">
              Comprovante de pagamento (opcional)
              <ShieldCheck className="h-3 w-3 text-green-500" />
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*,.pdf"
                disabled={uploading}
                ref={fileRef}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadProof(f); }}
              />
            </div>
            {uploading && <p className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" />Enviando...</p>}
            {proofUrl && <p className="text-xs text-green-600">✓ Comprovante enviado</p>}
          </div>
        </div>
      )}

      {/* PIX Parcelado */}
      {showPix && paymentMode === 'installments' && (
        <div className="rounded-md bg-amber-500/10 border border-amber-500/30 p-3 text-sm text-amber-600 dark:text-amber-400">
          <p className="font-medium">Pagamento PIX parcelado</p>
          <p className="mt-1 text-xs">
            Após a inscrição, envie o comprovante de cada parcela mensalmente na seção
            "Minhas inscrições". As parcelas serão confirmadas pela equipe.
          </p>
        </div>
      )}

      {/* Cartão */}
      {showCard && (
        <div className="space-y-2">
          <div className="rounded-md bg-blue-500/10 border border-blue-500/30 p-3 text-sm text-blue-600 dark:text-blue-400">
            <p className="font-medium flex items-center gap-2"><CreditCard className="h-4 w-4" />Pagamento presencial</p>
            <p className="mt-1 text-xs">O pagamento será realizado presencialmente. Informe abaixo a data prevista.</p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="card-date" className="text-sm flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              Data prevista de pagamento *
            </Label>
            <Input
              id="card-date"
              type="date"
              required={showCard}
              value={creditCardDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => handleDateChange(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSelector;
