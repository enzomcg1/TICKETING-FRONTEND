import axios from 'axios';
import { API_BASE_URL } from '../config/env';

// La URL base se obtiene de la configuraciÃ³n de entorno

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Log en desarrollo para debugging
  if (import.meta.env.DEV) {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  }
  return config;
});

// Interceptor para manejar errores de autenticaciÃ³n
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detallado de errores en desarrollo
    const isDev = import.meta.env.DEV;
    if (isDev) {
      console.error('[API Error]', {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: `${error.config?.baseURL}${error.config?.url}`,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Solo redirigir si no estamos en la pÃ¡gina de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface Ticket {
  id: string;
  ticketNumber: number;
  title: string;
  description: string;
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'PENDING' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category?: string;
  requestedBy: {
    id: string;
    name: string;
    email: string;
  };
  department: {
    id: string;
    name: string;
    code: string;
  };
  branch: {
    id: string;
    name: string;
    code: string;
    city: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
  history?: TicketHistory[];
  attachments?: Attachment[];
}

export interface TicketHistory {
  id: string;
  ticketId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  changedBy: string;
  createdAt: string;
  changedByUser: {
    id: string;
    name: string;
    email: string;
  };
  ticket?: {
    id: string;
    title: string;
    ticketNumber: number;
  };
}

export interface CombinedHistoryEvent {
  id: string;
  type: 'ticket_history' | 'system_log';
  action?: string;
  message?: string;
  createdAt: string;
  changedByUser?: {
    id: string;
    name: string;
    email: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
  ticket?: {
    id: string;
    title: string;
    ticketNumber: number;
  };
  oldValue?: string;
  newValue?: string;
  metadata?: any;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  address: string;
  city: string;
  state: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  branch?: Branch;
}

export interface Comment {
  id: string;
  content: string;
  user: {
    id: string;
    name: string;
    email?: string;
    role?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  ticketId: string;
  commentId?: string;
  uploadedById: string;
  createdAt: string;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  };
}

export const ticketService = {
  getAll: (params?: { status?: string; priority?: string; branchId?: string; departmentId?: string; search?: string; searchType?: string; userId?: string; ticketId?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return api.get<Ticket[]>(`/tickets${queryString ? `?${queryString}` : ''}`).then(res => res.data);
  },
  getById: (id: string) => api.get<Ticket>(`/tickets/${id}`).then(res => res.data),
  create: (data: any) => api.post<Ticket>('/tickets', data).then(res => res.data),
  update: (id: string, data: any) => api.put<Ticket>(`/tickets/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete<{ message: string; ticketNumber: number; deletedAt: string }>(`/tickets/${id}`).then(res => res.data),
  addComment: (ticketId: string, content: string) =>
    api.post<Comment>(`/tickets/${ticketId}/comments`, { content }).then(res => res.data),
  getAvailableStatuses: (id: string) =>
    api.get<{ currentStatus: string; availableStatuses: Array<{ value: string; label: string }> }>(
      `/tickets/${id}/available-statuses`
    ).then(res => res.data),
  getStats: () => api.get<TicketStats>('/tickets/stats').then(res => res.data),
  getHistory: (params?: {
    action?: string;
    ticketId?: string;
    changedBy?: string;
    userSearch?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return api.get<{ history: CombinedHistoryEvent[]; pagination: any }>(`/tickets/history?${queryParams.toString()}`).then(res => res.data);
  },
  export: (filters?: {
    status?: string;
    priority?: string;
    branchId?: string;
    departmentId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.branchId) params.append('branchId', filters.branchId);
    if (filters?.departmentId) params.append('departmentId', filters.departmentId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    return api.get(`/tickets/export?${params.toString()}`, {
      responseType: 'blob',
    }).then(res => {
      // Extraer el nombre del archivo del header Content-Disposition
      const contentDisposition = res.headers['content-disposition'] || res.headers['Content-Disposition'] || '';
      let filename = `tickets_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      if (contentDisposition) {
        // Intentar extraer el nombre del archivo (soporta formato estÃ¡ndar y UTF-8)
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          let extractedFilename = filenameMatch[1].replace(/['"]/g, '');
          // Si estÃ¡ codificado en UTF-8, decodificar
          if (extractedFilename.includes('UTF-8')) {
            const utf8Match = contentDisposition.match(/filename\*=UTF-8''(.+)/);
            if (utf8Match) {
              extractedFilename = decodeURIComponent(utf8Match[1]);
            }
          }
          if (extractedFilename && extractedFilename !== 'UTF-8') {
            filename = extractedFilename;
          }
        }
      }
      
      // Crear el blob con tipo MIME para Excel
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, filename };
    });
  },
  exportPDF: (filters?: {
    status?: string;
    priority?: string;
    branchId?: string;
    departmentId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.branchId) params.append('branchId', filters.branchId);
    if (filters?.departmentId) params.append('departmentId', filters.departmentId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    return api.get(`/tickets/export-pdf?${params.toString()}`, {
      responseType: 'blob',
    }).then(res => {
      // Extraer el nombre del archivo del header Content-Disposition
      const contentDisposition = res.headers['content-disposition'] || res.headers['Content-Disposition'] || '';
      let filename = `tickets_export_${new Date().toISOString().split('T')[0]}.pdf`;
      
      if (contentDisposition) {
        // Intentar extraer el nombre del archivo (soporta formato estÃ¡ndar y UTF-8)
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          let extractedFilename = filenameMatch[1].replace(/['"]/g, '');
          // Si estÃ¡ codificado en UTF-8, decodificar
          if (extractedFilename.includes('UTF-8')) {
            const utf8Match = contentDisposition.match(/filename\*=UTF-8''(.+)/);
            if (utf8Match) {
              extractedFilename = decodeURIComponent(utf8Match[1]);
            }
          }
          if (extractedFilename && extractedFilename !== 'UTF-8') {
            filename = extractedFilename;
          }
        }
      }
      
      // Crear el blob para PDF
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, filename };
    });
  },
};

export interface TicketStats {
  total: number;
  byStatus: Array<{ status: string; count: number; label: string }>;
  byPriority: Array<{ priority: string; count: number }>;
  byBranch: Array<{ branchId: string | null; branch: { id: string; name: string; code: string } | null; count: number }>;
  byDepartment: Array<{ departmentId: string | null; department: { id: string; name: string; code: string } | null; count: number }>;
  recentTickets: Ticket[];
}

export interface BranchUsersResponse {
  branch: {
    id: string;
    name: string;
    code: string;
  } | null;
  users: Array<{
    id: string;
    email: string;
    name: string;
    role: string;
    departmentId?: string;
    branchId?: string;
    isActive: boolean;
    department?: {
      id: string;
      name: string;
      code: string;
    };
    branch?: {
      id: string;
      name: string;
      code: string;
    };
    createdAt: string;
    ticketsCreated: number;
    ticketsAssigned: number;
    totalTickets: number;
  }>;
  totalUsers: number;
}

export const userService = {
  getAll: () => api.get('/users'),
  getById: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  changePassword: (id: string, newPassword: string) => api.put(`/users/${id}/password`, { newPassword }).then(res => res.data),
  getBranchUsers: () => api.get<BranchUsersResponse>('/users/branch').then(res => res.data),
};

export interface UserRequest {
  id: string;
  name: string;
  email: string;
  requestedRole: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  departmentId?: string;
  branchId?: string;
  rejectionReason?: string;
  processedById?: string;
  processedAt?: string;
  createdAt: string;
  department?: {
    id: string;
    name: string;
    code: string;
  };
  branch?: {
    id: string;
    name: string;
    code: string;
  };
  processedBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export const userRequestService = {
  create: (data: any) => api.post('/user-requests', data),
  getAll: (params?: { status?: string }) => api.get<UserRequest[]>('/user-requests', { params }),
  getById: (id: string) => api.get<UserRequest>(`/user-requests/${id}`),
  approve: (id: string) => api.post(`/user-requests/${id}/approve`),
  reject: (id: string, reason?: string) => api.post(`/user-requests/${id}/reject`, { rejectionReason: reason }),
};

export interface Notification {
  id: string;
  ticketId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  ticket?: {
    id: string;
    title: string;
    status: string;
  };
}

export const notificationService = {
  getAll: (unreadOnly?: boolean) =>
    api.get<{ notifications: Notification[]; unreadCount: number }>('/notifications', {
      params: { unreadOnly: unreadOnly ? 'true' : undefined },
    }).then(res => res.data),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`).then(res => res.data),
  markAllAsRead: () => api.put('/notifications/read-all').then(res => res.data),
};

export const branchService = {
  getAll: () => api.get<Branch[]>('/branches'),
  create: (data: any) => api.post<Branch>('/branches', data),
};

export const departmentService = {
  getAll: (branchId?: string) =>
    api.get<Department[]>('/departments', { params: { branchId } }),
  create: (data: any) => api.post<Department>('/departments', data),
};

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'TECHNICIAN' | 'USER' | 'SUPERVISOR' | 'AUDITOR';
  department?: {
    id: string;
    name: string;
    code: string;
  };
  branch?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
  message: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: string;
  departmentId?: string;
  branchId?: string;
}

export const authService = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { email, password }).then(res => res.data),
  register: (data: RegisterData, token: string) =>
    api.post('/auth/register', data, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  getMe: (token: string) =>
    api.get<AuthUser>('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { currentPassword, newPassword }).then(res => res.data),
};

export interface SystemLog {
  id: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  category: string;
  userId?: string;
  ticketId?: string;
  metadata?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  ticket?: {
    id: string;
    title: string;
  };
}

export interface LogStats {
  total: number;
  byLevel: Array<{ level: string; count: number }>;
  byCategory: Array<{ category: string; count: number }>;
  recentErrors: SystemLog[];
}

export const logService = {
  getAll: (params?: {
    level?: string;
    category?: string;
    userId?: string;
    ticketId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return api.get<{ logs: SystemLog[]; pagination: any }>(`/logs?${queryParams.toString()}`).then(res => res.data);
  },
  getStats: (params?: { startDate?: string; endDate?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value);
        }
      });
    }
    return api.get<LogStats>(`/logs/stats?${queryParams.toString()}`).then(res => res.data);
  },
  delete: (id: string) => api.delete(`/logs/${id}`).then(res => res.data),
  cleanup: (days?: number) => {
    const params = days ? `?days=${days}` : '';
    return api.delete(`/logs${params}`).then(res => res.data);
  },
};

export const attachmentService = {
  upload: (ticketId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    return api.post<{ message: string; attachments: Attachment[] }>(`/attachments/tickets/${ticketId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  },
  getByTicket: (ticketId: string) => {
    return api.get<Attachment[]>(`/attachments/tickets/${ticketId}`).then(res => res.data);
  },
  download: (id: string) => {
    return api.get(`/attachments/${id}/download`, {
      responseType: 'blob',
    }).then((res) => {
      // Extraer el nombre del archivo del header Content-Disposition
      const contentDisposition = res.headers['content-disposition'];
      let filename = `attachment_${id}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, filename };
    });
  },
  delete: (id: string) => {
    return api.delete(`/attachments/${id}`).then(res => res.data);
  },
};

export default api;


