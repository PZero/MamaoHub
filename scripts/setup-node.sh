#!/bin/bash
# setup-node.sh - Installazione di Node.js LTS su Raspberry Pi OS
set -e

echo ">>> Installazione di Node.js (LTS)..."

# Aggiornamento repository
sudo apt-get update

# Installazione dipendenze base
sudo apt-get install -y ca-certificates curl gnupg

# Aggiunta repository NodeSource (Node.js 20.x è l'attuale LTS consigliata per Signal K)
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg

NODE_MAJOR=20
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list

# Installazione Node.js e strumenti di build (necessari per alcuni plugin Signal K)
sudo apt-get update
sudo apt-get install -y nodejs build-essential

# Verifica installazione
node -v
npm -v

echo ">>> Node.js installato correttamente."
