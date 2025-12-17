
import { openai } from './openai';

export async function generateContentIdeas(
    niche: string,
    count: number = 5
): Promise<string[]> {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API Key is missing');
    }

    const systemPrompt = `You are a creative content strategist.
Niche: ${niche}

Generate ${count} engaging, viral-worthy social media post ideas for this niche.
- Ideas should be actionable.
- varied (educational, entertaining, promotional).
- Return as a clean list. No numbers at the start of lines, just the ideas separated by newlines.`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Give me ${count} content ideas.` }
            ],
            temperature: 0.8,
            max_tokens: 400,
        });

        const content = response.choices[0]?.message?.content?.trim();
        if (!content) return [];

        // Split by newline and clean up
        return content.split('\n')
            .map(line => line.replace(/^[\d-.\s]+/, '').trim())
            .filter(line => line.length > 0);
    } catch (error) {
        console.error('Error generating content ideas:', error);
        throw new Error('Failed to generate content ideas.');
    }
}
