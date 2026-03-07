import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { generatePixPayload } from '@/lib/pixUtils';

interface PixQRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pixKey: string;
  amount: number;
  description: string;
  recipientName?: string;
}

const PixQRCodeDialog = ({ 
  open, 
  onOpenChange, 
  pixKey, 
  amount, 
  description,
  recipientName = 'Conectados'
}: PixQRCodeDialogProps) => {
  const [copied, setCopied] = useState(false);

  const pixPayload = generatePixPayload(pixKey, recipientName, 'SAO PAULO', amount, description);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixPayload);
      setCopied(true);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar código');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Pagamento via PIX</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Valor */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Valor a pagar</p>
            <p className="text-3xl font-bold text-primary">
              R$ {amount.toFixed(2).replace('.', ',')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center p-6 bg-white rounded-lg">
            <QRCodeSVG
              value={pixPayload}
              size={200}
              level="M"
              includeMargin
            />
          </div>

          {/* Instruções */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Como pagar:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Abra o app do seu banco</li>
              <li>Escolha pagar com PIX QR Code</li>
              <li>Escaneie o código acima</li>
              <li>Confirme o pagamento</li>
              <li>Envie o comprovante aqui no app</li>
            </ol>
          </div>

          {/* Chave PIX */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Ou copie a chave PIX:</p>
            <div className="flex gap-2">
              <div className="flex-1 rounded-md bg-muted px-3 py-2 text-sm font-mono break-all">
                {pixKey}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Botão fechar */}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PixQRCodeDialog;
