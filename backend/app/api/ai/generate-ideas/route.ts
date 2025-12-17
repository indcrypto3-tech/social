import { NextRequest } from 'next/server';
import { generateContentIdeas } from '../../../../lib/ai/content-ideas';
import { withErrorHandler, normalizeResponse } from '../../../../middleware/error';
import { ValidationError } from '../../../../lib/errors';

export const POST = withErrorHandler(async (req: Request) => {
    const { niche } = await req.json();

    if (!niche) {
        throw new ValidationError("Missing required parameter: niche");
    }

    const result = await generateContentIdeas(niche);
    return normalizeResponse(result);
});
