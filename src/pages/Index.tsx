import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, Heart, Instagram, MessageCircle, Images } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
const Index = () => {
  const {
    data: settings
  } = useSettings();
  const openWhatsApp = () => {
    if (settings?.whatsapp_number) {
      const message = encodeURIComponent(settings.whatsapp_message || '');
      window.open(`https://wa.me/${settings.whatsapp_number}?text=${message}`, '_blank');
    }
  };
  return <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="relative z-10 text-center animate-fade-in">
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
              <span className="gradient-text text-white bg-white">Conectados</span>
            </h1>
          </div>
          
          <p className="mb-12 max-w-2xl text-lg md:text-xl text-muted-foreground">
            {settings?.about_text || 'Uma geração conectada com Deus e com pessoas'}
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/eventos">
              <Button size="lg" className="gap-2 glow-effect">
                <Calendar className="h-5 w-5" />
                Eventos
              </Button>
            </Link>
            
            <Link to="/doacoes">
              <Button size="lg" variant="outline" className="gap-2">
                <Heart className="h-5 w-5" />
                Doar
              </Button>
            </Link>
            
            <Link to="/galeria">
              <Button size="lg" variant="outline" className="gap-2">
                <Images className="h-5 w-5" />
                Galeria
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Links Section */}
      <section className="border-t border-border bg-card/50 px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-8 text-2xl font-semibold">Conecte-se conosco</h2>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            {settings?.instagram_url && <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="gap-2">
                  <Instagram className="h-5 w-5" />
                  Instagram
                </Button>
              </a>}
            
            {settings?.whatsapp_number && <Button variant="outline" size="lg" className="gap-2" onClick={openWhatsApp}>
                <MessageCircle className="h-5 w-5" />
                WhatsApp
              </Button>}
          </div>
        </div>
      </section>

      {/* WhatsApp Floating Button */}
      {settings?.whatsapp_number && <button onClick={openWhatsApp} className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-110 glow-effect" aria-label="Falar no WhatsApp">
          <MessageCircle className="h-6 w-6" />
        </button>}

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8">
        <div className="mx-auto max-w-4xl text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Conectados. Todos os direitos reservados.</p>
          <Link to="/admin/login" className="mt-2 inline-block text-xs hover:text-foreground">
            Área Administrativa
          </Link>
        </div>
      </footer>
    </div>;
};
export default Index;