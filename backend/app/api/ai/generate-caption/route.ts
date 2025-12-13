import { NextRequest } from 'next/server';
import { generateCaption } from '../../../../lib/ai/caption-generator';
import { withErrorHandler, normalizeResponse } from '../../../../middleware/error';
import { ValidationError } from '../../../../lib/errors';

export const POST = withErrorHandler(async (req: Request) => {
    const { prompt, platform, tone } = await req.json();

    if (!prompt || !platform || !tone) {
        throw new ValidationError("Missing required parameters: prompt, platform, tone");
    }

    const result = await generateCaption(prompt, platform, tone);
    return normalizeResponse(result);
});
