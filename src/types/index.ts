// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: 'CUSTOMER' | 'VENDOR' | 'GOD_USER' | 'PLATFORM_ADMIN';
  phone?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

// ─── Vendor ──────────────────────────────────────────────────────────────────

export interface Vendor {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  bannerUrl?: string;
  description?: string;
  followerCount: number;
  isFollowed?: boolean;
  productCount?: number;
  rating?: number;
}

// ─── Product ─────────────────────────────────────────────────────────────────

export interface ProductVariant {
  id: string;
  size?: string;
  color?: string;
  stock: number;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  vendor: Vendor;
  category: Category;
  variants: ProductVariant[];
  rating?: number;
  reviewCount?: number;
  isWishlisted?: boolean;
  tags?: string[];
  createdAt: string;
}

// ─── Category ────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  parentId?: string;
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
  unitPrice: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  itemCount: number;
}

// ─── Order ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface OrderItem {
  id: string;
  product: Pick<Product, 'id' | 'name' | 'images'>;
  variant: ProductVariant;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ShippingAddress {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  shippingFee: number;
  total: number;
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Forum ───────────────────────────────────────────────────────────────────

export interface ForumChannel {
  id: string;
  name: string;
  vendor: Pick<Vendor, 'id' | 'name' | 'logoUrl' | 'slug'>;
  topicCount: number;
  lastActivity?: string;
}

export interface ForumTopic {
  id: string;
  title: string;
  body: string;
  author: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>;
  channel: ForumChannel;
  replyCount: number;
  reactionCount: number;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ForumReply {
  id: string;
  body: string;
  author: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>;
  reactions: Record<string, number>;
  createdAt: string;
}

// ─── Message ─────────────────────────────────────────────────────────────────

export interface DirectMessage {
  id: string;
  body: string;
  sender: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>;
  createdAt: string;
  readAt?: string;
}

export interface Conversation {
  id: string;
  participant: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>;
  lastMessage?: DirectMessage;
  unreadCount: number;
  updatedAt: string;
}

// ─── Notification ────────────────────────────────────────────────────────────

export type NotificationType = 'order_shipped' | 'forum_reply' | 'new_drop';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
  readAt?: string;
  createdAt: string;
}

// ─── Feed ────────────────────────────────────────────────────────────────────

export type FeedItemType = 'new_product' | 'new_drop' | 'event' | 'forum_post';

export interface FeedItem {
  id: string;
  type: FeedItemType;
  vendor: Pick<Vendor, 'id' | 'name' | 'logoUrl' | 'slug'>;
  product?: Product;
  title: string;
  imageUrl?: string;
  createdAt: string;
}

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}
