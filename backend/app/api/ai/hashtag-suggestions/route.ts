
import { NextResponse } from 'next/server';
import { getUser } from '@/middleware/auth';
import { generateHashtags } from '@/lib/ai/hashtag-generator';
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
        const allowed = await checkRateLimit(user.id, 'ai-hashtag-suggestions');
        if (!allowed) {
            const status = await getRateLimitStatus(user.id, 'ai-hashtag-suggestions');
            return NextResponse.json({
                error: 'Rate limit exceeded',
                rateLimit: status
            }, { status: 429 });
        }

        const body = await req.json();
        const { caption, platform, niche } = body;

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

        const nicheValue = niche || 'general';

        try {
            const hashtags = await generateHashtags(caption, platform, nicheValue);

            // Estimate token usage
            const estimatedTokens = Math.ceil((caption.length + hashtags.join(' ').length) / 4);
            await logTokenUsage(user.id, 'hashtag-suggestions', estimatedTokens);

            const rateLimitStatus = await getRateLimitStatus(user.id, 'ai-hashtag-suggestions');

            return NextResponse.json({
                success: true,
                hashtags,
                metadata: {
                    platform,
                    niche: nicheValue,
                    count: hashtags.length,
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

            // Graceful failure with generic hashtags
            const fallbackHashtags = [
                '#socialmedia',
                '#content',
                '#marketing',
                '#digital',
                '#engagement'
            ];

            return NextResponse.json({
                error: 'AI service temporarily unavailable',
                message: 'Using fallback hashtags',
                hashtags: fallbackHashtags,
                isFallback: true
            }, { status: 200 }); // Return 200 with fallback data
        }

    } catch (error: any) {
        console.error('Hashtag suggestions error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error.message
        }, { status: 500 });
    }
}
