#!/usr/bin/env node

// Simple script to check environment variable configuration
require('dotenv').config();

console.log('🔍 Environment Variable Check\n');

const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'AI_api_key',
  'AI_BASE_URL'
];

let allGood = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const display = value ? `Set (${value.substring(0, 10)}...)` : 'Missing';
  
  console.log(`${status} ${varName}: ${display}`);
  
  if (!value) {
    allGood = false;
  }
});

console.log('\n' + (allGood ? '🎉 All environment variables are set!' : '⚠️  Some environment variables are missing!'));

if (!allGood) {
  console.log('\n📝 Make sure your .env file contains all required variables.');
}