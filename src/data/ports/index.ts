import { portSchema, type Port } from '../../domain/schema';
import napoliRaw from './napoli.json';

/** Every port file is validated at load time: bad data fails loudly, never silently. */
export const PORTS: Record<string, Port> = {
  napoli: portSchema.parse(napoliRaw),
};
