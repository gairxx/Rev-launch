
import { OBDData } from "../types";

// Common UUIDs for OBDII BLE adapters (Veepeak, Vgate, etc.)
const SERVICE_UUIDS = [
  "0000fff0-0000-1000-8000-00805f9b34fb",
  "0000ffe0-0000-1000-8000-00805f9b34fb", 
  "e7810a71-73ae-499d-8c15-faa9aef0c3f2" // Vgate iCar Pro specific
];

const CHARACTERISTIC_UUIDS = [
  "0000fff1-0000-1000-8000-00805f9b34fb", // Write
  "0000fff2-0000-1000-8000-00805f9b34fb", // Notify
  "0000ffe1-0000-1000-8000-00805f9b34fb",
  "bef8d6c9-9c21-4c9e-b632-bd58c1009f9f"
];

export class OBDService {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private onDataUpdate: (data: Partial<OBDData>) => void;
  private queue: string[] = [];
  private isProcessing = false;
  private buffer = "";

  constructor(onUpdate: (data: Partial<OBDData>) => void) {
    this.onDataUpdate = onUpdate;
  }

  async connect(): Promise<boolean> {
    try {
      const nav = navigator as any;
      if (!nav.bluetooth) {
        throw new Error("Web Bluetooth not supported");
      }

      this.device = await nav.bluetooth.requestDevice({
        filters: [{ services: SERVICE_UUIDS }],
        optionalServices: SERVICE_UUIDS
      });

      if (!this.device) throw new Error("No device selected");

      this.server = await this.device.gatt?.connect() || null;
      if (!this.server) throw new Error("Could not connect to GATT server");

      let service: BluetoothRemoteGATTService | undefined;
      for (const uuid of SERVICE_UUIDS) {
        try {
          service = await this.server.getPrimaryService(uuid);
          if (service) break;
        } catch (e) {
          continue;
        }
      }

      if (!service) throw new Error("No compatible OBDII service found");

      for (const uuid of CHARACTERISTIC_UUIDS) {
        try {
            const chars = await service.getCharacteristics();
            this.characteristic = chars.find(c => c.properties.notify || c.properties.write) || null;
            if (this.characteristic) break;
        } catch (e) { continue; }
      }

      if (!this.characteristic) throw new Error("No R/W characteristic found");

      if (this.characteristic.properties.notify) {
        await this.characteristic.startNotifications();
        this.characteristic.addEventListener('characteristicvaluechanged', this.handleNotification);
      }

      await this.addToQueue("AT Z");     
      await this.addToQueue("AT E0");    
      await this.addToQueue("AT SP 0");  
      
      this.startPolling();
      
      return true;
    } catch (error) {
      console.error("OBD Connection failed:", error);
      return false;
    }
  }

  disconnect() {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.device = null;
  }

  async scanDTCs() {
    // Mode 03: Request Emissions-Related Diagnostic Trouble Codes
    await this.addToQueue("03");
  }

  private startPolling() {
    if (!this.device?.gatt?.connected) return;

    // Standard PIDs: RPM, Speed, Coolant
    const pids = ["010C", "010D", "0105"];
    
    let index = 0;
    setInterval(() => {
        if (this.device?.gatt?.connected && this.queue.length === 0) {
            this.addToQueue(pids[index]);
            index = (index + 1) % pids.length;
        }
    }, 500);
  }

  private handleNotification = (event: Event) => {
    const target = event.target as any;
    const value = target.value as DataView;
    if (!value) return;

    const decoder = new TextDecoder();
    const chunk = decoder.decode(value);
    
    this.buffer += chunk;

    if (this.buffer.includes(">")) {
        const responses = this.buffer.split(">");
        this.parseResponse(responses[0]);
        this.buffer = responses[1] || "";
        this.isProcessing = false;
        this.processQueue();
    }
  };

  private async addToQueue(command: string) {
    this.queue.push(command);
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private async processQueue() {
    if (this.queue.length === 0 || this.isProcessing || !this.characteristic) return;

    this.isProcessing = true;
    const command = this.queue.shift();
    if (!command) return;

    try {
      const encoder = new TextEncoder();
      await this.characteristic.writeValue(encoder.encode(command + "\r"));
    } catch (e) {
      console.error("Write error", e);
      this.isProcessing = false;
    }
  }

  private parseResponse(raw: string) {
    const clean = raw.replace(/\s+/g, '').replace(/\0/g, '');

    // RPM (010C) -> 410C
    if (clean.includes("410C")) {
        const hex = clean.split("410C")[1]?.substring(0, 4);
        if (hex && hex.length === 4) {
            const a = parseInt(hex.substring(0, 2), 16);
            const b = parseInt(hex.substring(2, 4), 16);
            const rpm = ((a * 256) + b) / 4;
            this.onDataUpdate({ rpm });
        }
    }

    // Speed (010D) -> 410D
    if (clean.includes("410D")) {
        const hex = clean.split("410D")[1]?.substring(0, 2);
        if (hex) {
            const speed = parseInt(hex, 16);
            this.onDataUpdate({ speed });
        }
    }

    // Temp (0105) -> 4105
    if (clean.includes("4105")) {
        const hex = clean.split("4105")[1]?.substring(0, 2);
        if (hex) {
            const temp = parseInt(hex, 16) - 40;
            this.onDataUpdate({ temp });
        }
    }

    // DTCs (Mode 03 Response) -> 43...
    if (clean.startsWith("43")) {
      // Remove Mode ID (43)
      const data = clean.substring(2);
      const dtcs = this.parseDTCString(data);
      // We always send the list, empty or not
      this.onDataUpdate({ dtcs });
    }
  }

  private parseDTCString(hex: string): string[] {
    const codes: string[] = [];
    // Hex string is expected to be [Count][Code1][Code2]...
    // Example: 0201050171 (Count 02, P0105, P0171)
    
    // Safety check
    if (hex.length < 2) return [];

    // Skip the count byte (first 2 chars) and iterate chunks of 4 chars
    for(let i = 2; i < hex.length; i += 4) {
        const chunk = hex.substring(i, i + 4);
        if (chunk.length === 4) {
           const code = this.decodeDTC(chunk);
           if (code) codes.push(code);
        }
    }
    return codes;
  }

  private decodeDTC(hex4: string): string {
     const val = parseInt(hex4, 16);
     if (isNaN(val) || val === 0) return "";
     
     const a = parseInt(hex4.substring(0, 2), 16);
     const b = parseInt(hex4.substring(2, 4), 16);
     
     // Bits 7-6 of A determine type
     const typeMap = ["P", "C", "B", "U"];
     const typeIdx = (a & 0xC0) >> 6;
     const typeChar = typeMap[typeIdx];
     
     // Bits 5-4 of A is the second char
     const secondChar = (a & 0x30) >> 4;
     
     // Bits 3-0 of A is third char
     const thirdChar = (a & 0x0F).toString(16).toUpperCase();
     
     // B is 4th and 5th
     const lastChars = b.toString(16).toUpperCase().padStart(2, '0');
     
     const code = `${typeChar}${secondChar}${thirdChar}${lastChars}`;
     return code;
  }
}
