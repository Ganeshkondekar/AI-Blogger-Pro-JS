import { Injectable, Dependencies, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { SeoAnalyzerService } from './seo-analyzer.service';
import { researchTopic } from '../agents/research.agent';
import { createOutline } from '../agents/planner.agent';
import { writeBlog } from '../agents/writer.agent';
import { seoOptimize } from '../agents/seo.agent';
import { config } from '../config';

@Injectable()
@Dependencies(DatabaseService, SeoAnalyzerService)
export class BlogService {
  constructor(databaseService, seoAnalyzerService) {
    this.databaseService = databaseService;
    this.seoAnalyzerService = seoAnalyzerService;
  }

  /**
   * Orchestrates the 4-stage AI agent pipeline to research, plan, write, and optimize a blog.
   */
  async generateBlog(dto) {
    const { topic, keyword = '', tone = 'Professional & Informative', customInstructions = '' } = dto || {};

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      throw new BadRequestException('Blog topic is required.');
    }

    const cleanTopic = topic.trim();
    const cleanKeyword = (keyword || '').trim();
    const cleanTone = (tone || 'Professional & Informative').trim();

    const stages = [
      { id: 'research', name: 'Research Agent', status: 'pending', durationMs: 0 },
      { id: 'planner', name: 'Planning Agent', status: 'pending', durationMs: 0 },
      { id: 'writer', name: 'Writing Agent', status: 'pending', durationMs: 0 },
      { id: 'seo', name: 'SEO Optimization Agent', status: 'pending', durationMs: 0 },
    ];

    let researchOutput = '';
    let outlineOutput = '';
    let draftBlog = '';
    let finalBlog = '';

    // Stage 1: Research
    const t0 = Date.now();
    try {
      stages[0].status = 'active';
      researchOutput = await researchTopic(cleanTopic, cleanKeyword);
      stages[0].status = 'completed';
      stages[0].durationMs = Date.now() - t0;
    } catch (err) {
      stages[0].status = 'error';
      stages[0].error = err.message;
      throw new Error(`Research Agent failed: ${err.message}`);
    }

    // Stage 2: Planning
    const t1 = Date.now();
    try {
      stages[1].status = 'active';
      outlineOutput = await createOutline(cleanTopic, researchOutput, {
        keyword: cleanKeyword,
        tone: cleanTone,
      });
      stages[1].status = 'completed';
      stages[1].durationMs = Date.now() - t1;
    } catch (err) {
      stages[1].status = 'error';
      stages[1].error = err.message;
      throw new Error(`Planner Agent failed: ${err.message}`);
    }

    // Stage 3: Writing
    const t2 = Date.now();
    try {
      stages[2].status = 'active';
      draftBlog = await writeBlog(outlineOutput, {
        keyword: cleanKeyword,
        tone: cleanTone,
      });
      stages[2].status = 'completed';
      stages[2].durationMs = Date.now() - t2;
    } catch (err) {
      stages[2].status = 'error';
      stages[2].error = err.message;
      throw new Error(`Writer Agent failed: ${err.message}`);
    }

    // Stage 4: SEO Optimization
    const t3 = Date.now();
    try {
      stages[3].status = 'active';
      finalBlog = await seoOptimize(draftBlog, {
        keyword: cleanKeyword,
      });
      stages[3].status = 'completed';
      stages[3].durationMs = Date.now() - t3;
    } catch (err) {
      stages[3].status = 'error';
      stages[3].error = err.message;
      throw new Error(`SEO Agent failed: ${err.message}`);
    }

    // Stage 5: SEO Quality Analysis
    const seoMetrics = this.seoAnalyzerService.analyze(finalBlog, cleanKeyword);

    // Persist
    const saved = await this.databaseService.saveBlog({
      topic: cleanTopic,
      keyword: cleanKeyword,
      tone: cleanTone,
      content: finalBlog,
      outline: outlineOutput,
      research: researchOutput,
      seoScore: seoMetrics.score,
      metadata: {
        model: config.model,
        stages,
        seoMetrics,
        customInstructions,
      },
    });

    return {
      id: saved.id,
      topic: cleanTopic,
      keyword: cleanKeyword,
      tone: cleanTone,
      content: finalBlog,
      outline: outlineOutput,
      research: researchOutput,
      seo: seoMetrics,
      stages,
      model: config.model,
      createdAt: saved.created_at,
    };
  }

  async getHistory(limit = 20) {
    return await this.databaseService.getBlogs(limit);
  }

  async getBlogById(id) {
    return await this.databaseService.getBlogById(id);
  }

  getSystemStatus() {
    return {
      status: 'operational',
      model: config.model,
      hasOpenRouterKey: Boolean(config.apiKey),
      hasTavilyKey: Boolean(config.tavilyApiKey),
      database: this.databaseService.getStatus(),
      nodeVersion: process.version,
    };
  }
}
