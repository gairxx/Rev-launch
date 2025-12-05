import { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { ConnectionState } from '../types';
import { decodeAudioData, createPCM16Blob, base64ToUint8Array } from '../utils/audioUtils';

const API_KEY = process.env.API_KEY || '';

interface UseLiveSessionProps {
  systemInstruction: string;
  onTranscript: (text: string, sender: 'user' | 'model') => void;
  onToolCall?: (toolCall: { name: string, args: any, id: string }) => Promise<any> | any;
  tools?: any[];
}

export const useLiveSession = ({ systemInstruction, onTranscript, onToolCall, tools }: UseLiveSessionProps) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [volume, setVolume] = useState(0);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);

  // Disconnect function
  const disconnect = useCallback(() => {
    if (sessionRef.current) {
      // There is no explicit close() on the session object in the current SDK version example,
      // but usually we stop sending data and close contexts.
      // If session has close, call it. 
      try {
         sessionRef.current.close();
      } catch (e) {
        console.warn("Error closing session", e);
      }
      sessionRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (inputContextRef.current) {
      inputContextRef.current.close();
      inputContextRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    sourcesRef.current.forEach(source => {
        try { source.stop(); } catch {}
    });
    sourcesRef.current.clear();

    setConnectionState(ConnectionState.DISCONNECTED);
    setIsAiSpeaking(false);
    setVolume(0);
  }, []);

  const connect = useCallback(async () => {
    if (!API_KEY) {
        alert("API Key missing");
        return;
    }
    
    setConnectionState(ConnectionState.CONNECTING);

    try {
      // Setup Audio Output
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      // Setup Audio Input
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      inputContextRef.current = inputCtx;
      
      // Analyzer for visualizer (input)
      const analyzer = inputCtx.createAnalyser();
      analyzer.fftSize = 256;
      analyzerRef.current = analyzer;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const source = inputCtx.createMediaStreamSource(stream);
      const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = scriptProcessor;

      source.connect(analyzer); // Connect for visualization
      analyzer.connect(scriptProcessor); // Pass through to processor
      scriptProcessor.connect(inputCtx.destination);

      const ai = new GoogleGenAI({ apiKey: API_KEY });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } }, // Fenrir sounds deeper/technical
          },
          systemInstruction: systemInstruction,
          inputAudioTranscription: {}, 
          outputAudioTranscription: {},
          tools: tools,
        },
        callbacks: {
          onopen: () => {
            console.log('Session opened');
            setConnectionState(ConnectionState.CONNECTED);

            // Start streaming input
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Calculate volume for visualizer
              let sum = 0;
              for(let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
              const rms = Math.sqrt(sum / inputData.length);
              if (!isAiSpeaking) setVolume(rms); // Only show mic volume if AI isn't talking

              const pcmBlob = createPCM16Blob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
          },
          onmessage: async (message: LiveServerMessage) => {
             // Handle Transcriptions
            if (message.serverContent?.outputTranscription?.text) {
                 onTranscript(message.serverContent.outputTranscription.text, 'model');
            }
            if (message.serverContent?.inputTranscription?.text) {
                 onTranscript(message.serverContent.inputTranscription.text, 'user');
            }

            // Handle Tool Calls
            if (message.toolCall && onToolCall) {
              const functionCalls = message.toolCall.functionCalls;
              for (const fc of functionCalls) {
                try {
                  const result = await onToolCall({ name: fc.name, args: fc.args, id: fc.id });
                  if (result) {
                    sessionPromise.then(session => {
                      session.sendToolResponse({
                        functionResponses: [
                            {
                                id: fc.id,
                                name: fc.name,
                                response: { result: { output: result } }
                            }
                        ]
                      });
                    });
                  }
                } catch (e) {
                  console.error("Tool call error", e);
                }
              }
            }

            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              const ctx = audioContextRef.current;
              
              // Update time cursor
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(
                base64ToUint8Array(base64Audio),
                ctx,
                24000,
                1
              );
              
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) {
                    setIsAiSpeaking(false);
                }
              });
              
              source.start(nextStartTimeRef.current);
              sourcesRef.current.add(source);
              
              // Visualizer hack for output
              setIsAiSpeaking(true);
              setVolume(0.5); // Fake volume for AI speaking visualization since we don't analyze output buffer
              
              nextStartTimeRef.current += audioBuffer.duration;
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
              console.log("Interrupted");
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsAiSpeaking(false);
            }
          },
          onclose: () => {
            console.log('Session closed');
            disconnect();
          },
          onerror: (err) => {
            console.error('Session error', err);
            disconnect();
            setConnectionState(ConnectionState.ERROR);
          }
        }
      });

      sessionRef.current = await sessionPromise;

    } catch (error) {
      console.error("Connection failed", error);
      disconnect();
      setConnectionState(ConnectionState.ERROR);
    }
  }, [API_KEY, systemInstruction, disconnect, onTranscript, isAiSpeaking, onToolCall, tools]);

  // Cleanup on unmount
  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  return {
    connect,
    disconnect,
    connectionState,
    volume,
    isAiSpeaking
  };
};