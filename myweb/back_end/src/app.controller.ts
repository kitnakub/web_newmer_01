// import { Controller, Get, Post } from '@nestjs/common';
// import { AppService } from './app.service';
// import { BisectionEquation } from './entity';
// import { Param } from '@nestjs/common';

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

// // API FRONT BLAK 