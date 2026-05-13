import { logout } from './auth'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (res.status === 401) {
    logout()
    if (typeof window !== 'undefined') window.location.replace('/login')
    throw new Error('Phiên đăng nhập đã hết hạn')
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message ?? `API error ${res.status}`)
  }
  return res.json()
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface ApiProperty {
  id: string
  name: string
  address: string
  floors: number
  totalRooms: number
  contractMonths: number
  contractStart: string
  baseRent: number
  photos: string[]
  rooms?: ApiRoom[]
}

export interface ApiTenant {
  id: string
  name: string
  cccd?: string | null
  phone?: string
}

export interface ApiContract {
  id: string
  roomId: string
  tenantId: string
  rent: number
  months: number
  signDate: string
  endDate: string
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED'
  vehicles: number
  tenant: ApiTenant
}

export interface ApiRoom {
  id: string
  propertyId: string
  name: string
  rent: number
  status: 'VACANT' | 'OCCUPIED' | 'UNPAID' | 'EXPIRING_SOON'
  contracts: ApiContract[]
}

export interface ApiOtherFee { label: string; amount: number }

export interface ApiInvoice {
  id: string
  invoiceNumber: string
  month: string
  roomId: string
  room?: { id: string; name: string; property?: { id: string; name: string } }
  contractId?: string
  tenantName: string
  rentAmount: number
  electricKwh: number
  electricPrice: number
  electricAmount: number
  waterM3: number
  waterPrice: number
  waterAmount: number
  internetAmount: number
  serviceAmount: number
  otherFees: ApiOtherFee[]
  totalAmount: number
  note: string
  status: 'DRAFT' | 'ISSUED' | 'PAID'
  fileUrl?: string
  createdAt: string
  issuedAt?: string
  paidAt?: string
}

// ── Properties ───────────────────────────────────────────────────────────────

export const propertiesApi = {
  list: () => req<ApiProperty[]>('/properties'),
  get: (id: string) => req<ApiProperty>(`/properties/${id}`),
  create: (data: Omit<ApiProperty, 'id' | '_count'>) =>
    req<ApiProperty>('/properties', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<ApiProperty>) =>
    req<ApiProperty>(`/properties/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: string) => req<void>(`/properties/${id}`, { method: 'DELETE' }),
}

// ── Rooms ─────────────────────────────────────────────────────────────────────

export const roomsApi = {
  listByProperty: (propertyId: string) =>
    req<ApiRoom[]>(`/properties/${propertyId}/rooms`),
  get: (id: string) => req<ApiRoom>(`/rooms/${id}`),
  create: (propertyId: string, data: { name: string; rent: number }) =>
    req<ApiRoom>(`/properties/${propertyId}/rooms`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<{ name: string; rent: number }>) =>
    req<ApiRoom>(`/rooms/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: string) => req<void>(`/rooms/${id}`, { method: 'DELETE' }),
}

// ── Tenants ───────────────────────────────────────────────────────────────────

export const tenantsApi = {
  list: () => req<ApiTenant[]>('/tenants'),
  create: (data: Omit<ApiTenant, 'id'>) =>
    req<ApiTenant>('/tenants', { method: 'POST', body: JSON.stringify(data) }),
}

// ── Contracts ─────────────────────────────────────────────────────────────────

export const contractsApi = {
  list: (status?: string) => req<ApiContract[]>(`/contracts${status ? `?status=${status}` : ''}`),
  create: (data: {
    roomId: string; tenantId: string; rent: number
    months: number; signDate: string; vehicles?: number
  }) => req<ApiContract>('/contracts', { method: 'POST', body: JSON.stringify(data) }),
  terminate: (id: string) =>
    req<ApiContract>(`/contracts/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'TERMINATED' }) }),
}

// ── Transactions ─────────────────────────────────────────────────────────────

export type TransactionType = 'INCOME' | 'EXPENSE'
export type TransactionCategory = 'RENT' | 'DEPOSIT' | 'REPAIR' | 'UTILITIES' | 'OTHER'

export interface ApiTransaction {
  id: string
  type: TransactionType
  category: TransactionCategory
  amount: number
  date: string
  note: string
  roomId?: string | null
  propertyId?: string | null
  contractId?: string | null
  invoiceId?: string | null
  createdAt: string
  room?: { id: string; name: string; property?: { id: string; name: string } } | null
  property?: { id: string; name: string } | null
}

export interface CreateTransactionPayload {
  type: TransactionType
  category: TransactionCategory
  amount: number
  date: string
  note?: string
  roomId?: string
  propertyId?: string
  contractId?: string
}

export const transactionsApi = {
  list: (params?: { type?: string; propertyId?: string; from?: string; to?: string }) => {
    const q = new URLSearchParams()
    if (params?.type) q.set('type', params.type)
    if (params?.propertyId) q.set('propertyId', params.propertyId)
    if (params?.from) q.set('from', params.from)
    if (params?.to) q.set('to', params.to)
    const qs = q.toString()
    return req<ApiTransaction[]>(`/transactions${qs ? `?${qs}` : ''}`)
  },
  create: (data: CreateTransactionPayload) =>
    req<ApiTransaction>('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<CreateTransactionPayload>) =>
    req<ApiTransaction>(`/transactions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: string) => req<void>(`/transactions/${id}`, { method: 'DELETE' }),
}

// ── Invoices ──────────────────────────────────────────────────────────────────

export interface CreateInvoicePayload {
  roomId: string; contractId?: string; month: string; tenantName: string
  rentAmount: number; electricKwh?: number; electricPrice?: number
  waterM3?: number; waterPrice?: number; internetAmount?: number
  serviceAmount?: number; otherFees?: ApiOtherFee[]; note?: string
}

export const invoicesApi = {
  list: (params?: { month?: string; roomId?: string; status?: string }) => {
    const q = new URLSearchParams()
    if (params?.month) q.set('month', params.month)
    if (params?.roomId) q.set('roomId', params.roomId)
    if (params?.status) q.set('status', params.status)
    return req<ApiInvoice[]>(`/invoices?${q}`)
  },
  get: (id: string) => req<ApiInvoice>(`/invoices/${id}`),
  create: (data: CreateInvoicePayload, status: 'draft' | 'issued' = 'draft') =>
    req<ApiInvoice>(`/invoices?status=${status}`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<CreateInvoicePayload>) =>
    req<ApiInvoice>(`/invoices/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  issue: (id: string) => req<ApiInvoice>(`/invoices/${id}/issue`, { method: 'POST' }),
  markPaid: (id: string) => req<ApiInvoice>(`/invoices/${id}/mark-paid`, { method: 'POST' }),
  remove: (id: string) => req<void>(`/invoices/${id}`, { method: 'DELETE' }),
}
