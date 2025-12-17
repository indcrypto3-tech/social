
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY is not set in environment variables.');
}

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
    // In development, we might not have the key, so we prevent crashing immediately
    // but calls will fail if not set.
});
