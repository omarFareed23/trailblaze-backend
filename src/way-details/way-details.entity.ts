import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('way_details')
@Unique(['wayId', 'timestamp'])
export class WayDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  wayId: string;

  @Column()
  timestamp: number; // You can also use Date type if you prefer

  @Column('float')
  avgSpeed: number;

  @Column('int')
  numberOfUsers: number;

  @Column('int')
  maxNumberOfUsers: number;

  @Column('int')
  minNumberOfUsers: number;

  @Column('float')
  maxSpeed: number;

  @Column('float')
  minSpeed: number;
}
