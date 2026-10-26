import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend folder or root
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  apiKey: process.env.OPENROUTER_API_KEY || '',
  model: process.env.MODEL || 'openai/gpt-4.1-mini',
  baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1/chat/completions',
  tavilyApiKey: process.env.TAVILY_API_KEY || '',
  port: parseInt(process.env.PORT, 10) || 3001,
  databaseUrl: process.env.DATABASE_URL || '',
};
