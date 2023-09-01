import { Donation } from './donation'
import { Status } from './status'
import { User } from './user'

export type TxnType = 'donation' | 'fund-raising'

export interface Transaction {
  id?: string
  amount: number
  status: Status
  date: string
  type: TxnType
  typeId: string
  donation?: Donation
  externalTxn?: undefined
  authorId?: string
  payer?: User
  paymentMethod?: Object
}
