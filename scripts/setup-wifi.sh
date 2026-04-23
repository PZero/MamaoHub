#!/bin/bash
# setup-wifi.sh - Configurazione Multi-SSID e Hotspot Failover
set -e

echo ">>> Configurazione profili Wi-Fi..."

# 1. Creazione Profilo Hotspot (Access Point)
# Questo profilo verrà attivato se nessuna rete client è disponibile
HOTSPOT_SSID="MaMaoHub-Hotspot"
HOTSPOT_PASS="mamaohub123"

# Rimuovi vecchio profilo se esiste
sudo nmcli con delete "MaMaoHub-AP" 2>/dev/null

# Crea il nuovo profilo AP
sudo nmcli con add type wifi ifname wlan0 con-name "MaMaoHub-AP" autoconnect no ssid "$HOTSPOT_SSID" mode ap
sudo nmcli con modify "MaMaoHub-AP" 802-11-wireless.mode ap 802-11-wireless.band bg ipv4.method shared
sudo nmcli con modify "MaMaoHub-AP" wifi-sec.key-mgmt wpa-psk wifi-sec.psk "$HOTSPOT_PASS"

echo ">>> Profilo Hotspot creato: SSID=$HOTSPOT_SSID"

# 2. Configurazione Reti Client (Bozza)
# NB: Queste dovrebbero essere configurate dall'utente tramite RPi Imager o nmcli.
# Possiamo aggiungere qui dei placeholder se necessario.

# 3. Installazione script di monitoraggio
sudo cp system/wifi/autohotspot.sh /usr/local/bin/autohotspot.sh
sudo chmod +x /usr/local/bin/autohotspot.sh

# 4. Installazione servizio systemd
# Il servizio verrà creato in un altro passaggio o copiato
echo ">>> Wi-Fi setup completato."
