import { config } from '../config';

/**
 * Executes a chat completion prompt against OpenRouter API.
 * Uses native fetch (Node 18+).
 * @param {string} prompt 
 * @param {object} options 
 * @returns {Promise<string>}
 */
export async function chat(prompt, options = {}) {
  const apiKey = options.apiKey || config.apiKey;
  const model = options.model || config.model;
  const baseUrl = options.baseUrl || config.baseUrl;

  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY is not configured. Please set OPENROUTER_API_KEY in .env.'
    );
  }

  const payload = {
    model: model,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: options.maxTokens || 2500,
    temperature: options.temperature ?? 0.7,
  };

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://localhost:3000',
    'X-Title': 'AI Blogger Pro JS',
  };

  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let parsedMessage = errorBody;
    try {
      const errJson = JSON.parse(errorBody);
      parsedMessage = errJson.error?.message || errJson.message || errorBody;
    } catch {
      // ignore json parse error
    }
    throw new Error(`OpenRouter API error (${response.status}): ${parsedMessage}`);
  }

  const data = await response.json();
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid response structure received from OpenRouter API');
  }

  return data.choices[0].message.content;
}
