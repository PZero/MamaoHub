class NavDisplay {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <svg viewBox="0 0 200 200">
                <!-- Background Ring (Outer Edge) -->
                <circle cx="100" cy="100" r="98" fill="none" stroke="var(--surface-border)" stroke-width="0.5" />
                
                <!-- Rotating Compass Ring -->
                <g id="compass-ring" style="transition: transform 0.8s cubic-bezier(0.2, 0, 0.2, 1)">
                    <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="20" />
                    <!-- Cardinal Points -->
                    <text x="100" y="28" text-anchor="middle" fill="var(--accent-cyan)" font-weight="900" font-size="18">N</text>
                    <text x="175" y="106" text-anchor="middle" fill="var(--text-main)" font-size="14">E</text>
                    <text x="100" y="185" text-anchor="middle" fill="var(--text-main)" font-size="14">S</text>
                    <text x="25" y="106" text-anchor="middle" fill="var(--text-main)" font-size="14">W</text>
                    <!-- Degree marks -->
                    <g id="degree-marks"></g>
                </g>

                <!-- Fixed Ship (Always pointing UP) - SCALED UP -->
                <g id="ship-icon">
                    <path d="M100 50 L125 110 L125 145 L75 145 L75 110 Z" fill="rgba(0, 242, 255, 0.1)" stroke="var(--accent-cyan)" stroke-width="2" />
                    <path d="M100 50 L125 110 L100 110 Z" fill="rgba(0, 242, 255, 0.1)" stroke="none" />
                    <line x1="100" y1="50" x2="100" y2="155" stroke="var(--accent-cyan)" stroke-width="0.5" stroke-dasharray="3,3" />
                </g>

                <!-- Wind Indicator (Apparent Wind Angle) -->
                <g id="wind-indicator" style="transition: transform 1s ease-out">
                    <!-- Triangle Arrow -->
                    <path d="M100 12 L112 32 L88 32 Z" fill="var(--accent-orange)" />
                    <!-- Wind Tail -->
                    <line x1="100" y1="0" x2="100" y2="12" stroke="var(--accent-orange)" stroke-width="3" />
                </g>

                <!-- Top Reference Mark -->
                <path d="M100 8 L108 -2 L92 -2 Z" fill="var(--accent-orange)" />
            </svg>
        `;
        this.compassRing = this.container.querySelector('#compass-ring');
        this.windIndicator = this.container.querySelector('#wind-indicator');
        this.drawMarks();
    }

    drawMarks() {
        const group = this.container.querySelector('#degree-marks');
        for (let i = 0; i < 360; i += 5) { // More detail
            if (i % 90 === 0) continue; 
            const angle = (i * Math.PI) / 180;
            const isMajor = i % 30 === 0;
            const r1 = isMajor ? 75 : 82;
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
            line.setAttribute("stroke", isMajor ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.1)");
            line.setAttribute("stroke-width", isMajor ? "1.5" : "1");
            group.appendChild(line);
        }
    }

    update(hdg, awa) {
        this.compassRing.style.transform = `rotate(${-hdg}deg)`;
        this.compassRing.style.transformOrigin = '100px 100px';
        this.windIndicator.style.transform = `rotate(${awa}deg)`;
        this.windIndicator.style.transformOrigin = '100px 100px';
    }
}
