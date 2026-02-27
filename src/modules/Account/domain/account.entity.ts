export type AccountStatus = 'ACTIVE' | 'EXPIRED' | 'INACTIVE' | 'REVOKED';
export type AccountTier = 'FREE' | 'PAYMENT';

export interface AccountInterface {
  workspaceId: string;
  status: AccountStatus;
  accountTier?: AccountTier;
}

export class Account {
  id: string;
  workspaceId: string;
  status: AccountStatus;
  accountTier: AccountTier;

  constructor(account: AccountInterface, id: string) {
    this.id = id;
    this.status = account.status;
    this.workspaceId = account.workspaceId;
    this.accountTier = account.accountTier ?? 'FREE';
  }

  public toJSON() {
    return {
      id: this.id,
      workspaceId: this.workspaceId,
      status: this.status,
      accountTier: this.accountTier,
    };
  }
}
