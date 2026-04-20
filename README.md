# MaMaoHub: NMEA 0183 Hub per Imbarcazioni

## Proposito del Progetto
Il progetto **MaMaoHub** ha l'obiettivo di centralizzare, multiplexare e distribuire i dati di navigazione NMEA 0183 su una barca, rendendoli fruibili sia via hardware (RS485) che via software (Wi-Fi/Web).

L'hub funge da ponte tra la strumentazione tradizionale e le moderne applicazioni di navigazione su tablet/smartphone, fornendo al contempo una dashboard web-based per il monitoraggio in tempo reale.

## Architettura del Sistema

### Diagramma di Connettività
```mermaid
graph TD
    subgraph Ingressi["1. Ingressi Strumentazione"]
        Vento[Stazione Vento]
        Bussola[Bussola]
    end

    subgraph Waveshare["2. Interfaccia Waveshare 4Ch USB-RS485"]
        Port1[Porta 1]
        Port2[Porta 2]
        Port3[Porta 3]
        Port4[Porta 4]
    end

    subgraph RPi["3. Hub Centrale (Raspberry Pi Zero 2 W)"]
        SK[Signal K Server]
        UPS[UPS Geekworm X306] -- Power --> SK
        SK_Proc[Elaborazione Dati Completi]
    end

    subgraph Nav["4. Navigatore (Esterno)"]
        Nav_Device[Processore Navigatore]
    end

    subgraph Out["5. Distribuzione (Uscite)"]
        WiFi[Wi-Fi: Navionics / OpenCPN]
        UART_Out[Ponte UART: Modulo TTL-RS485]
        WebDash[Web Dashboard]
    end

    %% Flusso Dati
    Vento --> Port1
    Bussola --> Port2
    Port1 & Port2 -- USB --> SK
    
    %% Loop-back verso Navigatore
    SK -- "Multiplex A+B" --> Port4
    Port4 -- RS485 --> Nav_Device
    
    %% Rientro Segnale Completo
    Nav_Device -- "Segnale Completo" --> Port3
    Port3 -- USB --> SK
    
    %% Distribuzione Finale
    SK -- "Parsing Segnale Completo" --> SK_Proc
    SK_Proc --> WiFi
    SK_Proc --> UART_Out
    SK_Proc --> WebDash
```

### Elenco Componenti Hardware
1.  **Cervello**: Raspberry Pi Zero 2 W.
2.  **Alimentazione**: Geekworm X306 v1.3 UPS (con supporto allo shutdown controllato).
3.  **Hub Seriale**: Waveshare 4-Channel RS485 to USB.
4.  **Bridge Signal C**: Modulo TTL to RS485 collegato via UART (GPIO 14/15).
5.  **Navigatore (Esterno)**: Device che riceve il mix Vento+Bussola e produce il Segnale Completo.

### Flusso Dati (Loop-back)
1.  **Ingresso**: MaMaoHub riceve i dati da **Stazione Vento** e **Bussola** tramite le porte 1 e 2 del Waveshare.
2.  **Multiplex**: Signal K combina i dati e li invia al **Navigatore** tramite la porta 4 del Waveshare.
3.  **Elaborazione Esterna**: Il Navigatore riceve il mix, lo processa e restituisce il **Segnale Completo** alla porta 3 del Waveshare.
4.  **Distribuzione**: MaMaoHub riceve il Segnale Completo, lo decodifica e lo invia a:
    *   **Wi-Fi**: Per tablet e smartphone.
    *   **UART**: Tramite il modulo TTL-RS485 per altra strumentazione fisica.
    *   **Web**: Per la consultazione tramite dashboard integrata.

## Strategia di Disaster Recovery
Tutte le configurazioni (OS, driver, plugin, dashboard) sono gestite tramite repository Git. In caso di fallimento della scheda SD, il sistema può essere ripristinato in pochi minuti eseguendo uno script di setup automatizzato.

## Funzionalità Chiave
*   **Gestione Alimentazione**: Shutdown automatico in assenza di alimentazione esterna per proteggere il file system. Auto-boot al ritorno della corrente.
*   **Standard Industriale**: Utilizzo di Signal K come motore di elaborazione dati per massima flessibilità.
*   **Accessibilità**: Dashboard personalizzate raggiungibili via browser da qualsiasi dispositivo connesso alla rete della barca.
*   **Specifiche Software**:
    *   **Sistema Operativo**: Raspberry Pi OS Lite (64-bit) basata su **Debian Bookworm** (ultima versione stabile). Una versione leggera ottimizzata per l'uso "headless" (senza interfaccia grafica).
    *   **Ambiente di Esecuzione**: **Node.js (LTS)**, necessario per far girare il cuore del sistema.
    *   **Data Server**: **Signal K Server**, lo standard open-source per l'interoperabilità dei dati marini.
    *   **Plugin Necessari**:
        *   `signalk-to-nmea0183`: Fondamentale per convertire i dati Signal K nel formato NMEA 0183 da inviare all'uscita fisica.
        *   `instrumentpanel`: Per la visualizzazione dei dati in formato analogico/digitale su browser.
        *   `signalk-kip`: Dashboard avanzata con supporto per temi scuri (ideale per la navigazione notturna).
        *   `signalk-freeboard-sk`: Per integrare mappe nautiche e posizionamento.
    *   **Utility di Sistema**:
        *   **NetworkManager**: Gestione robusta della rete Wi-Fi (configurazione Access Point o connessione a router di bordo).
        *   **Udev**: Per l'assegnazione di nomi univoci alle porte USB del Waveshare.
        *   **mamao-ups (Python/Service)**: Script personalizzato e servizio systemd per il monitoraggio del GPIO e lo shutdown sicuro.
        *   **kplex (opzionale)**: Multiplexer NMEA 0183 puro per routing ad altissime prestazioni e bassa latenza.
        *   **Git**: Fondamentale per il versionamento di `/etc/udev/rules.d/`, `settings.json` di Signal K e gli script di sistema.
