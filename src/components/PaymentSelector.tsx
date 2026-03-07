import { useState, useRef } from 'react';
import { Smartphone, Check, Copy, Upload, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Event } from '@/hooks/useEvents';

export type PaymentType = 'pix';
export type PaymentMode = 'full';

export interface PaymentSelectionResult {
  paymentType: PaymentType;
  paymentMode: PaymentMode;
  installmentsTotal: number;
  proofUrl?: string;
}

interface PaymentSelectorProps {
  event: Event;
  pixKey: string;
  onChange: (result: PaymentSelectionResult) => void;
}

const PaymentSelector = ({ event, pixKey, onChange }: PaymentSelectorProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [proofUrl, setProofUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);

  const price = Number(event.price || 0);

  const notify = (updates: Partial<PaymentSelectionResult> = {}) => {
    onChange({
      paymentType: 'pix',
      paymentMode: 'full',
      installmentsTotal: 1,
      proofUrl: proofUrl || undefined,
      ...updates,
    });
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

  return (
    <div className="space-y-4 rounded-md border border-primary/30 bg-primary/5 p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-medium px-2 py-1 rounded-bl-lg flex items-center gap-1">
        <Lock className="w-3 h-3" />
        Ambiente Seguro
      </div>
      
      <div className="text-center pt-2">
        <p className="text-sm text-muted-foreground">Valor da inscrição</p>
        <p className="text-2xl font-bold text-primary">R$ {price.toFixed(2)}</p>
      </div>

      {/* Seção PIX */}
      {pixKey && (
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
    </div>
  );
};

export default PaymentSelector;
