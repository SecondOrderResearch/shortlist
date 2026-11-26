#!/bin/bash
# Deploy ShortList backend to Oracle Cloud VM (drawing game VM at 145.241.242.40)
# Reuses the drawing-game patterns: SSH + PM2 + apt install + Postgres + Node/Express.
set -e

# ---------------------------------------------------------------- config ---
VM_IP="${OCI_VM_IP:-145.241.242.40}"
SSH_USER="ubuntu"
SSH_KEY="${OCI_SSH_KEY:-/Users/richard/.ssh/id_rsa}"
SSH_OPTS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i $SSH_KEY"
REPO="SecondOrderResearch/shortlist"
REGION="uk-london-1-ad-3.clouds.archive.ubuntu.com"
APP_DIR="/home/$SSH_USER/shortlist"

# ---------------------------------------------------------------- helpers ---
run() {
  echo "→ $*"
  ssh $SSH_OPTS "$SSH_USER@$VM_IP" "$@"
}

# ---------------------------------------------------------------- 1. apt ---
echo "=== Step 1: Install PostgreSQL (Node/npm/git/pm2 already present) ==="
run "sudo apt-get update -qq && sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq postgresql postgresql-contrib"

# ---------------------------------------------------------------- 2. repo ---
echo "=== Step 2: Clone repository ==="
run "rm -rf $APP_DIR && git clone https://github.com/$REPO.git $APP_DIR"

# ---------------------------------------------------------------- 3. DB ---
echo "=== Step 3: Create Postgres user + database ==="
run "sudo -u postgres psql -tc \"SELECT 1 FROM pg_roles WHERE rolname='shortlist'\" | grep -q 1 || sudo -u postgres psql -c \"CREATE USER shortlist WITH PASSWORD 'shortlist';\""
run "sudo -u postgres psql -tc \"SELECT 1 FROM pg_database WHERE datname='shortlist'\" | grep -q 1 || sudo -u postgres psql -c \"CREATE DATABASE shortlist OWNER shortlist;\""

# ---------------------------------------------------------------- 4. env ---
echo "=== Step 4: Write .env ==="
JWT_SECRET=$(openssl rand -base64 32 | tr -d '\n')
run "cd $APP_DIR/backend && printf 'DATABASE_URL=postgresql://shortlist:shortlist@localhost:5432/shortlist\nPORT=3000\nJWT_SECRET=$JWT_SECRET\n' > .env && cat .env"

# ---------------------------------------------------------------- 5. npm ---
echo "=== Step 5: Install Node dependencies ==="
run "cd $APP_DIR/backend && npm ci --omit=dev"

# ---------------------------------------------------------------- 6. pm2 ---
echo "=== Step 6: Start with PM2 (auto-restart on reboot) ==="
run "cd $APP_DIR/backend && sudo npm install -g pm2 2>/dev/null; pm2 start server.js --name shortlist-api && pm2 save && sudo pm2 startup systemd -u ubuntu --hp /home/ubuntu"

# ---------------------------------------------------------------- 7. verify ---
echo "=== Step 7: Verify API is up ==="
sleep 5
run "curl -s -m 30 http://localhost:3000/api/ping"

echo ""
echo "✅  Deployed. Public API: http://$VM_IP:3000"
echo "    Frontend Vercel env: set VITE_API_BASE_URL=http://$VM_IP:3000"