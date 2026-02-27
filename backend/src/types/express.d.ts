import { UserDTO } from './shared';

declare module 'express-serve-static-core' {
  interface Request {
    user?: UserDTO;
  }
}
