class WindGauge {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <svg viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" class="gauge-ring" />
                <!-- Scale marks -->
                <g id="wind-marks"></g>
                <!-- Needle -->
                <path d="M100 20 L105 40 L95 40 Z" fill="#ff9d00" id="wind-needle" style="transition: transform 0.5s cubic-bezier(0.17, 0.67, 0.83, 0.67)" />
                <text x="100" y="115" text-anchor="middle" fill="#94a3b8" font-size="12">WIND</text>
            </svg>
        `;
        this.needle = this.container.querySelector('#wind-needle');
        this.drawMarks();
    }

    drawMarks() {
        const group = this.container.querySelector('#wind-marks');
        for (let i = 0; i < 360; i += 30) {
            const angle = (i * Math.PI) / 180;
            const x1 = 100 + Math.sin(angle) * 80;
            const y1 = 100 - Math.cos(angle) * 80;
            const x2 = 100 + Math.sin(angle) * 90;
            const y2 = 100 - Math.cos(angle) * 90;
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", x1);
            line.setAttribute("y1", y1);
            line.setAttribute("x2", x2);
            line.setAttribute("y2", y2);
            line.setAttribute("stroke", i % 90 === 0 ? "#00f2ff" : "#475569");
            line.setAttribute("stroke-width", i % 90 === 0 ? "3" : "1");
            group.appendChild(line);
        }
    }

    update(angle) {
        this.needle.style.transform = `rotate(${angle}deg)`;
        this.needle.style.transformOrigin = '100px 100px';
    }
}

class CompassGauge {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <svg viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" class="gauge-ring" />
                <g id="compass-ring" style="transition: transform 0.5s ease-out">
                    <!-- Compass cardinal points -->
                    <text x="100" y="35" text-anchor="middle" fill="#00f2ff" font-weight="bold" font-size="16">N</text>
                    <text x="165" y="105" text-anchor="middle" fill="#e0e6ed" font-size="14">E</text>
                    <text x="100" y="175" text-anchor="middle" fill="#e0e6ed" font-size="14">S</text>
                    <text x="35" y="105" text-anchor="middle" fill="#e0e6ed" font-size="14">W</text>
                </g>
                <!-- Ship indicator -->
                <path d="M100 80 L110 120 L90 120 Z" fill="rgba(255,255,255,0.2)" stroke="#fff" stroke-width="1" />
                <line x1="100" y1="20" x2="100" y2="50" stroke="#ff9d00" stroke-width="2" />
            </svg>
        `;
        this.ring = this.container.querySelector('#compass-ring');
    }

    update(heading) {
        // We rotate the ring, not the ship
        this.ring.style.transform = `rotate(${-heading}deg)`;
        this.ring.style.transformOrigin = '100px 100px';
    }
}
