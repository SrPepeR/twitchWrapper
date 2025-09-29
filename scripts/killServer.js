#!/usr/bin/env node

/**
 * Script to kill all running instances of the TwitchWrapper server
 * This script will find and terminate all processes related to this server
 */

const { exec, spawn } = require('child_process');
const path = require('path');

console.log('🔍 Searching for running TwitchWrapper server instances...\n');

// Get the current project directory
const projectDir = path.resolve(__dirname, '..');
const projectName = path.basename(projectDir);

console.log(`🎯 Project: ${projectName}`);
console.log(`📁 Directory: ${projectDir}\n`);

// Function to execute command and return promise
function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        // pgrep/pkill return exit code 1 when no processes found, which is normal
        if (error.code === 1) {
          resolve({ stdout: '', stderr: '', success: true });
        } else {
          resolve({ stdout, stderr, success: false, error });
        }
      } else {
        resolve({ stdout, stderr, success: true });
      }
    });
  });
}

// Function to find and kill processes by pattern
async function killProcessesByPattern(pattern, description) {
  console.log(`🔍 Checking for: ${description}`);
  
  try {
    // First, find the processes
    const findResult = await execPromise(`pgrep -f "${pattern}"`);
    
    if (findResult.stdout.trim()) {
      const pids = findResult.stdout.trim().split('\n').filter(pid => pid.trim());
      console.log(`   📋 Found PIDs: ${pids.join(', ')}`);
      
      // Kill each process
      for (const pid of pids) {
        const killResult = await execPromise(`kill -9 ${pid.trim()}`);
        if (killResult.success) {
          console.log(`   ✅ Killed process ${pid.trim()}`);
        } else {
          console.log(`   ⚠️  Failed to kill process ${pid.trim()}`);
        }
      }
    } else {
      console.log(`   ℹ️  No processes found`);
    }
  } catch (error) {
    console.log(`   ⚠️  Error: ${error.message}`);
  }
  console.log('');
}

// Function to kill processes using specific ports
async function killProcessesByPorts(ports) {
  console.log(`🌐 Checking processes on ports: ${ports.join(', ')}`);
  
  for (const port of ports) {
    try {
      const result = await execPromise(`lsof -ti:${port}`);
      
      if (result.stdout.trim()) {
        const pids = result.stdout.trim().split('\n').filter(pid => pid.trim());
        console.log(`   📋 Port ${port} - Found PIDs: ${pids.join(', ')}`);
        
        for (const pid of pids) {
          const killResult = await execPromise(`kill -9 ${pid.trim()}`);
          if (killResult.success) {
            console.log(`   ✅ Killed process ${pid.trim()} on port ${port}`);
          }
        }
      } else {
        console.log(`   ℹ️  Port ${port} - No processes found`);
      }
    } catch (error) {
      console.log(`   ⚠️  Port ${port} - Error: ${error.message}`);
    }
  }
  console.log('');
}

// Main execution function
async function killAllServerInstances() {
  console.log('🛑 Starting cleanup process...\n');
  
  // Define patterns to search for
  const patterns = [
    { pattern: 'nodemon.*index\\.js', description: 'Nodemon processes running index.js' },
    { pattern: 'node.*index\\.js', description: 'Node processes running index.js' },
    { pattern: `.*${projectName}.*index\\.js`, description: `Processes in ${projectName} directory` },
    { pattern: 'twitchwrapper', description: 'TwitchWrapper processes' }
  ];
  
  // Kill processes by patterns
  for (const { pattern, description } of patterns) {
    await killProcessesByPattern(pattern, description);
  }
  
  // Kill processes by common ports
  const commonPorts = [3000, 3001, 3002, 3003, 3004, 3005, 3006];
  await killProcessesByPorts(commonPorts);
  
  // Final check - show remaining node processes
  console.log('🔎 Final check - Remaining node processes:');
  try {
    const result = await execPromise('pgrep -fl node');
    if (result.stdout.trim()) {
      console.log('   📋 Remaining processes:');
      result.stdout.trim().split('\n').forEach(line => {
        if (line.includes('index.js') || line.includes('nodemon') || line.includes(projectName)) {
          console.log(`   ⚠️  ${line}`);
        } else {
          console.log(`   ℹ️  ${line}`);
        }
      });
    } else {
      console.log('   ✅ No node processes found');
    }
  } catch (error) {
    console.log('   ℹ️  No node processes found');
  }
  
  console.log('\n🧹 Cleanup complete!');
  console.log('✨ All TwitchWrapper server instances have been terminated.');
  console.log('🚀 You can now safely start the server with "npm run dev" or "npm run dev:clean"');
}

// Execute the cleanup
killAllServerInstances().catch(error => {
  console.error('❌ Error during cleanup:', error);
  process.exit(1);
});
