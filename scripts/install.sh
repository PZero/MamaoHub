#!/bin/bash
# install.sh - Orchestratore di installazione MaMaoHub
# Da lanciare con: sudo ./scripts/install.sh

set -e # Ferma l'esecuzione in caso di errore

echo "==========================================="
echo "   MaMaoHub - Installazione Automatizzata"
echo "==========================================="

# Verifica root
if [[ $EUID -ne 0 ]]; then
   echo "Questo script deve essere eseguito come root (sudo)."
   exit 1
fi

# Rendi gli script eseguibili
chmod +x scripts/*.sh

# 1. Installazione Node.js
./scripts/setup-node.sh

# 2. Installazione Signal K
./scripts/setup-sk.sh

# 3. Configurazione Wi-Fi
./scripts/setup-wifi.sh

# 4. Installazione Servizi Systemd
echo ">>> Installazione servizi di sistema..."
cp system/services/*.service /etc/systemd/system/
cp src/ups-monitor.py /usr/local/bin/mamao-ups-monitor.py
chmod +x /usr/local/bin/mamao-ups-monitor.py
systemctl daemon-reload

# Abilitazione servizi
systemctl enable mamao-wifi.service
# systemctl enable mamao-ups.service # Abilitare quando lo script UPS è pronto

# 5. Configurazione udev
echo ">>> Configurazione regole udev..."
cp system/udev/*.rules /etc/udev/rules.d/ 2>/dev/null || echo "Nessuna regola udev trovata."
udevadm control --reload-rules && udevadm trigger

echo "==========================================="
echo "   INSTALLAZIONE COMPLETATA!"
echo "   Riavvia il sistema per applicare tutto."
echo "==========================================="
