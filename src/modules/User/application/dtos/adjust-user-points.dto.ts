import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class AdjustUserPointsDTO {
  @ApiProperty({
    description: 'Amount to add to (or, if negative, subtract from) allTimePoints',
    example: 20,
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  allTimePointsDelta?: number;

  @ApiProperty({
    description: 'Amount to add to (or, if negative, subtract from) monthlyPoints',
    example: -15,
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  monthlyPointsDelta?: number;
}
