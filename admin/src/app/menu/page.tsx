'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/ToastProvider';
import { menuService } from '@/lib/services/menuService';
import { auditService } from '@/lib/services/auditService';
import { MenuItem, MenuCategory } from '@/types/menu';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { StatusBadge, TagBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils/cn';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Copy,
  Trash2,
  Sparkles,
  Check,
  X,
  Clock,
  Utensils,
  Layers,
  FolderPlus
} from 'lucide-react';

export default function MenuPage() {
  const { user, role } = useAuth();
  const { success, error } = useToast();

  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Quick Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('☕');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState<number>(5);
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [ingredientsText, setIngredientsText] = useState('');
  const [allergensText, setAllergensText] = useState('');
  const [tagsText, setTagsText] = useState('');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [fetchedItems, fetchedCategories] = await Promise.all([
        menuService.getMenuItems(),
        menuService.getCategories(),
      ]);
      setItems(fetchedItems);
      setCategories(fetchedCategories);
    } catch (err) {
      error('Error', 'Failed to load menu data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setName('');
    setDescription('');
    setCategoryId(categories[0]?.id || '');
    setPrice(5.00);
    setDiscountPrice(null);
    setImageUrl('https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80');
    setPrepTimeMinutes(5);
    setIsVegetarian(true);
    setIsBestseller(false);
    setIsFeatured(false);
    setIsAvailable(true);
    setIngredientsText('Espresso, Steamed Milk');
    setAllergensText('Dairy');
    setTagsText('Hot, Signature');
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description);
    setCategoryId(item.categoryId);
    setPrice(item.price);
    setDiscountPrice(item.discountPrice ?? null);
    setImageUrl(item.imageUrl);
    setPrepTimeMinutes(item.prepTimeMinutes);
    setIsVegetarian(item.isVegetarian);
    setIsBestseller(item.isBestseller);
    setIsFeatured(item.isFeatured);
    setIsAvailable(item.isAvailable);
    setIngredientsText(item.ingredients?.join(', ') || '');
    setAllergensText(item.allergens?.join(', ') || '');
    setTagsText(item.tags?.join(', ') || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !categoryId || price <= 0) {
      error('Validation Error', 'Please complete all required fields.');
      return;
    }

    if (discountPrice && discountPrice >= price) {
      error('Validation Error', 'Discount price must be lower than original price.');
      return;
    }

    const selectedCat = categories.find((c) => c.id === categoryId);

    const payload = {
      name,
      description,
      categoryId,
      categoryName: selectedCat?.name || '',
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=800&q=80',
      prepTimeMinutes: Number(prepTimeMinutes),
      isVegetarian,
      isBestseller,
      isFeatured,
      isAvailable,
      ingredients: ingredientsText.split(',').map((s) => s.trim()).filter(Boolean),
      allergens: allergensText.split(',').map((s) => s.trim()).filter(Boolean),
      tags: tagsText.split(',').map((s) => s.trim()).filter(Boolean),
      displayOrder: editingItem ? editingItem.displayOrder : items.length + 1,
    };

    try {
      setIsSaving(true);
      if (editingItem) {
        await menuService.updateMenuItem(editingItem.id, payload);
        await auditService.logAction({
          userId: user?.uid || 'admin',
          userName: user?.displayName || 'Admin',
          userEmail: user?.email || '',
          userRole: role,
          action: 'MENU_UPDATE',
          resourceType: 'menu',
          resourceId: editingItem.id,
          details: `Updated menu item "${name}" ($${payload.price})`,
        });
        success('Menu Item Updated', `${name} has been updated.`);
      } else {
        const created = await menuService.createMenuItem(payload);
        await auditService.logAction({
          userId: user?.uid || 'admin',
          userName: user?.displayName || 'Admin',
          userEmail: user?.email || '',
          userRole: role,
          action: 'MENU_CREATE',
          resourceType: 'menu',
          resourceId: created.id,
          details: `Created new menu item "${name}" ($${payload.price})`,
        });
        success('Menu Item Created', `${name} added to menu.`);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      error('Save Failed', err.message || 'Could not save menu item.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDuplicate = async (item: MenuItem) => {
    try {
      const duplicated = await menuService.duplicateMenuItem(item);
      await auditService.logAction({
        userId: user?.uid || 'admin',
        userName: user?.displayName || 'Admin',
        userEmail: user?.email || '',
        userRole: role,
        action: 'MENU_CREATE',
        resourceType: 'menu',
        resourceId: duplicated.id,
        details: `Duplicated menu item from "${item.name}"`,
      });
      success('Item Duplicated', `Created copy of ${item.name}`);
      await loadData();
    } catch (err) {
      error('Error', 'Failed to duplicate item.');
    }
  };

  const handleToggleStatus = async (item: MenuItem) => {
    try {
      const newStatus = !item.isAvailable;
      await menuService.updateMenuItem(item.id, { isAvailable: newStatus });
      await auditService.logAction({
        userId: user?.uid || 'admin',
        userName: user?.displayName || 'Admin',
        userEmail: user?.email || '',
        userRole: role,
        action: 'MENU_STATUS_TOGGLE',
        resourceType: 'menu',
        resourceId: item.id,
        details: `Marked "${item.name}" as ${newStatus ? 'Available' : 'Sold Out'}`,
      });
      success('Status Changed', `Item is now ${newStatus ? 'Available' : 'Sold Out'}`);
      await loadData();
    } catch (err) {
      error('Error', 'Failed to toggle status.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await menuService.deleteMenuItem(deleteTarget.id);
      await auditService.logAction({
        userId: user?.uid || 'admin',
        userName: user?.displayName || 'Admin',
        userEmail: user?.email || '',
        userRole: role,
        action: 'MENU_DELETE',
        resourceType: 'menu',
        resourceId: deleteTarget.id,
        details: `Deleted menu item "${deleteTarget.name}"`,
      });
      success('Item Deleted', `${deleteTarget.name} has been removed.`);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      error('Error', 'Failed to delete item.');
    }
  };

  const handleQuickAddCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) {
      error('Validation Error', 'Category name is required.');
      return;
    }

    try {
      setIsCreatingCategory(true);
      const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `cat-${Date.now()}`;
      const created = await menuService.createCategory({
        name: trimmed,
        slug,
        description: newCatDesc.trim() || undefined,
        icon: newCatIcon || '☕',
        displayOrder: categories.length + 1,
        isActive: true,
      });

      await auditService.logAction({
        userId: user?.uid || 'admin',
        userName: user?.displayName || 'Admin',
        userEmail: user?.email || '',
        userRole: role,
        action: 'CATEGORY_CREATE',
        resourceType: 'category',
        resourceId: created.id,
        details: `Created new category "${trimmed}" from menu manager`,
      });

      const updatedCategories = await menuService.getCategories();
      setCategories(updatedCategories);
      setCategoryId(created.id);
      setIsCategoryModalOpen(false);
      setNewCatName('');
      setNewCatDesc('');
      setNewCatIcon('☕');
      success('Category Created', `"${trimmed}" was added and selected.`);
    } catch (err: any) {
      error('Error', err?.message || 'Failed to create category.');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // Filtered list
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ingredients?.some((ing) => ing.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'all' || item.categoryId === selectedCategory;

      const matchesAvail =
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available' && item.isAvailable) ||
        (availabilityFilter === 'unavailable' && !item.isAvailable);

      return matchesSearch && matchesCat && matchesAvail;
    });
  }, [items, searchQuery, selectedCategory, availabilityFilter]);

  return (
    <AdminLayout requiredPermission="menu:view">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-aura-50">
              Menu Items ({items.length})
            </h1>
            <p className="text-xs text-aura-300 mt-1">
              Manage recipes, prices, promotional discounts and availability
            </p>
          </div>

          <div className="flex items-center gap-2">
            <RoleGuard permission="categories:create">
              <Button
                variant="outline"
                onClick={() => {
                  setNewCatName('');
                  setNewCatDesc('');
                  setNewCatIcon('☕');
                  setIsCategoryModalOpen(true);
                }}
                icon={<Layers className="w-4 h-4" />}
              >
                Add Category
              </Button>
            </RoleGuard>
            <RoleGuard permission="menu:create">
              <Button onClick={openCreateModal} icon={<Plus className="w-4 h-4" />}>
                Add Menu Item
              </Button>
            </RoleGuard>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-espresso-900/80 border border-aura-800/80 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search items by name, description or ingredient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-espresso-950 border border-aura-800 rounded-xl px-3 py-2 text-xs text-aura-200 focus:outline-none focus:border-caramel-500 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as any)}
              className="bg-espresso-950 border border-aura-800 rounded-xl px-3 py-2 text-xs text-aura-200 focus:outline-none focus:border-caramel-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available Only</option>
              <option value="unavailable">Sold Out Only</option>
            </select>
          </div>
        </div>

        {/* Menu Table */}
        <div className="bg-espresso-900/80 border border-aura-800/80 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-espresso-950/80 text-[11px] font-semibold text-aura-400 uppercase tracking-wider border-b border-aura-800/80">
                <tr>
                  <th className="px-5 py-3.5">Item</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Price</th>
                  <th className="px-5 py-3.5">Badges</th>
                  <th className="px-5 py-3.5">Availability</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aura-800/50 text-xs">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-aura-400">
                      No menu items found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-aura-900/20 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover bg-espresso-950 border border-aura-800 shrink-0"
                          />
                          <div>
                            <p className="font-semibold text-aura-50 line-clamp-1">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-aura-400 line-clamp-1 max-w-xs mt-0.5">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-aura-300 font-medium">
                        {item.categoryName || 'General'}
                      </td>

                      <td className="px-5 py-3.5 font-bold">
                        {item.discountPrice ? (
                          <div>
                            <span className="text-caramel-400">
                              {formatCurrency(item.discountPrice)}
                            </span>
                            <span className="text-[11px] text-aura-500 line-through ml-1.5 font-normal">
                              {formatCurrency(item.price)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-aura-100">
                            {formatCurrency(item.price)}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {item.isBestseller && <TagBadge variant="gold">Bestseller</TagBadge>}
                          {item.isFeatured && <TagBadge variant="green">Featured</TagBadge>}
                          {item.isVegetarian && <TagBadge>Veg</TagBadge>}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <RoleGuard
                          permission="menu:toggle_status"
                          fallback={<StatusBadge status={item.isAvailable ? 'available' : 'unavailable'} />}
                        >
                          <button
                            onClick={() => handleToggleStatus(item)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            <StatusBadge status={item.isAvailable ? 'available' : 'unavailable'} />
                          </button>
                        </RoleGuard>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <RoleGuard permission="menu:edit">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1.5 rounded-lg text-aura-300 hover:text-aura-50 hover:bg-aura-800/50 transition-colors"
                              title="Edit item"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </RoleGuard>

                          <RoleGuard permission="menu:create">
                            <button
                              onClick={() => handleDuplicate(item)}
                              className="p-1.5 rounded-lg text-aura-300 hover:text-aura-50 hover:bg-aura-800/50 transition-colors"
                              title="Duplicate item"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </RoleGuard>

                          <RoleGuard permission="menu:delete">
                            <button
                              onClick={() => setDeleteTarget(item)}
                              className="p-1.5 rounded-lg text-aura-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Delete item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </RoleGuard>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add / Edit Menu Item Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
          description="Provide details, ingredients, dietary flags, and high-resolution imagery."
          maxWidth="2xl"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Item Name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vanilla Bean Latte"
                required
              />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-aura-300">
                    Category *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setNewCatName('');
                      setNewCatDesc('');
                      setNewCatIcon('☕');
                      setIsCategoryModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 text-xs text-caramel-400 hover:text-caramel-300 transition-colors font-medium hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add New Category
                  </button>
                </div>
                <select
                  value={categoryId}
                  onChange={(e) => {
                    if (e.target.value === '__NEW__') {
                      setNewCatName('');
                      setNewCatDesc('');
                      setNewCatIcon('☕');
                      setIsCategoryModalOpen(true);
                    } else {
                      setCategoryId(e.target.value);
                    }
                  }}
                  className="w-full rounded-xl bg-espresso-900/80 border border-aura-800/80 text-aura-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-caramel-500 cursor-pointer"
                  required
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon ? `${c.icon} ` : ''}{c.name}
                    </option>
                  ))}
                  <option value="__NEW__" className="text-caramel-400 font-semibold bg-espresso-950">
                    ➕ + Add New Category...
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-aura-300 mb-1.5">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe flavors, coffee origin, and preparation..."
                className="w-full rounded-xl bg-espresso-900/80 border border-aura-800/80 text-aura-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-caramel-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Base Price ($) *"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                required
              />

              <Input
                label="Discount / Promo Price ($)"
                type="number"
                step="0.01"
                value={discountPrice ?? ''}
                onChange={(e) =>
                  setDiscountPrice(e.target.value ? parseFloat(e.target.value) : null)
                }
                placeholder="Optional"
              />

              <Input
                label="Prep Time (Minutes) *"
                type="number"
                value={prepTimeMinutes}
                onChange={(e) => setPrepTimeMinutes(parseInt(e.target.value) || 1)}
                required
              />
            </div>

            {/* Image Upload */}
            <ImageUploader
              value={imageUrl}
              onChange={setImageUrl}
              folder="menu"
              label="Menu Item Photo"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Ingredients (comma-separated)"
                value={ingredientsText}
                onChange={(e) => setIngredientsText(e.target.value)}
                placeholder="Espresso, Oat Milk, Vanilla"
              />

              <Input
                label="Allergens (comma-separated)"
                value={allergensText}
                onChange={(e) => setAllergensText(e.target.value)}
                placeholder="Dairy, Gluten, Nuts"
              />

              <Input
                label="Custom Tags"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="Signature, Iced, Sugar-Free"
              />
            </div>

            {/* Checkbox Toggles */}
            <div className="p-4 rounded-xl bg-espresso-950/60 border border-aura-800/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-aura-200">
                <input
                  type="checkbox"
                  checked={isVegetarian}
                  onChange={(e) => setIsVegetarian(e.target.checked)}
                  className="rounded border-aura-700 text-caramel-500 focus:ring-0"
                />
                <span>Vegetarian</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-aura-200">
                <input
                  type="checkbox"
                  checked={isBestseller}
                  onChange={(e) => setIsBestseller(e.target.checked)}
                  className="rounded border-aura-700 text-caramel-500 focus:ring-0"
                />
                <span>Bestseller</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-aura-200">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-aura-700 text-caramel-500 focus:ring-0"
                />
                <span>Featured</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-aura-200">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="rounded border-aura-700 text-caramel-500 focus:ring-0"
                />
                <span>Available</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-aura-800/60">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isSaving}>
                {editingItem ? 'Save Changes' : 'Create Item'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Menu Item"
          message={`Are you sure you want to delete "${deleteTarget?.name}"? This action is permanent.`}
          confirmText="Delete Item"
        />

        {/* Quick Add Category Modal */}
        <Modal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          title="Add New Category"
          description="Create a new menu category. It will immediately appear in your category list and menu."
          maxWidth="md"
          zIndex={60}
        >
          <form onSubmit={handleQuickAddCategory} className="space-y-4">
            <Input
              label="Category Name *"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Burgers & Sandwiches, Mocktails, Desserts"
              required
              autoFocus
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-aura-300 mb-1.5">
                Category Icon / Emoji
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {['☕', '🍔', '🥪', '🍰', '🥐', '🍵', '🥤', '🥗', '🍕', '🍨', '🥞', '🍹', '🍩', '🍫', '🧋', '🍟'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setNewCatIcon(emoji)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${
                      newCatIcon === emoji
                        ? 'bg-caramel-500 text-espresso-950 scale-110 shadow-lg ring-2 ring-caramel-400'
                        : 'bg-espresso-950/80 border border-aura-800/80 hover:border-aura-600'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <Input
                placeholder="Or type custom emoji (e.g. 🌮)"
                value={newCatIcon}
                onChange={(e) => setNewCatIcon(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-aura-300 mb-1.5">
                Description (Optional)
              </label>
              <textarea
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                rows={2}
                placeholder="Brief description for this category..."
                className="w-full rounded-xl bg-espresso-900/80 border border-aura-800/80 text-aura-50 px-3.5 py-2 text-sm focus:outline-none focus:border-caramel-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-aura-800/60">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCategoryModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isCreatingCategory} icon={<Plus className="w-4 h-4" />}>
                Create Category
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
}
