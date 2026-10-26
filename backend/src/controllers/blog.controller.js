import {
  Controller,
  Dependencies,
  Bind,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { BlogService } from '../services/blog.service';

@Controller('api')
@Dependencies(BlogService)
export class BlogController {
  constructor(blogService) {
    this.blogService = blogService;
  }

  @Get('health')
  getHealth() {
    return this.blogService.getSystemStatus();
  }

  @Post('blog/generate')
  @Bind(Body())
  @HttpCode(HttpStatus.OK)
  async generateBlog(body) {
    if (!body || !body.topic || typeof body.topic !== 'string' || !body.topic.trim()) {
      throw new BadRequestException('A non-empty "topic" field is required in the request body.');
    }
    return await this.blogService.generateBlog(body);
  }

  @Get('blog/history')
  @Bind(Query('limit'))
  async getHistory(limit) {
    const numLimit = parseInt(limit, 10) || 20;
    return await this.blogService.getHistory(numLimit);
  }

  @Get('blog/:id')
  @Bind(Param('id'))
  async getBlogById(id) {
    const blog = await this.blogService.getBlogById(id);
    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} was not found.`);
    }
    return blog;
  }
}
