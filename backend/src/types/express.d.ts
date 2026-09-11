// Global augmentation to add a typed `user` property to Express Request
import { AuthUser } from './common';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
