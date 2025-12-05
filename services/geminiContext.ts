import { GoogleGenAI } from "@google/genai";
import { Vehicle } from "../types";

const API_KEY = process.env.API_KEY || '';

export const generateVehicleContext = async (vehicle: Omit<Vehicle, 'id' | 'contextString'>): Promise<string> => {
  if (!API_KEY) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `
    You are an expert automotive system instruction generator. 
    I need a highly technical system instruction for an AI persona named "Revo".
    
    Target Vehicle:
    Year: ${vehicle.year}
    Make: ${vehicle.make}
    Model: ${vehicle.model}
    Engine: ${vehicle.engine || 'Standard'}
    VIN (optional): ${vehicle.vin || 'N/A'}

    Task:
    Create a detailed system instruction (approx 300 words) that configures Revo to be the world's leading expert on THIS specific vehicle.
    
    The system instruction must explicitly state:
    1. You are "Revo", a master technician. You listen for the hotword "Hey Revo" but are always attentive.
    2. Your knowledge base includes specific TSBs (Technical Service Bulletins), recall data, firing orders, bolt sizes (metric/SAE specific to this car), torque specs, and common failure points for the ${vehicle.engine} engine.
    3. You understand PIDs (Parameter IDs) for this manufacturer's OBD-II protocol.
    4. You speak concisely, professionally, and with extreme technical accuracy. 
    5. If asked about repairs, provide step-by-step guides referencing factory manual procedures.
    
    Output ONLY the raw text of the system instruction. Do not include markdown formatting or "Here is the instruction".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "You are Revo, an expert mechanic.";
  } catch (error) {
    console.error("Failed to generate vehicle context:", error);
    return "You are Revo, an expert mechanic specialized in automotive repair. Please ask for vehicle details.";
  }
};
