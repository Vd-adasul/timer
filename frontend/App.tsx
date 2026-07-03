import React from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { Home, Clock, LayoutDashboard, Lightbulb, Settings, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { StoreProvider, useAppStore } from './store';
import { HomeScreen } from './screens/Home';
import { TimelineScreen } from './screens/Timeline';
import { AnalyticsScreen } from './screens/Analytics';
import { InsightsScreen } from './screens/Insights';
import { ReportScreen } from './screens/Report';
import { SettingsScreen } from './screens/Settings';
import { motion, AnimatePresence } from 'framer-motion';

// Toast Notification Overlay
const GlobalToast = () => {
  const { toast, hideToast } = useAppStore();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-900/90 backdrop-blur-xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.5)] min-w-[280px] max-w-[90vw]"
        >
          {toast.type === 'success' && <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertTriangle size={18} className="text-red-400 shrink-0" />}
          {toast.type === 'info' && <Info size={18} className="text-blue-400 shrink-0" />}
          <span className="text-sm font-semibold text-white/90 mr-4 flex-1">{toast.message}</span>
          <button 
            onClick={hideToast}
            className="p-1 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/60 transition-colors"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Confirmation Overlay Dialog
const GlobalConfirm = () => {
  const { confirmDialog } = useAppStore();

  return (
    <AnimatePresence>
      {confirmDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="bg-zinc-950 border border-white/10 w-full max-w-sm rounded-[28px] p-6 shadow-[0_24px_50px_rgba(0,0,0,0.8)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500" />
            
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={20} />
              {confirmDialog.title}
            </h3>
            
            <p className="text-sm text-white/60 leading-relaxed mb-6 font-medium">
              {confirmDialog.message}
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={confirmDialog.onCancel}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDialog.onConfirm}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all active:scale-[0.98]"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Award-winning bottom navigation bar with active layout animations
const BottomNav = () => {
  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/timeline', icon: Clock, label: 'Timeline' },
    { path: '/analytics', icon: LayoutDashboard, label: 'Analytics' },
    { path: '/insights', icon: Lightbulb, label: 'Insights' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="bg-zinc-950/80 backdrop-blur-2xl border border-white/5 rounded-full p-2 flex justify-between items-center w-full max-w-[360px] shadow-[0_16px_40px_rgba(0,0,0,0.6)] pointer-events-auto relative overflow-hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center w-[60px] h-[52px] rounded-full transition-all duration-300 ${isActive ? 'text-white' : 'text-white/40 hover:text-white/70'}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-white/10 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
                <span className={`text-[9px] font-bold mt-1 tracking-wider uppercase relative z-10 transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/timeline" element={<TimelineScreen />} />
        <Route path="/analytics" element={<AnalyticsScreen />} />
        <Route path="/insights" element={<InsightsScreen />} />
        <Route path="/report" element={<ReportScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <HashRouter>
        <div className="h-screen w-screen bg-[#09090b] text-white font-sans overflow-hidden flex justify-center selection:bg-indigo-500/30">
          {/* Ambient Glows */}
          <div className="glow-bg bg-indigo-600 w-72 h-72 top-[-100px] left-[-50px] opacity-10" />
          <div className="glow-bg bg-purple-600 w-72 h-72 bottom-[-100px] right-[-50px] opacity-10" />

          {/* Mobile container constraint for web view */}
          <div className="w-full max-w-md h-full relative bg-zinc-950 border-x border-white/5 shadow-2xl overflow-hidden flex flex-col">
            <GlobalToast />
            <GlobalConfirm />
            
            <div className="flex-1 overflow-hidden relative">
              <AnimatedRoutes />
            </div>
            
            <BottomNav />
          </div>
        </div>
      </HashRouter>
    </StoreProvider>
  );
};

export default App;
