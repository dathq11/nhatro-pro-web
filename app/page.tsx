"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated, logout } from "@/lib/auth"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Label as RechartsLabel,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  Bell,
  Building2,
  CalendarDays,
  Car,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  Clock,
  DollarSign,
  DoorOpen,
  Droplets,
  FileText,
  Home,
  ListChecks,
  LoaderCircle,
  ImagePlus,
  UploadCloud,
  Download,
  MapPin,
  Moon,
  MoreHorizontal,
  Pencil,
  Plus,
  Receipt,
  Trash2,
  Search,
  LogOut,
  Settings,
  Sun,
  TrendingDown,
  TrendingUp,
  Users,
  X,
  Zap,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Filter,
  Info,
} from "lucide-react"
import { useTheme } from "next-themes"
import * as XLSX from "xlsx"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { propertiesApi, roomsApi, invoicesApi, contractsApi, tenantsApi, transactionsApi, type ApiRoom, type ApiInvoice, type ApiTransaction, type CreateTransactionPayload, type TransactionType, type TransactionCategory } from "@/lib/api"

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

// 12 tháng gần nhất: T6/25 → T5/26
const ALL_MONTHS = [
  "T6/25","T7/25","T8/25","T9/25","T10/25","T11/25",
  "T12/25","T1/26","T2/26","T3/26","T4/26","T5/26",
]

// [thuThue, goc] mỗi tháng theo từng toà
// goc = tiền thuê lại chủ nhà (cố định) + điện/nước/mạng/sửa chữa (biến đổi)


const cashflowConfig = {
  thuThue: { label: "Thu thuê", color: "var(--chart-1)" },
  goc: { label: "Chi phí gốc", color: "var(--chart-2)" },
  lai: { label: "Lãi", color: "var(--chart-4)" },
} satisfies ChartConfig

const todos = [
  { id: 1, type: "unpaid", phong: "P.201 – Toà A", ten: "Nguyễn Văn An", so: "2.500.000 ₫", days: 5 },
  { id: 2, type: "unpaid", phong: "P.305 – Toà B", ten: "Trần Thị Bình", so: "3.000.000 ₫", days: 3 },
  { id: 3, type: "unpaid", phong: "P.102 – Toà C", ten: "Lê Hoàng Nam", so: "2.800.000 ₫", days: 1 },
  { id: 4, type: "expiring", phong: "P.408 – Toà A", ten: "Phạm Minh Tuấn", so: "7 ngày", days: 7 },
  { id: 5, type: "expiring", phong: "P.210 – Toà B", ten: "Hoàng Thị Lan", so: "14 ngày", days: 14 },
  { id: 6, type: "expiring", phong: "P.301 – Toà D", ten: "Vũ Quang Huy", so: "28 ngày", days: 28 },
]



const navItems = [
  { icon: Home,         label: "Dashboard",   key: "dashboard" },
  { icon: Building2,    label: "Quản lý nhà", key: "properties" },
  { icon: FileText,     label: "Hoá đơn",     key: "invoices" },
  { icon: Wallet,       label: "Thu chi",     key: "transactions" },
  { icon: ListChecks,   label: "Báo cáo",     key: "reports",   wip: true },
]

const TX_CATEGORY_LABEL: Record<string, string> = {
  RENT: "Tiền thuê",
  DEPOSIT: "Tiền cọc",
  REPAIR: "Sửa chữa",
  UTILITIES: "Điện/Nước/Dịch vụ",
  OTHER: "Khác",
}

type RoomStatus = "occupied" | "vacant" | "unpaid" | "expiring" | "expired"
interface TenantInfo { name: string; cccd: string; phone?: string }
interface RoomData {
  id: string        // tên phòng (P.101)
  _dbId?: string    // DB id từ API
  _contractId?: string  // active contract DB id
  status: RoomStatus
  tenants?: TenantInfo[]
  vehicles?: number
  rent: number
  contractMonths?: number
  contractSignDate?: Date
}

const getContractEnd = (room: RoomData): string | undefined => {
  if (!room.contractSignDate || !room.contractMonths) return undefined
  const end = new Date(room.contractSignDate)
  end.setMonth(end.getMonth() + room.contractMonths)
  return `T${end.getMonth() + 1}/${end.getFullYear()}`
}

type BuildingInfo = { dbId?: string; address: string; floors: number; totalRooms: number; contractMonths: number; contractStart: string; baseRent: number; photos: string[] }



type InvoiceStatus = "draft" | "pending" | "paid"
interface InvoiceData {
  id: string
  invoiceNumber: string
  month: string        // "T5/2026"
  roomId: string
  building: string
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
  otherFees: { label: string; amount: number }[]
  totalAmount: number
  note: string
  status: InvoiceStatus
  createdAt: string
}

const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, { label: string; badge: string }> = {
  draft:   { label: "Lưu nháp",  badge: "bg-muted text-muted-foreground" },
  pending: { label: "Chờ thu",   badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  paid:    { label: "Đã thu",    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
}


const ROOM_STATUS_CONFIG: Record<RoomStatus, { label: string; dot: string; badge: string }> = {
  occupied: { label: "Đang thuê",     dot: "bg-emerald-500",        badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  vacant:   { label: "Phòng trống",   dot: "bg-muted-foreground/40", badge: "bg-muted text-muted-foreground" },
  unpaid:   { label: "Chưa thu",      dot: "bg-amber-500",          badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  expiring: { label: "Sắp hết HĐ",   dot: "bg-rose-500",           badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  expired:  { label: "Hết hạn HĐ",   dot: "bg-zinc-400",           badge: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400" },
}

const computeRoomStatus = (room: { status: RoomStatus; contractSignDate?: Date; contractMonths?: number }): RoomStatus => {
  if (room.status === "vacant") return "vacant"
  if (!room.contractSignDate || !room.contractMonths) return room.status
  const end = new Date(room.contractSignDate)
  end.setMonth(end.getMonth() + room.contractMonths)
  end.setHours(23, 59, 59, 999)
  const today = new Date()
  const daysLeft = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (daysLeft < 0) return "expired"
  if (daysLeft <= 30) return "expiring"
  return room.status === "unpaid" ? "unpaid" : "occupied"
}

const getEffectiveRoomStatus = (room: RoomData, building: string, invoices: InvoiceData[]): RoomStatus => {
  if (room.status === "vacant") return "vacant"
  const baseStatus = computeRoomStatus(room)
  if (baseStatus === "expired" || baseStatus === "expiring") return baseStatus
  const now = new Date()
  const currentMonthLabel = `T${now.getMonth() + 1}/${now.getFullYear()}`
  const currentInvoice = invoices.find(
    inv => inv.roomId === room.id && inv.building === building && inv.month === currentMonthLabel && inv.status !== "draft"
  )
  if (!currentInvoice) return baseStatus
  if (currentInvoice.status === "pending") return "unpaid"
  return "occupied"
}

const fmt = (n: number) =>
  n >= 1_000_000
    ? (n / 1_000_000).toFixed(1).replace(".0", "") + "M"
    : (n / 1_000).toFixed(0) + "k"

const MONTH_LABELS = [
  "Tháng 1","Tháng 2","Tháng 3","Tháng 4",
  "Tháng 5","Tháng 6","Tháng 7","Tháng 8",
  "Tháng 9","Tháng 10","Tháng 11","Tháng 12",
]
const MIN_PICKER_YEAR = 2025
const MAX_PICKER_YEAR = new Date().getFullYear()

function monthToIdx(year: number, month: number): number {
  return ALL_MONTHS.indexOf(`T${month}/${String(year).slice(-2)}`)
}


// ---------------------------------------------------------------------------
// API ↔ local type mapping helpers
// ---------------------------------------------------------------------------

const apiMonthToLabel = (apiMonth: string): string => {
  const [year, month] = apiMonth.split("-")
  return `T${parseInt(month)}/${year}`
}

const localMonthToApi = (month: number, year: number): string =>
  `${year}-${String(month).padStart(2, "0")}`

const apiStatusToLocal = (status: "DRAFT" | "ISSUED" | "PAID"): InvoiceStatus => {
  if (status === "DRAFT") return "draft"
  if (status === "ISSUED") return "pending"
  return "paid"
}

const mapApiInvoice = (inv: ApiInvoice): InvoiceData => ({
  id: inv.id,
  invoiceNumber: inv.invoiceNumber,
  month: apiMonthToLabel(inv.month),
  roomId: inv.room?.name ?? inv.roomId,
  building: inv.room?.property?.name ?? "",
  tenantName: inv.tenantName,
  rentAmount: inv.rentAmount,
  electricKwh: inv.electricKwh,
  electricPrice: inv.electricPrice,
  electricAmount: inv.electricAmount,
  waterM3: inv.waterM3,
  waterPrice: inv.waterPrice,
  waterAmount: inv.waterAmount,
  internetAmount: inv.internetAmount,
  serviceAmount: inv.serviceAmount,
  otherFees: inv.otherFees,
  totalAmount: inv.totalAmount,
  note: inv.note,
  status: apiStatusToLocal(inv.status),
  createdAt: new Date(inv.createdAt).toLocaleDateString("vi-VN"),
})

const mapApiRoom = (r: ApiRoom): RoomData => {
  const activeContract = r.contracts?.find(c => c.status === "ACTIVE")
  const contract = activeContract ?? r.contracts?.[0]
  let roomStatus: RoomStatus = "vacant"
  if (r.status === "OCCUPIED") roomStatus = "occupied"
  else if (r.status === "UNPAID") roomStatus = "unpaid"
  else if (r.status === "EXPIRING_SOON") roomStatus = "expiring"
  return {
    id: r.name,
    _dbId: r.id,
    _contractId: activeContract?.id,
    status: roomStatus,
    rent: contract?.rent ?? r.rent,
    vehicles: contract?.vehicles,
    tenants: contract
      ? [{ name: contract.tenant.name, cccd: contract.tenant.cccd, phone: contract.tenant.phone }]
      : undefined,
    contractMonths: contract?.months,
    contractSignDate: contract ? new Date(contract.signDate) : undefined,
  }
}

function SidebarAwareToaster() {
  const { state } = useSidebar()
  const left = state === "expanded" ? "calc(16rem + 16px)" : "16px"
  return <Toaster position="bottom-left" offset={{ left, bottom: "16px" }} />
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function DashboardContent() {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()

  // --- Cashflow filters ---
  const [period, setPeriod] = React.useState<"6m" | "1y" | "custom">("6m")
  const [selectedBuildings, setSelectedBuildings] = React.useState<string[]>([])
  const [buildingOpen, setBuildingOpen] = React.useState(false)
  const [customOpen, setCustomOpen] = React.useState(false)
  const [customFrom, setCustomFrom] = React.useState(0)
  const [customTo, setCustomTo] = React.useState(ALL_MONTHS.length - 1)
  const [pendingFrom, setPendingFrom] = React.useState<number | null>(null)
  const [pickerYear, setPickerYear] = React.useState(MAX_PICKER_YEAR)
  const [txToa, setTxToa] = React.useState<string[]>([])
  const [txToaOpen, setTxToaOpen] = React.useState(false)
  const [pendingToa, setPendingToa] = React.useState<string[]>([])
  const [pendingToaOpen, setPendingToaOpen] = React.useState(false)
  const [allBuildings, setAllBuildings] = React.useState<string[]>([])
  const [buildingInfo, setBuildingInfo] = React.useState<Record<string, BuildingInfo>>({})
  const [buildingData, setBuildingData] = React.useState<Record<string, [number, number][]>>({})
  const [propertyRooms, setPropertyRooms] = React.useState<Record<string, RoomData[]>>({})
  const [view, setView] = React.useState<"dashboard" | "properties" | "invoices" | "transactions">("dashboard")
  const [activeBuilding, setActiveBuilding] = React.useState("")
  const [roomFilter, setRoomFilter] = React.useState("all")
  const [tabsVisible, setTabsVisible] = React.useState(true)
  const [txHeaderVisible, setTxHeaderVisible] = React.useState(true)
  const txLastScrollY = React.useRef(0)
  const [photoIdx, setPhotoIdx] = React.useState<Record<string, number>>({})
  const [lightbox, setLightbox] = React.useState<{ building: string; idx: number } | null>(null)
  const [selectedRoom, setSelectedRoom] = React.useState<{ room: RoomData; building: string } | null>(null)
  const [sheetPhotoIdx, setSheetPhotoIdx] = React.useState(0)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [invoiceLoadingBtn, setInvoiceLoadingBtn] = React.useState<"save" | "publish" | "pay" | "draft" | null>(null)
  const submittingRef = React.useRef(false)
  const [addBuildingOpen, setAddBuildingOpen] = React.useState(false)
  const [buildingForm, setBuildingForm] = React.useState({ name: "", address: "", floors: "", totalRooms: "", contractMonths: "", baseRent: "" })
  const [buildingErrors, setBuildingErrors] = React.useState<Record<string, boolean>>({})
  const [contractDate, setContractDate] = React.useState<Date | undefined>()
  const [datePickerOpen, setDatePickerOpen] = React.useState(false)
  const dateTriggerMouseDown = React.useRef(false)
  const [autoCreateRooms, setAutoCreateRooms] = React.useState(false)
  const [buildingPhotoPreviews, setBuildingPhotoPreviews] = React.useState<string[]>([])
  const [existingPhotos, setExistingPhotos] = React.useState<string[]>([])
  const [editingBuilding, setEditingBuilding] = React.useState<string | null>(null)
  const buildingPhotoInputRef = React.useRef<HTMLInputElement>(null)
  const [addRoomOpen, setAddRoomOpen] = React.useState(false)
  const [addRoomBuilding, setAddRoomBuilding] = React.useState<string>("")
  const [roomForm, setRoomForm] = React.useState({ name: "" })
  const [roomErrors, setRoomErrors] = React.useState<Record<string, boolean>>({})
  const [createContract, setCreateContract] = React.useState(false)
  const [contractSwitchLocked, setContractSwitchLocked] = React.useState(false)
  const [contractForm, setContractForm] = React.useState({ rent: "", numPeople: "1", vehicles: "", months: "", signDate: undefined as Date | undefined })
  const [contractFormErrors, setContractFormErrors] = React.useState<Record<string, boolean>>({})
  const [tenants, setTenants] = React.useState<{ name: string; cccd: string; phone: string }[]>([{ name: "", cccd: "", phone: "" }])
  const [contractSignDateOpen, setContractSignDateOpen] = React.useState(false)
  const contractSignTriggerMouseDown = React.useRef(false)
  const [editRoomOpen, setEditRoomOpen] = React.useState(false)
  const [editingRoom, setEditingRoom] = React.useState<{ room: RoomData; building: string } | null>(null)
  const [releaseContractConfirmOpen, setReleaseContractConfirmOpen] = React.useState(false)
  const [deleteRoomConfirmOpen, setDeleteRoomConfirmOpen] = React.useState(false)
  const [deletingRoom, setDeletingRoom] = React.useState<{ room: RoomData; building: string } | null>(null)
  const [deleteBuildingConfirmOpen, setDeleteBuildingConfirmOpen] = React.useState(false)

  // --- Invoice ---
  const [invoices, setInvoices] = React.useState<InvoiceData[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const loadData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const [properties, apiInvoices] = await Promise.all([
        propertiesApi.list(),
        invoicesApi.list(),
      ])

      const newAllBuildings: string[] = []
      const newBuildingInfo: Record<string, BuildingInfo> = {}
      const newBuildingData: Record<string, [number, number][]> = {}
      const newPropertyRooms: Record<string, RoomData[]> = {}

      for (const prop of properties) {
        const contractStartDate = new Date(prop.contractStart)
        const contractStartStr = isNaN(contractStartDate.getTime())
          ? prop.contractStart
          : contractStartDate.toLocaleDateString("vi-VN")
        const name = prop.name
        if (newAllBuildings.includes(name)) continue
        newAllBuildings.push(name)
        newBuildingInfo[name] = {
          dbId: prop.id,
          address: prop.address,
          floors: prop.floors,
          totalRooms: prop.totalRooms,
          contractMonths: prop.contractMonths,
          contractStart: contractStartStr,
          baseRent: prop.baseRent,
          photos: prop.photos,
        }
        newBuildingData[name] = Array.from({ length: ALL_MONTHS.length }, () => [0, prop.baseRent] as [number, number])
        newPropertyRooms[name] = (prop.rooms ?? []).map(mapApiRoom)
      }

      // Tích luỹ thuThue từ invoice ISSUED + PAID vào buildingData
      for (const inv of apiInvoices) {
        if (inv.status === 'DRAFT') continue
        const bName = inv.room?.property?.name
        if (!bName || !(bName in newBuildingData)) continue
        const [yearStr, monthStr] = inv.month.split('-')
        const label = `T${parseInt(monthStr)}/${yearStr.slice(-2)}`
        const idx = ALL_MONTHS.indexOf(label)
        if (idx < 0) continue
        const [curThu, curGoc] = newBuildingData[bName][idx]
        newBuildingData[bName][idx] = [curThu + inv.totalAmount, curGoc]
      }

      setAllBuildings(newAllBuildings)
      setBuildingInfo(newBuildingInfo)
      setBuildingData(newBuildingData)
      setPropertyRooms(newPropertyRooms)
      setActiveBuilding(prev => newAllBuildings.includes(prev) ? prev : (newAllBuildings[0] ?? prev))
      setInvoices(apiInvoices.map(mapApiInvoice))
    } catch (err) {
      console.error("loadData error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => { loadData() }, [loadData])

  const TX_CACHE_KEY = 'tx-building-cache'
  type TxBuildingEntry = { propertyId: string; propertyName: string }
  const readTxCache = (): Record<string, TxBuildingEntry> => {
    try { return JSON.parse(localStorage.getItem(TX_CACHE_KEY) ?? '{}') } catch { return {} }
  }
  const writeTxCache = (txId: string, entry: TxBuildingEntry) => {
    try {
      const cache = readTxCache()
      localStorage.setItem(TX_CACHE_KEY, JSON.stringify({ ...cache, [txId]: entry }))
    } catch { /* ignore */ }
  }
  const removeTxCache = (txId: string) => {
    try {
      const cache = readTxCache()
      if (!(txId in cache)) return
      delete cache[txId]
      localStorage.setItem(TX_CACHE_KEY, JSON.stringify(cache))
    } catch { /* ignore */ }
  }

  const loadTransactions = React.useCallback(async () => {
    setTxLoading(true)
    try {
      const data = await transactionsApi.list()
      const cache = readTxCache()
      setTransactions(prev => {
        const merged = data.map(apiTx => {
          const local = prev.find(l => l.id === apiTx.id)
          const hasBuilding = !!(apiTx.room || apiTx.property)
          if (!hasBuilding) {
            // 1. Prefer local state (same session)
            if (local?.room) return { ...apiTx, room: local.room }
            if (local?.property) return { ...apiTx, property: local.property }
            // 2. Fall back to localStorage cache (across reloads)
            const cached = cache[apiTx.id]
            if (cached) return { ...apiTx, property: { id: cached.propertyId, name: cached.propertyName } }
          }
          return apiTx
        })
        const optimistic = prev.filter(l => l.id.startsWith('tx-local-') && !data.find(d => d.id === l.id))
        return [...optimistic, ...merged]
      })
    } catch { /* ignore */ } finally {
      setTxLoading(false)
    }
  }, [])

  React.useEffect(() => { loadTransactions() }, [loadTransactions])

  React.useEffect(() => {
    if (view === "transactions") {
      loadTransactions()
      setTxHeaderVisible(true)
    }
  }, [view, loadTransactions])

  const handleTxOpenDialog = (type: "INCOME" | "EXPENSE") => {
    setTxDialogType(type)
    setTxForm({ category: type === "INCOME" ? "RENT" : "OTHER", amount: "", date: new Date().toISOString().slice(0, 10), note: "", building: "", roomId: "" })
    setTxFormErrors({})
    setTxDialogOpen(true)
  }

  const handleTxSubmit = async () => {
    const errs: Record<string, boolean> = {}
    if (!txForm.amount || isNaN(Number(txForm.amount)) || Number(txForm.amount) <= 0) errs.amount = true
    if (!txForm.building) errs.building = true
    if (!txForm.note.trim()) errs.note = true
    setTxFormErrors(errs)
    if (Object.keys(errs).length > 0) return
    setTxSubmitting(true)
    const selectedRoom = txForm.roomId
      ? (propertyRooms[txForm.building] ?? []).find(r => r._dbId === txForm.roomId)
      : undefined
    const propId = buildingInfo[txForm.building]?.dbId ?? ""
    const local: ApiTransaction = {
      id: `tx-local-${Date.now()}`,
      type: txDialogType,
      category: txForm.category,
      amount: Number(txForm.amount),
      date: new Date(txForm.date).toISOString(),
      note: txForm.note,
      createdAt: new Date().toISOString(),
      room: selectedRoom
        ? { id: selectedRoom._dbId ?? "", name: selectedRoom.id, property: { id: propId, name: txForm.building } }
        : null,
      property: !selectedRoom && txForm.building ? { id: propId, name: txForm.building } : null,
    }
    setTransactions(prev => [local, ...prev])
    setTxDialogOpen(false)
    toast.success(txDialogType === "INCOME" ? "Đã ghi thu thành công" : "Đã ghi chi thành công")
    try {
      const payload: CreateTransactionPayload = {
        type: txDialogType,
        category: txForm.category,
        amount: Number(txForm.amount),
        date: txForm.date,
        note: txForm.note,
        ...(txForm.roomId ? { roomId: txForm.roomId } : { propertyId: propId || undefined }),
      }
      const created = await transactionsApi.create(payload)
      if (txForm.building && propId) writeTxCache(created.id, { propertyId: propId, propertyName: txForm.building })
      setTransactions(prev => prev.map(t =>
        t.id === local.id ? { ...created, room: created.room ?? local.room, property: created.property ?? local.property } : t
      ))
    } catch { /* best-effort – local state already updated */ } finally {
      setTxSubmitting(false)
    }
  }

  const handleTxOpenEdit = (tx: ApiTransaction) => {
    setTxEditing(tx)
    setTxForm({
      category: tx.category,
      amount: String(tx.amount),
      date: tx.date.slice(0, 10),
      note: tx.note ?? "",
      building: tx.room?.property?.name ?? tx.property?.name ?? "",
      roomId: tx.room?.id ?? "",
    })
    setTxFormErrors({})
    setTxDetailOpen(true)
  }

  const handleTxUpdate = async () => {
    if (!txEditing) return
    const errs: Record<string, boolean> = {}
    if (!txForm.amount || isNaN(Number(txForm.amount)) || Number(txForm.amount) <= 0) errs.amount = true
    if (!txForm.building) errs.building = true
    if (!txForm.note.trim()) errs.note = true
    setTxFormErrors(errs)
    if (Object.keys(errs).length > 0) return
    setTxActionLoading(true)
    const updRoom = txForm.roomId
      ? (propertyRooms[txForm.building] ?? []).find(r => r._dbId === txForm.roomId)
      : undefined
    const updPropId = buildingInfo[txForm.building]?.dbId ?? ""
    const updated: ApiTransaction = {
      ...txEditing,
      category: txForm.category,
      amount: Number(txForm.amount),
      date: new Date(txForm.date).toISOString(),
      note: txForm.note,
      room: updRoom ? { id: updRoom._dbId ?? "", name: updRoom.id, property: { id: updPropId, name: txForm.building } } : null,
      property: !updRoom && txForm.building ? { id: updPropId, name: txForm.building } : null,
    }
    setTransactions(prev => prev.map(t => t.id === txEditing.id ? updated : t))
    setTxDetailOpen(false)
    toast.success("Đã cập nhật giao dịch")
    try {
      await transactionsApi.update(txEditing.id, {
        category: txForm.category,
        amount: Number(txForm.amount),
        date: txForm.date,
        note: txForm.note,
        ...(txForm.roomId ? { roomId: txForm.roomId } : { propertyId: updPropId || undefined }),
      })
      if (txForm.building && updPropId) writeTxCache(txEditing.id, { propertyId: updPropId, propertyName: txForm.building })
    } catch { /* best-effort */ } finally {
      setTxActionLoading(false)
    }
  }

  const handleTxDelete = async (id: string) => {
    setTxActionLoading(true)
    try {
      await transactionsApi.remove(id)
      setTransactions(prev => prev.filter(t => t.id !== id))
      removeTxCache(id)
      setTxDeleteConfirm(null)
      setTxDetailOpen(false)
      toast.success("Đã xoá giao dịch")
    } catch (err: any) {
      toast.error(err.message ?? "Lỗi khi xoá giao dịch")
    } finally {
      setTxActionLoading(false)
    }
  }

  // --- Upload dialog ---
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false)
  const [uploadBuilding, setUploadBuilding] = React.useState("")
  const [uploadMonth, setUploadMonth] = React.useState(new Date().getMonth() + 1)
  const [uploadYear, setUploadYear] = React.useState(new Date().getFullYear())
  const [uploadFile, setUploadFile] = React.useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = React.useState<Record<string, string | number>[]>([])
  const [uploadErrors, setUploadErrors] = React.useState<string[]>([])
  const uploadInputRef = React.useRef<HTMLInputElement>(null)
  const [invoiceFilter, setInvoiceFilter] = React.useState<InvoiceStatus | "">()
  const [invoiceSearch, setInvoiceSearch] = React.useState("")
  const [invoiceFilterBuilding, setInvoiceFilterBuilding] = React.useState("")
  const [invoiceFilterFrom, setInvoiceFilterFrom] = React.useState<Date | undefined>(undefined)
  const [invoiceFilterTo, setInvoiceFilterTo] = React.useState<Date | undefined>(undefined)
  const [invoiceDateFromOpen, setInvoiceDateFromOpen] = React.useState(false)
  const [invoiceDateToOpen, setInvoiceDateToOpen] = React.useState(false)
  const [invoiceSort, setInvoiceSort] = React.useState<{ col: "createdAt" | "totalAmount" | "month"; dir: "asc" | "desc" } | null>(null)
  const [invoiceDialogOpen, setInvoiceDialogOpen] = React.useState(false)
  const [invoiceFromSheet, setInvoiceFromSheet] = React.useState(false)
  const [invoiceConfirm, setInvoiceConfirm] = React.useState<{ id: string; action: "issue" | "pay" | "delete" } | null>(null)
  const [errorAlert, setErrorAlert] = React.useState<{ title: string; description?: string } | null>(null)

  // ── Transactions ────────────────────────────────────────────────────────────
  const [transactions, setTransactions] = React.useState<ApiTransaction[]>([])
  const [txLoading, setTxLoading] = React.useState(false)
  const [txTab, setTxTab] = React.useState<"all" | "income" | "expense">("all")
  const [txSort, setTxSort] = React.useState<{ col: "amount" | "date"; dir: "asc" | "desc" } | null>(null)
  const [txBuildings, setTxBuildings] = React.useState<string[]>([])
  const [txSearch, setTxSearch] = React.useState("")
  const [txBuildingOpen, setTxBuildingOpen] = React.useState(false)
  const [txFrom, setTxFrom] = React.useState<Date | undefined>(undefined)
  const [txTo, setTxTo] = React.useState<Date | undefined>(undefined)
  const [txDateFromOpen, setTxDateFromOpen] = React.useState(false)
  const [txDateToOpen, setTxDateToOpen] = React.useState(false)
  const [txFormDateOpen, setTxFormDateOpen] = React.useState(false)
  const [txEditing, setTxEditing] = React.useState<ApiTransaction | null>(null)
  const [txDetailOpen, setTxDetailOpen] = React.useState(false)
  const [txDeleteConfirm, setTxDeleteConfirm] = React.useState<string | null>(null)
  const [txActionLoading, setTxActionLoading] = React.useState(false)
  const [txDialogOpen, setTxDialogOpen] = React.useState(false)
  const [txDialogType, setTxDialogType] = React.useState<"INCOME" | "EXPENSE">("INCOME")
  const [txForm, setTxForm] = React.useState({ category: "OTHER" as TransactionCategory, amount: "", date: new Date().toISOString().slice(0, 10), note: "", building: "", roomId: "" })
  const [txFormErrors, setTxFormErrors] = React.useState<Record<string, boolean>>({})
  const [txSubmitting, setTxSubmitting] = React.useState(false)
  const [editingInvoice, setEditingInvoice] = React.useState<InvoiceData | null>(null)
  const [invoiceRoomOpen, setInvoiceRoomOpen] = React.useState(false)
  const [invoiceForm, setInvoiceForm] = React.useState({
    building: "",
    roomKey: "",
    month: 5,
    year: 2026,
    rent: "",
    elecStart: "",
    elecEnd: "",
    elecPrice: "4000",
    waterStart: "",
    waterEnd: "",
    waterPrice: "15000",
    internet: "",
    service: "",
    note: "",
  })
  const [invoiceOtherFees, setInvoiceOtherFees] = React.useState<{ label: string; amount: string }[]>([])
  const [invoiceErrors, setInvoiceErrors] = React.useState<Record<string, boolean>>({})
  const [invoiceFormSnapshot, setInvoiceFormSnapshot] = React.useState<string | null>(null)

  // ── Computed stat card values ──
  const _now = new Date()
  const _currentMonthLabel = `T${_now.getMonth() + 1}/${_now.getFullYear()}`
  const _prevDate = new Date(_now.getFullYear(), _now.getMonth() - 1, 1)
  const _prevMonthLabel = `T${_prevDate.getMonth() + 1}/${_prevDate.getFullYear()}`

  const totalThuThang = invoices
    .filter(inv => inv.status === "paid" && inv.month === _currentMonthLabel)
    .reduce((sum, inv) => sum + inv.totalAmount, 0)

  const totalThuThangPrev = invoices
    .filter(inv => inv.status === "paid" && inv.month === _prevMonthLabel)
    .reduce((sum, inv) => sum + inv.totalAmount, 0)

  const thuThangChange = totalThuThangPrev > 0
    ? Math.round(((totalThuThang - totalThuThangPrev) / totalThuThangPrev) * 100)
    : 0

  const _allRooms = allBuildings.flatMap(b => (propertyRooms[b] ?? []).map(r => ({ room: r, building: b })))
  const totalRooms = _allRooms.length

  const occupiedCount = _allRooms.filter(({ room, building }) => {
    const eff = getEffectiveRoomStatus(room, building, invoices)
    return eff === "occupied" || eff === "unpaid"
  }).length

  const vacantCount = _allRooms.filter(({ room, building }) => {
    const eff = getEffectiveRoomStatus(room, building, invoices)
    return eff === "vacant"
  }).length

  const expiringCount = _allRooms.filter(({ room, building }) => {
    const eff = getEffectiveRoomStatus(room, building, invoices)
    return eff === "expiring"
  }).length

  const occupancyRate = totalRooms > 0 ? Math.round((occupiedCount / totalRooms) * 100) : 0

  const fmtVND = (n: number) => n.toLocaleString("vi-VN") + " ₫"

  const statCards = [
    {
      title: "Tổng thu tháng",
      value: fmtVND(totalThuThang),
      change: thuThangChange >= 0 ? `+${thuThangChange}%` : `${thuThangChange}%`,
      positive: thuThangChange >= 0,
      sub: "so với tháng trước",
      icon: DollarSign,
    },
    {
      title: "Phòng đang thuê",
      value: `${occupiedCount} / ${totalRooms}`,
      change: `${occupancyRate}%`,
      positive: occupancyRate >= 70,
      sub: "Tỷ lệ lấp đầy",
      icon: DoorOpen,
    },
    {
      title: "Phòng trống",
      value: `${vacantCount} phòng`,
      change: vacantCount === 0 ? "Không có" : `${vacantCount} phòng`,
      positive: vacantCount === 0,
      sub: "Cần tìm khách mới",
      icon: Home,
    },
    {
      title: "Sắp hết hợp đồng",
      value: `${expiringCount} HĐ`,
      change: expiringCount === 0 ? "Không có" : `${expiringCount} HĐ`,
      positive: expiringCount === 0,
      sub: "Trong 30 ngày tới",
      icon: ClipboardList,
    },
  ]

  const occupancyData = [
    { name: "Đang thuê", value: occupiedCount, fill: "var(--chart-1)" },
    { name: "Phòng trống", value: vacantCount, fill: "var(--chart-3)" },
    { name: "Sắp hết HĐ", value: expiringCount, fill: "var(--chart-4)" },
  ]

  const buildingProfitData = allBuildings.map(b => {
    let net = 0
    for (const tx of transactions) {
      const txBuilding = tx.room?.property?.name ?? tx.property?.name
      if (txBuilding !== b) continue
      net += tx.type === "INCOME" ? tx.amount : -tx.amount
    }
    return { fullName: b, net }
  })

  const txHistory = React.useMemo(() =>
    [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(tx => ({
        id:    tx.id,
        type:  tx.type === "INCOME" ? "income" as const : "expense" as const,
        desc:  tx.note || TX_CATEGORY_LABEL[tx.category] || tx.category,
        phong: tx.room ? `${tx.room.name}${tx.room.property ? ` – ${tx.room.property.name}` : ""}` : "",
        toa:   tx.room?.property?.name ?? tx.property?.name ?? "",
        date:  (() => {
          const d = new Date(tx.date)
          return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
        })(),
        amount: tx.amount,
      })),
  [transactions])

  const resetBuildingForm = () => {
    setBuildingForm({ name: "", address: "", floors: "", totalRooms: "", contractMonths: "", baseRent: "" })
    setBuildingErrors({})
    setContractDate(undefined)
    setAutoCreateRooms(false)
    setBuildingPhotoPreviews([])
    setExistingPhotos([])
    setEditingBuilding(null)
  }

  const handleOpenEditBuilding = (buildingName: string) => {
    const info = buildingInfo[buildingName]
    if (!info) return
    setBuildingForm({
      name: buildingName,
      address: info.address,
      floors: String(info.floors),
      totalRooms: String(info.totalRooms),
      contractMonths: String(info.contractMonths),
      baseRent: String(info.baseRent),
    })
    const parts = info.contractStart.split("/")
    if (parts.length === 3) {
      setContractDate(new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])))
    }
    setExistingPhotos(info.photos)
    setBuildingPhotoPreviews([])
    setBuildingErrors({})
    setEditingBuilding(buildingName)
    setAddBuildingOpen(true)
  }

  const handleBuildingPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setBuildingPhotoPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const handleDateSelect = (d: Date | undefined) => {
    setContractDate(d)
    setDatePickerOpen(false)
    setBuildingErrors(e => ({ ...e, contractDate: false }))
  }

  const handleDatePickerOpenChange = (open: boolean) => {
    if (!open && !dateTriggerMouseDown.current) return // block click-outside close
    dateTriggerMouseDown.current = false
    setDatePickerOpen(open)
  }

  const handleContractSignDateOpenChange = (open: boolean) => {
    if (!open && !contractSignTriggerMouseDown.current) return
    contractSignTriggerMouseDown.current = false
    setContractSignDateOpen(open)
  }

  const handleContractSignDateSelect = (d: Date | undefined) => {
    setContractForm(p => ({ ...p, signDate: d }))
    setContractSignDateOpen(false)
    setContractFormErrors(e => ({ ...e, signDate: false }))
  }

  const numericOnly = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowed = ["Backspace","Delete","ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Tab","Home","End"]
    if (!allowed.includes(e.key) && !/^\d$/.test(e.key) && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault()
    }
  }

  const handleAddBuilding = async () => {
    const errors: Record<string, boolean> = {}
    if (!buildingForm.name.trim())           errors.name = true
    if (!buildingForm.address.trim())        errors.address = true
    if (!buildingForm.floors.trim())         errors.floors = true
    if (!buildingForm.totalRooms.trim())     errors.totalRooms = true
    if (!buildingForm.contractMonths.trim()) errors.contractMonths = true
    if (!buildingForm.baseRent.trim())       errors.baseRent = true
    if (!contractDate)                        errors.contractDate = true
    if (Object.keys(errors).length) { setBuildingErrors(errors); return }
    if (submittingRef.current) return
    submittingRef.current = true
    setIsSubmitting(true)

    const name = buildingForm.name.trim()
    const updatedInfo: BuildingInfo = {
      address: buildingForm.address.trim(),
      floors: parseInt(buildingForm.floors),
      totalRooms: parseInt(buildingForm.totalRooms),
      contractMonths: parseInt(buildingForm.contractMonths),
      baseRent: parseInt(buildingForm.baseRent),
      contractStart: contractDate!.toLocaleDateString("vi-VN"),
      photos: [...existingPhotos, ...buildingPhotoPreviews],
    }

    const apiPayload = {
      name,
      address: updatedInfo.address,
      floors: updatedInfo.floors,
      totalRooms: updatedInfo.totalRooms,
      contractMonths: updatedInfo.contractMonths,
      contractStart: contractDate!.toISOString(),
      baseRent: updatedInfo.baseRent,
      photos: updatedInfo.photos,
    }

    try {
      if (editingBuilding) {
        const dbId = buildingInfo[editingBuilding]?.dbId
        if (dbId) {
          await propertiesApi.update(dbId, apiPayload)
          loadData()
        } else {
          // local mock mode
          if (name !== editingBuilding) {
            setBuildingInfo(prev => { const n = { ...prev }; delete n[editingBuilding]; n[name] = updatedInfo; return n })
            setBuildingData(prev => { const n = { ...prev }; n[name] = n[editingBuilding]; delete n[editingBuilding]; return n })
            setPropertyRooms(prev => { const n = { ...prev }; n[name] = n[editingBuilding]; delete n[editingBuilding]; return n })
            setAllBuildings(prev => prev.map(b => b === editingBuilding ? name : b))
            if (activeBuilding === editingBuilding) setActiveBuilding(name)
          } else {
            setBuildingInfo(prev => ({ ...prev, [name]: updatedInfo }))
          }
        }
      } else {
        const created = await propertiesApi.create(apiPayload)
        updatedInfo.dbId = created.id
        const emptyMonths: [number, number][] = Array.from({ length: ALL_MONTHS.length }, () => [0, parseInt(buildingForm.baseRent)] as [number, number])

        let initialRooms: RoomData[] = []
        if (autoCreateRooms && buildingForm.totalRooms.trim()) {
          const count = parseInt(buildingForm.totalRooms)
          const createdRooms = await Promise.all(
            Array.from({ length: count }, (_, i) => {
              const num = String(i + 1).padStart(2, "0")
              return roomsApi.create(created.id, { name: `P${num}`, rent: 0 })
            })
          )
          initialRooms = createdRooms.map(r => ({
            id: r.name,
            _dbId: r.id,
            status: "vacant" as RoomStatus,
            rent: 0,
          }))
        }

        setBuildingInfo(prev => ({ ...prev, [name]: updatedInfo }))
        setBuildingData(prev => ({ ...prev, [name]: emptyMonths }))
        setPropertyRooms(prev => ({ ...prev, [name]: initialRooms }))
        setAllBuildings(prev => [...prev, name])
        setActiveBuilding(name)
        setView("properties")
      }
    } catch (err: any) {
      toast.error(err.message ?? "Lỗi khi lưu toà nhà")
      submittingRef.current = false
    setIsSubmitting(false)
      return
    }

    submittingRef.current = false
    setIsSubmitting(false)
    setAddBuildingOpen(false)
    resetBuildingForm()
    toast.success(editingBuilding ? "Đã cập nhật thông tin toà nhà" : "Tạo toà nhà thành công")
  }

  const resetRoomForm = () => {
    setRoomForm({ name: "" })
    setRoomErrors({})
    setCreateContract(false)
    setContractSwitchLocked(false)
    setContractForm({ rent: "", numPeople: "1", vehicles: "", months: "", signDate: undefined })
    setContractFormErrors({})
    setTenants([{ name: "", cccd: "", phone: "" }])
    setContractSignDateOpen(false)
  }

  const handleOpenAddRoom = (building: string) => {
    setAddRoomBuilding(building)
    resetRoomForm()
    setAddRoomOpen(true)
  }

  const handleAddRoom = async () => {
    const errors: Record<string, boolean> = {}
    if (!roomForm.name.trim()) errors.name = true
    if (Object.keys(errors).length) { setRoomErrors(errors); return }

    if (createContract) {
      const cErrors: Record<string, boolean> = {}
      if (!contractForm.rent.trim()) cErrors.rent = true
      if (!contractForm.months.trim()) cErrors.months = true
      if (!contractForm.signDate) cErrors.signDate = true
      tenants.forEach((t, i) => {
        if (!t.name.trim()) cErrors[`tenant_name_${i}`] = true
        if (!t.cccd.trim()) cErrors[`tenant_cccd_${i}`] = true
      })
      if (Object.keys(cErrors).length) { setContractFormErrors(cErrors); return }
    }

    if (submittingRef.current) return
    submittingRef.current = true
    setIsSubmitting(true)

    const addContractMonths = createContract && contractForm.months.trim() ? parseInt(contractForm.months) : undefined
    const addContractSignDate = createContract ? contractForm.signDate : undefined
    const addStatus = createContract
      ? computeRoomStatus({ status: "occupied", contractSignDate: addContractSignDate, contractMonths: addContractMonths })
      : "vacant"

    const propertyDbId = buildingInfo[addRoomBuilding]?.dbId
    if (propertyDbId) {
      try {
        const createdRoom = await roomsApi.create(propertyDbId, {
          name: roomForm.name.trim(),
          rent: createContract ? parseInt(contractForm.rent) : 0,
        })
        if (createContract && contractForm.signDate) {
          const primaryTenant = tenants[0]
          const createdTenant = await tenantsApi.create({
            name: primaryTenant.name.trim(),
            cccd: primaryTenant.cccd.trim(),
            phone: primaryTenant.phone.trim() || undefined,
          })
          await contractsApi.create({
            roomId: createdRoom.id,
            tenantId: createdTenant.id,
            rent: parseInt(contractForm.rent),
            months: parseInt(contractForm.months),
            signDate: contractForm.signDate.toISOString(),
            vehicles: contractForm.vehicles.trim() ? parseInt(contractForm.vehicles) : 0,
          })
        }
        // Optimistically add room so it appears immediately
        const optimisticRoom: RoomData = {
          id: createdRoom.name,
          _dbId: createdRoom.id,
          status: addStatus,
          rent: createContract ? parseInt(contractForm.rent) : 0,
          vehicles: createContract && contractForm.vehicles.trim() ? parseInt(contractForm.vehicles) : 0,
          tenants: createContract ? tenants.map(t => ({ name: t.name.trim(), cccd: t.cccd.trim(), phone: t.phone.trim() })) : undefined,
          contractMonths: addContractMonths,
          contractSignDate: addContractSignDate,
        }
        setPropertyRooms(prev => ({ ...prev, [addRoomBuilding]: [...(prev[addRoomBuilding] ?? []), optimisticRoom] }))
        loadData()
      } catch (err: any) {
        toast.error(err.message ?? "Lỗi khi thêm phòng")
        submittingRef.current = false
        setIsSubmitting(false)
        return
      }
    } else {
      // local mock mode
      const newRoom: RoomData = {
        id: roomForm.name.trim(),
        status: addStatus,
        rent: createContract ? parseInt(contractForm.rent) : 0,
        vehicles: createContract && contractForm.vehicles.trim() ? parseInt(contractForm.vehicles) : 0,
        tenants: createContract ? tenants.map(t => ({ name: t.name.trim(), cccd: t.cccd.trim(), phone: t.phone.trim() })) : undefined,
        contractMonths: addContractMonths,
        contractSignDate: addContractSignDate,
      }
      setPropertyRooms(prev => ({ ...prev, [addRoomBuilding]: [...(prev[addRoomBuilding] ?? []), newRoom] }))
    }

    submittingRef.current = false
    setIsSubmitting(false)
    setAddRoomOpen(false)
    resetRoomForm()
    toast.success("Thêm phòng thành công")
  }

  React.useEffect(() => {
    const n = Math.max(1, parseInt(contractForm.numPeople) || 1)
    setTenants(prev => {
      if (prev.length === n) return prev
      if (prev.length < n) return [...prev, ...Array.from({ length: n - prev.length }, () => ({ name: "", cccd: "", phone: "" }))]
      return prev.slice(0, n)
    })
  }, [contractForm.numPeople])

  const handleOpenEditRoom = (room: RoomData, building: string, forceContract = false) => {
    setEditingRoom({ room, building })
    setRoomForm({ name: room.id })
    const hasContract = room.status !== "vacant"
    setCreateContract(hasContract || forceContract)
    setContractSwitchLocked(forceContract)
    setContractForm({
      rent: hasContract ? String(room.rent) : "",
      numPeople: hasContract && room.tenants?.length ? String(room.tenants.length) : "1",
      vehicles: hasContract && room.vehicles ? String(room.vehicles) : "",
      months: hasContract && room.contractMonths ? String(room.contractMonths) : "",
      signDate: hasContract ? room.contractSignDate : undefined,
    })
    setTenants(hasContract && room.tenants?.length
      ? room.tenants.map(t => ({ name: t.name, cccd: t.cccd, phone: t.phone ?? "" }))
      : [{ name: "", cccd: "", phone: "" }]
    )
    setRoomErrors({})
    setContractFormErrors({})
    setContractSignDateOpen(false)
    setEditRoomOpen(true)
  }

  const handleSaveRoom = async () => {
    if (!editingRoom) return
    const errors: Record<string, boolean> = {}
    if (!roomForm.name.trim()) errors.name = true
    if (Object.keys(errors).length) { setRoomErrors(errors); return }

    const hasContract = editingRoom.room.status !== "vacant"
    if (hasContract || createContract) {
      const cErrors: Record<string, boolean> = {}
      if (!contractForm.rent.trim()) cErrors.rent = true
      if (!contractForm.months.trim()) cErrors.months = true
      if (!contractForm.signDate) cErrors.signDate = true
      tenants.forEach((t, i) => {
        if (!t.name.trim()) cErrors[`tenant_name_${i}`] = true
        if (!t.cccd.trim()) cErrors[`tenant_cccd_${i}`] = true
      })
      if (Object.keys(cErrors).length) { setContractFormErrors(cErrors); return }
    }

    if (submittingRef.current) return
    submittingRef.current = true
    setIsSubmitting(true)

    const withContract = editingRoom.room.status !== "vacant" || createContract
    const contractMonths = withContract && contractForm.months.trim() ? parseInt(contractForm.months) : undefined
    const contractSignDate = withContract ? contractForm.signDate : undefined
    const draft = { status: withContract ? editingRoom.room.status : "vacant" as RoomStatus, contractSignDate, contractMonths }
    const computedStatus = withContract ? computeRoomStatus(draft) : "vacant" as RoomStatus

    const roomDbId = editingRoom.room._dbId
    if (roomDbId) {
      try {
        // 1. Update room name / rent
        await roomsApi.update(roomDbId, {
          name: roomForm.name.trim(),
          rent: withContract ? parseInt(contractForm.rent) : 0,
        })

        // 2. Contract changes
        if (withContract && contractForm.signDate) {
          // Terminate old contract if exists, then create new one
          if (editingRoom.room._contractId) {
            await contractsApi.terminate(editingRoom.room._contractId)
          }
          const primaryTenant = tenants[0]
          const createdTenant = await tenantsApi.create({
            name: primaryTenant.name.trim(),
            cccd: primaryTenant.cccd.trim(),
            phone: primaryTenant.phone.trim() || undefined,
          })
          await contractsApi.create({
            roomId: roomDbId,
            tenantId: createdTenant.id,
            rent: parseInt(contractForm.rent),
            months: parseInt(contractForm.months),
            signDate: contractForm.signDate.toISOString(),
            vehicles: contractForm.vehicles.trim() ? parseInt(contractForm.vehicles) : 0,
          })
        }

        const updated: RoomData = {
          id: roomForm.name.trim(),
          _dbId: roomDbId,
          _contractId: editingRoom.room._contractId,
          status: computedStatus,
          rent: withContract ? parseInt(contractForm.rent) : 0,
          vehicles: withContract && contractForm.vehicles.trim() ? parseInt(contractForm.vehicles) : 0,
          tenants: withContract ? tenants.map(t => ({ name: t.name.trim(), cccd: t.cccd.trim(), phone: t.phone.trim() })) : undefined,
          contractMonths,
          contractSignDate,
        }
        setPropertyRooms(prev => ({
          ...prev,
          [editingRoom.building]: prev[editingRoom.building].map(r => r.id === editingRoom.room.id ? updated : r),
        }))
        if (selectedRoom?.room.id === editingRoom.room.id) {
          setSelectedRoom({ room: updated, building: editingRoom.building })
        }
        loadData()
      } catch (err: any) {
        toast.error(err.message ?? "Lỗi khi cập nhật phòng")
        submittingRef.current = false
        setIsSubmitting(false)
        return
      }
    } else {
      // local mock mode
      const updated: RoomData = {
        id: roomForm.name.trim(),
        status: computedStatus,
        rent: withContract ? parseInt(contractForm.rent) : 0,
        vehicles: withContract && contractForm.vehicles.trim() ? parseInt(contractForm.vehicles) : 0,
        tenants: withContract ? tenants.map(t => ({ name: t.name.trim(), cccd: t.cccd.trim(), phone: t.phone.trim() })) : undefined,
        contractMonths,
        contractSignDate,
      }
      setPropertyRooms(prev => ({
        ...prev,
        [editingRoom.building]: prev[editingRoom.building].map(r => r.id === editingRoom.room.id ? updated : r),
      }))
      if (selectedRoom?.room.id === editingRoom.room.id) {
        setSelectedRoom({ room: updated, building: editingRoom.building })
      }
    }

    submittingRef.current = false
    setIsSubmitting(false)
    setEditRoomOpen(false)
    resetRoomForm()
    setEditingRoom(null)
    toast.success("Đã cập nhật thông tin phòng")
  }

  const handleConfirmReleaseContract = async () => {
    if (!editingRoom) return
    if (submittingRef.current) return
    submittingRef.current = true
    setIsSubmitting(true)

    const contractDbId = editingRoom.room._contractId
    const roomDbId = editingRoom.room._dbId
    if (contractDbId && roomDbId) {
      try {
        await contractsApi.terminate(contractDbId)
      } catch (err: any) {
        toast.error(err.message ?? "Lỗi khi giải phóng hợp đồng")
        submittingRef.current = false
    setIsSubmitting(false)
        setReleaseContractConfirmOpen(false)
        return
      }
    }
    const released: RoomData = {
      id: editingRoom.room.id,
      status: "vacant",
      rent: 0,
      vehicles: 0,
    }
    setPropertyRooms(prev => ({
      ...prev,
      [editingRoom.building]: prev[editingRoom.building].map(r => r.id === editingRoom.room.id ? released : r),
    }))
    if (selectedRoom?.room.id === editingRoom.room.id) {
      setSelectedRoom({ room: released, building: editingRoom.building })
    }

    submittingRef.current = false
    setIsSubmitting(false)
    setReleaseContractConfirmOpen(false)
    setEditRoomOpen(false)
    resetRoomForm()
    setEditingRoom(null)
    toast.success("Đã giải phóng hợp đồng, phòng chuyển về trạng thái trống")
  }

  const handleOpenDeleteRoom = (room: RoomData, building: string) => {
    setDeletingRoom({ room, building })
    setDeleteRoomConfirmOpen(true)
  }

  const handleConfirmDeleteRoom = async () => {
    if (!deletingRoom) return
    if (submittingRef.current) return
    submittingRef.current = true
    setIsSubmitting(true)
    const roomDbId = deletingRoom.room._dbId
    if (roomDbId) {
      try {
        await roomsApi.remove(roomDbId)
      } catch (err: any) {
        toast.error(err.message ?? "Lỗi khi xoá phòng")
        submittingRef.current = false
    setIsSubmitting(false)
        setDeleteRoomConfirmOpen(false)
        setDeletingRoom(null)
        return
      }
    }
    setPropertyRooms(prev => ({
      ...prev,
      [deletingRoom.building]: prev[deletingRoom.building].filter(r => r.id !== deletingRoom.room.id),
    }))
    if (selectedRoom?.room.id === deletingRoom.room.id) setSelectedRoom(null)
    submittingRef.current = false
    setIsSubmitting(false)
    setDeleteRoomConfirmOpen(false)
    setDeletingRoom(null)
    toast.success("Đã xoá phòng")
  }

  const handleConfirmDeleteBuilding = async () => {
    if (submittingRef.current) return
    submittingRef.current = true
    setIsSubmitting(true)
    const dbId = buildingInfo[activeBuilding]?.dbId
    if (dbId) {
      try {
        await propertiesApi.remove(dbId)
      } catch (err: any) {
        toast.error(err.message ?? "Lỗi khi xoá toà nhà")
        submittingRef.current = false
    setIsSubmitting(false)
        setDeleteBuildingConfirmOpen(false)
        return
      }
    }
    setAllBuildings(prev => prev.filter(b => b !== activeBuilding))
    setBuildingInfo(prev => { const n = { ...prev }; delete n[activeBuilding]; return n })
    setBuildingData(prev => { const n = { ...prev }; delete n[activeBuilding]; return n })
    setPropertyRooms(prev => { const n = { ...prev }; delete n[activeBuilding]; return n })
    setActiveBuilding(prev => {
      const remaining = allBuildings.filter(b => b !== activeBuilding)
      return remaining[0] ?? ""
    })
    submittingRef.current = false
    setIsSubmitting(false)
    setDeleteBuildingConfirmOpen(false)
    toast.success("Đã xoá toà nhà")
  }

  const lastScrollY = React.useRef(0)
  const scrollDir = React.useRef<"down" | "up">("down")
  const accDelta = React.useRef(0)
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const stickyHeaderRef = React.useRef<HTMLDivElement>(null)
  const stickyTabsRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handler = (e: WheelEvent) => {
      if (view !== "properties") return
      e.preventDefault()
      scrollContainerRef.current?.scrollBy({ top: e.deltaY, behavior: "instant" as ScrollBehavior })
    }
    const opts: AddEventListenerOptions = { passive: false }
    stickyHeaderRef.current?.addEventListener("wheel", handler, opts)
    stickyTabsRef.current?.addEventListener("wheel", handler, opts)
    return () => {
      stickyHeaderRef.current?.removeEventListener("wheel", handler, opts)
      stickyTabsRef.current?.removeEventListener("wheel", handler, opts)
    }
  }, [view])


  const handleRoomScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const y = e.currentTarget.scrollTop
    const raw = y - lastScrollY.current
    lastScrollY.current = y

    if (Math.abs(raw) < 1) return

    const dir = raw > 0 ? "down" : "up"
    if (dir !== scrollDir.current) {
      scrollDir.current = dir
      accDelta.current = 0
    }
    accDelta.current += Math.abs(raw)

    if (dir === "down" && accDelta.current > 4) {
      setTabsVisible(false)
      accDelta.current = 0
    } else if (dir === "up" && accDelta.current > 30) {
      setTabsVisible(true)
      accDelta.current = 0
    }
  }, [])

  const handleMonthClick = (idx: number) => {
    if (idx < 0) return
    if (pendingFrom === null) {
      setPendingFrom(idx)
    } else {
      const from = Math.min(pendingFrom, idx)
      const to   = Math.max(pendingFrom, idx)
      setCustomFrom(from)
      setCustomTo(to)
      setPendingFrom(null)
      setPeriod("custom")
      setCustomOpen(false)
    }
  }

  const chartData = React.useMemo(() => {
    let startIdx: number, endIdx: number
    if (period === "6m") {
      startIdx = ALL_MONTHS.length - 6
      endIdx = ALL_MONTHS.length - 1
    } else if (period === "1y") {
      startIdx = 0
      endIdx = ALL_MONTHS.length - 1
    } else {
      startIdx = customFrom
      endIdx = customTo
    }
    const buildings = selectedBuildings.length === 0 ? allBuildings : selectedBuildings
    return ALL_MONTHS.slice(startIdx, endIdx + 1).map((thang, i) => {
      const idx = startIdx + i
      let thuThue = 0, goc = 0
      buildings.forEach((b: string) => { thuThue += buildingData[b]?.[idx]?.[0] ?? 0; goc += buildingData[b]?.[idx]?.[1] ?? 0 })
      return { thang, thuThue, goc, lai: thuThue - goc }
    })
  }, [period, selectedBuildings, customFrom, customTo, buildingData, allBuildings])

  const toggleBuilding = (b: string) =>
    setSelectedBuildings((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]
    )
  const togglePendingToa = (b: string) =>
    setPendingToa((prev) => prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b])
  const toggleTxToa = (b: string) =>
    setTxToa((prev) => prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b])

  const unpaid = todos.filter((t) => t.type === "unpaid")

  const resetInvoiceForm = () => {
    setInvoiceForm({ building: "", roomKey: "", month: 5, year: 2026, rent: "", elecStart: "", elecEnd: "", elecPrice: "4000", waterStart: "", waterEnd: "", waterPrice: "15000", internet: "", service: "", note: "" })
    setInvoiceOtherFees([])
    setInvoiceErrors({})
    setInvoiceRoomOpen(false)
    setInvoiceFormSnapshot(null)
  }

  const loadInvoiceIntoForm = (inv: InvoiceData) => {
    const parts = inv.month.replace("T", "").split("/").map(Number)
    const month = parts[0]
    const year = parts[1]
    const form = {
      building: inv.building,
      roomKey: `${inv.roomId}||${inv.building}`,
      month,
      year,
      rent: String(inv.rentAmount),
      elecStart: "0",
      elecEnd: String(inv.electricKwh),
      elecPrice: String(inv.electricPrice),
      waterStart: "0",
      waterEnd: String(inv.waterM3),
      waterPrice: String(inv.waterPrice),
      internet: String(inv.internetAmount),
      service: String(inv.serviceAmount),
      note: inv.note,
    }
    const otherFees = inv.otherFees.map(f => ({ label: f.label, amount: String(f.amount) }))
    setInvoiceForm(form)
    setInvoiceOtherFees(otherFees)
    setInvoiceErrors({})
    setInvoiceRoomOpen(false)
    setInvoiceFormSnapshot(JSON.stringify({ form, otherFees }))
  }

  const parseViDate = (s: string): Date => {
    const [d, m, y] = s.split("/").map(Number)
    return new Date(y, m - 1, d)
  }

  const filteredInvoices = React.useMemo(() => {
    return invoices.filter(inv => {
      if (invoiceSearch) {
        const q = invoiceSearch.toLowerCase()
        if (
          !inv.invoiceNumber.toLowerCase().includes(q) &&
          !inv.roomId.toLowerCase().includes(q) &&
          !inv.tenantName.toLowerCase().includes(q)
        ) return false
      }
      if (invoiceFilterBuilding && inv.building !== invoiceFilterBuilding) return false
      if (invoiceFilter && inv.status !== invoiceFilter) return false
      if (invoiceFilterFrom) {
        if (parseViDate(inv.createdAt) < invoiceFilterFrom) return false
      }
      if (invoiceFilterTo) {
        const to = new Date(invoiceFilterTo)
        to.setHours(23, 59, 59)
        if (parseViDate(inv.createdAt) > to) return false
      }
      return true
    })
  }, [invoices, invoiceSearch, invoiceFilterBuilding, invoiceFilter, invoiceFilterFrom, invoiceFilterTo])

  const sortedInvoices = React.useMemo(() => {
    if (!invoiceSort) return filteredInvoices
    return [...filteredInvoices].sort((a, b) => {
      const mul = invoiceSort.dir === "asc" ? 1 : -1
      if (invoiceSort.col === "totalAmount") return (a.totalAmount - b.totalAmount) * mul
      if (invoiceSort.col === "month") {
        const toMs = (m: string) => { const [mo, yr] = m.replace("T","").split("/").map(Number); return yr * 100 + mo }
        return (toMs(a.month) - toMs(b.month)) * mul
      }
      return (parseViDate(a.createdAt).getTime() - parseViDate(b.createdAt).getTime()) * mul
    })
  }, [filteredInvoices, invoiceSort])

  const toggleSort = (col: "createdAt" | "totalAmount" | "month") => {
    setInvoiceSort(prev =>
      prev?.col === col
        ? prev.dir === "asc" ? { col, dir: "desc" } : null
        : { col, dir: "asc" }
    )
  }

  const calcInvoiceTotal = () => {
    const rent = parseInt(invoiceForm.rent) || 0
    const elecKwh = Math.max(0, (parseInt(invoiceForm.elecEnd) || 0) - (parseInt(invoiceForm.elecStart) || 0))
    const elecPrice = parseInt(invoiceForm.elecPrice) || 0
    const elecAmt = elecKwh * elecPrice
    const waterM3 = Math.max(0, (parseInt(invoiceForm.waterEnd) || 0) - (parseInt(invoiceForm.waterStart) || 0))
    const waterPrice = parseInt(invoiceForm.waterPrice) || 0
    const waterAmt = waterM3 * waterPrice
    const internetAmt = parseInt(invoiceForm.internet) || 0
    const serviceAmt = parseInt(invoiceForm.service) || 0
    const otherAmt = invoiceOtherFees.reduce((s, f) => s + (parseInt(f.amount) || 0), 0)
    return { rent, elecKwh, elecPrice, elecAmt, waterM3, waterPrice, waterAmt, internetAmt, serviceAmt, otherAmt, total: rent + elecAmt + waterAmt + internetAmt + serviceAmt + otherAmt }
  }

  const generateInvoiceHTML = (inv: InvoiceData) => {
    const rows = [
      inv.rentAmount > 0 ? `<tr><td>Tiền thuê phòng</td><td>${inv.rentAmount.toLocaleString("vi-VN")} ₫</td></tr>` : "",
      inv.electricAmount > 0 ? `<tr><td>Tiền điện${inv.electricKwh > 0 ? ` (${inv.electricKwh} kWh × ${inv.electricPrice.toLocaleString("vi-VN")} ₫/kWh)` : ""}</td><td>${inv.electricAmount.toLocaleString("vi-VN")} ₫</td></tr>` : "",
      inv.waterAmount > 0 ? `<tr><td>Tiền nước${inv.waterM3 > 0 ? ` (${inv.waterM3} m³ × ${inv.waterPrice.toLocaleString("vi-VN")} ₫/m³)` : ""}</td><td>${inv.waterAmount.toLocaleString("vi-VN")} ₫</td></tr>` : "",
      inv.internetAmount > 0 ? `<tr><td>Phí internet</td><td>${inv.internetAmount.toLocaleString("vi-VN")} ₫</td></tr>` : "",
      inv.serviceAmount > 0 ? `<tr><td>Phí dịch vụ</td><td>${inv.serviceAmount.toLocaleString("vi-VN")} ₫</td></tr>` : "",
      ...inv.otherFees.map(f => `<tr><td>${f.label}</td><td>${f.amount.toLocaleString("vi-VN")} ₫</td></tr>`),
    ].filter(Boolean).join("")
    return `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><title>${inv.invoiceNumber}</title><style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:"Segoe UI",Arial,sans-serif;color:#111;background:#fff;padding:40px;max-width:640px;margin:0 auto}
      .header{text-align:center;margin-bottom:24px}
      h1{font-size:22px;font-weight:700;letter-spacing:.5px;margin-bottom:4px}
      .sub{font-size:13px;color:#666}
      .info{border:1px solid #e5e7eb;border-radius:8px;padding:14px 16px;margin:20px 0;display:grid;grid-template-columns:1fr 1fr;gap:6px}
      .info-row{font-size:13px}.info-label{color:#666;font-size:12px;margin-bottom:2px}
      table{width:100%;border-collapse:collapse;margin-bottom:16px}
      thead tr{background:#f9fafb}
      th{padding:10px 12px;text-align:left;font-size:13px;color:#374151;border-bottom:2px solid #e5e7eb}
      th:last-child{text-align:right}
      td{padding:9px 12px;font-size:13px;border-bottom:1px solid #f3f4f6}
      td:last-child{text-align:right}
      tfoot td{font-weight:700;font-size:15px;border-top:2px solid #111;border-bottom:none;padding-top:12px}
      .note{font-size:12px;color:#888;margin-top:16px;font-style:italic}
      @media print{body{padding:20px}}
    </style></head><body>
      <div class="header">
        <h1>HÓA ĐƠN TIỀN PHÒNG</h1>
        <div class="sub">${inv.invoiceNumber}</div>
      </div>
      <div class="info">
        <div><div class="info-label">Người thuê</div><div class="info-row"><strong>${inv.tenantName}</strong></div></div>
        <div><div class="info-label">Kỳ thuê</div><div class="info-row"><strong>${inv.month}</strong></div></div>
        <div><div class="info-label">Phòng</div><div class="info-row">${inv.roomId} – ${inv.building}</div></div>
        <div><div class="info-label">Ngày tạo</div><div class="info-row">${inv.createdAt}</div></div>
      </div>
      <table>
        <thead><tr><th>Nội dung</th><th>Số tiền</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr><td>TỔNG CỘNG</td><td>${inv.totalAmount.toLocaleString("vi-VN")} ₫</td></tr></tfoot>
      </table>
      ${inv.note ? `<div class="note">Ghi chú: ${inv.note}</div>` : ""}
    </body></html>`
  }

  const handleDownloadPDF = async (inv: InvoiceData) => {
    const { jsPDF } = await import("jspdf")
    const html2canvas = (await import("html2canvas")).default

    const iframe = document.createElement("iframe")
    iframe.style.cssText = "position:fixed;left:-9999px;top:0;width:640px;height:900px;border:none;visibility:hidden"
    document.body.appendChild(iframe)

    try {
      await new Promise<void>((resolve) => {
        iframe.onload = () => resolve()
        iframe.srcdoc = generateInvoiceHTML(inv)
      })

      const body = iframe.contentDocument?.body
      if (!body) return

      const canvas = await html2canvas(body, { scale: 2, useCORS: true, backgroundColor: "#fff", windowWidth: 640 })
      const imgData = canvas.toDataURL("image/png")

      const doc = new jsPDF({ unit: "px", format: "a4", orientation: "portrait" })
      const pageW = doc.internal.pageSize.getWidth()
      const pageH = doc.internal.pageSize.getHeight()
      const ratio = pageW / canvas.width
      const imgH = canvas.height * ratio
      let y = 0
      while (y < imgH) {
        if (y > 0) doc.addPage()
        doc.addImage(imgData, "PNG", 0, -y, pageW, imgH)
        y += pageH
      }

      const filename = `${inv.building} - ${inv.roomId} - ${inv.month}.pdf`
      const pdfBlob = doc.output("blob")

      if ("showSaveFilePicker" in window) {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: filename,
          types: [{ description: "PDF", accept: { "application/pdf": [".pdf"] } }],
        })
        const writable = await fileHandle.createWritable()
        await writable.write(pdfBlob)
        await writable.close()
      } else {
        const url = URL.createObjectURL(pdfBlob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
      }
    } finally {
      document.body.removeChild(iframe)
    }
  }

  const handleSaveInvoice = async (status: InvoiceStatus = "draft") => {
    const errs: Record<string, boolean> = {}
    if (!invoiceForm.building) errs.building = true
    if (!invoiceForm.roomKey) errs.roomKey = true
    if (!invoiceForm.rent.trim() || isNaN(parseInt(invoiceForm.rent))) errs.rent = true
    if (invoiceForm.elecStart.trim() === "") errs.elecStart = true
    if (!invoiceForm.elecEnd.trim() || isNaN(parseInt(invoiceForm.elecEnd))) errs.elecEnd = true
    if (!errs.elecStart && !errs.elecEnd && parseInt(invoiceForm.elecEnd) < parseInt(invoiceForm.elecStart)) errs.elecEndRange = true
    if (!invoiceForm.elecPrice.trim() || isNaN(parseInt(invoiceForm.elecPrice))) errs.elecPrice = true
    if (invoiceForm.waterStart.trim() === "") errs.waterStart = true
    if (!invoiceForm.waterEnd.trim() || isNaN(parseInt(invoiceForm.waterEnd))) errs.waterEnd = true
    if (!errs.waterStart && !errs.waterEnd && parseInt(invoiceForm.waterEnd) < parseInt(invoiceForm.waterStart)) errs.waterEndRange = true
    if (!invoiceForm.waterPrice.trim() || isNaN(parseInt(invoiceForm.waterPrice))) errs.waterPrice = true
    if (invoiceForm.internet.trim() === "") errs.internet = true
    if (invoiceForm.service.trim() === "") errs.service = true
    invoiceOtherFees.forEach((f, i) => {
      if (!f.label.trim()) errs[`fee_label_${i}`] = true
      if (!f.amount.trim() || isNaN(parseInt(f.amount))) errs[`fee_amount_${i}`] = true
    })
    if (Object.keys(errs).length) { setInvoiceErrors(errs); return }

    const [roomId, building] = invoiceForm.roomKey.split("||")
    const monthLabel = `T${invoiceForm.month}/${invoiceForm.year}`

    if (status === "pending") {
      const duplicate = invoices.find(inv => inv.roomId === roomId && inv.building === building && inv.month === monthLabel && inv.status !== "draft")
      if (duplicate) { setInvoiceErrors(e => ({ ...e, roomKey: true, roomKeyDuplicate: true })); return }
    }

    const room = (propertyRooms[building] ?? []).find(r => r.id === roomId)
    const tenantName = room?.tenants?.[0]?.name ?? "—"
    const { rent, elecKwh, elecPrice, elecAmt, waterM3, waterPrice, waterAmt, internetAmt, serviceAmt, total } = calcInvoiceTotal()

    const roomDbId = room?._dbId
    setIsSubmitting(true)
    setInvoiceLoadingBtn(status === "pending" ? "publish" : "draft")
    if (roomDbId) {
      try {
        await invoicesApi.create({
          roomId: roomDbId,
          month: localMonthToApi(invoiceForm.month, invoiceForm.year),
          tenantName,
          rentAmount: rent,
          electricKwh: elecKwh,
          electricPrice: elecPrice,
          waterM3,
          waterPrice,
          internetAmount: internetAmt,
          serviceAmount: serviceAmt,
          otherFees: invoiceOtherFees.map(f => ({ label: f.label, amount: parseInt(f.amount) })),
          note: invoiceForm.note,
        }, status === "pending" ? "issued" : "draft")
        await loadData()
      } catch (err: any) {
        toast.error(err.message ?? "Lỗi khi lưu hoá đơn")
        setIsSubmitting(false)
        return
      }
    } else {
      // local mock mode
      const invoiceNumber = `${building} - ${roomId} - ${monthLabel}`
      const newInvoice: InvoiceData = {
        id: `inv-${Date.now()}`,
        invoiceNumber,
        month: monthLabel,
        roomId,
        building,
        tenantName,
        rentAmount: rent,
        electricKwh: elecKwh,
        electricPrice: elecPrice,
        electricAmount: elecAmt,
        waterM3,
        waterPrice,
        waterAmount: waterAmt,
        internetAmount: internetAmt,
        serviceAmount: serviceAmt,
        otherFees: invoiceOtherFees.map(f => ({ label: f.label, amount: parseInt(f.amount) })),
        totalAmount: total,
        note: invoiceForm.note,
        status,
        createdAt: new Date().toLocaleDateString("vi-VN"),
      }
      setInvoices(prev => [newInvoice, ...prev])
    }

    setIsSubmitting(false)
    setInvoiceLoadingBtn(null)
    setInvoiceDialogOpen(false)
    resetInvoiceForm()
    toast.success(status === "pending" ? "Hoá đơn đã được phát hành" : "Đã lưu nháp hoá đơn")
  }

  const handleUpdateInvoice = async (publishNow = false) => {
    if (!editingInvoice) return
    const errs: Record<string, boolean> = {}
    if (!invoiceForm.building) errs.building = true
    if (!invoiceForm.roomKey) errs.roomKey = true
    if (!invoiceForm.rent.trim() || isNaN(parseInt(invoiceForm.rent))) errs.rent = true
    if (invoiceForm.elecStart.trim() === "") errs.elecStart = true
    if (!invoiceForm.elecEnd.trim() || isNaN(parseInt(invoiceForm.elecEnd))) errs.elecEnd = true
    if (!errs.elecStart && !errs.elecEnd && parseInt(invoiceForm.elecEnd) < parseInt(invoiceForm.elecStart)) errs.elecEndRange = true
    if (!invoiceForm.elecPrice.trim() || isNaN(parseInt(invoiceForm.elecPrice))) errs.elecPrice = true
    if (invoiceForm.waterStart.trim() === "") errs.waterStart = true
    if (!invoiceForm.waterEnd.trim() || isNaN(parseInt(invoiceForm.waterEnd))) errs.waterEnd = true
    if (!errs.waterStart && !errs.waterEnd && parseInt(invoiceForm.waterEnd) < parseInt(invoiceForm.waterStart)) errs.waterEndRange = true
    if (!invoiceForm.waterPrice.trim() || isNaN(parseInt(invoiceForm.waterPrice))) errs.waterPrice = true
    if (invoiceForm.internet.trim() === "") errs.internet = true
    if (invoiceForm.service.trim() === "") errs.service = true
    invoiceOtherFees.forEach((f, i) => {
      if (!f.label.trim()) errs[`fee_label_${i}`] = true
      if (!f.amount.trim() || isNaN(parseInt(f.amount))) errs[`fee_amount_${i}`] = true
    })
    if (Object.keys(errs).length) { setInvoiceErrors(errs); return }

    const [roomId, building] = invoiceForm.roomKey.split("||")
    const monthLabel = `T${invoiceForm.month}/${invoiceForm.year}`

    if (publishNow && editingInvoice.status === "draft") {
      const duplicate = invoices.find(inv => inv.id !== editingInvoice.id && inv.roomId === roomId && inv.building === building && inv.month === monthLabel && inv.status !== "draft")
      if (duplicate) { setInvoiceErrors(e => ({ ...e, roomKey: true, roomKeyDuplicate: true })); return }
    }

    const room = (propertyRooms[building] ?? []).find(r => r.id === roomId)
    const tenantName = room?.tenants?.[0]?.name ?? editingInvoice.tenantName
    const { rent, elecKwh, elecPrice, elecAmt, waterM3, waterPrice, waterAmt, internetAmt, serviceAmt, total } = calcInvoiceTotal()

    // Mock invoices have IDs like "inv-{timestamp}" (all digits after dash, length < 25)
    const isMockInvoice = editingInvoice.id.startsWith("inv-") && editingInvoice.id.length < 25
    setIsSubmitting(true)
    setInvoiceLoadingBtn(publishNow ? "publish" : "save")
    if (!isMockInvoice) {
      try {
        const updatePayload = {
          rentAmount: rent,
          electricKwh: elecKwh,
          electricPrice: elecPrice,
          waterM3,
          waterPrice,
          internetAmount: internetAmt,
          serviceAmount: serviceAmt,
          otherFees: invoiceOtherFees.filter(f => f.label.trim()).map(f => ({ label: f.label, amount: parseInt(f.amount) || 0 })),
          note: invoiceForm.note,
        }
        await invoicesApi.update(editingInvoice.id, updatePayload)
        if (publishNow && editingInvoice.status === "draft") {
          await invoicesApi.issue(editingInvoice.id)
        }
        await loadData()
      } catch (err: any) {
        toast.error(err.message ?? "Lỗi khi cập nhật hoá đơn")
        setIsSubmitting(false)
        setInvoiceLoadingBtn(null)
        return
      }
    } else {
      // local mock mode
      const updated: InvoiceData = {
        ...editingInvoice,
        status: publishNow && editingInvoice.status === "draft" ? "pending" : editingInvoice.status,
        roomId,
        building,
        tenantName,
        month: monthLabel,
        rentAmount: rent,
        electricKwh: elecKwh,
        electricPrice: elecPrice,
        electricAmount: elecAmt,
        waterM3,
        waterPrice,
        waterAmount: waterAmt,
        internetAmount: internetAmt,
        serviceAmount: serviceAmt,
        otherFees: invoiceOtherFees.filter(f => f.label.trim()).map(f => ({ label: f.label, amount: parseInt(f.amount) || 0 })),
        totalAmount: total,
        note: invoiceForm.note,
      }
      setInvoices(prev => prev.map(inv => inv.id === editingInvoice.id ? updated : inv))
      setTransactions(prev => prev.map(t =>
        t.invoiceId === editingInvoice.id
          ? { ...t, amount: total, note: editingInvoice.invoiceNumber, room: { id: t.room?.id ?? "", name: roomId, property: { id: "", name: building } } }
          : t
      ))
    }

    setIsSubmitting(false)
    setInvoiceLoadingBtn(null)
    setInvoiceDialogOpen(false)
    setEditingInvoice(null)
    resetInvoiceForm()
    toast.success(publishNow && editingInvoice.status === "draft" ? "Hoá đơn đã được phát hành" : "Đã lưu thay đổi hoá đơn")
  }

  const handleInvoiceAction = async (id: string, action: "issue" | "pay" | "delete") => {
    if (action === "issue") {
      const inv = invoices.find(i => i.id === id)
      if (inv) {
        const duplicate = invoices.find(i => i.id !== id && i.roomId === inv.roomId && i.building === inv.building && i.month === inv.month && i.status !== "draft")
        if (duplicate) {
          setErrorAlert({ title: `Phòng ${inv.roomId} đã có hoá đơn ${inv.month}`, description: `Hoá đơn ${duplicate.invoiceNumber} đã được phát hành. Mỗi phòng chỉ được có một hoá đơn phát hành mỗi tháng.` })
          return
        }
      }
    }

    // Check if this is an API-backed invoice (cuid id from DB)
    const isMockId = id.startsWith("inv-") && id.length < 25
    setIsSubmitting(true)
    if (!isMockId) {
      try {
        if (action === "issue")  await invoicesApi.issue(id)
        if (action === "pay")    await invoicesApi.markPaid(id)
        if (action === "delete") await invoicesApi.remove(id)
        // Optimistic update so stat cards refresh immediately
        setInvoices(prev => {
          if (action === "delete") return prev.filter(inv => inv.id !== id)
          return prev.map(inv => {
            if (inv.id !== id) return inv
            if (action === "issue") return { ...inv, status: "pending" as InvoiceStatus }
            if (action === "pay")   return { ...inv, status: "paid"   as InvoiceStatus }
            return inv
          })
        })
        loadData()
      } catch (err: any) {
        toast.error(err.message ?? "Lỗi khi xử lý hoá đơn")
        setIsSubmitting(false)
        return
      }
    } else {
      // local mock mode
      setInvoices(prev => {
        if (action === "delete") return prev.filter(inv => inv.id !== id)
        return prev.map(inv => {
          if (inv.id !== id) return inv
          if (action === "issue") return { ...inv, status: "pending" as InvoiceStatus }
          if (action === "pay")   return { ...inv, status: "paid"   as InvoiceStatus }
          return inv
        })
      })
      if (action === "pay") {
        const inv = invoices.find(i => i.id === id)
        if (inv) {
          const linkedTx: ApiTransaction = {
            id: `tx-inv-${id}`,
            type: "INCOME",
            category: "RENT",
            amount: inv.totalAmount,
            date: new Date().toISOString(),
            note: inv.invoiceNumber,
            invoiceId: id,
            createdAt: new Date().toISOString(),
            room: { id: "", name: inv.roomId, property: { id: "", name: inv.building } },
          }
          setTransactions(prev => [linkedTx, ...prev.filter(t => t.invoiceId !== id)])
        }
      }
      if (action === "delete") {
        setTransactions(prev => prev.filter(t => t.invoiceId !== id))
      }
    }

    setIsSubmitting(false)
    if (action === "delete") toast.success("Đã xoá hoá đơn")
    if (action === "issue")  toast.success("Hoá đơn đã được phát hành")
    if (action === "pay")    toast.success("Đã đánh dấu thu tiền thành công")
  }

  const handleDownloadTemplate = () => {
    if (!uploadBuilding) return
    const rooms = (propertyRooms[uploadBuilding] ?? []).filter(r => r.status !== "vacant")
    const rows = rooms.map(r => ({
      "Mã phòng":         r.id,
      "Tiền thuê (đ)":    r.rent,
      "Chỉ số điện đầu":  0,
      "Chỉ số điện cuối": "",
      "Đơn giá điện (đ)": 4000,
      "Chỉ số nước đầu":  0,
      "Chỉ số nước cuối": "",
      "Đơn giá nước (đ)": 15000,
      "Internet (đ)":     200000,
      "Phí dịch vụ (đ)":  0,
      "Ghi chú":          "",
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    ws["!cols"] = [
      { wch: 12 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 18 },
      { wch: 16 }, { wch: 16 }, { wch: 18 }, { wch: 14 }, { wch: 16 }, { wch: 20 },
    ]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Hoá đơn")
    const buildingCode = uploadBuilding.replace("Toà ", "")
    XLSX.writeFile(wb, `template-hoadon-${buildingCode}-T${uploadMonth}-${uploadYear}.xlsx`)
  }

  const handleUploadFile = (file: File) => {
    setUploadFile(file)
    setUploadErrors([])
    setUploadPreview([])
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: "array" })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json<Record<string, string | number>>(ws)
        const errs: string[] = []
        rows.forEach((row, i) => {
          if (!row["Mã phòng"]) errs.push(`Dòng ${i + 2}: thiếu Mã phòng`)
        })
        if (errs.length) { setUploadErrors(errs); return }
        setUploadPreview(rows)
      } catch {
        setUploadErrors(["Không đọc được file. Vui lòng dùng đúng file template."])
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleConfirmUpload = () => {
    if (!uploadBuilding || !uploadPreview.length) return
    const monthLabel = `T${uploadMonth}/${uploadYear}`
    const buildingCode = uploadBuilding.replace("Toà ", "")
    const newInvoices: InvoiceData[] = []
    const errs: string[] = []

    uploadPreview.forEach((row, i) => {
      const roomId = String(row["Mã phòng"] ?? "").trim()
      if (!roomId) return
      const room = (propertyRooms[uploadBuilding] ?? []).find(r => r.id === roomId)
      if (!room) { errs.push(`Dòng ${i + 2}: không tìm thấy phòng "${roomId}" trong ${uploadBuilding}`); return }
      const dup = invoices.find(inv => inv.roomId === roomId && inv.building === uploadBuilding && inv.month === monthLabel && inv.status !== "draft")
      if (dup) { errs.push(`Dòng ${i + 2}: ${roomId} đã có hoá đơn ${monthLabel}`); return }

      const rent      = Number(row["Tiền thuê (đ)"])       || 0
      const elecStart = Number(row["Chỉ số điện đầu"])     || 0
      const elecEnd   = Number(row["Chỉ số điện cuối"])    || 0
      const elecPrice = Number(row["Đơn giá điện (đ)"])    || 4000
      const waterStart= Number(row["Chỉ số nước đầu"])     || 0
      const waterEnd  = Number(row["Chỉ số nước cuối"])    || 0
      const waterPrice= Number(row["Đơn giá nước (đ)"])    || 15000
      const internet  = Number(row["Internet (đ)"])         || 0
      const service   = Number(row["Phí dịch vụ (đ)"])     || 0
      const elecAmt   = Math.max(0, elecEnd - elecStart) * elecPrice
      const waterAmt  = Math.max(0, waterEnd - waterStart) * waterPrice
      const total     = rent + elecAmt + waterAmt + internet + service
      const roomCode  = roomId.replace(".", "")
      const invNum    = `${uploadBuilding} - ${roomId} - ${monthLabel}`

      newInvoices.push({
        id: `inv-upload-${Date.now()}-${i}`,
        invoiceNumber: invNum,
        month: monthLabel,
        roomId,
        building: uploadBuilding,
        tenantName: room.tenants?.[0]?.name ?? "",
        rentAmount: rent,
        electricKwh: Math.max(0, elecEnd - elecStart),
        electricPrice: elecPrice,
        electricAmount: elecAmt,
        waterM3: Math.max(0, waterEnd - waterStart),
        waterPrice,
        waterAmount: waterAmt,
        internetAmount: internet,
        serviceAmount: service,
        otherFees: [],
        totalAmount: total,
        note: String(row["Ghi chú"] ?? ""),
        status: "pending",
        createdAt: new Date().toLocaleDateString("vi-VN"),
      })
    })

    if (errs.length) { setUploadErrors(errs); return }
    setInvoices(prev => [...prev, ...newInvoices])
    toast.success(`Đã tạo ${newInvoices.length} hoá đơn cho ${uploadBuilding} – ${monthLabel}`)
    setUploadDialogOpen(false)
    setUploadFile(null)
    setUploadPreview([])
    setUploadErrors([])
    setUploadBuilding("")
  }

  return (
    <TooltipProvider>
      <SidebarProvider className="h-svh overflow-hidden">
        <Sidebar>
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded bg-primary text-primary-foreground">
                <Building2 className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">NhàTrọ Pro</p>
                <p className="text-xs text-muted-foreground">Quản lý cho thuê</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        isActive={view === item.key}
                        onClick={() => !item.wip && setView(item.key as typeof view)}
                        className={item.wip ? "opacity-60 cursor-default" : ""}
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                      {item.wip && (
                        <SidebarMenuBadge className="text-[10px] text-muted-foreground">Đang phát triển</SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Hệ thống</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="opacity-60 cursor-default">
                      <Settings />
                      <span>Cài đặt</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge className="text-[10px] text-muted-foreground">Đang phát triển</SidebarMenuBadge>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="size-8">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CĐ</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">Chủ đầu tư</p>
                <p className="truncate text-xs text-muted-foreground">{totalRooms} phòng · {allBuildings.length} toà</p>
              </div>
              <button
                onClick={() => { logout(); router.replace("/login") }}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                title="Đăng xuất"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col overflow-hidden min-w-0">
          {/* ── Sticky header (nav bar + page header) ── */}
          <div ref={stickyHeaderRef} className="z-10 shrink-0 bg-background">

            {/* Nav bar */}
            <div className="flex h-14 items-center justify-between border-b px-4">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
              </div>
              <div className="flex items-center gap-2">
                <div className="relative hidden sm:block">
                  <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Tìm phòng, người thuê..." className="h-8 w-52 pl-8 text-xs" />
                </div>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-lg"
                        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                      />
                    }
                  >
                    {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                  </TooltipTrigger>
                  <TooltipContent>{resolvedTheme === "dark" ? "Light mode" : "Dark mode"}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger render={<Button variant="ghost" size="icon-lg" className="relative" />}>
                    <Bell className="size-4" />
                    <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-destructive" />
                  </TooltipTrigger>
                  <TooltipContent>Thông báo</TooltipContent>
                </Tooltip>
                <Avatar className="size-7">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CĐ</AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Page header – Invoices */}
            {view === "invoices" && (
              <div className="flex items-center justify-between border-b px-6 py-3">
                <div className="flex flex-col gap-0.5">
                  <h1 className="text-base font-semibold">Hoá đơn</h1>
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink render={<button onClick={() => setView("dashboard")} />}>Trang chủ</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem><BreadcrumbPage>Hoá đơn</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="lg" variant="outline" className="gap-1.5" onClick={() => { setUploadBuilding(""); setUploadFile(null); setUploadPreview([]); setUploadErrors([]); setUploadDialogOpen(true) }}>
                    <UploadCloud className="size-3.5" />
                    Tải lên theo lô
                  </Button>
                  <Button size="lg" className="gap-1.5" onClick={() => { setEditingInvoice(null); resetInvoiceForm(); setInvoiceDialogOpen(true) }}>
                    <Plus className="size-3.5" />
                    Tạo hoá đơn
                  </Button>
                </div>
              </div>
            )}

            {/* Page header – Properties */}
            {view === "properties" && (
              <div className={["flex items-center justify-between px-6 py-3", !tabsVisible ? "border-b" : ""].join(" ")}>
                <div className="flex flex-col gap-0.5">
                  <h1 className="text-base font-semibold">Quản lý nhà</h1>
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink render={<button onClick={() => setView("dashboard")} />}>Trang chủ</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>Quản lý nhà</BreadcrumbPage>
                      </BreadcrumbItem>
                      {activeBuilding && (
                        <>
                          <BreadcrumbSeparator />
                          <BreadcrumbItem>
                            <BreadcrumbPage>{activeBuilding}</BreadcrumbPage>
                          </BreadcrumbItem>
                        </>
                      )}
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
                <Button size="lg" className="gap-1.5" onClick={() => setAddBuildingOpen(true)}>
                  <Building2 className="size-3.5" />
                  Thêm tòa nhà
                </Button>
              </div>
            )}

            {/* Page header – Transactions */}
            {view === "transactions" && (
              <div className="flex items-center justify-between border-b px-6 py-3">
                <div className="flex flex-col gap-0.5">
                  <h1 className="text-base font-semibold">Thu chi</h1>
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink render={<button onClick={() => setView("dashboard")} />}>Trang chủ</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem><BreadcrumbPage>Thu chi</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="lg" variant="outline" className="gap-1.5" onClick={() => handleTxOpenDialog("EXPENSE")}>
                    <ArrowDownLeft className="size-3.5" />
                    Ghi chi
                  </Button>
                  <Button size="lg" className="gap-1.5" onClick={() => handleTxOpenDialog("INCOME")}>
                    <ArrowUpRight className="size-3.5" />
                    Ghi thu
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* ── Smart-sticky: tabs + filter (ẩn khi scroll xuống, hiện khi scroll lên) ── */}
          {view === "properties" && (
            <div
              ref={stickyTabsRef}
              className="z-10 bg-background"
              style={{
                display: "grid",
                gridTemplateRows: tabsVisible ? "1fr" : "0fr",
                transition: "grid-template-rows 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
                borderBottom: tabsVisible ? "1px solid var(--border)" : "1px solid transparent",
              }}
            >
              <div style={{ overflow: "hidden", minHeight: 0 }}>
                <div className="flex flex-col gap-3 px-6 pb-3 pt-0">
                  {allBuildings.length > 0 && (
                    <>
                      <Tabs
                        value={buildingInfo[activeBuilding]?.dbId ?? activeBuilding}
                        onValueChange={(id) => {
                          const name = allBuildings.find(b => (buildingInfo[b]?.dbId ?? b) === id) ?? id
                          setActiveBuilding(name)
                          setTabsVisible(true)
                        }}
                      >
                        <TabsList variant="line" className="h-auto gap-0 p-0">
                          {allBuildings.map((b) => {
                            const tabId = buildingInfo[b]?.dbId ?? b
                            return (
                              <TabsTrigger key={tabId} value={tabId} className="px-4 py-2 text-sm">
                                {b}
                              </TabsTrigger>
                            )
                          })}
                        </TabsList>
                      </Tabs>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {[
                          { key: "all",      label: "Tất cả" },
                          { key: "occupied", label: "Đang thuê" },
                          { key: "vacant",   label: "Phòng trống" },
                          { key: "unpaid",   label: "Chưa thu" },
                          { key: "expiring", label: "Sắp hết HĐ" },
                          { key: "expired",  label: "Hết hạn HĐ" },
                        ].map((f) => {
                          const rooms = propertyRooms[activeBuilding] ?? []
                          const count = f.key === "all" ? rooms.length : rooms.filter(r => getEffectiveRoomStatus(r, activeBuilding, invoices) === f.key).length
                          return (
                            <button
                              key={f.key}
                              onClick={() => setRoomFilter(f.key)}
                              className={[
                                "flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors",
                                roomFilter === f.key ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground",
                              ].join(" ")}
                            >
                              {f.label}
                              <span className={["rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums", roomFilter === f.key ? "bg-background/20" : "bg-background"].join(" ")}>
                                {count}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {view === "dashboard" && <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="grid grid-cols-4 gap-4 p-4 md:grid-cols-8 md:p-6 lg:grid-cols-12 lg:gap-6 lg:p-6">
                {/* Stat cards skeleton */}
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="col-span-2 md:col-span-2 lg:col-span-3">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="size-8 rounded-full" />
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                      <Skeleton className="h-7 w-32" />
                      <Skeleton className="h-4 w-40" />
                    </CardContent>
                  </Card>
                ))}
                {/* Cashflow chart skeleton */}
                <Card className="col-span-4 md:col-span-5 lg:col-span-8">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-24" />
                      <div className="flex gap-2">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-28" />
                      </div>
                    </div>
                    <div className="flex gap-4 mt-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[232px] w-full" />
                  </CardContent>
                </Card>
                {/* Donut chart skeleton */}
                <Card className="col-span-4 md:col-span-3 lg:col-span-4">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-9 w-20" />
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-4">
                    <Skeleton className="h-44 w-44 rounded-full" />
                    <div className="grid grid-cols-2 gap-x-16 gap-y-2 w-full">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-3 w-24" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
                {/* Pending invoices skeleton */}
                <Card className="col-span-4 md:col-span-4 lg:col-span-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 px-6 flex flex-col gap-3 pb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0">
                        <div className="flex-1 flex flex-col gap-1.5">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-28" />
                        </div>
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-16 rounded-md" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
                {/* Transaction history skeleton */}
                <Card className="col-span-4 md:col-span-4 lg:col-span-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-5 w-28" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 px-6 flex flex-col gap-3 pb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0">
                        <Skeleton className="size-8 rounded-full shrink-0" />
                        <div className="flex-1 flex flex-col gap-1.5">
                          <Skeleton className="h-4 w-36" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ) : (
            <div className="grid grid-cols-4 gap-4 p-4 md:grid-cols-8 md:p-6 lg:grid-cols-12 lg:gap-6 lg:p-6">

              {/* ── Stat cards: 4 cols mobile · 2 each md · 3 each lg ── */}
              {statCards.map((s) => {
                const TrendIcon = s.positive ? TrendingUp : TrendingDown
                return (
                  <Card key={s.title} className="col-span-2 md:col-span-2 lg:col-span-3">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardDescription className="text-sm">{s.title}</CardDescription>
                        <div className={[
                          "flex size-8 items-center justify-center rounded-full",
                          s.positive ? "bg-emerald-500/10" : "bg-destructive/10",
                        ].join(" ")}>
                          <s.icon className={[
                            "size-4",
                            s.positive ? "text-emerald-600 dark:text-emerald-400" : "text-destructive",
                          ].join(" ")} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                      <p className="text-2xl font-semibold">{s.value}</p>
                      <div className="flex items-center gap-1.5">
                        <span className={[
                          "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-medium",
                          s.positive
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-destructive/10 text-destructive",
                        ].join(" ")}>
                          <TrendIcon className="size-3" />
                          {s.change}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">{s.sub}</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {/* ── Cashflow chart: full mobile · 5/8 md · 8/12 lg ── */}
              <Card className="col-span-4 md:col-span-5 lg:col-span-8 pb-0 py-4 gap-4">
                <CardHeader className="py-0">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-base font-semibold">Dòng tiền</CardTitle>
                      <CardDescription className="text-sm">Thu thuê, chi phí gốc và lãi theo tháng</CardDescription>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {/* Building multi-select */}
                      <Popover open={buildingOpen} onOpenChange={setBuildingOpen}>
                        <PopoverTrigger render={
                          <Button variant="outline" size="lg" className="gap-1" />
                        }>
                          <Building2 className="size-3" />
                          {selectedBuildings.length === 0
                            ? "Tất cả toà"
                            : selectedBuildings.length === 1
                              ? selectedBuildings[0]
                              : `${selectedBuildings.length} toà`}
                          <ChevronDown className="size-3 text-muted-foreground" />
                        </PopoverTrigger>
                        <PopoverContent className="w-44 p-2" align="end">
                          <div className="flex flex-col gap-1">
                            {/* Tất cả option */}
                            <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-muted">
                              <Checkbox
                                checked={selectedBuildings.length === 0}
                                onCheckedChange={() => setSelectedBuildings([])}
                              />
                              <span className="font-medium">Tất cả</span>
                            </label>
                            <Separator />
                            {allBuildings.map((b) => (
                              <label key={b} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-muted">
                                <Checkbox
                                  checked={selectedBuildings.includes(b)}
                                  onCheckedChange={() => toggleBuilding(b)}
                                />
                                <span>{b}</span>
                              </label>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                      {/* Period toggle */}
                      <ToggleGroup
                        value={[period]}
                        onValueChange={(vals: string[]) => {
                          const next = vals.find((v) => v !== period)
                          if (next) setPeriod(next as "6m" | "1y" | "custom")
                        }}
                        className="h-10 rounded-md border"
                      >
                        <ToggleGroupItem value="6m" className="h-10 px-3">6T</ToggleGroupItem>
                        <ToggleGroupItem value="1y" className="h-10 px-3">1N</ToggleGroupItem>
                        <Popover
                          open={customOpen}
                          onOpenChange={(open) => {
                            setCustomOpen(open)
                            if (!open) setPendingFrom(null)
                            if (open) {
                              const yStr = ALL_MONTHS[customFrom].split("/")[1]
                              setPickerYear(2000 + parseInt(yStr))
                            }
                          }}
                        >
                          <PopoverTrigger render={
                            <ToggleGroupItem value="custom" className="h-10 gap-1.5 px-3" />
                          }>
                            <CalendarDays className="size-4" />
                            {period === "custom"
                              ? `${ALL_MONTHS[customFrom]} – ${ALL_MONTHS[customTo]}`
                              : "Tùy chọn"}
                          </PopoverTrigger>
                          <PopoverContent className="w-[324px] p-0" align="end">
                            <div className="flex h-[262px] flex-col">
                              {/* Year navigation */}
                              <div className="flex shrink-0 items-center justify-between border-b px-3 py-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="size-8"
                                  disabled={pickerYear <= MIN_PICKER_YEAR}
                                  onClick={() => setPickerYear((y) => y - 1)}
                                >
                                  <ChevronLeft className="size-4" />
                                </Button>
                                <span className="text-sm font-semibold">{pickerYear}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="size-8"
                                  disabled={pickerYear >= MAX_PICKER_YEAR}
                                  onClick={() => setPickerYear((y) => y + 1)}
                                >
                                  <ChevronRight className="size-4" />
                                </Button>
                              </div>
                              {/* Hint */}
                              <p className="shrink-0 py-2 text-center text-xs text-muted-foreground">
                                {pendingFrom !== null
                                  ? `Từ ${ALL_MONTHS[pendingFrom]} – chọn tháng kết thúc`
                                  : "Chọn tháng bắt đầu"}
                              </p>
                              {/* Month grid – flex rows stretch to fill remaining height */}
                              <div className="flex flex-1 flex-col gap-1 px-2 pb-2">
                                {[0, 1, 2, 3].map((row) => (
                                  <div key={row} className="flex flex-1">
                                    {[0, 1, 2].map((col) => {
                                      const i     = row * 3 + col
                                      const month = i + 1
                                      const idx   = monthToIdx(pickerYear, month)
                                      const avail = idx !== -1
                                      const inCustom = period === "custom" && pendingFrom === null
                                      const isSingle = inCustom && customFrom === customTo
                                      const isStart  = inCustom && !isSingle && avail && idx === customFrom
                                      const isEnd    = inCustom && !isSingle && avail && idx === customTo
                                      const inRange  = inCustom && !isSingle && avail && idx > customFrom && idx < customTo
                                      const isSel    = inCustom && isSingle && avail && idx === customFrom
                                      const isPend   = pendingFrom !== null && avail && idx === pendingFrom
                                      const showStrip = isStart || isEnd || inRange
                                      const rl = isStart || (isEnd && col === 0) || (inRange && col === 0)
                                      const rr = isEnd   || (isStart && col === 2) || (inRange && col === 2)
                                      return (
                                        <div
                                          key={col}
                                          className={[
                                            "flex flex-1",
                                            inRange ? "bg-muted" : (isStart || isEnd) ? "bg-muted" : "",
                                            showStrip && rl ? "rounded-l-md" : "",
                                            showStrip && rr ? "rounded-r-md" : "",
                                          ].filter(Boolean).join(" ")}
                                        >
                                          <button
                                            type="button"
                                            disabled={!avail}
                                            onClick={() => avail && handleMonthClick(idx)}
                                            className={[
                                              "w-full rounded-md text-sm font-medium transition-colors",
                                              !avail
                                                ? "pointer-events-none cursor-not-allowed text-muted-foreground/30"
                                                : (isStart || isEnd || isSel || isPend)
                                                  ? "bg-primary text-primary-foreground"
                                                  : inRange
                                                    ? "text-foreground"
                                                    : "text-foreground hover:bg-muted",
                                            ].filter(Boolean).join(" ")}
                                          >
                                            {MONTH_LABELS[i]}
                                          </button>
                                        </div>
                                      )
                                    })}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </ToggleGroup>
                    </div>
                  </div>
                </CardHeader>
                <Separator />
                {/* Legend */}
                <div className="flex flex-wrap gap-4 px-6">
                  {[
                    { key: "thuThue", label: "Thu thuê", dashed: false, color: "var(--chart-1)" },
                    { key: "goc",     label: "Chi phí gốc", dashed: true, color: "var(--chart-2)" },
                    { key: "lai",     label: "Lãi", dashed: true, color: "var(--chart-4)" },
                  ].map(({ key, label, dashed, color }) => (
                    <div key={key} className="flex items-center gap-1.5">
                      <span
                        className="block h-0 w-5"
                        style={{
                          borderTopWidth: 2,
                          borderTopStyle: dashed ? "dashed" : "solid",
                          borderColor: color,
                        }}
                      />
                      <span className="text-xs text-muted-foreground">{label}</span>
                    </div>
                  ))}
                </div>
                <CardContent className="pb-0">
                  <ChartContainer config={cashflowConfig} className="h-[232px] w-full">
                    <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id="fillThu" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-thuThue)" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="var(--color-thuThue)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="thang" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis width={36} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={fmt} />
                      <ChartTooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null
                          return (
                            <div className="rounded-lg border bg-background px-3 py-2 shadow-md text-xs">
                              <p className="mb-1.5 font-medium text-foreground">{label}</p>
                              <div className="flex flex-col gap-1">
                                {payload.map((item) => {
                                  const cfg = cashflowConfig[item.dataKey as keyof typeof cashflowConfig]
                                  return (
                                    <div key={String(item.dataKey)} className="flex items-center justify-between gap-6">
                                      <div className="flex items-center gap-1.5">
                                        <span
                                          className="inline-block size-2.5 shrink-0 rounded-[2px]"
                                          style={{ background: item.color }}
                                        />
                                        <span className="text-muted-foreground">{cfg?.label ?? item.dataKey}</span>
                                      </div>
                                      <span className="font-medium tabular-nums text-foreground">
                                        {Number(item.value).toLocaleString("vi-VN")} ₫
                                      </span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        }}
                      />
                      <Area dataKey="thuThue" type="monotone" fill="url(#fillThu)" stroke="var(--color-thuThue)" strokeWidth={2} />
                      <Area dataKey="goc" type="monotone" fill="transparent" stroke="var(--color-goc)" strokeWidth={2} strokeDasharray="4 2" />
                      <Area dataKey="lai" type="monotone" fill="transparent" stroke="var(--color-lai)" strokeWidth={2} strokeDasharray="4 2" />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* ── Building profit donut: full mobile · 3/8 md · 4/12 lg ── */}
              <Card className="col-span-4 md:col-span-3 lg:col-span-4 py-4 gap-4">
                <CardHeader className="py-0">
                  <div>
                    <CardTitle className="text-base font-semibold">Tỉ lệ lãi theo toà</CardTitle>
                    <CardDescription className="text-sm">Tỷ trọng lãi từng toà nhà</CardDescription>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="flex flex-1 flex-col items-center gap-4">
                  {(() => {
                    const netTotal = buildingProfitData.reduce((s, d) => s + d.net, 0)
                    const hasData = buildingProfitData.some(d => d.net > 0)
                    const pieData = hasData
                      ? buildingProfitData.filter(d => d.net > 0).map((d, i) => ({ name: d.fullName, value: d.net, fill: `var(--chart-${i + 1})` }))
                      : [{ name: "", value: 1, fill: "var(--muted)" }]
                    return (
                      <>
                        <ChartContainer config={{}} className="h-44 w-full">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={72}
                              dataKey="value"
                              paddingAngle={hasData ? 2 : 0}
                            >
                              <RechartsLabel
                                content={({ viewBox }) => {
                                  if (!viewBox || !("cx" in viewBox)) return null
                                  const { cx, cy } = viewBox as { cx: number; cy: number }
                                  return (
                                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                                      <tspan x={cx} dy="-0.5em" className="fill-foreground text-[11px] font-semibold">
                                        {hasData ? (netTotal / 1_000_000).toFixed(1) + "tr ₫" : "—"}
                                      </tspan>
                                      <tspan x={cx} dy="1.4em" className="fill-muted-foreground text-[10px]">
                                        Tổng chênh
                                      </tspan>
                                    </text>
                                  )
                                }}
                              />
                            </Pie>
                            {hasData && (
                              <ChartTooltip
                                content={({ active, payload }) => {
                                  if (!active || !payload?.length) return null
                                  const item = payload[0]
                                  const pct = netTotal > 0 ? Math.round((Number(item.value) / netTotal) * 100) : 0
                                  return (
                                    <div className="rounded-lg border bg-background px-3 py-2 shadow-sm text-xs">
                                      <div className="flex items-center gap-1.5 mb-1.5">
                                        <span className="size-2 rounded-full shrink-0" style={{ background: item.payload.fill }} />
                                        <span className="font-medium">{item.payload.name}</span>
                                      </div>
                                      <div className="flex items-center justify-between gap-6">
                                        <span className="text-muted-foreground">Chênh</span>
                                        <span className="font-semibold tabular-nums">{Number(item.value).toLocaleString("vi-VN")} ₫ ({pct}%)</span>
                                      </div>
                                    </div>
                                  )
                                }}
                              />
                            )}
                          </PieChart>
                        </ChartContainer>
                        <div className="grid grid-cols-2 gap-x-16 gap-y-2 my-auto">
                          {buildingProfitData.map((d, i) => {
                            const pct = netTotal !== 0 ? Math.round((d.net / netTotal) * 100) : 0
                            return (
                              <div key={d.fullName} className="flex items-center gap-1.5 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <span className="inline-block size-2 rounded-full" style={{ background: hasData ? `var(--chart-${i + 1})` : "var(--muted-foreground/40)" }} />
                                  <span className="text-muted-foreground">{d.fullName}</span>
                                </div>
                                <span className="font-medium text-muted-foreground">{pct}%</span>
                              </div>
                            )
                          })}
                          {!hasData && buildingProfitData.length === 0 && (
                            <p className="col-span-2 text-center text-xs text-muted-foreground">Chưa có dữ liệu</p>
                          )}
                        </div>
                      </>
                    )
                  })()}
                </CardContent>
              </Card>

              {/* ── Hoá đơn chờ thu: full mobile · 4/8 md · 6/12 lg ── */}
              {(() => {
                const allPending = invoices.filter(inv => inv.status === "pending")
                const pendingInvoices = allPending.filter(inv => pendingToa.length === 0 || pendingToa.includes(inv.building))
                return (
                  <Card className="col-span-4 md:col-span-4 lg:col-span-6 flex flex-col py-4 gap-4">
                    <CardHeader className="py-0">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <CardTitle className="text-base font-semibold">Hoá đơn chờ thu</CardTitle>
                          <CardDescription className="text-sm">{allPending.length} hoá đơn cần xử lý</CardDescription>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Button variant="ghost" size="lg" className="text-muted-foreground" onClick={() => { setView("invoices"); setInvoiceFilter("pending") }}>
                            Xem tất cả
                          </Button>
                          <Popover open={pendingToaOpen} onOpenChange={setPendingToaOpen}>
                            <PopoverTrigger render={<Button variant="outline" size="lg" className="shrink-0 gap-1" />}>
                              <Building2 className="size-3" />
                              {pendingToa.length === 0 ? "Tất cả toà" : pendingToa.length === 1 ? pendingToa[0] : `${pendingToa.length} toà`}
                              <ChevronDown className="size-3 text-muted-foreground" />
                            </PopoverTrigger>
                            <PopoverContent className="w-44 p-2" align="end">
                              <div className="flex flex-col gap-1">
                                <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-muted">
                                  <Checkbox checked={pendingToa.length === 0} onCheckedChange={() => setPendingToa([])} />
                                  <span className="font-medium">Tất cả</span>
                                </label>
                                <Separator />
                                {allBuildings.map((b) => (
                                  <label key={b} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-muted">
                                    <Checkbox checked={pendingToa.includes(b)} onCheckedChange={() => togglePendingToa(b)} />
                                    <span>{b}</span>
                                  </label>
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="p-0 flex-1 overflow-hidden">
                      <ScrollArea className="h-[336px]">
                        <div className="flex flex-col px-6">
                          {pendingInvoices.length === 0 && (
                            <p className="py-8 text-center text-sm text-muted-foreground">Không có hoá đơn chờ thu</p>
                          )}
                          {pendingInvoices.map((inv) => (
                            <div
                              key={inv.id}
                              className="flex items-center gap-3 py-3 cursor-pointer hover:bg-muted/30 -mx-6 px-6 transition-colors"
                              onClick={() => { loadInvoiceIntoForm(inv); setEditingInvoice(inv); setInvoiceDialogOpen(true) }}
                            >
                              <div className="flex-1 overflow-hidden">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">{inv.roomId}</span>
                                  <span className="text-xs text-muted-foreground">{inv.building}</span>
                                  <span className="text-xs text-muted-foreground">·</span>
                                  <span className="text-xs text-muted-foreground">{inv.month}</span>
                                </div>
                                <p className="truncate text-xs text-muted-foreground">{inv.invoiceNumber}</p>
                              </div>
                              <span className="shrink-0 text-sm font-semibold tabular-nums">{inv.totalAmount.toLocaleString("vi-VN")}đ</span>
                              <Button
                                variant="outline" size="sm"
                                className="shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setInvoiceConfirm({ id: inv.id, action: "pay" })
                                }}
                              >
                                Đã thu
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )
              })()}

              {/* ── Lịch sử thu chi: full mobile · 4/8 md · 6/12 lg ── */}
              <Card className="col-span-4 md:col-span-4 lg:col-span-6 py-4 gap-4">
                <CardHeader className="py-0">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-base font-semibold">Lịch sử thu chi</CardTitle>
                      <CardDescription className="text-sm">Giao dịch gần đây</CardDescription>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button variant="ghost" size="lg" className="text-muted-foreground" onClick={() => setView("transactions")}>
                        Xem tất cả
                      </Button>
                      <Popover open={txToaOpen} onOpenChange={setTxToaOpen}>
                        <PopoverTrigger render={<Button variant="outline" size="lg" className="shrink-0 gap-1" />}>
                          <Building2 className="size-3" />
                          {txToa.length === 0 ? "Tất cả toà" : txToa.length === 1 ? txToa[0] : `${txToa.length} toà`}
                          <ChevronDown className="size-3 text-muted-foreground" />
                        </PopoverTrigger>
                        <PopoverContent className="w-44 p-2" align="end">
                          <div className="flex flex-col gap-1">
                            <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-muted">
                              <Checkbox checked={txToa.length === 0} onCheckedChange={() => setTxToa([])} />
                              <span className="font-medium">Tất cả</span>
                            </label>
                            <Separator />
                            {allBuildings.map((b) => (
                              <label key={b} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-muted">
                                <Checkbox checked={txToa.includes(b)} onCheckedChange={() => toggleTxToa(b)} />
                                <span>{b}</span>
                              </label>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="p-0">
                  <ScrollArea className="h-[336px]">
                    <div className="flex flex-col px-6 pb-4">
                      {txHistory.filter((tx) => txToa.length === 0 || txToa.includes(tx.toa)).length === 0 && (
                        <p className="py-8 text-center text-sm text-muted-foreground">Chưa có giao dịch nào</p>
                      )}
                      {txHistory
                        .filter((tx) => txToa.length === 0 || txToa.includes(tx.toa))
                        .map((tx, i, arr) => (
                          <div
                            key={tx.id}
                            className="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors -mx-6 px-6"
                            onClick={() => {
                              const original = transactions.find(t => t.id === tx.id)
                              if (!original) return
                              handleTxOpenEdit(original)
                            }}
                          >
                            <div
                              className={[
                                "flex size-8 shrink-0 items-center justify-center rounded-full",
                                tx.type === "income" ? "bg-emerald-500/10" : "bg-rose-500/10",
                              ].join(" ")}
                            >
                              {tx.type === "income"
                                ? <TrendingUp className="size-4 text-emerald-500" />
                                : <TrendingDown className="size-4 text-rose-500" />}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="truncate text-sm font-medium">{tx.desc}</p>
                              <p className="truncate text-xs text-muted-foreground">{tx.toa || "—"} – {tx.date}</p>
                            </div>
                            <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                              {tx.type === "income" ? "+" : "−"}{tx.amount.toLocaleString("vi-VN")} ₫
                            </span>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

            </div>
            )}
          </div>}

          {/* ── Invoices view ── */}
          {view === "invoices" && (
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Scroll container: filter bar + table scroll together */}
              <div className="flex-1 overflow-auto">
              {/* Filter bar */}
              <div className="flex items-center gap-2 border-b px-6 py-3 flex-wrap">
                {/* Search */}
                <div className="relative w-72 shrink-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    className="pl-8 h-8 text-sm"
                    placeholder="Tìm theo mã, phòng, người thuê..."
                    value={invoiceSearch}
                    onChange={e => setInvoiceSearch(e.target.value)}
                  />
                </div>
                {/* Building filter */}
                <Select value={invoiceFilterBuilding} onValueChange={v => setInvoiceFilterBuilding(v === "__reset__" ? "" : (v ?? ""))}>
                  <SelectTrigger size="sm" className="h-8 w-32 shrink-0">
                    <SelectValue>
                      {(v: string | null) => v ? v : <span className="text-muted-foreground">Toà nhà</span>}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent align="start" alignItemWithTrigger={false} sideOffset={4}>
                    {allBuildings.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    <SelectSeparator />
                    <SelectItem value="__reset__" className="text-muted-foreground">Đặt lại</SelectItem>
                  </SelectContent>
                </Select>
                {/* Date from */}
                <Popover open={invoiceDateFromOpen} onOpenChange={setInvoiceDateFromOpen}>
                  <PopoverTrigger render={
                    <Button variant="outline" size="sm" className="h-8 w-36 shrink-0 justify-start gap-1.5 font-normal">
                      <CalendarDays className="size-3.5 shrink-0 text-muted-foreground" />
                      {invoiceFilterFrom
                        ? <span className="truncate">{invoiceFilterFrom.toLocaleDateString("vi-VN")}</span>
                        : <span className="text-muted-foreground">Từ ngày</span>
                      }
                    </Button>
                  } />
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={invoiceFilterFrom}
                      onSelect={d => {
                        if (d && invoiceFilterTo && d > invoiceFilterTo) setInvoiceFilterTo(d)
                        setInvoiceFilterFrom(d)
                        setInvoiceDateFromOpen(false)
                      }}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
                {/* Date to */}
                <Popover open={invoiceDateToOpen} onOpenChange={setInvoiceDateToOpen}>
                  <PopoverTrigger render={
                    <Button variant="outline" size="sm" className="h-8 w-36 shrink-0 justify-start gap-1.5 font-normal">
                      <CalendarDays className="size-3.5 shrink-0 text-muted-foreground" />
                      {invoiceFilterTo
                        ? <span className="truncate">{invoiceFilterTo.toLocaleDateString("vi-VN")}</span>
                        : <span className="text-muted-foreground">Đến ngày</span>
                      }
                    </Button>
                  } />
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={invoiceFilterTo}
                      onSelect={d => {
                        if (d && invoiceFilterFrom && d < invoiceFilterFrom) setInvoiceFilterFrom(d)
                        setInvoiceFilterTo(d)
                        setInvoiceDateToOpen(false)
                      }}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
                {/* Status filter */}
                <Select value={invoiceFilter} onValueChange={(v: string | null) => setInvoiceFilter(!v || v === "__reset__" ? "" : v as InvoiceStatus)}>
                  <SelectTrigger size="sm" className="h-8 w-40 shrink-0">
                    <SelectValue>
                      {(v: string | null) => v ? INVOICE_STATUS_CONFIG[v as InvoiceStatus]?.label : <span className="text-muted-foreground">Trạng thái</span>}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent align="start" alignItemWithTrigger={false} sideOffset={4}>
                    <SelectItem value="draft">{INVOICE_STATUS_CONFIG.draft.label}</SelectItem>
                    <SelectItem value="pending">{INVOICE_STATUS_CONFIG.pending.label}</SelectItem>
                    <SelectItem value="paid">{INVOICE_STATUS_CONFIG.paid.label}</SelectItem>
                    <SelectSeparator />
                    <SelectItem value="__reset__" className="text-muted-foreground">Đặt lại</SelectItem>
                  </SelectContent>
                </Select>
                {/* Clear filters */}
                {(invoiceSearch || invoiceFilterBuilding || invoiceFilter || invoiceFilterFrom || invoiceFilterTo) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-muted-foreground"
                    onClick={() => { setInvoiceSearch(""); setInvoiceFilterBuilding(""); setInvoiceFilter(""); setInvoiceFilterFrom(undefined); setInvoiceFilterTo(undefined) }}
                  >
                    <X className="size-3.5 mr-1" />
                    Xoá bộ lọc
                  </Button>
                )}
              </div>

              {isLoading ? (
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-muted border-b">
                      <tr>
                        {["Mã hoá đơn","Phòng","Toà","Người thuê","Kỳ","Ngày tạo","Tổng tiền","Trạng thái",""].map((h, i) => (
                          <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i}>
                          <td className="px-4 py-3"><Skeleton className="h-3.5 w-40" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-3.5 w-12" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-3.5 w-16" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-3.5 w-28" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-3.5 w-16" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-3.5 w-20" /></td>
                          <td className="px-4 py-3 text-right"><Skeleton className="h-3.5 w-24 ml-auto" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-7 w-20 ml-auto rounded-md" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : filteredInvoices.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                      <FileText className="size-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">Không tìm thấy hoá đơn nào</p>
                    <Button size="sm" variant="outline" onClick={() => { setEditingInvoice(null); resetInvoiceForm(); setInvoiceDialogOpen(true) }}>
                      <Plus className="size-3.5" />
                      Tạo hoá đơn
                    </Button>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-muted border-b">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Mã hoá đơn</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Phòng</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Toà</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Người thuê</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">
                          <button onClick={() => toggleSort("month")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                            Kỳ
                            <span className="flex flex-col -gap-0.5">
                              <ChevronUp className={["size-3", invoiceSort?.col === "month" && invoiceSort.dir === "asc" ? "text-foreground" : "text-muted-foreground/40"].join(" ")} />
                              <ChevronDown className={["size-3 -mt-1", invoiceSort?.col === "month" && invoiceSort.dir === "desc" ? "text-foreground" : "text-muted-foreground/40"].join(" ")} />
                            </span>
                          </button>
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">
                          <button onClick={() => toggleSort("createdAt")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                            Ngày tạo
                            <span className="flex flex-col -gap-0.5">
                              <ChevronUp className={["size-3", invoiceSort?.col === "createdAt" && invoiceSort.dir === "asc" ? "text-foreground" : "text-muted-foreground/40"].join(" ")} />
                              <ChevronDown className={["size-3 -mt-1", invoiceSort?.col === "createdAt" && invoiceSort.dir === "desc" ? "text-foreground" : "text-muted-foreground/40"].join(" ")} />
                            </span>
                          </button>
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap text-right">
                          <button onClick={() => toggleSort("totalAmount")} className="flex items-center gap-1 hover:text-foreground transition-colors ml-auto">
                            Tổng tiền
                            <span className="flex flex-col -gap-0.5">
                              <ChevronUp className={["size-3", invoiceSort?.col === "totalAmount" && invoiceSort.dir === "asc" ? "text-foreground" : "text-muted-foreground/40"].join(" ")} />
                              <ChevronDown className={["size-3 -mt-1", invoiceSort?.col === "totalAmount" && invoiceSort.dir === "desc" ? "text-foreground" : "text-muted-foreground/40"].join(" ")} />
                            </span>
                          </button>
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Trạng thái</th>
                        <th className="px-4 py-3 w-48" />
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {sortedInvoices.map((inv) => {
                        const cfg = INVOICE_STATUS_CONFIG[inv.status]
                        return (
                          <tr
                            key={inv.id}
                            className="group hover:bg-muted/40 transition-colors cursor-pointer"
                            onClick={() => { loadInvoiceIntoForm(inv); setEditingInvoice(inv); setInvoiceDialogOpen(true) }}
                          >
                            <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{`${inv.building} - ${inv.roomId} - ${inv.month}`}</td>
                            <td className="px-4 py-3 font-medium whitespace-nowrap">{inv.roomId}</td>
                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{inv.building}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{inv.tenantName}</td>
                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{inv.month}</td>
                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{inv.createdAt}</td>
                            <td className="px-4 py-3 text-right font-semibold whitespace-nowrap tabular-nums">{inv.totalAmount.toLocaleString("vi-VN")} ₫</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={["inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", cfg.badge].join(" ")}>
                                {cfg.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {inv.status === "draft" && (
                                  <>
                                    <Button variant="outline" size="default" onClick={() => setInvoiceConfirm({ id: inv.id, action: "issue" })}>Phát hành</Button>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => handleDownloadPDF(inv)}>
                                      <FileText className="size-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => setInvoiceConfirm({ id: inv.id, action: "delete" })}>
                                      <Trash2 className="size-4" />
                                    </Button>
                                  </>
                                )}
                                {inv.status === "pending" && (
                                  <>
                                    <Button variant="outline" size="default" onClick={() => setInvoiceConfirm({ id: inv.id, action: "pay" })}>Đã thu</Button>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => handleDownloadPDF(inv)}>
                                      <FileText className="size-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => setInvoiceConfirm({ id: inv.id, action: "delete" })}>
                                      <Trash2 className="size-4" />
                                    </Button>
                                  </>
                                )}
                                {inv.status === "paid" && (
                                  <>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => handleDownloadPDF(inv)}>
                                      <FileText className="size-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => setInvoiceConfirm({ id: inv.id, action: "delete" })}>
                                      <Trash2 className="size-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {view === "transactions" && (() => {
            const toggleTxBuilding = (b: string) =>
              setTxBuildings(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b])

            const baseFiltered = (type?: "INCOME" | "EXPENSE") => transactions.filter(tx => {
              if (type && tx.type !== type) return false
              if (txSearch) {
                const q = txSearch.toLowerCase()
                const note = tx.note?.toLowerCase() ?? ""
                const cat = (TX_CATEGORY_LABEL[tx.category] ?? tx.category).toLowerCase()
                if (!note.includes(q) && !cat.includes(q)) return false
              }
              if (txBuildings.length > 0) {
                const bName = tx.room?.property?.name ?? tx.property?.name ?? ""
                if (!txBuildings.includes(bName)) return false
              }
              if (txFrom) {
                const d = new Date(tx.date); d.setHours(0,0,0,0)
                const f = new Date(txFrom); f.setHours(0,0,0,0)
                if (d < f) return false
              }
              if (txTo) {
                const d = new Date(tx.date); d.setHours(0,0,0,0)
                const t = new Date(txTo); t.setHours(23,59,59,999)
                if (d > t) return false
              }
              return true
            })

            const filtered = baseFiltered(txTab === "income" ? "INCOME" : txTab === "expense" ? "EXPENSE" : undefined).slice().sort((a, b) => {
              if (!txSort) return 0
              const mul = txSort.dir === "asc" ? 1 : -1
              if (txSort.col === "amount") return (a.amount - b.amount) * mul
              return (new Date(a.date).getTime() - new Date(b.date).getTime()) * mul
            })
            const countAll     = baseFiltered().length
            const countIncome  = baseFiltered("INCOME").length
            const countExpense = baseFiltered("EXPENSE").length

            const allFiltered  = baseFiltered()
            const totalIncome  = allFiltered.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0)
            const totalExpense = allFiltered.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0)
            const net = totalIncome - totalExpense

            return (
              <div className="flex flex-1 overflow-hidden">
                {/* Left: tabs + table */}
                <div className="flex flex-1 flex-col overflow-hidden min-w-0">
                  {/* Collapsible: tabs + filter */}
                  <div className={["overflow-hidden transition-all duration-200", txHeaderVisible ? "max-h-40 opacity-100" : "max-h-0 opacity-0"].join(" ")}>
                  {/* Tabs */}
                  <div className="flex items-center border-b px-6">
                    {([
                      { key: "all",     label: "Tất cả", count: countAll     },
                      { key: "income",  label: "Đã thu",  count: countIncome  },
                      { key: "expense", label: "Đã chi",  count: countExpense },
                    ] as const).map(t => (
                      <button
                        key={t.key}
                        onClick={() => setTxTab(t.key)}
                        className={[
                          "relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors",
                          txTab === t.key
                            ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground after:rounded-full"
                            : "text-muted-foreground hover:text-foreground",
                        ].join(" ")}
                      >
                        {t.label}
                        <span className={["rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums", txTab === t.key ? "bg-foreground/10 text-foreground" : "bg-muted-foreground/15 text-muted-foreground"].join(" ")}>
                          {t.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Filter bar */}
                  <div className="flex items-center gap-2 px-6 py-2.5 flex-wrap">
                    {/* Search */}
                    <div className="relative shrink-0">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                      <Input
                        className="pl-8 h-8 w-56 text-sm"
                        placeholder="Tìm nội dung giao dịch..."
                        value={txSearch}
                        onChange={e => setTxSearch(e.target.value)}
                      />
                    </div>
                    {/* Building filter */}
                    <Select
                      value={txBuildings.length === 1 ? txBuildings[0] : txBuildings.length === 0 ? "__all__" : "__multi__"}
                      onValueChange={v => {
                        if (v === "__all__") setTxBuildings([])
                        else if (v) setTxBuildings([v])
                      }}
                    >
                      <SelectTrigger size="sm" className="h-8 w-36 shrink-0">
                        <SelectValue>
                          {() => txBuildings.length === 0
                            ? <span className="text-muted-foreground">Tất cả toà</span>
                            : txBuildings.length === 1 ? txBuildings[0]
                            : <span>{txBuildings.length} toà</span>
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent align="start" alignItemWithTrigger={false} sideOffset={4}>
                        {allBuildings.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                        <SelectSeparator />
                        <SelectItem value="__all__" className="text-muted-foreground">Tất cả</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Date from */}
                    <Popover open={txDateFromOpen} onOpenChange={setTxDateFromOpen}>
                      <PopoverTrigger render={
                        <Button variant="outline" size="sm" className="h-8 w-36 shrink-0 justify-start gap-1.5 font-normal">
                          <CalendarDays className="size-3.5 shrink-0 text-muted-foreground" />
                          {txFrom ? <span className="truncate">{txFrom.toLocaleDateString("vi-VN")}</span> : <span className="text-muted-foreground">Từ ngày</span>}
                        </Button>
                      } />
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={txFrom}
                          onSelect={d => { if (d && txTo && d > txTo) setTxTo(d); setTxFrom(d); setTxDateFromOpen(false) }}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>

                    {/* Date to */}
                    <Popover open={txDateToOpen} onOpenChange={setTxDateToOpen}>
                      <PopoverTrigger render={
                        <Button variant="outline" size="sm" className="h-8 w-36 shrink-0 justify-start gap-1.5 font-normal">
                          <CalendarDays className="size-3.5 shrink-0 text-muted-foreground" />
                          {txTo ? <span className="truncate">{txTo.toLocaleDateString("vi-VN")}</span> : <span className="text-muted-foreground">Đến ngày</span>}
                        </Button>
                      } />
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={txTo}
                          onSelect={d => { if (d && txFrom && d < txFrom) setTxFrom(d); setTxTo(d); setTxDateToOpen(false) }}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>

                    {/* Clear all filters */}
                    {(txSearch || txBuildings.length > 0 || txFrom || txTo) && (
                      <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground" onClick={() => { setTxSearch(""); setTxBuildings([]); setTxFrom(undefined); setTxTo(undefined) }}>
                        <X className="size-3.5" />
                        Xoá bộ lọc
                      </Button>
                    )}
                  </div>
                  </div>{/* end collapsible */}

                  {/* Table */}
                  <div className="flex-1 overflow-auto [overflow-anchor:none]" onScroll={e => {
                    const y = (e.currentTarget as HTMLDivElement).scrollTop
                    if (y === 0) setTxHeaderVisible(true)
                    else if (y > 80) setTxHeaderVisible(false)
                    txLastScrollY.current = y
                  }}>
                    {txLoading ? (
                      <div className="p-6 space-y-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="h-10 rounded-md bg-muted animate-pulse" />
                        ))}
                      </div>
                    ) : filtered.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
                        <Wallet className="size-10 opacity-20" />
                        <p className="text-sm">Chưa có giao dịch nào</p>
                      </div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 z-10 bg-muted border-b">
                          <tr>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap w-10">STT</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground w-full">Nội dung giao dịch</th>
                            <th className="px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap text-right">
                              <button onClick={() => setTxSort(s => s?.col === "amount" ? (s.dir === "desc" ? { col: "amount", dir: "asc" } : null) : { col: "amount", dir: "desc" })} className="flex items-center gap-1 hover:text-foreground transition-colors ml-auto">
                                Số tiền
                                <span className="flex flex-col -gap-0.5">
                                  <ChevronUp className={["size-3", txSort?.col === "amount" && txSort.dir === "asc" ? "text-foreground" : "text-muted-foreground/40"].join(" ")} />
                                  <ChevronDown className={["size-3 -mt-1", txSort?.col === "amount" && txSort.dir === "desc" ? "text-foreground" : "text-muted-foreground/40"].join(" ")} />
                                </span>
                              </button>
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Toà nhà</th>
                            <th className="px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">
                              <button onClick={() => setTxSort(s => s?.col === "date" ? (s.dir === "desc" ? { col: "date", dir: "asc" } : null) : { col: "date", dir: "desc" })} className="flex items-center gap-1 hover:text-foreground transition-colors">
                                Ngày giao dịch
                                <span className="flex flex-col -gap-0.5">
                                  <ChevronUp className={["size-3", txSort?.col === "date" && txSort.dir === "asc" ? "text-foreground" : "text-muted-foreground/40"].join(" ")} />
                                  <ChevronDown className={["size-3 -mt-1", txSort?.col === "date" && txSort.dir === "desc" ? "text-foreground" : "text-muted-foreground/40"].join(" ")} />
                                </span>
                              </button>
                            </th>
                            <th className="px-4 py-3 w-10" />
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {filtered.map((tx, idx) => (
                            <tr
                              key={tx.id}
                              className="group hover:bg-muted/40 transition-colors cursor-pointer"
                              onClick={() => handleTxOpenEdit(tx)}
                            >
                              <td className="px-4 py-3 text-muted-foreground tabular-nums text-xs w-10">{idx + 1}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className={["size-6 rounded-full flex items-center justify-center shrink-0", tx.type === "INCOME" ? "bg-emerald-500/10" : "bg-destructive/10"].join(" ")}>
                                    {tx.type === "INCOME"
                                      ? <ArrowUpRight className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                      : <ArrowDownLeft className="size-3.5 text-destructive" />
                                    }
                                  </span>
                                  <div>
                                    <p className="text-sm text-muted-foreground leading-tight truncate max-w-[220px]">{tx.note || TX_CATEGORY_LABEL[tx.category] || tx.category}</p>
                                  </div>
                                </div>
                              </td>
                              <td className={["px-4 py-3 text-right font-semibold tabular-nums whitespace-nowrap", tx.type === "INCOME" ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"].join(" ")}>
                                {tx.type === "INCOME" ? "+" : "-"}{tx.amount.toLocaleString("vi-VN")} ₫
                              </td>
                              <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                                {tx.room?.property?.name ?? tx.property?.name ?? "—"}
                              </td>
                              <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap tabular-nums">
                                {new Date(tx.date).toLocaleDateString("vi-VN")}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => setTxDeleteConfirm(tx.id)}>
                                    <Trash2 className="size-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Right: summary card */}
                <div className="flex w-72 shrink-0 flex-col gap-5 border-l overflow-y-auto p-5">
                  <p className="text-sm font-semibold">Tổng quan</p>
                  {[
                    { label: "Tổng thu",   value: `${totalIncome.toLocaleString("vi-VN")} ₫`,        icon: <ArrowUpRight className="size-4 text-emerald-500" /> },
                    { label: "Tổng chi",   value: `${totalExpense.toLocaleString("vi-VN")} ₫`,       icon: <ArrowDownLeft className="size-4 text-destructive" /> },
                    { label: "Chênh lệch", value: `${Math.abs(net).toLocaleString("vi-VN")} ₫`,      icon: net >= 0 ? <TrendingUp className="size-4 text-emerald-500" /> : <TrendingDown className="size-4 text-destructive" /> },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="flex flex-col gap-1 rounded-md bg-muted/50 px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        {icon}
                        <span className="text-xs text-muted-foreground">{label}</span>
                      </div>
                      <span className="text-xl font-bold tabular-nums text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {view === "properties" && (
            <div className="flex flex-1 overflow-hidden">
                {/* Skeleton */}
                {isLoading && (
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="gap-0 py-0">
                          <CardContent className="flex flex-col gap-3 p-4">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-10" />
                                <Skeleton className="h-5 w-20 rounded-full" />
                              </div>
                              <Skeleton className="size-6 rounded-md" />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Skeleton className="size-3.5 rounded-sm" />
                              <Skeleton className="h-3.5 w-24" />
                            </div>
                            <div className="flex items-center justify-between">
                              <Skeleton className="h-3.5 w-20" />
                              <Skeleton className="h-3.5 w-24" />
                            </div>
                            <Skeleton className="h-px w-full" />
                            <div className="flex items-center justify-between">
                              <Skeleton className="h-3.5 w-28" />
                              <Skeleton className="h-7 w-20 rounded-md" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {!isLoading && allBuildings.length === 0 && (
                  <div className="flex flex-1 flex-col items-center justify-center gap-5 p-8 text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                      <Building2 className="size-8 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <p className="text-base font-semibold">Chưa có toà nhà nào</p>
                      <p className="max-w-xs text-sm text-muted-foreground">
                        Thêm toà nhà đầu tiên để bắt đầu quản lý phòng cho thuê của bạn.
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => setAddBuildingOpen(true)}>
                      <Plus className="size-4" />
                      Thêm toà nhà
                    </Button>
                  </div>
                )}

                {/* Room grid */}
                {!isLoading && allBuildings.length > 0 && (
                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6" onScroll={handleRoomScroll}>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {(propertyRooms[activeBuilding] ?? [])
                      .filter(r => roomFilter === "all" || getEffectiveRoomStatus(r, activeBuilding, invoices) === roomFilter)
                      .map((room) => {
                        const effectiveStatus = getEffectiveRoomStatus(room, activeBuilding, invoices)
                        const cfg = ROOM_STATUS_CONFIG[effectiveStatus]
                        return (
                          <Card key={room.id} className="gap-0 py-0 cursor-pointer transition-shadow hover:shadow-md" onClick={() => { setSelectedRoom({ room, building: activeBuilding }); setSheetPhotoIdx(0) }}>
                            <CardContent className="flex flex-col gap-3 p-4">
                              {/* Row 1: room id + badge + more */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <span className="text-base font-bold shrink-0">{room.id}</span>
                                  <span className={["inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium shrink-0", cfg.badge].join(" ")}>
                                    <span className={["size-1.5 rounded-full shrink-0", cfg.dot].join(" ")} />
                                    {cfg.label}
                                  </span>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger render={
                                    <Button variant="ghost" size="icon" className="size-6 shrink-0 text-muted-foreground" onClick={(e) => e.stopPropagation()} />
                                  }>
                                    <MoreHorizontal className="size-4" />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-44">
                                    {room.status === "vacant" && (
                                      <>
                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenEditRoom(room, activeBuilding, true) }}>
                                          <ClipboardList className="size-3.5" />
                                          Tạo hợp đồng
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                      </>
                                    )}
                                    {(["occupied","unpaid","expiring","expired"] as RoomStatus[]).includes(room.status) && (
                                      <>
                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingRoom({ room, building: activeBuilding }); setReleaseContractConfirmOpen(true) }}>
                                          <DoorOpen className="size-3.5" />
                                          Giải phóng hợp đồng
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                      </>
                                    )}
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenEditRoom(room, activeBuilding) }}>
                                      <Pencil className="size-3.5" />
                                      Chỉnh sửa
                                    </DropdownMenuItem>
                                    <DropdownMenuItem variant="destructive" onClick={(e) => { e.stopPropagation(); handleOpenDeleteRoom(room, activeBuilding) }}>
                                      <Trash2 className="size-3.5" />
                                      Xoá
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              {/* Row 2: occupant count */}
                              <div className="flex items-center gap-1.5">
                                <Users className="size-3.5 shrink-0 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {room.tenants?.length ? `${room.tenants.length} người` : "0 người"}
                                </span>
                              </div>

                              {/* Row 3: rent + contract */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <DollarSign className="size-3.5 shrink-0 text-muted-foreground" />
                                  <span className="text-sm font-bold text-foreground">
                                    {room.rent.toLocaleString("vi-VN")} ₫
                                    <span className="text-xs font-normal text-muted-foreground">/tháng</span>
                                  </span>
                                </div>
                                {getContractEnd(room) && (
                                  <div className={["flex items-center gap-1 text-xs", effectiveStatus === "expiring" ? "text-rose-500" : "text-muted-foreground"].join(" ")}>
                                    <Clock className="size-3.5 shrink-0" />
                                    <span className={effectiveStatus === "expiring" ? "font-medium" : ""}>{getContractEnd(room)}</span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                  </div>
                </div>
                )}

                {/* Building info panel */}
                {allBuildings.length > 0 && <div className="flex w-80 shrink-0 flex-col border-l">
                  {(() => {
                    const rooms = propertyRooms[activeBuilding] ?? []
                    const info = buildingInfo[activeBuilding]
                    const revenue = rooms.filter(r => r.status !== "vacant").reduce((s, r) => s + r.rent, 0)
                    return (
                      <>
                      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
                        {/* Photo gallery */}
                        {info?.photos?.length > 0 && (() => {
                          const photos = info.photos
                          const cur = photoIdx[activeBuilding] ?? 0
                          const prev = (e: React.MouseEvent) => { e.stopPropagation(); setPhotoIdx(p => ({ ...p, [activeBuilding]: (cur - 1 + photos.length) % photos.length })) }
                          const next = (e: React.MouseEvent) => { e.stopPropagation(); setPhotoIdx(p => ({ ...p, [activeBuilding]: (cur + 1) % photos.length })) }
                          return (
                            <div
                              className="group relative aspect-video cursor-zoom-in overflow-hidden rounded-lg bg-muted"
                              onClick={() => setLightbox({ building: activeBuilding, idx: cur })}
                            >
                              <img
                                src={photos[cur]}
                                alt={`${activeBuilding} ảnh ${cur + 1}`}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                              />
                              {photos.length > 1 && (
                                <>
                                  <button
                                    onClick={prev}
                                    className="absolute left-1.5 top-1/2 -translate-y-1/2 flex size-6 items-center justify-center rounded-full bg-black/40 text-white transition-all opacity-0 group-hover:opacity-100 hover:bg-black/60"
                                  >
                                    <ChevronLeft className="size-3.5" />
                                  </button>
                                  <button
                                    onClick={next}
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 flex size-6 items-center justify-center rounded-full bg-black/40 text-white transition-all opacity-0 group-hover:opacity-100 hover:bg-black/60"
                                  >
                                    <ChevronRight className="size-3.5" />
                                  </button>
                                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {photos.map((_, i) => (
                                      <button
                                        key={i}
                                        onClick={(e) => { e.stopPropagation(); setPhotoIdx(p => ({ ...p, [activeBuilding]: i })) }}
                                        className={["size-1.5 rounded-full transition-colors", i === cur ? "bg-white" : "bg-white/40"].join(" ")}
                                      />
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          )
                        })()}

                        {/* Header */}
                        <div>
                          <h2 className="text-base font-semibold">{activeBuilding}</h2>
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="size-3 shrink-0" />
                            <span>{info?.address}</span>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            {[
                              { label: "Số tầng",      value: `${info?.floors ?? "—"} tầng` },
                              { label: "Số phòng",     value: `${info?.totalRooms ?? rooms.length} phòng` },
                              { label: "Thời hạn HĐ",  value: `${info?.contractMonths ?? "—"} tháng` },
                              { label: "Ngày ký HĐ",   value: info?.contractStart ?? "—" },
                            ].map(({ label, value }) => (
                              <div key={label} className="flex flex-col gap-0.5 rounded-md bg-muted/50 px-3 py-2">
                                <span className="text-[10px] text-muted-foreground">{label}</span>
                                <span className="text-sm font-semibold">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Base rent cost */}
                        <div className="mt-2 flex flex-col gap-1">
                          <p className="text-xs text-muted-foreground">Giá thuê gốc theo tháng</p>
                          <p className="text-lg font-semibold">{(buildingInfo[activeBuilding]?.baseRent ?? 0).toLocaleString("vi-VN")} ₫</p>
                        </div>

                        {/* Revenue */}
                        <div className="flex flex-col gap-1">
                          <p className="text-xs text-muted-foreground">Doanh thu dự kiến tháng này</p>
                          <p className="text-lg font-semibold">{revenue.toLocaleString("vi-VN")} ₫</p>
                        </div>
                      </div>

                      {/* Sticky footer actions */}
                      <div className="flex shrink-0 items-center gap-2 border-t p-4">
                        <Button size="lg" className="gap-1.5" onClick={() => handleOpenAddRoom(activeBuilding)}>
                          <DoorOpen className="size-4" />
                          Thêm phòng
                        </Button>
                        <Button variant="outline" size="lg" className="gap-1.5" onClick={() => handleOpenEditBuilding(activeBuilding)}>
                          <Pencil className="size-4" />
                          Chỉnh sửa
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="outline" size="icon-lg" className="shrink-0 ml-auto" />}>
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem>
                              <Receipt className="size-3.5" />
                              Thu chi
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={() => setDeleteBuildingConfirmOpen(true)}>
                              <Trash2 className="size-3.5" />
                              Xoá tòa nhà
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      </>
                    )
                  })()}
                </div>}
              </div>
          )}

        </SidebarInset>
        <SidebarAwareToaster />
      </SidebarProvider>

      {/* Ghi thu / Ghi chi dialog */}
      <Dialog open={txDialogOpen} onOpenChange={o => { if (!o) setTxDialogOpen(false) }}>
        <DialogContent showCloseButton className="w-full gap-0 p-0 overflow-hidden">
          <div className="flex flex-col min-h-0">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 pt-6 pb-4 shrink-0">
              <div className={["flex size-9 shrink-0 items-center justify-center rounded-full", txDialogType === "INCOME" ? "bg-emerald-500/10" : "bg-destructive/10"].join(" ")}>
                {txDialogType === "INCOME"
                  ? <ArrowUpRight className="size-4 text-emerald-600 dark:text-emerald-400" />
                  : <ArrowDownLeft className="size-4 text-destructive" />
                }
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">{txDialogType === "INCOME" ? "Ghi thu" : "Ghi chi"}</DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{txDialogType === "INCOME" ? "Ghi nhận khoản tiền thu được" : "Ghi nhận khoản chi phí phát sinh"}</p>
              </div>
            </div>

            {/* Form */}
            <div className="flex flex-col gap-4 border-t px-6 py-5 overflow-y-auto">
              {/* Amount */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tx-amount">Số tiền (₫)</Label>
                <Input
                  id="tx-amount"
                  placeholder="0"
                  value={txForm.amount}
                  onChange={e => setTxForm(f => ({ ...f, amount: e.target.value }))}
                  className={["text-base tabular-nums h-9", txFormErrors.amount ? "border-destructive" : ""].join(" ")}
                />
                {txFormErrors.amount && <p className="text-xs text-destructive">Vui lòng nhập số tiền hợp lệ</p>}
              </div>

              {/* Building */}
              <div className="flex flex-col gap-1.5">
                <Label>Toà nhà</Label>
                <Select
                  value={txForm.building}
                  onValueChange={v => setTxForm(f => ({ ...f, building: v === "__none__" ? "" : (v ?? ""), roomId: "" }))}
                >
                  <SelectTrigger className={["h-9 w-full", txFormErrors.building ? "border-destructive" : ""].join(" ")}>
                    <SelectValue>
                      {() => txForm.building ? txForm.building : <span className="text-muted-foreground">Chọn toà nhà</span>}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent align="start" alignItemWithTrigger={false} sideOffset={4}>
                    {allBuildings.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
                {txFormErrors.building && <p className="text-xs text-destructive">Vui lòng chọn toà nhà</p>}
              </div>

              {/* Room (optional, shown when building selected) */}
              {txForm.building && (propertyRooms[txForm.building] ?? []).length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <Label>Phòng <span className="text-muted-foreground font-normal">(tuỳ chọn)</span></Label>
                  <Select
                    value={txForm.roomId || "__none__"}
                    onValueChange={v => setTxForm(f => ({ ...f, roomId: v === "__none__" ? "" : (v ?? "") }))}
                  >
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue>
                        {() => {
                          const room = (propertyRooms[txForm.building] ?? []).find(r => r._dbId === txForm.roomId)
                          return room ? room.id : <span className="text-muted-foreground">Không gắn phòng cụ thể</span>
                        }}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent align="start" alignItemWithTrigger={false} sideOffset={4}>
                      <SelectItem value="__none__" className="text-muted-foreground">Không gắn phòng cụ thể</SelectItem>
                      <SelectSeparator />
                      {(propertyRooms[txForm.building] ?? []).map(r => (
                        <SelectItem key={r._dbId ?? r.id} value={r._dbId ?? r.id}>{r.id}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Date */}
              <div className="flex flex-col gap-1.5">
                <Label>Ngày giao dịch</Label>
                <Popover open={txFormDateOpen} onOpenChange={setTxFormDateOpen}>
                  <PopoverTrigger render={
                    <Button variant="outline" className="h-9 w-full justify-start gap-2 font-normal">
                      <CalendarDays className="size-3.5 text-muted-foreground shrink-0" />
                      {txForm.date
                        ? new Date(txForm.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
                        : <span className="text-muted-foreground">Chọn ngày</span>
                      }
                    </Button>
                  } />
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={txForm.date ? new Date(txForm.date) : undefined}
                      onSelect={d => { if (d) { setTxForm(f => ({ ...f, date: d.toISOString().slice(0, 10) })); setTxFormDateOpen(false) } }}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Note */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tx-note">Nội dung giao dịch</Label>
                <textarea
                  id="tx-note"
                  rows={3}
                  placeholder={txDialogType === "INCOME" ? "VD: Tiền thuê tháng 5 phòng 101" : "VD: Sửa điều hoà phòng 301"}
                  value={txForm.note}
                  onChange={e => setTxForm(f => ({ ...f, note: e.target.value }))}
                  className={["flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none", txFormErrors.note ? "border-destructive" : "border-input"].join(" ")}
                />
                {txFormErrors.note && <p className="text-xs text-destructive">Vui lòng nhập nội dung giao dịch</p>}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t px-6 py-4 shrink-0">
              <Button variant="outline" onClick={() => setTxDialogOpen(false)}>Huỷ</Button>
              <Button
                onClick={handleTxSubmit}
                disabled={txSubmitting}
                className="gap-1.5"
              >
                {txSubmitting && <LoaderCircle className="size-3.5 animate-spin" />}
                Xác nhận
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction detail / edit dialog */}
      <Dialog open={txDetailOpen} onOpenChange={o => { if (!o) { setTxDetailOpen(false); setTxEditing(null) } }}>
        <DialogContent showCloseButton className="w-full gap-0 p-0 overflow-hidden">
          <div className="flex flex-col min-h-0">
            <div className="flex items-center gap-3 px-6 pt-6 pb-4 shrink-0">
              <div className={["flex size-9 shrink-0 items-center justify-center rounded-full", txEditing?.type === "INCOME" ? "bg-emerald-500/10" : "bg-destructive/10"].join(" ")}>
                {txEditing?.type === "INCOME"
                  ? <ArrowUpRight className="size-4 text-emerald-600 dark:text-emerald-400" />
                  : <ArrowDownLeft className="size-4 text-destructive" />
                }
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">Chi tiết giao dịch</DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{txEditing?.type === "INCOME" ? "Khoản thu" : "Khoản chi"} · {txEditing ? new Date(txEditing.date).toLocaleDateString("vi-VN") : ""}</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t px-6 py-5 overflow-y-auto">
              {txEditing?.invoiceId && (
                <Alert>
                  <Info className="size-4" />
                  <AlertTitle>Giao dịch từ hoá đơn</AlertTitle>
                  <AlertDescription>
                    Giao dịch này được tạo tự động từ hoá đơn. Để chỉnh sửa, vui lòng{" "}
                    <button
                      className="underline underline-offset-2 hover:text-foreground transition-colors"
                      onClick={() => {
                        const inv = invoices.find(i => i.id === txEditing.invoiceId)
                        if (!inv) return
                        setTxDetailOpen(false)
                        setTxEditing(null)
                        loadInvoiceIntoForm(inv)
                        setEditingInvoice(inv)
                        setInvoiceDialogOpen(true)
                      }}
                    >
                      mở hoá đơn
                    </button>.
                  </AlertDescription>
                </Alert>
              )}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="txe-amount">Số tiền (₫)</Label>
                <Input
                  id="txe-amount"
                  placeholder="0"
                  value={txForm.amount}
                  onChange={e => setTxForm(f => ({ ...f, amount: e.target.value }))}
                  disabled={!!txEditing?.invoiceId}
                  className={["text-base tabular-nums h-9", txFormErrors.amount ? "border-destructive" : ""].join(" ")}
                />
                {txFormErrors.amount && <p className="text-xs text-destructive">Vui lòng nhập số tiền hợp lệ</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Toà nhà</Label>
                <Select value={txForm.building} onValueChange={v => setTxForm(f => ({ ...f, building: v ?? "", roomId: "" }))} disabled={!!txEditing?.invoiceId}>
                  <SelectTrigger className={["h-9 w-full", txFormErrors.building ? "border-destructive" : ""].join(" ")}>
                    <SelectValue>
                      {() => txForm.building ? txForm.building : <span className="text-muted-foreground">Chọn toà nhà</span>}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent align="start" alignItemWithTrigger={false} sideOffset={4}>
                    {allBuildings.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
                {txFormErrors.building && <p className="text-xs text-destructive">Vui lòng chọn toà nhà</p>}
              </div>

              {txForm.building && (propertyRooms[txForm.building] ?? []).length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <Label>Phòng <span className="text-muted-foreground font-normal">(tuỳ chọn)</span></Label>
                  <Select
                    value={txForm.roomId || "__none__"}
                    onValueChange={v => setTxForm(f => ({ ...f, roomId: v === "__none__" ? "" : (v ?? "") }))}
                    disabled={!!txEditing?.invoiceId}
                  >
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue>
                        {() => {
                          const room = (propertyRooms[txForm.building] ?? []).find(r => r._dbId === txForm.roomId)
                          return room ? room.id : <span className="text-muted-foreground">Không gắn phòng cụ thể</span>
                        }}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent align="start" alignItemWithTrigger={false} sideOffset={4}>
                      <SelectItem value="__none__" className="text-muted-foreground">Không gắn phòng cụ thể</SelectItem>
                      <SelectSeparator />
                      {(propertyRooms[txForm.building] ?? []).map(r => (
                        <SelectItem key={r._dbId ?? r.id} value={r._dbId ?? r.id}>{r.id}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <Label>Ngày giao dịch</Label>
                <Popover open={txEditing?.invoiceId ? false : txFormDateOpen} onOpenChange={txEditing?.invoiceId ? undefined : setTxFormDateOpen}>
                  <PopoverTrigger render={
                    <Button variant="outline" className="h-9 w-full justify-start gap-2 font-normal" disabled={!!txEditing?.invoiceId}>
                      <CalendarDays className="size-3.5 text-muted-foreground shrink-0" />
                      {txForm.date
                        ? new Date(txForm.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
                        : <span className="text-muted-foreground">Chọn ngày</span>
                      }
                    </Button>
                  } />
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={txForm.date ? new Date(txForm.date) : undefined}
                      onSelect={d => { if (d) { setTxForm(f => ({ ...f, date: d.toISOString().slice(0, 10) })); setTxFormDateOpen(false) } }}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="txe-note">Nội dung giao dịch</Label>
                <textarea
                  id="txe-note"
                  rows={3}
                  placeholder={txEditing?.type === "INCOME" ? "VD: Tiền thuê tháng 5 phòng 101" : "VD: Sửa điều hoà phòng 301"}
                  value={txForm.note}
                  disabled={!!txEditing?.invoiceId}
                  onChange={e => setTxForm(f => ({ ...f, note: e.target.value }))}
                  className={["flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none disabled:opacity-50 disabled:cursor-not-allowed", txFormErrors.note ? "border-destructive" : "border-input"].join(" ")}
                />
                {txFormErrors.note && <p className="text-xs text-destructive">Vui lòng nhập nội dung giao dịch</p>}
              </div>
            </div>

            <div className="flex items-center justify-between border-t px-6 py-4 shrink-0">
              {!txEditing?.invoiceId && (
                <Button
                  variant="outline"
                  className="gap-1.5 text-destructive border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
                  onClick={() => setTxDeleteConfirm(txEditing!.id)}
                >
                  <Trash2 className="size-3.5" />
                  Xoá giao dịch
                </Button>
              )}
              <div className={["flex items-center gap-2", txEditing?.invoiceId ? "ml-auto" : ""].join(" ")}>
                <Button variant="outline" onClick={() => setTxDetailOpen(false)}>Đóng</Button>
                {!txEditing?.invoiceId && (
                  <Button onClick={handleTxUpdate} disabled={txActionLoading} className="gap-1.5">
                    {txActionLoading && <LoaderCircle className="size-3.5 animate-spin" />}
                    Lưu thay đổi
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction delete confirm */}
      <AlertDialog open={!!txDeleteConfirm} onOpenChange={o => { if (!o) setTxDeleteConfirm(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá giao dịch?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Giao dịch sẽ bị xoá vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={() => txDeleteConfirm && handleTxDelete(txDeleteConfirm)}
            >
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add building dialog */}
      <Dialog open={addBuildingOpen} onOpenChange={(o) => { setAddBuildingOpen(o); if (!o) resetBuildingForm() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBuilding ? "Chỉnh sửa tòa nhà" : "Thêm tòa nhà"}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {/* Tên tòa nhà */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="b-name">Tên tòa nhà</Label>
              <Input id="b-name" placeholder="VD: Toà A" value={buildingForm.name}
                className={buildingErrors.name ? "border-destructive focus-visible:ring-destructive" : ""}
                onChange={e => { setBuildingForm(f => ({ ...f, name: e.target.value })); setBuildingErrors(v => ({ ...v, name: false })) }} />
            </div>
            {/* Địa chỉ */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="b-address">Địa chỉ</Label>
              <Input id="b-address" placeholder="VD: 45 Lê Văn Lương, Q. Tân Bình" value={buildingForm.address}
                className={buildingErrors.address ? "border-destructive focus-visible:ring-destructive" : ""}
                onChange={e => { setBuildingForm(f => ({ ...f, address: e.target.value })); setBuildingErrors(v => ({ ...v, address: false })) }} />
            </div>
            {/* Số tầng + Số phòng */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="b-floors">Số tầng</Label>
                <Input id="b-floors" type="text" inputMode="numeric" placeholder="4" value={buildingForm.floors}
                  className={buildingErrors.floors ? "border-destructive focus-visible:ring-destructive" : ""}
                  onKeyDown={numericOnly}
                  onChange={e => { const v = e.target.value.replace(/\D/g, ""); setBuildingForm(f => ({ ...f, floors: v })); setBuildingErrors(x => ({ ...x, floors: false })) }} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="b-rooms">Số phòng</Label>
                <Input id="b-rooms" type="text" inputMode="numeric" placeholder="22" value={buildingForm.totalRooms}
                  className={buildingErrors.totalRooms ? "border-destructive focus-visible:ring-destructive" : ""}
                  onKeyDown={numericOnly}
                  onChange={e => { const v = e.target.value.replace(/\D/g, ""); setBuildingForm(f => ({ ...f, totalRooms: v })); setBuildingErrors(x => ({ ...x, totalRooms: false })) }} />
              </div>
            </div>
            {/* Tiền thuê gốc */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="b-base-rent">Tiền thuê gốc (theo tháng)</Label>
              <Input id="b-base-rent" type="text" inputMode="numeric" placeholder="10.000.000" value={buildingForm.baseRent}
                className={buildingErrors.baseRent ? "border-destructive focus-visible:ring-destructive" : ""}
                onKeyDown={numericOnly}
                onChange={e => { const v = e.target.value.replace(/\D/g, ""); setBuildingForm(f => ({ ...f, baseRent: v })); setBuildingErrors(x => ({ ...x, baseRent: false })) }} />
            </div>
            {/* Thời hạn HĐ + Ngày ký */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="b-months">Thời hạn HĐ (tháng)</Label>
                <Input id="b-months" type="text" inputMode="numeric" placeholder="12" value={buildingForm.contractMonths}
                  className={buildingErrors.contractMonths ? "border-destructive focus-visible:ring-destructive" : ""}
                  onKeyDown={numericOnly}
                  onChange={e => { const v = e.target.value.replace(/\D/g, ""); setBuildingForm(f => ({ ...f, contractMonths: v })); setBuildingErrors(x => ({ ...x, contractMonths: false })) }} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Ngày ký HĐ</Label>
                <Popover open={datePickerOpen} onOpenChange={handleDatePickerOpenChange}>
                  <PopoverTrigger render={
                    <Button variant="outline"
                      className={["w-full justify-start font-normal", buildingErrors.contractDate ? "border-destructive focus-visible:ring-destructive" : ""].join(" ")}
                      onMouseDown={() => { dateTriggerMouseDown.current = true }}
                    />
                  }>
                    <CalendarDays className="size-4 text-muted-foreground" />
                    {contractDate ? contractDate.toLocaleDateString("vi-VN") : <span className="text-muted-foreground">Chọn ngày</span>}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={contractDate} onSelect={handleDateSelect} captionLayout="dropdown" fixedWeeks />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            {/* Upload ảnh */}
            <div className="flex flex-col gap-1.5">
              <Label>Ảnh tòa nhà <span className="text-xs font-normal text-muted-foreground">(không bắt buộc)</span></Label>
              <input ref={buildingPhotoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleBuildingPhotoChange} />
              <div className="flex flex-wrap gap-2">
                {existingPhotos.map((src, i) => (
                  <div key={`existing-${i}`} className="group relative h-16 w-16 shrink-0">
                    <img src={src} className="h-full w-full rounded-md object-cover" />
                    <button type="button"
                      onClick={() => setExistingPhotos(p => p.filter((_, idx) => idx !== i))}
                      className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                {buildingPhotoPreviews.map((src, i) => (
                  <div key={`new-${i}`} className="group relative h-16 w-16 shrink-0">
                    <img src={src} className="h-full w-full rounded-md object-cover" />
                    <button type="button"
                      onClick={() => setBuildingPhotoPreviews(p => p.filter((_, idx) => idx !== i))}
                      className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => buildingPhotoInputRef.current?.click()}
                  className="flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-md border border-dashed text-muted-foreground transition-colors hover:bg-muted">
                  <ImagePlus className="size-4" />
                  <span className="text-[10px]">Thêm ảnh</span>
                </button>
              </div>
            </div>
          </DialogBody>
          <DialogFooter className="flex-row items-center justify-between sm:justify-between">
            {!editingBuilding ? (
              <label className={["flex cursor-pointer items-center gap-2 text-sm", !buildingForm.totalRooms.trim() ? "cursor-not-allowed opacity-50" : ""].join(" ")}>
                <Checkbox
                  checked={autoCreateRooms}
                  disabled={!buildingForm.totalRooms.trim()}
                  onCheckedChange={(v) => setAutoCreateRooms(!!v)}
                />
                Tự động tạo {buildingForm.totalRooms.trim() || "0"} phòng
              </label>
            ) : <span />}
            <div className="flex gap-2">
              <Button variant="outline" size="lg" onClick={() => { setAddBuildingOpen(false); resetBuildingForm() }}>Huỷ</Button>
              <Button size="lg" disabled={isSubmitting} onClick={handleAddBuilding}>
                {isSubmitting && <LoaderCircle className="animate-spin" />}
                {editingBuilding ? "Lưu thay đổi" : "Tạo tòa nhà"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add room dialog */}
      <Dialog open={addRoomOpen} onOpenChange={(o) => { setAddRoomOpen(o); if (!o) resetRoomForm() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm phòng – {addRoomBuilding}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {/* Tên phòng */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="room-name">Tên phòng</Label>
              <Input
                id="room-name"
                placeholder="VD: P.101"
                value={roomForm.name}
                onChange={e => setRoomForm(p => ({ ...p, name: e.target.value }))}
                className={roomErrors.name ? "border-destructive" : ""}
              />
            </div>

            {/* Toggle tạo hợp đồng */}
            <div className="flex items-center justify-between px-0 py-1">
              <div className="flex items-center gap-2">
                <ClipboardList className="size-4 text-muted-foreground" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">Tạo hợp đồng</span>
                  <span className="text-xs text-muted-foreground">Điền thông tin hợp đồng ngay khi thêm phòng</span>
                </div>
              </div>
              <Switch checked={createContract} onCheckedChange={setCreateContract} />
            </div>

            {/* Contract fields */}
            {createContract && (
              <div className="flex flex-col gap-4">
                {/* Số tiền */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="c-rent">Số tiền thuê (₫/tháng)</Label>
                  <Input
                    id="c-rent"
                    placeholder="VD: 2500000"
                    inputMode="numeric"
                    type="text"
                    value={contractForm.rent}
                    onKeyDown={numericOnly}
                    onChange={e => setContractForm(p => ({ ...p, rent: e.target.value.replace(/\D/g, "") }))}
                    className={contractFormErrors.rent ? "border-destructive" : ""}
                  />
                </div>

                {/* Số người ở */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="c-num-people">Số người ở</Label>
                  <Input
                    id="c-num-people"
                    placeholder="VD: 2"
                    inputMode="numeric"
                    type="text"
                    value={contractForm.numPeople}
                    onKeyDown={numericOnly}
                    onChange={e => setContractForm(p => ({ ...p, numPeople: e.target.value.replace(/\D/g, "") }))}
                    onBlur={e => { if (!e.target.value.trim()) setContractForm(p => ({ ...p, numPeople: "1" })) }}
                  />
                </div>

                {/* Thông tin từng người ở */}
                {tenants.map((tenant, i) => (
                  <div key={i} className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Người ở {i + 1}</p>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`c-tenant-name-${i}`}>Họ và tên</Label>
                      <Input
                        id={`c-tenant-name-${i}`}
                        placeholder="Nguyễn Văn A"
                        value={tenant.name}
                        onChange={e => setTenants(prev => prev.map((t, idx) => idx === i ? { ...t, name: e.target.value } : t))}
                        className={contractFormErrors[`tenant_name_${i}`] ? "border-destructive" : ""}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`c-tenant-cccd-${i}`}>Số căn cước công dân</Label>
                      <Input
                        id={`c-tenant-cccd-${i}`}
                        placeholder="079201012345"
                        inputMode="numeric"
                        type="text"
                        value={tenant.cccd}
                        onKeyDown={numericOnly}
                        onChange={e => setTenants(prev => prev.map((t, idx) => idx === i ? { ...t, cccd: e.target.value.replace(/\D/g, "") } : t))}
                        className={contractFormErrors[`tenant_cccd_${i}`] ? "border-destructive" : ""}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`c-tenant-phone-${i}`}>Số điện thoại <span className="text-xs font-normal text-muted-foreground">(không bắt buộc)</span></Label>
                      <Input
                        id={`c-tenant-phone-${i}`}
                        placeholder="0901234567"
                        inputMode="tel"
                        type="text"
                        value={tenant.phone}
                        onChange={e => { setTenants(prev => prev.map((t, idx) => idx === i ? { ...t, phone: e.target.value } : t)); setContractFormErrors(er => ({ ...er, [`tenant_phone_${i}`]: false })) }}
                        className={contractFormErrors[`tenant_phone_${i}`] ? "border-destructive" : ""}
                      />
                    </div>
                  </div>
                ))}

                {/* Số xe */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="c-vehicles">Số xe <span className="text-xs font-normal text-muted-foreground">(không bắt buộc)</span></Label>
                  <Input
                    id="c-vehicles"
                    placeholder="VD: 1"
                    inputMode="numeric"
                    type="text"
                    value={contractForm.vehicles}
                    onKeyDown={numericOnly}
                    onChange={e => setContractForm(p => ({ ...p, vehicles: e.target.value.replace(/\D/g, "") }))}
                  />
                </div>

                {/* Thời hạn hợp đồng */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="c-months">Thời hạn hợp đồng (tháng)</Label>
                  <Input
                    id="c-months"
                    placeholder="VD: 12"
                    inputMode="numeric"
                    type="text"
                    value={contractForm.months}
                    onKeyDown={numericOnly}
                    onChange={e => setContractForm(p => ({ ...p, months: e.target.value.replace(/\D/g, "") }))}
                    className={contractFormErrors.months ? "border-destructive" : ""}
                  />
                </div>

                {/* Ngày ký hợp đồng */}
                <div className="flex flex-col gap-1.5">
                  <Label>Ngày ký hợp đồng</Label>
                  <Popover open={contractSignDateOpen} onOpenChange={handleContractSignDateOpenChange}>
                    <PopoverTrigger render={
                      <Button variant="outline"
                        className={["w-full justify-start font-normal", contractFormErrors.signDate ? "border-destructive focus-visible:ring-destructive" : ""].join(" ")}
                        onMouseDown={() => { contractSignTriggerMouseDown.current = true }}
                      />
                    }>
                      <CalendarDays className="size-4 text-muted-foreground" />
                      {contractForm.signDate ? contractForm.signDate.toLocaleDateString("vi-VN") : <span className="text-muted-foreground">Chọn ngày</span>}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={contractForm.signDate} onSelect={handleContractSignDateSelect} captionLayout="dropdown" fixedWeeks />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" size="lg" onClick={() => { setAddRoomOpen(false); resetRoomForm() }}>Huỷ</Button>
            <Button size="lg" disabled={isSubmitting} onClick={handleAddRoom}>
              {isSubmitting && <LoaderCircle className="animate-spin" />}
              Thêm phòng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit room dialog */}
      {editingRoom && (() => {
        const isOccupied = editingRoom.room.status !== "vacant" && editingRoom.room.status !== undefined
        return (
          <Dialog open={editRoomOpen} onOpenChange={(o) => { setEditRoomOpen(o); if (!o) { resetRoomForm(); setEditingRoom(null) } }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Chỉnh sửa phòng – {editingRoom.room.id}</DialogTitle>
              </DialogHeader>
              <DialogBody>
                {/* Tên phòng */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="er-name">Tên phòng</Label>
                  <Input
                    id="er-name"
                    value={roomForm.name}
                    disabled={contractSwitchLocked}
                    onChange={e => setRoomForm(p => ({ ...p, name: e.target.value }))}
                    className={roomErrors.name ? "border-destructive" : ""}
                  />
                </div>

                {/* Vacant: switch tạo hợp đồng */}
                {!isOccupied && (
                  <div className="flex items-center justify-between px-0 py-1">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="size-4 text-muted-foreground" />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">Tạo hợp đồng</span>
                        <span className="text-xs text-muted-foreground">Điền thông tin hợp đồng ngay khi lưu</span>
                      </div>
                    </div>
                    <Switch checked={createContract} onCheckedChange={setCreateContract} disabled={contractSwitchLocked} />
                  </div>
                )}

                {/* Contract form — always shown for occupied, conditional for vacant */}
                {(isOccupied || createContract) && (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="er-rent">Số tiền thuê (₫/tháng)</Label>
                      <Input id="er-rent" inputMode="numeric" type="text" placeholder="VD: 2500000" value={contractForm.rent}
                        onKeyDown={numericOnly}
                        onChange={e => setContractForm(p => ({ ...p, rent: e.target.value.replace(/\D/g, "") }))}
                        className={contractFormErrors.rent ? "border-destructive" : ""} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="er-num-people">Số người ở</Label>
                      <Input id="er-num-people" inputMode="numeric" type="text" placeholder="VD: 2" value={contractForm.numPeople}
                        onKeyDown={numericOnly}
                        onChange={e => setContractForm(p => ({ ...p, numPeople: e.target.value.replace(/\D/g, "") }))}
                        onBlur={e => { if (!e.target.value.trim()) setContractForm(p => ({ ...p, numPeople: "1" })) }} />
                    </div>
                    {tenants.map((tenant, i) => (
                      <div key={i} className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3">
                        <p className="text-xs font-medium text-muted-foreground">Người ở {i + 1}</p>
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor={`er-tenant-name-${i}`}>Họ và tên</Label>
                          <Input id={`er-tenant-name-${i}`} placeholder="Nguyễn Văn A" value={tenant.name}
                            onChange={e => setTenants(prev => prev.map((t, idx) => idx === i ? { ...t, name: e.target.value } : t))}
                            className={contractFormErrors[`tenant_name_${i}`] ? "border-destructive" : ""} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor={`er-tenant-cccd-${i}`}>Số căn cước công dân</Label>
                          <Input id={`er-tenant-cccd-${i}`} placeholder="079201012345" inputMode="numeric" type="text" value={tenant.cccd}
                            onKeyDown={numericOnly}
                            onChange={e => setTenants(prev => prev.map((t, idx) => idx === i ? { ...t, cccd: e.target.value.replace(/\D/g, "") } : t))}
                            className={contractFormErrors[`tenant_cccd_${i}`] ? "border-destructive" : ""} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor={`er-tenant-phone-${i}`}>Số điện thoại <span className="text-xs font-normal text-muted-foreground">(không bắt buộc)</span></Label>
                          <Input id={`er-tenant-phone-${i}`} placeholder="0901234567" inputMode="tel" type="text" value={tenant.phone}
                            onChange={e => { setTenants(prev => prev.map((t, idx) => idx === i ? { ...t, phone: e.target.value } : t)); setContractFormErrors(er => ({ ...er, [`tenant_phone_${i}`]: false })) }}
                            className={contractFormErrors[`tenant_phone_${i}`] ? "border-destructive" : ""} />
                        </div>
                      </div>
                    ))}
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="er-vehicles">Số xe <span className="text-xs font-normal text-muted-foreground">(không bắt buộc)</span></Label>
                      <Input id="er-vehicles" inputMode="numeric" type="text" placeholder="VD: 1" value={contractForm.vehicles}
                        onKeyDown={numericOnly}
                        onChange={e => setContractForm(p => ({ ...p, vehicles: e.target.value.replace(/\D/g, "") }))} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="er-months">Thời hạn hợp đồng (tháng)</Label>
                      <Input id="er-months" inputMode="numeric" type="text" placeholder="VD: 12" value={contractForm.months}
                        onKeyDown={numericOnly}
                        onChange={e => setContractForm(p => ({ ...p, months: e.target.value.replace(/\D/g, "") }))}
                        className={contractFormErrors.months ? "border-destructive" : ""} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label>Ngày ký hợp đồng</Label>
                      <Popover open={contractSignDateOpen} onOpenChange={handleContractSignDateOpenChange}>
                        <PopoverTrigger render={
                          <Button variant="outline"
                            className={["w-full justify-start font-normal", contractFormErrors.signDate ? "border-destructive" : ""].join(" ")}
                            onMouseDown={() => { contractSignTriggerMouseDown.current = true }}
                          />
                        }>
                          <CalendarDays className="size-4 text-muted-foreground" />
                          {contractForm.signDate ? contractForm.signDate.toLocaleDateString("vi-VN") : <span className="text-muted-foreground">Chọn ngày</span>}
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={contractForm.signDate} onSelect={handleContractSignDateSelect} captionLayout="dropdown" fixedWeeks />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}
              </DialogBody>
              <DialogFooter>
                <Button variant="outline" size="lg" onClick={() => { setEditRoomOpen(false); resetRoomForm(); setEditingRoom(null) }}>Huỷ</Button>
                {isOccupied && (
                  <Button variant="outline" size="lg" className="gap-1.5" onClick={() => setReleaseContractConfirmOpen(true)}>
                    <DoorOpen className="size-4" />
                    Giải phóng HĐ
                  </Button>
                )}
                <Button size="lg" disabled={isSubmitting} onClick={handleSaveRoom}>
                  {isSubmitting && <LoaderCircle className="animate-spin" />}
                  Lưu thay đổi
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )
      })()}

      {/* Release contract confirm dialog */}
      <Dialog open={releaseContractConfirmOpen} onOpenChange={setReleaseContractConfirmOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Giải phóng hợp đồng</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-muted-foreground">
              Xác nhận giải phóng hợp đồng phòng <span className="font-medium text-foreground">{editingRoom?.room.id}</span>? Phòng sẽ được chuyển về trạng thái trống.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" size="lg" onClick={() => setReleaseContractConfirmOpen(false)}>Huỷ</Button>
            <Button size="lg" disabled={isSubmitting} className="bg-destructive text-white hover:bg-destructive/90" onClick={handleConfirmReleaseContract}>
              {isSubmitting && <LoaderCircle className="animate-spin" />}
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete room confirm dialog */}
      <Dialog open={deleteRoomConfirmOpen} onOpenChange={(o) => { setDeleteRoomConfirmOpen(o); if (!o) setDeletingRoom(null) }}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Xoá phòng</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-muted-foreground">
              Xác nhận xoá phòng <span className="font-medium text-foreground">{deletingRoom?.room.id}</span>? Hành động này không thể hoàn tác.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" size="lg" onClick={() => { setDeleteRoomConfirmOpen(false); setDeletingRoom(null) }}>Huỷ</Button>
            <Button size="lg" disabled={isSubmitting} className="bg-destructive text-white hover:bg-destructive/90" onClick={handleConfirmDeleteRoom}>
              {isSubmitting && <LoaderCircle className="animate-spin" />}
              Xoá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteBuildingConfirmOpen} onOpenChange={setDeleteBuildingConfirmOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Xoá toà nhà</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-muted-foreground">
              Xác nhận xoá toà nhà <span className="font-medium text-foreground">"{activeBuilding}"</span>? Toàn bộ phòng, hợp đồng và dữ liệu liên quan sẽ bị xoá vĩnh viễn.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" size="lg" onClick={() => setDeleteBuildingConfirmOpen(false)}>Huỷ</Button>
            <Button size="lg" disabled={isSubmitting} className="bg-destructive text-white hover:bg-destructive/90" onClick={handleConfirmDeleteBuilding}>
              {isSubmitting && <LoaderCircle className="animate-spin" />}
              Xoá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Room detail sheet */}
      <Sheet open={!!selectedRoom} onOpenChange={(o) => { if (!o) setSelectedRoom(null) }}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md" showCloseButton={false}>
          {selectedRoom && (() => {
            const { room, building } = selectedRoom
            const effectiveStatus = getEffectiveRoomStatus(room, building, invoices)
            const cfg = ROOM_STATUS_CONFIG[effectiveStatus]
            const info = buildingInfo[building]
            const photos = info?.photos ?? []

            const roomActions: { icon: React.ElementType; label: string; action?: () => void }[] = [
              ...(room.status === "vacant"   ? [{ icon: ClipboardList, label: "Tạo hợp đồng", action: () => handleOpenEditRoom(room, building, true) }] : []),
              ...((["occupied","unpaid","expiring","expired"] as RoomStatus[]).includes(room.status) ? [{
                icon: DoorOpen, label: "Giải phóng HĐ",
                action: () => { setEditingRoom({ room, building }); setReleaseContractConfirmOpen(true) },
              }] : []),
            ]

            const currentMonthLabel = `T${new Date().getMonth() + 1}/${new Date().getFullYear()}`
            const currentInvoice = invoices.find(inv => inv.roomId === room.id && inv.building === building && inv.month === currentMonthLabel && inv.status !== "draft")

            const isVacant = room.status === "vacant"
            const payHistory = ALL_MONTHS.slice(-6).map((month) => {
              const [mPart, yPart] = month.replace("T", "").split("/")
              const fullMonth = `T${mPart}/20${yPart}`
              const inv = invoices.find(i => i.roomId === room.id && i.building === building && i.month === fullMonth && i.status !== "draft")
              return {
                month,
                tienNha: inv ? inv.rentAmount      : 0,
                dien:    inv ? inv.electricAmount   : 0,
                nuoc:    inv ? inv.waterAmount      : 0,
                dichVu:  inv ? inv.serviceAmount    : 0,
                mang:    inv ? inv.internetAmount   : 0,
              }
            })

            const payConfig = {
              tienNha: { label: "Tiền nhà",  color: "var(--chart-1)" },
              dien:    { label: "Điện",       color: "var(--chart-2)" },
              nuoc:    { label: "Nước",       color: "var(--chart-3)" },
              dichVu:  { label: "Dịch vụ",   color: "var(--chart-4)" },
              mang:    { label: "Mạng",       color: "var(--chart-5)" },
            } satisfies ChartConfig

            return (
              <>
                {/* Action bar */}
                <div className="flex shrink-0 items-center justify-between gap-2 border-b px-4 py-3">
                  <Button variant="ghost" size="icon-lg" className="shrink-0" onClick={() => setSelectedRoom(null)}>
                    <ChevronRight className="size-4" />
                  </Button>
                  <div className="flex items-center gap-1.5">
                    {roomActions.map(({ icon: Icon, label, action }) => (
                      <Button key={label} variant="outline" size="lg" className="gap-1.5" onClick={action}>
                        <Icon className="size-3.5" />
                        {label}
                      </Button>
                    ))}
                    <Button variant="outline" size="icon-lg" onClick={() => handleOpenEditRoom(room, building)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="outline" size="icon-lg" className="border-destructive/40 text-destructive hover:bg-destructive hover:text-white hover:border-destructive [&_svg]:text-destructive hover:[&_svg]:text-white"
                      onClick={() => handleOpenDeleteRoom(room, building)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto">

                  {/* Photos */}
                  {photos.length > 0 && (
                    <div className="relative aspect-video w-full overflow-hidden bg-muted group">
                      <img src={photos[sheetPhotoIdx]} alt={`${building} ảnh ${sheetPhotoIdx + 1}`} className="h-full w-full object-cover" />
                      {photos.length > 1 && (
                        <>
                          <button onClick={() => setSheetPhotoIdx(i => (i - 1 + photos.length) % photos.length)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 flex size-7 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors opacity-0 group-hover:opacity-100">
                            <ChevronLeft className="size-4" />
                          </button>
                          <button onClick={() => setSheetPhotoIdx(i => (i + 1) % photos.length)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 flex size-7 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors opacity-0 group-hover:opacity-100">
                            <ChevronRight className="size-4" />
                          </button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {photos.map((_, i) => (
                              <button key={i} onClick={() => setSheetPhotoIdx(i)}
                                className={["size-1.5 rounded-full transition-colors", i === sheetPhotoIdx ? "bg-white" : "bg-white/40"].join(" ")} />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col gap-6 p-5">
                    {/* Room identity */}
                    <div>
                      <div className="flex items-center gap-2">
                        <SheetTitle className="text-xl font-bold">{room.id}</SheetTitle>
                        <span className={["inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", cfg.badge].join(" ")}>
                          <span className={["size-1.5 rounded-full shrink-0", cfg.dot].join(" ")} />
                          {cfg.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{building} · {info?.address}</p>
                      <p className="text-xs text-muted-foreground">{info?.floors} tầng</p>
                    </div>

                    {/* Room info */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      {[
                        { icon: DollarSign, label: "Giá thuê",     value: `${room.rent.toLocaleString("vi-VN")} ₫/tháng` },
                        { icon: Users,      label: "Số người",     value: room.tenants?.length ? `${room.tenants.length} người` : "0 người" },
                        { icon: Car,        label: "Số xe",        value: `${room.vehicles ?? 0} xe` },
                        { icon: Clock,      label: "Hết hợp đồng", value: getContractEnd(room) ?? "—" },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-start gap-2.5">
                          <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
                            <Icon className="size-3.5 text-muted-foreground" />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">{label}</span>
                            <span className="text-sm font-semibold">{value}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tenant */}
                    <div className="flex flex-col gap-3">
                      <p className="text-sm font-semibold">Người thuê</p>
                      {room.tenants?.length ? (
                        <div className="flex flex-col gap-2">
                          {room.tenants.map((t, i) => (
                            <div key={i} className="flex flex-col rounded-lg bg-muted/50 p-3">
                              <p className="text-sm font-medium">{t.name}</p>
                              {t.phone && <p className="text-xs text-muted-foreground">SĐT: {t.phone}</p>}
                              <p className="text-xs text-muted-foreground">CCCD: {t.cccd}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Phòng đang trống</p>
                      )}
                    </div>

                    {/* Invoice tháng này */}
                    {!isVacant && <div className="flex flex-col gap-3">
                      <p className="text-sm font-semibold">Hoá đơn tháng này</p>
                      {currentInvoice ? (() => {
                        const cfg = INVOICE_STATUS_CONFIG[currentInvoice.status]
                        return (
                          <div className="flex flex-col gap-2 rounded-lg border p-3 cursor-pointer hover:bg-muted/40 transition-colors"
                            onClick={() => { loadInvoiceIntoForm(currentInvoice); setEditingInvoice(currentInvoice); setInvoiceDialogOpen(true) }}>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono text-muted-foreground">{currentInvoice.invoiceNumber}</span>
                              <span className={["inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", cfg.badge].join(" ")}>{cfg.label}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                              {currentInvoice.rentAmount > 0 && (
                                <div className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">Tiền thuê</span>
                                  <span className="tabular-nums">{currentInvoice.rentAmount.toLocaleString("vi-VN")} ₫</span>
                                </div>
                              )}
                              {currentInvoice.electricAmount > 0 && (
                                <div className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">Tiền điện</span>
                                  <span className="tabular-nums">{currentInvoice.electricAmount.toLocaleString("vi-VN")} ₫</span>
                                </div>
                              )}
                              {currentInvoice.waterAmount > 0 && (
                                <div className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">Tiền nước</span>
                                  <span className="tabular-nums">{currentInvoice.waterAmount.toLocaleString("vi-VN")} ₫</span>
                                </div>
                              )}
                              {currentInvoice.internetAmount > 0 && (
                                <div className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">Phí internet</span>
                                  <span className="tabular-nums">{currentInvoice.internetAmount.toLocaleString("vi-VN")} ₫</span>
                                </div>
                              )}
                              {currentInvoice.serviceAmount > 0 && (
                                <div className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">Phí dịch vụ</span>
                                  <span className="tabular-nums">{currentInvoice.serviceAmount.toLocaleString("vi-VN")} ₫</span>
                                </div>
                              )}
                              {currentInvoice.otherFees.map((f, i) => (
                                <div key={i} className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">{f.label}</span>
                                  <span className="tabular-nums">{f.amount.toLocaleString("vi-VN")} ₫</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center justify-between border-t pt-2 mt-1">
                              <span className="text-xs font-medium">Tổng cộng</span>
                              <span className="text-sm font-bold tabular-nums">{currentInvoice.totalAmount.toLocaleString("vi-VN")} ₫</span>
                            </div>
                          </div>
                        )
                      })() : (
                        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-6 text-center">
                          <p className="text-sm text-muted-foreground">Chưa có hoá đơn tháng này</p>
                          <Button size="sm" variant="outline" onClick={() => {
                            resetInvoiceForm()
                            setInvoiceForm(f => ({ ...f, building, roomKey: `${room.id}||${building}`, rent: room.rent ? String(room.rent) : "" }))
                            setEditingInvoice(null)
                            setInvoiceFromSheet(true)
                            setInvoiceDialogOpen(true)
                          }}>
                            <Plus className="size-3.5" />
                            Tạo hoá đơn
                          </Button>
                        </div>
                      )}
                    </div>}

                    {/* Payment history */}
                    <div className="flex flex-col gap-3">
                        <p className="text-sm font-semibold">Lịch sử thu tiền (6 tháng)</p>
                        <ChartContainer config={payConfig} className="h-40 w-full">
                          <BarChart data={payHistory} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis dataKey="month" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                            <YAxis width={32} tick={{ fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={fmt} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            {(["tienNha","dien","nuoc","dichVu","mang"] as const).map((k, i) => (
                              <Bar key={k} dataKey={k} stackId="a" fill={payConfig[k].color} radius={i === 4 ? [4,4,0,0] : [0,0,0,0]} />
                            ))}
                          </BarChart>
                        </ChartContainer>
                      </div>
                    </div>
                  </div>
              </>
            )
          })()}
        </SheetContent>
      </Sheet>

      {/* ── Create / Edit Invoice Dialog ── */}
      <Dialog open={invoiceDialogOpen} onOpenChange={(o) => { setInvoiceDialogOpen(o); if (!o) { setEditingInvoice(null); resetInvoiceForm(); setInvoiceFromSheet(false) } }}>
        <DialogContent showCloseButton className="sm:max-w-4xl gap-0 p-0 overflow-hidden">
          <div className="flex flex-col min-h-0 h-full max-h-[calc(100svh-4rem)]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
              <DialogTitle className="text-base font-semibold">{editingInvoice ? `Chi tiết hoá đơn · ${editingInvoice.invoiceNumber}` : "Tạo hoá đơn"}</DialogTitle>
            </div>

            {/* Body: form + preview */}
            <div className="flex flex-1 min-h-0 overflow-hidden border-t">

              {/* Form panel */}
              <div className="flex flex-col gap-4 overflow-y-auto p-6 flex-1 min-w-0">

                {/* Toà & Phòng */}
                <div className="flex flex-col gap-1.5">
                  <Label>Toà / Phòng</Label>
                  <div className="flex gap-2">
                    {/* Chọn toà */}
                    <Select
                      value={invoiceForm.building}
                      onValueChange={v => {
                        setInvoiceForm(f => ({ ...f, building: v ?? "", roomKey: "", rent: "" }))
                        setInvoiceErrors(e => ({ ...e, building: false, roomKey: false, roomKeyDuplicate: false }))
                      }}
                    >
                      <SelectTrigger className={["h-9 flex-1", invoiceErrors.building ? "border-destructive" : ""].join(" ")}>
                        <SelectValue>
                          {(v: string | null) => v ? v : <span className="text-muted-foreground">Chọn toà</span>}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent align="start" alignItemWithTrigger={false} sideOffset={4}>
                        {allBuildings.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {/* Chọn phòng */}
                    <Popover open={invoiceRoomOpen} onOpenChange={setInvoiceRoomOpen}>
                      <PopoverTrigger render={
                        <button disabled={!invoiceForm.building} className={["flex h-9 flex-1 items-center justify-between rounded-md border bg-transparent px-3 text-sm transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none", invoiceErrors.roomKey ? "border-destructive" : "border-input"].join(" ")}>
                          <span className={invoiceForm.roomKey ? "text-foreground" : "text-muted-foreground"}>
                            {invoiceForm.roomKey ? invoiceForm.roomKey.split("||")[0] : "Chọn phòng"}
                          </span>
                          <ChevronDown className="size-4 text-muted-foreground" />
                        </button>
                      } />
                      <PopoverContent className="w-56 p-2" align="start">
                        <div className="flex flex-col gap-0.5 max-h-60 overflow-y-auto">
                          {(propertyRooms[invoiceForm.building] ?? [])
                            .filter(r => r.status !== "vacant")
                            .map(r => (
                              <button
                                key={r.id}
                                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors text-left"
                                onClick={() => {
                                  const key = `${r.id}||${invoiceForm.building}`
                                  setInvoiceForm(f => ({ ...f, roomKey: key, rent: String(r.rent) }))
                                  setInvoiceErrors(e => ({ ...e, roomKey: false, roomKeyDuplicate: false }))
                                  setInvoiceRoomOpen(false)
                                }}
                              >
                                <span className="font-medium">{r.id}</span>
                                <span className="text-xs text-muted-foreground">{r.tenants?.[0]?.name ?? ""}</span>
                              </button>
                            ))
                          }
                          {invoiceForm.building && !(propertyRooms[invoiceForm.building] ?? []).filter(r => r.status !== "vacant").length && (
                            <p className="px-2 py-3 text-xs text-center text-muted-foreground">Không có phòng đang thuê</p>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  {invoiceErrors.roomKeyDuplicate && (
                    <p className="text-xs text-destructive">Phòng này đã có hoá đơn được phát hành trong tháng đã chọn</p>
                  )}
                </div>

                {/* Tháng */}
                <div className="flex flex-col gap-1.5">
                  <Label>Tháng</Label>
                  <div className="flex gap-2">
                    <Input type="number" min={1} max={12} placeholder="Tháng (1–12)" value={invoiceForm.month}
                      onChange={e => setInvoiceForm(f => ({ ...f, month: Math.min(12, Math.max(1, parseInt(e.target.value) || 1)) }))} />
                    <Input type="number" min={2025} max={2030} placeholder="Năm" value={invoiceForm.year}
                      onChange={e => setInvoiceForm(f => ({ ...f, year: parseInt(e.target.value) || 2026 }))} />
                  </div>
                </div>

                {/* Tiền thuê */}
                <div className="flex flex-col gap-1.5">
                  <Label>Tiền thuê (₫)</Label>
                  <Input type="number" placeholder="VD: 2500000" value={invoiceForm.rent}
                    className={invoiceErrors.rent ? "border-destructive" : ""}
                    onChange={e => { setInvoiceForm(f => ({ ...f, rent: e.target.value })); setInvoiceErrors(er => ({ ...er, rent: false })) }} />
                </div>

                {/* Điện */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5"><Zap className="size-3.5 text-amber-500" /><Label>Tiền điện</Label></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Chỉ số đầu</span>
                      <Input type="number" placeholder="VD: 1200" value={invoiceForm.elecStart}
                        className={invoiceErrors.elecStart ? "border-destructive" : ""}
                        onChange={e => { setInvoiceForm(f => ({ ...f, elecStart: e.target.value })); setInvoiceErrors(er => ({ ...er, elecStart: false, elecEndRange: false })) }} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Chỉ số cuối</span>
                      <Input type="number" placeholder="VD: 1320" value={invoiceForm.elecEnd}
                        className={invoiceErrors.elecEnd || invoiceErrors.elecEndRange ? "border-destructive" : ""}
                        onChange={e => { setInvoiceForm(f => ({ ...f, elecEnd: e.target.value })); setInvoiceErrors(er => ({ ...er, elecEnd: false, elecEndRange: false })) }} />
                    </div>
                  </div>
                  {invoiceErrors.elecEndRange && (
                    <p className="text-xs text-destructive">Chỉ số cuối phải lớn hơn hoặc bằng chỉ số đầu</p>
                  )}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Đơn giá (₫/kWh)</span>
                    <Input type="number" placeholder="VD: 4000" value={invoiceForm.elecPrice}
                      className={invoiceErrors.elecPrice ? "border-destructive" : ""}
                      onChange={e => { setInvoiceForm(f => ({ ...f, elecPrice: e.target.value })); setInvoiceErrors(er => ({ ...er, elecPrice: false })) }} />
                  </div>
                </div>

                {/* Nước */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5"><Droplets className="size-3.5 text-blue-500" /><Label>Tiền nước</Label></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Chỉ số đầu</span>
                      <Input type="number" placeholder="VD: 50" value={invoiceForm.waterStart}
                        className={invoiceErrors.waterStart ? "border-destructive" : ""}
                        onChange={e => { setInvoiceForm(f => ({ ...f, waterStart: e.target.value })); setInvoiceErrors(er => ({ ...er, waterStart: false, waterEndRange: false })) }} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Chỉ số cuối</span>
                      <Input type="number" placeholder="VD: 58" value={invoiceForm.waterEnd}
                        className={invoiceErrors.waterEnd || invoiceErrors.waterEndRange ? "border-destructive" : ""}
                        onChange={e => { setInvoiceForm(f => ({ ...f, waterEnd: e.target.value })); setInvoiceErrors(er => ({ ...er, waterEnd: false, waterEndRange: false })) }} />
                    </div>
                  </div>
                  {invoiceErrors.waterEndRange && (
                    <p className="text-xs text-destructive">Chỉ số cuối phải lớn hơn hoặc bằng chỉ số đầu</p>
                  )}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Đơn giá (₫/m³)</span>
                    <Input type="number" placeholder="VD: 15000" value={invoiceForm.waterPrice}
                      className={invoiceErrors.waterPrice ? "border-destructive" : ""}
                      onChange={e => { setInvoiceForm(f => ({ ...f, waterPrice: e.target.value })); setInvoiceErrors(er => ({ ...er, waterPrice: false })) }} />
                  </div>
                </div>

                {/* Internet */}
                <div className="flex flex-col gap-1.5">
                  <Label>Phí internet</Label>
                  <Input type="number" placeholder="VD: 200000" value={invoiceForm.internet}
                    className={invoiceErrors.internet ? "border-destructive" : ""}
                    onChange={e => { setInvoiceForm(f => ({ ...f, internet: e.target.value })); setInvoiceErrors(er => ({ ...er, internet: false })) }} />
                </div>

                {/* Dịch vụ */}
                <div className="flex flex-col gap-1.5">
                  <Label>Phí dịch vụ</Label>
                  <Input type="number" placeholder="VD: 50000" value={invoiceForm.service}
                    className={invoiceErrors.service ? "border-destructive" : ""}
                    onChange={e => { setInvoiceForm(f => ({ ...f, service: e.target.value })); setInvoiceErrors(er => ({ ...er, service: false })) }} />
                </div>

                {/* Phụ phí khác */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label>Phụ phí khác <span className="text-muted-foreground font-normal">(không bắt buộc)</span></Label>
                    <Button variant="ghost" size="xs" onClick={() => setInvoiceOtherFees(f => [...f, { label: "", amount: "" }])}>
                      <Plus className="size-3" />Thêm
                    </Button>
                  </div>
                  {invoiceOtherFees.map((fee, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input placeholder="Tên phí" value={fee.label}
                        className={invoiceErrors[`fee_label_${i}`] ? "border-destructive" : ""}
                        onChange={e => { setInvoiceOtherFees(prev => prev.map((f,j) => j===i ? {...f,label:e.target.value} : f)); setInvoiceErrors(er => ({...er,[`fee_label_${i}`]:false})) }} />
                      <Input type="number" placeholder="Số tiền" value={fee.amount}
                        className={["w-32 shrink-0", invoiceErrors[`fee_amount_${i}`] ? "border-destructive" : ""].join(" ")}
                        onChange={e => { setInvoiceOtherFees(prev => prev.map((f,j) => j===i ? {...f,amount:e.target.value} : f)); setInvoiceErrors(er => ({...er,[`fee_amount_${i}`]:false})) }} />
                      <Button variant="ghost" size="icon-sm" className="shrink-0 text-muted-foreground" onClick={() => setInvoiceOtherFees(prev => prev.filter((_,j) => j!==i))}>
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Ghi chú */}
                <div className="flex flex-col gap-1.5">
                  <Label>Ghi chú <span className="text-muted-foreground font-normal">(không bắt buộc)</span></Label>
                  <Input placeholder="VD: Nhắc thu trước ngày 10" value={invoiceForm.note}
                    onChange={e => setInvoiceForm(f => ({ ...f, note: e.target.value }))} />
                </div>
              </div>

              {/* Preview panel */}
              <div className="w-80 shrink-0 border-l overflow-y-auto bg-muted/30">
                {(() => {
                  const { rent, elecKwh, elecPrice, elecAmt, waterM3, waterPrice, waterAmt, internetAmt, serviceAmt, total } = calcInvoiceTotal()
                  const roomId = invoiceForm.roomKey ? invoiceForm.roomKey.split("||")[0] : ""
                  const building = invoiceForm.building
                  const room = roomId ? (propertyRooms[building] ?? []).find(r => r.id === roomId) : null
                  const tenantName = room?.tenants?.[0]?.name ?? "—"
                  const previewNum = roomId ? `${building} - ${roomId} - T${invoiceForm.month}/${invoiceForm.year}` : "— Chọn toà và phòng —"
                  return (
                    <div className="p-5 flex flex-col gap-4 text-sm">
                      {/* Invoice header */}
                      <div className="text-center flex flex-col gap-0.5">
                        <p className="font-bold text-base uppercase tracking-wide">Hoá đơn tiền phòng</p>
                        <p className="text-xs text-muted-foreground">{previewNum}</p>
                      </div>

                      {/* Info block */}
                      <div className="rounded-lg border bg-background p-3 grid grid-cols-2 gap-x-3 gap-y-2">
                        <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Người thuê</p><p className="font-medium text-xs truncate">{tenantName}</p></div>
                        <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Kỳ thuê</p><p className="font-medium text-xs">T{invoiceForm.month}/{invoiceForm.year}</p></div>
                        <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Phòng</p><p className="font-medium text-xs">{roomId || "—"}{building ? ` · ${building}` : ""}</p></div>
                        <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Ngày tạo</p><p className="font-medium text-xs">{new Date().toLocaleDateString("vi-VN")}</p></div>
                      </div>

                      {/* Items */}
                      <div className="rounded-lg border bg-background overflow-hidden">
                        <div className="flex justify-between px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted/50 border-b">
                          <span>Nội dung</span><span>Số tiền</span>
                        </div>
                        <div className="divide-y">
                          {rent > 0 && <div className="flex justify-between px-3 py-2 text-xs"><span>Tiền thuê phòng</span><span className="font-medium">{rent.toLocaleString("vi-VN")} ₫</span></div>}
                          {elecAmt > 0 && (
                            <div className="flex justify-between px-3 py-2 text-xs gap-2">
                              <span className="text-muted-foreground leading-relaxed">Tiền điện<br/><span className="text-[10px]">{elecKwh} kWh × {elecPrice.toLocaleString("vi-VN")} ₫/kWh</span></span>
                              <span className="font-medium shrink-0">{elecAmt.toLocaleString("vi-VN")} ₫</span>
                            </div>
                          )}
                          {waterAmt > 0 && (
                            <div className="flex justify-between px-3 py-2 text-xs gap-2">
                              <span className="text-muted-foreground leading-relaxed">Tiền nước<br/><span className="text-[10px]">{waterM3} m³ × {waterPrice.toLocaleString("vi-VN")} ₫/m³</span></span>
                              <span className="font-medium shrink-0">{waterAmt.toLocaleString("vi-VN")} ₫</span>
                            </div>
                          )}
                          {internetAmt > 0 && <div className="flex justify-between px-3 py-2 text-xs"><span>Phí internet</span><span className="font-medium">{internetAmt.toLocaleString("vi-VN")} ₫</span></div>}
                          {serviceAmt > 0 && <div className="flex justify-between px-3 py-2 text-xs"><span>Phí dịch vụ</span><span className="font-medium">{serviceAmt.toLocaleString("vi-VN")} ₫</span></div>}
                          {invoiceOtherFees.filter(f => f.label && parseInt(f.amount) > 0).map((f, i) => (
                            <div key={i} className="flex justify-between px-3 py-2 text-xs"><span>{f.label}</span><span className="font-medium">{(parseInt(f.amount)||0).toLocaleString("vi-VN")} ₫</span></div>
                          ))}
                          {total === 0 && <div className="px-3 py-4 text-xs text-center text-muted-foreground">Nhập thông tin để xem trước</div>}
                        </div>
                        {total > 0 && (
                          <div className="flex justify-between px-3 py-2.5 border-t bg-muted/30 font-bold text-sm">
                            <span>Tổng cộng</span>
                            <span className="text-primary">{total.toLocaleString("vi-VN")} ₫</span>
                          </div>
                        )}
                      </div>

                      {/* Note */}
                      {invoiceForm.note && (
                        <p className="text-xs text-muted-foreground italic">Ghi chú: {invoiceForm.note}</p>
                      )}
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Footer */}
            {(() => {
              const invoiceFormDirty = editingInvoice !== null && invoiceFormSnapshot !== JSON.stringify({ form: invoiceForm, otherFees: invoiceOtherFees })
              return (
                <div className="flex items-center justify-between gap-2 border-t px-6 py-4 shrink-0">
                  <div className="flex gap-2">
                    {editingInvoice && (
                      <Button variant="outline" size="lg" className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30" onClick={() => setInvoiceConfirm({ id: editingInvoice.id, action: "delete" })}>
                        <Trash2 className="size-4" />
                        Xoá
                      </Button>
                    )}
                    {editingInvoice && (
                      <Button variant="outline" size="lg" onClick={() => handleDownloadPDF(editingInvoice)}>
                        <FileText className="size-4" />
                        Tải PDF
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="lg" onClick={() => { setInvoiceDialogOpen(false); setEditingInvoice(null); resetInvoiceForm(); setInvoiceFromSheet(false) }}>Huỷ</Button>
                    {editingInvoice ? (
                      <>
                        {invoiceFormDirty && (
                          <Button variant="outline" size="lg" disabled={!!invoiceLoadingBtn} onClick={() => handleUpdateInvoice(false)}>
                            {invoiceLoadingBtn === "save" && <LoaderCircle className="animate-spin" />}
                            Lưu thay đổi
                          </Button>
                        )}
                        {editingInvoice.status === "draft" && (
                          <Button size="lg" variant="default" disabled={!!invoiceLoadingBtn} onClick={() => handleUpdateInvoice(true)}>
                            {invoiceLoadingBtn === "publish" && <LoaderCircle className="animate-spin" />}
                            Phát hành
                          </Button>
                        )}
                        {editingInvoice.status === "pending" && (
                          <Button size="lg" variant="default" disabled={!!invoiceLoadingBtn} onClick={() => {
                            setInvoiceLoadingBtn("pay")
                            handleInvoiceAction(editingInvoice.id, "pay")
                            setInvoiceDialogOpen(false)
                            setEditingInvoice(null)
                            resetInvoiceForm()
                            setInvoiceFromSheet(false)
                            setInvoiceLoadingBtn(null)
                          }}>
                            {invoiceLoadingBtn === "pay" && <LoaderCircle className="animate-spin" />}
                            Đã thu
                          </Button>
                        )}
                      </>
                    ) : (
                      <>
                        {!invoiceFromSheet && (
                          <Button variant="outline" size="lg" disabled={!!invoiceLoadingBtn} onClick={() => handleSaveInvoice("draft")}>
                            {invoiceLoadingBtn === "draft" && <LoaderCircle className="animate-spin" />}
                            Lưu nháp
                          </Button>
                        )}
                        <Button size="lg" disabled={!!invoiceLoadingBtn} onClick={() => handleSaveInvoice("pending")}>
                          {invoiceLoadingBtn === "publish" && <LoaderCircle className="animate-spin" />}
                          Phát hành
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {lightbox && (() => {
        const photos = buildingInfo[lightbox.building]?.photos ?? []
        const cur = lightbox.idx
        const prev = () => setLightbox(l => l ? { ...l, idx: (l.idx - 1 + photos.length) % photos.length } : null)
        const next = () => setLightbox(l => l ? { ...l, idx: (l.idx + 1) % photos.length } : null)
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={() => setLightbox(null)}
          >
            <div
              className="relative flex max-h-[90vh] max-w-[90vw] flex-col items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={photos[cur]}
                alt={`${lightbox.building} ảnh ${cur + 1}`}
                className="max-h-[80vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
              />
              {photos.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-[-48px] top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-[-48px] top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                  <div className="flex gap-1.5">
                    {photos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setLightbox(l => l ? { ...l, idx: i } : null)}
                        className={["size-2 rounded-full transition-colors", i === cur ? "bg-white" : "bg-white/35"].join(" ")}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )
      })()}
      {/* Error alert dialog */}
      <AlertDialog open={!!errorAlert} onOpenChange={open => { if (!open) setErrorAlert(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <Alert variant="destructive">
              <AlertTitle>{errorAlert?.title}</AlertTitle>
              {errorAlert?.description && <AlertDescription>{errorAlert.description}</AlertDescription>}
            </Alert>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorAlert(null)}>Đã hiểu</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Invoice action confirm dialog */}
      {invoiceConfirm && (() => {
        const inv = invoices.find(i => i.id === invoiceConfirm.id)
        if (!inv) return null
        const isDelete = invoiceConfirm.action === "delete"
        const isIssue  = invoiceConfirm.action === "issue"
        const isPay    = invoiceConfirm.action === "pay"
        return (
          <AlertDialog open onOpenChange={open => { if (!open) setInvoiceConfirm(null) }}>
            <AlertDialogContent>
              <AlertDialogHeader className="w-full">
                <AlertDialogTitle>
                  {isDelete && "Xác nhận xoá hoá đơn"}
                  {isIssue  && "Xác nhận phát hành hoá đơn"}
                  {isPay    && "Xác nhận đã thu tiền"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {isDelete && <>Hoá đơn <strong>{inv.invoiceNumber}</strong> sẽ bị xoá vĩnh viễn và không thể khôi phục.</>}
                  {isIssue  && "Xác nhận phát hành hoá đơn dưới đây? Sau khi phát hành trạng thái sẽ chuyển sang Chờ thu."}
                  {isPay    && "Xác nhận thu tiền hoá đơn dưới đây? Hành động này không thể hoàn tác."}
                </AlertDialogDescription>
                {(isIssue || isPay) && (
                  <div className="mt-3 w-full rounded-lg border bg-muted/40 text-sm">
                    <div className="flex items-center justify-between border-b px-4 py-2.5">
                      <span className="font-medium text-foreground">{inv.invoiceNumber}</span>
                      <span className="text-xs text-muted-foreground">{inv.month} · {inv.roomId} – {inv.building}</span>
                    </div>
                    <div className="flex flex-col gap-0 px-4 py-2">
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Tiền thuê</span>
                        <span>{inv.rentAmount.toLocaleString("vi-VN")}đ</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Tiền điện</span>
                        <span>{inv.electricAmount.toLocaleString("vi-VN")}đ</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Tiền nước</span>
                        <span>{inv.waterAmount.toLocaleString("vi-VN")}đ</span>
                      </div>
                      {inv.internetAmount > 0 && (
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">Internet</span>
                          <span>{inv.internetAmount.toLocaleString("vi-VN")}đ</span>
                        </div>
                      )}
                      {inv.serviceAmount > 0 && (
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">Phí dịch vụ</span>
                          <span>{inv.serviceAmount.toLocaleString("vi-VN")}đ</span>
                        </div>
                      )}
                      {inv.otherFees.map((fee, i) => (
                        <div key={i} className="flex justify-between py-1">
                          <span className="text-muted-foreground">{fee.label}</span>
                          <span>{fee.amount.toLocaleString("vi-VN")}đ</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between border-t px-4 py-2.5 font-semibold text-foreground">
                      <span>Tổng cộng</span>
                      <span>{inv.totalAmount.toLocaleString("vi-VN")}đ</span>
                    </div>
                  </div>
                )}
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Huỷ</AlertDialogCancel>
                <AlertDialogAction
                  className={isDelete ? "bg-destructive text-white hover:bg-destructive/90" : ""}
                  disabled={isSubmitting}
                  onClick={async (e) => {
                    e.preventDefault()
                    await handleInvoiceAction(invoiceConfirm.id, invoiceConfirm.action)
                    setInvoiceConfirm(null)
                    if (invoiceConfirm.action === "delete" && editingInvoice?.id === invoiceConfirm.id) {
                      setInvoiceDialogOpen(false)
                      setEditingInvoice(null)
                      resetInvoiceForm()
                      setInvoiceFromSheet(false)
                    }
                  }}
                >
                  {isSubmitting && <LoaderCircle className="animate-spin" />}
                  {isDelete && "Xoá"}
                  {isIssue  && "Phát hành"}
                  {isPay    && "Xác nhận đã thu"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )
      })()}
      {/* Upload theo lô */}
      <Dialog open={uploadDialogOpen} onOpenChange={(o) => { setUploadDialogOpen(o); if (!o) { setUploadFile(null); setUploadPreview([]); setUploadErrors([]) } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tải lên hoá đơn theo lô</DialogTitle>
            <DialogDescription>Chọn toà, tải file mẫu về điền dữ liệu rồi upload lại.</DialogDescription>
          </DialogHeader>

          <DialogBody>
            {/* Chọn toà + tháng */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Toà nhà</Label>
                <Select value={uploadBuilding} onValueChange={(v) => setUploadBuilding(v ?? "")}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Chọn toà" /></SelectTrigger>
                  <SelectContent>
                    {allBuildings.map(b => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Tháng / Năm</Label>
                <div className="flex gap-2">
                  <input
                    type="number" min={1} max={12}
                    value={uploadMonth}
                    onChange={e => setUploadMonth(Number(e.target.value))}
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                    placeholder="Tháng"
                  />
                  <input
                    type="number" min={2020} max={2099}
                    value={uploadYear}
                    onChange={e => setUploadYear(Number(e.target.value))}
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                    placeholder="Năm"
                  />
                </div>
              </div>
            </div>

            {/* Tải file mẫu */}
            <Button
              variant="outline" className="w-full gap-2"
              disabled={!uploadBuilding}
              onClick={handleDownloadTemplate}
            >
              <Download className="size-4" />
              Tải file mẫu Excel{uploadBuilding ? ` – ${uploadBuilding}` : ""}
            </Button>

            {/* Upload file */}
            <div
              className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed py-8 text-center cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/30"
              onClick={() => uploadInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleUploadFile(f) }}
            >
              <UploadCloud className="size-8 text-muted-foreground" />
              {uploadFile ? (
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium">{uploadFile.name}</p>
                  <p className="text-xs text-muted-foreground">{uploadPreview.length} dòng dữ liệu</p>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium">Kéo thả hoặc bấm để chọn file</p>
                  <p className="text-xs text-muted-foreground">Hỗ trợ .xlsx, .xls</p>
                </div>
              )}
              <input
                ref={uploadInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadFile(f) }}
              />
            </div>

            {/* Lỗi */}
            {uploadErrors.length > 0 && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                {uploadErrors.map((e, i) => <p key={i}>{e}</p>)}
              </div>
            )}

            {/* Preview */}
            {uploadPreview.length > 0 && uploadErrors.length === 0 && (
              <div className="rounded-lg border overflow-hidden text-sm">
                <div className="bg-muted/50 px-3 py-2 font-medium text-xs text-muted-foreground">
                  Xem trước – {uploadPreview.length} phòng
                </div>
                <div className="divide-y max-h-48 overflow-y-auto">
                  {uploadPreview.map((row, i) => {
                    const elecAmt = Math.max(0, Number(row["Chỉ số điện cuối"]) - Number(row["Chỉ số điện đầu"])) * (Number(row["Đơn giá điện (đ)"]) || 4000)
                    const waterAmt = Math.max(0, Number(row["Chỉ số nước cuối"]) - Number(row["Chỉ số nước đầu"])) * (Number(row["Đơn giá nước (đ)"]) || 15000)
                    const total = (Number(row["Tiền thuê (đ)"]) || 0) + elecAmt + waterAmt + (Number(row["Internet (đ)"]) || 0) + (Number(row["Phí dịch vụ (đ)"]) || 0)
                    return (
                      <div key={i} className="flex items-center justify-between px-3 py-2">
                        <span className="font-medium">{String(row["Mã phòng"])}</span>
                        <span className="text-muted-foreground tabular-nums">{total.toLocaleString("vi-VN")}đ</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </DialogBody>

          <DialogFooter showCloseButton>
            <Button
              disabled={!uploadPreview.length || !!uploadErrors.length}
              onClick={handleConfirmUpload}
            >
              Tạo {uploadPreview.length > 0 ? `${uploadPreview.length} ` : ""}hoá đơn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </TooltipProvider>
  )
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checked, setChecked] = React.useState(false)

  React.useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login")
    } else {
      setChecked(true)
    }
  }, [router])

  if (!checked) return null
  return <>{children}</>
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}
