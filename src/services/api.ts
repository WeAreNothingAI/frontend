import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_CONFIG } from '../constants/config';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 요청 인터셉터
    this.client.interceptors.request.use(
      (config) => {
        // 토큰 추가 등
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 응답 인터셉터
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response.data,
      (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  get<T = any>(url: string, config = {}): Promise<T> {
    return this.client.get(url, config);
  }

  post<T = any>(url: string, data = {}, config = {}): Promise<T> {
    return this.client.post(url, data, config);
  }

  put<T = any>(url: string, data = {}, config = {}): Promise<T> {
    return this.client.put(url, data, config);
  }

  delete<T = any>(url: string, config = {}): Promise<T> {
    return this.client.delete(url, config);
  }
}

export default new ApiService();