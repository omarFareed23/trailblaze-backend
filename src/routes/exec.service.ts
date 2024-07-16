import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

@Injectable()
export class ExecService {
  async runExecutable(
    command: string,
    args: string[],
  ): Promise<{ stdout: string; stderr: string }> {
    // Join the command and the arguments into a single command string
    const fullCommand = `${command} ${args.join(' ')}`;

    try {
      const { stdout, stderr } = await promisify(exec)(fullCommand);
      return { stdout, stderr };
    } catch (error) {
      throw new Error(`Error executing command: ${error.message}`);
    }
  }
}
