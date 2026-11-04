import React, { useState, useEffect } from 'react';
import {
  Bluetooth,
  BluetoothConnected,
  BluetoothSearching,
  Headphones,
  Mouse,
  Keyboard,
  Smartphone,
  Watch,
  Speaker,
  Radio,
  RefreshCw,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Wifi,
  Power,
  Info,
  ExternalLink,
  Signal,
  Battery
} from 'lucide-react';
import { bluetoothService, BluetoothDeviceItem } from '../../../services/bluetoothService';
import { soundService } from '../../../services/soundService';

export const BluetoothView: React.FC = () => {
  const [devices, setDevices] = useState<BluetoothDeviceItem[]>(bluetoothService.getDevices());
  const [adapterStatus, setAdapterStatus] = useState(bluetoothService.getAdapterStatus());
  const [filter, setFilter] = useState<'all' | 'connected' | 'available'>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = bluetoothService.subscribe(() => {
      setDevices(bluetoothService.getDevices());
      setAdapterStatus(bluetoothService.getAdapterStatus());
    });
    return unsub;
  }, []);

  const handleScan = async () => {
    soundService.playTick();
    const result = await bluetoothService.scanForDevices();
    if (result) {
      soundService.playSuccess();
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    soundService.playTick();
    await bluetoothService.refreshDevices();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleToggleConnect = async (device: BluetoothDeviceItem) => {
    soundService.playTick();
    setConnectingId(device.id);

    if (device.status === 'connected') {
      await bluetoothService.disconnectDevice(device.id);
      soundService.playSnap();
    } else {
      const ok = await bluetoothService.connectDevice(device.id);
      if (ok) soundService.playSuccess();
      else soundService.play('warning');
    }

    setConnectingId(null);
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundService.playSnap();
    bluetoothService.removeDevice(id);
  };

  const filteredDevices = devices.filter((d) => {
    if (filter === 'connected') return d.status === 'connected';
    if (filter === 'available') return d.status !== 'connected';
    return true;
  });

  const connectedCount = devices.filter((d) => d.status === 'connected').length;

  const getDeviceIcon = (dev: BluetoothDeviceItem) => {
    switch (dev.type) {
      case 'audio':
        return <Headphones className="w-4 h-4 text-sky-400" />;
      case 'input':
        return dev.name.toLowerCase().includes('keyboard') ? (
          <Keyboard className="w-4 h-4 text-emerald-400" />
        ) : (
          <Mouse className="w-4 h-4 text-emerald-400" />
        );
      case 'phone':
        return <Smartphone className="w-4 h-4 text-indigo-400" />;
      case 'wearable':
        return <Watch className="w-4 h-4 text-amber-400" />;
      default:
        return <Bluetooth className="w-4 h-4 text-cyan-400" />;
    }
  };

  const renderSignalBars = (bars?: 1 | 2 | 3 | 4) => {
    const level = bars || 3;
    return (
      <div className="flex items-end gap-0.5 h-3 px-1" title={`Signal: ${level}/4 bars`}>
        <span className={`w-0.5 rounded-full ${level >= 1 ? 'bg-sky-400 h-1.5' : 'bg-white/20 h-1.5'}`} />
        <span className={`w-0.5 rounded-full ${level >= 2 ? 'bg-sky-400 h-2' : 'bg-white/20 h-2'}`} />
        <span className={`w-0.5 rounded-full ${level >= 3 ? 'bg-sky-400 h-2.5' : 'bg-white/20 h-2.5'}`} />
        <span className={`w-0.5 rounded-full ${level >= 4 ? 'bg-sky-400 h-3' : 'bg-white/20 h-3'}`} />
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-2.5 text-slate-100 select-none pb-2">
      {/* 1. Header Banner & Quick Controls */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-950/40 via-indigo-950/30 to-black/40 border border-sky-400/30 p-3 shadow-lg shadow-sky-500/5 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-inner">
              {adapterStatus.isScanning ? (
                <BluetoothSearching className="w-5 h-5 animate-pulse text-sky-300" />
              ) : (
                <Bluetooth className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-white tracking-tight">Bluetooth Devices</h3>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-sky-500/20 text-sky-300 border border-sky-400/30 font-semibold">
                  {connectedCount} Connected
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {adapterStatus.isScanning
                  ? 'Scanning for broadcasting Bluetooth devices...'
                  : adapterStatus.isAvailable
                  ? 'Real-time discovery & 1-click peripheral connection'
                  : 'Hardware radio status standby'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer active:scale-95"
              title="Refresh device statuses"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
            </button>

            <button
              onClick={handleScan}
              disabled={adapterStatus.isScanning}
              className="px-2.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-sky-500/20 cursor-pointer active:scale-95 disabled:opacity-50"
              title="Open browser pairing dialog to scan nearby Bluetooth devices"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{adapterStatus.isScanning ? 'Scanning...' : 'Pair Device'}</span>
            </button>
          </div>
        </div>

        {/* Scanning progress bar */}
        {adapterStatus.isScanning && (
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-2.5">
            <div className="h-full bg-gradient-to-r from-sky-400 via-indigo-400 to-sky-400 w-1/3 rounded-full animate-[shimmer_1.5s_infinite_linear]" />
          </div>
        )}
      </div>

      {/* 2. Error message banner if any */}
      {adapterStatus.error && (
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="font-semibold block text-[11px]">Bluetooth Notice</span>
            <span className="text-[10px] text-rose-300 leading-tight">{adapterStatus.error}</span>
          </div>
        </div>
      )}

      {/* 3. Filter tabs: All, Connected, Available */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-black/40 border border-white/10">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
              filter === 'all' ? 'bg-white/15 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({devices.length})
          </button>
          <button
            onClick={() => setFilter('connected')}
            className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
              filter === 'connected' ? 'bg-sky-500/20 text-sky-300 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Connected ({connectedCount})
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
              filter === 'available' ? 'bg-white/15 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Available ({devices.length - connectedCount})
          </button>
        </div>

        <span className="text-[10px] font-mono text-slate-400">
          {adapterStatus.isSupported ? 'Web Bluetooth Active' : 'Desktop Mode'}
        </span>
      </div>

      {/* 4. Devices List */}
      <div className="space-y-1.5">
        {filteredDevices.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 flex flex-col items-center justify-center text-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
              <Bluetooth className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">
                {filter === 'connected'
                  ? 'No connected Bluetooth devices'
                  : 'No Bluetooth devices discovered yet'}
              </p>
              <p className="text-[10px] text-slate-400 max-w-xs mt-0.5">
                Click "Pair Device" above to discover nearby headphones, mice, keyboards, or phone.
              </p>
            </div>
            <button
              onClick={handleScan}
              className="mt-1 px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/40 text-[11px] font-medium transition-all cursor-pointer"
            >
              Scan for Nearby Devices
            </button>
          </div>
        ) : (
          filteredDevices.map((device) => {
            const isConnected = device.status === 'connected';
            const isConnecting = connectingId === device.id || device.status === 'connecting';

            return (
              <div
                key={device.id}
                onClick={() => handleToggleConnect(device)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 group select-none ${
                  isConnected
                    ? 'bg-sky-950/20 border-sky-400/35 hover:border-sky-400/50 hover:bg-sky-950/30'
                    : 'bg-black/30 border-white/5 hover:border-white/15 hover:bg-white/[0.04]'
                }`}
              >
                {/* Device Icon & Info */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      isConnected
                        ? 'bg-sky-500/20 border-sky-400/40 text-sky-400'
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    {getDeviceIcon(device)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-white truncate max-w-[170px]">
                        {device.name}
                      </span>
                      {isConnected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                      <span className={isConnected ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                        {isConnecting
                          ? 'Connecting...'
                          : isConnected
                          ? 'Connected'
                          : 'Disconnected'}
                      </span>
                      {device.vendor && (
                        <>
                          <span>•</span>
                          <span className="text-slate-400">{device.vendor}</span>
                        </>
                      )}
                      {device.batteryLevel !== undefined && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-slate-300">
                            <Battery className="w-3 h-3 text-emerald-400 inline" />
                            {device.batteryLevel}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Signal, Connect/Disconnect button, Delete */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Signal indicator */}
                  {renderSignalBars(device.signalBars)}

                  {/* 1-Click Connect Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleConnect(device);
                    }}
                    disabled={isConnecting}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                      isConnected
                        ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30'
                        : 'bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/40'
                    }`}
                  >
                    {isConnecting ? (
                      <span className="flex items-center gap-1">
                        <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                        <span>Wait</span>
                      </span>
                    ) : isConnected ? (
                      'Disconnect'
                    ) : (
                      'Connect'
                    )}
                  </button>

                  {/* Forget/Remove button */}
                  <button
                    onClick={(e) => handleRemove(device.id, e)}
                    className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Remove device"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Platform Notice / Integration Transparency */}
      <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-[10px] text-slate-400 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
        <div className="leading-tight">
          <span className="text-slate-300 font-medium">Browser & Hardware Integration: </span>
          {adapterStatus.platformInfo} Pairings and authorizations persist in your browser profile.
        </div>
      </div>
    </div>
  );
};
