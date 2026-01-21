import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSettings } from '@/hooks/useSettings';
import { toast } from 'sonner';

const Doacoes = () => {
  const { data: settings } = useSettings();
  const [copied, setCopied] = useState(false);

  const copyPix = async () => {
    if (settings?.pix_key) {
      await navigator.clipboard.writeText(settings.pix_key);
      setCopied(true);
      toast.success('Chave PIX copiada!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        
        <div className="text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Heart className="h-10 w-10 text-primary" />
          </div>
          
          <h1 className="mb-4 text-4xl font-bold">Doe para o Conectados</h1>
          <p className="mb-8 text-muted-foreground">
            Sua contribuição ajuda a manter nossos projetos e eventos. Obrigado por fazer parte dessa missão!
          </p>
        </div>
        
        <Card className="glass-card animate-slide-up">
          <CardHeader className="text-center">
            <CardTitle>PIX</CardTitle>
            <CardDescription>
              {settings?.pix_name || 'Copie a chave abaixo para fazer sua doação'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings?.pix_key ? (
              <>
                <div className="flex items-center gap-2 rounded-lg bg-muted p-4">
                  <code className="flex-1 break-all text-sm">{settings.pix_key}</code>
                  <Button size="icon" variant="ghost" onClick={copyPix}>
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                
                <Button className="w-full" onClick={copyPix}>
                  {copied ? 'Copiado!' : 'Copiar Chave PIX'}
                </Button>
              </>
            ) : (
              <p className="text-center text-muted-foreground">
                Chave PIX não configurada.
              </p>
            )}
          </CardContent>
        </Card>
        
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Que Deus abençoe sua generosidade! 🙏
        </p>
      </div>
    </div>
  );
};

export default Doacoes;
