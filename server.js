import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  initDb,
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getOffPlanProjects,
  getOffPlanById,
  createOffPlanProject,
  updateOffPlanProject,
  deleteOffPlanProject,
  getDevelopers,
  getAgents,
  authenticateStaff,
  getBuyerLeads,
  getLeadById,
  createLead,
  updateLeadStage,
  assignLeadAgent,
  addLeadNote,
  processWonDeal,
  getDashboardStats,
  getViewings,
  createViewing,
  getCompletedSales,
  getNewLeadsCount,
  getDbStatus
} from './db/neon.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Anti-Spam & Rate Limiting System
const submissionCooldown = new Map();

function rateLimitAndSpamCheck(req, res, next) {
  // 1. Honeypot check
  if (req.body._gotcha || req.body.website_trap || req.body.bot_field) {
    return res.status(400).json({ error: 'Automated submission blocked.' });
  }

  // 2. Cooldown check per IP (min 4 seconds between any submissions)
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const lastTime = submissionCooldown.get(clientIp);

  if (lastTime && now - lastTime < 4000) {
    return res.status(429).json({ error: 'Please wait a moment before sending another request.' });
  }

  submissionCooldown.set(clientIp, now);
  next();
}

// ==============================================================================
// PUBLIC API ENDPOINTS
// ==============================================================================

app.get('/api/status', (req, res) => {
  res.json(getDbStatus());
});

// Properties
app.get('/api/properties', async (req, res) => {
  try {
    const data = await getProperties(req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

app.get('/api/properties/:idOrSlug', async (req, res) => {
  try {
    const data = await getPropertyById(req.params.idOrSlug);
    if (!data) return res.status(404).json({ error: 'Property not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});

// Off-Plan
app.get('/api/off-plan', async (req, res) => {
  try {
    const data = await getOffPlanProjects();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch off-plan projects' });
  }
});

app.get('/api/off-plan/:idOrSlug', async (req, res) => {
  try {
    const data = await getOffPlanById(req.params.idOrSlug);
    if (!data) return res.status(404).json({ error: 'Project not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Developers & Public Agents
app.get('/api/developers', async (req, res) => {
  try {
    const data = await getDevelopers();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch developers' });
  }
});

app.get('/api/agents', async (req, res) => {
  try {
    const data = await getAgents();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// Form Lead Capture (Saves lead with scoring, exact source_form, and returns standard 24h message)
app.post('/api/leads', rateLimitAndSpamCheck, async (req, res) => {
  try {
    const { full_name, phone, email, interested_in, budget_aed, preferred_community, source_form, lead_source, property_id, off_plan_id, is_cash_buyer, timeframe } = req.body;

    if (!full_name || full_name.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter a valid full name.' });
    }
    if (!phone || phone.trim().length < 7) {
      return res.status(400).json({ error: 'Please enter a valid phone or WhatsApp number.' });
    }

    const lead = await createLead({
      full_name: full_name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : null,
      interested_in: interested_in || 'General Luxury Advisory',
      budget_aed: budget_aed ? Number(budget_aed) : null,
      preferred_community: preferred_community || null,
      source_form: source_form || 'Website Form',
      lead_source: lead_source || source_form || 'Website Form',
      property_id: property_id ? Number(property_id) : null,
      off_plan_id: off_plan_id ? Number(off_plan_id) : null,
      is_cash_buyer: Boolean(is_cash_buyer),
      timeframe: timeframe || '1-3 months',
      assigned_agent_id: property_id ? (Number(property_id) % 3) + 1 : 1
    });

    res.status(201).json({
      success: true,
      message: 'Thank you. A Jay Real Estate advisor will contact you within 24 hours.',
      lead
    });
  } catch (err) {
    console.error('Lead submission error:', err);
    res.status(500).json({ error: 'Failed to register lead.' });
  }
});

// Viewing Form Submission
app.post('/api/viewings', rateLimitAndSpamCheck, async (req, res) => {
  try {
    const { full_name, phone, email, property_id, viewing_date, viewing_time, viewing_type } = req.body;

    if (!full_name || !phone || !viewing_date) {
      return res.status(400).json({ error: 'Please fill in your name, phone, and preferred viewing date.' });
    }

    const lead = await createLead({
      full_name: full_name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : null,
      interested_in: `Viewing for Property #${property_id}`,
      property_id: property_id ? Number(property_id) : null,
      source_form: 'Property Detail Viewing',
      lead_source: 'Viewing Booking',
      timeframe: 'Immediate (Under 1 month)',
      assigned_agent_id: (Number(property_id || 1) % 3) + 1
    });

    const viewing = await createViewing({
      property_id: property_id ? Number(property_id) : null,
      lead_id: lead.id,
      agent_id: lead.assigned_agent_id,
      viewing_date,
      viewing_time: viewing_time || '11:00 AM',
      viewing_type: viewing_type || 'In-Person',
      feedback: `Viewing booked for ${viewing_date} at ${viewing_time || '11:00 AM'}`
    });

    res.status(201).json({
      success: true,
      message: 'Thank you. A Jay Real Estate advisor will contact you within 24 hours.',
      viewing
    });
  } catch (err) {
    console.error('Viewing error:', err);
    res.status(500).json({ error: 'Failed to schedule viewing.' });
  }
});

// ==============================================================================
// ADMIN & AGENT PORTAL API ENDPOINTS
// ==============================================================================

// Staff Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authenticateStaff(email, password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    res.json({
      success: true,
      user
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failure' });
  }
});

// Bell icon unread leads count
app.get('/api/admin/unread-count', async (req, res) => {
  try {
    const agentId = req.query.agent_id;
    const count = await getNewLeadsCount(agentId);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Admin Dashboard Stats
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const agentId = req.query.agent_id;
    const data = await getDashboardStats(agentId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Admin Leads list
app.get('/api/admin/leads', async (req, res) => {
  try {
    const leads = await getBuyerLeads(req.query);
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

app.get('/api/admin/leads/:id', async (req, res) => {
  try {
    const lead = await getLeadById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch lead details' });
  }
});

// Update Lead Stage
app.put('/api/admin/leads/:id/stage', async (req, res) => {
  try {
    const { stage } = req.body;
    const updated = await updateLeadStage(req.params.id, stage);
    res.json({ success: true, lead: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update stage' });
  }
});

// Assign Lead to Agent
app.put('/api/admin/leads/:id/assign', async (req, res) => {
  try {
    const { agent_id } = req.body;
    const updated = await assignLeadAgent(req.params.id, agent_id);
    res.json({ success: true, lead: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign agent' });
  }
});

// Add Note to Lead
app.post('/api/admin/leads/:id/notes', async (req, res) => {
  try {
    const { note_text, agent_id } = req.body;
    if (!note_text || !note_text.trim()) {
      return res.status(400).json({ error: 'Note text is required.' });
    }
    const note = await addLeadNote(req.params.id, agent_id, note_text.trim());
    res.status(201).json({ success: true, note });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add note' });
  }
});

// Process "Won" Deal (Sale price, 2% commission, mark property sold)
app.post('/api/admin/leads/:id/won', async (req, res) => {
  try {
    const { sale_price_aed, agent_id } = req.body;
    if (!sale_price_aed || Number(sale_price_aed) <= 0) {
      return res.status(400).json({ error: 'Please specify a valid sale price in AED.' });
    }
    const sale = await processWonDeal(req.params.id, Number(sale_price_aed), agent_id);
    res.json({ success: true, sale });
  } catch (err) {
    res.status(500).json({ error: 'Failed to complete won deal' });
  }
});

// Viewings
app.get('/api/admin/viewings', async (req, res) => {
  try {
    const agentId = req.query.agent_id;
    const data = await getViewings(agentId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch viewings' });
  }
});

// Completed Sales
app.get('/api/admin/sales', async (req, res) => {
  try {
    const agentId = req.query.agent_id;
    const data = await getCompletedSales(agentId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

// Property Management CRUD
app.post('/api/admin/properties', async (req, res) => {
  try {
    const prop = await createProperty(req.body);
    res.status(201).json({ success: true, property: prop });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create property' });
  }
});

app.put('/api/admin/properties/:id', async (req, res) => {
  try {
    const updated = await updateProperty(req.params.id, req.body);
    res.json({ success: true, property: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update property' });
  }
});

app.delete('/api/admin/properties/:id', async (req, res) => {
  try {
    const deleted = await deleteProperty(req.params.id);
    res.json({ success: true, deleted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

// Off-Plan Projects CRUD
app.post('/api/admin/off-plan', async (req, res) => {
  try {
    const proj = await createOffPlanProject(req.body);
    res.status(201).json({ success: true, project: proj });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create off-plan project' });
  }
});

app.put('/api/admin/off-plan/:id', async (req, res) => {
  try {
    const updated = await updateOffPlanProject(req.params.id, req.body);
    res.json({ success: true, project: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update off-plan project' });
  }
});

app.delete('/api/admin/off-plan/:id', async (req, res) => {
  try {
    const deleted = await deleteOffPlanProject(req.params.id);
    res.json({ success: true, deleted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete off-plan project' });
  }
});

// Start Server
async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`\n🚀 Jay Real Estate API Server running on port ${PORT}`);
    console.log(`🔗 Health & DB Status endpoint: http://localhost:${PORT}/api/status`);
  });
}

start();
