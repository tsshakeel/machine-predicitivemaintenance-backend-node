import { Router } from "express";
import supabase from "../config/supabase.js";
import { SensorData } from "../models/SensorData.js";
import { Machine } from "../models/Machine.js";
import { AlertService } from "../services/AlertService.js";

const router = Router();
const alertService = new AlertService();  // Singleton instance

/**
 * @swagger
 * tags:
 *   name: MachineTimeDown
 *   description: CRUD operations for machinetimedown table with alerts
 */

/**
 * @swagger
 * /data:
 *   get:
 *     summary: Get all machine time down rows
 *     tags: [MachineTimeDown]
 *     responses:
 *       200:
 *         description: Successfully fetched data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SensorData'
 *       400:
 *         description: Bad request
 */
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("machinetimedown")
    .select("*")
    .order("Date", { ascending: false });

  if (error) return res.status(400).json({ error });

  res.status(200).json(data);
});

/**
 * @swagger
 * /data/{machineId}/summary:
 *   get:
 *     summary: Get machine summary (avg metrics, anomalies)
 *     tags: [MachineTimeDown]
 *     parameters:
 *       - in: path
 *         name: machineId
 *         required: true
 *         schema:
 *           type: string
 *         description: Machine ID (e.g., Makino-L1-Unit1-2013)
 *     responses:
 *       200:
 *         description: Machine summary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MachineSummary'
 *       400:
 *         description: Bad request
 */
router.get("/:machineId/summary", async (req, res) => {
  try {
    const { machineId } = req.params;
    const machine = new Machine(machineId, '');
    const summary = await machine.getSummary();
    res.json(summary);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /data:
 *   post:
 *     summary: Insert new data row (triggers anomaly alert)
 *     tags: [MachineTimeDown]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SensorData'
 *     responses:
 *       201:
 *         description: Row inserted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: "string" }
 *                 inserted: { $ref: '#/components/schemas/SensorData' }
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post("/", async (req, res) => {
  try {
    const payload = req.body;
    const reading = new SensorData(payload);

    const { data, error } = await supabase
      .from("machinetimedown")
      .insert(payload)
      .select();

    if (error) return res.status(400).json({ error });

    if (reading.isAnomaly()) {
      alertService.sendAlert(reading);
    }

    res.status(201).json({
      message: "Row inserted successfully",
      inserted: data[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /data/{date}:
 *   put:
 *     summary: Update row by Date (triggers anomaly check)
 *     tags: [MachineTimeDown]
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *         description: Date key (e.g., 31-12-2021)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SensorData'
 *     responses:
 *       200:
 *         description: Row updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: "string" }
 *                 updated: { $ref: '#/components/schemas/SensorData' }
 *       400:
 *         description: Bad request
 */
router.put("/:date", async (req, res) => {
  const { date } = req.params;
  const updatedPayload = { ...req.body, Date: date };
  const reading = new SensorData(updatedPayload);

  const { data, error } = await supabase
    .from("machinetimedown")
    .update(req.body)
    .eq("Date", date)
    .select();

  if (error) return res.status(400).json({ error });

  if (reading.isAnomaly()) {
    alertService.sendAlert(reading);
  }

  res.json({
    message: "Row updated successfully",
    updated: data[0]
  });
});

/**
 * @swagger
 * /data/{date}:
 *   delete:
 *     summary: Delete row by Date
 *     tags: [MachineTimeDown]
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *         description: Date key (e.g., 31-12-2021)
 *     responses:
 *       200:
 *         description: Deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: "string" }
 *                 deleted: { type: "array" }
 *       400:
 *         description: Bad request
 */
router.delete("/:date", async (req, res) => {
  const { date } = req.params;

  const { data, error } = await supabase
    .from("machinetimedown")
    .delete()
    .eq("Date", date)
    .select();

  if (error) return res.status(400).json({ error });

  res.json({
    message: "Deleted successfully",
    deleted: data
  });
});

export default router;