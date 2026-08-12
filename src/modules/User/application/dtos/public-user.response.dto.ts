import { ApiProperty } from '@nestjs/swagger';
import { Semester, Course } from '@/modules/User/domain/user.entity';

/**
 * Payload de usuario sem dados pessoais. Usado nas rotas publicas (perfil por
 * id e rankings) e na listagem de membros, que qualquer usuario autenticado
 * alcanca. Espelha `User.toPublicJSON()` -- sem `email` e sem `role`.
 */
export abstract class PublicUserResponseDTO {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'User name',
    example: 'Guilherme Cassol',
    required: true,
    type: String,
  })
  name: string;

  @ApiProperty({
    description: 'User creation date',
    example: '2023-10-05T14:48:00.000Z',
    required: true,
    type: Date,
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
    type: String,
    nullable: true,
  })
  avatarUrl: string | null;

  @ApiProperty({
    description: 'User banner URL',
    example: 'https://example.com/banner.jpg',
    required: false,
    type: String,
    nullable: true,
  })
  bannerUrl: string | null;

  @ApiProperty({
    description: 'User course',
    example: 'SOFTWARE_ENGINEERING',
    required: false,
    enum: [
      'SOFTWARE_ENGINEERING',
      'DATA_SCIENCE',
      'COMPUTING_SCIENCE',
      'INFORMATION_SYSTEMS',
      'COMPUTING_ENGINEERING',
    ],
  })
  course?: Course;

  @ApiProperty({
    description: 'User semester',
    example: 'SIXTH',
    required: false,
    enum: [
      'FIRST',
      'SECOND',
      'THIRD',
      'FOURTH',
      'FIFTH',
      'SIXTH',
      'SEVENTH',
      'EIGHTH',
      'NINTH',
      'TENTH',
      'GRADUATED',
    ],
  })
  semester?: Semester;

  @ApiProperty({
    description: "User's historical submissions",
    example: 42,
    required: false,
    type: Number,
  })
  historycalSubmissions?: number;

  @ApiProperty({
    description: "User's monthly points",
    example: 150,
    required: false,
    type: Number,
  })
  monthlyPoints?: number;

  @ApiProperty({
    description: "User's all-time points",
    example: 1200,
    required: false,
    type: Number,
  })
  allTimePoints?: number;

  @ApiProperty({
    description: "User's all-time submission",
    example: 1200,
    required: false,
    type: Number,
  })
  submissions?: number;

  @ApiProperty({
    description: 'Problems resolve by an user',
    example: 1200,
    required: false,
    type: Number,
  })
  problemsResolved?: number;
}
