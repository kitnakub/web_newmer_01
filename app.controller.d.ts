import { AppService } from './app.service';
import { BisectionEquation } from './entity';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
    gettest(): Promise<BisectionEquation[]>;
    NewtonRaphson(type: string): Promise<BisectionEquation[]>;
}
