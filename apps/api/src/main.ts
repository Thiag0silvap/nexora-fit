import { NestFactory } from '@nestjs/core';
import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'http://192.168.3.12:3001',
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const fields = errors.map((error) => error.property).filter(Boolean);
        const suffix = fields.length ? ` Campos: ${fields.join(', ')}.` : '';
        return new BadRequestException(`Dados inválidos. Verifique os campos informados.${suffix}`);
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
