import React, { useState } from 'react';
import { RepairGuide } from '../types';

interface RepairGuideCardProps {
  guide: RepairGuide;
}

const RepairGuideCard: React.FC<RepairGuideCardProps> = ({ guide }) => {
  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(new Set());
  const [checkedTools, setCheckedTools] = useState<Set<string>>(new Set());

  const toggleStep = (id: string) => {
    const newChecked = new Set(checkedSteps);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedSteps(newChecked);
  };

  const toggleTool = (tool: string) => {
    const newChecked = new Set(checkedTools);
    if (newChecked.has(tool)) {
      newChecked.delete(tool);
    } else {
      newChecked.add(tool);
    }
    setCheckedTools(newChecked);
  };

  const progress = Math.round((checkedSteps.size / guide.steps.length) * 100);

  return (
    <div className="mt-4 bg-gray-800/80 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-white text-lg">{guide.title}</h3>
          <p className="text-sm text-gray-400">Est. Time: {guide.estimatedTime}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-400">{progress}%</div>
          <div className="text-xs text-gray-500 uppercase">Complete</div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Tools Section */}
        {guide.tools.length > 0 && (
          <div className="bg-black/20 rounded-lg p-3 border border-gray-700/50">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Required Tools</h4>
            <div className="flex flex-wrap gap-2">
              {guide.tools.map((tool, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleTool(tool)}
                  className={`text-xs px-2 py-1 rounded-md border transition-all ${
                    checkedTools.has(tool)
                      ? 'bg-green-900/30 border-green-700 text-green-300 line-through opacity-70'
                      : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {tool}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Steps Section */}
        <div className="space-y-2">
          {guide.steps.map((step, index) => (
            <div 
              key={step.id}
              onClick={() => toggleStep(step.id)}
              className={`flex gap-3 p-3 rounded-lg border transition-all cursor-pointer group ${
                checkedSteps.has(step.id)
                  ? 'bg-green-900/10 border-green-900/30' 
                  : 'bg-gray-900/30 border-gray-800 hover:border-gray-600'
              }`}
            >
              <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                checkedSteps.has(step.id)
                  ? 'bg-green-500 border-green-500 text-black' 
                  : 'border-gray-600 group-hover:border-blue-400'
              }`}>
                {checkedSteps.has(step.id) && (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className={`${checkedSteps.has(step.id) ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                <span className="font-mono text-xs text-gray-500 mr-2">{index + 1}.</span>
                {step.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RepairGuideCard;