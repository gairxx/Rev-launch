
import React, { useState } from 'react';
import { WiringDiagram, WiringNode, WiringConnection } from '../types';

interface WiringDiagramViewerProps {
  diagram: WiringDiagram;
}

const WiringDiagramViewer: React.FC<WiringDiagramViewerProps> = ({ diagram }) => {
  const [selectedItem, setSelectedItem] = useState<WiringNode | WiringConnection | null>(null);

  // Helper to determine node color/shape based on type
  const getNodeStyle = (type: string) => {
    switch (type) {
      case 'power': return { fill: '#EF4444', stroke: '#991B1B', shape: 'rect' }; // Red
      case 'ground': return { fill: '#1F2937', stroke: '#9CA3AF', shape: 'ground' }; // Dark Grey
      case 'fuse': return { fill: '#F59E0B', stroke: '#B45309', shape: 'rect' }; // Orange
      case 'relay': return { fill: '#3B82F6', stroke: '#1E40AF', shape: 'rect' }; // Blue
      case 'switch': return { fill: '#10B981', stroke: '#047857', shape: 'circle' }; // Green
      case 'module': return { fill: '#6366F1', stroke: '#4338CA', shape: 'rect' }; // Indigo
      default: return { fill: '#4B5563', stroke: '#374151', shape: 'rect' };
    }
  };

  const handleNodeClick = (node: WiringNode) => {
    setSelectedItem(node);
  };

  const handleConnectionClick = (conn: WiringConnection) => {
    setSelectedItem(conn);
  };

  return (
    <div className="mt-4 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-lg flex flex-col md:flex-row">
      {/* Visualizer Area */}
      <div className="flex-1 p-4 bg-[#0B0F19] relative min-h-[300px]">
        <h3 className="absolute top-2 left-4 text-xs font-mono text-gray-500 uppercase tracking-wider z-10">
          Schematic: {diagram.title}
        </h3>
        
        <svg viewBox="0 0 100 100" className="w-full h-full select-none">
          <defs>
            <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="8" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="#6B7280" />
            </marker>
          </defs>

          {/* Connections (Wires) */}
          {diagram.connections.map((conn, idx) => {
            const startNode = diagram.nodes.find(n => n.id === conn.from);
            const endNode = diagram.nodes.find(n => n.id === conn.to);
            if (!startNode || !endNode) return null;

            // Simple direct line for now. Ideally would be orthogonal routing.
            const isSelected = selectedItem && 'from' in selectedItem && selectedItem.id === conn.id; // Hacky check
            
            return (
              <g key={idx} onClick={() => handleConnectionClick({ ...conn, id: `c-${idx}` })}>
                <line
                  x1={startNode.x}
                  y1={startNode.y}
                  x2={endNode.x}
                  y2={endNode.y}
                  stroke={isSelected ? '#3B82F6' : '#4B5563'}
                  strokeWidth={isSelected ? "1.5" : "0.8"}
                  className="cursor-pointer hover:stroke-blue-400 transition-colors"
                />
                {conn.label && (
                  <text 
                    x={(startNode.x + endNode.x) / 2} 
                    y={(startNode.y + endNode.y) / 2 - 1} 
                    fontSize="2.5" 
                    fill="#9CA3AF" 
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {conn.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes (Components) */}
          {diagram.nodes.map((node) => {
            const style = getNodeStyle(node.type);
            const isSelected = selectedItem && 'label' in selectedItem && selectedItem.id === node.id;

            return (
              <g 
                key={node.id} 
                onClick={() => handleNodeClick(node)} 
                className="cursor-pointer group"
                transform={`translate(${node.x}, ${node.y})`}
              >
                {/* Selection Halo */}
                {isSelected && (
                  <circle r="6" fill="none" stroke="#60A5FA" strokeWidth="0.5" className="animate-pulse" />
                )}

                {style.shape === 'rect' && (
                  <rect 
                    x="-4" y="-3" width="8" height="6" 
                    rx="1"
                    fill={style.fill} 
                    stroke={style.stroke} 
                    strokeWidth="0.5"
                    className="transition-all group-hover:brightness-110"
                  />
                )}
                {style.shape === 'circle' && (
                  <circle 
                    r="3.5" 
                    fill={style.fill} 
                    stroke={style.stroke} 
                    strokeWidth="0.5"
                    className="transition-all group-hover:brightness-110"
                  />
                )}
                {style.shape === 'ground' && (
                  <g>
                    <line x1="-3" y1="0" x2="3" y2="0" stroke={style.stroke} strokeWidth="0.5" />
                    <line x1="-2" y1="1.5" x2="2" y2="1.5" stroke={style.stroke} strokeWidth="0.5" />
                    <line x1="-1" y1="3" x2="1" y2="3" stroke={style.stroke} strokeWidth="0.5" />
                  </g>
                )}

                {/* Label */}
                <text 
                  y={style.shape === 'ground' ? 6 : -4.5} 
                  fontSize="3" 
                  fill="white" 
                  textAnchor="middle" 
                  fontWeight="bold"
                  className="pointer-events-none drop-shadow-md"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Info Panel */}
      <div className="w-full md:w-64 bg-gray-800 p-4 border-l border-gray-700 flex flex-col">
        <h4 className="text-gray-400 text-xs font-bold uppercase mb-4">Inspection Panel</h4>
        
        {selectedItem ? (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
            {'type' in selectedItem ? (
              // Node Details
              <>
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 mb-2">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <div>
                  <h5 className="text-white font-bold text-lg leading-tight">{(selectedItem as WiringNode).label}</h5>
                  <span className="text-xs text-blue-400 font-mono uppercase">{(selectedItem as WiringNode).type}</span>
                </div>
                <div className="bg-black/30 p-3 rounded-lg border border-gray-700">
                  <p className="text-sm text-gray-300">{(selectedItem as WiringNode).description || "No specific data."}</p>
                </div>
              </>
            ) : (
              // Connection Details
              <>
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 mb-2">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                </div>
                 <div>
                  <h5 className="text-white font-bold text-lg">Wire Segment</h5>
                  <span className="text-xs text-orange-400 font-mono uppercase">Connection</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-gray-700 pb-2">
                    <span className="text-gray-500 text-sm">Color</span>
                    <span className="text-white font-mono text-sm">{(selectedItem as WiringConnection).color}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-700 pb-2">
                    <span className="text-gray-500 text-sm">Label</span>
                    <span className="text-white font-mono text-sm">{(selectedItem as WiringConnection).label || "N/A"}</span>
                  </div>
                </div>
              </>
            )}
            
            <div className="mt-8 p-3 bg-blue-900/20 border border-blue-900/50 rounded text-xs text-blue-200">
               ℹ️ Always verify wire colors with a multimeter before probing.
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600 text-center">
             <svg className="w-10 h-10 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
             <p className="text-sm">Select a component or wire to view technical details.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WiringDiagramViewer;
