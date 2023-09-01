import { Country } from './country'
import { Media } from './medias'

export type Role = 'member' | 'admin' | 'guest'

export interface User {
  id?: String
  firstName: string
  lastName: string
  role?: Role | 'guest'
  email?: string
  city?: string
  county?: Country
  medias?: Media
}
