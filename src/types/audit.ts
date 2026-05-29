export interface AuditLogResponse {
  id:           string
  actorId:      string | null
  actorEmail:   string | null
  action:       string
  resourceType: string | null
  resourceId:   string | null
  newValues:    string | null
  createdAt:    string
}

export interface DashboardStats {
  totalUsers:        number
  activeToday:       number
  failedLoginsToday: number
  activeTokens:      number
  loginsByDay:       Array<{ day: string; value: number }>
  usersByRole:       Record<string, number>
}