import { chat } from '../utils/api';

/**
 * Drafts the complete blog article based on the outline.
 * @param {string} outline 
 * @param {object} [options] 
 * @returns {Promise<string>}
 */
export async function writeBlog(outline, options = {}) {
  const { tone = 'Professional & Engaging', keyword = '' } = options;

  const prompt = `
You are a professional blog writer.

Tone:
${tone}

${keyword ? `Target Primary Keyword:\n${keyword}\n` : ''}
Using the outline below, write a complete, engaging, in-depth, and SEO-friendly blog article.
Format the output in clean Markdown with clear headings (#, ##, ###), bullet points, and strong readability.

Outline:
${outline}

Return only the final blog article in Markdown without markdown code fences.
`.trim();

  return await chat(prompt, { maxTokens: 3000 });
}
