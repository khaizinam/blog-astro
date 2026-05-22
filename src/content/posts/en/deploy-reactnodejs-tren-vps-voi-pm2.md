---
title: "Secrets to Deploying React/Node.js on a 1GB RAM VPS with PM2: Never Run Out of Memory 2026"
author: KhaiziNam
pubDatetime: 2026-04-21T09:52:37.000Z
slug: deploy-reactnodejs-tren-vps-voi-pm2
lang: en
translationKey: post-228
featured: false
draft: false
tags:
  - "DevOps"
description: "For web developers, owning a 1GB RAM VPS at a low cost is an ideal starting point. However, in practice, deployment often turns into a \"nightmare\" when applications constantly crash for no apparent reason. The core of the problem lies in the following two key factors:"
---

## Table of Contents

*   [I. Introduction: Why is a 1GB RAM VPS always a "nightmare"?](#tai-sao-vps-1gb-ram-la-noi-ac-mong)
*   [II. Strategy 1: Optimizing Node.js "Breathing" (V8 Engine)](#toi-uu-hoa-hoi-tho-nodejs-v8)
*   [III. Focus: The "Ultra-Lightweight" ecosystem.config.js Template](#tam-diem-ecosystem-file-chuan-sieu-nhe)
*   [IV. Disk Space Solution: pm2-logrotate](#iv-disk-space-solution-pm2-logrotate)
*   [V. Summary of "Golden" Commands to Optimize 1GB VPS](#tong-hop-lenh-vang-toi-uu-vps-yeu)
*   [VI. Q&A: Common Errors and Troubleshooting](#vi-qa-common-errors-and-troubleshooting)

## I. Why is a 1GB RAM VPS always a "nightmare"?

For Web developers, owning a 1GB RAM VPS with a low cost is an ideal starting choice. However, the reality of deployment often turns into a "nightmare" when the application continuously crashes for unknown reasons. The core issue lies in two main factors:

![Secrets to Deploying React/Node.js on 1GB RAM VPS with PM2: Never Run Out of Memory (OOM)](https://cdn.khaizinam.io.vn/blogs/gemini-generated-image-z2uuv6z2uuv6z2uu.jpg)

Secrets to Deploying React/Node.js on 1GB RAM VPS with PM2: Never Run Out of Memory (OOM)

### 1\. The Linux OOM Killer Mechanism

In the Linux operating system, there is a system protection mechanism called the **OOM Killer (Out of Memory Killer)**. When physical RAM is exhausted and the system no longer has enough memory to maintain basic operations, the kernel is forced to make a decision to "sacrifice" a process to save the entire system.

Unfortunately, Node.js applications are often the primary targets for the OOM Killer because they tend to occupy increasing amounts of RAM over time. When RAM hits the 100% threshold, the system automatically "kills" the Node.js process immediately, leaving your website in an inaccessible state (502 Bad Gateway).

> Read more: [Deploy PHP, Laravel, CodeIgniter on Linux VPS with Nginx](/en/deploy-php-laravel-codeigniter-len-linux-vps-voi-nginx)

### 2\. The Mistake of Using "npm start" in Production

Many developers maintain the habit of running applications using `npm start` or `yarn start`, similar to how they work locally. This is a costly resource mistake on weak VPS servers:

*   **Child Process Burden:** When running via `npm`, the system must launch an intermediate process just to manage the script. This causes you to lose dozens to hundreds of MB of RAM uselessly.
*   **Development Tools Overhead:** In many cases, this start command unintentionally activates file monitoring tools (like nodemon) or unnecessary compilers, significantly consuming the VPS's CPU and RAM.

Instead of letting the application "fend for itself" in a harsh environment, we need a smarter resource coordination strategy through **PM2** – a professional process manager that helps us control every byte of RAM and prevent the OOM Killer's "strike."

## II. Strategy 1: Optimizing Node.js (V8 Engine)

Node.js runs on the **V8 Engine** (the same as Google Chrome). By default, V8 is designed to utilize as much available RAM as possible to increase processing speed. However, on a VPS with only 1GB RAM, this "generosity" is a double-edged sword.

### 1\. Limiting the Heap Memory

If you don't set a limit, Node.js may try to occupy up to 512MB or more before performing Garbage Collection (GC). On a 1GB VPS, when counting RAM for the OS and other processes, this occupancy will lead the system to hit the OOM threshold very quickly.

By using the `--max-old-space-size` flag, you can force Node.js to clean up memory more frequently once it reaches a certain threshold. For a 1GB VPS, the ideal number usually falls between **200MB and 256MB** per application.

### 2\. How to Apply in Practice

Instead of running standard commands, use the following structure to "tighten" resources from startup:

```bash
node --max-old-space-size=256 index.js
```

When applying this command, Node.js will understand: _"When memory reaches the 256MB mark, prioritize cleaning up unused variables instead of continuing to expand."_ This cleanup may slightly increase CPU usage, but it ensures your application **survives** on a resource-poor system.

### 3\. Why Combine with PM2?

Running commands manually has the disadvantage that if the app crashes due to a code error, it won't restart automatically. When we include this parameter in the PM2 configuration file (Ecosystem file), we get a perfect "combo": **Limited RAM plus automatic restart in case of failure.**

> **Note:** Do not set this number too low (e.g., under 128MB). If the limit is too low, Node.js will have to perform GC continuously, leading to CPU throttling and making your website respond very slowly.

## III. The "Ultra-Lightweight" ecosystem.config.js Template

Instead of using individual command lines, using an **Ecosystem File** is the most professional way to manage applications on a VPS. For low-resource environments (1GB RAM), we need a "tailor-made" configuration so PM2 can proactively protect the system before a disaster occurs.

### 1\. Why Use a Config File Instead of Direct Commands?

The configuration file helps you centrally manage multiple applications (e.g., a Node.js API and a built React app). More importantly, it allows you to set **proactive defense** thresholds that standard `pm2 start` commands often overlook.

### 2\. Optimized Configuration for 1GB VPS

Create a file named `ecosystem.config.js` in your server's root directory and use the following sample content:

```javascript
module.exports = {
  apps: [
    {
      name: "api-backend",
      script: "./dist/main.js",      // Path to the built file (Important!)
      instances: 1,                  // Absolutely do not use 'max' on weak VPS
      exec_mode: "fork",             // Fork mode uses less RAM than Cluster for 1-core CPUs
      max_memory_restart: "250M",    // "Lifebuoy": Auto reboot if RAM exceeds 250MB
      node_args: "--max-old-space-size=200", // Limit V8 Heap memory
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      // Grouping and formatting log configuration
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    },
    {
      name: "frontend-serve",
      script: "serve",               // Use the ultra-light 'serve' module
      env: {
        PM2_SERVE_PATH: './build',   // Path to React/Vue/Angular build folder
        PM2_SERVE_PORT: 8080,
        PM2_SERVE_SPA: 'true'        // Support Routing for Single Page Applications
      }
    }
  ]
}
```

### 3\. Parameter Breakdown

*   **max_memory_restart (250M):** This is the most crucial feature. If your app leaks memory and hits 250MB, PM2 will automatically kill that process and restart it. This prevents the VPS from hanging completely.
*   **exec_mode: "fork":** Unlike `cluster` (which creates multiple copies to utilize multi-core), `fork` runs the app as a single process. On a 1GB VPS (usually 1 vCPU), `fork` mode reduces the management burden on the OS.
*   **script: "serve":** For Frontend, do not run `npm start`. Build into a static directory and use PM2's `serve` command. It saves up to 70% of RAM compared to running React/Vue development toolsets.

After creating the file, simply run a single command: `pm2 start ecosystem.config.js` to activate this entire optimized configuration.

## IV. Disk Space Solution - pm2-logrotate

Another "deadly" error developers often overlook on weak VPS servers is **Log Files**. By default, PM2 records all activity logs (output and error). If your app has high traffic or generates many warnings, these files can swell to several GBs in just a few days, overflowing the disk and causing the system to crash immediately.

### 1\. What is pm2-logrotate?

This is an official extension module for PM2 that helps automatically manage, split, and compress log files. Instead of one massive log file, it breaks it down by size or time and automatically deletes the oldest versions.

### 2\. Optimized "Ultra-Sleek" Configuration

First, install the module with the command:

```bash
pm2 install pm2-logrotate
```

After installation, execute the following commands to set strict limits for a 1-1 VPS (1 CPU - 1GB RAM):

*   **Limit file size:** Split files when they reach 10MB (instead of the 100MB default which is too large for weak VPS).

```bash
pm2 set pm2-logrotate:max_size 10M
```

*   **Limit number of stored files:** Only keep a maximum of the 5 most recent files.

```bash
pm2 set pm2-logrotate:retain 5
```

*   **Enable compression:** Compress old log files into .gz format to save up to 90% of disk space.

```bash
pm2 set pm2-logrotate:compress true
```

*   **Check frequency:** Tell the module to check log size every 30 seconds.

```bash
pm2 set pm2-logrotate:workerInterval 30
```

### 3\. Essential Log Management Commands

In addition to automation, you can proactively coordinate logs to free up resources immediately:

*   `pm2 flush`: Clears all data in current log files (Use when disk space is in red alert).
*   `pm2 logs --lines 100`: View only the last 100 lines of logs instead of loading the whole file which wastes terminal RAM.
*   `pm2 reload all`: After changing log configurations in the ecosystem file, use this to apply them without interrupting users.

> **Pro Tip:** If you are running SEO scripts or scraping tools, avoid using `console.log()` excessively in production code. Fewer logs mean a "healthier" CPU and disk.

## V. Summary of Commands to Optimize 1GB VPS

To keep a modest VPS (1 vCPU - 1GB RAM) running smoothly, configuring PM2 alone isn't enough. You need to combine it with the system settings below to create a solid "shield" for your application.

### 1\. Creating Swap (Virtual RAM)

On a 1GB VPS, when Node.js hits peak load, if there's no Swap, the OS will execute the OOM Killer immediately. Swap acts as a buffer on the SSD to rescue the system when physical RAM overflows.

Run the following sequence of commands to create 2GB of Swap:

```bash
# Create 2GB swap file
sudo fallocate -l 2G /swapfile
# Set security permissions
sudo chmod 600 /swapfile
# Set swap format
sudo mkswap /swapfile
# Activate swap
sudo swapon /swapfile
# Save config to auto-enable on VPS reboot
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 2\. Real-time Resource Monitoring with PM2 Monit

Instead of using Linux `top` or `htop` commands which are hard to read for specific Node.js stats, use PM2's built-in tool:

```bash
pm2 monit
```

This interface allows you to monitor exactly how much RAM each app is occupying. If you see an app constantly hitting the `max_memory_restart` threshold set in Section 3, you'll know you need to optimize the code or upgrade the limit.

### 3\. Optimization of Startup Procedures

To ensure all your optimized configurations remain after a VPS reboot (due to maintenance or crash), follow this 3-step process:

1.  **Create startup script:** `pm2 startup` (Then copy and run the line returned by the terminal).
2.  **Save current state:** `pm2 save` (This saves the app list and config to a `dump.pm2` file).
3.  **Check the list:** `pm2 list` to ensure everything is in the _online_ state.

### 4\. Periodic System Cleaning

To free up RAM occupied by junk processes or old PM2 caches, you should periodically run:

```bash
# Restart apps safely (Zero-downtime) to clear RAM
pm2 reload all

# Delete stopped processes that are no longer in use
pm2 delete [old_app_id]
```

> **Actionable Advice:** With a 1GB VPS, the goal isn't to run fast, but to **run stable**. Sacrificing a bit of speed (via forced GC and Swap usage) for durability is a completely sound strategy for projects like Lunar Calendars or your SEO Tools.

## VI. Q&A: Common Errors and Troubleshooting

Even with a standard configuration, real-world deployment on budget VPS lines (like Vultr, DigitalOcean, or Intel N100 servers) can still encounter specific errors. Here is a summary of quick fixes:

### 1\. Why did the OOM Killer still strike even with max_memory_restart set?

**Cause:** The application's RAM leak speed was too fast or remaining system RAM was too low, causing Linux to intervene (Kill process) before PM2 could identify the overload threshold to restart.

**Solution:**

*   Check if you have activated **Swap** (see Section 5).
*   Lower the `max_memory_restart` threshold by another 50MB to create a safer "buffer zone" for the OS.

### 2\. "Command not found: serve" error when running Frontend

**Cause:** You used the `script: "serve"` configuration in the ecosystem file but haven't installed the `serve` package globally on the VPS.

**Solution:** Run the following command to install the ultra-light static file serving tool:

```bash
npm install -g serve
```

### 3\. PM2 doesn't auto-restart Apps upon VPS Reboot

**Cause:** You ran `pm2 startup` but haven't executed `pm2 save` to freeze the process list to the disk.

**Solution:** Reset following the exact order:

```bash
pm2 startup
# Copy and run the system command returned
pm2 save
```

### 4\. App is stuck in "errored" or "restarting" state

**Cause:** Possibly due to an incorrect `script` path in the `ecosystem.config.js` file or the log file lacking write permissions (permission denied).

**Solution:**

*   Use the `pm2 logs --err` command to view specific error message details.
*   Ensure that log directories (e.g., `./logs/`) are created before running PM2.

### 5\. How to update new code without downtime?

**Cause:** Using `pm2 restart` will disconnect users for a few seconds.

**Solution:** Use the `reload` command. It keeps old processes running until the new ones are ready:

```bash
pm2 reload ecosystem.config.js
```

> **Summary:** Deploying on a weak VPS is like coordinating a small but elite army. As long as you control the **Heap Size**, leverage **Swap**, and manage **Logs** strictly, your Node.js/React application can easily handle thousands of daily visits without needing a server upgrade.

Author: Nguyen Huu Khai

21/04/2026

> See also:
> 
> *   [Deploy PHP, Laravel, CodeIgniter on Linux VPS with Nginx](/en/deploy-php-laravel-codeigniter-len-linux-vps-voi-nginx)
> *   [How to Deploy Node.js and React on Linux Hosting Using Nginx](/en/cach-deploy-nodejs-va-react-len-hosting-linux-bang-nginx-reverse-proxy-huong-dan-day-du-pm2-ssl-2025)
