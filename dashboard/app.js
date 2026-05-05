document.addEventListener('DOMContentLoaded', () => {
    // Initialize Gauges
    const navDisplay = new NavDisplay('nav-display-box');
    // UI Elements
    const elements = {
        cog: document.getElementById('cog'),
        sog: document.getElementById('sog'),
        aws: document.getElementById('aws'),
        awa: document.getElementById('awa'),
        twsSide: document.getElementById('tws-side'),
        twa: document.getElementById('twa'),
        cts: document.getElementById('cts'),
        dtg: document.getElementById('dtg'),
        wmg: document.getElementById('wmg'),
        eta: document.getElementById('eta'),
        awsVal: document.getElementById('aws-val'),
        hdgNum: document.getElementById('hdg-num'),
        tws: document.getElementById('tws'),
        themeToggle: document.getElementById('theme-toggle'),
        settingsToggle: document.getElementById('settings-toggle'),
        settingsPanel: document.getElementById('settings-panel'),
        settingsClose: document.getElementById('settings-close'),
        resetBtn: document.getElementById('reset-colors'),
        settingsInputs: document.querySelectorAll('[data-var]')
    };

    // Theme & Color Logic
    const initTheme = () => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (savedTheme === 'light') {
            document.documentElement.classList.add('light-mode');
            elements.themeToggle.textContent = '🌓 DARK MODE';
        }
        const customColors = JSON.parse(localStorage.getItem('customColors') || '{}');
        Object.entries(customColors).forEach(([varName, value]) => {
            document.documentElement.style.setProperty(varName, value);
            const input = document.querySelector(`[data-var="${varName}"]`);
            if (input) {
                // If it's a range with a unit, we need to extract the numeric value for the input
                const unit = input.dataset.unit;
                if (unit && typeof value === 'string' && value.endsWith(unit)) {
                    input.value = value.replace(unit, '');
                } else {
                    input.value = value;
                }
            }
        });
    };

    elements.settingsToggle.addEventListener('click', () => elements.settingsPanel.classList.add('open'));
    elements.settingsClose.addEventListener('click', () => elements.settingsPanel.classList.remove('open'));

    elements.settingsInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const varName = e.target.getAttribute('data-var');
            const unit = e.target.dataset.unit || '';
            const value = e.target.value + unit;
            
            document.documentElement.style.setProperty(varName, value);
            
            const customColors = JSON.parse(localStorage.getItem('customColors') || '{}');
            customColors[varName] = value;
            localStorage.setItem('customColors', JSON.stringify(customColors));
        });
    });

    elements.resetBtn.addEventListener('click', () => {
        localStorage.removeItem('customColors');
        location.reload();
    });

    elements.themeToggle.addEventListener('click', () => {
        const isLight = document.documentElement.classList.toggle('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        elements.themeToggle.textContent = isLight ? '🌓 DARK MODE' : '🌓 LIGHT MODE';
    });

    initTheme();

    // State
    let state = {
        hdg: 179,
        cog: 182,
        sog: 6.2,
        aws: 12.4,
        awa: 32,
        tws: 10.1,
        twa: 45,
        cts: 185,
        dtg: 4.2,
        wmg: 5.8,
        btw: 185, // Bearing to Waypoint
        eta: "14:25"
    };

    // Simulator
    function simulate() {
        state.hdg += (Math.random() - 0.5) * 1;
        state.cog = state.hdg + (Math.random() - 0.5) * 4;
        state.sog += (Math.random() - 0.5) * 0.1;
        state.aws += (Math.random() - 0.5) * 0.2;
        state.awa += (Math.random() - 0.5) * 2;
        state.tws += (Math.random() - 0.5) * 0.1;
        state.twa += (Math.random() - 0.5) * 1;
        state.cts += (Math.random() - 0.5) * 0.5;
        state.dtg -= 0.001; // Slowly decreasing
        if (state.dtg < 0) state.dtg = 10.0;
        
        state.wmg = state.sog * Math.cos(state.twa * Math.PI / 180) * (0.8 + Math.random() * 0.4);
        
        // Simple ETA calculation (seconds from now)
        const secondsToGo = (state.dtg / Math.max(state.sog, 0.1)) * 3600;
        const etaDate = new Date(Date.now() + secondsToGo * 1000);
        state.eta = etaDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

        state.btw += (Math.random() - 0.5) * 0.5;

        // Normalization
        state.hdg = (state.hdg + 360) % 360;
        state.cog = (state.cog + 360) % 360;
        state.awa = ((state.awa + 180) % 360) - 180;
        state.twa = ((state.twa + 180) % 360) - 180;

        updateUI();
    }

    function updateUI() {
        navDisplay.update(state.hdg, state.awa, state.sog, state.btw);

        elements.cog.textContent = Math.round(state.cog).toString().padStart(3, '0');
        elements.sog.textContent = state.sog.toFixed(1);
        elements.aws.textContent = state.aws.toFixed(1);
        elements.awa.textContent = Math.abs(Math.round(state.awa)) + (state.awa >= 0 ? ' R' : ' L');
        elements.twsSide.textContent = state.tws.toFixed(1);
        elements.twa.textContent = Math.abs(Math.round(state.twa)) + (state.twa >= 0 ? ' R' : ' L');
        
        elements.cts.textContent = Math.round(state.cts).toString().padStart(3, '0');
        elements.dtg.textContent = state.dtg.toFixed(2);
        elements.wmg.textContent = Math.abs(state.wmg).toFixed(1);
        elements.eta.textContent = state.eta;

        elements.awsVal.textContent = state.aws.toFixed(1);
        elements.hdgNum.textContent = Math.round(state.hdg).toString().padStart(3, '0');
        elements.tws.textContent = state.tws.toFixed(1);
    }

    setInterval(simulate, 1000);
    updateUI();
});
