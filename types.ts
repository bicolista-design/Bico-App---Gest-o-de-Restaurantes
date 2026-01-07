
export enum UserRole { ADMIN = 'ADMIN', WAITER = 'WAITER', CASHIER = 'CASHIER', KITCHEN = 'KITCHEN' }
export enum TableStatus { FREE = 'FREE', OCCUPIED = 'OCCUPIED', PENDING_BILL = 'PENDING_BILL' }

export interface User { 
  id: string; 
  name: string; 
  role: UserRole; 
  username: string; 
  password?: string; 
}

export interface Category { 
  id: string; 
  name: string; 
  subcategories: string[]; 
  defaultSendToKitchen: boolean; 
}

export interface Product { 
  id: string; 
  name: string; 
  price: number; 
  category: string; 
  subcategory: string; 
  imageUrl: string; 
  description?: string; 
  sendToKitchen: boolean; 
  estimatedPrepTime: number; 
}

export interface OrderItem { 
  id: string; 
  productId: string; 
  name: string; 
  price: number; 
  category: string; 
  quantity: number; 
  status: 'PENDING' | 'PREPARING' | 'DONE'; 
  timestamp: number; 
  sendToKitchen: boolean; 
  waiterName?: string; 
  estimatedPrepTime: number; 
  preparationStartedAt?: number; 
  waiterAcknowledged?: boolean; 
}

export interface Table { 
  id: string; 
  number: number; 
  status: TableStatus; 
  currentOrders: OrderItem[]; 
  openedAt?: number; 
  lastUpdatedBy?: string; 
}

/** Interface for payment information in a sale */
export interface Payment {
  method: string;
  amount: number;
}

/** Interface for completed sale records */
export interface SaleRecord {
  id: string;
  tableId: string;
  tableName: string;
  total: number;
  payments: Payment[];
  items: OrderItem[];
  closedAt: number;
  closedBy: string;
  cashSessionId: string;
}

/** Interface for cash session management */
export interface CashSession {
  id: string;
  openedAt: number;
  openedBy: string;
  openingBalance: number;
  closedAt?: number;
  closedBy?: string;
  closingBalance?: number;
  status: 'OPEN' | 'CLOSED';
}

/** Interface for overall company settings and branding */
export interface CompanySettings { 
  name: string; 
  razaoSocial: string; 
  cnpjCpf: string; 
  address: string; 
  phone: string; 
  notificationVolume: number; 
  // Missing properties added to fix SettingsPanel and QRCodeManager errors
  cep: string;
  whatsapp: string;
  inscricaoEstadual: string;
  inscricaoMunicipal: string;
  numero: string;
  state: string;
  city: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: 'Inter' | 'Poppins' | 'Montserrat' | 'Roboto' | 'Open Sans';
}
