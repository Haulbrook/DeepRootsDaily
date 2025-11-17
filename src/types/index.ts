export interface InventoryItem {
  id: string
  itemName: string
  quantity: number
  unit: string
  location: string
  notes: string
  minStock: number
  isLowStock?: boolean
}

export interface ApiResponse<T> {
  success: boolean
  response?: T
  error?: {
    message: string
    timestamp?: string
    context?: string
  }
}

export interface SearchInventoryResponse {
  answer: string
  source: 'inventory' | 'trucks' | 'knowledge' | 'ai' | 'none' | 'error'
}

export interface RecentActivity {
  timestamp: string
  action: string
  itemName: string
  details: string
  user: string
}

export interface LowStockAlert {
  item: string
  quantity: number
  unit: string
  minStock: number
  percentOfMin: number
  needsOrdering: boolean
}

export interface Config {
  services: {
    inventory: { url: string }
    grading: { url: string }
    scheduler: { url: string }
    tools: { url: string }
  }
}
