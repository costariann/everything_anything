export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface HealthCheckData {
  status: 'healthy' | 'degraded';
  uptimeSeconds: number;
  environment: string;
  timestamp: string;
  database: {
    connected: boolean;
    message: string;
  };
}

