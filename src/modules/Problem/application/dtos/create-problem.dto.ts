import { ApiProperty } from '@nestjs/swagger';
import {
  Difficulty,
  DEFAULT_INITIAL_POINTS,
  DEFAULT_FLOOR_POINTS,
  DEFAULT_DECREMENT,
} from '@/modules/Problem/domain/problem.entity';
import { IsIn, IsOptional, IsString, IsInt, Min, IsBoolean } from 'class-validator';

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
    description:
      'Current value of the problem: how many points the next solver earns. Optional — defaults to `initialPoints`. When sent, it is clamped to [floorPoints, initialPoints].',
    example: DEFAULT_INITIAL_POINTS,
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  @ApiProperty({
    description: 'Value the problem starts at, and the ceiling of the current value.',
    example: DEFAULT_INITIAL_POINTS,
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  initialPoints?: number;

  @ApiProperty({
    description:
      'Floor of the current value: once it is reached, solving no longer lowers the problem. Must be less than or equal to `initialPoints`.',
    example: DEFAULT_FLOOR_POINTS,
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  floorPoints?: number;

  @ApiProperty({
    description: 'How much the current value drops for each distinct student who solves it.',
    example: DEFAULT_DECREMENT,
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  decrement?: number;

  @ApiProperty({
    description: 'Problem banner URL',
    example: 'https://example.com/banner.jpg',
    required: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  bannerUrl: string | null;

  @ApiProperty({
    description: 'Problem archived',
    example: false,
    required: false,
    type: Boolean,
  })
  @IsBoolean()
  archived?: boolean;

  @ApiProperty({
    description: 'Problem fixed',
    example: false,
    required: false,
    type: Boolean,
  })
  @IsBoolean()
  fixed?: boolean;
}
