import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

// Public Pages
import Index from "@/pages/Index";
import Eventos from "@/pages/Eventos";
import Doacoes from "@/pages/Doacoes";
import Galeria from "@/pages/Galeria";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import Cadastro from "@/pages/Cadastro";
import Perfil from "@/pages/Perfil";
import MinhasInscricoes from "@/pages/MinhasInscricoes";
import Esbocos from "@/pages/Esbocos";
import Migrate from "@/pages/Migrate";

// Admin Pages
import AdminLogin from "@/pages/admin/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminEventos from "@/pages/admin/Eventos";
import AdminInscricoes from "@/pages/admin/Inscricoes";
import AdminCheckin from "@/pages/admin/Checkin";
import AdminDoacoes from "@/pages/admin/Doacoes";
import AdminGaleria from "@/pages/admin/Galeria";
import AdminConfiguracoes from "@/pages/admin/Configuracoes";
import AdminUsuarios from "@/pages/admin/Usuarios";
import AdminEsbocos from "@/pages/admin/Esbocos";

// Components
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicLayout from "@/components/PublicLayout";

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -5 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full h-full flex flex-col flex-1"
    >
      {children}
    </motion.div>
  );
};

export const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes with Layout */}
        <Route path="/" element={<PublicLayout><PageTransition><Index /></PageTransition></PublicLayout>} />
        <Route path="/eventos" element={<PublicLayout><PageTransition><Eventos /></PageTransition></PublicLayout>} />
        <Route path="/doacoes" element={<PublicLayout><PageTransition><Doacoes /></PageTransition></PublicLayout>} />
        <Route path="/galeria" element={<PublicLayout><PageTransition><Galeria /></PageTransition></PublicLayout>} />
        <Route path="/esbocos" element={<PublicLayout><PageTransition><Esbocos /></PageTransition></PublicLayout>} />
        <Route path="/migrate" element={<PublicLayout><PageTransition><Migrate /></PageTransition></PublicLayout>} />
        <Route path="/login" element={<PublicLayout><PageTransition><Login /></PageTransition></PublicLayout>} />
        <Route path="/cadastro" element={<PublicLayout><PageTransition><Cadastro /></PageTransition></PublicLayout>} />
        <Route path="/perfil" element={<PublicLayout><PageTransition><Perfil /></PageTransition></PublicLayout>} />
        <Route path="/minhas-inscricoes" element={<PublicLayout><PageTransition><MinhasInscricoes /></PageTransition></PublicLayout>} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<PageTransition><AdminLogin /></PageTransition>} />
        <Route path="/admin/dashboard" element={<PageTransition><ProtectedRoute><AdminDashboard /></ProtectedRoute></PageTransition>} />
        <Route path="/admin/eventos" element={<PageTransition><ProtectedRoute><AdminEventos /></ProtectedRoute></PageTransition>} />
        <Route path="/admin/inscricoes" element={<PageTransition><ProtectedRoute><AdminInscricoes /></ProtectedRoute></PageTransition>} />
        <Route path="/admin/checkin" element={<PageTransition><ProtectedRoute><AdminCheckin /></ProtectedRoute></PageTransition>} />
        <Route path="/admin/doacoes" element={<PageTransition><ProtectedRoute><AdminDoacoes /></ProtectedRoute></PageTransition>} />
        <Route path="/admin/galeria" element={<PageTransition><ProtectedRoute><AdminGaleria /></ProtectedRoute></PageTransition>} />
        <Route path="/admin/esbocos" element={<PageTransition><ProtectedRoute><AdminEsbocos /></ProtectedRoute></PageTransition>} />
        <Route path="/admin/configuracoes" element={<PageTransition><ProtectedRoute><AdminConfiguracoes /></ProtectedRoute></PageTransition>} />
        <Route path="/admin/usuarios" element={<PageTransition><ProtectedRoute><AdminUsuarios /></ProtectedRoute></PageTransition>} />

        {/* Catch-all */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};
