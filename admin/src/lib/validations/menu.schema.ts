import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters").max(50),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  description: z.string().max(200).optional(),
  icon: z.string().optional(),
  displayOrder: z.number().int().min(0, "Order must be 0 or greater"),
  isActive: z.boolean().default(true),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

export const menuItemSchema = z.object({
  name: z.string().min(2, "Item name must be at least 2 characters").max(80),
  description: z.string().min(5, "Description must be at least 5 characters").max(500),
  categoryId: z.string().min(1, "Please select a category"),
  price: z.number().positive("Price must be greater than 0"),
  discountPrice: z.number().positive("Discount price must be greater than 0").nullable().optional(),
  imageUrl: z.string().url("Please provide a valid image URL or upload an image"),
  isVegetarian: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  prepTimeMinutes: z.number().int().min(1, "Prep time must be at least 1 min").max(120),
  ingredients: z.array(z.string()).default([]),
  allergens: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  displayOrder: z.number().int().min(0).default(0),
}).refine(
  (data) => {
    if (data.discountPrice && data.discountPrice >= data.price) {
      return false;
    }
    return true;
  },
  {
    message: "Discount price must be lower than original price",
    path: ["discountPrice"],
  }
);

export type MenuItemFormValues = z.infer<typeof menuItemSchema>;
