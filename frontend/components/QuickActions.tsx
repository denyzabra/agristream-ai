
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ICONS } from '../constants';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

interface QuickActionsProps {
  onRefresh?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onRefresh }) => {
  const [alertsMuted, setAlertsMuted] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleRefresh = () => {
    onRefresh?.();
    window.location.reload();
  };

  const handleSettings = () => {
    alert('Settings modal - Coming soon!\nFeatures: Theme toggle, simulation speed, data refresh rate');
  };

  const toggleAlerts = () => {
    setAlertsMuted(!alertsMuted);
    // TODO: Implement alert muting logic
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleExport = () => {
    // Export current dashboard data as JSON
    const data = {
      timestamp: new Date().toISOString(),
      dashboard: 'AgriStream AI',
      note: 'Real-time export from dashboard'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agristream-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const executeProtocol = async () => {
    setIsExecuting(true);

    try {
      const response = await fetch(`${BACKEND_URL}/trigger/outbreak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          severity: 'CRITICAL',
          count: 10
        })
      });

      if (response.ok) {
        // Visual feedback
        setTimeout(() => setIsExecuting(false), 3000);
      } else {
        setIsExecuting(false);
        alert('Failed to execute protocol. Check backend is running.');
      }
    } catch (error) {
      setIsExecuting(false);
      console.error('Execute protocol error:', error);
      alert('Failed to connect to backend. Is it running on port 8000?');
    }
  };

  const actions = [
    {
      icon: <ICONS.Refresh />,
      label: 'Refresh Data',
      onClick: handleRefresh
    },
    {
      icon: <ICONS.Settings />,
      label: 'Settings',
      onClick: handleSettings
    },
    {
      icon: <ICONS.Alert />,
      label: alertsMuted ? 'Unmute Alerts' : 'Mute Alerts',
      onClick: toggleAlerts,
      active: alertsMuted
    },
    {
      icon: <ICONS.Full />,
      label: 'Toggle Fullscreen',
      onClick: toggleFullscreen
    },
    {
      icon: <ICONS.Export />,
      label: 'Export Data',
      onClick: handleExport
    },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="flex items-center gap-1 p-2 bg-[#111827]/80 backdrop-blur-3xl border border-white/10 rounded-full shadow-2xl"
      >
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={action.onClick}
            className={`group relative p-3 rounded-full transition-all duration-300 ${
              action.active
                ? 'text-cyan-400 bg-cyan-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {action.icon}
            <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-md text-[10px] font-mono text-white px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/20 pointer-events-none">
              {action.label}
            </span>
          </button>
        ))}

        <div className="w-px h-6 bg-white/20 mx-2" />

        <button
          onClick={executeProtocol}
          disabled={isExecuting}
          className={`group relative px-6 py-2.5 text-xs font-bold rounded-full transition-all duration-300 ${
            isExecuting
              ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse'
              : 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-black hover:shadow-[0_0_30px_rgba(34,255,136,0.5)]'
          }`}
        >
          {isExecuting ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-white rounded-full animate-ping" />
              EXECUTING...
            </span>
          ) : (
            'EXECUTE PROTOCOL'
          )}
          <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-md text-[10px] font-mono text-white px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/20 pointer-events-none">
            Trigger Demo Outbreak
          </span>
        </button>
      </motion.div>
    </div>
  );
};

export default QuickActions;
