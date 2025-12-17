import { NextRequest } from 'next/server';
import { generateHashtags } from '../../../../lib/ai/hashtag-generator';
import { withErrorHandler, normalizeResponse } from '../../../../middleware/error';
import { ValidationError } from '../../../../lib/errors';

export const POST = withErrorHandler(async (req: Request) => {
    const { caption, platform, niche } = await req.json();

    if (!caption || !platform || !niche) {
        throw new ValidationError("Missing required parameters: caption, platform, niche");
    }

    const result = await generateHashtags(caption, platform, niche);
    return normalizeResponse(result);
});
