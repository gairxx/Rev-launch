
import { FunctionDeclaration, Type } from "@google/genai";

export const repairGuideTool: FunctionDeclaration = {
  name: 'create_repair_guide',
  description: 'Generate an interactive repair checklist for a specific automotive procedure.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'The name of the repair procedure (e.g., "Alternator Replacement").'
      },
      steps: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Sequential steps to complete the repair.'
      },
      tools: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'List of tools required for the job.'
      },
      estimatedTime: {
        type: Type.STRING,
        description: 'Estimated time to complete (e.g., "2-3 hours").'
      }
    },
    required: ['title', 'steps', 'tools', 'estimatedTime']
  }
};

export const wiringDiagramTool: FunctionDeclaration = {
  name: 'create_wiring_diagram',
  description: 'Generate a simplified interactive wiring diagram for electrical troubleshooting. Use a 100x100 grid coordinate system. Place Power sources at the top (y~10), Grounds at the bottom (y~90), and switches/loads in between.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Title of the circuit (e.g., 'Fuel Pump Circuit')" },
      nodes: {
        type: Type.ARRAY,
        description: "List of components in the circuit",
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: "Unique ID (e.g. 'n1')" },
            type: { type: Type.STRING, enum: ['power', 'ground', 'fuse', 'relay', 'switch', 'load', 'connector', 'module', 'sensor'] },
            label: { type: Type.STRING, description: "Component Name" },
            x: { type: Type.NUMBER, description: "X coordinate (0-100)" },
            y: { type: Type.NUMBER, description: "Y coordinate (0-100)" },
            description: { type: Type.STRING, description: "Technical details (e.g. '15A Fuse', 'PCM Pin 4')" }
          },
          required: ['id', 'type', 'label', 'x', 'y']
        }
      },
      connections: {
        type: Type.ARRAY,
        description: "Wires connecting the components",
        items: {
          type: Type.OBJECT,
          properties: {
            from: { type: Type.STRING, description: "Source Node ID" },
            to: { type: Type.STRING, description: "Target Node ID" },
            color: { type: Type.STRING, description: "Wire Color (e.g. 'BLK/WHT')" },
            label: { type: Type.STRING, description: "Pin or Circuit Number" }
          },
          required: ['from', 'to', 'color']
        }
      }
    },
    required: ['title', 'nodes', 'connections']
  }
};
