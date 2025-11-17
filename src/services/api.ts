import { ApiResponse, SearchInventoryResponse, RecentActivity, LowStockAlert, InventoryItem } from '@/types'

// Configuration - update these URLs with your Google Apps Script deployment URLs
const API_CONFIG = {
  inventoryUrl: process.env.NEXT_PUBLIC_INVENTORY_API_URL || '',
  gradingUrl: process.env.NEXT_PUBLIC_GRADING_API_URL || '',
  schedulerUrl: process.env.NEXT_PUBLIC_SCHEDULER_API_URL || '',
  toolsUrl: process.env.NEXT_PUBLIC_TOOLS_API_URL || '',
}

/**
 * Generic API call function for Google Apps Script endpoints
 */
async function callGoogleAppsScript<T>(
  url: string,
  functionName: string,
  parameters: any[] = []
): Promise<ApiResponse<T>> {
  if (!url) {
    throw new Error(`API URL not configured for ${functionName}`)
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        function: functionName,
        parameters,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data as ApiResponse<T>
  } catch (error) {
    console.error(`API call failed for ${functionName}:`, error)
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
        context: functionName,
      },
    }
  }
}

// ==================== INVENTORY API ====================

export async function searchInventory(query: string): Promise<ApiResponse<SearchInventoryResponse>> {
  return callGoogleAppsScript<SearchInventoryResponse>(
    API_CONFIG.inventoryUrl,
    'askInventory',
    [query]
  )
}

export async function getInventoryReport(): Promise<ApiResponse<string>> {
  return callGoogleAppsScript<string>(
    API_CONFIG.inventoryUrl,
    'getInventoryReport',
    []
  )
}

export async function checkLowStock(): Promise<ApiResponse<LowStockAlert[]>> {
  return callGoogleAppsScript<LowStockAlert[]>(
    API_CONFIG.inventoryUrl,
    'checkLowStock',
    []
  )
}

export async function updateInventory(data: {
  action: 'add' | 'subtract' | 'update'
  itemName: string
  quantity?: number
  unit?: string
  location?: string
  notes?: string
  minStock?: number
  reason?: string
}): Promise<ApiResponse<{ success: boolean; message: string }>> {
  return callGoogleAppsScript<{ success: boolean; message: string }>(
    API_CONFIG.inventoryUrl,
    'updateInventory',
    [data]
  )
}

export async function getRecentActivity(limit: number = 5): Promise<ApiResponse<RecentActivity[]>> {
  return callGoogleAppsScript<RecentActivity[]>(
    API_CONFIG.inventoryUrl,
    'getRecentActivity',
    [limit]
  )
}

// ==================== FLEET/TRUCK API ====================

export async function searchTruckInfo(query: string): Promise<ApiResponse<string>> {
  return callGoogleAppsScript<string>(
    API_CONFIG.inventoryUrl,
    'searchTruckInfo',
    [query]
  )
}

export async function getFleetReport(): Promise<ApiResponse<string>> {
  return callGoogleAppsScript<string>(
    API_CONFIG.inventoryUrl,
    'getFleetReport',
    []
  )
}

// ==================== GRADING API ====================

export async function gradeItem(data: {
  itemName: string
  condition: string
  photos?: string[]
}): Promise<ApiResponse<{ grade: string; recommendedAction: string; estimatedValue: number }>> {
  // Placeholder - implement based on your grading tool's API
  return callGoogleAppsScript(
    API_CONFIG.gradingUrl,
    'gradeItem',
    [data]
  )
}

// ==================== SCHEDULER API ====================

export async function getSchedule(date?: string): Promise<ApiResponse<any>> {
  // Placeholder - implement based on your scheduler tool's API
  return callGoogleAppsScript(
    API_CONFIG.schedulerUrl,
    'getSchedule',
    [date || new Date().toISOString()]
  )
}

export async function updateSchedule(data: {
  crewId: string
  date: string
  tasks: any[]
}): Promise<ApiResponse<{ success: boolean; message: string }>> {
  // Placeholder - implement based on your scheduler tool's API
  return callGoogleAppsScript(
    API_CONFIG.schedulerUrl,
    'updateSchedule',
    [data]
  )
}

// ==================== TOOLS CHECKOUT API ====================

export async function checkoutTool(data: {
  toolId: string
  userName: string
  expectedReturnDate: string
}): Promise<ApiResponse<{ success: boolean; message: string }>> {
  // Placeholder - implement based on your tools checkout API
  return callGoogleAppsScript(
    API_CONFIG.toolsUrl,
    'checkoutTool',
    [data]
  )
}

export async function returnTool(data: {
  toolId: string
  userName: string
  condition: string
}): Promise<ApiResponse<{ success: boolean; message: string }>> {
  // Placeholder - implement based on your tools checkout API
  return callGoogleAppsScript(
    API_CONFIG.toolsUrl,
    'returnTool',
    [data]
  )
}

export async function getAvailableTools(): Promise<ApiResponse<any[]>> {
  // Placeholder - implement based on your tools checkout API
  return callGoogleAppsScript(
    API_CONFIG.toolsUrl,
    'getAvailableTools',
    []
  )
}
