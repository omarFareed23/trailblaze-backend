import { Repository } from 'typeorm';
import { WayDetails } from './way-details.entity';

export class WayDetailsRepository extends Repository<WayDetails> {
  async findOneOrCreate(wayId: string, timestamp: number): Promise<WayDetails> {
    // Define the object with wayId and timestamp
    const newWayDetails = this.create({ wayId, timestamp });

    // Use upsert to either insert the new record or update the existing one
    await this.upsert(newWayDetails, ['wayId', 'timestamp']);

    // Return the created or updated entity
    return this.findOneBy({ wayId, timestamp });
  }
}
