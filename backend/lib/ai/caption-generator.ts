
import { openai } from './openai';

export type Tone = 'Professional' | 'Casual' | 'Viral' | 'Storytelling' | 'Minimal';

export async function generateCaption(
    prompt: string,
    platform: string,
    tone: Tone
): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API Key is missing');
    }

    const systemPrompt = `You are an expert social media copywriter.
Target Platform: ${platform}
Tone: ${tone}

Your goal is to write a single, high-converting caption based on the user's input.
- Keep it optimized for the platform (e.g., short for Twitter, visual description for Instagram).
- Use the specified tone.
- Do NOT include hashtags in the caption itself (unless typical for the style), we generate them separately.
- Return ONLY the caption text, no quotes or explanations.`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 500,
        });

        const caption = response.choices[0]?.message?.content?.trim();
        return caption || 'Failed to generate caption.';
    } catch (error) {
        console.error('Error generating caption:', error);
        throw new Error('Failed to generate caption. Please try again.');
    }
}
