
import { Product, User, UserRole, Table, TableStatus } from './types';
export const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Hambúrguer Artesanal', price: 35, category: 'Comidas', subcategory: 'Burgers', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', sendToKitchen: true, estimatedPrepTime: 20 },
  { id: '2', name: 'Suco de Laranja 500ml', price: 12, category: 'Bebidas não alcoólicas', subcategory: 'Sucos Naturais', imageUrl: 'https://images.unsplash.com/photo-1600271886301-ad946aa07274?w=400', sendToKitchen: true, estimatedPrepTime: 8 },
];
export const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Admin', username: 'admin', password: 'admin', role: UserRole.ADMIN },
];
export const INITIAL_TABLES: Table[] = Array.from({ length: 12 }, (_, i) => ({
  id: `t${i + 1}`, number: i + 1, status: TableStatus.FREE, currentOrders: []
}));
