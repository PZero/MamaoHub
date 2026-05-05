document.addEventListener('DOMContentLoaded', () => {
    // Initialize Gauges
    const navDisplay = new NavDisplay('nav-display-box');
    const sogGauge = new AnalogGauge('sog-gauge-box', 'SOG', 0, 10, 'knots');

    // UI Elements
    const elements = {
        depth: document.getElementById('depth'),
        sogText: document.getElementById('sog'),
        awsVal: document.getElementById('aws-val'),
        hdgNum: document.getElementById('hdg-num'),
        tws: document.getElementById('tws'),
        graphLabel: document.getElementById('graph-label'),
        themeToggle: document.getElementById('theme-toggle'),
        settingsToggle: document.getElementById('settings-toggle'),
        settingsPanel: document.getElementById('settings-panel'),
        settingsClose: document.getElementById('settings-close'),
        resetBtn: document.getElementById('reset-colors'),
        colorInputs: document.querySelectorAll('input[type="color"]')
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
            const input = document.querySelector(`input[data-var="${varName}"]`);
            if (input) input.value = value;
        });
    };

    elements.settingsToggle.addEventListener('click', () => elements.settingsPanel.classList.add('open'));
    elements.settingsClose.addEventListener('click', () => elements.settingsPanel.classList.remove('open'));

    elements.colorInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const varName = e.target.getAttribute('data-var');
            const value = e.target.value;
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
        awa: 30,
        aws: 12.4,
        hdg: 179,
        sog: 6.2,
        depth: 10.8,
        tws: 0.0
    };

    // Simulator
    function simulate() {
        state.awa += (Math.random() - 0.5) * 3;
        state.aws += (Math.random() - 0.5) * 0.2;
        state.hdg += (Math.random() - 0.5) * 1;
        state.sog += (Math.random() - 0.5) * 0.05;
        state.depth += (Math.random() - 0.5) * 0.01;

        if (state.awa > 180) state.awa -= 360;
        if (state.awa < -180) state.awa += 360;
        state.hdg = (state.hdg + 360) % 360;

        updateUI();
    }

    function updateUI() {
        navDisplay.update(state.hdg, state.awa);
        sogGauge.update(state.sog);

        elements.depth.textContent = state.depth.toFixed(1);
        elements.sogText.textContent = state.sog.toFixed(1);
        elements.awsVal.textContent = state.aws.toFixed(1);
        elements.hdgNum.textContent = Math.round(state.hdg).toString().padStart(3, '0');
        elements.tws.textContent = state.tws.toFixed(1);
        elements.graphLabel.textContent = `${state.aws.toFixed(1)} knots`;
    }

    setInterval(simulate, 1000);
    updateUI();
});
