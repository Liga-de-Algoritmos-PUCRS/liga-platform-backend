import { ApiProperty } from '@nestjs/swagger';
import {
  Difficulty,
  DEFAULT_INITIAL_POINTS,
  DEFAULT_FLOOR_POINTS,
  DEFAULT_DECREMENT,
} from '@/modules/Problem/domain/problem.entity';

/**
 * Payload de problema sem os parametros da corrida. Usado nas rotas publicas,
 * que mostram o valor corrente (`points`) mas nao como ele foi configurado.
 * Espelha `Problem.toPublicJSON()`.
 */
export class PublicProblemResponseDTO {
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
    description: 'Current value of the problem: how many points the next solver earns.',
    example: DEFAULT_INITIAL_POINTS,
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

  @ApiProperty({
    description: 'Problem fixed',
    example: false,
    required: true,
    type: Boolean,
  })
  fixed: boolean;

  @ApiProperty({
    description: 'Problem archived',
    example: false,
    required: false,
    type: Boolean,
  })
  archived?: boolean;
}

/**
 * Payload completo. Espelha `Problem.toJSON()`: e o publico mais os parametros
 * da corrida, e por isso so sai por rota admin. Herda de
 * `PublicProblemResponseDTO` para que os dois nao saiam de sincronia quando um
 * campo novo aparecer.
 */
export class ProblemResponseDTO extends PublicProblemResponseDTO {
  @ApiProperty({
    description: 'Value the problem starts at, and the ceiling of the current value.',
    example: DEFAULT_INITIAL_POINTS,
    required: true,
    type: Number,
  })
  initialPoints: number;

  @ApiProperty({
    description: 'Floor of the current value: solving never lowers the problem below it.',
    example: DEFAULT_FLOOR_POINTS,
    required: true,
    type: Number,
  })
  floorPoints: number;

  @ApiProperty({
    description: 'How much the current value drops for each distinct student who solves it.',
    example: DEFAULT_DECREMENT,
    required: true,
    type: Number,
  })
  decrement: number;
}
