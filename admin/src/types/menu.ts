export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type DietaryTag = 'Vegetarian' | 'Vegan' | 'Gluten-Free' | 'Dairy-Free' | 'Nut-Free';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  price: number;
  discountPrice?: number | null;
  imageUrl: string;
  isVegetarian: boolean;
  isBestseller: boolean;
  isFeatured: boolean;
  isAvailable: boolean;
  prepTimeMinutes: number;
  ingredients: string[];
  allergens: string[];
  tags: string[];
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}
