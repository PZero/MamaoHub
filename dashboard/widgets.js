class NavDisplay {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <svg viewBox="0 0 200 200">
                <!-- Background Ring -->
                <circle cx="100" cy="100" r="95" fill="none" stroke="var(--surface-border)" stroke-width="1" />
                
                <!-- Rotating Compass Ring -->
                <g id="compass-ring" style="transition: transform 0.8s cubic-bezier(0.2, 0, 0.2, 1)">
                    <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="15" />
                    <!-- Cardinal Points -->
                    <text x="100" y="30" text-anchor="middle" fill="var(--accent-cyan)" font-weight="800" font-size="14">N</text>
                    <text x="170" y="105" text-anchor="middle" fill="var(--text-main)" font-size="12">E</text>
                    <text x="100" y="180" text-anchor="middle" fill="var(--text-main)" font-size="12">S</text>
                    <text x="30" y="105" text-anchor="middle" fill="var(--text-main)" font-size="12">W</text>
                    <!-- Degree marks -->
                    <g id="degree-marks"></g>
                </g>

                <!-- Fixed Ship (Always pointing UP) -->
                <g id="ship-icon">
                    <!-- Simple Ship Shape -->
                    <path d="M100 65 L115 110 L115 130 L85 130 L85 110 Z" fill="rgba(0, 242, 255, 0.15)" stroke="var(--accent-cyan)" stroke-width="1.5" />
                    <line x1="100" y1="65" x2="100" y2="135" stroke="var(--accent-cyan)" stroke-width="0.5" stroke-dasharray="2,2" />
                </g>

                <!-- Wind Indicator (Apparent Wind Angle) -->
                <g id="wind-indicator" style="transition: transform 1s ease-out">
                    <!-- Triangle Arrow -->
                    <path d="M100 15 L108 30 L92 30 Z" fill="var(--accent-orange)" />
                    <!-- Wind Tail -->
                    <line x1="100" y1="5" x2="100" y2="15" stroke="var(--accent-orange)" stroke-width="2" />
                </g>

                <!-- Top Reference Mark -->
                <path d="M100 10 L105 0 L95 0 Z" fill="var(--accent-orange)" />
            </svg>
        `;
        this.compassRing = this.container.querySelector('#compass-ring');
        this.windIndicator = this.container.querySelector('#wind-indicator');
        this.drawMarks();
    }

    drawMarks() {
        const group = this.container.querySelector('#degree-marks');
        for (let i = 0; i < 360; i += 10) {
            if (i % 90 === 0) continue; // Skip cardinal points
            const angle = (i * Math.PI) / 180;
            const r1 = 80;
            const r2 = 85;
            const x1 = 100 + Math.sin(angle) * r1;
            const y1 = 100 - Math.cos(angle) * r1;
            const x2 = 100 + Math.sin(angle) * r2;
            const y2 = 100 - Math.cos(angle) * r2;
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", x1);
            line.setAttribute("y1", y1);
            line.setAttribute("x2", x2);
            line.setAttribute("y2", y2);
            line.setAttribute("stroke", i % 30 === 0 ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.1)");
            line.setAttribute("stroke-width", "1");
            group.appendChild(line);
        }
    }

    update(hdg, awa) {
        // Rotate compass ring to show current heading at the top
        this.compassRing.style.transform = `rotate(${-hdg}deg)`;
        this.compassRing.style.transformOrigin = '100px 100px';

        // Rotate wind indicator to show apparent wind angle relative to ship
        this.windIndicator.style.transform = `rotate(${awa}deg)`;
        this.windIndicator.style.transformOrigin = '100px 100px';
    }
}
