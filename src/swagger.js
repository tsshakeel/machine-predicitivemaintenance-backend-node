import path from 'path';
import { fileURLToPath } from 'url';
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Machine Time Down API",
      version: "1.0.0",
      description: "CRUD API for machinetimedown table (Supabase) with anomaly detection."
    },
    servers: [
      { url: `http://localhost:${process.env.PORT || 3001}` }
    ],
    components: {
      schemas: {
        SensorData: {
          type: "object",
          properties: {
            Date: { type: "string" },
            Machine_ID: { type: "string" },
            Assembly_Line_No: { type: "string" },
            "Hydraulic_Pressure(bar)": { type: "number" },
            "Coolant_Pressure(bar)": { type: "number" },
            "Air_System_Pressure(bar)": { type: "number" },
            "Coolant_Temperature": { type: "number" },
            "Hydraulic_Oil_Temperature(°C)": { type: "number" },
            "Spindle_Bearing_Temperature(°C)": { type: "number" },
            "Spindle_Vibration(µm)": { type: "number" },
            "Tool_Vibration(µm)": { type: "number" },
            "Spindle_Speed(RPM)": { type: "integer" },
            "Voltage(volts)": { type: "number" },
            "Torque(Nm)": { type: "number" },
            "Cutting(kN)": { type: "number" },
            Downtime: { type: "string", enum: ["OK", "Machine_Failure"] }
          }
        },
        MachineSummary: {
          type: "object",
          properties: {
            id: { type: "string" },
            status: { type: "string" },
            avgVibration: { type: "number" },
            anomalyCount: { type: "integer" },
            downtimeReduced: { type: "string" }
          }
        }
      }
    },
    paths: {}  // Auto-filled by scanning
  },
  apis: [path.join(__dirname, 'routes', '*.js')]  // Absolute path for reliable scanning
};

export const swaggerSpec = swaggerJsdoc(options);
export const swaggerUiMiddleware = swaggerUi;