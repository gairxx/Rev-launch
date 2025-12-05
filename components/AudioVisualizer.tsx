import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
  isSpeaking: boolean; // true if AI is speaking
  volume: number; // 0 to 1 normalized
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isActive, isSpeaking, volume }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    
    const bars = 50;
    const barWidth = canvas.width / bars;
    
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (!isActive) {
        // Flat line
        ctx.fillStyle = '#374151';
        ctx.fillRect(0, canvas.height / 2, canvas.width, 2);
        return;
      }

      const centerX = canvas.width / 2;
      
      for (let i = 0; i < bars; i++) {
        const x = i * barWidth;
        // Create a symmetric wave effect based on volume and time
        const distFromCenter = Math.abs(x - centerX) / centerX;
        const wave = Math.sin(Date.now() / 200 + i * 0.2);
        
        // Base height + volume reaction
        let height = 4;
        
        if (isActive) {
            // If active, basic idling wave
            height += Math.abs(wave) * 10;
            
            // If there is volume input/output, react strongly
            if (volume > 0.01) {
               height += volume * 100 * (1 - distFromCenter); 
            }
        }

        const hue = isSpeaking ? 210 : 150; // Blue for AI, Green for User/Mic
        const color = `hsl(${hue}, 80%, ${60 + wave * 10}%)`;
        
        ctx.fillStyle = color;
        
        // Rounded bars
        const y = (canvas.height - height) / 2;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth - 2, height, 4);
        ctx.fill();
      }
      
      animationId = requestAnimationFrame(draw);
    };

    draw();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isActive, isSpeaking, volume]);

  return (
    <canvas 
      ref={canvasRef} 
      width={300} 
      height={100} 
      className="w-full h-24 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
    />
  );
};

export default AudioVisualizer;
