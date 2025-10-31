// import { Injectable } from '@nestjs/common';
// import e from 'express';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { BisectionEquation } from './entity';


// @Injectable()
// export class AppService {
//   constructor(
//     @InjectRepository(BisectionEquation)
//     private studentRepo: Repository<BisectionEquation>,
//   ){}
  
//   gettest(): Promise<BisectionEquation[]> {
//     return this.studentRepo.find();
//   }
//   getNewtonRaphson(type: string): Promise<BisectionEquation[]> {
//     return this.studentRepo.find({ where: { Type:type } });
//   }
// }
