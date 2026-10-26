import { chat } from '../utils/api';

/**
 * Creates an SEO-friendly blog outline based on research and tone.
 * @param {string} topic 
 * @param {string} research 
 * @param {object} [options] 
 * @returns {Promise<string>}
 */
export async function createOutline(topic, research, options = {}) {
  const { keyword = '', tone = 'Professional & Informative' } = options;

  const prompt = `
You are an expert SEO content planner.

Topic:
${topic}

Target Keyword:
${keyword || topic}

Desired Tone:
${tone}

Research:
${research}

Create a detailed SEO-friendly outline.

Include:
- Catchy SEO-optimized Title
- Engaging Introduction hook
- 5-8 H2 headings targeted to user search intent
- H3 subheadings with key talking points under each H2
- Actionable Conclusion and Call to Action

Return only the outline in clean Markdown.
`.trim();

  return await chat(prompt);
}
