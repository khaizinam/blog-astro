---
title: "Nginx Configuration Guide: HTTP, HTTPS, Proxy Pass"
author: KhaiziNam
pubDatetime: 2026-01-08T13:47:42.000Z
slug: huong-dan-cau-hinh-nginx-http-https-proxy-pass
lang: en
translationKey: post-159
featured: false
draft: false
tags:
  []
description: "Discover how to configure Nginx effectively for HTTP, HTTPS, Proxy Pass, and URL blocking. Optimize your website today!"
---

### **Nginx Configuration Guide: HTTP, HTTPS, Proxy Pass**

> Discover how to configure Nginx effectively for HTTP, HTTPS, Proxy Pass, and URL blocking. Optimize your website today!

In the modern web world, owning a powerful and flexible web server is key to ensuring performance and security for your website. Nginx, with its asynchronous architecture and high traffic handling capabilities, has become the top choice for many developers and system administrators. This article will dive deep into **how to use Nginx**, explaining important configuration rules such as HTTP, HTTPS, proxy pass, cache, and how to block unwanted URLs.

![Nginx Configuration Guide: HTTP, HTTPS, Proxy Pass](https://khaizinam.com/storage/blogs/612493203-1455239526604230-4049589168133588422-n.jpg)

**Nginx Configuration Guide: HTTP, HTTPS, Proxy Pass**

Understanding how to **configure Nginx** not only helps you optimize page load speeds but also enhances your website's protection against threats. We will explore the core aspects of Nginx together, from basic concepts to advanced configuration techniques, helping you master this powerful tool.

If you are looking for solutions to improve website performance and security, mastering **Nginx configuration** is an indispensable step. Let's begin this journey of discovery!

#### Table of Contents

1\. [What is Nginx?](#what-is-nginx)

2\. [Benefits of using Nginx](#benefits-of-using-nginx)

3\. [Key components in Nginx configuration](#key-components-in-nginx-configuration)

4\. [Step-by-step Nginx configuration guide](#step-by-step-nginx-configuration-guide)

5\. [Common mistakes when configuring Nginx](#common-mistakes-when-configuring-nginx)

6\. [Frequently Asked Questions about Nginx](#frequently-asked-questions-about-nginx)

* * *

### **What is Nginx?**

Nginx (pronounced "engine-x") is an open-source web server known for its high performance, scalability, and low system resource usage. It doesn't just serve as a web server; it can also act as a load balancer, reverse proxy, and HTTP cache.

A standout feature of Nginx is its asynchronous, event-driven architecture. Instead of creating a new process for each connection like traditional web servers, Nginx uses an event-driven architecture to handle thousands of concurrent connections with a relatively small number of processes. This allows Nginx to consume less memory and CPU, which is especially effective when handling large volumes of traffic.

### **Benefits of using Nginx**

Choosing Nginx for your web server brings many significant benefits, contributing to enhanced performance and user experience.

*   **Superior Performance:** Thanks to its asynchronous architecture, Nginx can handle a large number of simultaneous connections while maintaining fast response speeds. For example, a website using Nginx can serve millions of requests per second.
*   **Resource Efficiency:** Nginx consumes less memory and CPU compared to many other web servers, helping to reduce operational costs, especially on servers with limited resources.
*   **Flexible Scalability:** Nginx easily scales to meet the growing demands of a website. You can add new Nginx servers or configure them to act as load balancers.
*   **Enhanced Security:** Nginx supports strong security protocols like SSL/TLS, helping to encrypt transmitted data and protect websites from attacks.
*   **Efficient Caching:** Nginx's caching capability helps store static resources (images, CSS, JavaScript) and serve them faster for subsequent requests, reducing the load on the application server.

### **Key components in Nginx configuration**

To understand **how to use Nginx**, you need to master the main configuration blocks:

*   **\`main\` context:** Contains global configuration directives that affect the overall operation of Nginx, such as the number of worker processes.
*   **\`events\` context:** Configures options related to connection handling, such as \`worker\_connections\`.
*   **\`http\` context:** This is the most important block, containing configurations for the web server. It can contain sub-blocks like \`server\` and \`upstream\`.
*   **\`server\` context:** Defines a virtual server. You can have multiple \`server\` blocks to run multiple websites on the same IP address or port.
*   **\`location\` context:** Inside the \`server\` block, \`location\` defines how Nginx handles requests for specific URIs (Uniform Resource Identifiers).
*   **\`upstream\` context:** Used to define a group of backend servers, commonly used for load balancing.

### **Step-by-step Nginx configuration guide**

We will go through the basic configuration steps for a website.

#### **1\. Installing Nginx**

The installation process for Nginx varies depending on your operating system. On Debian/Ubuntu-based systems, you can run:

sudo apt update
sudo apt install nginx

On CentOS/RHEL, use:

sudo yum update
sudo yum install nginx

#### **2\. Basic HTTP Configuration**

The main Nginx configuration file is usually located at \`/etc/nginx/nginx.conf\`. Configuration files for individual websites are typically placed in the \`/etc/nginx/sites-available/\` directory and symbolically linked to \`/etc/nginx/sites-enabled/\`.

Create a new configuration file for your website, for example: \`/etc/nginx/sites-available/mywebsite.conf\`:

server {
    listen 80;
    server\_name your\_domain.com www.your\_domain.com;
    root /var/www/mywebsite/html;
    index index.html index.htm;
    location / {
        try\_files $uri $uri/ =404;
    }
}

Then, activate this configuration by creating a symbolic link:

sudo ln -s /etc/nginx/sites-available/mywebsite.conf /etc/nginx/sites-enabled/

Check the configuration syntax and restart Nginx:

sudo nginx -t
sudo systemctl restart nginx

#### **3\. HTTPS Configuration**

To enable HTTPS, you need an SSL/TLS certificate. You can get a free certificate from Let's Encrypt. Suppose you have certificates at \`/etc/letsencrypt/live/your\_domain.com/fullchain.pem\` and \`/etc/letsencrypt/live/your\_domain.com/privkey.pem\`.

Edit the \`mywebsite.conf\` file:

server {
    listen 80;
    server\_name your\_domain.com www.your\_domain.com;
    return 301 https://$host$request\_uri; # Redirect HTTP to HTTPS
}
server {
    listen 443 ssl http2;
    server\_name your\_domain.com www.your\_domain.com;
    ssl\_certificate /etc/letsencrypt/live/your\_domain.com/fullchain.pem;
    ssl\_certificate\_key /etc/letsencrypt/live/your\_domain.com/privkey.pem;
    root /var/www/mywebsite/html;
    index index.html index.htm;
    location / {
        try\_files $uri $uri/ =404;
    }
}

Restart Nginx after the changes.

#### **4\. Proxy Pass Configuration**

`proxy_pass` is used to forward requests to another backend server. This is very useful when you have a web application running on a different port or server.

For example, to forward all requests to a Node.js application running on port 3000:

location / {
    proxy\_pass http://localhost:3000;
    proxy\_set\_header Host $host;
    proxy\_set\_header X-Real-IP $remote\_addr;
    proxy\_set\_header X-Forwarded-For $proxy\_add\_x\_forwarded\_for;
    proxy\_set\_header X-Forwarded-Proto $scheme;
}

The important \`proxy\_set\_header\` directives help the backend server know information about the original request.

#### **5\. Cache Configuration**

Nginx can cache responses from backend servers or static files to speed things up. You can use \`proxy\_cache\_path\` and \`proxy\_cache\`.

Define the cache path in the \`http\` block:

http {
    # ... other configurations ...
    proxy\_cache\_path /var/cache/nginx levels=1:2 keys\_zone=my\_cache:10m max\_size=1g inactive=60m;
    server {
        # ... server configuration ...
        location / {
            proxy\_pass http://localhost:3000;
            proxy\_set\_header Host $host;
            # ... other headers ...
            proxy\_cache my\_cache; # Use the defined cache zone
            proxy\_cache\_valid 200 302 10m; # Cache time for 200, 302 codes
            proxy\_cache\_valid 404 1m; # Cache time for 404 codes
            add\_header X-Cache-Status $upstream\_cache\_status; # Add header to check cache status
        }
    }
}

Remember to create the \`/var/cache/nginx\` directory and grant write permissions to the Nginx user.

#### **6\. Blocking URLs (Block URL)**

You can block access to specific URLs or URL patterns using a \`location\` block with conditions.

For example, blocking access to a sensitive \`.env\` file:

location ~ /\\.env {
    deny all;
    return 403;
}

Or blocking requests containing a certain string:

location ~\* "bad\_pattern" {
    deny all;
    return 403;
}

The \`~\` symbol indicates a regex match, \`~\*\` for case-insensitive regex match, and \`!\` reverses the condition.

### **Common mistakes when configuring Nginx**

During the process of working with Nginx, several common mistakes can cause issues:

*   **Incorrect Configuration Syntax:** Missing semicolons (\`;\`) or curly braces (\`{}\`) is a very common error. Always run \`nginx -t\` to check before reloading.
*   **Incorrect File Permissions:** Nginx needs read permission for configuration files, website files, and write permission for the cache directory.
*   **Wrong \`proxy\_pass\` path:** Ensure the URL or upstream name in \`proxy\_pass\` is correct.
*   **Not configuring \`proxy\_set\_header\`:** The backend server might not receive the original user's IP, making it difficult to log or apply IP-based logic.
*   **Cache not working as expected:** Double-check \`proxy\_cache\_path\`, \`keys\_zone\`, \`max\_size\`, and \`inactive\`. Ensure Nginx has write access to the cache folder.
*   **Ignoring HTTP to HTTPS redirection:** Not redirecting users from HTTP to HTTPS reduces security.
*   **Using \`root\` instead of \`alias\` incorrectly:** \`root\` applies to all sub-\`locations\`, while \`alias\` only replaces a specific part of the URI.

### **Frequently Asked Questions about Nginx**

##### Q: Can Nginx completely replace Apache?

**A:** Nginx is often used as a reverse proxy in front of Apache or other application servers. It excels at handling static connections and load balancing. In many cases, Nginx can handle all web requests, but combining Nginx and Apache remains a popular architecture.

##### Q: How do I view Nginx logs?

**A:** The access log and error log for Nginx are usually located in \`/var/log/nginx/\`. You can configure the paths and log formats in the \`nginx.conf\` file.

##### Q: What should \`worker\_processes\` be set to?

**A:** The most common value is setting it equal to the number of CPU cores on the server to optimize performance.

##### Q: Can I use Nginx to serve static files and act as a proxy for an application at the same time?

**A:** Certainly. You can use different \`location\` blocks to specify how different types of requests are handled. One \`location\` can serve static files from \`root\`, while another uses \`proxy\_pass\`.

##### Q: How can I configure Nginx to prevent basic DDoS attacks?

**A:** You can use directives like \`limit\_req\_zone\` and \`limit\_conn\_zone\` to limit the number of requests and connections from a single IP address. Effective cache configuration also helps reduce server load.

Mastering **Nginx configuration** is a crucial skill for anyone working with web servers. From setting up HTTP and HTTPS to using \`proxypass\` to connect with backend applications and leveraging \`cache\` for speed, Nginx provides a powerful toolkit. Knowing how to block unwanted URLs also contributes to protecting your website.

If you need **SEO** support or **website optimization**, contact [**khaizinam.io.vn**](/en) for in-depth consultation.

Continue practicing and exploring more features of Nginx to optimize performance and security for your projects.
