import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { AppModule } from './app.module';
import { GlobalException } from './core/exception/global-exception';
import { jwtConstants } from './core/guard/guard-constants';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new GlobalException());
  app.useGlobalInterceptors(new AuthInterceptor());

  app.use(cookieParser());
  app.use(
    session({
      secret: jwtConstants.secret,
      resave: true,
      saveUninitialized: true,
      cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
      },
    }),
  );
  await app.listen(8094, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:8094`);
  });
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
