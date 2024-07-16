// import { Repository, EntityRepository } from 'typeorm';
// import { WayDetails } from './way-details.entity';

// @EntityRepository(WayDetails)
// export class WayDetailsRepository extends Repository<WayDetails> {
//   async findOneOrCreate(wayId: string, timestamp: number): Promise<WayDetails> {
//     // Attempt to find the existing WayDetails
//     let wayDetails = await this.findOneBy({
//       wayId,
//       timestamp,
//     });

//     // If it doesn't exist, create a new instance
//     if (!wayDetails) {
//       wayDetails = new WayDetails();
//       wayDetails.wayId = wayId;
//       wayDetails.timestamp = timestamp;
//       wayDetails = await this.save(wayDetails); // Save the new entity to the database
//     }

//     return wayDetails;
//   }
// }
