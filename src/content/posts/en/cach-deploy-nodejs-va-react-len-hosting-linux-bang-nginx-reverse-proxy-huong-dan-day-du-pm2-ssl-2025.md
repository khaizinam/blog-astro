---
title: "How to Deploy Node.js and React Apps on Linux Hosting with Nginx Reverse Proxy (PM2 + SSL Guide 2025)"
author: "Nguyễn Hữu Khải - khaizinam"
pubDatetime: 2026-03-23T20:59:38.000Z
slug: cach-deploy-nodejs-va-react-len-hosting-linux-bang-nginx-reverse-proxy-huong-dan-day-du-pm2-ssl-2025
lang: en
translationKey: post-205
featured: false
draft: false
tags:
  - "DevOps"
description: "You built a Node.js API or React app and now you're staring at a blank Linux VPS wondering how to actually get it live. Uploading files to shared hosting won't work here - Node.js needs a process manager, a reverse proxy, and proper server configuration to run reliably in production. This guide walks you through the complete deployment stack: PM2 to keep your app alive"
---

You built a Node.js API or React app and now you're staring at a blank Linux VPS wondering how to actually get it live. Uploading files to shared hosting won't work here - Node.js needs a process manager, a reverse proxy, and proper server configuration to run reliably in production. This guide walks you through the complete deployment stack: PM2 to keep your app alive, Nginx as a reverse proxy with `proxy_pass`, SSL via Let's Encrypt, and a clean setup for React static builds - all from scratch on Ubuntu.

### Table of Contents

1\. [What is Nginx Reverse Proxy and Why You Need It for Node.js](#what-is-nginx-reverse-proxy-and-why-you-need-it-for-nodejs)

2\. [Prerequisites - What You Need Before Starting](#prerequisites-what-you-need-before-starting)

3\. [Step 1 - Install Node.js on Ubuntu Linux](#step-1-install-nodejs-on-ubuntu-linux)

4\. [Step 2 - Set Up PM2 Process Manager](#step-2-set-up-pm2-process-manager)

5\. [Step 3 - Install and Configure Nginx](#step-3-install-and-configure-nginx)

6\. [Step 4 - Configure Nginx proxy_pass for Node.js API](#step-4-configure-nginx-proxypass-for-nodejs-api)

7\. [Step 5 - Deploy React Build as Static Files with Nginx](#step-5-deploy-react-build-as-static-files-with-nginx)

8\. [Step 6 - Enable HTTPS with Let's Encrypt (Certbot)](#step-6-enable-https-with-lets-encrypt-certbot)

9\. [Step 7 - Host Multiple Node.js Apps on One Server](#step-7-host-multiple-nodejs-apps-on-one-server)

10\. [Common Errors and How to Fix Them](#common-errors-and-how-to-fix-them)

11\. [FAQ](#faq)

* * *

#### What Is Nginx Reverse Proxy and Why You Need It for Node.js

Node.js runs your application on an internal port - typically 3000, 4000, or 5000. It cannot and should not be directly exposed to the internet on port 80 or 443. That's where **Nginx acts as a reverse proxy**: it sits in front of your Node.js process, accepts all incoming traffic on port 80/443, and forwards it internally to your app via `proxy_pass`.

This architecture gives you several production-critical capabilities that Node.js alone cannot handle efficiently:

*   **SSL termination:** Nginx handles HTTPS, your Node.js app only speaks plain HTTP internally - no changes needed in application code.
*   **Static file serving:** React build output, images, CSS - Nginx serves these directly without touching Node.js, dramatically reducing app server load.
*   **Multiple apps on one server:** Different domains or subdomains pointing to different Node.js processes on different ports - all managed through Nginx server blocks.
*   **Load balancing:** Distribute traffic across multiple Node.js instances using the upstream directive.
*   **Rate limiting and security headers:** Add request throttling, gzip compression, and HTTP security headers at the proxy layer without touching app code.

**PM2** complements Nginx by keeping your Node.js process alive after crashes, auto-starting on server reboot, and providing process monitoring and log management.

> See more: [Deploy PHP, Laravel, CodeIgniter on Linux VPS with Nginx](/en/deploy-php-laravel-codeigniter-len-linux-vps-voi-nginx)

#### Prerequisites - What You Need Before Starting

*   A Linux VPS or dedicated server running **Ubuntu 20.04 / 22.04 / 24.04** (commands in this guide apply to all three).
*   Root or sudo access via SSH.
*   A domain name with an **A record** pointing to your server's public IP address. DNS propagation can take up to 24 hours - point your domain first, then start this guide.
*   Your Node.js application code - either cloned from Git or uploaded via SCP/SFTP.
*   Basic comfort with Linux command line - you'll be editing files with `nano` and running `sudo` commands.

#### Step 1 - Install Node.js on Ubuntu Linux

Do not install Node.js from the default Ubuntu repository - it ships an outdated version. Use the **NodeSource repository** to get the current LTS release (Node.js 20.x at time of writing):

```bash
# Update package lists
sudo apt update && sudo apt upgrade -y

# Install curl if not present
sudo apt install -y curl git build-essential

# Add NodeSource repository for Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js and npm
sudo apt install -y nodejs

# Verify installation
node -v   # should show v20.x.x
npm -v    # should show 10.x.x
```

If you manage multiple Node.js projects requiring different versions, consider installing **NVM (Node Version Manager)** instead. It lets you switch between Node versions per project without reinstalling:

```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc

# Install and use Node.js 20
nvm install 20
nvm use 20
nvm alias default 20
```

#### Step 2 - Set Up PM2 Process Manager

**PM2** is the industry standard process manager for Node.js in production. Without it, your app dies the moment your SSH session ends or the server reboots. Install it globally:

```bash
sudo npm install -g pm2
```

Clone your application and start it with PM2:

```bash
# Clone your repository
cd /var/www
git clone https://github.com/yourusername/your-node-app.git
cd your-node-app

# Install dependencies
npm install --production

# Start app with PM2 (replace app.js with your entry file)
pm2 start app.js --name "my-node-app"

# Or for an Express app with specific port
PORT=3000 pm2 start app.js --name "my-node-app"

# Save PM2 process list
pm2 save

# Configure PM2 to start on system boot
pm2 startup
# Copy and run the command PM2 outputs (it looks like:)
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u youruser --hp /home/youruser
```

Essential PM2 commands you'll use daily:

```bash
pm2 list                    # List all running processes
pm2 logs my-node-app        # Tail logs in real time
pm2 restart my-node-app     # Restart after code changes
pm2 stop my-node-app        # Stop the process
pm2 delete my-node-app      # Remove from PM2 list
pm2 monit                   # Real-time CPU/memory dashboard
```

For production apps, use PM2 **cluster mode** to utilize all CPU cores:

```bash
# Start with cluster mode - spawns one instance per CPU core
pm2 start app.js --name "my-node-app" -i max

# Or specify exact number of instances
pm2 start app.js --name "my-node-app" -i 4
```

#### Step 3 - Install and Configure Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx

# Start Nginx
sudo systemctl start nginx

# Verify it's running
sudo systemctl status nginx

# Configure firewall - allow HTTP, HTTPS, and SSH
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

Nginx configuration lives in two directories on Ubuntu:

*   **/etc/nginx/sites-available/** - Store all your virtual host config files here (active or not).
*   **/etc/nginx/sites-enabled/** - Nginx only reads configs from here. You enable a site by creating a symlink from sites-available to sites-enabled.

This separation lets you draft and test configurations without activating them.

#### Step 4 - Configure Nginx proxy_pass for Node.js API

Create a new Nginx config file for your Node.js application. Replace `yourdomain.com` with your actual domain and `3000` with the port your app runs on:

```bash
sudo nano /etc/nginx/sites-available/yourdomain.com
```

Paste the following configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Logging
    access_log /var/log/nginx/yourdomain.access.log;
    error_log  /var/log/nginx/yourdomain.error.log;

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;

        # Required for WebSocket support
        proxy_set_header Upgrade    $http_upgrade;
        proxy_set_header Connection 'upgrade';

        # Pass real client info to Node.js app
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_cache_bypass $http_upgrade;
        proxy_redirect     off;

        # Timeouts - increase for long-running requests
        proxy_read_timeout  240s;
        proxy_send_timeout  240s;
        proxy_connect_timeout 75s;
    }
}
```

Enable the site and reload Nginx:

```bash
# Create symlink to enable the site
sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/

# Test configuration syntax - always do this before reloading
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

Your Node.js app is now accessible at `http://yourdomain.com`. The `proxy_pass http://127.0.0.1:3000` line is the core of the reverse proxy - all traffic to port 80 is forwarded to your Node.js process on port 3000 internally.

##### Why use 127.0.0.1 instead of localhost in proxy_pass?

Using `127.0.0.1` forces IPv4 resolution and avoids a subtle bug where systems with IPv6 enabled resolve `localhost` to `::1` (IPv6 loopback) while your Node.js app only listens on IPv4 - resulting in a connection refused error even though both Nginx and Node.js are running correctly.

#### Step 5 - Deploy React Build as Static Files with Nginx

React (and other SPA frameworks like Vue, Next.js static export) should be served as pre-built static files - not proxied through Node.js. This is significantly faster and puts zero load on your application server.

Build your React app locally or on the server:

```bash
# On your server or in your CI pipeline
cd /var/www/your-react-app
npm install
npm run build
# Output is in /var/www/your-react-app/build (CRA) or /dist (Vite)
```

Create an Nginx config to serve the static build and optionally proxy API calls to your Node.js backend:

```bash
sudo nano /etc/nginx/sites-available/app.yourdomain.com
```

```nginx
server {
    listen 80;
    server_name app.yourdomain.com;

    # Root directory - point to your React build output
    root /var/www/your-react-app/build;
    index index.html;

    access_log /var/log/nginx/react-app.access.log;
    error_log  /var/log/nginx/react-app.error.log;

    # Serve React app - handle client-side routing
    # Without this, refreshing on /dashboard returns 404
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy /api requests to Node.js backend
    # React app calls /api/users -> forwarded to Node.js on port 3000
    location /api {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache static assets aggressively
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires    1y;
        add_header Cache-Control "public, immutable";
    }
}
```

The `try_files $uri $uri/ /index.html` directive is critical for React Router - without it, navigating directly to `/dashboard` returns a 404 because Nginx looks for a file called `dashboard` on disk and finds nothing. This line tells Nginx: if the file doesn't exist, serve `index.html` and let React Router handle the routing client-side.

#### Step 6 - Enable HTTPS with Let's Encrypt (Certbot)

Never run production apps over plain HTTP. Let's Encrypt provides free SSL certificates via **Certbot**, which also auto-configures Nginx:

```bash
# Install Certbot and Nginx plugin
sudo apt install -y certbot python3-certbot-nginx

# Allow HTTPS through firewall
sudo ufw allow 'Nginx Full'

# Issue certificate and auto-configure Nginx
# Replace with your actual domain(s)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts:
*   Enter email for renewal notifications
*   Agree to terms of service
*   Choose redirect option (2) to force all HTTP to HTTPS

Certbot automatically modifies your Nginx config to add HTTPS and set up HTTP-to-HTTPS redirect. Your config will gain a new server block listening on port 443 with the SSL certificate paths.

Certificates are valid for 90 days. Certbot installs a systemd timer that auto-renews before expiry. Test auto-renewal with:

```bash
sudo certbot renew --dry-run
```

#### Step 7 - Host Multiple Node.js Apps on One Server

One of Nginx's biggest advantages: run many apps on the same server, each on a different domain or subdomain, each on a different internal port. Create a separate config file per app:

```bash
# App 1 - API on port 3000
sudo nano /etc/nginx/sites-available/api.yourdomain.com

# App 2 - Admin panel on port 4000
sudo nano /etc/nginx/sites-available/admin.yourdomain.com

# App 3 - React frontend (static)
sudo nano /etc/nginx/sites-available/app.yourdomain.com
```

Example for running two separate Node.js APIs:

```nginx
# /etc/nginx/sites-available/api.yourdomain.com
server {
    listen 80;
    server_name api.yourdomain.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```nginx
# /etc/nginx/sites-available/admin.yourdomain.com
server {
    listen 80;
    server_name admin.yourdomain.com;
    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable both and reload:

```bash
sudo ln -s /etc/nginx/sites-available/api.yourdomain.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/admin.yourdomain.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

#### Common Errors and How to Fix Them

*   **502 Bad Gateway:** Nginx is running but cannot reach your Node.js app. Check that PM2 is running (`pm2 list`), verify the port number in `proxy_pass` matches where your app actually listens, and check app logs with `pm2 logs`.
*   **404 on React refresh / direct URL:** Missing `try_files $uri $uri/ /index.html` in your Nginx location block. Add it for any SPA served as static files.
*   **Permission denied on /var/www/:** Your files may be owned by root. Fix with `sudo chown -R $USER:$USER /var/www/your-app`.
*   **Nginx config test fails (nginx -t):** Read the error output carefully - it shows the exact file and line number. Common causes: missing semicolons, wrong bracket nesting, typo in directive name.
*   **App not restarting after server reboot:** Run `pm2 startup`, execute the command it outputs as root, then `pm2 save`. This registers PM2 as a systemd service.
*   **CORS errors in React app calling /api:** When React and the API are on the same domain (frontend proxied through Nginx to Node.js), CORS is not needed. If on different domains, add CORS headers in your Node.js Express app: `app.use(cors({ origin: 'https://app.yourdomain.com' }))`.
*   **req.ip returns 127.0.0.1 instead of real IP:** Add `app.set('trust proxy', 1)` in your Express app. This tells Express to read the real client IP from the `X-Forwarded-For` header set by Nginx.

#### FAQ

##### Q: Do I need PM2 if I'm using Docker?

**A:** No. Docker handles process lifecycle - if your container crashes, Docker restarts it (with `--restart unless-stopped`). Inside a Docker container, run Node.js directly as the main process (`CMD ["node", "app.js"]`). PM2 is for bare-metal or VPS deployments without containerization.

##### Q: Can I deploy a Next.js app the same way?

**A:** Yes, with one distinction. Next.js in production runs as a Node.js server (`npm run start` on port 3000 by default) - `proxy_pass` to it exactly like any Node.js app. If you use `next export` for a fully static build, serve it like the React static example above. For App Router with server components, always use the Node.js server mode.

##### Q: How do I update my app without downtime?

**A:** Pull new code, install dependencies, then use PM2 reload (not restart) for zero-downtime deploys: `git pull && npm install --production && pm2 reload my-node-app`. PM2 reload gracefully cycles workers one by one, keeping the app serving traffic throughout.

##### Q: What port should my Node.js app listen on?

**A:** Any port above 1024 that isn't already in use - 3000, 4000, 5000, 8000 are all common choices. Check occupied ports with `sudo ss -tlnp`. The external port (80/443) is handled entirely by Nginx - your Node.js app never needs to know about it.

##### Q: How do I set environment variables for production?

**A:** Create a `.env` file in your app directory and use `dotenv` in your app, or pass variables directly via PM2 ecosystem file. Create `ecosystem.config.js` in your project root and run `pm2 start ecosystem.config.js`. This keeps environment config separate from application code and easy to manage per environment.

#### Wrapping Up - Your Deployment Stack Is Now Production-Ready

You now have the complete deployment stack: Node.js running under PM2, Nginx as a reverse proxy handling all public traffic via `proxy_pass`, HTTPS enforced by Let's Encrypt, React static assets served directly by Nginx, and the ability to host multiple apps on a single server. This is the same stack used by the vast majority of Node.js deployments in production worldwide.

**Your next step:** Set up a simple deployment script - a shell script or GitHub Action that SSH's into your server, pulls latest code, runs `npm install`, and calls `pm2 reload`. Automating deployment from day one eliminates human error and makes updates take seconds instead of minutes. Check out how to set up CI/CD deployment for Node.js with GitHub Actions for the complete automation guide.

> See more: [Deploy PHP, Laravel, CodeIgniter on Linux VPS with Nginx](/en/deploy-php-laravel-codeigniter-len-linux-vps-voi-nginx)
