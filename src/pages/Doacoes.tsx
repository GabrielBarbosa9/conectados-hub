import { useState, useRef } from 'react';
import { Copy, Check, Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/hooks/useSettings';
import { useCreateDonation } from '@/hooks/useDonations';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Doacoes = () => {
  const { data: settings } = useSettings();
  const createDonation = useCreateDonation();

  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const pixKey = settings?.pix_key || '';

  const copyPix = async () => {
    if (pixKey) {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      toast.success('Chave PIX copiada!');
      setTimeout(() => setCopied(false), 2000);
    }
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
      toast.success('Comprovante enviado!');
    } catch {
      toast.error('Erro ao enviar comprovante');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount && !proofUrl) {
      toast.success('Obrigado pela sua intenção de doar! Nenhuma informação foi registrada, pois os campos estão vazios.');
      return;
    }

    try {
      await createDonation.mutateAsync({
        amount: amount ? parseFloat(amount) : 0,
        notes: proofUrl ? `Comprovante: ${proofUrl}` : undefined,
        donation_date: new Date().toISOString().split('T')[0]
      });
      setAmount('');
      setProofUrl('');
      if (fileRef.current) fileRef.current.value = '';
      toast.success('Informações da doação enviadas com sucesso! Muito obrigado!');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Heart className="h-10 w-10 text-primary" />
          </div>

          <h1 className="mb-4 text-4xl font-bold">Doe para o Conectados</h1>
          <p className="mb-8 text-muted-foreground">
            Sua contribuição ajuda a manter nossos projetos e eventos. Obrigado por fazer parte dessa missão!
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Chave PIX */}
          <Card className="glass-card animate-slide-up flex flex-col h-full">
            <CardHeader className="text-center pb-4">
              <CardTitle>Chave PIX</CardTitle>
              <CardDescription>
                Copie a chave abaixo para fazer sua doação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex-1 flex flex-col items-center justify-center">
              {pixKey ? (
                <div className="w-full space-y-4">
                  <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
                    <code className="flex-1 break-all text-sm font-mono">
                      {pixKey}
                    </code>
                    <Button size="icon" variant="ghost" className="shrink-0" onClick={copyPix}>
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>

                  {settings?.pix_name && (
                    <p className="text-xs text-muted-foreground text-center">
                      Beneficiário: {settings.pix_name}
                    </p>
                  )}

                  <Button className="w-full" onClick={copyPix}>
                    {copied ? 'Chave PIX Copiada!' : 'Copiar Chave PIX'}
                  </Button>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-center text-muted-foreground">
                    Chave PIX não configurada.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sessão Opcional */}
          <Card className="glass-card animate-slide-up [animation-delay:100ms] flex flex-col h-full border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                Informar Doação
                <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  Opcional
                </span>
              </CardTitle>
              <CardDescription>
                Se desejar, nos informe o valor ou envie o comprovante para facilitar nossa prestação de contas.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <form onSubmit={handleSubmit} className="space-y-4 flex flex-col h-full justify-between">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Valor (R$)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Ex: 50,00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Comprovante
                    </Label>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      disabled={uploading}
                      ref={fileRef}
                      className="cursor-pointer file:cursor-pointer"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadProof(f); }}
                    />
                    {uploading && <p className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" />Enviando...</p>}
                    {proofUrl && <p className="text-xs text-green-500 flex items-center gap-1"><Check className="h-3 w-3" />Enviado</p>}
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="secondary"
                  className="w-full mt-4"
                  disabled={uploading || createDonation.isPending || (!amount && !proofUrl)}
                >
                  {createDonation.isPending ? 'Enviando...' : 'Enviar Informações'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Cada doação é voluntária e não exige prestação de contas ao sistema. <br className="hidden sm:block" />
          Que Deus abençoe sua generosidade! 🙏
        </p>
      </div>
    </div>
  );
};

export default Doacoes;
