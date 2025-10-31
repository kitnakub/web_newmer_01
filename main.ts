





//  ทำตอน test กัย อ. newmer นะคับ





import { Module, Controller, Get, Injectable, Param } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { TypeOrmModule, InjectRepository } from '@nestjs/typeorm';
import { Repository, Entity, PrimaryGeneratedColumn, Column } from 'typeorm';


@Entity('bisection_equations')
export class tap_com {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;
  @Column({ type: 'varchar', length: 255 })
  equation: string;
  @Column({ name: 'Type', type: 'varchar', length: 50 })
  type: string;  
  @Column({ type: 'double' })
  A: number;
  @Column({ type: 'double' })
  B: number;
  @Column({ type: 'int', unsigned: true })
  N: number;    
}
@Injectable()              
export class AppService {
     constructor(
          @InjectRepository(tap_com)
          private readonly tap_comRepo: Repository<tap_com>,
     ){}
     Gettest(type:string):Promise<tap_com[]>{
          return this.tap_comRepo.find({where:{type:type}})
     }
}
@Controller()
export class AppController{
     constructor(private readonly appService:AppService){}

     @Get("equation/:type")
     async Gettest(@Param('type')type:string):Promise<tap_com[]>{
          return await this.appService.Gettest(type);
     }   
}
@Module({
     imports: [
          TypeOrmModule.forRoot({
               type: 'mysql',
               host: process.env.DB_HOST || 'db',
               port: parseInt(process.env.DB_PORT || '3306'),
               username: process.env.DB_USERNAME || 'root',
               password: process.env.DB_PASSWORD || 'password',
               database: process.env.DB_DATABASE || 'data_base',
               synchronize: false,
          }),
          TypeOrmModule.forFeature([tap_com]),
     ],
     controllers:[AppController],
     providers: [AppService],
})
export class AppModule{}
async function bootstrap(){
     const app = await NestFactory.create(AppModule);
     app.enableCors({
          origin: 'http://localhost:5173',
          methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
     });
     await app.listen(process.env.PORT ?? 3000);
     console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();