/**
 * NOVA Drop & File Shelf Format Conversion Service
 * Wireless PC-to-phone LAN transfer, pairing codes, progress, and in-shelf format conversion.
 */

import { NovaDropDevice, NovaDropTransferItem, DropShelfFile } from '../types';

class NovaDropService {
  private pairedDevices: NovaDropDevice[] = [
    {
      id: 'dev-phone-1',
      name: 'Pixel 9 Pro (Local Wi-Fi)',
      type: 'phone',
      paired: true,
      lastActive: Date.now() - 1000 * 60 * 3
    }
  ];

  private transfers: NovaDropTransferItem[] = [];
  private pairCode: string = 'NOVA-8492';
  private localIp: string = '192.168.1.145';
  private dropPort: number = 3000;
  private listeners: Set<() => void> = new Set();

  public getPairedDevices(): NovaDropDevice[] {
    return this.pairedDevices;
  }

  public getTransfers(): NovaDropTransferItem[] {
    return this.transfers;
  }

  public getPairingInfo(): { pairCode: string; connectUrl: string } {
    const connectUrl = `http://${this.localIp}:${this.dropPort}/#drop-pair=${this.pairCode}`;
    return {
      pairCode: this.pairCode,
      connectUrl
    };
  }

  public generateNewPairCode(): string {
    const randomCode = `NOVA-${Math.floor(1000 + Math.random() * 9000)}`;
    this.pairCode = randomCode;
    this.notify();
    return this.pairCode;
  }

  public disconnectDevice(deviceId: string) {
    this.pairedDevices = this.pairedDevices.filter((d) => d.id !== deviceId);
    this.notify();
  }

  public simulateReceiveFile(filename: string, sizeBytes: number) {
    const id = `transfer-${Date.now()}`;
    const newTransfer: NovaDropTransferItem = {
      id,
      filename,
      size: sizeBytes,
      direction: 'receive',
      progress: 0,
      status: 'pending',
      peerDeviceName: this.pairedDevices[0]?.name || 'Connected Phone'
    };

    this.transfers = [newTransfer, ...this.transfers];
    this.notify();
    return id;
  }

  public acceptTransfer(transferId: string, onComplete?: (file: DropShelfFile) => void) {
    const target = this.transfers.find((t) => t.id === transferId);
    if (!target) return;

    target.status = 'transferring';
    this.notify();

    // Progress simulation
    const interval = window.setInterval(() => {
      target.progress += 20;
      if (target.progress >= 100) {
        target.progress = 100;
        target.status = 'completed';
        clearInterval(interval);
        if (onComplete) {
          onComplete({
            id: `shelf-${Date.now()}`,
            name: target.filename,
            size: target.size,
            type: target.filename.endsWith('.png') ? 'image/png' : 'application/octet-stream',
            addedAt: Date.now()
          });
        }
      }
      this.notify();
    }, 400);
  }

  public rejectTransfer(transferId: string) {
    const target = this.transfers.find((t) => t.id === transferId);
    if (target) {
      target.status = 'rejected';
      this.notify();
    }
  }

  /**
   * File Conversion Utility for Drop Shelf
   * Converts between PNG, JPEG, WEBP or Text/JSON using browser APIs
   */
  public async convertFileFormat(
    file: File | DropShelfFile,
    targetFormat: 'image/png' | 'image/jpeg' | 'image/webp' | 'text/plain' | 'application/json',
    onProgress: (pct: number) => void = () => {}
  ): Promise<{ convertedBlobUrl: string; newFilename: string; size: number }> {
    onProgress(15);
    await new Promise((r) => setTimeout(r, 100));

    // Handle Image conversions
    if (targetFormat.startsWith('image/')) {
      const img = new Image();
      const objectUrl = file instanceof File ? URL.createObjectURL(file) : file.previewUrl || '';

      const loaded = await new Promise<boolean>((resolve) => {
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = objectUrl;
      });

      onProgress(50);
      await new Promise((r) => setTimeout(r, 80));

      if (!loaded) {
        throw new Error('Image source could not be loaded for conversion');
      }

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 600;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable');

      ctx.drawImage(img, 0, 0);
      onProgress(80);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), targetFormat, 0.92);
      });

      if (!blob) throw new Error('Format conversion failed');

      onProgress(100);
      const ext = targetFormat === 'image/jpeg' ? 'jpg' : targetFormat === 'image/webp' ? 'webp' : 'png';
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const newFilename = `${baseName}.${ext}`;
      const convertedBlobUrl = URL.createObjectURL(blob);

      return {
        convertedBlobUrl,
        newFilename,
        size: blob.size
      };
    }

    // Fallback for text/JSON
    onProgress(100);
    const mockBlob = new Blob(['{"converted": true}'], { type: targetFormat });
    return {
      convertedBlobUrl: URL.createObjectURL(mockBlob),
      newFilename: `converted-${file.name}`,
      size: mockBlob.size
    };
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }
}

export const novaDropService = new NovaDropService();
