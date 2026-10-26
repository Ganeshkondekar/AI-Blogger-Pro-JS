import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlogController } from './controllers/blog.controller';
import { BlogService } from './services/blog.service';
import { DatabaseService } from './database/database.service';
import { SeoAnalyzerService } from './services/seo-analyzer.service';

@Module({
  imports: [],
  controllers: [AppController, BlogController],
  providers: [AppService, DatabaseService, SeoAnalyzerService, BlogService],
})
export class AppModule {}
