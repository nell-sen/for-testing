import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { HomePage } from "@/pages/HomePage";
import { SearchPage } from "@/pages/SearchPage";
import { LibraryPage } from "@/pages/LibraryPage";
import { PlaylistPage } from "@/pages/PlaylistPage";
import { FavoritesPage } from "@/pages/FavoritesPage";
import { AdminPanel } from "@/pages/AdminPanel";
import NotFound from "@/pages/not-found";
import { AnimatePresence, motion } from "framer-motion";
import { useSettingsStore } from "@/store/settingsStore";
import { registerSW, ensureNotificationPermission } from "@/services/pushNotifications";

const queryClient = new QueryClient();

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  );
}

function Router() {
  const [location] = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Switch key={location} location={location}>
        <Route path="/">{() => <AnimatedPage><HomePage /></AnimatedPage>}</Route>
        <Route path="/search">{() => <AnimatedPage><SearchPage /></AnimatedPage>}</Route>
        <Route path="/library">{() => <AnimatedPage><LibraryPage /></AnimatedPage>}</Route>
        <Route path="/playlist/:id">{() => <AnimatedPage><PlaylistPage /></AnimatedPage>}</Route>
        <Route path="/favorites">{() => <AnimatedPage><FavoritesPage /></AnimatedPage>}</Route>
        <Route path="/admin">{() => <AnimatedPage><AdminPanel /></AnimatedPage>}</Route>
        <Route>{() => <AnimatedPage><NotFound /></AnimatedPage>}</Route>
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  const initSettings = useSettingsStore((s) => s.init);
  useEffect(() => {
    initSettings();
    registerSW().then(() => ensureNotificationPermission());
  }, [initSettings]);

  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <AppLayout>
          <Router />
        </AppLayout>
      </WouterRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: 'rgba(20,10,40,0.95)', border: '1px solid rgba(168,85,247,0.3)', color: '#fff' },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
