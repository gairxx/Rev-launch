import React, { useState } from 'react';

interface SubscriptionModalProps {
  onSubscribe: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onSubscribe }) => {
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'diy' | 'pro'>('diy');

  const handleSubscribe = () => {
    setLoading(true);
    // Simulate payment processing delay
    setTimeout(() => {
      setLoading(false);
      onSubscribe();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gemini-900/90 backdrop-blur-md p-4 overflow-y-auto">
      <div className="max-w-4xl w-full bg-gemini-800 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Sales Pitch Side */}
        <div className="p-8 md:w-1/2 bg-gradient-to-br from-blue-900/40 to-gemini-900 flex flex-col justify-between relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
          
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              REVO <span className="text-blue-400">PRO</span>
            </h1>
            <p className="text-blue-200 font-mono text-sm mb-8 uppercase tracking-widest">Master Technician AI</p>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 text-blue-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                </div>
                <div>
                  <h3 className="font-bold text-white">Stop Guessing parts.</h3>
                  <p className="text-gray-400 text-sm">Don't fire the parts cannon. Revo analyzes symptoms against millions of TSBs and factory repair procedures to pinpoint the actual fault.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 text-purple-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                  <h3 className="font-bold text-white">Save Shop Labor.</h3>
                  <p className="text-gray-400 text-sm">At $150/hr, a mechanic's diagnosis is expensive. Revo gives you the diagnostic logic instantly, 24/7.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 text-green-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                  <h3 className="font-bold text-white">OEM Precision.</h3>
                  <p className="text-gray-400 text-sm">Torque specs. Fluid capacities. Bolt sizes. Wiring pinouts. No more searching obscure forums.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-gray-500 italic">"I designed Revo to replace the shelf of dusty shop manuals. Access to this level of data usually costs shops $200+ a month." — Developer's Note</p>
          </div>
        </div>

        {/* Pricing Side */}
        <div className="p-8 md:w-1/2 bg-gemini-800 flex flex-col">
          <h2 className="text-2xl font-bold text-center text-white mb-6">Select Your Tier</h2>
          
          <div className="flex-1 space-y-4">
            {/* DIY Tier */}
            <div 
              onClick={() => setSelectedTier('diy')}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedTier === 'diy' 
                  ? 'border-blue-500 bg-blue-900/20 shadow-lg shadow-blue-900/20' 
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-white">Weekend Wrench</h3>
                <span className="text-xl font-bold text-blue-400">$14.99<span className="text-sm text-gray-500 font-normal">/mo</span></span>
              </div>
              <p className="text-sm text-gray-400">Perfect for the home mechanic maintaining 1-3 vehicles.</p>
              {selectedTier === 'diy' && (
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  POPULAR
                </div>
              )}
            </div>

            {/* Pro Tier */}
            <div 
              onClick={() => setSelectedTier('pro')}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedTier === 'pro' 
                  ? 'border-purple-500 bg-purple-900/20 shadow-lg shadow-purple-900/20' 
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-white">Shop Professional</h3>
                <span className="text-xl font-bold text-purple-400">$49.99<span className="text-sm text-gray-500 font-normal">/mo</span></span>
              </div>
              <p className="text-sm text-gray-400">Unlimited VINs. Deep-dive schematics. Priority processing speed.</p>
            </div>

            <div className="mt-8 space-y-3">
              <div className="flex items-center justify-between text-sm text-gray-300">
                <span>Due Today (7-Day Trial)</span>
                <span className="font-mono font-bold text-white">$0.00</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>First charge on {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                <span className="font-mono">{selectedTier === 'diy' ? '$14.99' : '$49.99'}</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transform transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Secure Key...
                </span>
              ) : (
                "Start Free 7-Day Trial"
              )}
            </button>
            <p className="text-center text-xs text-gray-500 mt-4">
              Secure 256-bit SSL Encrypted. Cancel anytime in app settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;