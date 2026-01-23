// RealAi-Elite: Tire Kicker Terminator Logic

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Scarcity Logic: Get User City (with Luxury Fallback)
    const citySpan = document.getElementById('user-city');
    const luxuryMarkets = ['Miami', 'Dubai', 'Austin', 'Los Angeles', 'Playa del Carmen', 'New York', 'London'];
    
    try {
        // Try to get real location
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error('API failed');
        const data = await response.json();
        
        if (data && data.city) {
            citySpan.textContent = data.city;
        } else {
            throw new Error('No city data');
        }
    } catch (error) {
        // Fallback to random luxury market if API blocks us (common with adblockers)
        const randomCity = luxuryMarkets[Math.floor(Math.random() * luxuryMarkets.length)];
        citySpan.textContent = randomCity;
    }

    // 2. Interactive Qualification Gate
    const applyBtn = document.getElementById('apply-btn');
    
    applyBtn.addEventListener('click', () => {
        // The "Terminator" Logic
        const isQualified = confirm(
            "🔒 SECURITY CHECK\n\nTo access the Elite Pilot data vault, please confirm:\n\nDo you have proof of funds (Cash) or a valid Pre-approval letter ready for upload?"
        );

        if (isQualified) {
            // User passed the gate
            alert("✅ Access Granted.\n\nRedirecting to Secure Enrollment...");
            // In a real app, this goes to Stripe or the Dashboard signup
            window.location.href = 'https://buy.stripe.com/test_placeholder'; 
        } else {
            // User failed the gate (The Terminator Function)
            alert("⛔ ACCESS DENIED\n\nRealAi-Elite is authorized for transaction-ready agents only.\nPlease return when you are capitalized.");
        }
    });
});
