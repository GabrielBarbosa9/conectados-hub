import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, Heart, Instagram, MessageCircle, Images, ArrowRight, User, LogIn, ClipboardList } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useRecentPhotos } from '@/hooks/useGallery';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import logoConectados from '@/assets/logo-conectados.png';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const Index = () => {
  const { data: settings } = useSettings();
  const { data: recentPhotos, isLoading: loadingPhotos } = useRecentPhotos(6);
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);

  const openWhatsApp = () => {
    if (settings?.whatsapp_number) {
      const message = encodeURIComponent(settings.whatsapp_message || '');
      window.open(`https://wa.me/${settings.whatsapp_number}?text=${message}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar - Fixed */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {user ? (
          <>
            <Link to="/minhas-inscricoes">
              <Button variant="outline" size="sm" className="gap-2">
                <ClipboardList className="h-4 w-4" />
                <span className="hidden sm:inline">Inscrições</span>
              </Button>
            </Link>
            <Link to="/perfil">
              <Button variant="outline" size="sm" className="gap-2">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover" />
                ) : (
                  <User className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{profile?.name?.split(' ')[0] || 'Perfil'}</span>
              </Button>
            </Link>
          </>
        ) : (
          <Link to="/login">
            <Button variant="outline" size="sm" className="gap-2">
              <LogIn className="h-4 w-4" />
              Entrar
            </Button>
          </Link>
        )}
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="relative z-10 text-center animate-fade-in">
          <div className="mb-8">
            <img 
              src={logoConectados} 
              alt="Conectados" 
              className="h-24 md:h-32 mx-auto"
            />
          </div>
          
          <p className="mb-12 max-w-2xl text-lg md:text-xl text-muted-foreground">
            {settings?.about_text || 'Uma geração conectada com Deus e com pessoas'}
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/eventos">
              <Button size="lg" className="gap-2 subtle-glow">
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

      {/* Momentos Section */}
      {!loadingPhotos && recentPhotos && recentPhotos.length > 0 && (
        <section className="border-t border-border px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Momentos</h2>
              <Link to="/galeria" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                Ver todas
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {recentPhotos.slice(0, 6).map((photo) => (
                <Link
                  key={photo.id}
                  to="/galeria"
                  className="group relative overflow-hidden rounded-lg bg-muted"
                >
                  <AspectRatio ratio={1}>
                    <img
                      src={photo.photo_url}
                      alt={photo.caption || 'Foto do evento'}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </AspectRatio>
                  {photo.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="text-sm text-white">{photo.caption}</p>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Social Links Section */}
      <section className="border-t border-border bg-card/50 px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-8 text-2xl font-semibold">Conecte-se conosco</h2>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            {settings?.instagram_url && (
              <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="gap-2">
                  <Instagram className="h-5 w-5" />
                  Instagram
                </Button>
              </a>
            )}
            
            {settings?.whatsapp_number && (
              <Button variant="outline" size="lg" className="gap-2" onClick={openWhatsApp}>
                <MessageCircle className="h-5 w-5" />
                WhatsApp
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* WhatsApp Floating Button */}
      {settings?.whatsapp_number && (
        <button
          onClick={openWhatsApp}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-110"
          aria-label="Falar no WhatsApp"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8">
        <div className="mx-auto max-w-4xl text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Conectados. Todos os direitos reservados.</p>
          <Link to="/admin/login" className="mt-2 inline-block text-xs hover:text-foreground">
            Área Administrativa
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Index;
