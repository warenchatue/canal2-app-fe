import { Country } from './country'
import { Media } from './medias'

export enum UserRole {
  sale = 'Commercial',
  saleTag = 'commercial',
  respSaleTag = 'resp-commercial',
  adminSale = 'admin-Commercial',
  billing = 'Facturation',
  billingTag = 'facturation',
  respBillingTag = 'resp-facturation',
  mediaPlanner = 'Plannification',
  mediaPlannerTag = 'plannification',
  programPlanner = 'Programmation',
  journalist = 'Journaliste',
  programPlannerTag = 'programmation',
  respMediaPlannerTag = 'resp-plannification',
  respProgramPlannerTag = 'resp-programmation',
  broadcast = 'Diffusion',
  broadcastTag = 'diffusion',
  respBroadcastTag = 'resp-Diffusion',
  admin = 'Admin',
  adminTag = 'admin',
  accountancy = 'Comptable',
  accountancyTag = 'comptable',
  respAccountancyTag = 'resp-comptable',
  rh = 'RH',
  rhTag = 'rh',
  respRHTag = 'resp-rh',
  pdgTag = 'pdg',
  dgTag = 'dg',
  doTag = 'do',
  superAdmin = 'SuperAdmin',
  employee = 'Employee',
}

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
