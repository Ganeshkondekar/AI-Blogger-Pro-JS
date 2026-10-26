import { chat } from '../utils/api';

/**
 * Optimizes the blog article for search engines, adds meta description, and refines headings.
 * @param {string} blog 
 * @param {object} [options] 
 * @returns {Promise<string>}
 */
export async function seoOptimize(blog, options = {}) {
  const { keyword = '' } = options;

  const prompt = `
You are an SEO expert.

Improve the following blog for SEO and organic visibility.
${keyword ? `Primary Target Keyword: ${keyword}` : ''}

Tasks:
- Ensure the Title is high-CTR and includes the target keyword
- Improve headings (H2, H3) for search intent and readability
- Add a prominent blockquote at the beginning with "**Meta Description:** [150-160 characters summary with keywords]"
- Enhance flow, transitions, and bullet points
- Keep the core content and factual meaning unchanged

Blog:
${blog}

Return only the optimized blog in clean Markdown.
`.trim();

  return await chat(prompt, { maxTokens: 3500 });
}
