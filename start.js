#!/usr/bin/env node

/**
 * TravelStay Application Startup Script
 * This script ensures all dependencies are met before starting the application
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 Starting TravelStay Application...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env file not found. Creating from template...');
  const envExample = path.join(__dirname, '.env.example');
  if (fs.existsSync(envExample)) {
    fs.copyFileSync(envExample, envPath);
    console.log('✅ .env file created. Please update with your credentials.\n');
  } else {
    console.log('❌ .env.example not found. Please create .env manually.\n');
  }
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  const npm = spawn('npm', ['install'], { stdio: 'inherit', shell: true });
  
  npm.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Dependencies installed successfully.\n');
      startApplication();
    } else {
      console.log('❌ Failed to install dependencies.\n');
      process.exit(1);
    }
  });
} else {
  startApplication();
}

function startApplication() {
  console.log('🌟 Starting TravelStay server...\n');
  
  // Set environment variables
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  
  // Start the application
  const app = spawn('node', ['app.js'], { stdio: 'inherit', shell: true });
  
  app.on('close', (code) => {
    console.log(`\n🛑 TravelStay server stopped with code ${code}`);
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down TravelStay server...');
    app.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down TravelStay server...');
    app.kill('SIGTERM');
  });
}