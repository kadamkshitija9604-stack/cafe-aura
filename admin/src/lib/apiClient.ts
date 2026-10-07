import { Role } from '@/types/rbac';

export function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {
      'Content-Type': 'application/json',
    };
  }

  try {
    const raw = localStorage.getItem('cafe_aura_current_user');
    if (raw) {
      const user = JSON.parse(raw);
      return {
        'Content-Type': 'application/json',
        'x-user-id': user.uid || 'user-unknown',
        'x-user-role': user.role || 'viewer',
        'x-user-email': user.email || 'user@cafeaura.com',
        'x-user-name': user.displayName || 'Cafe User',
      };
    }
  } catch (err) {
    console.error('Error reading auth headers:', err);
  }

  return {
    'Content-Type': 'application/json',
  };
}
