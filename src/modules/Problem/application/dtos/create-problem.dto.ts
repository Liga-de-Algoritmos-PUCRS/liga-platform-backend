import { ApiProperty } from '@nestjs/swagger';
import { Difficulty } from '@/modules/Problem/domain/problem.entity';
import { IsIn, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateProblemDTO {
  @ApiProperty({
    description: 'Problem title',
    example: 'Two Sum',
    required: true,
    type: String,
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Problem description',
    example:
      'Given an array of integers, return indices of the two numbers such that they add up to a specific target.',
    required: true,
    type: String,
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Problem difficulty',
    example: 'EASY',
    required: true,
    type: String,
  })
  @IsIn(['EASY', 'MEDIUM', 'HARD'])
  @IsString()
  difficulty: Difficulty;

  @ApiProperty({
    description: 'Problem answer',
    example: '2, 7',
    required: true,
    type: String,
  })
  @IsString()
  answer: string;

  @ApiProperty({
    description: 'Problem input',
    example: '[2, 7, 11, 15], target = 9',
    required: true,
    type: String,
  })
  @IsString()
  input: string;

  @ApiProperty({
    description: 'Problem points',
    example: 100,
    required: true,
    type: Number,
  })
  @IsNumber()
  points: number;

  @ApiProperty({
    description: 'Problem banner URL',
    example: 'https://example.com/banner.jpg',
    required: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  bannerUrl: string | null;
}
