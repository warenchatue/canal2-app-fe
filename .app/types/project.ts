import { Donation } from './donation'

export type TeamMemberRole =
  | 'reader'
  | 'collaborator'
  | 'manager'
  | 'owner'
  | undefined

export type ProjectType = 'classic' | 'advanced' | 'custom' | undefined

export interface Tool {
  name: string
  logo: string
  description: string
}

export interface TeamMember {
  name: string
  picture: string
  role: TeamMemberRole
}

export interface Project {
  id?: string
  type?: ProjectType
  name?: string
  description?: string
  startDate?: string
  endDate?: string
  budget?: string
  contributions?: Donation[]
  files: FileList | null
  avatar?: File | null
  team?: TeamMember[]
  tools?: Tool[]
}

export interface ProjectStepData {
  preview?: boolean
  name: string
  title: string
  subtitle: string
}
