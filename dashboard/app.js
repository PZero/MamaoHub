document.addEventListener('DOMContentLoaded', () => {
    // Initialize Gauges
    const windGauge = new WindGauge('wind-gauge-box');
    const compassGauge = new CompassGauge('compass-gauge-box');

    // UI Elements
    const elements = {
        windSpeed: document.getElementById('wind-speed'),
        heading: document.getElementById('heading'),
        sog: document.getElementById('sog'),
        depth: document.getElementById('depth'),
        tws: document.getElementById('tws'),
        time: document.getElementById('time-display')
    };

    // State
    let state = {
        awa: 45,
        aws: 12.4,
        hdg: 120,
        sog: 6.2,
        depth: 4.5,
        tws: 15.1
    };

    // Simulator Logic
    function simulate() {
        // Subtle variations
        state.awa += (Math.random() - 0.5) * 5;
        state.aws += (Math.random() - 0.5) * 0.5;
        state.hdg += (Math.random() - 0.5) * 2;
        state.sog += (Math.random() - 0.5) * 0.1;
        state.depth += (Math.random() - 0.5) * 0.05;
        state.tws = state.aws * 1.2; // Simplified TWS calculation

        // Bounds
        if (state.aws < 0) state.aws = 0;
        if (state.sog < 0) state.sog = 0;
        if (state.depth < 1) state.depth = 1;
        
        updateUI();
    }

    function updateUI() {
        // Update Gauges
        windGauge.update(state.awa);
        compassGauge.update(state.hdg);

        // Update Text
        elements.windSpeed.innerHTML = `${state.aws.toFixed(1)}<span class="widget-unit">kn</span>`;
        elements.heading.innerHTML = `${Math.round((state.hdg + 360) % 360).toString().padStart(3, '0')}<span class="widget-unit">°</span>`;
        elements.sog.innerHTML = `${state.sog.toFixed(1)}<span class="widget-unit">kn</span>`;
        elements.depth.innerHTML = `${state.depth.toFixed(1)}<span class="widget-unit">m</span>`;
        elements.tws.innerHTML = `${state.tws.toFixed(1)}<span class="widget-unit">kn</span>`;

        // Update Time
        const now = new Date();
        elements.time.textContent = now.toLocaleTimeString('it-IT');
    }

    // Start Simulator
    setInterval(simulate, 1000);
    
    // Initial UI Update
    updateUI();

    console.log("MaMaoDash Simulator Initialized");
});
