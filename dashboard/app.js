document.addEventListener('DOMContentLoaded', () => {
    // TAG METADATA
    const TAG_METADATA = {
        COG: { label: 'COG', unit: '°', format: (v) => Math.round(v).toString().padStart(3, '0') },
        SOG: { label: 'SOG', unit: 'kn', format: (v) => v.toFixed(1) },
        BTW: { label: 'BTW', unit: '°', format: (v) => Math.round(v).toString().padStart(3, '0') },
        DTG: { label: 'DTG', unit: 'nm', format: (v) => v.toFixed(2) },
        ETA: { label: 'ETA', unit: '', format: (v) => v },
        WMG: { label: 'WMG', unit: 'kn', format: (v) => Math.abs(v).toFixed(1) },
        CTS: { label: 'CTS', unit: '°', format: (v) => Math.round(v).toString().padStart(3, '0') },
        AWS: { label: 'AWS', unit: 'kn', format: (v) => v.toFixed(1) },
        AWA: { label: 'AWA', unit: '°', format: (v) => Math.abs(Math.round(v)) + (v >= 0 ? ' R' : ' L') },
        TWS: { label: 'TWS', unit: 'kn', format: (v) => v.toFixed(1) },
        TWA: { label: 'TWA', unit: '°', format: (v) => Math.abs(Math.round(v)) + (v >= 0 ? ' R' : ' L') },
        TWD: { label: 'TWD', unit: '°', format: (v) => Math.round(v).toString().padStart(3, '0') },
        HDG: { label: 'HDG', unit: '°', format: (v) => Math.round(v).toString().padStart(3, '0') },
        DEPTH: { label: 'DEPTH', unit: 'm', format: (v) => v.toFixed(1) },
        STW: { label: 'STW', unit: 'kn', format: (v) => v.toFixed(1) },
        TEMP: { label: 'TEMP', unit: '°C', format: (v) => v.toFixed(1) },
        MAP: { label: 'MAP', unit: '', format: (v) => '' }
    };

    // State
    let state = {
        hdg: 179, cog: 182, sog: 6.2, aws: 12.4, awa: 32, tws: 10.1, twa: 45, twd: 190,
        cts: 185, dtg: 4.2, wmg: 5.8, btw: 185, eta: "14:25", depth: 4.5, stw: 6.0, temp: 18.5,
        battery: 13.2, lat: 44.4949, lon: 11.3426, mode: 'sim'
    };

    // UI Elements
    const elements = {
        themeToggle: document.getElementById('theme-toggle'),
        settingsToggle: document.getElementById('settings-toggle'),
        settingsPanel: document.getElementById('settings-panel'),
        settingsClose: document.getElementById('settings-close'),
        resetBtn: document.getElementById('reset-colors'),
        settingsInputs: document.querySelectorAll('[data-var]'),
        leftCol: document.getElementById('left-col'),
        rightCol: document.getElementById('right-col'),
        tagsConfigBody: document.getElementById('tags-config-body'),
        awsVal: document.getElementById('aws-val'),
        hdgNum: document.getElementById('hdg-num'),
        twsCenter: document.getElementById('tws'),
        battery: document.getElementById('battery'),
        modeLabel: document.getElementById('mode-label'),
        dataModeSelect: document.getElementById('data-mode-select')
    };

    const navDisplay = new NavDisplay('nav-display-box');
    let mapInstance = null;
    let boatMarker = null;
    let tagConfig = getDefaultConfig(); // Default values

    // --- 1. ATTACH UI LISTENERS IMMEDIATELY ---
    if (elements.settingsToggle && elements.settingsPanel) {
        elements.settingsToggle.addEventListener('click', () => {
            console.log('Opening settings panel');
            elements.settingsPanel.classList.add('open');
        });
    }

    if (elements.settingsClose && elements.settingsPanel) {
        elements.settingsClose.addEventListener('click', () => {
            elements.settingsPanel.classList.remove('open');
        });
    }

    if (elements.themeToggle) {
        elements.themeToggle.addEventListener('click', () => {
            const isLight = document.documentElement.classList.toggle('light-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            elements.themeToggle.textContent = isLight ? '🌓 DARK MODE' : '🌓 LIGHT MODE';
            saveSettings();
        });
    }

    if (elements.resetBtn) {
        elements.resetBtn.addEventListener('click', () => {
            if (confirm('Ripristinare tutte le impostazioni predefinite?')) {
                localStorage.clear();
                location.reload();
            }
        });
    }

    // --- 2. SETTINGS SYNC ---
    async function loadSettings() {
        console.log('Loading settings...');
        try {
            const response = await fetch('/api/settings');
            if (response.ok) {
                const serverSettings = await response.json();
                if (serverSettings.tagConfig) {
                    tagConfig = serverSettings.tagConfig;
                    localStorage.setItem('tagConfig', JSON.stringify(tagConfig));
                }
                if (serverSettings.customColors) {
                    localStorage.setItem('customColors', JSON.stringify(serverSettings.customColors));
                }
                state.mode = serverSettings.mode || 'sim';
                if (elements.dataModeSelect) elements.dataModeSelect.value = state.mode;
                console.log('Settings loaded from server');
            } else {
                throw new Error('Server response not OK');
            }
        } catch (e) {
            console.log('Backend not available or error, using local storage');
            try {
                const local = localStorage.getItem('tagConfig');
                if (local) tagConfig = JSON.parse(local);
            } catch (err) { console.error('Local storage corrupted', err); }
        }
        
        // Ensure tagConfig is always an array
        if (!Array.isArray(tagConfig)) tagConfig = getDefaultConfig();
        
        initTheme();
        renderSidebars();
        renderTagSettings();
        updateModeUI();
    }

    async function saveSettings() {
        const customColors = JSON.parse(localStorage.getItem('customColors') || '{}');
        const settings = {
            tagConfig,
            customColors,
            mode: state.mode
        };
        localStorage.setItem('tagConfig', JSON.stringify(tagConfig));
        try {
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
        } catch (e) { /* Standalone mode */ }
    }

    function getDefaultConfig() {
        return [
            { id: 'COG', col: 'left', pos: 1 }, { id: 'SOG', col: 'left', pos: 2 },
            { id: 'MAP', col: 'left', pos: 3 }, { id: 'AWS', col: 'left', pos: 4 },
            { id: 'AWA', col: 'left', pos: 5 }, { id: 'TWS', col: 'right', pos: 1 },
            { id: 'TWA', col: 'right', pos: 2 }, { id: 'CTS', col: 'right', pos: 3 },
            { id: 'DTG', col: 'right', pos: 4 }, { id: 'ETA', col: 'right', pos: 5 }
        ];
    }

    // RENDERING
    function renderSidebars() {
        if (mapInstance) { mapInstance.remove(); mapInstance = null; boatMarker = null; }
        elements.leftCol.innerHTML = ''; elements.rightCol.innerHTML = '';
        const leftTags = tagConfig.filter(t => t.col === 'left').sort((a, b) => a.pos - b.pos);
        const rightTags = tagConfig.filter(t => t.col === 'right').sort((a, b) => a.pos - b.pos);
        leftTags.forEach(tag => elements.leftCol.appendChild(createWidget(tag.id)));
        rightTags.forEach(tag => elements.rightCol.appendChild(createWidget(tag.id)));
        if (document.getElementById('map-canvas')) initMap();
    }

    function createWidget(tagId) {
        const meta = TAG_METADATA[tagId];
        const section = document.createElement('section');
        section.className = 'widget';
        if (tagId === 'MAP') {
            section.innerHTML = `<div id="map-canvas" class="map-container"></div>`;
        } else {
            section.innerHTML = `
                <div class="widget-label">${meta.label}</div>
                <div class="value-row">
                    <span id="tag-val-${tagId.toLowerCase()}">--</span>
                    ${meta.unit ? `<span class="unit">${meta.unit}</span>` : ''}
                </div>
            `;
        }
        return section;
    }

    function initMap() {
        if (typeof L === 'undefined') return;
        mapInstance = L.map('map-canvas', { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false }).setView([state.lat, state.lon], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance);
        boatMarker = L.circleMarker([state.lat, state.lon], { radius: 6, color: '#fff', weight: 2, fillColor: 'var(--accent-cyan)', fillOpacity: 1 }).addTo(mapInstance);
    }

    function renderTagSettings() {
        elements.tagsConfigBody.innerHTML = '';
        const sortedTags = Object.keys(TAG_METADATA).sort((a, b) => a === 'MAP' ? -1 : b === 'MAP' ? 1 : a.localeCompare(b));
        sortedTags.forEach(tagId => {
            const config = tagConfig.find(t => t.id === tagId) || { id: tagId, col: 'none', pos: 99 };
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight:bold">${tagId}</td>
                <td><select data-tag="${tagId}" class="tag-col-select"><option value="none" ${config.col === 'none' ? 'selected' : ''}>-</option><option value="left" ${config.col === 'left' ? 'selected' : ''}>L</option><option value="right" ${config.col === 'right' ? 'selected' : ''}>R</option></select></td>
                <td><input type="number" data-tag="${tagId}" class="tag-pos-input" value="${config.pos}" min="1" max="20"></td>
            `;
            elements.tagsConfigBody.appendChild(tr);
        });

        document.querySelectorAll('.tag-col-select, .tag-pos-input').forEach(el => {
            el.addEventListener('change', (e) => {
                const id = e.target.dataset.tag;
                let conf = tagConfig.find(t => t.id === id);
                if (!conf) { conf = { id, col: 'none', pos: 99 }; tagConfig.push(conf); }
                if (e.target.classList.contains('tag-col-select')) conf.col = e.target.value;
                else conf.pos = parseInt(e.target.value);
                saveSettings(); renderSidebars(); updateUI();
            });
        });
    }

    // THEME
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.classList.toggle('light-mode', savedTheme === 'light');
        elements.themeToggle.textContent = savedTheme === 'light' ? '🌓 DARK MODE' : '🌓 LIGHT MODE';
        const customColors = JSON.parse(localStorage.getItem('customColors') || '{}');
        Object.entries(customColors).forEach(([varName, value]) => {
            document.documentElement.style.setProperty(varName, value);
            const input = document.querySelector(`[data-var="${varName}"]`);
            if (input) input.value = input.dataset.unit ? value.replace(input.dataset.unit, '') : value;
        });
    }

    elements.settingsInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const varName = e.target.getAttribute('data-var');
            const value = e.target.value + (e.target.dataset.unit || '');
            document.documentElement.style.setProperty(varName, value);
            const customColors = JSON.parse(localStorage.getItem('customColors') || '{}');
            customColors[varName] = value;
            localStorage.setItem('customColors', JSON.stringify(customColors));
            saveSettings();
        });
    });

    elements.dataModeSelect.addEventListener('change', (e) => {
        state.mode = e.target.value;
        updateModeUI();
        saveSettings();
    });

    function updateModeUI() {
        elements.modeLabel.textContent = state.mode === 'sim' ? 'SIMULATORE' : 'DATI REALI';
        elements.modeLabel.parentElement.parentElement.classList.toggle('sim-mode', state.mode === 'sim');
    }

    // SIMULATION & DATA
    function simulate() {
        if (state.mode !== 'sim') return;
        state.hdg += (Math.random() - 0.5); state.cog = state.hdg + (Math.random() - 0.5) * 4;
        state.sog += (Math.random() - 0.5) * 0.1; state.aws += (Math.random() - 0.5) * 0.2;
        state.awa += (Math.random() - 0.5) * 2; state.tws += (Math.random() - 0.5) * 0.1;
        state.twa += (Math.random() - 0.5) * 1; state.twd = (state.hdg + state.twa + 360) % 360;
        state.cts += (Math.random() - 0.5) * 0.5; state.dtg -= 0.001;
        if (state.dtg < 0) state.dtg = 10.0;
        state.wmg = state.sog * Math.cos(state.twa * Math.PI / 180) * 0.9;
        const secondsToGo = (state.dtg / Math.max(state.sog, 0.1)) * 3600;
        state.eta = new Date(Date.now() + secondsToGo * 1000).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        state.btw += (Math.random() - 0.5) * 0.5; state.depth += (Math.random() - 0.5) * 0.1;
        state.stw = state.sog * 0.95; state.temp = 18.5 + Math.sin(Date.now() / 100000) * 0.5;
        state.battery = 13.2 + (Math.random() - 0.5) * 0.05;
        const speedMps = state.sog * 0.51444; const dist = speedMps * 1; const bearingRad = state.cog * Math.PI / 180;
        state.lat += (dist * Math.cos(bearingRad)) / 111320; state.lon += (dist * Math.sin(bearingRad)) / (111320 * Math.cos(state.lat * Math.PI / 180));
        state.hdg = (state.hdg + 360) % 360; state.cog = (state.cog + 360) % 360;
        state.awa = ((state.awa + 180) % 360) - 180; state.twa = ((state.twa + 180) % 360) - 180;
        updateUI();
    }

    // Signal K Integration
    let skSocket = null;
    function connectSignalK() {
        if (state.mode === 'sim') { if (skSocket) skSocket.close(); return; }
        const host = window.location.hostname || 'localhost';
        skSocket = new WebSocket(`ws://${host}:3000/signalk/v1/stream?subscribe=none`);
        skSocket.onopen = () => {
            console.log('Connected to Signal K');
            skSocket.send(JSON.stringify({ context: 'vessels.self', subscribe: [{ path: 'navigation.*' }, { path: 'environment.*' }, { path: 'propulsion.*' }] }));
        };
        skSocket.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.updates) msg.updates.forEach(update => {
                if (update.values) update.values.forEach(val => updateStateFromSK(val.path, val.value));
            });
            updateUI();
        };
        skSocket.onerror = () => console.log('Signal K error - ensure it is running on port 3000');
    }

    function updateStateFromSK(path, value) {
        const mapping = {
            'navigation.headingTrue': 'hdg', 'navigation.courseOverGroundTrue': 'cog',
            'navigation.speedOverGround': 'sog', 'environment.wind.speedApparent': 'aws',
            'environment.wind.angleApparent': 'awa', 'environment.wind.speedTrue': 'tws',
            'environment.wind.angleTrueGround': 'twa', 'environment.depth.belowTransducer': 'depth',
            'navigation.position': (v) => { state.lat = v.latitude; state.lon = v.longitude; }
        };
        const key = mapping[path];
        if (typeof key === 'string') {
            if (path.includes('speed')) state[key] = value * 1.94384; // m/s to knots
            else if (path.includes('heading') || path.includes('angle') || path.includes('course')) state[key] = value * 180 / Math.PI;
            else state[key] = value;
        } else if (typeof key === 'function') key(value);
    }

    function updateUI() {
        navDisplay.update(state.hdg, state.awa, state.sog, state.btw);
        tagConfig.forEach(conf => {
            if (conf.col === 'none') return;
            const el = document.getElementById(`tag-val-${conf.id.toLowerCase()}`);
            if (el) el.textContent = TAG_METADATA[conf.id].format(state[conf.id.toLowerCase()]);
        });
        if (mapInstance && boatMarker) { mapInstance.panTo([state.lat, state.lon], { animate: false }); boatMarker.setLatLng([state.lat, state.lon]); }
        elements.awsVal.textContent = state.aws.toFixed(1);
        elements.hdgNum.textContent = Math.round(state.hdg).toString().padStart(3, '0');
        elements.twsCenter.textContent = state.tws.toFixed(1);
        elements.battery.textContent = state.battery.toFixed(1) + 'V';
    }

    loadSettings();
    setInterval(simulate, 1000);
    setInterval(() => { if (state.mode === 'real' && !skSocket) connectSignalK(); }, 5000);
    updateUI();
});
