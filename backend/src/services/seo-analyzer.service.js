import { Injectable } from '@nestjs/common';

@Injectable()
export class SeoAnalyzerService {
  /**
   * Evaluates blog markdown content and returns SEO metrics and score.
   * @param {string} content 
   * @param {string} [keyword] 
   * @returns {object}
   */
  analyze(content, keyword = '') {
    if (!content || typeof content !== 'string') {
      return {
        score: 0,
        wordCount: 0,
        readingTimeMinutes: 0,
        headings: { h1: 0, h2: 0, h3: 0 },
        keywordMetrics: { keyword: '', count: 0, densityPercent: 0 },
        hasMetaDescription: false,
        recommendations: ['No content provided to analyze.'],
      };
    }

    const words = content.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

    // Headings analysis
    const h1Matches = content.match(/^#\s+[^\n]+/gm) || [];
    const h2Matches = content.match(/^##\s+[^\n]+/gm) || [];
    const h3Matches = content.match(/^###\s+[^\n]+/gm) || [];

    // Meta description detection
    const metaMatch = content.match(/meta\s*description[:*_\s]+([^\n]+)/i);
    const hasMetaDescription = Boolean(metaMatch);
    const metaDescriptionText = metaMatch ? metaMatch[1].replace(/[*_]/g, '').trim() : '';

    // Keyword metrics
    let keywordCount = 0;
    let keywordDensity = 0;
    if (keyword && keyword.trim()) {
      const cleanKw = keyword.trim().toLowerCase();
      const regex = new RegExp(`\\b${cleanKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = content.match(regex);
      keywordCount = matches ? matches.length : 0;
      keywordDensity = wordCount > 0 ? Number(((keywordCount / wordCount) * 100).toFixed(2)) : 0;
    }

    // Scoring calculation (out of 100)
    let score = 0;
    const recommendations = [];

    // 1. Length (up to 30 pts)
    if (wordCount >= 1000) {
      score += 30;
      recommendations.push('✓ Excellent article length (>1,000 words)');
    } else if (wordCount >= 500) {
      score += 20;
      recommendations.push('✓ Good article length (>500 words)');
    } else if (wordCount >= 250) {
      score += 10;
      recommendations.push('⚠️ Content is slightly brief. Expand for higher search ranking.');
    } else {
      recommendations.push('⚠️ Content too short (<250 words). Add more depth and sections.');
    }

    // 2. Heading Structure (up to 25 pts)
    if (h1Matches.length === 1) {
      score += 10;
      recommendations.push('✓ Exactly one H1 main heading found');
    } else if (h1Matches.length > 1) {
      score += 5;
      recommendations.push('⚠️ Multiple H1 tags found. Consider using only one primary H1.');
    } else {
      recommendations.push('⚠️ Missing H1 title heading.');
    }

    if (h2Matches.length >= 3) {
      score += 15;
      recommendations.push(`✓ Well-structured with ${h2Matches.length} H2 sections`);
    } else if (h2Matches.length > 0) {
      score += 8;
      recommendations.push('⚠️ Consider adding more H2 subheadings to organize topics.');
    } else {
      recommendations.push('⚠️ Missing H2 subheadings.');
    }

    // 3. Meta Description (up to 20 pts)
    if (hasMetaDescription) {
      const len = metaDescriptionText.length;
      if (len >= 120 && len <= 165) {
        score += 20;
        recommendations.push('✓ Optimal meta description length (120-165 chars)');
      } else {
        score += 15;
        recommendations.push(`✓ Meta description present (${len} chars)`);
      }
    } else {
      recommendations.push('⚠️ Meta description not detected. Add a 150-160 character snippet.');
    }

    // 4. Keyword Optimization (up to 25 pts)
    if (keyword && keyword.trim()) {
      if (keywordDensity >= 0.5 && keywordDensity <= 2.5) {
        score += 25;
        recommendations.push(`✓ Ideal keyword density: ${keywordDensity}% (${keywordCount} occurrences)`);
      } else if (keywordDensity > 2.5) {
        score += 12;
        recommendations.push(`⚠️ Keyword density high (${keywordDensity}%). Avoid keyword stuffing.`);
      } else if (keywordCount > 0) {
        score += 15;
        recommendations.push(`⚠️ Keyword density low (${keywordDensity}%). Mention the target keyword in more sections.`);
      } else {
        recommendations.push('⚠️ Target keyword was not found in the content body.');
      }
    } else {
      score += 20; // Default when no specific target keyword provided
      recommendations.push('ℹ️ Specify a target keyword to evaluate search density.');
    }

    return {
      score: Math.min(100, score),
      wordCount,
      readingTimeMinutes,
      headings: {
        h1: h1Matches.length,
        h2: h2Matches.length,
        h3: h3Matches.length,
      },
      hasMetaDescription,
      metaDescription: metaDescriptionText || null,
      keywordMetrics: {
        keyword: keyword || '',
        count: keywordCount,
        densityPercent: keywordDensity,
      },
      recommendations,
    };
  }
}
