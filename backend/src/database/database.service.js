import { Injectable, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { config } from '../config';

@Injectable()
export class DatabaseService {
  constructor() {
    this.pool = null;
    this.isPostgresConnected = false;
    this.storageDir = path.resolve(__dirname, '../../output');
    this.storageFile = path.join(this.storageDir, 'blogs.json');
    this.memoryBlogs = [];
  }

  async onModuleInit() {
    this.initFileStorage();
    await this.initPostgres();
  }

  initFileStorage() {
    try {
      if (!fs.existsSync(this.storageDir)) {
        fs.mkdirSync(this.storageDir, { recursive: true });
      }
      if (fs.existsSync(this.storageFile)) {
        const data = fs.readFileSync(this.storageFile, 'utf8');
        this.memoryBlogs = JSON.parse(data || '[]');
      } else {
        fs.writeFileSync(this.storageFile, '[]', 'utf8');
      }
    } catch (err) {
      console.warn('File storage init warning:', err.message);
    }
  }

  async initPostgres() {
    if (!config.databaseUrl) {
      console.log('PostgreSQL: No DATABASE_URL specified. Using local persistence fallback.');
      return;
    }

    try {
      this.pool = new Pool({
        connectionString: config.databaseUrl,
        connectionTimeoutMillis: 3000,
      });

      const client = await this.pool.connect();
      await client.query(`
        CREATE TABLE IF NOT EXISTS blogs (
          id SERIAL PRIMARY KEY,
          topic VARCHAR(500) NOT NULL,
          keyword VARCHAR(255),
          tone VARCHAR(100),
          content TEXT NOT NULL,
          outline TEXT,
          research TEXT,
          seo_score INTEGER DEFAULT 0,
          metadata JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      client.release();
      this.isPostgresConnected = true;
      console.log('PostgreSQL: Connected successfully and ensured blogs table exists.');
    } catch (err) {
      this.isPostgresConnected = false;
      console.warn(
        `PostgreSQL: Connection to ${config.databaseUrl} failed (${err.message}). Seamlessly using local storage.`
      );
    }
  }

  async saveBlog({ topic, keyword, tone, content, outline, research, seoScore = 0, metadata = {} }) {
    const timestamp = new Date().toISOString();

    // Save individual markdown file like original Python helpers.py
    try {
      const sanitizedName = topic.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 50);
      const mdFilename = `${Date.now()}_${sanitizedName}.md`;
      const mdPath = path.join(this.storageDir, mdFilename);
      fs.writeFileSync(mdPath, content, 'utf8');
    } catch (err) {
      console.warn('Failed to save standalone markdown file:', err.message);
    }

    if (this.isPostgresConnected && this.pool) {
      try {
        const query = `
          INSERT INTO blogs (topic, keyword, tone, content, outline, research, seo_score, metadata, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
          RETURNING *;
        `;
        const values = [
          topic,
          keyword || null,
          tone || 'Professional',
          content,
          outline || null,
          research || null,
          seoScore,
          JSON.stringify(metadata),
        ];
        const res = await this.pool.query(query, values);
        return res.rows[0];
      } catch (err) {
        console.warn('Postgres insert error, saving to file storage:', err.message);
      }
    }

    // Fallback file/memory storage
    const newEntry = {
      id: Date.now().toString(),
      topic,
      keyword: keyword || '',
      tone: tone || 'Professional',
      content,
      outline: outline || '',
      research: research || '',
      seo_score: seoScore,
      metadata,
      created_at: timestamp,
    };

    this.memoryBlogs.unshift(newEntry);
    try {
      fs.writeFileSync(this.storageFile, JSON.stringify(this.memoryBlogs.slice(0, 100), null, 2), 'utf8');
    } catch (err) {
      console.warn('Could not write to blogs.json:', err.message);
    }

    return newEntry;
  }

  async getBlogs(limit = 20) {
    if (this.isPostgresConnected && this.pool) {
      try {
        const res = await this.pool.query(
          'SELECT id, topic, keyword, tone, seo_score, created_at, SUBSTRING(content FROM 1 FOR 200) as preview FROM blogs ORDER BY created_at DESC LIMIT $1',
          [limit]
        );
        return res.rows;
      } catch (err) {
        console.warn('Postgres getBlogs error, using file storage fallback:', err.message);
      }
    }

    return this.memoryBlogs.slice(0, limit).map((b) => ({
      id: b.id,
      topic: b.topic,
      keyword: b.keyword,
      tone: b.tone,
      seo_score: b.seo_score,
      created_at: b.created_at,
      preview: b.content ? b.content.slice(0, 200) : '',
    }));
  }

  async getBlogById(id) {
    if (this.isPostgresConnected && this.pool) {
      try {
        const res = await this.pool.query('SELECT * FROM blogs WHERE id = $1', [id]);
        if (res.rows.length > 0) return res.rows[0];
      } catch (err) {
        console.warn('Postgres getBlogById error:', err.message);
      }
    }

    return this.memoryBlogs.find((b) => String(b.id) === String(id)) || null;
  }

  getStatus() {
    return {
      postgresConnected: this.isPostgresConnected,
      storageType: this.isPostgresConnected ? 'PostgreSQL' : 'Local File Persistence',
      blogsCount: this.memoryBlogs.length,
    };
  }
}
