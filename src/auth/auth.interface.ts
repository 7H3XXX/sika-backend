export interface AuthUser {
  id: string;
  createdAt: Date;
  email: string;
  firstname: string;
  lastname: string;
  imageUrl: string | null;
}

export interface AuthRole {
  id: string;
  createdAt: Date;
  role: 'user' | 'admin' | 'employer' | 'seeker';
  userId: string;
  isActive: boolean;
}
