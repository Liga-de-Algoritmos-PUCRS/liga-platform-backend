import { Injectable } from '@nestjs/common';
import { SendEmailAdapter } from '@/infrastructure/SendEmail/sendEmail.adapter';
import { UserRepository } from '@/modules/User/domain/user.repository';
import { ReportBugServiceDTO } from './report-bug.dto';

@Injectable()
export class ReportBugService {
  constructor(
    private readonly SendEmailAdapter: SendEmailAdapter,
    private readonly UserRepository: UserRepository,
  ) {}

  async reportBug(id: string, data: ReportBugServiceDTO): Promise<void> {
    const user = await this.UserRepository.findUserById(id);

    if (!user) {
      throw new Error('User not found');
    }

    await this.SendEmailAdapter.sendEmailBugReport(user.email, user.name, data.description);
  }
}
