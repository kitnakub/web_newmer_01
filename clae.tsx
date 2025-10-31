
// import { Module, Controller, Get, Injectable, Param } from '@nestjs/common';
// import { NestFactory } from '@nestjs/core';
// import { TypeOrmModule, InjectRepository } from '@nestjs/typeorm';
// import { Repository, Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// @Entity('bisection_equations')
// export class BisectionEquation {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column({ type: 'varchar', length: 255 })
//   equation: string;

//   @Column({ type: 'varchar', length: 255 })
//   Type: string;
// }


// @Injectable()
// export class AppService {
//   constructor(
//     @InjectRepository(BisectionEquation)
//     private readonly bisectionRepo: Repository<BisectionEquation>,
//   ) {}
//   gettest(): Promise<BisectionEquation[]> {
//     return this.bisectionRepo.find();
//   }
//   getNewtonRaphson(type: string): Promise<BisectionEquation[]> {
//     return this.bisectionRepo.find({ where: { Type: type } });
//   }
// }


// @Controller()
// export class AppController {
//   constructor(private readonly appService: AppService) {}

//   @Get("test")
//   async gettest(): Promise<BisectionEquation[]> {
//     return await this.appService.gettest();
//   }

//   @Get("equation/:type")
//   async NewtonRaphson(@Param('type') type: string): Promise<BisectionEquation[]> {
//     return await this.appService.getNewtonRaphson(type);
//   }
// }


// @Module({
//      imports:[
//           TypeOrmModule.forRoot({
//                type: 'mysql',
//                host: process.env.DB_HOST || 'db',
//                port: parseInt(process.env.DB_PORT || '3306'),
//                username: process.env.DB_USERNAME || 'root',
//                password: process.env.DB_PASSWORD || 'password',
//                database: process.env.DB_DATABASE || 'data_base',
//                entities: [BisectionEquation],
//                synchronize: false
//           }),
//           TypeOrmModule.forFeature([BisectionEquation]),
//      ],
//      controllers : [AppController],
//      providers: [AppService],
// })
// export class AppModule{}

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   app.enableCors({
//     origin: 'http://localhost:5173',
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
//   });
//   await app.listen(process.env.PORT ?? 3000);
//   console.log(`Application is running on: ${await app.getUrl()}`);
// }

// bootstrap();

// backendfile docker 

// FROM node:22-alpine AS builder
// WORKDIR /usr/src/app
// COPY package*.json ./
// RUN npm install
// COPY . .
// RUN npm run build
// FROM node:22-alpine
// WORKDIR /usr/src/app
// COPY --from=builder /usr/src/app/dist ./dist
// COPY --from=builder /usr/src/app/node_modules ./node_modules
// COPY --from=builder /usr/src/app/package.json ./package.json
// EXPOSE 3000
// CMD ["node", "dist/main"]

// ...

// FROM node:22
// WORKDIR /app
// COPY package*.json ./
// RUN npm install
// COPY . ./
// EXPOSE 5173
// CMD ["npm", "run", "dev", "--", "--host"]