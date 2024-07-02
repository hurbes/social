import { CreateUserRequest } from './create-user.dto';

export type ExistingUserRequest = Pick<CreateUserRequest, 'email' | 'password'>;
