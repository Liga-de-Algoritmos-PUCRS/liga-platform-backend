import { ApiProperty } from '@nestjs/swagger';

export class SubmitResponseDTO {
  @ApiProperty({
    description: 'Submit ID',
    example: '123',
    required: true,
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'Problem ID',
    example: '123',
    required: true,
    type: String,
  })
  problemId: string;

  @ApiProperty({
    description: 'User ID',
    example: '123',
    required: true,
    type: String,
  })
  userId: string;

  @ApiProperty({
    description: 'Points Earned',
    example: 10,
    required: true,
    type: Number,
  })
  pointsEarned: number;

  @ApiProperty({
    description: 'Attempts',
    example: 10,
    required: true,
    type: Number,
  })
  attempts: number;

  @ApiProperty({
    description: 'Is Finished',
    example: true,
    required: true,
    type: Boolean,
  })
  isFinished: boolean;

  @ApiProperty({
    description: 'Updated At',
    example: '2022-01-01T00:00:00.000Z',
    required: false,
    type: Date,
  })
  updatedAt?: Date;

  @ApiProperty({
    description: 'Finished At',
    example: '2022-01-01T00:00:00.000Z',
    required: false,
    type: Date,
  })
  finishedAt?: Date;

  @ApiProperty({
    description: 'Created At',
    example: '2022-01-01T00:00:00.000Z',
    required: true,
    type: Date,
  })
  createdAt: Date;
}
