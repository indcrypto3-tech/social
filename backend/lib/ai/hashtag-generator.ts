
import { openai } from './openai';

export async function generateHashtags(
    caption: string,
    platform: string,
    niche: string
): Promise<string[]> {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API Key is missing');
    }

    const systemPrompt = `You are a social media growth expert.
Target Platform: ${platform}
Niche: ${niche}

Based on the provided caption/context, generate 10-20 highly relevant, high-reach hashtags.
- Mix high-volume and niche-specific hashtags.
- Respect platform limits.
- Return ONLY the hashtags, separated by spaces or newlines. No numbering or bullet points.`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Caption: "${caption}"` }
            ],
            temperature: 0.7,
            max_tokens: 200,
        });

        const content = response.choices[0]?.message?.content?.trim();
        if (!content) return [];

        // Extract hashtags using regex to be safe
        const hashtags = content.match(/#[a-zA-Z0-9_]+/g) || [];
        // Deduplicate
        return Array.from(new Set(hashtags)).slice(0, 20);
    } catch (error) {
        console.error('Error generating hashtags:', error);
        throw new Error('Failed to generate hashtags.');
    }
}
