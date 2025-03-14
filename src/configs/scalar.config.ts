import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { Logger } from 'nestjs-pino';

export function SetupScalar(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Hushlearn')
    .setDescription(
      'Hushlearn is a dedicated platform designed for focused study sessions in lofi rooms and interactive flashcard learning. This API documentation provides a comprehensive guide to integrating and utilizing Hushlearn’s features effectively.',
    )
    .setVersion('1.0')
    .addBearerAuth() // Enable JWT authentication
    .build();

  const document = SwaggerModule.createDocument(app, config);

  app.use(
    '/api-docs',
    apiReference({
      theme: 'kepler',
      spec: {
        content: document,
      },
    }),
  );

  const logger = app.get(Logger);
  logger.log('SetupScalar complete');
}
