(function() {
    // 1. Get Config from Script Tag
    const scriptTag = document.currentScript;
    const agentId = scriptTag.getAttribute('data-agent-id');
    const overrideTheme = scriptTag.getAttribute('data-theme');
    
    // API BASE URL (For Localhost dev, we use the origin of the script, or fallback)
    // In production, this would be https://app.estateguard.ai
    const API_BASE = scriptTag.src.substring(0, scriptTag.src.indexOf('/widget.js')); 
    
    if (!agentId) {
        console.error("EstateGuard Widget: Missing data-agent-id");
        return;
    }

    // 2. State
    let config = null;
    let sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    let isOpen = false;
    let messages = [];

    // 3. Create Container & Shadow DOM
    const container = document.createElement('div');
    container.id = 'estateguard-widget-container';
    document.body.appendChild(container);
    
    const shadow = container.attachShadow({ mode: 'open' });

    // 4. Styles
    const style = document.createElement('style');
    style.textContent = `
        :host {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999999;
            font-family: 'Inter', system-ui, sans-serif;
        }
        .launcher {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #D4AF37;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
            position: relative;
        }
        .launcher:hover { transform: scale(1.05); }
        .launcher svg { width: 30px; height: 30px; fill: white; }
        
        .chat-window {
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 350px;
            height: 500px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            opacity: 0;
            pointer-events: none;
            transform: translateY(20px);
            transition: all 0.3s ease;
        }
        .chat-window.open {
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0);
        }

        .header {
            background: #D4AF37;
            color: white;
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .agent-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            overflow: hidden;
        }
        .agent-info h3 { margin: 0; font-size: 16px; font-weight: 600; }
        .agent-info p { margin: 0; font-size: 12px; opacity: 0.9; }
        .close-btn { 
            margin-left: auto; 
            background: none; 
            border: none; 
            color: white; 
            cursor: pointer; 
            font-size: 20px;
        }

        .messages {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
            background: #F8FAFC;
        }

        .msg {
            max-width: 80%;
            padding: 10px 14px;
            border-radius: 12px;
            font-size: 14px;
            line-height: 1.4;
        }
        .msg.user {
            background: #D4AF37;
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 2px;
        }
        .msg.assistant {
            background: white;
            border: 1px solid #E2E8F0;
            color: #1E293B;
            align-self: flex-start;
            border-bottom-left-radius: 2px;
        }

        .input-area {
            padding: 12px;
            background: white;
            border-top: 1px solid #E2E8F0;
            display: flex;
            gap: 8px;
        }
        .input-area input {
            flex: 1;
            border: 1px solid #E2E8F0;
            border-radius: 20px;
            padding: 8px 16px;
            outline: none;
            font-size: 14px;
        }
        .input-area input:focus { border-color: #D4AF37; }
        .send-btn {
            background: #D4AF37;
            color: white;
            border: none;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* GATED FORM */
        .gated-form {
            padding: 16px;
            background: #FFFBEB;
            border: 1px solid #FCD34D;
            border-radius: 8px;
            margin-top: 8px;
        }
        .gated-form h4 { margin: 0 0 8px 0; font-size: 14px; color: #92400E; }
        .gated-form input {
            width: 100%;
            padding: 8px;
            margin-bottom: 8px;
            border: 1px solid #E2E8F0;
            border-radius: 4px;
            box-sizing: border-box; /* Fix padding issues */
        }
        .gated-form button {
            width: 100%;
            background: #D97706;
            color: white;
            border: none;
            padding: 8px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        }
        .powered-by {
            text-align: center;
            font-size: 10px;
            color: #94A3B8;
            padding: 4px;
            background: #F8FAFC;
        }
    `;
    shadow.appendChild(style);

    // 5. Build UI Elements
    const launcher = document.createElement('div');
    launcher.className = 'launcher';
    launcher.innerHTML = `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path></svg>`;
    
    const windowDiv = document.createElement('div');
    windowDiv.className = 'chat-window';
    windowDiv.innerHTML = `
        <div class="header">
            <div class="agent-avatar"><img src="" alt="" style="width:100%"></div>
            <div class="agent-info">
                <h3 id="agent-name">Loading...</h3>
                <p id="agent-company">EstateGuard AI</p>
            </div>
            <button class="close-btn">&times;</button>
        </div>
        <div class="messages" id="msgs">
            <div class="msg assistant">Hello! How can I help you with your property search today?</div>
        </div>
        <div class="input-area" id="input-area">
            <input type="text" placeholder="Ask about a property..." id="inp">
            <button class="send-btn" id="send">
                <svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
            </button>
        </div>
        <div class="powered-by">Powered by EstateGuard</div>
    `;

    shadow.appendChild(windowDiv);
    shadow.appendChild(launcher);

    // 6. Logic
    const els = {
        msgs: windowDiv.querySelector('#msgs'),
        inp: windowDiv.querySelector('#inp'),
        send: windowDiv.querySelector('#send'),
        name: windowDiv.querySelector('#agent-name'),
        company: windowDiv.querySelector('#agent-company'),
        avatar: windowDiv.querySelector('.agent-avatar img'),
        inputArea: windowDiv.querySelector('#input-area')
    };

    async function init() {
        try {
            const res = await fetch(`${API_BASE}/api/widget/config?agentId=${agentId}`);
            if (!res.ok) throw new Error("Failed to load");
            config = await res.json();
            
            // Apply Config
            const theme = overrideTheme || config.themeColor || '#D4AF37';
            launcher.style.background = theme;
            windowDiv.querySelector('.header').style.background = theme;
            // Note: Dynamic style injection for buttons would require more efficient CSS variable usage
            
            els.name.textContent = config.name;
            els.company.textContent = config.agencyName;
            els.avatar.src = config.logoUrl;
            
            launcher.addEventListener('click', toggle);
            windowDiv.querySelector('.close-btn').addEventListener('click', toggle);
            els.send.addEventListener('click', send);
            els.inp.addEventListener('keypress', (e) => e.key === 'Enter' && send());

        } catch (e) {
            console.error("Widget Load Error", e);
            launcher.style.display = 'none';
        }
    }

    function toggle() {
        isOpen = !isOpen;
        if (isOpen) {
            windowDiv.classList.add('open');
            els.inp.focus();
        } else {
            windowDiv.classList.remove('open');
        }
    }

    function renderMessage(role, text) {
        const div = document.createElement('div');
        div.className = `msg ${role}`;
        div.textContent = text;
        els.msgs.appendChild(div);
        els.msgs.scrollTop = els.msgs.scrollHeight;
    }

    function renderGateForm() {
        const form = document.createElement('div');
        form.className = 'gated-form';
        form.innerHTML = `
            <h4>Unlock Full Report</h4>
            <input type="text" placeholder="Your Name" id="lead-name">
            <input type="tel" placeholder="Mobile Number" id="lead-phone">
            <button id="lead-submit">Unlock Access</button>
        `;
        els.msgs.appendChild(form);
        els.msgs.scrollTop = els.msgs.scrollHeight;

        // Hide normal input
        els.inputArea.style.display = 'none';

        form.querySelector('#lead-submit').onclick = async () => {
            const name = form.querySelector('#lead-name').value;
            const phone = form.querySelector('#lead-phone').value;
            if(!name || !phone) return alert("Please fill in both fields");

            // Send Lead
            await fetch(`${API_BASE}/api/leads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentId, name, phone, interest: "Chat Gating" })
            });

            // Unlock
            form.innerHTML = `<div style="color:green; font-weight:bold; text-align:center">✓ You have been unlocked! an agent will contact you shortly.</div>`;
            setTimeout(() => {
                form.remove();
                els.inputArea.style.display = 'flex';
                renderMessage('assistant', "Thanks! I've unlocked the details. What specifically would you like to know about the property?");
            }, 2000);
        };
    }

    async function send() {
        const text = els.inp.value.trim();
        if (!text) return;

        renderMessage('user', text);
        els.inp.value = '';
        els.send.disabled = true;

        try {
             const res = await fetch(`${API_BASE}/api/widget/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentId,
                    sessionId,
                    message: text,
                    history: [] // Simplify history for MVP
                })
            });
            const data = await res.json();
            
            renderMessage('assistant', data.content);
            
            if (data.isGated) {
                renderGateForm();
            }

        } catch (e) {
            renderMessage('assistant', "Sorry, I'm having trouble connecting.");
        }
        
        els.send.disabled = false;
    }

    // Start
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }

})();
