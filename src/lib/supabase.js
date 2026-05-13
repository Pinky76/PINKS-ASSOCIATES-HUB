import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Product types with colour coding
export const PRODUCT_TYPES = {
  business_funding: { label: 'Business Funding', color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE' },
  asset_finance: { label: 'Asset Finance', color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0' },
  invoice_finance: { label: 'Invoice Finance', color: '#F97316', bg: '#FFF7ED', border: '#FED7AA' },
  vehicle_leasing_business: { label: 'Vehicle Leasing (Business)', color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE' },
  vehicle_leasing_personal: { label: 'Vehicle Leasing (Personal)', color: '#EC4899', bg: '#FDF2F8', border: '#FBCFE8' },
  salary_sacrifice: { label: 'Salary Sacrifice', color: '#14B8A6', bg: '#F0FDFA', border: '#99F6E4' },
}

// Kanban pipeline stages — matched to Pinks CRM
export const PIPELINE_STAGES = [
  { id: 'enquiry', label: 'Enquiry' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'approved', label: 'Approved' },
  { id: 'completed', label: 'Completed' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'active', label: 'Active' },
  { id: 'lost', label: 'Lost' },
]
