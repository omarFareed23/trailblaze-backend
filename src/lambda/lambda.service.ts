import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Lambda } from 'aws-sdk';

@Injectable()
export class LambdaService {
  private lambda: Lambda;

  constructor(private configService: ConfigService) {
    // const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    // const secretAccessKey = this.configService.get<string>(what
    //   'AWS_ACCESS_SECRET_KEY',
    // );
    const region = 'us-east-1';

    this.lambda = new Lambda({
      // accessKeyId,
      // secretAccessKey,
      region,
    });
  }

  async invokeLambdaFunction(functionName: string, payload: any): Promise<any> {
    const params = {
      FunctionName: functionName,
      Payload: JSON.stringify(payload),
    };

    try {
      console.log('5');
      const result = await this.lambda.invoke(params).promise();
      console.log('6');
      return JSON.parse(result.Payload as string);
    } catch (error) {
      console.error('Error invoking Lambda function:', error);
      throw error;
    }
  }
}
