import { Component, ElementRef, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { forkJoin, catchError, of, tap, timeout } from 'rxjs';
import { AnalyticsService } from '../../services/analytics.service';
import { DailyTraffic, TopPath, StatusBreakdown, TopHost, HourlyTraffic, ErrorRateByDay, HostHealth } from '../../models/analytics.models';

import { HostHealthComponent } from '../host-health.component/host-health.component';

const AMBER = '#ffb000';
const CYAN = '#5eead4';
const GRID_LINE = 'rgba(232, 230, 223, 0.08)';
const TEXT_MUTED = '#7c8494';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HostHealthComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('dailyTrafficCanvas') dailyTrafficCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('hourlyTrafficCanvas') hourlyTrafficCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusCanvas') statusCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('errorRateCanvas') errorRateCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('bgVideo') bgVideo!: ElementRef<HTMLVideoElement>;

  activeTab: 'overview' | 'infrastructure' | 'paths' | 'errors' = 'overview';
  sidebarCollapsed = false;

  loading = true;
  error: string | null = null;
  lastUpdated = new Date();
  topPaths: TopPath[] = [];
  topHosts: TopHost[] = [];
  hostHealth: HostHealth[] = [];
  totalRequests = 0;

  private dailyTraffic: DailyTraffic[] = [];
  private hourlyTraffic: HourlyTraffic[] = [];
  private statusBreakdown: StatusBreakdown[] = [];
  private errorRate: ErrorRateByDay[] = [];

  currentTheme: 'dark' | 'light' = 'dark';
  videoBgEnabled = true;

  constructor(private analytics: AnalyticsService, private cdr: ChangeDetectorRef) {}

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('telemetry_theme', this.currentTheme);
    }
  }

  toggleVideoBg(): void {
    this.videoBgEnabled = !this.videoBgEnabled;
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('telemetry_video_bg', String(this.videoBgEnabled));
    }
    this.cdr.detectChanges();
  }

  selectTab(tab: 'overview' | 'infrastructure' | 'paths' | 'errors'): void {
    this.activeTab = tab;
    this.cdr.detectChanges();
    if (tab === 'overview') {
      setTimeout(() => this.renderCharts(), 100);
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedTheme = localStorage.getItem('telemetry_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        this.currentTheme = savedTheme;
      }
      const savedVideo = localStorage.getItem('telemetry_video_bg');
      if (savedVideo !== null) {
        this.videoBgEnabled = savedVideo === 'true';
      }
    }

    console.log('[Analytics] Initializing telemetry dashboard API calls...');
    this.loading = true;
    this.error = null;

    // Safety fallback timer: force loading = false after 3s max
    setTimeout(() => {
      if (this.loading) {
        console.warn('[Analytics] Safety timer triggered: forcing loading = false');
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.renderCharts(), 50);
      }
    }, 3000);

    console.log('[Analytics] daily-traffic START');
    const daily$ = this.analytics.getDailyTraffic().pipe(
      timeout(10000),
      tap((res) => console.log('[Analytics] daily-traffic SUCCESS', res)),
      catchError((err) => {
        console.error('[Analytics] daily-traffic ERROR:', err);
        return of([] as DailyTraffic[]);
      })
    );

    console.log('[Analytics] top-paths START');
    const topPaths$ = this.analytics.getTopPaths(8).pipe(
      timeout(10000),
      tap((res) => console.log('[Analytics] top-paths SUCCESS', res)),
      catchError((err) => {
        console.error('[Analytics] top-paths ERROR:', err);
        return of([] as TopPath[]);
      })
    );

    console.log('[Analytics] status-breakdown START');
    const status$ = this.analytics.getStatusBreakdown().pipe(
      timeout(10000),
      tap((res) => console.log('[Analytics] status-breakdown SUCCESS', res)),
      catchError((err) => {
        console.error('[Analytics] status-breakdown ERROR:', err);
        return of([] as StatusBreakdown[]);
      })
    );

    console.log('[Analytics] top-hosts START');
    const topHosts$ = this.analytics.getTopHosts(8).pipe(
      timeout(10000),
      tap((res) => console.log('[Analytics] top-hosts SUCCESS', res)),
      catchError((err) => {
        console.error('[Analytics] top-hosts ERROR:', err);
        return of([] as TopHost[]);
      })
    );

    console.log('[Analytics] hourly-traffic START');
    const hourly$ = this.analytics.getHourlyTraffic().pipe(
      timeout(10000),
      tap((res) => console.log('[Analytics] hourly-traffic SUCCESS', res)),
      catchError((err) => {
        console.error('[Analytics] hourly-traffic ERROR:', err);
        return of([] as HourlyTraffic[]);
      })
    );

    console.log('[Analytics] error-rate START');
    const errorRate$ = this.analytics.getErrorRate().pipe(
      timeout(10000),
      tap((res) => console.log('[Analytics] error-rate SUCCESS', res)),
      catchError((err) => {
        console.error('[Analytics] error-rate ERROR:', err);
        return of([] as ErrorRateByDay[]);
      })
    );

    console.log('[Analytics] host-health START');
    const hostHealth$ = this.analytics.getHostHealth().pipe(
      timeout(10000),
      tap((res) => console.log('[Analytics] host-health SUCCESS', res)),
      catchError((err) => {
        console.error('[Analytics] host-health ERROR:', err);
        return of([] as HostHealth[]);
      })
    );

    forkJoin({
      dailyTraffic: daily$,
      topPaths: topPaths$,
      statusBreakdown: status$,
      topHosts: topHosts$,
      hourlyTraffic: hourly$,
      errorRate: errorRate$,
      hostHealth: hostHealth$,
    }).subscribe({
      next: (result) => {
        console.log('[Analytics] All API responses received:', result);

        this.dailyTraffic = result.dailyTraffic;
        this.topPaths = result.topPaths;
        this.statusBreakdown = result.statusBreakdown;
        this.topHosts = result.topHosts;
        this.hourlyTraffic = result.hourlyTraffic;
        this.errorRate = result.errorRate;
        this.hostHealth = result.hostHealth;

        this.totalRequests = result.dailyTraffic.reduce((sum, d) => sum + d.requests, 0);
        this.lastUpdated = new Date();
        this.loading = false;
        this.cdr.detectChanges();

        setTimeout(() => {
          this.renderCharts();
        }, 50);
      },
      error: (err) => {
        console.error('[Analytics] API ERROR:', err);
        this.error = 'Could not load analytics data.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  ngAfterViewInit(): void {
    if (this.bgVideo?.nativeElement) {
      const video = this.bgVideo.nativeElement;
      video.muted = true;
      video.play().catch((err) => {
        console.warn('[Analytics] Video autoplay prevented:', err);
      });
    }
  }

  private renderCharts(): void {
    this.renderDailyTrafficChart();
    this.renderHourlyTrafficChart();
    this.renderStatusChart();
    this.renderErrorRateChart();
  }

  private baseGridOptions() {
    return {
      grid: { color: GRID_LINE },
      ticks: { color: TEXT_MUTED, font: { family: "'IBM Plex Mono', monospace", size: 11 } },
    };
  }

  private renderDailyTrafficChart(): void {
    if (!this.dailyTrafficCanvas) return;
    new Chart(this.dailyTrafficCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: this.dailyTraffic.map((d) => d.day.slice(5, 10)),
        datasets: [{
          label: 'Requests / day',
          data: this.dailyTraffic.map((d) => d.requests),
          borderColor: AMBER,
          backgroundColor: 'rgba(255, 176, 0, 0.12)',
          fill: true, tension: 0.25, pointRadius: 0, borderWidth: 2,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: this.baseGridOptions(), y: this.baseGridOptions() },
      },
    });
  }

  private renderHourlyTrafficChart(): void {
    if (!this.hourlyTrafficCanvas) return;
    new Chart(this.hourlyTrafficCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: this.hourlyTraffic.map((h) => `${h.hourOfDay}:00`),
        datasets: [{
          label: 'Requests by hour',
          data: this.hourlyTraffic.map((h) => h.requests),
          backgroundColor: 'rgba(94, 234, 212, 0.65)',
          borderRadius: 2,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: this.baseGridOptions(), y: this.baseGridOptions() },
      },
    });
  }

  private renderStatusChart(): void {
    if (!this.statusCanvas) return;
    const palette = [AMBER, CYAN, '#f97066', '#8b95a7', '#4b5563', '#d1d5db'];
    new Chart(this.statusCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.statusBreakdown.map((s) => String(s.statusCode)),
        datasets: [{
          data: this.statusBreakdown.map((s) => s.requests),
          backgroundColor: this.statusBreakdown.map((_, i) => palette[i % palette.length]),
          borderColor: '#1f2530', borderWidth: 2,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'right', labels: { color: TEXT_MUTED, font: { family: "'IBM Plex Mono', monospace", size: 11 } } } },
      },
    });
  }

  private renderErrorRateChart(): void {
    if (!this.errorRateCanvas) return;
    new Chart(this.errorRateCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: this.errorRate.map((e) => e.day.slice(5, 10)),
        datasets: [{
          label: 'Error rate %',
          data: this.errorRate.map((e) => e.errorPct),
          borderColor: '#f97066',
          backgroundColor: 'rgba(249, 112, 102, 0.12)',
          fill: true, tension: 0.25, pointRadius: 0, borderWidth: 2,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: this.baseGridOptions(), y: this.baseGridOptions() },
      },
    });
  }

  formatBytes(bytes: number): string {
    if (bytes >= 1_000_000_000) return (bytes / 1_000_000_000).toFixed(2) + ' GB';
    if (bytes >= 1_000_000) return (bytes / 1_000_000).toFixed(2) + ' MB';
    if (bytes >= 1_000) return (bytes / 1_000).toFixed(1) + ' KB';
    return bytes + ' B';
  }
}