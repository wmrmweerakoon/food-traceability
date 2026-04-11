import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QrCode, X, Camera, RefreshCw, AlertCircle, Info } from 'lucide-react';

function QRScannerModal({ onScanSuccess, onClose }) {
  const qrRegionId = "html5qr-code-full-region";
  const scannerRef = useRef(null);
  const [error, setError] = useState('');
  const [cameraPermission, setCameraPermission] = useState('pending'); // 'pending', 'granted', 'denied'

  useEffect(() => {
    // Initialize scanner
    const html5QrCode = new Html5Qrcode(qrRegionId);
    scannerRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        
        await html5QrCode.start(
          { facingMode: "environment" }, // Prefer back camera
          config,
          (decodedText) => {
            // Success!
            html5QrCode.stop().then(() => {
              onScanSuccess(decodedText);
            }).catch(err => console.error("Error stopping scanner:", err));
          },
          (errorMessage) => {
            // Silent error during scanning (e.g. no QR in frame)
          }
        );
        setCameraPermission('granted');
      } catch (err) {
        console.error("Camera error:", err);
        setCameraPermission('denied');
        setError(err.message || 'Camera access denied');
      }
    };

    startScanner();

    // Cleanup on unmount
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(e => console.error("Cleanup stop failed", e));
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* 🌑 Deep Backdrop */}
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose}></div>

      {/* 🕋 The Scan Terminal */}
      <div className="relative w-full max-w-lg bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-white/20 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        
        {/* Terminal Header */}
        <div className="bg-slate-900 border-b border-slate-800 p-8 flex items-center justify-between">
           <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                 <QrCode className="text-white w-5 h-5" />
              </div>
              <div>
                 <h2 className="text-white text-lg font-black tracking-tight">Identity Scan Terminal</h2>
                 <p className="text-blue-400 text-[9px] font-black uppercase tracking-[2px] mt-0.5">AgriTrace Enterprise Protocol</p>
              </div>
           </div>
           <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
           </button>
        </div>

        {/* Camera Viewport Area */}
        <div className="p-6">
           <div className="relative aspect-square bg-slate-950 rounded-[2.5rem] overflow-hidden border-4 border-slate-100 shadow-inner group">
              
              {/* The QR Target Area Overlay */}
              <div id={qrRegionId} className="w-full h-full object-cover"></div>

              {/* Laser Target Effect */}
              {cameraPermission === 'granted' && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                   <div className="w-[250px] h-[250px] border-2 border-blue-500/40 rounded-[2rem] relative">
                      {/* Corner Accents */}
                      <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                      <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                      <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                      
                      {/* Scanning Animated Line */}
                      <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent top-0 animate-scan-line"></div>
                   </div>
                </div>
              )}

              {/* Permission States */}
              {cameraPermission === 'pending' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white p-8 text-center">
                   <Camera className="w-12 h-12 text-blue-500 animate-pulse mb-4" />
                   <p className="text-sm font-black uppercase tracking-widest text-slate-300">Requesting Camera Access...</p>
                </div>
              )}

              {cameraPermission === 'denied' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-950 text-white p-10 text-center">
                   <AlertCircle className="w-12 h-12 text-rose-400 mb-4" />
                   <h3 className="font-bold text-lg mb-2">Access Denied</h3>
                   <p className="text-xs text-rose-200 leading-relaxed font-medium">Please enable camera permissions in your browser settings to scan the product identity chain.</p>
                </div>
              )}
           </div>
        </div>

        {/* Footer Info */}
        <div className="bg-slate-50 p-8 border-t border-slate-100">
           <div className="flex items-start space-x-3 text-slate-500">
              <Info className="w-4 h-4 mt-0.5 text-blue-600" />
              <p className="text-[11px] font-medium leading-relaxed">
                 Center the product QR code within the target frame. Ensure the environment is well-lit for rapid cryptographic decoding. 
                 <br />
                 <span className="font-black text-blue-600 uppercase tracking-widest mt-2 block">Enterprise Encryption Enabled</span>
              </p>
           </div>
        </div>
      </div>

      <style>{`
        @keyframes scan-line {
          0% { top: 0% }
          50% { top: 100% }
          100% { top: 0% }
        }
        .animate-scan-line {
          animation: scan-line 3s ease-in-out infinite;
        }
        #html5qr-code-full-region video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
          border-radius: 2rem !important;
        }
      `}</style>
    </div>
  );
}

export default QRScannerModal;
