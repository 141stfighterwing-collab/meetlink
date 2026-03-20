import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ENV_FILE_PATH = path.join(process.cwd(), '.env');

// Environment variable schema with categories
const envSchema = {
  app: {
    title: 'Application Settings',
    variables: [
      { key: 'NEXT_PUBLIC_APP_URL', label: 'App URL', type: 'url', required: true },
      { key: 'NEXT_PUBLIC_APP_NAME', label: 'App Name', type: 'text', required: true },
    ]
  },
  database: {
    title: 'Database',
    variables: [
      { key: 'DATABASE_URL', label: 'Database URL (PostgreSQL)', type: 'text', required: true },
      { key: 'REDIS_URL', label: 'Redis URL (Optional)', type: 'text', required: false },
    ]
  },
  auth: {
    title: 'Authentication',
    variables: [
      { key: 'NEXTAUTH_SECRET', label: 'NextAuth Secret', type: 'password', required: true },
      { key: 'NEXTAUTH_URL', label: 'NextAuth URL', type: 'url', required: true },
    ]
  },
  email: {
    title: 'Email (SMTP)',
    variables: [
      { key: 'SMTP_HOST', label: 'SMTP Host', type: 'text', required: false },
      { key: 'SMTP_PORT', label: 'SMTP Port', type: 'number', required: false },
      { key: 'SMTP_USER', label: 'SMTP User', type: 'text', required: false },
      { key: 'SMTP_PASS', label: 'SMTP Password', type: 'password', required: false },
      { key: 'EMAIL_FROM', label: 'From Email', type: 'email', required: false },
    ]
  },
  calendar: {
    title: 'Calendar Integrations',
    variables: [
      { key: 'GOOGLE_CLIENT_ID', label: 'Google Client ID', type: 'text', required: false },
      { key: 'GOOGLE_CLIENT_SECRET', label: 'Google Client Secret', type: 'password', required: false },
      { key: 'MICROSOFT_CLIENT_ID', label: 'Microsoft Client ID', type: 'text', required: false },
      { key: 'MICROSOFT_CLIENT_SECRET', label: 'Microsoft Client Secret', type: 'password', required: false },
      { key: 'ZOOM_CLIENT_ID', label: 'Zoom Client ID', type: 'text', required: false },
      { key: 'ZOOM_CLIENT_SECRET', label: 'Zoom Client Secret', type: 'password', required: false },
    ]
  },
  security: {
    title: 'Security',
    variables: [
      { key: 'CORS_ORIGINS', label: 'CORS Origins', type: 'text', required: false },
      { key: 'RATE_LIMIT_MAX', label: 'Rate Limit Max', type: 'number', required: false },
      { key: 'RATE_LIMIT_WINDOW_MS', label: 'Rate Limit Window (ms)', type: 'number', required: false },
    ]
  },
  logging: {
    title: 'Logging',
    variables: [
      { key: 'LOG_LEVEL', label: 'Log Level', type: 'select', options: ['debug', 'info', 'warn', 'error'], required: false },
      { key: 'AUDIT_LOG_ENABLED', label: 'Audit Log Enabled', type: 'boolean', required: false },
    ]
  }
};

// Parse .env file into key-value pairs
function parseEnvFile(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const equalIndex = trimmed.indexOf('=');
    if (equalIndex > 0) {
      const key = trimmed.substring(0, equalIndex).trim();
      let value = trimmed.substring(equalIndex + 1).trim();
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      result[key] = value;
    }
  }
  
  return result;
}

// Convert key-value pairs back to .env format
function stringifyEnvFile(values: Record<string, string>, originalContent: string): string {
  const lines = originalContent.split('\n');
  const updatedKeys = new Set<string>();
  const result: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Keep comments and empty lines as-is
    if (!trimmed || trimmed.startsWith('#')) {
      result.push(line);
      continue;
    }
    
    const equalIndex = trimmed.indexOf('=');
    if (equalIndex > 0) {
      const key = trimmed.substring(0, equalIndex).trim();
      
      if (key in values) {
        // Update existing value
        const value = values[key];
        // Preserve quotes if original had them
        const originalValue = trimmed.substring(equalIndex + 1).trim();
        const hadQuotes = (originalValue.startsWith('"') && originalValue.endsWith('"')) ||
                         (originalValue.startsWith("'") && originalValue.endsWith("'"));
        
        const newLine = hadQuotes 
          ? `${key}="${value}"`
          : (value.includes(' ') || value.includes('#')) ? `${key}="${value}"` : `${key}=${value}`;
        
        result.push(newLine);
        updatedKeys.add(key);
      } else {
        result.push(line);
      }
    } else {
      result.push(line);
    }
  }
  
  // Add new keys that weren't in the original file
  for (const [key, value] of Object.entries(values)) {
    if (!updatedKeys.has(key)) {
      const newLine = (value.includes(' ') || value.includes('#')) ? `${key}="${value}"` : `${key}=${value}`;
      result.push(newLine);
    }
  }
  
  return result.join('\n');
}

// GET - Read environment variables
export async function GET() {
  try {
    // Check if .env file exists
    if (!fs.existsSync(ENV_FILE_PATH)) {
      return NextResponse.json({
        success: false,
        error: '.env file not found',
        schema: envSchema,
        values: {}
      });
    }
    
    const content = fs.readFileSync(ENV_FILE_PATH, 'utf-8');
    const values = parseEnvFile(content);
    
    return NextResponse.json({
      success: true,
      schema: envSchema,
      values,
      // Include masked sensitive values for display
      maskedValues: maskSensitiveValues(values)
    });
  } catch (error) {
    console.error('Error reading .env file:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to read environment configuration',
      schema: envSchema,
      values: {}
    }, { status: 500 });
  }
}

// Mask sensitive values for display
function maskSensitiveValues(values: Record<string, string>): Record<string, string> {
  const sensitiveKeys = ['SECRET', 'PASSWORD', 'PASS', 'KEY', 'TOKEN', 'API_KEY'];
  const masked: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(values)) {
    const isSensitive = sensitiveKeys.some(s => key.toUpperCase().includes(s));
    if (isSensitive && value) {
      // Show first 4 and last 4 characters
      if (value.length > 12) {
        masked[key] = `${value.substring(0, 4)}${'*'.repeat(8)}${value.substring(value.length - 4)}`;
      } else {
        masked[key] = '*'.repeat(value.length);
      }
    } else {
      masked[key] = value;
    }
  }
  
  return masked;
}

// PUT - Update environment variables
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { values, reload = false } = body;
    
    if (!values || typeof values !== 'object') {
      return NextResponse.json({
        success: false,
        error: 'Invalid values provided'
      }, { status: 400 });
    }
    
    // Read current .env content
    let originalContent = '';
    if (fs.existsSync(ENV_FILE_PATH)) {
      originalContent = fs.readFileSync(ENV_FILE_PATH, 'utf-8');
    } else {
      // Create default header for new file
      originalContent = `# MeetLink Environment Configuration
# Generated: ${new Date().toISOString()}

`;
    }
    
    // Generate new .env content
    const newContent = stringifyEnvFile(values, originalContent);
    
    // Backup original file
    const backupPath = `${ENV_FILE_PATH}.backup`;
    if (fs.existsSync(ENV_FILE_PATH)) {
      fs.copyFileSync(ENV_FILE_PATH, backupPath);
    }
    
    // Write new content
    fs.writeFileSync(ENV_FILE_PATH, newContent, 'utf-8');
    
    // If reload requested, signal the need to restart
    // Note: In production, this would typically be handled by a process manager
    if (reload) {
      // Create a reload signal file
      const reloadSignalPath = path.join(process.cwd(), '.reload-signal');
      fs.writeFileSync(reloadSignalPath, new Date().toISOString(), 'utf-8');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Environment configuration saved successfully',
      reloadRequired: true,
      backupCreated: true
    });
    
  } catch (error) {
    console.error('Error writing .env file:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to save environment configuration'
    }, { status: 500 });
  }
}

// DELETE - Restore from backup
export async function DELETE() {
  try {
    const backupPath = `${ENV_FILE_PATH}.backup`;
    
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, ENV_FILE_PATH);
      return NextResponse.json({
        success: true,
        message: 'Environment configuration restored from backup'
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'No backup file found'
    }, { status: 404 });
    
  } catch (error) {
    console.error('Error restoring backup:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to restore backup'
    }, { status: 500 });
  }
}
