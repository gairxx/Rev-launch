import React, { useState } from 'react';
import { Vehicle, TSB } from '../types';
import { searchTSBs } from '../services/tsbService';

interface TSBSearchModalProps {
  vehicle: Vehicle;
  onClose: () => void;
  onDiscuss: (tsb: TSB) => void;
}

const TSBSearchModal: React.FC<TSBSearchModalProps> = ({ vehicle, onClose, onDiscuss }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TSB[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResults([]);
    setHasSearched(true);

    try {
      const data = await searchTSBs(vehicle, query);
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gemini-900/80 backdrop-blur-sm p-4">
      <div className="bg-gemini-800 w-full max-w-2xl rounded-2xl border border-gray-700 shadow-2xl flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              TSB Database Lookup
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Searching NHTSA/OEM records for {vehicle.year} {vehicle.make} {vehicle.model}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 bg-gemini-900/50">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter DTC (e.g. P0300), Symptom, or Component..."
              className="flex-1 bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white px-6 rounded-xl font-semibold transition shadow-lg"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[300px]">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full space-y-4 text-gray-500">
              <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <p>Scanning Technical Bulletins...</p>
            </div>
          )}

          {!loading && hasSearched && results.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
               <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               <p>No TSBs found matching your query.</p>
            </div>
          )}

          {!loading && results.map((tsb) => (
            <div key={tsb.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-blue-500/50 transition group">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="bg-blue-900/40 text-blue-300 text-xs font-mono px-2 py-1 rounded border border-blue-500/20 mr-2">
                    {tsb.bulletinNumber}
                  </span>
                  <span className="text-gray-400 text-xs">{tsb.date}</span>
                </div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{tsb.component}</span>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2">{tsb.title}</h3>
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">{tsb.summary}</p>
              
              <button 
                onClick={() => onDiscuss(tsb)}
                className="text-sm font-semibold text-blue-400 group-hover:text-blue-300 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                Discuss Repair with Revo
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TSBSearchModal;