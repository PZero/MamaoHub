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

    // Initialize Gauges
    const navDisplay = new NavDisplay('nav-display-box');

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
        battery: document.getElementById('battery')
    };

    // State
    let state = {
        hdg: 179,
        cog: 182,
        sog: 6.2,
        aws: 12.4,
        awa: 32,
        tws: 10.1,
        twa: 45,
        twd: 190,
        cts: 185,
        dtg: 4.2,
        wmg: 5.8,
        btw: 185,
        eta: "14:25",
        depth: 4.5,
        stw: 6.0,
        temp: 18.5,
        battery: 13.2,
        lat: 44.4949, // Bologna (Simulated start)
        lon: 11.3426
    };

    // Map instances
    let mapInstance = null;
    let boatMarker = null;

    // TAG CONFIGURATION
    let tagConfig = JSON.parse(localStorage.getItem('tagConfig')) || [
        { id: 'COG', col: 'left', pos: 1 },
        { id: 'SOG', col: 'left', pos: 2 },
        { id: 'MAP', col: 'left', pos: 3 },
        { id: 'AWS', col: 'left', pos: 4 },
        { id: 'AWA', col: 'left', pos: 5 },
        { id: 'TWS', col: 'right', pos: 1 },
        { id: 'TWA', col: 'right', pos: 2 },
        { id: 'CTS', col: 'right', pos: 3 },
        { id: 'DTG', col: 'right', pos: 4 },
        { id: 'ETA', col: 'right', pos: 5 }
    ];

    function saveTagConfig() {
        localStorage.setItem('tagConfig', JSON.stringify(tagConfig));
        renderSidebars();
        updateUI();
    }

    function renderSidebars() {
        // Cleanup existing map if any
        if (mapInstance) {
            mapInstance.remove();
            mapInstance = null;
            boatMarker = null;
        }

        elements.leftCol.innerHTML = '';
        elements.rightCol.innerHTML = '';

        const leftTags = tagConfig.filter(t => t.col === 'left').sort((a, b) => a.pos - b.pos);
        const rightTags = tagConfig.filter(t => t.col === 'right').sort((a, b) => a.pos - b.pos);

        leftTags.forEach(tag => elements.leftCol.appendChild(createWidget(tag.id)));
        rightTags.forEach(tag => elements.rightCol.appendChild(createWidget(tag.id)));

        // Init map if it was added
        const mapContainer = document.getElementById('map-canvas');
        if (mapContainer) {
            initMap();
        }
    }

    function createWidget(tagId) {
        const meta = TAG_METADATA[tagId];
        const section = document.createElement('section');
        section.className = 'widget';
        
        if (tagId === 'MAP') {
            section.innerHTML = `<div id="map-canvas" class="map-container"></div>`;
            // Map height should probably be larger if possible, but we respect the --widget-height
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
        if (!L) return;
        mapInstance = L.map('map-canvas', {
            zoomControl: false,
            attributionControl: false,
            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            touchZoom: false
        }).setView([state.lat, state.lon], 11);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance);

        boatMarker = L.circleMarker([state.lat, state.lon], {
            radius: 6,
            color: '#fff',
            weight: 2,
            fillColor: 'var(--accent-cyan)',
            fillOpacity: 1
        }).addTo(mapInstance);
    }

    function renderTagSettings() {
        elements.tagsConfigBody.innerHTML = '';
        const sortedTags = Object.keys(TAG_METADATA).sort((a, b) => {
            if (a === 'MAP') return -1;
            if (b === 'MAP') return 1;
            return a.localeCompare(b);
        });

        sortedTags.forEach(tagId => {
            const config = tagConfig.find(t => t.id === tagId) || { id: tagId, col: 'none', pos: 99 };
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight:bold">${tagId}</td>
                <td>
                    <select data-tag="${tagId}" class="tag-col-select">
                        <option value="none" ${config.col === 'none' ? 'selected' : ''}>-</option>
                        <option value="left" ${config.col === 'left' ? 'selected' : ''}>L</option>
                        <option value="right" ${config.col === 'right' ? 'selected' : ''}>R</option>
                    </select>
                </td>
                <td>
                    <input type="number" data-tag="${tagId}" class="tag-pos-input" value="${config.pos}" min="1" max="20">
                </td>
            `;
            elements.tagsConfigBody.appendChild(tr);
        });

        document.querySelectorAll('.tag-col-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const id = e.target.dataset.tag;
                const col = e.target.value;
                let conf = tagConfig.find(t => t.id === id);
                if (!conf) {
                    conf = { id, col, pos: 99 };
                    tagConfig.push(conf);
                } else {
                    conf.col = col;
                }
                saveTagConfig();
            });
        });

        document.querySelectorAll('.tag-pos-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const id = e.target.dataset.tag;
                const pos = parseInt(e.target.value);
                let conf = tagConfig.find(t => t.id === id);
                if (!conf) {
                    conf = { id, col: 'none', pos };
                    tagConfig.push(conf);
                } else {
                    conf.pos = pos;
                }
                saveTagConfig();
            });
        });
    }

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
        localStorage.removeItem('tagConfig');
        location.reload();
    });

    elements.themeToggle.addEventListener('click', () => {
        const isLight = document.documentElement.classList.toggle('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        elements.themeToggle.textContent = isLight ? '🌓 DARK MODE' : '🌓 LIGHT MODE';
    });

    initTheme();
    renderSidebars();
    renderTagSettings();

    // Simulator
    function simulate() {
        state.hdg += (Math.random() - 0.5) * 1;
        state.cog = state.hdg + (Math.random() - 0.5) * 4;
        state.sog += (Math.random() - 0.5) * 0.1;
        state.aws += (Math.random() - 0.5) * 0.2;
        state.awa += (Math.random() - 0.5) * 2;
        state.tws += (Math.random() - 0.5) * 0.1;
        state.twa += (Math.random() - 0.5) * 1;
        state.twd = (state.hdg + state.twa + 360) % 360;
        state.cts += (Math.random() - 0.5) * 0.5;
        state.dtg -= 0.001;
        if (state.dtg < 0) state.dtg = 10.0;
        state.wmg = state.sog * Math.cos(state.twa * Math.PI / 180) * (0.8 + Math.random() * 0.4);
        
        const secondsToGo = (state.dtg / Math.max(state.sog, 0.1)) * 3600;
        const etaDate = new Date(Date.now() + secondsToGo * 1000);
        state.eta = etaDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        state.btw += (Math.random() - 0.5) * 0.5;
        
        state.depth += (Math.random() - 0.5) * 0.1;
        state.stw = state.sog * 0.95;
        state.temp = 18.5 + Math.sin(Date.now() / 100000) * 0.5;
        state.battery = 13.2 + (Math.random() - 0.5) * 0.05;

        // Move boat
        const speedMps = (state.sog * 0.51444); // kn to m/s
        const dist = speedMps * 1; // 1 second
        const bearingRad = state.cog * Math.PI / 180;
        const dy = dist * Math.cos(bearingRad);
        const dx = dist * Math.sin(bearingRad);
        state.lat += dy / 111320;
        state.lon += dx / (111320 * Math.cos(state.lat * Math.PI / 180));

        // Normalization
        state.hdg = (state.hdg + 360) % 360;
        state.cog = (state.cog + 360) % 360;
        state.awa = ((state.awa + 180) % 360) - 180;
        state.twa = ((state.twa + 180) % 360) - 180;

        updateUI();
    }

    function updateUI() {
        navDisplay.update(state.hdg, state.awa, state.sog, state.btw);

        tagConfig.forEach(conf => {
            if (conf.col === 'none') return;
            const el = document.getElementById(`tag-val-${conf.id.toLowerCase()}`);
            if (el) {
                const val = state[conf.id.toLowerCase()];
                el.textContent = TAG_METADATA[conf.id].format(val);
            }
        });

        if (mapInstance && boatMarker) {
            mapInstance.panTo([state.lat, state.lon], { animate: false });
            boatMarker.setLatLng([state.lat, state.lon]);
        }

        elements.awsVal.textContent = state.aws.toFixed(1);
        elements.hdgNum.textContent = Math.round(state.hdg).toString().padStart(3, '0');
        elements.twsCenter.textContent = state.tws.toFixed(1);
        elements.battery.textContent = state.battery.toFixed(1) + 'V';
    }

    setInterval(simulate, 1000);
    updateUI();
});
