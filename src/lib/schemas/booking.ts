import { z } from "zod";

// Request schemas for /api/v1/bookings/*. Mirror the lib's CreateBookingInput
// shape with runtime validation suitable for an untrusted API client (mobile,
// third-party). The web server action does its own FormData parsing today and
// trusts the lib; the API route validates at the boundary like Stripe does.

export const CreateBookingSchema = z.object({
  localId: z.string().min(1, "localId required"),
  hours: z.number().int().min(1).max(8),
  /** "HH:mm" 24-hour, local time. */
  slot: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "slot must be HH:mm"),
  /** ISO YYYY-MM-DD or one of "tonight" | "tomorrow" | "weekend". */
  when: z.string().min(1),
  spotId: z.string().nullable().optional(),
  travelerNote: z.string().max(2000).nullable().optional(),
});
export type CreateBookingBody = z.infer<typeof CreateBookingSchema>;
