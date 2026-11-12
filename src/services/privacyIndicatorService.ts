/**
 * Windows Privacy Indicators Service
 * Tracks camera (Green dot) and microphone (Orange dot) usage.
 * Integrates real WebRTC device state + Windows Desktop privacy indicators.
 */

export interface PrivacyDeviceState {
  cameraActive: boolean;
  cameraApp: string;
  microphoneActive: boolean;
  microphoneApp: string;
  lastChanged: number;
}

class PrivacyIndicatorService {
  private state: PrivacyDeviceState = {
    cameraActive: false,
    cameraApp: 'Windows Camera',
    microphoneActive: false,
    microphoneApp: 'Microphone Array',
    lastChanged: Date.now()
  };

  private listeners: Set<(state: PrivacyDeviceState) => void> = new Set();
  private realStream: MediaStream | null = null;

  constructor() {
    this.initDeviceWatcher();
  }

  private initDeviceWatcher() {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener?.('devicechange', () => {
        this.notify();
      });
    }
  }

  public getState(): PrivacyDeviceState {
    return { ...this.state };
  }

  public subscribe(cb: (state: PrivacyDeviceState) => void): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb({ ...this.state }));
  }

  public toggleCamera(active?: boolean, appName: string = 'Windows Camera') {
    const next = active !== undefined ? active : !this.state.cameraActive;
    this.state.cameraActive = next;
    this.state.cameraApp = appName;
    this.state.lastChanged = Date.now();
    this.notify();
    return next;
  }

  public toggleMicrophone(active?: boolean, appName: string = 'Microphone Array') {
    const next = active !== undefined ? active : !this.state.microphoneActive;
    this.state.microphoneActive = next;
    this.state.microphoneApp = appName;
    this.state.lastChanged = Date.now();
    this.notify();
    return next;
  }

  /**
   * Request real microphone stream to show real-world privacy indicator
   */
  public async requestRealMicrophone(): Promise<boolean> {
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return false;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.realStream = stream;
      this.toggleMicrophone(true, 'WebRTC Audio Capture');
      return true;
    } catch {
      // If blocked or unavailable, toggle simulated indicator for testing
      this.toggleMicrophone(true, 'Microphone (Active)');
      return false;
    }
  }

  public stopRealStream() {
    if (this.realStream) {
      this.realStream.getTracks().forEach((t) => t.stop());
      this.realStream = null;
    }
    this.toggleMicrophone(false);
    this.toggleCamera(false);
  }
}

export const privacyIndicatorService = new PrivacyIndicatorService();
