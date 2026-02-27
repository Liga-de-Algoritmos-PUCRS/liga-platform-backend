import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { AccountRepository } from '@/modules/Account/domain/account.repository';
import { User } from '@/modules/User/domain/user.entity';
import { CreateUserDTO } from '@/modules/User/application/dtos/create-user.dto';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { CryptographyAdapter } from '@/infrastructure/Criptography/cryptography.adapter';
import { SendEmailAdapter } from '@/infrastructure/SendEmail/sendEmail.adapter';
import { WorkspaceRepository } from '@/modules/Workspace/domain/workspace.repository';
import { UserExceptions } from '@/infrastructure/Exceptions/exceptions.types';

@Injectable()
export class CreateUserService {
  constructor(
    private readonly UserRepository: UserRepository,
    private readonly AccountRepository: AccountRepository,
    private readonly WorkspaceRepository: WorkspaceRepository,
    private readonly CryptographyAdapter: CryptographyAdapter,
    private readonly ExceptionsAdapter: ExceptionsAdapter,
    private readonly SendEmailAdapter: SendEmailAdapter,
  ) {}

  async execute(user: CreateUserDTO, accountId: string): Promise<User> {
    const findUserEmail = await this.UserRepository.findUserByEmail(user.email);
    if (findUserEmail) {
      throw this.ExceptionsAdapter.badRequest({
        message: 'This email is already in use',
        internalKey: UserExceptions.USER_EMAIL_ALREADY_IN_USE,
      });
    }

    if (user.phone) {
      const findUserPhone = await this.UserRepository.findUserByPhone(user.phone);
      if (findUserPhone) {
        throw this.ExceptionsAdapter.badRequest({
          message: 'This phone is already in use',
          internalKey: UserExceptions.USER_PHONE_ALREADY_IN_USE,
        });
      }
    }

    const hashedPassword = await this.CryptographyAdapter.hash({
      plainText: user.password,
      hashSalt: 8,
    });

    const { name, email, phone, cpf, role } = user;

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      cpf,
      phone,
      role,
    });

    const account = await this.AccountRepository.getAccountById(String(accountId));
    if (!account) {
      throw this.ExceptionsAdapter.notFound({
        message: 'Account not found',
      });
    }

    const workspace = await this.WorkspaceRepository.getWorkspaceById(account.workspaceId);
    if (!workspace) {
      throw this.ExceptionsAdapter.notFound({
        message: 'Workspace not found',
      });
    }

    const workspaceUser: number = await this.WorkspaceRepository.countUsersInWorkspace(
      account.workspaceId,
    );

    if (workspaceUser >= workspace.maxUser) {
      throw this.ExceptionsAdapter.badRequest({
        message: 'Workspace user limit reached',
      });
    }

    const userCreated = await this.UserRepository.createUser(newUser, account.workspaceId);

    if (!userCreated) {
      throw this.ExceptionsAdapter.badRequest({
        message: 'User was not created',
        internalKey: UserExceptions.USER_NOT_CREATED,
      });
    }

    await this.SendEmailAdapter.sendEmailAccountCreated(
      userCreated.email,
      user.password,
      userCreated.name,
    );
    return userCreated;
  }
}
