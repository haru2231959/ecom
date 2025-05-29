#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Express E-commerce API...\n');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const runCommand = (command, description) => {
  try {
    log(`📦 ${description}...`, 'blue');
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed`, 'green');
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'red');
    process.exit(1);
  }
};

const createDirectories = () => {
  const directories = [
    'storage',
    'storage/logs',
    'storage/uploads',
    'storage/uploads/images',
    'storage/uploads/documents',
    'storage/temp',
    'docs',
    'src/database/migrations',
    'src/database/seeders',
    'tests/unit',
    'tests/integration'
  ];

  log('📁 Creating directories...', 'blue');
  directories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      log(`   Created: ${dir}`, 'green');
    }
  });
  log('✅ Directories created', 'green');
};

const createEnvFile = () => {
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    log('📝 Creating .env file from .env.example...', 'blue');
    fs.copyFileSync(envExamplePath, envPath);
    log('✅ .env file created', 'green');
    log('⚠️  Please update the .env file with your configuration', 'yellow');
  }
};

const createGitignore = () => {
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  
  if (!fs.existsSync(gitignorePath)) {
    const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*

# Environment variables
.env
.env.local

# Logs
logs
*.log
storage/logs/

# Coverage
coverage/
.nyc_output

# Runtime data
pids
*.pid
*.seed

# Optional npm cache
.npm
.eslintcache

# Uploads
storage/uploads/
storage/temp/

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Build
dist/
build/`;

    fs.writeFileSync(gitignorePath, gitignoreContent);
    log('✅ .gitignore file created', 'green');
  }
};

const main = async () => {
  try {
    log('Express E-commerce API Setup', 'bright');
    log('================================\n', 'bright');

    createDirectories();
    createEnvFile();
    createGitignore();

    if (fs.existsSync('package.json')) {
      runCommand('npm install', 'Installing dependencies');
    }

    log('\n🎉 Setup completed successfully!', 'green');
    log('\nNext steps:', 'bright');
    log('1. Update your .env file with database credentials', 'yellow');
    log('2. Create your MySQL database', 'yellow');
    log('3. Run: npm run migrate', 'yellow');
    log('4. Run: npm run dev', 'yellow');
    log('\nAPI will be available at: http://localhost:3000', 'blue');
    log('Documentation: http://localhost:3000/api-docs\n', 'blue');

  } catch (error) {
    log(`❌ Setup failed: ${error.message}`, 'red');
    process.exit(1);
  }
};

if (require.main === module) {
  main();
}

module.exports = { main };