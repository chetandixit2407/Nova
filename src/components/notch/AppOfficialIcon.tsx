import React from 'react';

interface AppOfficialIconProps {
  appId: string;
  className?: string;
  size?: number;
}

export const AppOfficialIcon: React.FC<AppOfficialIconProps> = ({
  appId,
  className = 'w-9 h-9',
  size = 36
}) => {
  switch (appId.toLowerCase()) {
    // 1. Visual Studio Code (Official blue ribbon)
    case 'vscode':
    case 'code':
      return (
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          className={`${className} drop-shadow-md`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M74.3 94.6L96.2 84c2.3-1.1 3.8-3.5 3.8-6.1V22.1c0-2.6-1.5-5-3.8-6.1L74.3 5.4c-1.8-.9-4-.6-5.5.6L34.1 35.8 17.5 23.2c-1.6-1.2-3.7-1.4-5.5-.4L2.4 28.1C.9 28.9 0 30.5 0 32.2v35.6c0 1.7.9 3.3 2.4 4.1l9.6 5.3c1.8 1 3.9.8 5.5-.4l16.6-12.6 34.7 29.8c1.5 1.2 3.7 1.5 5.5.6z"
            fill="#0066B8"
          />
          <path
            d="M74.3 94.6c1.8.9 4 .6 5.5-.6l16.4-14.1c1.5-1.3 2.4-3.1 2.4-5.1V25.2c0-2-.9-3.9-2.4-5.1L79.8 6c-1.5-1.3-3.7-1.5-5.5-.6L34.1 35.8l34.7 29.8 5.5 29z"
            fill="#007ACC"
          />
          <path
            d="M74.3 5.4L34.1 35.8l8.2 6.3 32-24.5V5.4z"
            fill="#1F8AD2"
          />
          <path
            d="M74.3 94.6V82.4l-32-24.5-8.2 6.3 40.2 30.4z"
            fill="#005BA1"
          />
          <path
            d="M17.5 23.2c-1.6-1.2-3.7-1.4-5.5-.4L2.4 28.1C.9 28.9 0 30.5 0 32.2v35.6c0 1.7.9 3.3 2.4 4.1l9.6 5.3c1.8 1 3.9.8 5.5-.4l50.4-38.3L17.5 23.2z"
            fill="#007ACC"
          />
        </svg>
      );

    // 2. Google Chrome (Official 4-color circular design)
    case 'chrome':
    case 'googlechrome':
      return (
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          className={`${className} drop-shadow-md`}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Green sector */}
          <path
            d="M50 50l32.5 18.7A50 50 0 0110.8 78.3L30 45l20 5z"
            fill="#34A853"
          />
          {/* Yellow sector */}
          <path
            d="M50 50L30 45A50 50 0 0189.5 21L64.2 45.4 50 50z"
            fill="#FBBC05"
          />
          {/* Red sector */}
          <path
            d="M50 0A50 50 0 0189.5 21L64.2 45.4A21.5 21.5 0 0050 28.5V0z"
            fill="#EA4335"
          />
          <path
            d="M50 0a50 50 0 00-39.2 78.3L30 45a21.5 21.5 0 0120-16.5V0z"
            fill="#EA4335"
          />
          {/* White inner border */}
          <circle cx="50" cy="50" r="25" fill="#FFFFFF" />
          {/* Center blue circle */}
          <circle cx="50" cy="50" r="20" fill="#4285F4" />
        </svg>
      );

    // 3. Microsoft Edge (Official wave swirl)
    case 'edge':
    case 'msedge':
      return (
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          className={`${className} drop-shadow-md`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="edgeGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0C59A4" />
              <stop offset="100%" stopColor="#114A8B" />
            </linearGradient>
            <linearGradient id="edgeGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00A88E" />
              <stop offset="100%" stopColor="#028373" />
            </linearGradient>
            <linearGradient id="edgeGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2CD889" />
              <stop offset="100%" stopColor="#00B4D8" />
            </linearGradient>
          </defs>
          <path
            d="M87.3 64.7c-1.8 17.6-17.7 29.8-35.3 29.8-24.8 0-45-19.5-45-44.5 0-21.2 14.6-38.9 34.6-43.4 3.7-.8 8 .5 9.7 3.9 1.7 3.3.4 7.6-2.9 9.8-8.2 5.5-13.6 15-13.6 25.8 0 17 13.8 30.8 30.8 30.8 9.5 0 18-4.3 23.6-11.2l-1.9-1z"
            fill="url(#edgeGrad1)"
          />
          <path
            d="M93.5 48.7c-.5 9.5-5.3 18.2-12.7 23.9-6.4 5-14.7 7.9-23.7 7.9-19.4 0-35.3-15.1-36.1-34.3 5.4-8.8 14.4-14.8 25-15.9 16.4-1.7 31.8 8.7 35.8 24.3 4 1.7 8.2 4.1 11.7 7.1v-3z"
            fill="url(#edgeGrad2)"
          />
          <path
            d="M47.1 5.5c22.6 0 41.5 16 46.2 37.8-7.5-6.8-17.6-11-28.7-11-19.2 0-35.4 12.8-40.4 30.4C21.7 54.3 20 45.4 20 36 20 19.2 32.1 5.5 47.1 5.5z"
            fill="url(#edgeGrad3)"
          />
        </svg>
      );

    // 4. File Explorer (Official Windows 11 yellow & blue folder)
    case 'explorer':
    case 'files':
      return (
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          className={`${className} drop-shadow-md`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="folderBack" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0078D4" />
              <stop offset="100%" stopColor="#005A9E" />
            </linearGradient>
            <linearGradient id="folderFront" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFD338" />
              <stop offset="100%" stopColor="#F5A300" />
            </linearGradient>
          </defs>
          {/* Back tab */}
          <rect x="8" y="20" width="84" height="66" rx="8" fill="url(#folderBack)" />
          {/* Paper sheet */}
          <rect x="18" y="16" width="64" height="28" rx="4" fill="#E6F2FB" />
          {/* Front yellow flap */}
          <path
            d="M8 38c0-4.4 3.6-8 8-8h25l9 8h42c4.4 0 8 3.6 8 8v34c0 4.4-3.6 8-8 8H16c-4.4 0-8-3.6-8-8V38z"
            fill="url(#folderFront)"
          />
          {/* Folder line highlight */}
          <path
            d="M16 31h25l9 8h42c3.8 0 7 2.7 7.8 6.3A8 8 0 0092 38H50l-9-8H16a8 8 0 00-8 8c.8-3.6 4-6 8-6z"
            fill="#FFF"
            opacity="0.35"
          />
        </svg>
      );

    // 5. Windows Settings (Official Windows 11 Fluent Gear)
    case 'settings':
    case 'ms-settings':
      return (
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          className={`${className} drop-shadow-md`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="gearGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4A5568" />
              <stop offset="50%" stopColor="#2D3748" />
              <stop offset="100%" stopColor="#1A202C" />
            </linearGradient>
            <linearGradient id="accentBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="84" height="84" rx="20" fill="url(#gearGrad)" />
          {/* Cog teeth */}
          <path
            d="M50 26c1.8 0 3.3-1.2 3.8-2.9l1.2-4.1c.5-1.7 2.1-2.8 3.9-2.6l6 .7c1.8.2 3.1 1.6 3.3 3.4l.4 4.3c.2 1.8 1.5 3.2 3.2 3.6l4 1c1.7.4 3.4-.3 4.4-1.7l2.5-3.5c1-1.5 2.9-2 4.5-1.3l5.2 2.5c1.6.8 2.4 2.6 1.9 4.3l-1.2 4.1c-.5 1.7.2 3.5 1.7 4.5l3.5 2.5c1.5 1 2 2.9 1.3 4.5l-2.5 5.2c-.8 1.6-2.6 2.4-4.3 1.9l-4.1-1.2c-1.7-.5-3.5.2-4.5 1.7l-2.5 3.5c-1 1.5-1 3.5 0 5l2.5 3.5c1 1.5.5 3.5-1 4.5l-5.2 2.5c-1.6.8-3.5.2-4.5-1.3l-2.5-3.5c-1-1.5-3-2.1-4.7-1.7l-4 1c-1.8.4-3.1 1.8-3.3 3.6l-.4 4.3c-.2 1.8-1.5 3.2-3.3 3.4l-6-.7c-1.8-.2-3.4-1.3-3.9-3l-1.2-4.1c-.5-1.7-2-2.9-3.8-2.9s-3.3 1.2-3.8 2.9l-1.2 4.1c-.5 1.7-2.1 2.8-3.9 2.6l-6-.7c-1.8-.2-3.1-1.6-3.3-3.4l-.4-4.3c-.2-1.8-1.5-3.2-3.2-3.6l-4-1c-1.7-.4-3.4.3-4.4 1.7l-2.5 3.5c-1 1.5-2.9 2-4.5 1.3l-5.2-2.5c-1.6-.8-2.4-2.6-1.9-4.3l1.2-4.1c.5-1.7-.2-3.5-1.7-4.5l-3.5-2.5c-1.5-1-2-2.9-1.3-4.5l2.5-5.2c.8-1.6 2.6-2.4 4.3-1.9l4.1 1.2c1.7.5 3.5-.2 4.5-1.7l2.5-3.5c1-1.5 1-3.5 0-5l-2.5-3.5c-1-1.5-.5-3.5 1-4.5l5.2-2.5c1.6-.8 3.5-.2 4.5 1.3l2.5 3.5c1 1.5 3 2.1 4.7 1.7l4-1c1.8-.4 3.1-1.8 3.3-3.6l.4-4.3c.2-1.8 1.5-3.2 3.3-3.4l6 .7c1.8.2 3.4 1.3 3.9 3l1.2 4.1c.5 1.7 2 2.9 3.8 2.9z"
            fill="url(#accentBlue)"
          />
          <circle cx="50" cy="50" r="11" fill="#0F172A" />
        </svg>
      );

    // 6. Windows Terminal (Official >_ logo)
    case 'terminal':
    case 'powershell':
    case 'cmd':
      return (
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          className={`${className} drop-shadow-md`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="8" y="10" width="84" height="80" rx="16" fill="#1C1C1C" stroke="#333" strokeWidth="2" />
          <path
            d="M26 34l18 16-18 16"
            stroke="#10B981"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <line
            x1="52"
            y1="66"
            x2="74"
            y2="66"
            stroke="#10B981"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </svg>
      );

    // 7. Calculator (Fluent blue calc)
    case 'calculator':
    case 'calc':
      return (
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          className={`${className} drop-shadow-md`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="12" y="8" width="76" height="84" rx="16" fill="#0078D4" />
          {/* Display */}
          <rect x="22" y="18" width="56" height="18" rx="6" fill="#FFFFFF" opacity="0.95" />
          <text x="72" y="32" textAnchor="end" fill="#0F172A" fontSize="13" fontFamily="monospace" fontWeight="bold">0</text>
          {/* Buttons grid */}
          <rect x="22" y="44" width="14" height="10" rx="3" fill="#FFFFFF" opacity="0.4" />
          <rect x="42" y="44" width="14" height="10" rx="3" fill="#FFFFFF" opacity="0.4" />
          <rect x="62" y="44" width="16" height="10" rx="3" fill="#38BDF8" opacity="0.9" />
          <rect x="22" y="58" width="14" height="10" rx="3" fill="#FFFFFF" opacity="0.4" />
          <rect x="42" y="58" width="14" height="10" rx="3" fill="#FFFFFF" opacity="0.4" />
          <rect x="62" y="58" width="16" height="10" rx="3" fill="#38BDF8" opacity="0.9" />
          <rect x="22" y="72" width="14" height="10" rx="3" fill="#FFFFFF" opacity="0.4" />
          <rect x="42" y="72" width="14" height="10" rx="3" fill="#FFFFFF" opacity="0.4" />
          <rect x="62" y="72" width="16" height="10" rx="3" fill="#34D399" opacity="0.95" />
        </svg>
      );

    // 8. Notepad (Fluent blue memo with lines)
    case 'notepad':
      return (
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          className={`${className} drop-shadow-md`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="14" y="10" width="72" height="80" rx="12" fill="#0078D4" />
          <rect x="22" y="18" width="56" height="64" rx="6" fill="#FFFFFF" />
          {/* Notebook lines */}
          <line x1="30" y1="30" x2="68" y2="30" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
          <line x1="30" y1="42" x2="68" y2="42" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
          <line x1="30" y1="54" x2="68" y2="54" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
          <line x1="30" y1="66" x2="52" y2="66" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    // 9. Snipping Tool (Scissors & crop)
    case 'snippingtool':
    case 'snip':
      return (
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          className={`${className} drop-shadow-md`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="10" y="10" width="80" height="80" rx="18" fill="linear-gradient(135deg, #EC4899 0%, #BE185D 100%)" />
          {/* Crop frame */}
          <path
            d="M32 24v20h44v32"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M68 76H24V32"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      );

    // 10. Spotify (Official green wave icon)
    case 'spotify':
      return (
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          className={`${className} drop-shadow-md`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="44" fill="#1DB954" />
          <path
            d="M31 39c14.2-2.8 28.5-.7 40.5 5.3"
            stroke="#000000"
            strokeWidth="6.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M34 51c11.6-2.2 23.3-.5 33.2 4.5"
            stroke="#000000"
            strokeWidth="5.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M36 63c9.3-1.8 18.7-.3 26.6 3.6"
            stroke="#000000"
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      );

    // 11. Discord
    case 'discord':
      return (
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          className={`${className} drop-shadow-md`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="10" y="10" width="80" height="80" rx="20" fill="#5865F2" />
          <path
            d="M68.5 28s-4.6-2.3-9.5-3.3c-.4.8-1 2-1.4 3-5.2-.8-10.4-.8-15.6 0-.4-1-1-2.2-1.5-3-4.9 1-9.5 3.3-9.5 3.3C21 44.5 19 60.5 22 76.5c6.5 4.8 12.8 4.7 18.9 4.7 1.5-2.1 2.8-4.4 3.9-6.9-2.2-.8-4.3-2-6.2-3.3.5-.4 1.1-.7 1.6-1.1 12.3 5.7 25.6 5.7 37.8 0 .5.4 1.1.8 1.6 1.1-1.9 1.4-4 2.5-6.2 3.3 1.1 2.5 2.4 4.8 3.9 6.9 6.1 0 12.4.1 18.9-4.7 3.5-17.5 1-33.5-8.2-48.5zM39.5 61c-3.6 0-6.5-3.4-6.5-7.5s2.8-7.5 6.5-7.5 6.5 3.4 6.5 7.5c0 4.1-2.9 7.5-6.5 7.5zm21 0c-3.6 0-6.5-3.4-6.5-7.5s2.8-7.5 6.5-7.5 6.5 3.4 6.5 7.5c0 4.1-2.9 7.5-6.5 7.5z"
            fill="#FFFFFF"
          />
        </svg>
      );

    // Default Fallback: Sleek Windows Fluent App Tile
    default:
      return (
        <div
          className={`${className} rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md uppercase`}
          style={{ width: size, height: size, fontSize: Math.max(12, size * 0.36) }}
        >
          {appId.slice(0, 2)}
        </div>
      );
  }
};
