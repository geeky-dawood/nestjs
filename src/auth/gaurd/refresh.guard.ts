import { AuthGuard } from '@nestjs/passport';

export class RefreshGaurd extends AuthGuard('refresh') {
 
}
