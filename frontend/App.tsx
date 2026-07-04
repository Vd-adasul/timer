import React from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { Home, Clock, LayoutDashboard, Lightbulb, Settings, AlertTriangle, CheckCircle2, Info, X, BookOpen } from 'lucide-react';
import { StoreProvider, useAppStore } from './store';
import { HomeScreen } from './screens/Home';
import { TimelineScreen } from './screens/Timeline';
import { AnalyticsScreen } from './screens/Analytics';
import { CurriculumScreen } from './screens/Curriculum';
import { InsightsScreen } from './screens/Insights';
import { ReportScreen } from './screens/Report';
import { SettingsScreen } from './screens/Settings';
import { motion, AnimatePresence } from 'framer-motion';

// Toast Notification Overlay (Softly theme)
const GlobalToast = () => {
  const { toast, hideToast } = useAppStore();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 px-4 py-3 rounded-3xl bg-white/95 backdrop-blur-xl border border-stone-200/40 shadow-[0_12px_30px_-4px_rgba(41,37,36,0.06)] min-w-[280px] max-w-[90vw]"
        >
          {toast.type === 'success' && <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />}
          {toast.type === 'error' && <AlertTriangle size={16} className="text-red-500 shrink-0" />}
          {toast.type === 'info' && <Info size={16} className="text-amber-500 shrink-0" />}
          <span className="text-xs font-bold text-stone-800 mr-4 flex-1">{toast.message}</span>
          <button 
            onClick={hideToast}
            className="p-1 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors"
          >
            <X size={12} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Confirmation Overlay Dialog (Softly theme)
const GlobalConfirm = () => {
  const { confirmDialog } = useAppStore();

  return (
    <AnimatePresence>
      {confirmDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
            className="bg-white border border-stone-200/50 w-full max-w-sm rounded-[32px] p-6 shadow-[0_24px_50px_rgba(41,37,36,0.1)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-app-peach" />
            
            <h3 className="text-base font-extrabold text-stone-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={18} />
              {confirmDialog.title}
            </h3>
            
            <p className="text-xs text-stone-500 leading-relaxed mb-6 font-bold uppercase tracking-wider">
              {confirmDialog.message}
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={confirmDialog.onCancel}
                className="flex-1 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 font-extrabold text-xs uppercase tracking-wider transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDialog.onConfirm}
                className="flex-1 py-3 rounded-2xl bg-stone-800 hover:bg-stone-900 text-white font-extrabold text-xs uppercase tracking-wider transition-all active:scale-[0.98]"
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

// Translucent sliding bottom navigation bar (Softly themed)
const BottomNav = () => {
  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/timeline', icon: Clock, label: 'Timeline' },
    { path: '/curriculum', icon: BookOpen, label: 'Curriculum' },
    { path: '/analytics', icon: LayoutDashboard, label: 'Analytics' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="bg-white/70 backdrop-blur-2xl border border-stone-200/30 rounded-[32px] p-1.5 flex justify-between items-center w-full max-w-[360px] shadow-[0_12px_32px_-4px_rgba(41,37,36,0.06)] pointer-events-auto relative overflow-hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center w-[60px] h-[52px] rounded-[24px] transition-all duration-300 ${isActive ? 'text-stone-800' : 'text-stone-500/50 hover:text-stone-800/80'}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-stone-800/5 rounded-[22px]"
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}
                <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
                <span className={`text-[8px] font-extrabold mt-1 tracking-widest uppercase relative z-10 transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-1.5 w-1 h-1 bg-app-peach rounded-full z-10" />
                )}
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
        <Route path="/curriculum" element={<CurriculumScreen />} />
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
        <div className="h-screen w-screen bg-app-bg text-stone-800 font-sans overflow-hidden flex justify-center selection:bg-app-peach/30">
          {/* Warm Sage/Peach Ambient Glows */}
          <div className="glow-bg bg-app-sage w-80 h-80 top-[-80px] left-[-80px]" />
          <div className="glow-bg bg-app-lavender w-80 h-80 bottom-[-80px] right-[-80px]" />

          {/* Mobile container constraint for web view */}
          <div className="w-full max-w-md h-full relative bg-app-bg border-x border-stone-200/30 shadow-[0_20px_50px_rgba(41,37,36,0.06)] overflow-hidden flex flex-col">
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
