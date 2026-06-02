import { ApiProperty } from '@nestjs/swagger';

export class RollCallCountResponseDto {
  @ApiProperty({
    description: 'Total de presenças registradas na chamada',
    example: 5,
    required: true,
    type: Number,
  })
  attendances: number;
}

export class RollCallSummaryResponseDto {
  @ApiProperty({
    description: 'ID da chamada',
    example: 'clx123abc456',
    required: true,
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'Data da chamada no formato ISO 8601',
    example: '2026-06-02T14:00:00.000Z',
    required: true,
    type: Date,
  })
  date: Date;

  @ApiProperty({
    description: 'Contagens agregadas da chamada',
    required: true,
    type: RollCallCountResponseDto,
  })
  _count: RollCallCountResponseDto;
}
