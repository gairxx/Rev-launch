import { GoogleGenAI, Type } from "@google/genai";
import { Vehicle, TSB } from "../types";

const API_KEY = process.env.API_KEY || '';

export const searchTSBs = async (vehicle: Vehicle, query: string): Promise<TSB[]> => {
  if (!API_KEY) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `
    Search for Technical Service Bulletins (TSBs) for a ${vehicle.year} ${vehicle.make} ${vehicle.model} with engine ${vehicle.engine}.
    
    The user search query is: "${query}". 
    
    This query might be a specific DTC code (e.g., P0300), a symptom (e.g., hard shift), or a component name.
    Retrieve real or highly probable TSBs based on your training data that match this vehicle and issue.
    
    Return a list of relevant bulletins.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              bulletinNumber: { type: Type.STRING, description: "The TSB ID/Number (e.g. TSB 15-0123)" },
              title: { type: Type.STRING, description: "Short title of the bulletin" },
              summary: { type: Type.STRING, description: "Brief explanation of the issue and fix" },
              date: { type: Type.STRING, description: "Approximate release date" },
              component: { type: Type.STRING, description: "Affected system (e.g. Transmission, Engine)" }
            },
            required: ["bulletinNumber", "title", "summary", "component"]
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      // Add local IDs for React keys
      return data.map((item: any) => ({
        id: crypto.randomUUID(),
        ...item
      }));
    }
    return [];
  } catch (error) {
    console.error("TSB Search failed:", error);
    return [];
  }
};