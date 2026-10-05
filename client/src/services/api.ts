import {
  User,
  Field,
  Advisory,
  RegisterInput,
  LoginInput,
  CreateFieldInput,
  GenerateAdvisoryInput,
} from '@shared/schemas';

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('agritech_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('agritech_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('agritech_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'An error occurred during request execution');
  }

  return data as T;
}

// Auth API Services
export const authApi = {
  register: (payload: RegisterInput) => request<{ message: string; token: string; user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  login: (payload: LoginInput) => request<{ message: string; token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getMe: () => request<{ user: User }>('/auth/me'),
};

// Fields API Services
export const fieldsApi = {
  getAll: () => request<{ fields: Field[] }>('/fields'),
  getById: (id: string) => request<{ field: Field }>(`/fields/${id}`),
  create: (payload: CreateFieldInput) => request<{ field: Field }>('/fields', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  update: (id: string, payload: Partial<CreateFieldInput>) => request<{ field: Field }>(`/fields/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  delete: (id: string) => request<{ message: string }>(`/fields/${id}`, {
    method: 'DELETE',
  }),
};

// Advisory API Services
export const advisoryApi = {
  generate: (payload: GenerateAdvisoryInput) => request<{ advisory: Advisory }>('/advisory/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getAll: (filters?: { field_id?: string; advisory_type?: string; severity_rating?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.field_id) params.append('field_id', filters.field_id);
    if (filters?.advisory_type) params.append('advisory_type', filters.advisory_type);
    if (filters?.severity_rating) params.append('severity_rating', filters.severity_rating);
    if (filters?.status) params.append('status', filters.status);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request<{ advisories: Advisory[] }>(`/advisory${queryString}`);
  },
  getById: (id: string) => request<{ advisory: Advisory }>(`/advisory/${id}`),
  updateStatus: (id: string, status: 'ACTIVE' | 'RESOLVED' | 'ARCHIVED') => request<{ advisory: Advisory }>(`/advisory/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
};

// Real-time Agricultural Weather Service (Open-Meteo Free API)
export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  rain: number;
  evapotranspiration: number; // ET0 mm/day
  condition: string;
}

export async function fetchAgriculturalWeather(latitude = 18.5204, longitude = 73.8567): Promise<WeatherData> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m,weather_code&daily=et0_fao_evapotranspiration&timezone=auto`
    );
    if (!res.ok) throw new Error('Failed to fetch weather');
    const data = await res.json();
    
    const code = data.current?.weather_code ?? 0;
    let condition = 'Clear Sky';
    if (code >= 1 && code <= 3) condition = 'Partly Cloudy';
    else if (code >= 45 && code <= 48) condition = 'Foggy';
    else if (code >= 51 && code <= 67) condition = 'Rain Showers';
    else if (code >= 80 && code <= 99) condition = 'Thunderstorm / Heavy Rain';

    return {
      temperature: data.current?.temperature_2m ?? 26.5,
      humidity: data.current?.relative_humidity_2m ?? 65,
      windSpeed: data.current?.wind_speed_10m ?? 12.4,
      rain: data.current?.rain ?? 0,
      evapotranspiration: data.daily?.et0_fao_evapotranspiration?.[0] ?? 4.2,
      condition,
    };
  } catch (err) {
    // Return fallback realistic agricultural weather
    return {
      temperature: 27.5,
      humidity: 62,
      windSpeed: 10.5,
      rain: 0.0,
      evapotranspiration: 4.5,
      condition: 'Partly Sunny',
    };
  }
}
