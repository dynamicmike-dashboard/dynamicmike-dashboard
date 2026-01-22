const webpush = require('web-push');
require('dotenv').config();

// In a real app, you would fetch these from the database for the specific agent.
// For this single-user demo, we'll store the subscription in memory or env.

// VAPID keys should be generated once via `web-push generate-vapid-keys`
// and stored in .env
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        'mailto:admin@realai.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

// In-memory store for subscriptions (for demo)
let agentSubscription = null;

function subscribeAgent(subscription) {
    agentSubscription = subscription;
    console.log("Agent Subscribed for Notifications");
}

function sendNotification(leadData) {
    if (!agentSubscription) {
        console.log("No agent subscribed for notifications.");
        return;
    }

    const payload = JSON.stringify({
        title: 'New Elite Pilot Lead!',
        body: `Lead Captured: ${leadData}`,
        icon: '/vite.svg' 
    });

    webpush.sendNotification(agentSubscription, payload)
        .catch(error => console.error(error));
}

module.exports = { subscribeAgent, sendNotification };
