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

// Admin Pages
import AdminLogin from "@/pages/admin/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminEventos from "@/pages/admin/Eventos";
import AdminInscricoes from "@/pages/admin/Inscricoes";
import AdminCheckin from "@/pages/admin/Checkin";
import AdminDoacoes from "@/pages/admin/Doacoes";
import AdminGaleria from "@/pages/admin/Galeria";
import AdminConfiguracoes from "@/pages/admin/Configuracoes";

// Components
import ProtectedRoute from "@/components/ProtectedRoute";

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full"
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
        {/* Public Routes */}
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/eventos" element={<PageTransition><Eventos /></PageTransition>} />
        <Route path="/doacoes" element={<PageTransition><Doacoes /></PageTransition>} />
        <Route path="/galeria" element={<PageTransition><Galeria /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/cadastro" element={<PageTransition><Cadastro /></PageTransition>} />
        <Route path="/perfil" element={<PageTransition><Perfil /></PageTransition>} />
        <Route path="/minhas-inscricoes" element={<PageTransition><MinhasInscricoes /></PageTransition>} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<PageTransition><AdminLogin /></PageTransition>} />
        <Route path="/admin/dashboard" element={<PageTransition><ProtectedRoute><AdminDashboard /></ProtectedRoute></PageTransition>} />
        <Route path="/admin/eventos" element={<PageTransition><ProtectedRoute><AdminEventos /></ProtectedRoute></PageTransition>} />
        <Route path="/admin/inscricoes" element={<PageTransition><ProtectedRoute><AdminInscricoes /></ProtectedRoute></PageTransition>} />
        <Route path="/admin/checkin" element={<PageTransition><ProtectedRoute><AdminCheckin /></ProtectedRoute></PageTransition>} />
        <Route path="/admin/doacoes" element={<PageTransition><ProtectedRoute><AdminDoacoes /></ProtectedRoute></PageTransition>} />
        <Route path="/admin/galeria" element={<PageTransition><ProtectedRoute><AdminGaleria /></ProtectedRoute></PageTransition>} />
        <Route path="/admin/configuracoes" element={<PageTransition><ProtectedRoute><AdminConfiguracoes /></ProtectedRoute></PageTransition>} />
        
        {/* Catch-all */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};
