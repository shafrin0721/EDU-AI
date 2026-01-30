#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')

console.log('🔧 EduAI Platform - Firestore Setup\n')
console.log('=' .repeat(50))

// Step 1: Check if Firebase CLI is installed
async function checkFirebaseCLI() {
  return new Promise((resolve) => {
    const firebase = spawn('firebase', ['--version'], { stdio: 'ignore' })
    firebase.on('close', (code) => {
      resolve(code === 0)
    })
  })
}

// Step 2: Check if user is authenticated
async function checkFirebaseAuth() {
  return new Promise((resolve) => {
    const firebase = spawn('firebase', ['auth:list'], { stdio: 'pipe' })
    let output = ''
    firebase.stdout.on('data', (data) => {
      output += data.toString()
    })
    firebase.on('close', (code) => {
      resolve(code === 0 && !output.includes('Error'))
    })
  })
}

// Step 3: Deploy Firestore rules
async function deployRules() {
  return new Promise((resolve, reject) => {
    console.log('\n📋 Deploying Firestore security rules...\n')
    
    const rulesPath = path.join(rootDir, 'firestore.rules')
    if (!fs.existsSync(rulesPath)) {
      console.error('❌ firestore.rules file not found!')
      reject(new Error('firestore.rules not found'))
      return
    }

    const firebase = spawn('firebase', ['deploy', '--only', 'firestore:rules'], {
      cwd: rootDir,
      stdio: 'inherit'
    })

    firebase.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ Firestore rules deployed successfully!')
        resolve(true)
      } else {
        console.error('\n❌ Failed to deploy rules')
        reject(new Error('Rules deployment failed'))
      }
    })
  })
}

// Step 4: Initialize Firestore collections
async function initializeCollections() {
  console.log('\n🗂️  Initializing Firestore collections...\n')
  
  const collectionNames = [
    'users',
    'courses',
    'modules',
    'lessons',
    'enrollments',
    'learning_sessions',
    'assessments',
    'achievements',
    'notifications',
    'organizations'
  ]

  console.log('Collections to create:')
  collectionNames.forEach(col => console.log(`  ✓ ${col}`))
  
  console.log('\n💡 Tip: Collections will be created automatically when:')
  console.log('  1. Users register (creates "users" collection)')
  console.log('  2. You import sample data (run in browser console):')
  console.log('\n    import { initializeFirestoreData } from "@/services/initializeFirestore"')
  console.log('    await initializeFirestoreData()\n')
}

// Main setup flow
async function runSetup() {
  try {
    // Check Firebase CLI
    console.log('\n1️⃣  Checking Firebase CLI...')
    const hasFirebase = await checkFirebaseCLI()
    if (!hasFirebase) {
      console.error('❌ Firebase CLI not found!')
      console.log('\n📥 Install it with: npm install -g firebase-tools\n')
      process.exit(1)
    }
    console.log('✅ Firebase CLI found')

    // Check authentication
    console.log('\n2️⃣  Checking Firebase authentication...')
    const isAuthenticated = await checkFirebaseAuth()
    if (!isAuthenticated) {
      console.log('❌ Not authenticated with Firebase')
      console.log('\n🔐 Run: firebase login')
      console.log('Then run setup again: npm run setup:firestore\n')
      process.exit(1)
    }
    console.log('✅ Authenticated with Firebase')

    // Deploy rules
    console.log('\n3️⃣  Deploying Firestore rules...')
    await deployRules()

    // Initialize collections
    console.log('\n4️⃣  Collection initialization...')
    await initializeCollections()

    // Summary
    console.log('\n' + '='.repeat(50))
    console.log('✨ Setup Complete!\n')
    console.log('Next steps:')
    console.log('1. Start the app: npm run dev')
    console.log('2. Register a test user')
    console.log('3. Check Firestore Console for new user data\n')
    console.log('To load sample data, run in browser console:')
    console.log('  import { initializeFirestoreData } from "@/services/initializeFirestore"')
    console.log('  await initializeFirestoreData()\n')
    console.log('For more info: see FIRESTORE_SETUP.md\n')

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message)
    process.exit(1)
  }
}

// Run setup
runSetup()
