import { Donation } from './donation'
import { Media } from './medias'
import { Project } from './project'

export type OrgType = 'npa' | 'pa'

export interface Org {
  id?: string
  name: string
  slug: string
  type: OrgType
  medias: Media
  email?: string
  description?: string
  donations?: Donation[]
  campaigns?: Project[]
}
