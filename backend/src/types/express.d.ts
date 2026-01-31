import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
        name: string;
      };
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    name: string;
  };
  // Explicitly include Express Request properties to ensure TypeScript recognizes them
  params: any;
  query: any;
  body: any;
  ip: string;
  path: string;
  cookies: any;
  headers: any;
}