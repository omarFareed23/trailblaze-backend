import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('way_details')
@Unique(['way_id', 'timestamp'])
export class WayDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  way_id: string;

  @Column({ type: 'bigint' })
  timestamp: number; // You can also use Date type if you prefer

  @Column('float', { default: 60 })
  avgSpeed: number;

  @Column('int', { default: 0 })
  num_of_cars: number;

  @Column('int', { default: 0 })
  expected_num_of_cars: number;

  @Column('int', { default: 0 })
  maxNumberOfUsers: number;

  @Column('int', { default: 0 })
  minNumberOfUsers: number;

  @Column('float', { default: 60 })
  maxSpeed: number;

  @Column('float', { default: 60 })
  minSpeed: number;
}
