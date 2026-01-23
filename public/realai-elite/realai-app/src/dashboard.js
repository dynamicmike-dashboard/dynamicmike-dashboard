import './style.css';

// Dashboard Logic
document.addEventListener('DOMContentLoaded', () => {
    fetchLeads();
    loadIdentity(); // Load saved branding
    setInterval(fetchLeads, 5000); // Poll every 5s for MVP
    
    document.getElementById('save-identity').addEventListener('click', saveIdentity);
    
    // Ingester Logic
    setupIngester();
    // Vault Logic
    setupVault();
});
    
let unreadLeads = false;

function loadIdentity() {
    const logo = localStorage.getItem('agency-logo');
    const key = localStorage.getItem('api-key');
    if (logo) {
        document.getElementById('agency-logo').value = logo;
        // Optionally update the UI header logo if one existed
    }
    if (key) document.getElementById('api-key').value = key;
}

function saveIdentity() {
    const logo = document.getElementById('agency-logo').value;
    const key = document.getElementById('api-key').value;
    localStorage.setItem('agency-logo', logo);
    localStorage.setItem('api-key', key);
    alert('Identity Vault Updated');
}

async function fetchLeads() {
    try {
        const response = await fetch('http://localhost:3000/api/leads');
        const leads = await response.json();
        renderDashboard(leads);
    } catch (error) {
        console.error('Failed to fetch leads:', error);
    }
}

function renderDashboard(leads) {
    updateStats(leads);
    renderFeed(leads);
    renderKanban(leads);
}

function updateStats(leads) {
    document.getElementById('total-leads').textContent = leads.length;
    const highValue = leads.filter(l => l.score === 'Serious Buyer').length;
    document.getElementById('high-value').textContent = highValue;
    
    // Check for new leads for Badge
    if (leads.length > 0 && !unreadLeads) { // Simple check for demo
        document.getElementById('red-badge').classList.remove('hidden');
        // unreadLeads = true; // Could toggle this on view
    }
}

function setupIngester() {
    const micBtn = document.getElementById('mic-btn');
    const input = document.getElementById('magic-input');
    const addBtn = document.getElementById('add-prop-btn');
    const resultDiv = document.getElementById('ingest-result');

    // Web Speech API
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        micBtn.onclick = () => {
            micBtn.classList.add('recording');
            recognition.start();
        };

        recognition.onresult = (event) => {
            micBtn.classList.remove('recording');
            const transcript = event.results[0][0].transcript;
            input.value = transcript;
            // Auto-trigger ingest for wow factor? Or let user review.
        };
        
        recognition.onerror = () => micBtn.classList.remove('recording');
        recognition.onend = () => micBtn.classList.remove('recording');
    }

    addBtn.onclick = async () => {
        const content = input.value;
        if (!content) return;
        
        resultDiv.textContent = "Processing with RealAi-Elite Architect...";
        resultDiv.classList.remove('hidden');

        try {
            const res = await fetch('http://localhost:3000/api/ingest', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ type: 'text', content })
            });
            const data = await res.json();
            
            // Render basic table
            if (data.error) {
                resultDiv.innerHTML = `<span style="color:red">Error: ${data.error}</span>`;
            } else {
                resultDiv.innerHTML = `
                    <h3>Property Draft</h3>
                    <table class="draft-table">
                        <tr><th>Address</th><td>${data.address || 'N/A'}</td></tr>
                        <tr><th>Price</th><td>${data.price ? '$' + data.price.toLocaleString() : 'N/A'}</td></tr>
                        <tr><th>Beds</th><td>${data.bedrooms || 'N/A'}</td></tr>
                        <tr><th>Baths</th><td>${data.bathrooms || 'N/A'}</td></tr>
                        <tr><th>Sq Ft</th><td>${data.sq_ft ? data.sq_ft.toLocaleString() : 'N/A'}</td></tr>
                        <tr><th>Features</th><td>${data.unique_features ? data.unique_features.join(', ') : 'None'}</td></tr>
                    </table>
                    <div style="margin-top:10px; text-align:right;">
                        <button id="confirm-save-btn" style="background:var(--color-gold); border:none; padding:5px 10px; cursor:pointer; font-weight:bold; border-radius:4px;">Save to Brain</button>
                    </div>
                `;
                
                document.getElementById('confirm-save-btn').onclick = () => {
                   alert('Property Saved to Brain!');
                   resultDiv.classList.add('hidden');
                   input.value = '';
                };
            }
        } catch (e) {
            resultDiv.textContent = "Error processing data.";
        }
    };
}

function setupVault() {
    const dropZone = document.getElementById('vault-drop-zone');
    const list = document.getElementById('file-list');

    dropZone.ondragover = (e) => { e.preventDefault(); dropZone.classList.add('dragover'); };
    dropZone.ondragleave = () => dropZone.classList.remove('dragover');
    dropZone.ondrop = (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        
        // Mock upload
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const li = document.createElement('li');
            li.textContent = files[0].name + " (Uploaded)";
            list.appendChild(li);
        }
    };
}

function renderFeed(leads) {
    const feedContainer = document.getElementById('live-feed');
    feedContainer.innerHTML = '';
    
    // Sort by newest
    const sortedLeads = [...leads].sort((a, b) => b.id - a.id);

    if (sortedLeads.length === 0) {
        feedContainer.innerHTML = '<div class="empty-state">No active signals detected.</div>';
        return;
    }

    sortedLeads.forEach(lead => {
        const row = document.createElement('div');
        row.className = 'lead-row';
        const date = new Date(lead.timestamp).toLocaleTimeString();
        
        row.innerHTML = `
            <span>${date}</span>
            <span>${lead.contactInfo.substring(0, 20)}...</span>
            <span class="score-badge ${lead.score === 'Serious Buyer' ? 'high' : 'low'}">${lead.score}</span>
            <span>${lead.status}</span>
            <button onclick="window.moveToKanban(${lead.id}, 'Qualified')">Qualify</button>
        `;
        feedContainer.appendChild(row);
    });
}

function renderKanban(leads) {
    // Clear cols
    ['col-new', 'col-qualified', 'col-viewing', 'col-closed'].forEach(id => {
        document.getElementById(id).innerHTML = '';
    });

    leads.forEach(lead => {
        const card = document.createElement('div');
        card.className = 'kanban-card';
        card.draggable = true;
        card.innerHTML = `
            <div class="k-header">
                <span class="k-id">#${lead.id.toString().slice(-4)}</span>
                <span class="k-time">${new Date(lead.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <div class="k-body">
                ${lead.contactInfo}
            </div>
            <div class="k-footer">
                <span class="score-dot ${lead.score === 'Serious Buyer' ? 'green' : 'red'}"></span>
            </div>
        `;
        
        // Determine column
        let colId = 'col-new';
        if (lead.status === 'Qualified') colId = 'col-qualified';
        if (lead.status === 'Viewing') colId = 'col-viewing';
        if (lead.status === 'Closed') colId = 'col-closed';

        document.getElementById(colId).appendChild(card);
    });
}

// Make globally available for inline onclicks (hacky for MVP)
window.moveToKanban = async (id, status) => {
    await fetch(`http://localhost:3000/api/leads/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
    fetchLeads();
};
