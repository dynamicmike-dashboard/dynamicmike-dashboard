const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { handleChat, parseVoiceToProperty } = require('./gemini');
const { sendNotification, subscribeAgent } = require('./notifications');

dotenv.config();

const app = express();
const PORT = 3000;

// In-memory store for leads (for demo)
let leads = [];

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('dist')); // Serve built files in production

// Chat Endpoint
app.post('/api/chat', async (req, res) => {
    const { message, stage, sessionId = 'default-session' } = req.body;
    
    try {
        const response = await handleChat(sessionId, message, stage);
        
        // Check if we captured a lead (stage transition to DONE)
        if (response.nextStage === 'DONE' && stage === 'Q3') {
            console.log("LEAD CAPTURED! Triggering Notification...");
            
            // Extract info (Naive extraction for demo, ideally Gemini returns JSON)
            // We'll store the raw message as contact info for now.
            const newLead = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                contactInfo: message, // User's answer to Q3
                status: 'New',
                score: 'Unknown' // Will calculate in dashboard or here
            };
            
            // Simple Tire Kicker Scoring
            // If message contains "cash" or "pre-approval" in previous turns (not tracked easily here without full history analysis)
            // For MVP, randomly assign or assume High Quality if they passed the gate.
            newLead.score = Math.random() > 0.3 ? 'Serious Buyer' : 'Tire Kicker'; // Mock logic
            
            leads.push(newLead);
            sendNotification(JSON.stringify(newLead)); 
        }

        res.json(response);
    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Terminator Route (if served via Express, though Vite handles dev)
// app.get('/terminator', (req, res) => { ... });

// Agent Subscription Endpoint
app.post('/api/subscribe', (req, res) => {
    const subscription = req.body;
    subscribeAgent(subscription);
    res.status(201).json({ message: 'Subscribed' });
});

// Leads Endpoint for Dashboard
app.get('/api/leads', (req, res) => {
    res.json(leads);
});

// Update Lead Status Endpoint
app.post('/api/leads/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const lead = leads.find(l => l.id == id);
    if (lead) {
        lead.status = status;
        res.json(lead);
    } else {
        res.status(404).json({ error: 'Lead not found' });
    }
});

// Property Ingest Endpoint
app.post('/api/ingest', async (req, res) => {
    const { type, content } = req.body;
    // content can be text or transcription
    
    try {
        const propertyData = await parseVoiceToProperty(content);
        // For MVP, just return the data to UI. In real app, save to DB.
        res.json(propertyData);
    } catch (error) {
        console.error("Ingest Error", error);
        res.status(500).json({ error: "Ingestion failed" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
