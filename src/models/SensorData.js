// Same as before
export class SensorData {
  constructor(data) {
    this.date = data.Date;
    this.machineId = data.Machine_ID;
    this.assemblyLine = data.Assembly_Line_No;
    this.hydraulicPressure = parseFloat(data['Hydraulic_Pressure(bar)']);
    this.coolantPressure = parseFloat(data['Coolant_Pressure(bar)']);
    this.airPressure = parseFloat(data['Air_System_Pressure(bar)']);
    this.coolantTemp = parseFloat(data['Coolant_Temperature']);
    this.oilTemp = parseFloat(data['Hydraulic_Oil_Temperature(°C)']);
    this.spindleBearingTemp = parseFloat(data['Spindle_Bearing_Temperature(°C)']);
    this.spindleVibration = parseFloat(data['Spindle_Vibration(µm)']);
    this.toolVibration = parseFloat(data['Tool_Vibration(µm)']);
    this.spindleSpeed = parseInt(data['Spindle_Speed(RPM)']);
    this.voltage = parseFloat(data['Voltage(volts)']);
    this.torque = parseFloat(data['Torque(Nm)']);
    this.cuttingForce = parseFloat(data['Cutting(kN)']);
    this.downtime = data.Downtime;
  }

  toJSON() {
    return { ...this };
  }

  isAnomaly() {
    return (
      this.hydraulicPressure < 70 ||
      this.spindleVibration > 25 ||
      this.torque > 20
    );
  }
}