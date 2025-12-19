
import { NextResponse } from 'next/server';
import { getUser } from '@/middleware/auth';
import { openai } from '@/lib/ai/openai';
import { checkRateLimit, getRateLimitStatus } from '@/lib/rate-limit';

const MAX_CAPTION_LENGTH = 1000;

async function logTokenUsage(userId: string, endpoint: string, tokensUsed: number) {
    console.log(`[AI_USAGE] User: ${userId}, Endpoint: ${endpoint}, Tokens: ${tokensUsed}`);
}

export async function POST(req: Request) {
    try {
        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Rate limiting
        const allowed = await checkRateLimit(user.id, 'ai-improve-caption');
        if (!allowed) {
            const status = await getRateLimitStatus(user.id, 'ai-improve-caption');
            return NextResponse.json({
                error: 'Rate limit exceeded',
                rateLimit: status
            }, { status: 429 });
        }

        const body = await req.json();
        const { caption, platform, improvements } = body;

        // Validation
        if (!caption || !platform) {
            return NextResponse.json({
                error: 'Missing required fields: caption, platform'
            }, { status: 400 });
        }

        if (caption.length > MAX_CAPTION_LENGTH) {
            return NextResponse.json({
                error: `Caption too long. Maximum ${MAX_CAPTION_LENGTH} characters.`,
                maxLength: MAX_CAPTION_LENGTH
            }, { status: 400 });
        }

        try {
            const improvementInstructions = improvements || 'Make it more engaging and compelling';

            const systemPrompt = `You are an expert social media copywriter.
Target Platform: ${platform}

Your task is to improve the given caption based on these instructions: ${improvementInstructions}

Guidelines:
- Keep the core message intact
- Optimize for ${platform} best practices
- Make it more engaging and actionable
- Return ONLY the improved caption, no explanations`;

            const response = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Original caption: "${caption}"` }
                ],
                temperature: 0.7,
                max_tokens: 500,
            });

            const improvedCaption = response.choices[0]?.message?.content?.trim();

            if (!improvedCaption) {
                throw new Error('No response from AI');
            }

            // Log token usage
            const tokensUsed = response.usage?.total_tokens || 0;
            await logTokenUsage(user.id, 'improve-caption', tokensUsed);

            const rateLimitStatus = await getRateLimitStatus(user.id, 'ai-improve-caption');

            return NextResponse.json({
                success: true,
                original: caption,
                improved: improvedCaption,
                metadata: {
                    platform,
                    tokensUsed
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

            return NextResponse.json({
                error: 'AI service temporarily unavailable',
                message: 'Please try again in a moment',
                fallback: caption
            }, { status: 503 });
        }

    } catch (error: any) {
        console.error('Improve caption error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error.message
        }, { status: 500 });
    }
}
