# Environment Configuration Setup

This document explains how to configure environment variables for the StudyMate app.

## Environment Variables

The app uses environment variables to securely store configuration values like API keys and database URLs.

### Required Variables

Create a `.env` file in the project root with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration  
AI_api_key=your_openai_api_key
AI_BASE_URL=https://api.openai.com/v1
```

### How to Get These Values

1. **Supabase URL & Anon Key:**
   - Go to your [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Go to Settings > API
   - Copy the Project URL and anon/public key

2. **OpenAI API Key:**
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key (starts with `sk-`)

## Configuration Files

### Environment Loading
- **Production:** Uses `app.config.js` with `expo-constants`
- **Development:** Uses `dotenv` for local development
- **Validation:** Automatic validation on app start

### Key Files
- `.env` - Environment variables (local development)
- `config/environment.js` - Environment configuration utility
- `config/api-config.js` - API configuration using environment variables
- `app.config.js` - Expo configuration with environment variables

## Usage in Code

### Import Configuration
```javascript
import { ENV_CONFIG, getSupabaseConfig } from './config/environment';

// Get Supabase config
const { url, anonKey } = getSupabaseConfig();

// Get individual values
const openaiKey = ENV_CONFIG.OPENAI_API_KEY;
```

### Validate Configuration
```javascript
import { validateEnvironment } from './config/environment';

if (!validateEnvironment()) {
  console.error('Environment validation failed!');
}
```

## Development Tools

### Check Environment Variables
```bash
pnpm run check-env
```

This command will verify that all required environment variables are set.

### Validation
- The app automatically validates environment variables on startup
- Missing variables are logged with clear error messages
- Development mode shows detailed configuration status

## Security Notes

### ⚠️ Important Security Practices

1. **Never commit `.env` files** - Added to `.gitignore`
2. **Don't hardcode sensitive values** - Always use environment variables
3. **Use different keys for different environments** - Separate dev/prod configurations
4. **Rotate API keys regularly** - Update keys periodically

### Environment-Specific Configuration

- **Development:** Uses `.env` file with `dotenv`
- **Production:** Uses build-time environment variables
- **Testing:** Can override with test-specific values

## Troubleshooting

### Common Issues

1. **"Environment variable not found"**
   - Ensure `.env` file exists in project root
   - Check variable names match exactly
   - Run `pnpm run check-env` to verify

2. **"Configuration validation failed"**
   - Check that all required variables are set
   - Ensure values are not placeholder text
   - Verify API keys are valid

3. **"Module not found: dotenv"**
   - Run `pnpm install` to install dependencies
   - Ensure `dotenv` is in devDependencies

### Debug Steps

1. Run environment check: `pnpm run check-env`
2. Check console logs for validation messages
3. Verify `.env` file location and format
4. Test with minimal configuration first

## Migration from Hardcoded Values

If you're migrating from hardcoded values:

1. ✅ **Created** `.env` file with your values
2. ✅ **Updated** `lib/supabase.js` to use environment variables
3. ✅ **Updated** `config/api-config.js` to use environment variables
4. ✅ **Added** validation and error handling
5. ✅ **Created** development tools for testing

The hardcoded values have been replaced with secure environment variable loading!