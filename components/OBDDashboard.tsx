
import React, { useState } from 'react';
import { OBDData } from '../types';

interface OBDDashboardProps {
  data: OBDData;
  onConnect: () => void;
  onDisconnect: () => void;
  onScanDTCs: () => Promise<void>;
  onDiscussDTCs: (codes: string[]) => void;
  connectionStatus: boolean;
}

const OBDDashboard: React.FC<OBDDashboardProps> = ({ 
  data, 
  onConnect, 
  onDisconnect, 
  onScanDTCs,
  onDiscussDTCs,
  connectionStatus 
}) => {
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    setIsScanning(true);
    await onScanDTCs();
    // Allow some time for queue to process if needed, or rely on update
    setTimeout(() => setIsScanning(false), 2000);
  };
  
  const Gauge = ({ label, value, unit, max, color }: { label: string, value: number, unit: string, max: number, color: string }) => {
    const percent = Math.min(Math.max(value / max, 0), 1);
    const rotation = -90 + (percent * 180);
    
    return (
      <div className="flex flex-col items-center bg-gray-800/50 p-4 rounded-xl border border-gray-700 w-full">
        <div className="relative w-24 h-12 overflow-hidden mb-2">
           <div className="absolute top-0 left-0 w-24 h-24 rounded-full border-[10px] border-gray-700 box-border"></div>
           <div 
             className={`absolute top-0 left-0 w-24 h-24 rounded-full border-[10px] ${color} box-border transition-transform duration-500 ease-out`}
             style={{ 
                 transform: `rotate(${rotation}deg)`, 
                 borderBottomColor: 'transparent',
                 borderLeftColor: 'transparent' 
             }}
           ></div>
        </div>
        <span className="text-2xl font-bold font-mono text-white">{Math.round(value)}</span>
        <span className="text-xs text-gray-400 uppercase tracking-wider">{label} ({unit})</span>
      </div>
    );
  };

  return (
    <div className="mt-4 space-y-4">
      {/* Live Data Section */}
      <div className="p-4 bg-black/40 rounded-xl border border-blue-900/30 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${connectionStatus ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <h3 className="font-bold text-gray-200">Live Telemetry</h3>
          </div>
          
          {!connectionStatus ? (
              <button 
                  onClick={onConnect}
                  className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition flex items-center gap-2"
              >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  Link OBDII (BLE)
              </button>
          ) : (
               <button 
                  onClick={onDisconnect}
                  className="text-xs bg-red-900/50 hover:bg-red-900 text-red-200 px-3 py-1.5 rounded-lg transition"
              >
                  Disconnect
              </button>
          )}
        </div>

        {connectionStatus ? (
            <div className="grid grid-cols-3 gap-4">
              <Gauge label="Engine" value={data.rpm} unit="RPM" max={8000} color="border-blue-500" />
              <Gauge label="Speed" value={data.speed} unit="KM/H" max={240} color="border-green-500" />
              <Gauge label="Temp" value={data.temp} unit="°C" max={130} color={data.temp > 100 ? 'border-red-500' : 'border-orange-500'} />
            </div>
        ) : (
            <div className="text-center py-6 text-gray-500 text-sm border-2 border-dashed border-gray-800 rounded-xl">
                <p className="mb-2">Compatible with Bluetooth LE Adapters</p>
                <p className="text-xs text-gray-600">(Veepeak BLE, Carista, Laukder)</p>
            </div>
        )}
      </div>

      {/* DTC Section */}
      {connectionStatus && (
        <div className="p-4 bg-black/40 rounded-xl border border-orange-900/30 backdrop-blur-sm">
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-200 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Diagnostic Trouble Codes
              </h3>
              <button 
                onClick={handleScan}
                disabled={isScanning}
                className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                     <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                     Scanning...
                  </>
                ) : (
                  "Scan for Codes"
                )}
              </button>
           </div>

           {data.dtcs && data.dtcs.length > 0 ? (
             <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    {data.dtcs.map(code => (
                      <span key={code} className="bg-red-900/40 text-red-200 border border-red-800 px-3 py-1 rounded-lg font-mono font-bold">
                        {code}
                      </span>
                    ))}
                </div>
                <button 
                   onClick={() => onDiscussDTCs(data.dtcs)}
                   className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-semibold text-sm transition flex justify-center items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                  Discuss DTCs with Revo
                </button>
             </div>
           ) : (
             <div className="text-center py-4 text-gray-500 text-sm">
                {isScanning ? "Communicating with ECU..." : "No active fault codes detected or scan not performed."}
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default OBDDashboard;
