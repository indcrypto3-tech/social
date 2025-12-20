
/**
 * Environment Variable Validation
 * 
 * This module validates that all required environment variables are present
 * and properly formatted at application boot time.
 */

interface EnvConfig {
    // Application
    PORT: string;
    NODE_ENV: string;
    NEXT_PUBLIC_APP_URL: string;

    // Database
    DATABASE_URL: string;

    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;

    // Redis
    REDIS_URL: string;

    // Security
    ENCRYPTION_KEY: string;
    WORKER_SECRET: string;
    CRON_SECRET?: string; // Optional, defaults to WORKER_SECRET

    // OAuth - Facebook/Instagram
    FACEBOOK_APP_ID?: string;
    FACEBOOK_APP_SECRET?: string;
    FACEBOOK_CALLBACK_URL?: string;

    // OAuth - LinkedIn
    LINKEDIN_CLIENT_ID?: string;
    LINKEDIN_CLIENT_SECRET?: string;
    LINKEDIN_CALLBACK_URL?: string;

    // OAuth - Twitter/X
    X_CLIENT_ID?: string;
    X_CLIENT_SECRET?: string;
    X_CALLBACK_URL?: string;

    // AI
    OPENAI_API_KEY?: string;

    // Payments
    STRIPE_SECRET_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;

    // Monitoring
    SENTRY_DSN?: string;

    // Session
    SESSION_TTL_HOURS?: string;
}

const REQUIRED_VARS = [
    'DATABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'REDIS_URL',
    'ENCRYPTION_KEY',
    'WORKER_SECRET',
    'NEXT_PUBLIC_APP_URL'
];

const OPTIONAL_VARS = [
    'FACEBOOK_APP_ID',
    'FACEBOOK_APP_SECRET',
    'LINKEDIN_CLIENT_ID',
    'LINKEDIN_CLIENT_SECRET',
    'X_CLIENT_ID',
    'X_CLIENT_SECRET',
    'OPENAI_API_KEY',
    'STRIPE_SECRET_KEY',
    'SENTRY_DSN'
];

export function validateEnv(): EnvConfig {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required variables
    for (const varName of REQUIRED_VARS) {
        if (!process.env[varName]) {
            errors.push(`Missing required environment variable: ${varName}`);
        }
    }

    // Validate encryption key length (should be 32 bytes = 64 hex chars)
    if (process.env.ENCRYPTION_KEY) {
        const key = process.env.ENCRYPTION_KEY;
        if (key.length < 32) {
            errors.push('ENCRYPTION_KEY must be at least 32 characters long');
        }
    }

    // Validate URLs
    const urlVars = [
        'SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_APP_URL',
        'REDIS_URL'
    ];

    for (const varName of urlVars) {
        const value = process.env[varName];
        if (value && !isValidUrl(value)) {
            errors.push(`Invalid URL format for ${varName}: ${value}`);
        }
    }

    // Check optional but recommended variables
    for (const varName of OPTIONAL_VARS) {
        if (!process.env[varName]) {
            warnings.push(`Optional variable not set: ${varName}`);
        }
    }

    // Validate OAuth completeness
    const oauthProviders = [
        { name: 'Facebook', vars: ['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET', 'FACEBOOK_CALLBACK_URL'] },
        { name: 'LinkedIn', vars: ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET', 'LINKEDIN_CALLBACK_URL'] },
        { name: 'Twitter/X', vars: ['X_CLIENT_ID', 'X_CLIENT_SECRET', 'X_CALLBACK_URL'] }
    ];

    for (const provider of oauthProviders) {
        const hasAny = provider.vars.some(v => process.env[v]);
        const hasAll = provider.vars.every(v => process.env[v]);

        if (hasAny && !hasAll) {
            warnings.push(
                `Incomplete ${provider.name} OAuth configuration. ` +
                `Missing: ${provider.vars.filter(v => !process.env[v]).join(', ')}`
            );
        }
    }

    // Log results
    if (errors.length > 0) {
        console.error('\n❌ ENVIRONMENT VALIDATION FAILED\n');
        errors.forEach(err => console.error(`  • ${err}`));
        console.error('\nPlease check your .env file and ensure all required variables are set.\n');
        throw new Error('Environment validation failed');
    }

    if (warnings.length > 0 && process.env.NODE_ENV !== 'test') {
        console.warn('\n⚠️  ENVIRONMENT WARNINGS\n');
        warnings.forEach(warn => console.warn(`  • ${warn}`));
        console.warn('\nSome optional features may not work without these variables.\n');
    }

    console.log('✅ Environment validation passed\n');

    return process.env as unknown as EnvConfig;
}

function isValidUrl(urlString: string): boolean {
    try {
        new URL(urlString);
        return true;
    } catch {
        // For Redis URLs, check basic format
        if (urlString.startsWith('redis://') || urlString.startsWith('rediss://')) {
            return true;
        }
        return false;
    }
}

// Export validated environment
export const env = validateEnv();
