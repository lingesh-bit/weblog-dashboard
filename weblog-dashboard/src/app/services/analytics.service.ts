import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../environments/environments';
import { DailyTraffic, TopPath, StatusBreakdown, TopHost, HourlyTraffic, ErrorRateByDay, HostHealth } from '../models/analytics.models';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly primaryUrl = `${environment.apiBaseUrl}/analytics`;
  private readonly fallbackUrl = `http://localhost:5268/api/analytics`;

  constructor(private http: HttpClient) {}

  private getWithFallback<T>(endpoint: string, params?: any): Observable<T> {
    const primary = `${this.primaryUrl}/${endpoint}`;
    const fallback = `${this.fallbackUrl}/${endpoint}`;

    return this.http.get<T>(primary, { params }).pipe(
      catchError(() => this.http.get<T>(fallback, { params }))
    );
  }

  getDailyTraffic(): Observable<DailyTraffic[]> {
    return this.getWithFallback<DailyTraffic[]>('daily-traffic');
  }

  getTopPaths(limit = 10): Observable<TopPath[]> {
    return this.getWithFallback<TopPath[]>('top-paths', { limit });
  }

  getStatusBreakdown(): Observable<StatusBreakdown[]> {
    return this.getWithFallback<StatusBreakdown[]>('status-breakdown');
  }

  getTopHosts(limit = 10): Observable<TopHost[]> {
    return this.getWithFallback<TopHost[]>('top-hosts', { limit });
  }

  getHourlyTraffic(): Observable<HourlyTraffic[]> {
    return this.getWithFallback<HourlyTraffic[]>('hourly-traffic');
  }

  getErrorRate(): Observable<ErrorRateByDay[]> {
    return this.getWithFallback<ErrorRateByDay[]>('error-rate');
  }

  getHostHealth(): Observable<HostHealth[]> {
    return this.getWithFallback<HostHealth[]>('host-health');
  }
}