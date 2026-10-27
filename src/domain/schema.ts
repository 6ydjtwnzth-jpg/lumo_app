import { z } from 'zod';

export const CATEGORIES = ['storia', 'arte', 'natura', 'cibo', 'nascosti', 'panorami', 'chiese'] as const;
export const ICONS = [
  'pantheon', 'museo', 'chiesa', 'gemma', 'panorama', 'pizza', 'nave',
  'orologio', 'curiosita', 'giardino', 'fontana', 'gelato', 'torre', 'scarpa',
] as const;

const localized = z.object({ it: z.string().min(1), en: z.string().min(1) });
const coords = z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) });

export const poiSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, 'id: solo minuscole, numeri e trattini'),
  name: localized,
  category: z.enum(CATEGORIES),
  icon: z.enum(ICONS),
  hidden: z.boolean(),
  coords,
  visitMinutes: z.number().int().min(5).max(180),
  summary: localized,
  localTip: localized.optional(),
  curiosities: z.array(localized).max(3),
  ticket: z.object({ required: z.boolean(), note: localized.optional() }),
  // false = coordinates, hours or facts still to be checked on an official source
  verified: z.boolean(),
});

export const portSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    city: localized,
    terminal: z.object({ name: localized, coords }),
    // time to clear security and board, counted before "all aboard"
    controlsMinutes: z.number().int().min(0).max(60),
    pois: z.array(poiSchema).min(3),
  })
  .superRefine((port, ctx) => {
    const seen = new Set<string>();
    for (const poi of port.pois) {
      if (seen.has(poi.id)) ctx.addIssue({ code: 'custom', message: `id duplicato: ${poi.id}` });
      seen.add(poi.id);
    }
  });

export type Category = (typeof CATEGORIES)[number];
export type IconName = (typeof ICONS)[number];
export type Localized = z.infer<typeof localized>;
export type Coords = z.infer<typeof coords>;
export type Poi = z.infer<typeof poiSchema>;
export type Port = z.infer<typeof portSchema>;
