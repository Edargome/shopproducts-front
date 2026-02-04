export type UserRole = 'ADMIN' | 'CUSTOMER';

export interface Actor {
  userId: string;
  email: string;
  role: UserRole;
}
