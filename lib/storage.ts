import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

export interface AgentConfig {
  id: string;
  name: string;
  agencyName: string;
  bio: string;
  themeColor: string;
  logoUrl: string;
  securityEnabled: boolean;
  gatingThreshold: number;
  apiKey: string;
  // Business Training Data
  termsAndConditions?: string;
  privacyPolicy?: string;
  nda?: string;
  locationHours?: string;
  serviceAreas?: string;
  commissionRates?: string;
  marketingStrategy?: string;
  teamMembers?: string;
  awards?: string;
  legalDisclaimer?: string;
}

export interface Lead {
  id: string;
  agentId: string;
  name: string;
  phone: string;
  email?: string;
  interest?: string;
  createdAt: string;
  status: 'new' | 'contacted' | 'closed';
}

export interface Property {
  id: string;
  address: string;
  price: string;
  beds: number;
  baths: number;
  sqft: string;
  img: string;
  status: 'ACTIVE' | 'DRAFT' | 'SOLD';
  statusColor: string;
  // AI Training Data
  proximityWaterfront?: string;
  commuteTime?: string;
  schools?: string;
  hospitals?: string;
  supermarkets?: string;
}

export interface Session {
  id: string;
  agentId: string;
  messageCount: number;
  isGated: boolean;
  lastActive: string;
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getAgentConfig(agentId: string): AgentConfig | null {
  try {
    const filePath = path.join(DATA_DIR, 'agents.json');
    if (!fs.existsSync(filePath)) return null;
    
    const data = fs.readFileSync(filePath, 'utf8');
    const agents = JSON.parse(data);
    return agents[agentId] || agents['default'] || null;
  } catch (error) {
    console.error('Error reading agent config:', error);
    return null;
  }
}

export function saveAgentConfig(agentId: string, updates: Partial<AgentConfig>): AgentConfig | null {
  try {
    ensureDir();
    const filePath = path.join(DATA_DIR, 'agents.json');
    let agents: Record<string, AgentConfig> = {};
    
    if (fs.existsSync(filePath)) {
      agents = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    const current = agents[agentId] || agents['default'];
    if (!current) return null;

    agents[agentId] = { ...current, ...updates, id: agentId };
    
    fs.writeFileSync(filePath, JSON.stringify(agents, null, 2));
    return agents[agentId];
  } catch (error) {
    console.error('Error saving agent config:', error);
    return null;
  }
}

export function saveLead(lead: Omit<Lead, 'id' | 'createdAt' | 'status'>): Lead | null {
  try {
    ensureDir();
    const filePath = path.join(DATA_DIR, 'leads.json');
    let leads: Lead[] = [];
    
    if (fs.existsSync(filePath)) {
      leads = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    const newLead: Lead = {
      ...lead,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'new'
    };

    leads.unshift(newLead); // Add to top
    
    fs.writeFileSync(filePath, JSON.stringify(leads, null, 2));
    return newLead;
  } catch (error) {
    console.error('Error saving lead:', error);
    return null;
  }
}

export function getSession(sessionId: string, agentId: string): Session {
  try {
    ensureDir();
    const filePath = path.join(DATA_DIR, 'sessions.json');
    let sessions: Record<string, Session> = {};
    
    if (fs.existsSync(filePath)) {
      sessions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    if (!sessions[sessionId]) {
      sessions[sessionId] = {
        id: sessionId,
        agentId,
        messageCount: 0,
        isGated: false,
        lastActive: new Date().toISOString()
      };
      fs.writeFileSync(filePath, JSON.stringify(sessions, null, 2));
    }

    return sessions[sessionId];
  } catch (error) {
    console.error('Error reading session:', error);
    // Return a temporary safe session if File IO fails
    return { id: sessionId, agentId, messageCount: 0, isGated: false, lastActive: new Date().toISOString() };
  }
}

export function updateSession(sessionId: string, updates: Partial<Session>): Session | null {
  try {
    ensureDir();
    const filePath = path.join(DATA_DIR, 'sessions.json');
    let sessions: Record<string, Session> = {};

    if (fs.existsSync(filePath)) {
      sessions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    if (!sessions[sessionId]) return null;

    sessions[sessionId] = { ...sessions[sessionId], ...updates, lastActive: new Date().toISOString() };
    fs.writeFileSync(filePath, JSON.stringify(sessions, null, 2));
    
    return sessions[sessionId];
  } catch (error) {
    console.error('Error updating session:', error);
    return null;
  }
}

export function getLeads(agentId: string): Lead[] {
  try {
    const filePath = path.join(DATA_DIR, 'leads.json');
    if (!fs.existsSync(filePath)) return [];
    
    const leads: Lead[] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return leads.filter(l => l.agentId === agentId);
  } catch (error) {
    console.error('Error reading leads:', error);
    return [];
  }
}
