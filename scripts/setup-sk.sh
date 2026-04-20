#!/bin/bash
# setup-sk.sh - Installazione di Signal K Server

echo ">>> Installazione di Signal K Server..."

# Installazione globale di signalk-server
# --unsafe-perm è spesso necessario su RPi per alcuni moduli nativi
sudo npm install -g --unsafe-perm signalk-server

# Generazione configurazione di base se non esiste
# Nota: In ambiente non interattivo, signalk-server-setup potrebbe richiedere parametri.
# Per ora installiamo e basta, la configurazione specifica (settings.json) verrà copiata dal repo.
mkdir -p ~/.signalk

echo ">>> Abilitazione servizio Signal K..."
# Genera il file di servizio per systemd (se non esistente o per forzare aggiornamento)
# Signal K ha un comando interno per questo:
# sudo signalk-server-setup --systemd
# Ma noi vogliamo un controllo più fine. Per ora facciamo l'installazione base.

echo ">>> Signal K installato. Per la prima configurazione lancia: signalk-server-setup"
