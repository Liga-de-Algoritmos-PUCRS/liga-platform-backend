import { ApiProperty } from '@nestjs/swagger';

export class MyAttendanceHistoryItemDto {
  @ApiProperty({
    description: 'ID da chamada',
    example: 'clx123abc456',
    required: true,
    type: String,
  })
  rollCallId: string;

  @ApiProperty({
    description: 'Data da chamada no formato ISO 8601',
    example: '2026-06-02T14:00:00.000Z',
    required: true,
    type: Date,
  })
  date: Date;

  @ApiProperty({
    description: 'Se o usuário esteve presente nessa chamada',
    example: true,
    required: true,
    type: Boolean,
  })
  isPresent: boolean;
}

export class MyAttendancesResponseDto {
  @ApiProperty({
    description: 'Total de chamadas realizadas',
    example: 10,
    required: true,
    type: Number,
  })
  totalClasses: number;

  @ApiProperty({
    description: 'Total de presenças do usuário',
    example: 8,
    required: true,
    type: Number,
  })
  totalAttendances: number;

  @ApiProperty({
    description: 'Total de faltas do usuário',
    example: 2,
    required: true,
    type: Number,
  })
  totalMisses: number;

  @ApiProperty({
    description: 'Histórico de presenças por chamada',
    required: true,
    type: [MyAttendanceHistoryItemDto],
  })
  history: MyAttendanceHistoryItemDto[];
}
