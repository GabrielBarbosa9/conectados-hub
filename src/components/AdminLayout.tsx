import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  CheckSquare, 
  Heart, 
  Images, 
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/eventos', label: 'Eventos', icon: Calendar },
  { href: '/admin/inscricoes', label: 'Inscrições', icon: Users },
  { href: '/admin/checkin', label: 'Check-in', icon: CheckSquare },
  { href: '/admin/doacoes', label: 'Doações', icon: Heart },
  { href: '/admin/galeria', label: 'Galeria', icon: Images },
  { href: '/admin/configuracoes', label: 'Configurações', icon: Settings },
];

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background px-4 lg:hidden">
        <button onClick={() => setSidebarOpen(true)}>
          <Menu className="h-6 w-6" />
        </button>
        <span className="font-bold logo-text">Conectados</span>
        <div className="w-6" />
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-sidebar-background transition-transform lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-between px-6">
          <span className="text-lg font-bold logo-text">Conectados</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border p-4">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3" 
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="p-6">
          <h1 className="mb-6 text-2xl font-bold">{title}</h1>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
