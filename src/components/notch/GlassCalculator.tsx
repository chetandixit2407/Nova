import React, { useState } from 'react';
import { Delete, ArrowLeft, Equal } from 'lucide-react';
import { soundService } from '../../services/soundService';

interface GlassCalculatorProps {
  onClose?: () => void;
}

export const GlassCalculator: React.FC<GlassCalculatorProps> = ({ onClose }) => {
  const [display, setDisplay] = useState<string>('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);

  const inputDigit = (digit: string) => {
    soundService.playTick();
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDot = () => {
    soundService.playTick();
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clearAll = () => {
    soundService.playTick();
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const handleBackspace = () => {
    soundService.playTick();
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const performOperation = (nextOperator: string) => {
    soundService.playTick();
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operator) {
      const currentValue = prevValue || 0;
      let newValue = currentValue;

      switch (operator) {
        case '+':
          newValue = currentValue + inputValue;
          break;
        case '−':
        case '-':
          newValue = currentValue - inputValue;
          break;
        case '×':
        case '*':
          newValue = currentValue * inputValue;
          break;
        case '÷':
        case '/':
          newValue = inputValue !== 0 ? currentValue / inputValue : 0;
          break;
        case '%':
          newValue = (currentValue * inputValue) / 100;
          break;
        default:
          break;
      }

      setPrevValue(newValue);
      setDisplay(String(Number(newValue.toFixed(8))));
    }

    setWaitingForOperand(true);
    setOperator(nextOperator === '=' ? null : nextOperator);
  };

  return (
    <div className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <span className="text-xs font-bold text-white tracking-tight">Windows Quick Calculator</span>
        </div>
        <button
          onClick={clearAll}
          className="text-[10px] font-mono text-sky-400 hover:text-sky-300 px-2 py-0.5 rounded bg-sky-500/10 cursor-pointer"
        >
          CLEAR ALL
        </button>
      </div>

      {/* Screen Display */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-3 text-right">
        <div className="text-[10px] font-mono text-slate-400 h-4">
          {prevValue !== null && operator ? `${prevValue} ${operator}` : ''}
        </div>
        <div className="text-2xl font-mono font-bold text-white tracking-wider truncate">
          {display}
        </div>
      </div>

      {/* Calculator Buttons Grid */}
      <div className="grid grid-cols-4 gap-2 text-xs font-mono">
        <button
          onClick={clearAll}
          className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-rose-300 font-semibold transition-colors cursor-pointer"
        >
          C
        </button>
        <button
          onClick={handleBackspace}
          className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
        >
          <Delete className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => performOperation('%')}
          className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sky-400 font-semibold transition-colors cursor-pointer"
        >
          %
        </button>
        <button
          onClick={() => performOperation('÷')}
          className="py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold transition-colors cursor-pointer"
        >
          ÷
        </button>

        {['7', '8', '9'].map((n) => (
          <button
            key={n}
            onClick={() => inputDigit(n)}
            className="py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/10 text-white font-medium transition-colors cursor-pointer"
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => performOperation('×')}
          className="py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold transition-colors cursor-pointer"
        >
          ×
        </button>

        {['4', '5', '6'].map((n) => (
          <button
            key={n}
            onClick={() => inputDigit(n)}
            className="py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/10 text-white font-medium transition-colors cursor-pointer"
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => performOperation('-')}
          className="py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold transition-colors cursor-pointer"
        >
          −
        </button>

        {['1', '2', '3'].map((n) => (
          <button
            key={n}
            onClick={() => inputDigit(n)}
            className="py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/10 text-white font-medium transition-colors cursor-pointer"
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => performOperation('+')}
          className="py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold transition-colors cursor-pointer"
        >
          +
        </button>

        <button
          onClick={() => inputDigit('0')}
          className="col-span-2 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/10 text-white font-medium transition-colors cursor-pointer"
        >
          0
        </button>
        <button
          onClick={inputDot}
          className="py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/10 text-white font-medium transition-colors cursor-pointer"
        >
          .
        </button>
        <button
          onClick={() => performOperation('=')}
          className="py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold flex items-center justify-center transition-colors cursor-pointer shadow-md"
        >
          <Equal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
