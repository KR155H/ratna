export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Diamond {
  _id: string;
  name: string;
  carat: number;
  cut: string;
  color: string;
  clarity: string;
  price: number;
  description: string;
  image: string;
  seller: {
    _id: string;
    name: string;
    email: string;
  };
  sellerName: string;
  status: string;
  views: number;
  createdAt: string;
  updatedAt?: string;
  pricePerCarat?: number;
  certification?: {
    institute: string;
    certificateNumber?: string;
    certificateImage?: string;
  };
  dimensions?: {
    length: number;
    width: number;
    depth: number;
  };
  fluorescence?: string;
  polish?: string;
  symmetry?: string;
}

export interface Admin {
  id: string;
  adminId: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}