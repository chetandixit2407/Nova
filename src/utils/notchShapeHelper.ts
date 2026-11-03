import { ToastNotification } from '../types';

export interface NotificationShapeConfig {
  type: string;
  width: number;
  height: number;
  cornerRadius: number;
  glowColor: string;
  border: string;
  bg: string;
  eyeExpression: 'auto' | 'normal' | 'alert' | 'happy' | 'sleepy' | 'focused' | 'wink' | 'look-right' | 'look-left';
}

export const getNotificationShapeConfig = (toast: ToastNotification): NotificationShapeConfig => {
  const t = (toast.animType || toast.title || toast.appName || toast.icon || '').toLowerCase();

  // 1. Download complete / Success / Merged
  if (
    t.includes('download_complete') ||
    t.includes('succeeded') ||
    t.includes('merged') ||
    t.includes('completed') ||
    t.includes('success')
  ) {
    return {
      type: 'download_complete',
      width: 320,
      height: 42,
      cornerRadius: 21,
      glowColor: '#10b981',
      border: '1px solid rgba(16, 185, 129, 0.6)',
      bg: 'rgba(6, 26, 18, 0.96)',
      eyeExpression: 'happy'
    };
  }

  // 2. Download / Install / File transfer
  if (
    t.includes('download') ||
    t.includes('install') ||
    t.includes('upload') ||
    t.includes('transfer') ||
    t.includes('copying')
  ) {
    return {
      type: 'download',
      width: 405,
      height: 48,
      cornerRadius: 24, // Elongated high-tech pill
      glowColor: '#06b6d4',
      border: '1px solid rgba(6, 182, 212, 0.6)',
      bg: 'rgba(8, 24, 34, 0.96)',
      eyeExpression: 'look-right'
    };
  }

  // 3. Error / Failed / Crash / Critical
  if (
    t.includes('error') ||
    t.includes('danger') ||
    t.includes('failed') ||
    t.includes('crash') ||
    toast.priority === 'urgent'
  ) {
    return {
      type: 'error',
      width: 380,
      height: 50,
      cornerRadius: 12, // Distinct squarish alert badge
      glowColor: '#f43f5e',
      border: '1px solid rgba(244, 63, 94, 0.75)',
      bg: 'rgba(38, 8, 14, 0.96)',
      eyeExpression: 'alert'
    };
  }

  // 4. Warning / Attention / Threat
  if (t.includes('warn') || t.includes('caution') || t.includes('threat')) {
    return {
      type: 'warning',
      width: 360,
      height: 46,
      cornerRadius: 16, // Distinct chamfered shape
      glowColor: '#f59e0b',
      border: '1px solid rgba(245, 158, 11, 0.65)',
      bg: 'rgba(32, 20, 6, 0.96)',
      eyeExpression: 'alert'
    };
  }

  // 5. Battery low / Power
  if (t.includes('battery') || t.includes('power') || t.includes('charge')) {
    return {
      type: 'battery_low',
      width: 335,
      height: 44,
      cornerRadius: 18,
      glowColor: '#ef4444',
      border: '1px solid rgba(239, 68, 68, 0.65)',
      bg: 'rgba(34, 10, 10, 0.96)',
      eyeExpression: 'sleepy'
    };
  }

  // 6. Music / Audio / Track
  if (t.includes('music') || t.includes('spotify') || t.includes('track') || t.includes('sound')) {
    return {
      type: 'music',
      width: 355,
      height: 44,
      cornerRadius: 22,
      glowColor: '#a855f7',
      border: '1px solid rgba(168, 85, 247, 0.6)',
      bg: 'rgba(24, 10, 38, 0.96)',
      eyeExpression: 'look-right'
    };
  }

  // 7. Timer / Clock
  if (t.includes('timer') || t.includes('pomodoro') || t.includes('alarm') || t.includes('clock')) {
    return {
      type: 'timer_complete',
      width: 305,
      height: 42,
      cornerRadius: 21,
      glowColor: '#f97316',
      border: '1px solid rgba(249, 115, 22, 0.65)',
      bg: 'rgba(30, 14, 6, 0.96)',
      eyeExpression: 'alert'
    };
  }

  // 8. System update / Sync
  if (t.includes('update') || t.includes('sync') || t.includes('refresh') || t.includes('patch')) {
    return {
      type: 'system_update',
      width: 355,
      height: 46,
      cornerRadius: 18,
      glowColor: '#3b82f6',
      border: '1px solid rgba(59, 130, 246, 0.6)',
      bg: 'rgba(10, 20, 42, 0.96)',
      eyeExpression: 'look-right'
    };
  }

  // 9. Message / Chat / Communication
  if (t.includes('message') || t.includes('chat') || t.includes('mail') || t.includes('sms')) {
    return {
      type: 'message',
      width: 345,
      height: 44,
      cornerRadius: 22,
      glowColor: '#38bdf8',
      border: '1px solid rgba(56, 189, 248, 0.55)',
      bg: 'rgba(8, 20, 36, 0.96)',
      eyeExpression: 'look-right'
    };
  }

  // Default Standard Notification
  return {
    type: 'default',
    width: 335,
    height: 42,
    cornerRadius: 21,
    glowColor: '#38bdf8',
    border: '1px solid rgba(56, 189, 248, 0.5)',
    bg: 'rgba(10, 16, 28, 0.96)',
    eyeExpression: 'look-right'
  };
};
