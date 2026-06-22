import { Controller, Get } from '@nestjs/common';
import { AcademiasService } from './academias.service';

@Controller('academias')
export class AcademiasController {
  constructor(private readonly academiasService: AcademiasService) {}

  @Get()
  findAll() {
    return this.academiasService.findAll();
  }
}
