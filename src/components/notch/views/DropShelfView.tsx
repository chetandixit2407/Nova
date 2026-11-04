import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FolderUp,
  Share2,
  RefreshCw,
  QrCode,
  Smartphone,
  Check,
  X,
  FileCheck,
  Download,
  Trash2,
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';
import { useNotch } from '../../../context/NotchContext';
import { novaDropService } from '../../../services/novaDropService';
import { NovaDropDevice, NovaDropTransferItem } from '../../../types';

export const DropShelfView: React.FC = () => {
  const { dropShelfFiles, removeDropShelfFile, clearDropShelf, showToast } = useNotch();
  const [activeSubTab, setActiveSubTab] = useState<'shelf' | 'transfer' | 'converter'>('shelf');
  const [pairingCode, setPairingCode] = useState<string>(novaDropService.getPairingInfo().pairCode);
  const [devices, setDevices] = useState<NovaDropDevice[]>(novaDropService.getPairedDevices());
  const [transfers, setTransfers] = useState<NovaDropTransferItem[]>(novaDropService.getTransfers());
  const [convertTargetFormat, setConvertTargetFormat] = useState<'image/webp' | 'image/png' | 'image/jpeg'>('image/webp');
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [conversionResult, setConversionResult] = useState<string | null>(null);

  useEffect(() => {
    const unsub = novaDropService.subscribe(() => {
      setPairingCode(novaDropService.getPairingInfo().pairCode);
      setDevices(novaDropService.getPairedDevices());
      setTransfers(novaDropService.getTransfers());
    });
    return unsub;
  }, []);

  const pairedDevice = devices[0] || null;

  const handleSimulateDeviceConnect = () => {
    showToast({
      appName: 'NOVA Drop',
      title: 'Phone Connected',
      message: 'Paired device verified on local Wi-Fi',
      icon: 'Smartphone',
      duration: 3000
    });
  };

  const handleSimulateIncomingFile = () => {
    novaDropService.simulateReceiveFile('Vacation_Photo_2026.png', 4820000);
    showToast({
      appName: 'NOVA Drop',
      title: 'Incoming Wireless File',
      message: 'Receiving Vacation_Photo_2026.png via Wi-Fi',
      icon: 'Share2',
      duration: 3000
    });
  };

  const handleConvertSample = async () => {
    setIsConverting(true);
    setConversionResult(null);

    // Create a canvas image blob to demonstrate real format conversion
    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, 0, 120, 120);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('NOVA', 35, 68);
    }

    canvas.toBlob(async (blob) => {
      if (blob) {
        const dummyFile = new File([blob], 'preview_asset.png', { type: 'image/png' });
        try {
          const res = await novaDropService.convertFileFormat(dummyFile, convertTargetFormat);
          setConversionResult(`${res.newFilename} (${(res.size / 1024).toFixed(1)} KB)`);
          showToast({
            appName: 'Shelf Converter',
            title: 'Converted Successfully',
            message: `Saved as ${res.newFilename}`,
            icon: 'FileCheck',
            duration: 2500
          });
        } catch {
          showToast({
            appName: 'Shelf Converter',
            title: 'Conversion Failed',
            message: 'Format not supported',
            icon: 'X',
            duration: 2500
          });
        } finally {
          setIsConverting(false);
        }
      }
    }, 'image/png');
  };

  return (
    <div className="flex flex-col h-[106px] px-2.5 py-1 justify-between text-xs select-none">
      {/* Sub-navigation bar */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1 bg-black/20 p-0.5 rounded-lg border border-white/10">
          <button
            onClick={() => setActiveSubTab('shelf')}
            className={`px-2 py-0.5 rounded-md text-[10px] transition-all flex items-center gap-1 ${
              activeSubTab === 'shelf' ? 'bg-white/20 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FolderUp className="w-2.5 h-2.5" /> Shelf ({dropShelfFiles.length})
          </button>
          <button
            onClick={() => setActiveSubTab('transfer')}
            className={`px-2 py-0.5 rounded-md text-[10px] transition-all flex items-center gap-1 ${
              activeSubTab === 'transfer' ? 'bg-sky-500/30 text-sky-200 font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Share2 className="w-2.5 h-2.5" /> NOVA Drop
          </button>
          <button
            onClick={() => setActiveSubTab('converter')}
            className={`px-2 py-0.5 rounded-md text-[10px] transition-all flex items-center gap-1 ${
              activeSubTab === 'converter' ? 'bg-amber-500/30 text-amber-200 font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowRightLeft className="w-2.5 h-2.5" /> Quick Convert
          </button>
        </div>

        {activeSubTab === 'shelf' && dropShelfFiles.length > 0 && (
          <button
            onClick={clearDropShelf}
            className="text-[9px] text-slate-400 hover:text-rose-300 flex items-center gap-1"
          >
            <Trash2 className="w-2.5 h-2.5" /> Clear
          </button>
        )}
      </div>

      {/* Main Subtab View */}
      <div className="flex-1 flex items-center overflow-hidden py-1">
        {activeSubTab === 'shelf' && (
          <div className="w-full h-full flex items-center gap-2 overflow-x-auto scrollbar-none">
            {dropShelfFiles.length === 0 ? (
              <div className="w-full flex items-center justify-center border border-dashed border-white/15 rounded-lg p-2 text-slate-400 text-[10px] gap-2 bg-white/[0.02]">
                <FolderUp className="w-4 h-4 text-cyan-400/80 animate-bounce" />
                <span>Drag any files or photos here to hold them in your floating shelf</span>
              </div>
            ) : (
              dropShelfFiles.map((file) => (
                <div
                  key={file.id}
                  className="min-w-[120px] max-w-[140px] h-[64px] bg-white/5 border border-white/10 rounded-lg p-1.5 flex flex-col justify-between shrink-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 font-mono">
                      {(file.size / 1024).toFixed(0)} KB
                    </span>
                    <button
                      onClick={() => removeDropShelfFile(file.id)}
                      className="text-slate-400 hover:text-rose-400 p-0.5"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-200 truncate font-medium">{file.name}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeSubTab === 'transfer' && (
          <div className="w-full h-full flex items-center justify-between gap-2">
            {/* Pairing QR & PIN */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1.5 shrink-0">
              <div className="w-12 h-12 bg-white rounded p-0.5 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-full h-full text-slate-900 fill-current">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h4v2h-4v-2zm-4 0h2v4h-2v-4zm2 4h4v2h-4v-2zm-2-2h2v2h-2v-2z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-400">Pairing PIN</span>
                <span className="text-xs font-mono font-bold text-sky-400 tracking-wider">
                  {pairingCode}
                </span>
                <span className="text-[8px] text-slate-500">Scan via phone browser</span>
              </div>
            </div>

            {/* Device Status & Quick Transfer Controls */}
            <div className="flex-1 flex flex-col justify-between h-full bg-white/5 border border-white/10 rounded-lg p-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px] text-slate-200 truncate">
                    {pairedDevice ? pairedDevice.name : 'No Phone Paired'}
                  </span>
                </div>
                {pairedDevice ? (
                  <span className="text-[9px] text-emerald-400 font-mono">Connected</span>
                ) : (
                  <button
                    onClick={handleSimulateDeviceConnect}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 transition-all"
                  >
                    Pair Phone
                  </button>
                )}
              </div>

              {pairedDevice && (
                <div className="flex items-center justify-between gap-1 mt-1">
                  <button
                    onClick={handleSimulateIncomingFile}
                    className="text-[9px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-200 flex items-center gap-1 transition-all"
                  >
                    <Download className="w-2.5 h-2.5 text-cyan-400" /> Send File to PC
                  </button>
                  <button
                    onClick={() => novaDropService.disconnectDevice(pairedDevice.id)}
                    className="text-[9px] text-slate-400 hover:text-rose-400"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSubTab === 'converter' && (
          <div className="w-full h-full flex items-center justify-between gap-2 bg-white/5 border border-white/10 rounded-lg p-2">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium text-slate-200">Convert Image Format</span>
              <div className="flex items-center gap-1">
                {(['image/webp', 'image/png', 'image/jpeg'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setConvertTargetFormat(fmt)}
                    className={`text-[9px] px-2 py-0.5 rounded transition-all uppercase ${
                      convertTargetFormat === fmt
                        ? 'bg-amber-500/30 text-amber-300 font-bold'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    {fmt.split('/')[1]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <button
                onClick={handleConvertSample}
                disabled={isConverting}
                className="text-[10px] px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-500/30 to-orange-500/30 hover:from-amber-500/40 hover:to-orange-500/40 border border-amber-400/30 text-amber-200 flex items-center gap-1 transition-all"
              >
                {isConverting ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3 text-amber-400" />
                )}
                <span>Convert Demo Asset</span>
              </button>
              {conversionResult && (
                <span className="text-[9px] text-emerald-400 font-mono truncate">
                  ✓ {conversionResult}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
