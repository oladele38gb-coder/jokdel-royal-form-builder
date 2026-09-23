import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, Trash2, Check, PenLine } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signatureDataUrl: string) => void;
  onClose: () => void;
  tenantName?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onClose, tenantName }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina display fix
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1B2A5C';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getPos(e, canvas);
    setIsDrawing(true);
    setLastPos(pos);
    setIsEmpty(false);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 1, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !lastPos) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setLastPos(pos);
  }, [isDrawing, lastPos]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    setLastPos(null);
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(17, 28, 62, 0.55)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in-up overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(27,42,92,0.08)' }}>
              <PenLine className="w-4 h-4" style={{ color: '#1B2A5C' }} />
            </div>
            <div>
              <h2 className="font-semibold text-sm" style={{ color: '#1B2A5C' }}>Draw Your Signature</h2>
              <p className="text-xs" style={{ color: '#64748b' }}>Sign in the box below using your mouse or finger</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Canvas Area */}
        <div className="px-5 py-4">
          {tenantName && (
            <p className="text-xs mb-3" style={{ color: '#64748b' }}>
              Signing as: <strong style={{ color: '#1B2A5C' }}>{tenantName}</strong>
            </p>
          )}

          <div className="relative rounded-xl overflow-hidden border-2 border-dashed transition-colors" style={{ borderColor: '#cbd5e1' }}>
            <canvas
              ref={canvasRef}
              className="w-full block"
              style={{ height: '180px', cursor: 'crosshair', touchAction: 'none', background: '#fff' }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            {isEmpty && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <p className="text-sm font-medium" style={{ color: '#cbd5e1' }}>Sign here</p>
              </div>
            )}
          </div>

          <p className="text-[11px] mt-2 text-center" style={{ color: '#94a3b8' }}>
            By signing, you confirm all information provided is accurate and complete.
          </p>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between px-5 pb-5 gap-3">
          <button
            onClick={clearCanvas}
            disabled={isEmpty}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ borderColor: '#e2e8f0', color: '#64748b' }}
            onMouseEnter={e => !isEmpty && (e.currentTarget.style.background = '#f8fafc')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
              style={{ borderColor: '#e2e8f0', color: '#64748b' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isEmpty}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#1B2A5C' }}
              onMouseEnter={e => !isEmpty && (e.currentTarget.style.background = '#111c3e')}
              onMouseLeave={e => (e.currentTarget.style.background = '#1B2A5C')}
            >
              <Check className="w-4 h-4" />
              Apply Signature
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
