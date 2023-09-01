import { Status } from './status'
import { Transaction } from './transaction'
import { User } from './user'

export type DonationType = 'public' | 'anonymous' | 'private'

export interface Donation {
  id?: string
  amount: number
  type: DonationType
  status: Status
  orgId: string
  txnId?: string
  txn?: Transaction
  donorId?: string
  donor?: User
  comments?: string
}
