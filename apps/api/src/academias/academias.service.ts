import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AcademiasService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.academia.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}
