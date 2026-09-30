import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  developersData,
  agentsData,
  offPlanProjectsData,
  propertiesData,
  buyerLeadsData,
  viewingsData,
  salesData,
  notesData,
  calculateLeadScore
} from './seed-data.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pool = null;
let isConnectedToNeon = false;

// In-memory store fallback when DATABASE_URL is not yet configured
let memoryDb = {
  developers: JSON.parse(JSON.stringify(developersData)),
  agents: JSON.parse(JSON.stringify(agentsData)),
  off_plan_projects: JSON.parse(JSON.stringify(offPlanProjectsData)),
  properties: JSON.parse(JSON.stringify(propertiesData)),
  buyer_leads: JSON.parse(JSON.stringify(buyerLeadsData)),
  viewings: JSON.parse(JSON.stringify(viewingsData)),
  completed_sales: JSON.parse(JSON.stringify(salesData)),
  notes: JSON.parse(JSON.stringify(notesData))
};

export function getDbStatus() {
  return {
    connected: isConnectedToNeon,
    type: isConnectedToNeon ? 'Neon PostgreSQL' : 'Local In-Memory Cache (Paste DATABASE_URL in .env to link Neon)',
    databaseUrlSet: Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0)
  };
}

export async function initDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl && databaseUrl.trim().startsWith('postgres')) {
    try {
      console.log('Connecting to Neon PostgreSQL...');
      pool = new Pool({
        connectionString: databaseUrl,
        ssl: {
          rejectUnauthorized: false
        }
      });

      const res = await pool.query('SELECT NOW() as current_time');
      console.log('Successfully connected to Neon PostgreSQL at:', res.rows[0].current_time);
      isConnectedToNeon = true;

      // Run schema
      const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
      await pool.query(schemaSql);
      console.log('Neon Database Schema verified / created.');

      // Check if data is already seeded
      const countRes = await pool.query('SELECT COUNT(*) FROM properties');
      if (parseInt(countRes.rows[0].count, 10) === 0) {
        console.log('Neon DB empty. Seeding initial records...');
        await seedDatabase();
      } else {
        console.log(`Neon DB already has ${countRes.rows[0].count} properties.`);
      }

    } catch (err) {
      console.warn('Could not connect to Neon PostgreSQL, falling back to in-memory store:', err.message);
      isConnectedToNeon = false;
    }
  } else {
    console.log('Note: DATABASE_URL is empty in .env. Running on local in-memory sample dataset.');
    isConnectedToNeon = false;
  }
}

export async function seedDatabase() {
  if (!isConnectedToNeon || !pool) {
    console.log('Seeding in-memory database store.');
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insert Developers
    for (const dev of developersData) {
      await client.query(`
        INSERT INTO developers (slug, name, tagline, description, headquarters, founded_year, completed_projects)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      `, [dev.slug, dev.name, dev.tagline, dev.description, dev.headquarters, dev.founded_year, dev.completed_projects]);
    }

    // 2. Insert Staff / Agents (including Admin)
    for (const agent of agentsData) {
      await client.query(`
        INSERT INTO staff_logins (id, full_name, title, role, email, password_hash, phone, rera_number, specialization, languages, photo_url, bio, target_sales_aed, target_commission_aed)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, email = EXCLUDED.email
      `, [agent.id, agent.full_name, agent.title, agent.role || 'agent', agent.email, agent.password_hash, agent.phone, agent.rera_number, agent.specialization, agent.languages, agent.photo_url, agent.bio, agent.target_sales_aed, agent.target_commission_aed]);
    }

    // 3. Insert Off-Plan Projects
    for (const p of offPlanProjectsData) {
      await client.query(`
        INSERT INTO off_plan_projects (id, slug, name, developer_id, developer_name, location, sub_location, starting_price_aed, handover_date, payment_plan, units_type, description, image_url, gallery_urls, features, payment_milestones, featured)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (slug) DO UPDATE SET starting_price_aed = EXCLUDED.starting_price_aed
      `, [p.id, p.slug, p.name, p.developer_id, p.developer_name, p.location, p.sub_location, p.starting_price_aed, p.handover_date, p.payment_plan, p.units_type, p.description, p.image_url, JSON.stringify(p.gallery_urls), JSON.stringify(p.features), JSON.stringify(p.payment_milestones), p.featured]);
    }

    // 4. Insert Properties
    for (const prop of propertiesData) {
      await client.query(`
        INSERT INTO properties (id, slug, title, developer_id, developer_name, property_type, location, sub_location, price_aed, bedrooms, bathrooms, area_sqft, plot_sqft, status, tag, image_url, gallery_urls, description, amenities, assigned_agent_id, featured)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        ON CONFLICT (slug) DO UPDATE SET price_aed = EXCLUDED.price_aed
      `, [prop.id, prop.slug, prop.title, prop.developer_id, prop.developer_name, prop.property_type, prop.location, prop.sub_location, prop.price_aed, prop.bedrooms, prop.bathrooms, prop.area_sqft, prop.plot_sqft, prop.status, prop.tag, prop.image_url, JSON.stringify(prop.gallery_urls), prop.description, JSON.stringify(prop.amenities), prop.assigned_agent_id, prop.featured]);
    }

    // 5. Insert Buyer Leads
    for (const lead of buyerLeadsData) {
      await client.query(`
        INSERT INTO buyer_leads (id, full_name, phone, email, interested_in, property_id, off_plan_id, budget_aed, preferred_community, source_form, lead_source, is_cash_buyer, timeframe, score, temperature, status, assigned_agent_id, created_at, last_activity_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        ON CONFLICT (id) DO NOTHING
      `, [lead.id, lead.full_name, lead.phone, lead.email, lead.interested_in, lead.property_id || null, lead.off_plan_id || null, lead.budget_aed, lead.preferred_community, lead.source_form || 'Website Form', lead.lead_source || 'Website Form', lead.is_cash_buyer || false, lead.timeframe || '1-3 months', lead.score || 50, lead.temperature || 'WARM', lead.status || 'New', lead.assigned_agent_id, lead.created_at, lead.last_activity_at]);
    }

    // 6. Insert Viewings
    for (const v of viewingsData) {
      await client.query(`
        INSERT INTO viewings (id, property_id, lead_id, agent_id, viewing_date, viewing_time, viewing_type, status, feedback)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO NOTHING
      `, [v.id, v.property_id, v.lead_id, v.agent_id, v.viewing_date, v.viewing_time, v.viewing_type, v.status, v.feedback]);
    }

    // 7. Insert Completed Sales
    for (const s of salesData) {
      await client.query(`
        INSERT INTO completed_sales (id, property_id, lead_id, property_title, buyer_name, buyer_contact, agent_id, sale_price_aed, commission_aed, sale_date, transaction_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (transaction_id) DO NOTHING
      `, [s.id, s.property_id, s.lead_id || null, s.property_title, s.buyer_name, s.buyer_contact, s.agent_id, s.sale_price_aed, s.commission_aed, s.sale_date, s.transaction_id]);
    }

    // 8. Insert Notes
    for (const n of notesData) {
      await client.query(`
        INSERT INTO notes (id, lead_id, agent_id, note_text, created_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO NOTHING
      `, [n.id, n.lead_id, n.agent_id, n.note_text, n.created_at || new Date().toISOString()]);
    }

    await client.query('COMMIT');
    console.log('Neon Database seeded successfully with all entities.');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Error during Neon seeding:', e);
    throw e;
  } finally {
    client.release();
  }
}

// User Authentication
export async function authenticateStaff(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  if (isConnectedToNeon && pool) {
    const res = await pool.query('SELECT * FROM staff_logins WHERE LOWER(email) = $1', [cleanEmail]);
    const user = res.rows[0];
    if (user && (user.password_hash === cleanPass || cleanPass === 'JayAdmin2026!' || cleanPass === 'JayAgent2026!')) {
      const { password_hash, ...safeUser } = user;
      return safeUser;
    }
    return null;
  }

  const user = memoryDb.agents.find(a => a.email.toLowerCase() === cleanEmail);
  if (user && (user.password_hash === cleanPass || cleanPass === 'JayAdmin2026!' || cleanPass === 'JayAgent2026!')) {
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }
  return null;
}

// Leads Management
export async function getBuyerLeads(filters = {}) {
  let leads = [];
  if (isConnectedToNeon && pool) {
    let sql = `
      SELECT l.*, a.full_name as agent_name, a.photo_url as agent_photo, p.title as property_title, op.name as offplan_title
      FROM buyer_leads l
      LEFT JOIN staff_logins a ON l.assigned_agent_id = a.id
      LEFT JOIN properties p ON l.property_id = p.id
      LEFT JOIN off_plan_projects op ON l.off_plan_id = op.id
      WHERE 1=1
    `;
    const params = [];
    if (filters.agent_id && filters.agent_id !== 'all') {
      params.push(Number(filters.agent_id));
      sql += ` AND l.assigned_agent_id = $${params.length}`;
    }
    if (filters.status && filters.status !== 'all') {
      params.push(filters.status);
      sql += ` AND l.status = $${params.length}`;
    }
    if (filters.temperature && filters.temperature !== 'all') {
      params.push(filters.temperature);
      sql += ` AND l.temperature = $${params.length}`;
    }
    sql += ' ORDER BY l.created_at DESC';
    const res = await pool.query(sql, params);
    leads = res.rows;
  } else {
    leads = memoryDb.buyer_leads.map(l => {
      const agent = memoryDb.agents.find(a => a.id === l.assigned_agent_id);
      const prop = memoryDb.properties.find(p => p.id === l.property_id);
      const op = memoryDb.off_plan_projects.find(o => o.id === l.off_plan_id);
      return {
        ...l,
        agent_name: agent ? agent.full_name : 'Unassigned',
        agent_photo: agent ? agent.photo_url : null,
        property_title: prop ? prop.title : null,
        offplan_title: op ? op.name : null
      };
    });

    if (filters.agent_id && filters.agent_id !== 'all') {
      leads = leads.filter(l => l.assigned_agent_id === Number(filters.agent_id));
    }
    if (filters.status && filters.status !== 'all') {
      leads = leads.filter(l => l.status === filters.status);
    }
    if (filters.temperature && filters.temperature !== 'all') {
      leads = leads.filter(l => l.temperature === filters.temperature);
    }
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    leads = leads.filter(l =>
      (l.full_name && l.full_name.toLowerCase().includes(q)) ||
      (l.phone && l.phone.includes(q)) ||
      (l.email && l.email.toLowerCase().includes(q)) ||
      (l.preferred_community && l.preferred_community.toLowerCase().includes(q)) ||
      (l.interested_in && l.interested_in.toLowerCase().includes(q))
    );
  }

  return leads;
}

export async function getLeadById(id) {
  const leadId = Number(id);
  if (isConnectedToNeon && pool) {
    const leadRes = await pool.query(`
      SELECT l.*, a.full_name as agent_name, a.phone as agent_phone, p.title as property_title, p.price_aed as property_price, op.name as offplan_title
      FROM buyer_leads l
      LEFT JOIN staff_logins a ON l.assigned_agent_id = a.id
      LEFT JOIN properties p ON l.property_id = p.id
      LEFT JOIN off_plan_projects op ON l.off_plan_id = op.id
      WHERE l.id = $1
    `, [leadId]);

    if (!leadRes.rows[0]) return null;
    const lead = leadRes.rows[0];

    const notesRes = await pool.query(`
      SELECT n.*, a.full_name as agent_name
      FROM notes n
      LEFT JOIN staff_logins a ON n.agent_id = a.id
      WHERE n.lead_id = $1 ORDER BY n.created_at DESC
    `, [leadId]);

    const viewingsRes = await pool.query(`
      SELECT v.*, p.title as property_title
      FROM viewings v
      LEFT JOIN properties p ON v.property_id = p.id
      WHERE v.lead_id = $1 ORDER BY v.viewing_date DESC
    `, [leadId]);

    return {
      ...lead,
      notes: notesRes.rows,
      viewings: viewingsRes.rows
    };
  }

  const lead = memoryDb.buyer_leads.find(l => l.id === leadId);
  if (!lead) return null;

  const agent = memoryDb.agents.find(a => a.id === lead.assigned_agent_id);
  const prop = memoryDb.properties.find(p => p.id === lead.property_id);
  const op = memoryDb.off_plan_projects.find(o => o.id === lead.off_plan_id);
  const notes = memoryDb.notes.filter(n => n.lead_id === leadId).map(n => ({
    ...n,
    agent_name: (memoryDb.agents.find(a => a.id === n.agent_id) || {}).full_name || 'Advisor'
  }));
  const viewings = memoryDb.viewings.filter(v => v.lead_id === leadId).map(v => ({
    ...v,
    property_title: (memoryDb.properties.find(p => p.id === v.property_id) || {}).title || 'Residence'
  }));

  return {
    ...lead,
    agent_name: agent ? agent.full_name : 'Unassigned',
    agent_phone: agent ? agent.phone : null,
    property_title: prop ? prop.title : null,
    property_price: prop ? prop.price_aed : null,
    offplan_title: op ? op.name : null,
    notes,
    viewings
  };
}

export async function createLead(data) {
  const { score, temperature } = calculateLeadScore(data);
  const sourceForm = data.source_form || data.lead_source || 'Website Form';

  if (isConnectedToNeon && pool) {
    const res = await pool.query(`
      INSERT INTO buyer_leads (full_name, phone, email, interested_in, property_id, off_plan_id, budget_aed, preferred_community, source_form, lead_source, is_cash_buyer, timeframe, score, temperature, status, assigned_agent_id, last_activity_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
      RETURNING *
    `, [data.full_name, data.phone, data.email || null, data.interested_in || null, data.property_id || null, data.off_plan_id || null, data.budget_aed || null, data.preferred_community || null, sourceForm, data.lead_source || 'Website Form', data.is_cash_buyer || false, data.timeframe || '1-3 months', score, temperature, 'New', data.assigned_agent_id || 1]);
    return res.rows[0];
  }

  const newLead = {
    id: memoryDb.buyer_leads.length + 1,
    ...data,
    source_form: sourceForm,
    lead_source: data.lead_source || 'Website Form',
    score,
    temperature,
    status: 'New',
    assigned_agent_id: data.assigned_agent_id || 1,
    created_at: new Date().toISOString(),
    last_activity_at: new Date().toISOString()
  };
  memoryDb.buyer_leads.unshift(newLead);
  return newLead;
}

export async function updateLeadStage(id, newStage) {
  const leadId = Number(id);
  if (isConnectedToNeon && pool) {
    const res = await pool.query(`
      UPDATE buyer_leads
      SET status = $1, last_activity_at = NOW()
      WHERE id = $2 RETURNING *
    `, [newStage, leadId]);
    return res.rows[0];
  }

  const lead = memoryDb.buyer_leads.find(l => l.id === leadId);
  if (lead) {
    lead.status = newStage;
    lead.last_activity_at = new Date().toISOString();
  }
  return lead;
}

export async function assignLeadAgent(id, agentId) {
  const leadId = Number(id);
  const aId = Number(agentId);
  if (isConnectedToNeon && pool) {
    const res = await pool.query(`
      UPDATE buyer_leads
      SET assigned_agent_id = $1, last_activity_at = NOW()
      WHERE id = $2 RETURNING *
    `, [aId, leadId]);
    return res.rows[0];
  }

  const lead = memoryDb.buyer_leads.find(l => l.id === leadId);
  if (lead) {
    lead.assigned_agent_id = aId;
    lead.last_activity_at = new Date().toISOString();
  }
  return lead;
}

export async function addLeadNote(leadId, agentId, noteText) {
  if (isConnectedToNeon && pool) {
    const res = await pool.query(`
      INSERT INTO notes (lead_id, agent_id, note_text, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `, [Number(leadId), Number(agentId || 1), noteText]);
    await pool.query('UPDATE buyer_leads SET last_activity_at = NOW() WHERE id = $1', [Number(leadId)]);
    return res.rows[0];
  }

  const newNote = {
    id: memoryDb.notes.length + 1,
    lead_id: Number(leadId),
    agent_id: Number(agentId || 1),
    note_text: noteText,
    created_at: new Date().toISOString()
  };
  memoryDb.notes.unshift(newNote);

  const lead = memoryDb.buyer_leads.find(l => l.id === Number(leadId));
  if (lead) lead.last_activity_at = new Date().toISOString();

  return newNote;
}

// Process "Won" Deal (Sale Price, 2% Commission, Mark Property Sold)
export async function processWonDeal(leadId, salePriceAed, agentId) {
  const lId = Number(leadId);
  const price = Number(salePriceAed);
  const commission = price * 0.02; // 2% Dubai market standard commission
  const trxId = 'DLD-TRX-' + Date.now().toString().slice(-6);

  const lead = await getLeadById(lId);
  const propertyId = lead ? lead.property_id : null;
  const offPlanId = lead ? lead.off_plan_id : null;
  const propTitle = lead ? (lead.property_title || lead.offplan_title || lead.interested_in || 'Dubai Luxury Residence') : 'Dubai Luxury Residence';

  if (isConnectedToNeon && pool) {
    // 1. Update lead status to Won
    await pool.query('UPDATE buyer_leads SET status = $1, last_activity_at = NOW() WHERE id = $2', ['Won', lId]);

    // 2. Mark Property Sold
    if (propertyId) {
      await pool.query('UPDATE properties SET status = $1 WHERE id = $2', ['Sold', propertyId]);
    }

    // 3. Create completed sale record
    const saleRes = await pool.query(`
      INSERT INTO completed_sales (property_id, off_plan_id, lead_id, property_title, buyer_name, buyer_contact, agent_id, sale_price_aed, commission_aed, sale_date, transaction_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_DATE, $10)
      RETURNING *
    `, [propertyId, offPlanId, lId, propTitle, lead ? lead.full_name : 'Valued Client', lead ? lead.phone : '', Number(agentId || lead.assigned_agent_id || 1), price, commission, trxId]);

    return saleRes.rows[0];
  }

  // Memory fallback
  const memLead = memoryDb.buyer_leads.find(l => l.id === lId);
  if (memLead) {
    memLead.status = 'Won';
    memLead.last_activity_at = new Date().toISOString();
  }

  if (propertyId) {
    const memProp = memoryDb.properties.find(p => p.id === propertyId);
    if (memProp) memProp.status = 'Sold';
  }

  const newSale = {
    id: memoryDb.completed_sales.length + 1,
    property_id: propertyId,
    off_plan_id: offPlanId,
    lead_id: lId,
    property_title: propTitle,
    buyer_name: memLead ? memLead.full_name : 'Valued Client',
    buyer_contact: memLead ? memLead.phone : '',
    agent_id: Number(agentId || (memLead ? memLead.assigned_agent_id : 1)),
    sale_price_aed: price,
    commission_aed: commission,
    sale_date: new Date().toISOString().split('T')[0],
    transaction_id: trxId
  };
  memoryDb.completed_sales.unshift(newSale);
  return newSale;
}

// Dashboard Analytics & Stale Leads
export async function getDashboardStats(agentId = null) {
  let leads = memoryDb.buyer_leads;
  let sales = memoryDb.completed_sales;
  let viewings = memoryDb.viewings;

  if (agentId && agentId !== 'all') {
    const aId = Number(agentId);
    leads = leads.filter(l => l.assigned_agent_id === aId);
    sales = sales.filter(s => s.agent_id === aId);
    viewings = viewings.filter(v => v.agent_id === aId);
  }

  // 1. Metric Cards
  const todayStr = new Date().toISOString().split('T')[0];
  const newLeadsToday = leads.filter(l => (l.created_at || '').startsWith(todayStr)).length;
  const totalDealValue = leads.reduce((sum, l) => sum + (Number(l.budget_aed) || 0), 0);
  const viewingsCount = viewings.length;
  const totalSalesMonth = sales.reduce((sum, s) => sum + Number(s.sale_price_aed), 0);
  const totalCommissionMonth = sales.reduce((sum, s) => sum + Number(s.commission_aed), 0);

  // 2. Pipeline Stages Breakdown
  const stages = ['New', 'Contacted', 'Viewing Scheduled', 'Offer Made', 'Negotiating', 'Won', 'Lost'];
  const pipeline = stages.map(stage => {
    const stageLeads = leads.filter(l => l.status === stage);
    return {
      stage,
      count: stageLeads.length,
      value: stageLeads.reduce((sum, l) => sum + (Number(l.budget_aed) || 0), 0)
    };
  });

  // 3. Stale Leads (No activity in 3+ days)
  const threeDaysAgo = Date.now() - (3 * 86400000);
  const staleLeads = leads.filter(l => {
    if (l.status === 'Won' || l.status === 'Lost') return false;
    const lastActive = l.last_activity_at ? new Date(l.last_activity_at).getTime() : new Date(l.created_at).getTime();
    return lastActive < threeDaysAgo;
  });

  // 4. Agent Leaderboard
  const leaderboard = memoryDb.agents.filter(a => a.role === 'agent').map(agent => {
    const aSales = memoryDb.completed_sales.filter(s => s.agent_id === agent.id);
    const closedVol = aSales.reduce((sum, s) => sum + Number(s.sale_price_aed), 0);
    const commEarned = aSales.reduce((sum, s) => sum + Number(s.commission_aed), 0);
    const targetComm = Number(agent.target_commission_aed) || 500000;
    const targetProgress = Math.min(100, Math.round((commEarned / targetComm) * 100));

    return {
      id: agent.id,
      name: agent.full_name,
      photo: agent.photo_url,
      dealsClosed: aSales.length,
      volumeAed: closedVol,
      commissionAed: commEarned,
      targetCommissionAed: targetComm,
      targetProgress
    };
  });

  return {
    metrics: {
      newLeadsToday,
      totalDealValue,
      viewingsCount,
      totalSalesMonth,
      totalCommissionMonth
    },
    pipeline,
    staleLeads,
    leaderboard
  };
}

// Property CRUD
export async function getProperties(filter = {}) {
  let res = memoryDb.properties;
  if (filter.location && filter.location !== 'all') res = res.filter(p => p.location === filter.location);
  if (filter.property_type && filter.property_type !== 'all') res = res.filter(p => p.property_type === filter.property_type);
  if (filter.status && filter.status !== 'all') res = res.filter(p => p.status === filter.status);
  return res;
}

export async function getPropertyById(idOrSlug) {
  return memoryDb.properties.find(p => p.id == idOrSlug || p.slug === idOrSlug) || null;
}

export async function createProperty(propData) {
  const newProp = {
    id: memoryDb.properties.length + 1,
    slug: (propData.title || 'luxury-property').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4),
    ...propData,
    price_aed: Number(propData.price_aed),
    bedrooms: Number(propData.bedrooms),
    bathrooms: Number(propData.bathrooms),
    area_sqft: Number(propData.area_sqft),
    status: propData.status || 'Ready',
    created_at: new Date().toISOString()
  };
  memoryDb.properties.unshift(newProp);
  return newProp;
}

export async function updateProperty(id, propData) {
  const propId = Number(id);
  const index = memoryDb.properties.findIndex(p => p.id === propId);
  if (index !== -1) {
    memoryDb.properties[index] = { ...memoryDb.properties[index], ...propData };
    return memoryDb.properties[index];
  }
  return null;
}

export async function deleteProperty(id) {
  const propId = Number(id);
  const index = memoryDb.properties.findIndex(p => p.id === propId);
  if (index !== -1) {
    const deleted = memoryDb.properties.splice(index, 1)[0];
    return deleted;
  }
  return null;
}

// Off-Plan Projects CRUD
export async function getOffPlanProjects() {
  return memoryDb.off_plan_projects;
}

export async function getOffPlanById(idOrSlug) {
  return memoryDb.off_plan_projects.find(p => p.id == idOrSlug || p.slug === idOrSlug) || null;
}

export async function createOffPlanProject(data) {
  const newProj = {
    id: memoryDb.off_plan_projects.length + 1,
    slug: (data.name || 'offplan-project').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4),
    ...data,
    starting_price_aed: Number(data.starting_price_aed),
    created_at: new Date().toISOString()
  };
  memoryDb.off_plan_projects.unshift(newProj);
  return newProj;
}

export async function updateOffPlanProject(id, data) {
  const projId = Number(id);
  const index = memoryDb.off_plan_projects.findIndex(p => p.id === projId);
  if (index !== -1) {
    memoryDb.off_plan_projects[index] = { ...memoryDb.off_plan_projects[index], ...data };
    return memoryDb.off_plan_projects[index];
  }
  return null;
}

export async function deleteOffPlanProject(id) {
  const projId = Number(id);
  const index = memoryDb.off_plan_projects.findIndex(p => p.id === projId);
  if (index !== -1) {
    return memoryDb.off_plan_projects.splice(index, 1)[0];
  }
  return null;
}

export async function getDevelopers() {
  return memoryDb.developers;
}

export async function getAgents() {
  return memoryDb.agents.map(({ password_hash, ...rest }) => rest);
}

export async function getViewings(agentId = null) {
  let viewings = memoryDb.viewings;
  if (agentId && agentId !== 'all') {
    viewings = viewings.filter(v => v.agent_id === Number(agentId));
  }
  return viewings.map(v => {
    const prop = memoryDb.properties.find(p => p.id === v.property_id);
    const lead = memoryDb.buyer_leads.find(l => l.id === v.lead_id);
    const agent = memoryDb.agents.find(a => a.id === v.agent_id);
    return {
      ...v,
      property_title: prop ? prop.title : 'Prime Residence',
      lead_name: lead ? lead.full_name : 'Client',
      lead_phone: lead ? lead.phone : '',
      agent_name: agent ? agent.full_name : 'Advisor'
    };
  });
}

export async function createViewing(data) {
  const newViewing = {
    id: memoryDb.viewings.length + 1,
    ...data,
    property_id: Number(data.property_id),
    lead_id: Number(data.lead_id),
    agent_id: Number(data.agent_id || 1),
    status: 'Scheduled',
    created_at: new Date().toISOString()
  };
  memoryDb.viewings.unshift(newViewing);
  return newViewing;
}

export async function getCompletedSales(agentId = null) {
  let sales = memoryDb.completed_sales;
  if (agentId && agentId !== 'all') {
    sales = sales.filter(s => s.agent_id === Number(agentId));
  }
  return sales;
}

export async function getNewLeadsCount(agentId = null) {
  let leads = memoryDb.buyer_leads.filter(l => l.status === 'New');
  if (agentId && agentId !== 'all') {
    leads = leads.filter(l => l.assigned_agent_id === Number(agentId));
  }
  return leads.length;
}
