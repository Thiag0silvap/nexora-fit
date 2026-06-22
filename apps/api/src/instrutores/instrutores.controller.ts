import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthUser } from '../auth/types/auth-user.type';
import { CreateInstrutorDto } from './dto/create-instrutor.dto';
import { UpdateInstrutorDto } from './dto/update-instrutor.dto';
import { ReactivateInstrutorDto } from './dto/reactivate-instrutor.dto';
import { InstrutoresService } from './instrutores.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('instrutores')
export class InstrutoresController {
  constructor(private readonly instrutoresService: InstrutoresService) {}

  @Roles(UserRole.ADMIN_ACADEMIA)
  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body() createInstrutorDto: CreateInstrutorDto,
  ) {
    return this.instrutoresService.create(user, createInstrutorDto);
  }

  @Roles(UserRole.ADMIN_ACADEMIA, UserRole.RECEPCAO)
  @Get()
  findAll(@CurrentUser() user: AuthUser, @Query('status') status?: string) {
    return this.instrutoresService.findAll(user, status);
  }

  @Roles(UserRole.ADMIN_ACADEMIA)
  @Get('inativo')
  findInactiveByEmail(@CurrentUser() user: AuthUser, @Query('email') email: string) {
    return this.instrutoresService.findInactiveByEmail(user, email);
  }

  @Roles(UserRole.ADMIN_ACADEMIA)
  @Patch(':id/reativar')
  reactivate(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() reactivateInstrutorDto: ReactivateInstrutorDto,
  ) {
    return this.instrutoresService.reactivate(user, id, reactivateInstrutorDto);
  }

  @Roles(UserRole.ADMIN_ACADEMIA, UserRole.RECEPCAO, UserRole.INSTRUTOR)
  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.instrutoresService.findOne(user, id);
  }

  @Roles(UserRole.ADMIN_ACADEMIA)
  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() updateInstrutorDto: UpdateInstrutorDto,
  ) {
    return this.instrutoresService.update(user, id, updateInstrutorDto);
  }

  @Roles(UserRole.ADMIN_ACADEMIA)
  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.instrutoresService.remove(user, id);
  }
}
