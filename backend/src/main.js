import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend communication
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = config.port || 3001;
  await app.listen(port);
  console.log(`🤖 AI Blogger Pro Backend running on http://localhost:${port}`);
  console.log(`📡 REST API Endpoints:`);
  console.log(`   - POST http://localhost:${port}/api/blog/generate`);
  console.log(`   - GET  http://localhost:${port}/api/blog/history`);
  console.log(`   - GET  http://localhost:${port}/api/blog/:id`);
  console.log(`   - GET  http://localhost:${port}/api/health`);
}

bootstrap();
