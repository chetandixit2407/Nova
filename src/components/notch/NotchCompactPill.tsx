import React from 'react';
import { VayllEye } from './VayllEye';

/**
 * Vault-Style Minimal Notch Pill:
 * In collapsed state, displays ONLY two minimal animated eyes.
 * No text, app names, icons, status, or other telemetry.
 */
export const NotchCompactPill: React.FC = () => {
  return (
    <div
      className="w-full h-full flex items-center justify-center select-none overflow-hidden cursor-default"
      title="NOVA Smart Notch • Hover to expand app launcher"
    >
      <VayllEye size="md" interactive={true} />
    </div>
  );
};
