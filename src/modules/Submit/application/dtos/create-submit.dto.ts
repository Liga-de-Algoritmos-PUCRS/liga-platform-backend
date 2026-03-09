import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateSubmitDTO {
  @ApiProperty({
    description: 'Problem id',
    example: '1',
    required: true,
    type: String,
  })
  @IsString()
  problemId: string;

  @ApiProperty({
    description: 'Answer',
    example: '1',
    required: true,
    type: String,
  })
  @IsString()
  answer: string;
}
