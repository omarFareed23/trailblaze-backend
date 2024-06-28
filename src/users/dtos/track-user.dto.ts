import { UUID } from 'crypto';

export class TrackUserDto {
  'user-id': UUID;

  geocoordinate: string[];

  timestamp: number;

  'way-id': number;

  speed: number;
}
