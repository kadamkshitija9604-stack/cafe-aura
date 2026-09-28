import { z } from "zod";

export const openingHourSchema = z.object({
  day: z.string(),
  openTime: z.string(),
  closeTime: z.string(),
  isClosed: z.boolean(),
});

export const cafeSettingsSchema = z.object({
  cafeName: z.string().min(2, "Cafe name is required"),
  tagline: z.string().min(2, "Tagline is required"),
  logoUrl: z.string().url("Please provide a valid logo URL").or(z.literal("")),
  address: z.string().min(5, "Address is required"),
  phone: z.string().min(7, "Phone is required"),
  email: z.string().email("Valid email is required"),
  currency: z.string().min(1, "Currency code is required"),
  currencySymbol: z.string().min(1, "Currency symbol is required"),
  taxRatePercent: z.number().min(0).max(100),
  openingHours: z.array(openingHourSchema),
  socialLinks: z.object({
    instagram: z.string().url().or(z.literal("")).optional(),
    facebook: z.string().url().or(z.literal("")).optional(),
    twitter: z.string().url().or(z.literal("")).optional(),
    youtube: z.string().url().or(z.literal("")).optional(),
  }),
});

export type CafeSettingsFormValues = z.infer<typeof cafeSettingsSchema>;

export const websiteSettingsSchema = z.object({
  bannerEnabled: z.boolean(),
  bannerText: z.string(),
  bannerLink: z.string().url().or(z.literal("")).optional(),
  orderOnlineEnabled: z.boolean(),
  tableReservationEnabled: z.boolean(),
  maintenanceMode: z.boolean(),
});

export type WebsiteSettingsFormValues = z.infer<typeof websiteSettingsSchema>;
