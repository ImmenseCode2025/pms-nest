#!/bin/bash

# Navigate to the project directory
cd /var/www/html/grc/

# Ensure dependencies are installed
npm install --force
npm run build

# Run the compiled NestJS or Node.js application
node dist/main.js
