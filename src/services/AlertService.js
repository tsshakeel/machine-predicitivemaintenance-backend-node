import { EventEmitter } from 'events';
import nodemailer from 'nodemailer';
import { SensorData } from '../models/SensorData.js';
import supabase from '../config/supabase.js';
import logger from '../utils/logger.js';

export class AlertService extends EventEmitter {
  constructor() {
    super();
    // Handle unhandled errors to prevent crashes
    this.on('error', (err) => logger.error('AlertService error:', err));
    
    try {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { 
          user: process.env.EMAIL_USER, 
          pass: process.env.EMAIL_PASS 
        }
      });
      logger.info('Nodemailer transporter initialized');
    } catch (err) {
      logger.error('Nodemailer init failed:', err);
      this.transporter = null;  // Disable email if fails
    }
  }

  sendAlert(reading, type = 'email') {
    const message = `Alert: ${type} on ${reading.machineId}. Vibration: ${reading.spindleVibration}µm. Action: Inspect immediately.`;
    logger.warn(message);

    if (type === 'email' && this.transporter) {
      this.transporter.sendMail({
        to: 'admin@factory.com',  // Update to your email if needed
        subject: 'Machine Failure Alert',
        text: message
      }).catch(err => logger.error('Email send failed:', err));
    } else if (type === 'slack') {
      logger.info('Slack alert would be sent:', message);
    }
  }

  // Subscribe to Supabase Realtime (fully mock-safe)
  subscribeToRealtime(io) {
    try {
      if (!supabase.channel) {
        logger.warn('Supabase realtime not available (mock mode). Skipping subscription.');
        return;
      }
      supabase
        .channel('machinetimedown_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'machinetimedown' },
          (payload) => {
            try {
              if (payload.new) {
                const reading = new SensorData(payload.new);
                if (reading.isAnomaly()) {
                  this.sendAlert(reading);
                  if (io) io.emit('anomalyAlert', reading.toJSON());
                }
              }
            } catch (payloadErr) {
              logger.error('Payload processing failed:', payloadErr);
            }
          }
        )
        .subscribe((status) => logger.info('Realtime status:', status));
    } catch (err) {
      logger.error('Realtime setup failed:', err);
      // Emit safe error (handled above)
      this.emit('error', err);
    }
  }
}