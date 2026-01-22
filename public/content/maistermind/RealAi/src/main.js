import './style.css';

const chatHistory = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const overlay = document.getElementById('velvet-rope-overlay');
const formContainer = document.getElementById('dynamic-form-container');

// State
let conversationStage = 'HOOK'; // HOOK, GATE, Q1, Q2, Q3

sendBtn.addEventListener('click', handleSendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendMessage();
});

async function handleSendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage('User', text);
    userInput.value = '';

    // Call Backend API
    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, stage: conversationStage })
        });
        
        const data = await response.json();
        
        if (data.reply) {
            appendMessage('RealAi', data.reply);
        }

        if (data.nextStage) {
            conversationStage = data.nextStage;
            handleStageTransition(data.nextStage);
        }

    } catch (error) {
        console.error('Error:', error);
        appendMessage('System', 'Connection error. Please try again.');
    }
}

function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender.toLowerCase()}`;
    msgDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function handleStageTransition(stage) {
    if (stage === 'GATE' || stage.startsWith('Q')) {
        // Here we could enforce the overlay or just keep it in chat.
        // For the "Velvet Rope" effect, let's keep it in chat as per "Conversational Sequence"
        // But if we wanted a modal, we'd show the overlay.
        // overlay.classList.remove('hidden'); 
    }
}
