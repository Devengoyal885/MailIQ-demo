import React, { useState } from 'react';
import { Toaster } from 'sonner';
import MailIQ from './components/v2/MailIQ';
import { ShowcaseTour } from './components/v2/ShowcaseTour';
import { PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [showTour, setShowTour] = useState(true);

  return (
    <div id="tour-welcome" style={{ height: '100vh', display: 'flex', overflow: 'hidden', background: '#020817' }}>
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: '#0f172a',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#e2e8f0',
            borderRadius: '12px',
            fontSize: '13px',
          },
        }}
      />
      
      {/* Platform UI */}
      <MailIQ />

      {/* Floating Demo Tour Toggle */}
      <AnimatePresence>
        {!showTour && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTour(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-full shadow-lg shadow-indigo-500/25 font-medium transition-colors"
          >
            <PlayCircle size={18} />
            Showcase Tour
          </motion.button>
        )}
      </AnimatePresence>

      {/* Interactive Tour Overlay */}
      {showTour && <ShowcaseTour onComplete={() => setShowTour(false)} />}
    </div>
  );
}
