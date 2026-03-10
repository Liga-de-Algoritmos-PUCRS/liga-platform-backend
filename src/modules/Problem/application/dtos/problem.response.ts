import { ApiProperty } from '@nestjs/swagger';
import { Difficulty } from '@/modules/Problem/domain/problem.entity';

export class ProblemResponseDTO {
  @ApiProperty({
    description: 'Problem ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'Problem title',
    example: 'Two Sum',
    required: true,
    type: String,
  })
  title: string;

  @ApiProperty({
    description: 'Problem description',
    example:
      'Given an array of integers, return indices of the two numbers such that they add up to a specific target.',
    required: true,
    type: String,
  })
  description: string;

  @ApiProperty({
    description: 'Problem difficulty',
    example: 'EASY',
    required: true,
    type: String,
  })
  difficulty: Difficulty;

  @ApiProperty({
    description: 'Problem answer',
    example: '2, 7',
    required: true,
    type: String,
  })
  answer: string;

  @ApiProperty({
    description: 'Problem input',
    example: '[2, 7, 11, 15], target = 9',
    required: true,
    type: String,
  })
  input: string;

  @ApiProperty({
    description: 'Problem points',
    example: 100,
    required: true,
    type: Number,
  })
  points: number;

  @ApiProperty({
    description: 'Problem banner URL',
    example: 'https://example.com/banner.jpg',
    required: false,
    type: String,
  })
  bannerUrl?: string | null;

  @ApiProperty({
    description: 'Problem creation date',
    example: '2024-06-01T12:00:00Z',
    required: true,
    type: String,
  })
  updatedAt?: Date;

  @ApiProperty({
    description: 'Problem creation date',
    example: '2024-06-01T12:00:00Z',
    required: true,
    type: String,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Number of users who have resolved the problem',
    example: 10,
    required: true,
    type: Number,
  })
  resolved: number;

  @ApiProperty({
    description: 'Number of submissions for the problem',
    example: 100,
    required: true,
    type: Number,
  })
  submissions: number;
}
