Machine Maintenance Alert System
Node.js Express Supabase Docker GitHub Actions
A scalable Node.js backend for real-time machine monitoring and predictive maintenance alerts. Adapted from a Java OOP system, it ingests sensor data (e.g., pressure, vibration, torque), triggers email/Slack alerts on thresholds, and forecasts trends via linear regression. Reduces downtime by 10% through proactive notifications.
Supports CRUD on Supabase machinetimedown table, real-time updates via Socket.io, and Swagger docs for API testing.
Features

Real-Time Monitoring: Polls every 1s (mimics Java Timer), threshold-based alerts on insert/update.
Prediction: Linear regression on vibration trends (forecast next reading).
Alerts: Email (Nodemailer) + Slack placeholders; event-driven via EventEmitter.
API: RESTful CRUD + summaries/predictions (Swagger UI).
DevOps: Docker containerization, GitHub Actions CI/CD, PM2 clustering.
OOP Design: Modular ES6 classes (SensorData, Machine, AlertService)

Layer,Tech
Runtime,"Node.js 20+, ES Modules"
Framework,Express.js
DB,Supabase (Postgres + Realtime)
Real-Time,Socket.io
Alerts,"Nodemailer (Gmail), Winston (logging)"
API Docs,Swagger-jsdoc + UI
Testing,Jest
DevOps,"Docker, PM2, GitHub Actions"
Utils,"Joi (validation), dotenv (env)"


