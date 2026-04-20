#!/usr/bin/env python3
# ups-monitor.py - Monitoraggio alimentazione per Geekworm X306
# Lo script effettua lo shutdown sicuro se manca l'alimentazione esterna.

import RPi.GPIO as GPIO
import os
import time

# Pin GPIO per il segnale di Power Loss (PLD)
# Per X306 v1.3 solitamente è il GPIO 6
PIN_PLD = 6

# Tempo di attesa (secondi) prima di spegnere
SHUTDOWN_DELAY = 30

def setup():
    GPIO.setmode(GPIO.BCM)
    # Impostiamo il pin come ingresso con Pull-up interno
    GPIO.setup(PIN_PLD, GPIO.IN, pull_up_down=GPIO.PUD_UP)

def monitor():
    print(f"Monitoraggio UPS avviato sul pin GPIO {PIN_PLD}...")
    while True:
        # Se il pin PLD va a LOW, significa che manca l'alimentazione esterna
        if GPIO.input(PIN_PLD) == GPIO.LOW:
            print("ATTENZIONE: Alimentazione esterna assente!")
            print(f"Shutdown programmato tra {SHUTDOWN_DELAY} secondi...")
            
            # Verifica se la corrente torna durante il delay
            for i in range(SHUTDOWN_DELAY):
                time.sleep(1)
                if GPIO.input(PIN_PLD) == GPIO.HIGH:
                    print("Ripristino alimentazione. Shutdown annullato.")
                    break
            else:
                # Se il ciclo for finisce senza break, spegni
                print("Esecuzione shutdown sicuro ora.")
                os.system("sudo shutdown now")
                break
        
        time.sleep(2)

if __name__ == "__main__":
    try:
        setup()
        monitor()
    except KeyboardInterrupt:
        print("Monitoraggio interrotto.")
    finally:
        GPIO.cleanup()
