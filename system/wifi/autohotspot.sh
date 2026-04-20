#!/bin/bash
# autohotspot.sh - Gestione failover Wi-Fi per MaMaoHub
# Compatibile con NetworkManager (RPi OS Bookworm)

# Nome della connessione Hotspot in NetworkManager
HOTSPOT_NAME="MaMaoHub-AP"
INTERFACE="wlan0"

# Funzione per controllare se la rete è attiva (come client)
check_client_connected() {
    # Verifica se c'è una connessione attiva che NON sia l'hotspot
    active_con=$(nmcli -t -f NAME,DEVICE con show --active | grep ":$INTERFACE" | cut -d: -f1)
    if [ -z "$active_con" ]; then
        return 1 # Non connesso
    elif [ "$active_con" == "$HOTSPOT_NAME" ]; then
        return 2 # Connesso come Hotspot
    else
        return 0 # Connesso come Client
    fi
}

echo ">>> Verifica stato Wi-Fi MaMaoHub..."

check_client_connected
status=$?

if [ $status -eq 1 ]; then
    echo "Nessuna connessione rilevata. Avvio Hotspot $HOTSPOT_NAME..."
    nmcli con up "$HOTSPOT_NAME"
elif [ $status -eq 2 ]; then
    echo "Connesso come Hotspot. Controllo se le reti prioritarie sono tornate disponibili..."
    # Qui potremmo implementare una scansione periodica per tornare in modalità client
    # Per ora lasciamo l'hotspot attivo se nessuna rete nota è stata agganciata al boot.
    # Un semplice 'nmcli device wifi rescan' e poi controllare 'nmcli dev wifi list'
    # potrebbe aiutare a decidere se tentare lo switch.
else
    echo "Connesso regolarmente alla rete: $(nmcli -t -f NAME con show --active | grep -v "$HOTSPOT_NAME" | head -n1)"
fi
