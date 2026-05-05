const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 8080;
const SETTINGS_FILE = path.join(__dirname, 'settings.json');

app.use(express.json());
app.use(express.static(__dirname));

// API: Settings
app.get('/api/settings', (req, res) => {
    if (fs.existsSync(SETTINGS_FILE)) {
        const settings = fs.readFileSync(SETTINGS_FILE, 'utf8');
        res.json(JSON.parse(settings));
    } else {
        res.json({});
    }
});

app.post('/api/settings', (req, res) => {
    try {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(req.body, null, 2));
        res.json({ status: 'ok' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save settings' });
    }
});

// WebSocket: Data Stream
wss.on('connection', (ws) => {
    console.log('Client connected to dashboard stream');
    
    // In a real scenario, we would connect to Signal K or a local NMEA multiplexer here.
    // For now, we'll provide a simple hook.
    
    ws.on('close', () => console.log('Client disconnected'));
});

// Proxy logic for Signal K (Optional but useful)
// If you want the dashboard to get data directly from Signal K, 
// the frontend can connect to ws://RPI_IP:3000/signalk/v1/stream

server.listen(PORT, () => {
    console.log(`MaMaoDash server running at http://localhost:${PORT}`);
});
