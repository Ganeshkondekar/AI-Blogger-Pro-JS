import { webSearch } from '../utils/search';

/**
 * Researches a topic using Tavily Search or curated web synthesis.
 * @param {string} topic 
 * @param {string} [keyword] 
 * @returns {Promise<string>}
 */
export async function researchTopic(topic, keyword = '') {
  const searchQuery = keyword ? `${topic} ${keyword}` : topic;
  const data = await webSearch(searchQuery);

  let research = '';

  if (data && Array.isArray(data.results)) {
    for (const item of data.results.slice(0, 5)) {
      research += `
Title: ${item.title || ''}

Content:
${item.content || ''}

Source:
${item.url || ''}

------------------------------------
`;
    }
  }

  return research.trim();
}
