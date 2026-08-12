import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../services/analytics.service';
import { HostHealth } from '../../models/analytics.models';

@Component({
  selector: 'app-host-health',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './host-health.component.html',
  styleUrls: ['./host-health.component.scss']
})
export class HostHealthComponent implements OnInit, OnDestroy {
  loading = true;
  error: string | null = null;
  hosts: HostHealth[] = [];
  filteredHosts: HostHealth[] = [];
  activeFilter: 'ALL' | 'HIGH LOAD' | 'LIVE' = 'ALL';
  lastUpdated = new Date();
  searchQuery = '';
  private refreshInterval: any;

  constructor(
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadHostHealth();
    // Auto refresh host health every 10 seconds
    this.refreshInterval = setInterval(() => {
      this.loadHostHealth(false);
    }, 10000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadHostHealth(showSpinner = true): void {
    if (showSpinner) {
      this.loading = true;
    }
    this.error = null;

    this.analyticsService.getHostHealth().subscribe({
      next: (data) => {
        this.hosts = data;
        this.applyFilter();
        this.lastUpdated = new Date();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[HostHealth] API Error:', err);
        this.error = 'Failed to load host infrastructure metrics.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  setFilter(filter: 'ALL' | 'HIGH LOAD' | 'LIVE'): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value.toLowerCase().trim();
    this.applyFilter();
  }

  private applyFilter(): void {
    let result = [...this.hosts];

    if (this.activeFilter !== 'ALL') {
      result = result.filter(h => h.status === this.activeFilter);
    }

    if (this.searchQuery) {
      result = result.filter(h => h.host.toLowerCase().includes(this.searchQuery));
    }

    this.filteredHosts = result;
  }

  get totalNodes(): number {
    return this.hosts.length;
  }

  get highLoadCount(): number {
    return this.hosts.filter(h => h.status === 'HIGH LOAD').length;
  }

  get liveCount(): number {
    return this.hosts.filter(h => h.status === 'LIVE').length;
  }

  get avgCpu(): number {
    if (!this.hosts.length) return 0;
    const sum = this.hosts.reduce((acc, h) => acc + h.cpuPercent, 0);
    return Math.round(sum / this.hosts.length);
  }

  get avgRam(): number {
    if (!this.hosts.length) return 0;
    const sum = this.hosts.reduce((acc, h) => acc + h.memoryPercent, 0);
    return Math.round(sum / this.hosts.length);
  }
}
