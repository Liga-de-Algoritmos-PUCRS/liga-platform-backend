import { ApiProperty } from '@nestjs/swagger';
import { Course, Semester } from '@/modules/User/domain/user.entity';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateUserDTO {
  @ApiProperty({
    description: 'User name',
    example: 'Guilherme Cassol',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'User banner URL',
    example: 'https://example.com/banner.jpg',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @ApiProperty({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({
    description: 'Course the user is enrolled in',
    example: 'Computer Science',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsIn([
    'SOFTWARE_ENGINEERING',
    'DATA_SCIENCE',
    'COMPUTING_SCIENCE',
    'INFORMATION_SYSTEMS',
    'COMPUTING_ENGINEERING',
  ])
  @IsString()
  course?: Course;

  @ApiProperty({
    description: 'Current semester of the user',
    example: 'SIXTH',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsIn([
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
  ])
  @IsString()
  semester: Semester;
}
