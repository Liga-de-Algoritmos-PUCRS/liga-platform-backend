import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@/modules/User/domain/user.entity';
import { PublicUserResponseDTO } from './public-user.response.dto';

/**
 * Payload completo de usuario. Espelha `User.toJSON()`: e o publico mais os
 * dados pessoais, e por isso so sai por rota admin (`GET /user`) ou para o
 * proprio dono (`GET /user/me/:id`). Herda de `PublicUserResponseDTO` para
 * que os dois nao saiam de sincronia quando um campo novo aparecer.
 */
export abstract class UserResponseDTO extends PublicUserResponseDTO {
  @ApiProperty({
    description: 'User email',
    example: 'guilhemecassol@gmail.com',
    required: true,
    type: String,
  })
  email: string;

  @ApiProperty({
    description: 'User role',
    example: 'USER',
    required: true,
    enum: ['USER', 'ADMIN'],
  })
  role: Role;
}
