import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Heart, Images, FileText, User, LogIn, ClipboardList, Menu, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import logoConectados from '@/assets/logo-conectados.png';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface PublicLayoutProps {
    children: ReactNode;
}

const navLinks = [
    { href: '/eventos', label: 'Eventos', icon: Calendar },
    { href: '/doacoes', label: 'Doações', icon: Heart },
    { href: '/galeria', label: 'Galeria', icon: Images },
    { href: '/esbocos', label: 'Esboços de pregação', icon: FileText },
];

const PublicLayout = ({ children }: PublicLayoutProps) => {
    const { user } = useAuth();
    const { data: profile } = useProfile(user?.id);
    const location = useLocation();
    const [open, setOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Navbar Option */}
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 flex h-16 items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                            <img src={logoConectados} alt="Conectados" className="h-8 w-auto" />
                        </Link>

                        <nav className="hidden md:flex items-center gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    className={cn(
                                        "text-sm font-medium transition-colors hover:text-primary",
                                        isActive(link.href) ? "text-primary" : "text-muted-foreground"
                                    )}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden md:flex items-center gap-2">
                            {user ? (
                                <>
                                    <Link to="/minhas-inscricoes" onClick={() => setOpen(false)}>
                                        <Button variant="ghost" size="sm" className="gap-2">
                                            <ClipboardList className="h-4 w-4" />
                                            <span className="hidden sm:inline">Inscrições</span>
                                        </Button>
                                    </Link>
                                    <Link to="/perfil" onClick={() => setOpen(false)}>
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
                                <Link to="/login" onClick={() => setOpen(false)}>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <LogIn className="h-4 w-4" />
                                        <span className="hidden sm:inline">Entrar</span>
                                    </Button>
                                </Link>
                            )}
                            <ThemeToggle />
                        </div>

                        {/* Mobile Menu */}
                        <div className="md:hidden flex items-center">
                            <Sheet open={open} onOpenChange={setOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="md:hidden">
                                        <Menu className="h-5 w-5" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-[80vw] sm:w-[350px] p-6">
                                    <SheetTitle>
                                        <VisuallyHidden>Menu</VisuallyHidden>
                                    </SheetTitle>
                                    <div className="flex flex-col h-full mt-4">
                                        <nav className="flex flex-col gap-4">
                                            {navLinks.map((link) => (
                                                <Link
                                                    key={link.href}
                                                    to={link.href}
                                                    onClick={() => setOpen(false)}
                                                    className={cn(
                                                        "flex items-center gap-3 text-lg font-medium p-2 rounded-md transition-colors",
                                                        isActive(link.href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                                                    )}
                                                >
                                                    <link.icon className="h-5 w-5" />
                                                    {link.label}
                                                </Link>
                                            ))}
                                        </nav>

                                        <div className="mt-8 pt-8 border-t border-border flex flex-col gap-4">
                                            <div className="flex flex-col gap-2">
                                                {user ? (
                                                    <>
                                                        <Link to="/minhas-inscricoes" onClick={() => setOpen(false)}>
                                                            <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                                                                <ClipboardList className="h-4 w-4" />
                                                                <span>Inscrições</span>
                                                            </Button>
                                                        </Link>
                                                        <Link to="/perfil" onClick={() => setOpen(false)}>
                                                            <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                                                                {profile?.avatar_url ? (
                                                                    <img src={profile.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover" />
                                                                ) : (
                                                                    <User className="h-4 w-4" />
                                                                )}
                                                                <span>{profile?.name?.split(' ')[0] || 'Perfil'}</span>
                                                            </Button>
                                                        </Link>
                                                    </>
                                                ) : (
                                                    <Link to="/login" onClick={() => setOpen(false)}>
                                                        <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                                                            <LogIn className="h-4 w-4" />
                                                            <span>Entrar</span>
                                                        </Button>
                                                    </Link>
                                                )}
                                                <ThemeToggle />
                                            </div>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-border bg-card/10 mt-auto">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        <div className="flex flex-col items-center gap-4 md:items-start">
                            <img src={logoConectados} alt="Conectados" className="h-8 grayscale opacity-70 transition-all hover:grayscale-0 hover:opacity-100" />
                            <p className="text-center text-sm text-muted-foreground md:text-left">
                                © {new Date().getFullYear()} Conectados. Todos os direitos reservados.
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <Link to="/admin/login" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                <Settings className="h-4 w-4" />
                                Área Administrativa
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PublicLayout;
