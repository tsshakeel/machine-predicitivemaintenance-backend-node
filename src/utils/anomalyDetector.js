// Thresholds derived from sample data (customize as needed, e.g., via ML training)
const THRESHOLDS = {
  hydraulicPressure: { min: 70, max: 130 },
  spindleVibration: { max: 25 },
  torque: { max: 20 }
};

export function detectAnomaly(reading) {
  return Object.keys(THRESHOLDS).some(key => {
    const val = reading[key];
    const thresh = THRESHOLDS[key];
    return (thresh.min && val < thresh.min) || (thresh.max && val > thresh.max);
  });
}