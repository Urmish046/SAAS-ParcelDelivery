import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../../decorators/public.decorator';
import { CreateCustomerDto } from '../../utils/dto/create-customer.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body.email, body.password);
  }

  @Public()
  @Post('super-admin/login')
  superAdminLogin(@Body() body: any) {
    return this.authService.superAdminLogin(body.email, body.password);
  }

  @Public()
  @Post('customer-login')
  customerLogin(@Body() body: any) {
    return this.authService.customerLogin(body.email, body.password);
  }

  @Public()
  @Post('customer-register')
  customerRegister(@Body() body: any) {
    const { companyId, ...createCustomerDto } = body;
    return this.authService.customerRegister(createCustomerDto as CreateCustomerDto, companyId);
  }
}