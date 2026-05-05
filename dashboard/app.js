document.addEventListener('DOMContentLoaded', () => {
    // Initialize NavDisplay
    const navDisplay = new NavDisplay('nav-display-box');

    // UI Elements
    const elements = {
        windSpeed: document.getElementById('wind-speed'),
        heading: document.getElementById('heading'),
        sog: document.getElementById('sog'),
        depth: document.getElementById('depth'),
        tws: document.getElementById('tws'),
        time: document.getElementById('time-display'),
        themeToggle: document.getElementById('theme-toggle')
    };

    // Theme Logic
    const initTheme = () => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (savedTheme === 'light') {
            document.documentElement.classList.add('light-mode');
            elements.themeToggle.textContent = '🌓 DARK MODE';
        }
    };

    elements.themeToggle.addEventListener('click', () => {
        const isLight = document.documentElement.classList.toggle('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        elements.themeToggle.textContent = isLight ? '🌓 DARK MODE' : '🌓 LIGHT MODE';
    });

    initTheme();

    // State
    let state = {
        awa: 30,    // Apparent Wind Angle
        aws: 12.4,  // Apparent Wind Speed
        hdg: 120,   // Heading
        sog: 6.2,   // Speed Over Ground
        depth: 4.5, // Depth
        tws: 15.1   // True Wind Speed
    };

    // Simulator Logic
    function simulate() {
        // Subtle variations
        state.awa += (Math.random() - 0.5) * 4;
        state.aws += (Math.random() - 0.5) * 0.3;
        state.hdg += (Math.random() - 0.5) * 1.5;
        state.sog += (Math.random() - 0.5) * 0.1;
        state.depth += (Math.random() - 0.5) * 0.05;
        state.tws = state.aws * 1.1;

        // Keep values in range
        if (state.awa > 180) state.awa -= 360;
        if (state.awa < -180) state.awa += 360;
        state.hdg = (state.hdg + 360) % 360;

        updateUI();
    }

    function updateUI() {
        // Update Combined Gauge
        navDisplay.update(state.hdg, state.awa);

        // Update Text Overlays
        elements.windSpeed.textContent = state.aws.toFixed(1);
        elements.heading.textContent = Math.round(state.hdg).toString().padStart(3, '0');

        // Update Secondary Widgets
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

    console.log("MaMaoDash Simulator Initialized with Combined NavDisplay");
});
