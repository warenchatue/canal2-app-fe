import { Country } from './country'
import { Media } from './medias'

export type UserRole =
  | 'SuperAdmin'
  | 'Admin'
  | 'Broadcast'
  | 'Schedule'
  | 'Billing'
  | 'sales'

export interface User {
  _id?: String
  firstName?: string
  lastName?: string
  password?: string
  appRole?: any
  email: string
  phone?: string
  city?: string
  county?: Country
  medias?: Media
}
