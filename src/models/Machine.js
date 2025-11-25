import supabase from '../config/supabase.js';
import { SensorData } from './SensorData.js';

export class Machine {
  constructor(id, line) {
    this.id = id;
    this.line = line;
  }

  async getSummary() {
    const { data, error } = await supabase
      .from('machinetimedown')
      .select('*')
      .eq('Machine_ID', this.id)
      .order('Date', { ascending: false })
      .limit(5);

    if (error) throw error;

    const readings = data.map(row => new SensorData(row));
    const anomalies = readings.filter(r => r.isAnomaly()).length;
    const avgVibration = readings.reduce((sum, r) => sum + r.spindleVibration, 0) / readings.length || 0;

    return {
      id: this.id,
      recentReadings: readings.map(r => r.toJSON()),
      status: anomalies > 0 ? 'ALERT' : 'OK',
      avgVibration,
      anomalyCount: anomalies,
      downtimeReduced: `${(anomalies * 0.1 * 100).toFixed(1)}%`  // Simulated
    };
  }
}