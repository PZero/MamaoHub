class NavDisplay {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <svg viewBox="0 0 200 200" style="width: 100%; height: 100%;">
                <!-- Background Ring -->
                <circle cx="100" cy="100" r="95" fill="none" stroke="var(--surface-border)" stroke-width="1" />
                
                <!-- Rotating Compass Ring -->
                <g id="compass-ring" style="transition: transform 0.8s cubic-bezier(0.2, 0, 0.2, 1)">
                    <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="15" />
                    
                    <!-- Static sectors relative to N (Red on left, Green on right) -->
                    <path d="M 100 15 A 85 85 0 0 0 40 40" fill="none" stroke="var(--accent-red, #ff4444)" stroke-width="8" opacity="0.6" />
                    <path d="M 160 40 A 85 85 0 0 0 100 15" fill="none" stroke="var(--accent-green, #44ff44)" stroke-width="8" opacity="0.6" />
                    
                    <!-- Cardinal Points -->
                    <text x="100" y="28" text-anchor="middle" fill="var(--accent-cyan)" font-weight="900" font-size="16">N</text>
                    <text x="175" y="106" text-anchor="middle" fill="var(--text-main)" font-size="12">E</text>
                    <text x="100" y="185" text-anchor="middle" fill="var(--text-main)" font-size="12">S</text>
                    <text x="25" y="106" text-anchor="middle" fill="var(--text-main)" font-size="12">W</text>
                    <g id="degree-marks"></g>
                </g>

                <!-- Layline Zones (Rotating with wind) -->
                <g id="layline-zones" style="transition: transform 1s ease-out">
                    <!-- Red Layline Sector (Port Tack) -->
                    <path d="M 100 100 L 70 45 A 70 70 0 0 1 100 30 Z" fill="rgba(255, 68, 68, 0.2)" />
                    <!-- Green Layline Sector (Starboard Tack) -->
                    <path d="M 100 100 L 100 30 A 70 70 0 0 1 130 45 Z" fill="rgba(68, 255, 68, 0.2)" />
                    <!-- Lines -->
                    <line x1="100" y1="100" x2="70" y2="45" stroke="#ff4444" stroke-width="1" stroke-dasharray="3,3" />
                    <line x1="100" y1="100" x2="130" y2="45" stroke="#44ff44" stroke-width="1" stroke-dasharray="3,3" />
                </g>

                <!-- Fixed Boat (Sharp Racing Style) -->
                <g id="boat-shape">
                    <path d="M100 35 C115 65 120 115 120 140 L80 140 C80 115 85 65 100 35" fill="rgba(0, 242, 255, 0.1)" stroke="var(--accent-cyan)" stroke-width="1.5" />
                    <line x1="100" y1="35" x2="100" y2="140" stroke="var(--accent-cyan)" stroke-width="0.5" stroke-dasharray="4,4" />
                </g>

                <!-- SOG Vector Arrow (Center) -->
                <g id="sog-vector">
                    <line x1="100" y1="100" x2="100" y2="75" stroke="var(--accent-blue)" stroke-width="3" stroke-linecap="round" />
                    <path d="M94 82 L100 70 L106 82 Z" fill="var(--accent-blue)" />
                    <text x="100" y="108" id="sog-center-val" text-anchor="middle" font-size="10" font-weight="bold" fill="white" font-family="var(--font-mono)">5.0</text>
                </g>

                <!-- Wind Indicator -->
                <g id="wind-indicator" style="transition: transform 1s ease-out">
                    <!-- Double Arrow with "T" -->
                    <path d="M100 5 L112 28 L100 20 L88 28 Z" fill="var(--accent-orange)" stroke="black" stroke-width="0.3" />
                    <text x="100" y="20" text-anchor="middle" font-size="7" font-weight="900" fill="black" transform="rotate(180, 100, 20)">T</text>
                </g>

                <!-- Waypoint/Bearing Arc (Dynamic) -->
                <path id="waypoint-arc" d="" fill="none" stroke-width="4" opacity="0.6" />
                
                <!-- Waypoint Dot (BTW) -->
                <g id="waypoint-marker">
                    <circle cx="100" cy="15" r="4.5" fill="var(--accent-green)" stroke="black" stroke-width="1" />
                </g>

                <!-- Top Heading Reference (Fixed) -->
                <path d="M100 10 L104 2 L96 2 Z" fill="white" />
            </svg>
        `;
        this.compassRing = this.container.querySelector('#compass-ring');
        this.windIndicator = this.container.querySelector('#wind-indicator');
        this.laylineZones = this.container.querySelector('#layline-zones');
        this.sogCenterVal = this.container.querySelector('#sog-center-val');
        this.drawMarks();
    }

    drawMarks() {
        const group = this.container.querySelector('#degree-marks');
        for (let i = 0; i < 360; i += 10) {
            if (i % 90 === 0) continue; 
            const angle = (i * Math.PI) / 180;
            const isMajor = i % 30 === 0;
            const r1 = isMajor ? 78 : 82;
            const r2 = 90;
            const x1 = 100 + Math.sin(angle) * r1;
            const y1 = 100 - Math.cos(angle) * r1;
            const x2 = 100 + Math.sin(angle) * r2;
            const y2 = 100 - Math.cos(angle) * r2;
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", x1);
            line.setAttribute("y1", y1);
            line.setAttribute("x2", x2);
            line.setAttribute("y2", y2);
            line.setAttribute("stroke", isMajor ? "white" : "rgba(255,255,255,0.3)");
            line.setAttribute("stroke-width", isMajor ? "1.5" : "0.5");
            group.appendChild(line);

            if (isMajor) {
                const tx = 100 + Math.sin(angle) * 65;
                const ty = 100 - Math.cos(angle) * 65;
                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("x", tx);
                text.setAttribute("y", ty);
                text.setAttribute("text-anchor", "middle");
                text.setAttribute("dominant-baseline", "middle");
                text.setAttribute("fill", "rgba(255,255,255,0.6)");
                text.setAttribute("font-size", "8");
                text.textContent = i;
                group.appendChild(text);
            }
        }
    }

    update(hdg, awa, sog, btw) {
        this.compassRing.style.transform = `rotate(${-hdg}deg)`;
        this.compassRing.style.transformOrigin = '100px 100px';
        this.windIndicator.style.transform = `rotate(${awa}deg)`;
        this.windIndicator.style.transformOrigin = '100px 100px';
        this.laylineZones.style.transform = `rotate(${awa}deg)`;
        this.laylineZones.style.transformOrigin = '100px 100px';
        if (sog !== undefined) this.sogCenterVal.textContent = sog.toFixed(1);

        // Waypoint Logic
        if (btw !== undefined) {
            let relativeBearing = (btw - hdg + 540) % 360 - 180; // Range -180 to 180
            const marker = this.container.querySelector('#waypoint-marker');
            const arc = this.container.querySelector('#waypoint-arc');
            
            // Move marker
            marker.style.transform = `rotate(${relativeBearing}deg)`;
            marker.style.transformOrigin = '100px 100px';

            // Draw arc
            if (Math.abs(relativeBearing) > 2) {
                const radius = 85;
                const startAngle = -90 * Math.PI / 180;
                const endAngle = (relativeBearing - 90) * Math.PI / 180;
                
                const x1 = 100 + radius * Math.cos(startAngle);
                const y1 = 100 + radius * Math.sin(startAngle);
                const x2 = 100 + radius * Math.cos(endAngle);
                const y2 = 100 + radius * Math.sin(endAngle);
                
                const largeArc = Math.abs(relativeBearing) > 180 ? 1 : 0;
                const sweep = relativeBearing > 0 ? 1 : 0;
                
                arc.setAttribute('d', `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} ${sweep} ${x2} ${y2}`);
                arc.setAttribute('stroke', relativeBearing > 0 ? '#44ff44' : '#ff4444');
            } else {
                arc.setAttribute('d', '');
            }
        }
    }
}

class AnalogGauge {
    constructor(containerId, label, min, max, unit) {
        this.container = document.getElementById(containerId);
        this.label = label;
        this.min = min;
        this.max = max;
        this.unit = unit;
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <svg viewBox="0 0 200 200">
                <path d="M40 150 A 75 75 0 1 1 160 150" fill="none" stroke="var(--surface-border)" stroke-width="15" stroke-linecap="round" />
                <path id="gauge-fill" d="M40 150 A 75 75 0 1 1 160 150" fill="none" stroke="var(--accent-yellow)" stroke-width="15" stroke-linecap="round" stroke-dasharray="0 1000" />
                <text x="100" y="80" text-anchor="middle" fill="var(--text-dim)" font-size="12">${this.label}</text>
                <text x="100" y="110" text-anchor="middle" fill="var(--text-main)" font-size="10">${this.unit}</text>
                <text x="100" y="150" id="gauge-val" text-anchor="middle" fill="var(--accent-yellow)" font-weight="bold" font-size="28">0.0</text>
            </svg>
        `;
        this.fill = this.container.querySelector('#gauge-fill');
        this.valText = this.container.querySelector('#gauge-val');
        this.totalLength = this.fill.getTotalLength();
    }

    update(val) {
        const percent = (val - this.min) / (this.max - this.min);
        const draw = percent * this.totalLength;
        this.fill.setAttribute('stroke-dasharray', `${draw} ${this.totalLength}`);
        this.valText.textContent = val.toFixed(1);
    }
}
