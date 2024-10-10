import { AuthGuard } from '@nestjs/passport';

export class JWtGaurd extends AuthGuard('jwt') {
  constructor() {
    super();
  }
}
