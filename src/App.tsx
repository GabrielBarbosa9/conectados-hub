import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "next-themes";

// Public Pages
import Index from "./pages/Index";
import Eventos from "./pages/Eventos";
import Doacoes from "./pages/Doacoes";
import Galeria from "./pages/Galeria";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminEventos from "./pages/admin/Eventos";
import AdminInscricoes from "./pages/admin/Inscricoes";
import AdminCheckin from "./pages/admin/Checkin";
import AdminDoacoes from "./pages/admin/Doacoes";
import AdminGaleria from "./pages/admin/Galeria";
import AdminConfiguracoes from "./pages/admin/Configuracoes";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/doacoes" element={<Doacoes />} />
            <Route path="/galeria" element={<Galeria />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/eventos" element={<ProtectedRoute><AdminEventos /></ProtectedRoute>} />
            <Route path="/admin/inscricoes" element={<ProtectedRoute><AdminInscricoes /></ProtectedRoute>} />
            <Route path="/admin/checkin" element={<ProtectedRoute><AdminCheckin /></ProtectedRoute>} />
            <Route path="/admin/doacoes" element={<ProtectedRoute><AdminDoacoes /></ProtectedRoute>} />
            <Route path="/admin/galeria" element={<ProtectedRoute><AdminGaleria /></ProtectedRoute>} />
            <Route path="/admin/configuracoes" element={<ProtectedRoute><AdminConfiguracoes /></ProtectedRoute>} />
            
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
