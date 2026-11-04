import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Smartphone,
  Bluetooth,
  Wifi,
  PhoneCall,
  PhoneMissed,
  MessageSquare,
  MessageCircle,
  Bell,
  Volume2,
  VolumeX,
  Vibrate,
  ShieldCheck,
  RefreshCw,
  QrCode,
  Copy,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  Battery,
  BatteryCharging,
  Radio,
  Sliders,
  Sparkles,
  Play
} from 'lucide-react';
import { phoneSyncService } from '../../services/phoneSyncService';
import { PhoneDevice, PhoneSyncSettings } from '../../types';
import { soundService } from '../../services/soundService';

interface PhoneSyncModalProps {
  onClose: () => void;
}

export const PhoneSyncModal: React.FC<PhoneSyncModalProps> = ({ onClose }) => {
  const [device, setDevice] = useState<PhoneDevice | null>(phoneSyncService.getDevice());
  const [settings, setSettings] = useState<PhoneSyncSettings>(phoneSyncService.getSettings());
  const [pairCode, setPairCode] = useState<string>(phoneSyncService.getPairCode());
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [wifiIpInput, setWifiIpInput] = useState<string>('192.168.1.145');
  const [wifiPhoneName, setWifiPhoneName] = useState<string>('Pixel 9 Pro');
  const [showWifiDialog, setShowWifiDialog] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'device' | 'settings' | 'test'>('device');

  useEffect(() => {
    const unsub = phoneSyncService.subscribe(() => {
      setDevice(phoneSyncService.getDevice());
      setSettings(phoneSyncService.getSettings());
      setPairCode(phoneSyncService.getPairCode());
    });
    return unsub;
  }, []);

  const handleConnectBluetooth = async () => {
    setIsScanning(true);
    setStatusMessage('Scanning for nearby Bluetooth LE smartphones (ANCS / Alert Notification)...');
    const res = await phoneSyncService.connectBluetooth();
    setIsScanning(false);
    setStatusMessage(res.message);
  };

  const handleConnectWifi = async () => {
    setStatusMessage(`Connecting to ${wifiPhoneName} via local Wi-Fi...`);
    const res = await phoneSyncService.connectWifi(wifiPhoneName, wifiIpInput);
    setShowWifiDialog(false);
    setStatusMessage(res.message);
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(pairCode);
    setCopiedCode(true);
    soundService.playTick();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleToggleSetting = (key: keyof PhoneSyncSettings) => {
    const updatedVal = !settings[key];
    phoneSyncService.updateSettings({ [key]: updatedVal });
    soundService.playTick();
  };

  // Test triggers
  const handleTestCall = () => {
    phoneSyncService.triggerIncomingCall({
      callerName: 'Sophia Martinez',
      callerNumber: '+1 (555) 019-2834',
      appType: 'cellular'
    });
    setStatusMessage('Incoming call dispatched to notch!');
  };

  const handleTestWhatsAppCall = () => {
    phoneSyncService.triggerIncomingCall({
      callerName: 'Alex Vance',
      callerNumber: '+1 (415) 890-4412',
      appType: 'whatsapp'
    });
    setStatusMessage('WhatsApp voice call dispatched to notch!');
  };

  const handleTestWhatsAppMsg = () => {
    phoneSyncService.triggerIncomingMessage({
      type: 'whatsapp',
      appName: 'WhatsApp',
      sender: 'Marcus Chen',
      message: 'Hey, are the Windows Smart Notch animations ready for the Microsoft Store release?'
    });
    setStatusMessage('WhatsApp message sent to notch!');
  };

  const handleTestSms = () => {
    phoneSyncService.triggerIncomingMessage({
      type: 'sms',
      appName: 'Messages',
      sender: 'Chase Security',
      message: '792014 is your verification code. Valid for 10 minutes. Do not share.'
    });
    setStatusMessage('SMS notification sent to notch!');
  };

  const handleTestMissedCall = () => {
    phoneSyncService.addNotification({
      id: `notif-${Date.now()}`,
      type: 'missed_call',
      appName: 'Phone',
      sender: 'Mom',
      message: 'Missed Call (2) • Tap to call back',
      timestamp: Date.now(),
      callerNumber: '+1 (555) 728-1190'
    });
    soundService.playPhoneChime('alert');
    setStatusMessage('Missed call notification registered!');
  };

  return (
    <div className="w-full h-full flex flex-col text-slate-100 select-none bg-slate-950/95 font-sans">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-black/40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Phone Link & Live Notifications</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-sky-500/20 text-sky-300 border border-sky-400/30">
                PRO SYNC
              </span>
            </h2>
            <p className="text-[10px] text-slate-400">
              Real-time Bluetooth LE & Wi-Fi LAN notification mirror for Windows
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Sub tabs */}
          <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/5 text-[10px] mr-2">
            <button
              onClick={() => setActiveTab('device')}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                activeTab === 'device' ? 'bg-sky-500 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Device
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                activeTab === 'settings' ? 'bg-sky-500 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Filters
            </button>
            <button
              onClick={() => setActiveTab('test')}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                activeTab === 'test' ? 'bg-sky-500 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Test Console
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto notch-dashboard-scroll p-4 space-y-4">
        {statusMessage && (
          <div className="p-2 rounded-lg bg-sky-500/15 border border-sky-400/30 text-[11px] text-sky-200 flex items-center justify-between">
            <span className="truncate">{statusMessage}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-slate-400 hover:text-white ml-2 shrink-0 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* TAB 1: DEVICE & PAIRING */}
        {activeTab === 'device' && (
          <div className="space-y-4">
            {/* Connected Device Card */}
            {device ? (
              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-sky-500/30 border border-sky-400/30 flex items-center justify-center text-sky-300">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{device.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider font-semibold ${
                            device.status === 'connected'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {device.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">{device.model}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 bg-black/40 px-2 py-1 rounded-lg border border-white/5">
                    {device.connectionType === 'bluetooth' ? (
                      <Bluetooth className="w-3.5 h-3.5 text-indigo-400" />
                    ) : (
                      <Wifi className="w-3.5 h-3.5 text-sky-400" />
                    )}
                    <span className="capitalize">{device.connectionType}</span>
                  </div>
                </div>

                {/* Battery & Signal Stats */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div className="p-2 rounded-lg bg-black/30 border border-white/5 flex items-center gap-2">
                    {device.isCharging ? (
                      <BatteryCharging className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Battery className="w-4 h-4 text-sky-400" />
                    )}
                    <div>
                      <span className="text-slate-400 text-[10px] block">Battery</span>
                      <span className="font-mono font-bold text-white">{device.batteryLevel}%</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-black/30 border border-white/5 flex items-center gap-2">
                    <Radio className="w-4 h-4 text-indigo-400" />
                    <div>
                      <span className="text-slate-400 text-[10px] block">Signal RSSI</span>
                      <span className="font-mono font-bold text-white">{device.signalStrength}%</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-black/30 border border-white/5 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-slate-400 text-[10px] block">Encryption</span>
                      <span className="font-mono font-bold text-white">AES-256</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  {device.status === 'connected' ? (
                    <button
                      onClick={() => phoneSyncService.disconnectDevice()}
                      className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 transition-colors cursor-pointer"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => phoneSyncService.reconnectDevice()}
                      className="flex-1 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-medium transition-colors cursor-pointer"
                    >
                      Reconnect Device
                    </button>
                  )}

                  <button
                    onClick={() => phoneSyncService.unpairDevice()}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-medium border border-rose-500/30 transition-colors cursor-pointer"
                  >
                    Unpair
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-white/[0.02] border border-dashed border-white/15 text-center space-y-2">
                <Smartphone className="w-8 h-8 text-slate-500 mx-auto" />
                <h3 className="text-xs font-bold text-white">No Smartphone Paired</h3>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Pair your phone using Bluetooth LE or local Wi-Fi to mirror calls and notifications in real time.
                </p>
              </div>
            )}

            {/* Pairing Options */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Pairing Methods
              </span>

              <div className="grid grid-cols-2 gap-2">
                {/* Bluetooth LE */}
                <button
                  onClick={handleConnectBluetooth}
                  disabled={isScanning}
                  className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 flex flex-col items-start gap-1 text-left transition-all cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                    <Bluetooth className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white pt-1">Web Bluetooth LE</span>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Pair directly with iOS (Apple ANCS) or Android Phone Alert Status.
                  </p>
                </button>

                {/* Local Wi-Fi Bridge */}
                <button
                  onClick={() => setShowWifiDialog(true)}
                  className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 flex flex-col items-start gap-1 text-left transition-all cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                    <Wifi className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white pt-1">Local Wi-Fi Bridge</span>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    High-speed LAN synchronization with zero latency cross-tab bus.
                  </p>
                </button>
              </div>
            </div>

            {/* Wi-Fi Dialog / Pairing Code Panel */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-sky-400" />
                  <span>Wi-Fi Pairing Code</span>
                </span>
                <button
                  onClick={() => phoneSyncService.generateNewPairCode()}
                  className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                <span className="font-mono text-base font-extrabold text-sky-300 tracking-wider">
                  {pairCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed">
                Connect your Android or iPhone device on the same local network. BroadcastChannel and storage events will mirror live alerts in zero-millisecond real time.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: FILTERS & TOGGLES */}
        {activeTab === 'settings' && (
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Notification Types
            </span>

            <div className="space-y-1.5">
              {[
                {
                  key: 'syncCalls' as const,
                  label: 'Incoming Cellular & Voice Calls',
                  desc: 'Displays live animated caller pill with Accept / Decline controls',
                  icon: PhoneCall,
                  color: 'text-emerald-400'
                },
                {
                  key: 'syncMissedCalls' as const,
                  label: 'Missed Call Reminders',
                  desc: 'Shows caller details and one-tap callback actions',
                  icon: PhoneMissed,
                  color: 'text-rose-400'
                },
                {
                  key: 'syncWhatsApp' as const,
                  label: 'WhatsApp Messages & Calls',
                  desc: 'Real-time chats and voice/video ring notifications',
                  icon: MessageCircle,
                  color: 'text-emerald-400'
                },
                {
                  key: 'syncSms' as const,
                  label: 'SMS & OTP Verification Texts',
                  desc: 'Auto-detects OTPs and message previews in the notch',
                  icon: MessageSquare,
                  color: 'text-sky-400'
                },
                {
                  key: 'syncAppAlerts' as const,
                  label: 'Third-Party App Alerts',
                  desc: 'Slack, Instagram, Gmail and system push alerts',
                  icon: Bell,
                  color: 'text-indigo-400'
                }
              ].map((item) => (
                <div
                  key={item.key}
                  onClick={() => handleToggleSetting(item.key)}
                  className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <div>
                      <span className="text-xs font-semibold text-white block">{item.label}</span>
                      <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                    </div>
                  </div>

                  <div
                    className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                      settings[item.key] ? 'bg-sky-500' : 'bg-white/20'
                    }`}
                  >
                    <motion.div
                      animate={{ x: settings[item.key] ? 16 : 0 }}
                      className="w-4 h-4 rounded-full bg-white shadow-sm"
                    />
                  </div>
                </div>
              ))}
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 pt-2 block">
              Audio & Vibration
            </span>

            <div className="space-y-1.5">
              {[
                {
                  key: 'playRingtone' as const,
                  label: 'Play Phone Ringtone',
                  desc: 'Plays authentic harmonic dual-tone ring cadence on incoming calls',
                  icon: Volume2
                },
                {
                  key: 'playNotificationChime' as const,
                  label: 'Notification Chimes',
                  desc: 'Plays distinct WhatsApp & SMS crystalline sound effects',
                  icon: Bell
                },
                {
                  key: 'vibrationAlert' as const,
                  label: 'Vibration Haptic Feedback',
                  desc: 'Triggers device vibration via Web Vibrate API',
                  icon: Vibrate
                },
                {
                  key: 'autoExpandNotch' as const,
                  label: 'Auto-Expand Notch on Alert',
                  desc: 'Smoothly morphs the Dynamic Island when notifications arrive',
                  icon: Sparkles
                }
              ].map((item) => (
                <div
                  key={item.key}
                  onClick={() => handleToggleSetting(item.key)}
                  className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className="w-4 h-4 text-sky-400" />
                    <div>
                      <span className="text-xs font-semibold text-white block">{item.label}</span>
                      <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                    </div>
                  </div>

                  <div
                    className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                      settings[item.key] ? 'bg-sky-500' : 'bg-white/20'
                    }`}
                  >
                    <motion.div
                      animate={{ x: settings[item.key] ? 16 : 0 }}
                      className="w-4 h-4 rounded-full bg-white shadow-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TEST CONSOLE */}
        {activeTab === 'test' && (
          <div className="space-y-3">
            <div>
              <span className="text-xs font-bold text-white block">Interactive Notification Testing</span>
              <p className="text-[10px] text-slate-400">
                Trigger simulated live calls and messages to verify fluid notch expansion, auto-collapse, audio and buttons.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleTestCall}
                className="p-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-left flex flex-col gap-1 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <PhoneCall className="w-4 h-4 text-emerald-400" />
                  <Play className="w-3 h-3 text-emerald-400/60 group-hover:text-emerald-300" />
                </div>
                <span className="text-xs font-bold text-emerald-300">Incoming Cellular Call</span>
                <span className="text-[10px] text-slate-400">Ringing with Accept & Decline</span>
              </button>

              <button
                onClick={handleTestWhatsAppCall}
                className="p-3 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-left flex flex-col gap-1 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <MessageCircle className="w-4 h-4 text-teal-400" />
                  <Play className="w-3 h-3 text-teal-400/60 group-hover:text-teal-300" />
                </div>
                <span className="text-xs font-bold text-teal-300">WhatsApp Audio Call</span>
                <span className="text-[10px] text-slate-400">Green ring badge & timer</span>
              </button>

              <button
                onClick={handleTestWhatsAppMsg}
                className="p-3 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-600/30 text-left flex flex-col gap-1 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <Play className="w-3 h-3 text-emerald-400/60 group-hover:text-emerald-300" />
                </div>
                <span className="text-xs font-bold text-emerald-300">WhatsApp Message</span>
                <span className="text-[10px] text-slate-400">Marcus Chen: Store update...</span>
              </button>

              <button
                onClick={handleTestSms}
                className="p-3 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-left flex flex-col gap-1 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <MessageSquare className="w-4 h-4 text-sky-400" />
                  <Play className="w-3 h-3 text-sky-400/60 group-hover:text-sky-300" />
                </div>
                <span className="text-xs font-bold text-sky-300">SMS Verification</span>
                <span className="text-[10px] text-slate-400">Chase OTP Code preview</span>
              </button>

              <button
                onClick={handleTestMissedCall}
                className="p-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-left flex flex-col gap-1 transition-all cursor-pointer group col-span-2"
              >
                <div className="flex items-center justify-between">
                  <PhoneMissed className="w-4 h-4 text-rose-400" />
                  <Play className="w-3 h-3 text-rose-400/60 group-hover:text-rose-300" />
                </div>
                <span className="text-xs font-bold text-rose-300">Missed Call Alert</span>
                <span className="text-[10px] text-slate-400">Mom (2) • Red badge & notification center sync</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Local Wi-Fi Quick Connect Modal Dialog */}
      {showWifiDialog && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-xs p-4 rounded-xl bg-slate-900 border border-white/10 space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <Wifi className="w-4 h-4 text-sky-400" />
              <span>Connect Smartphone over Wi-Fi</span>
            </h3>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400">Device Name</label>
              <input
                type="text"
                value={wifiPhoneName}
                onChange={(e) => setWifiPhoneName(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400">Local IP Address</label>
              <input
                type="text"
                value={wifiIpInput}
                onChange={(e) => setWifiIpInput(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-white font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowWifiDialog(false)}
                className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConnectWifi}
                className="flex-1 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-medium cursor-pointer"
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
