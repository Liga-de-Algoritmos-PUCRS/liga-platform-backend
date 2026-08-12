import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { PublicUser } from '@/modules/User/domain/user.entity';

/**
 * Listagem de membros para a tela Integrantes, que e rota de usuario comum.
 * Devolve o payload sem dados pessoais -- a listagem com email continua
 * exclusiva do admin, em `GET /user` (GetAllUserService).
 */
@Injectable()
export class GetMembersService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<PublicUser[]> {
    const users = await this.userRepository.getUsers();

    return users.map((user) => user.toPublicJSON());
  }
}
