'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/ToastProvider';
import { menuService } from '@/lib/services/menuService';
import { auditService } from '@/lib/services/auditService';
import { MenuCategory, MenuItem } from '@/types/menu';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { StatusBadge } from '@/components/ui/Badge';
import { Plus, Edit2, Trash2, Layers, AlertCircle } from 'lucide-react';

export default function CategoriesPage() {
  const { user, role } = useAuth();
  const { success, error, warning } = useToast();

  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuCategory | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('☕');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [cats, items] = await Promise.all([
        menuService.getCategories(),
        menuService.getMenuItems(),
      ]);

      // Calculate exact item counts
      const enrichedCats = cats.map((c) => ({
        ...c,
        itemCount: items.filter((i) => i.categoryId === c.id).length,
      }));

      setCategories(enrichedCats);
      setMenuItems(items);
    } catch (err) {
      error('Error', 'Failed to load categories.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setIcon('☕');
    setDisplayOrder(categories.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: MenuCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setIcon(cat.icon || '☕');
    setDisplayOrder(cat.displayOrder);
    setIsActive(cat.isActive);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      error('Validation Error', 'Category name and slug are required.');
      return;
    }

    const payload = {
      name,
      slug,
      description,
      icon,
      displayOrder: Number(displayOrder),
      isActive,
    };

    try {
      setIsSaving(true);
      if (editingCategory) {
        await menuService.updateCategory(editingCategory.id, payload);
        await auditService.logAction({
          userId: user?.uid || 'admin',
          userName: user?.displayName || 'Admin',
          userEmail: user?.email || '',
          userRole: role,
          action: 'CATEGORY_UPDATE',
          resourceType: 'category',
          resourceId: editingCategory.id,
          details: `Updated category "${name}"`,
        });
        success('Category Updated', `${name} has been updated.`);
      } else {
        const created = await menuService.createCategory(payload);
        await auditService.logAction({
          userId: user?.uid || 'admin',
          userName: user?.displayName || 'Admin',
          userEmail: user?.email || '',
          userRole: role,
          action: 'CATEGORY_CREATE',
          resourceType: 'category',
          resourceId: created.id,
          details: `Created new category "${name}"`,
        });
        success('Category Created', `${name} has been created.`);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      error('Save Failed', err.message || 'Could not save category.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const res = await menuService.deleteCategory(deleteTarget.id);
      if (!res.success) {
        warning('Deletion Blocked', res.error);
        setDeleteTarget(null);
        return;
      }

      await auditService.logAction({
        userId: user?.uid || 'admin',
        userName: user?.displayName || 'Admin',
        userEmail: user?.email || '',
        userRole: role,
        action: 'CATEGORY_DELETE',
        resourceType: 'category',
        resourceId: deleteTarget.id,
        details: `Deleted category "${deleteTarget.name}"`,
      });

      success('Category Deleted', `${deleteTarget.name} has been removed.`);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      error('Error', 'Failed to delete category.');
    }
  };

  return (
    <AdminLayout requiredPermission="categories:view">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-aura-50">
              Menu Categories ({categories.length})
            </h1>
            <p className="text-xs text-aura-300 mt-1">
              Organize your dishes and drinks into intuitive customer browsing sections
            </p>
          </div>

          <RoleGuard permission="categories:create">
            <Button onClick={openCreateModal} icon={<Plus className="w-4 h-4" />}>
              Add Category
            </Button>
          </RoleGuard>
        </div>

        {/* Categories Table */}
        <div className="bg-espresso-900/80 border border-aura-800/80 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-espresso-950/80 text-[11px] font-semibold text-aura-400 uppercase tracking-wider border-b border-aura-800/80">
                <tr>
                  <th className="px-5 py-3.5">Order</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Slug</th>
                  <th className="px-5 py-3.5">Active Items</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aura-800/50 text-xs">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-aura-900/20 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-aura-400">
                      #{cat.displayOrder}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{cat.icon || '☕'}</span>
                        <div>
                          <p className="font-semibold text-aura-50">{cat.name}</p>
                          {cat.description && (
                            <p className="text-[11px] text-aura-400 max-w-sm line-clamp-1 mt-0.5">
                              {cat.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 font-mono text-aura-300 text-[11px]">
                      {cat.slug}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-caramel-500/15 text-caramel-300 border border-caramel-500/30">
                        {cat.itemCount ?? 0} items
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <StatusBadge status={cat.isActive ? 'active' : 'inactive'} />
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <RoleGuard permission="categories:edit">
                          <button
                            onClick={() => openEditModal(cat)}
                            className="p-1.5 rounded-lg text-aura-300 hover:text-aura-50 hover:bg-aura-800/50 transition-colors"
                            title="Edit category"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </RoleGuard>

                        <RoleGuard permission="categories:delete">
                          <button
                            onClick={() => setDeleteTarget(cat)}
                            className="p-1.5 rounded-lg text-aura-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </RoleGuard>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingCategory ? 'Edit Category' : 'Create Category'}
          description="Categories group your menu items for online and dine-in customers."
          maxWidth="md"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-3">
                <Input
                  label="Category Name *"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Specialty Coffees"
                  required
                />
              </div>
              <div className="col-span-1">
                <Input
                  label="Emoji / Icon"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="☕"
                />
              </div>
            </div>

            <Input
              label="URL Slug *"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="specialty-coffees"
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-aura-300 mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Brief summary of what this category offers..."
                className="w-full rounded-xl bg-espresso-900/80 border border-aura-800/80 text-aura-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-caramel-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Display Order"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
              />

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-aura-200">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-aura-700 text-caramel-500 focus:ring-0"
                  />
                  <span>Active & Visible</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-aura-800/60">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSaving}>
                {editingCategory ? 'Save Category' : 'Create Category'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Modal */}
        <ConfirmDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Category"
          message={`Are you sure you want to delete category "${deleteTarget?.name}"? You will only be allowed to delete it if no active menu items belong to it.`}
          confirmText="Delete Category"
        />
      </div>
    </AdminLayout>
  );
}
