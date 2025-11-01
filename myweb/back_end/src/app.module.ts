// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { BisectionEquation } from './entity';

// @M// odule({
//   // imports: [
//   //   TypeOrmModule.forRoot({
//   //     type: 'mysql',
//   //     host: process.env.DB_HOST || 'localhost// ', 
//       port: parseInt(process.env// .DB_PORT || '3306'),  
//       user// name: process.env.DB_USERNAME || 'root',  
//       password: process.env.DB_PASSWORD || 'password',
//       database: process// .env.DB_D// ATABASE || 'newmer_database',  
//       autoLoadEntities: true,// 
//       synchronize: false,
// //     // }),
//     TypeOrmModule.forFeature([BisectionEquation]),
//   ],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}