import { AudioOutputDevice } from '../types';
import { soundService } from './soundService';

const DEFAULT_DEVICES: AudioOutputDevice[] = [
  {
    id: 'default-speakers',
    label: 'Realtek High Definition Audio (Speakers)',
    kind: 'speaker',
    isDefault: true,
    isActive: true
  },
  {
    id: 'sony-xm5',
    label: 'Sony WH-1000XM5 (Stereo Bluetooth LDAC)',
    kind: 'headphones',
    isDefault: false,
    isActive: false
  },
  {
    id: 'airpods-pro',
    label: 'AirPods Pro (Spatial Audio)',
    kind: 'bluetooth',
    isDefault: false,
    isActive: false
  },
  {
    id: 'studio-monitor',
    label: 'Focusrite Scarlett 2i2 (Studio Monitors)',
    kind: 'monitor',
    isDefault: false,
    isActive: false
  }
];

class AudioDeviceService {
  private devices: AudioOutputDevice[] = [...DEFAULT_DEVICES];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.detectDevices();
  }

  private async detectDevices() {
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
        const mediaDevices = await navigator.mediaDevices.enumerateDevices();
        const audioOutputs = mediaDevices.filter((d) => d.kind === 'audiooutput');
        if (audioOutputs.length > 0) {
          const mapped: AudioOutputDevice[] = audioOutputs.map((d, i) => ({
            id: d.deviceId || `device-${i}`,
            label: d.label || `Audio Output ${i + 1}`,
            kind: d.label.toLowerCase().includes('headphone')
              ? 'headphones'
              : d.label.toLowerCase().includes('bluetooth')
              ? 'bluetooth'
              : 'speaker',
            isDefault: i === 0,
            isActive: i === 0
          }));
          this.devices = mapped;
          this.notify();
        }
      }
    } catch {
      // Fallback to default devices
    }
  }

  public getDevices(): AudioOutputDevice[] {
    return this.devices;
  }

  public getActiveDevice(): AudioOutputDevice {
    return this.devices.find((d) => d.isActive) || this.devices[0];
  }

  public selectDevice(deviceId: string): void {
    this.devices = this.devices.map((d) => ({
      ...d,
      isActive: d.id === deviceId
    }));
    soundService.play('button_click');
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }
}

export const audioDeviceService = new AudioDeviceService();
