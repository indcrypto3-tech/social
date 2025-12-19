
import { NextResponse } from 'next/server';
import { getUser } from '@/middleware/auth';
import { generateCaption, Tone } from '@/lib/ai/caption-generator';
import { checkRateLimit, getRateLimitStatus } from '@/lib/rate-limit';
import { db } from '@/lib/db';

const MAX_PROMPT_LENGTH = 500;

// Simple token usage logger
async function logTokenUsage(userId: string, endpoint: string, tokensUsed: number) {
    console.log(`[AI_USAGE] User: ${userId}, Endpoint: ${endpoint}, Tokens: ${tokensUsed}`);
    // In production, you'd store this in a database table for analytics/billing
}

export async function POST(req: Request) {
    try {
        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Rate limiting
        const allowed = await checkRateLimit(user.id, 'ai-generate-caption');
        if (!allowed) {
            const status = await getRateLimitStatus(user.id, 'ai-generate-caption');
            return NextResponse.json({
                error: 'Rate limit exceeded',
                rateLimit: status
            }, { status: 429 });
        }

        const body = await req.json();
        const { prompt, platform, tone } = body;

        // Validation
        if (!prompt || !platform || !tone) {
            return NextResponse.json({
                error: 'Missing required fields: prompt, platform, tone'
            }, { status: 400 });
        }

        // Validate prompt size
        if (prompt.length > MAX_PROMPT_LENGTH) {
            return NextResponse.json({
                error: `Prompt too long. Maximum ${MAX_PROMPT_LENGTH} characters.`,
                maxLength: MAX_PROMPT_LENGTH
            }, { status: 400 });
        }

        // Validate tone
        const validTones: Tone[] = ['Professional', 'Casual', 'Viral', 'Storytelling', 'Minimal'];
        if (!validTones.includes(tone)) {
            return NextResponse.json({
                error: 'Invalid tone',
                validTones
            }, { status: 400 });
        }

        try {
            // Generate caption
            const caption = await generateCaption(prompt, platform, tone);

            // Estimate token usage (rough estimate: ~4 chars per token)
            const estimatedTokens = Math.ceil((prompt.length + caption.length) / 4);
            await logTokenUsage(user.id, 'generate-caption', estimatedTokens);

            // Get rate limit status for response headers
            const rateLimitStatus = await getRateLimitStatus(user.id, 'ai-generate-caption');

            return NextResponse.json({
                success: true,
                caption,
                metadata: {
                    platform,
                    tone,
                    estimatedTokens
                }
            }, {
                headers: {
                    'X-RateLimit-Limit': rateLimitStatus.limit.toString(),
                    'X-RateLimit-Remaining': rateLimitStatus.remaining.toString(),
                    'X-RateLimit-Reset': rateLimitStatus.resetIn.toString()
                }
            });

        } catch (aiError: any) {
            console.error('OpenAI error:', aiError);

            // Graceful failure
            return NextResponse.json({
                error: 'AI service temporarily unavailable',
                message: 'Please try again in a moment',
                fallback: prompt // Return original prompt as fallback
            }, { status: 503 });
        }

    } catch (error: any) {
        console.error('Generate caption error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error.message
        }, { status: 500 });
    }
}
