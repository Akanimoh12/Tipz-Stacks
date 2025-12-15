/**
 * Web Vitals Performance Monitoring
 * Tracks Core Web Vitals (LCP, FID, CLS, FCP, TTFB) and reports to analytics
 */

import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals';

interface PerformanceMetrics {
  LCP?: number;  // Largest Contentful Paint
  FID?: number;  // First Input Delay
  CLS?: number;  // Cumulative Layout Shift
  FCP?: number;  // First Contentful Paint
  TTFB?: number; // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private reportEndpoint: string | null = null;
  private debug: boolean = false;

  constructor(debug: boolean = false) {
    this.debug = debug;
    // Set this to your analytics endpoint
    this.reportEndpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT || null;
  }

  /**
   * Initialize all performance monitoring
   */
  init(): void {
    if (typeof window === 'undefined') return;

    // Monitor Core Web Vitals
    onLCP(this.handleMetric.bind(this));
    onINP(this.handleMetric.bind(this));
    onCLS(this.handleMetric.bind(this));
    onFCP(this.handleMetric.bind(this));
    onTTFB(this.handleMetric.bind(this));

    // Monitor custom performance metrics
    this.monitorResourceTiming();
    this.monitorNavigationTiming();
    
    if (this.debug) {
      console.log('🚀 Performance monitoring initialized');
    }
  }

  /**
   * Handle individual metric
   */
  private handleMetric(metric: Metric): void {
    const { name, value, rating } = metric;
    
    this.metrics[name as keyof PerformanceMetrics] = value;

    if (this.debug) {
      console.log(`📊 ${name}:`, {
        value: Math.round(value),
        rating,
        unit: this.getMetricUnit(name),
      });
    }

    // Report to analytics
    this.reportMetric(metric);
  }

  /**
   * Get unit for metric
   */
  private getMetricUnit(name: string): string {
    if (name === 'CLS') return 'score';
    return 'ms';
  }

  /**
   * Report metric to analytics service
   */
  private reportMetric(metric: Metric): void {
    if (!this.reportEndpoint) return;

    // Send to your analytics service
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    });

    // Use sendBeacon for reliability
    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.reportEndpoint, body);
    } else {
      // Fallback to fetch
      fetch(this.reportEndpoint, {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(console.error);
    }
  }

  /**
   * Monitor resource loading times
   */
  private monitorResourceTiming(): void {
    if (!('performance' in window)) return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        const resources = performance.getEntriesByType('resource');
        const stats = {
          scripts: [] as number[],
          styles: [] as number[],
          images: [] as number[],
          fonts: [] as number[],
        };

        resources.forEach((resource: any) => {
          const duration = resource.duration;
          const type = this.getResourceType(resource.name);

          if (type && stats[type as keyof typeof stats]) {
            stats[type as keyof typeof stats].push(duration);
          }
        });

        if (this.debug) {
          console.log('📦 Resource Loading Times:', {
            scripts: this.calculateStats(stats.scripts),
            styles: this.calculateStats(stats.styles),
            images: this.calculateStats(stats.images),
            fonts: this.calculateStats(stats.fonts),
          });
        }
      }, 1000);
    });
  }

  /**
   * Get resource type from URL
   */
  private getResourceType(url: string): string | null {
    if (url.includes('.js')) return 'scripts';
    if (url.includes('.css')) return 'styles';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)/i)) return 'images';
    if (url.match(/\.(woff|woff2|ttf|otf)/i)) return 'fonts';
    return null;
  }

  /**
   * Calculate statistics for array of values
   */
  private calculateStats(values: number[]) {
    if (values.length === 0) return { count: 0 };

    const sorted = values.sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: values.length,
      min: Math.round(sorted[0]),
      max: Math.round(sorted[sorted.length - 1]),
      avg: Math.round(sum / values.length),
      median: Math.round(sorted[Math.floor(sorted.length / 2)]),
    };
  }

  /**
   * Monitor navigation timing
   */
  private monitorNavigationTiming(): void {
    if (!('performance' in window)) return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as any;
        if (!navigation) return;

        const timings = {
          dns: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
          tcp: Math.round(navigation.connectEnd - navigation.connectStart),
          ttfb: Math.round(navigation.responseStart - navigation.requestStart),
          download: Math.round(navigation.responseEnd - navigation.responseStart),
          domParse: Math.round(navigation.domInteractive - navigation.domLoading),
          domReady: Math.round(navigation.domContentLoadedEventEnd - navigation.domLoading),
          load: Math.round(navigation.loadEventEnd - navigation.fetchStart),
        };

        if (this.debug) {
          console.log('⏱️ Navigation Timing:', timings);
        }
      }, 1000);
    });
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance rating
   */
  getPerformanceRating(): string {
    const { LCP, FID, CLS } = this.metrics;

    // Check if we have all critical metrics
    if (!LCP || !CLS) return 'unknown';

    // Good thresholds:
    // LCP: < 2.5s
    // FID: < 100ms
    // CLS: < 0.1
    const lcpGood = LCP < 2500;
    const fidGood = !FID || FID < 100;
    const clsGood = CLS < 0.1;

    if (lcpGood && fidGood && clsGood) return 'good';
    if (LCP > 4000 || (FID && FID > 300) || CLS > 0.25) return 'poor';
    return 'needs-improvement';
  }

  /**
   * Log performance summary
   */
  logSummary(): void {
    const metrics = this.getMetrics();
    const rating = this.getPerformanceRating();

    console.group('📈 Performance Summary');
    console.log('Rating:', rating);
    console.log('Metrics:', {
      'LCP (Largest Contentful Paint)': metrics.LCP ? `${Math.round(metrics.LCP)}ms` : 'N/A',
      'FID (First Input Delay)': metrics.FID ? `${Math.round(metrics.FID)}ms` : 'N/A',
      'CLS (Cumulative Layout Shift)': metrics.CLS ? Math.round(metrics.CLS * 1000) / 1000 : 'N/A',
      'FCP (First Contentful Paint)': metrics.FCP ? `${Math.round(metrics.FCP)}ms` : 'N/A',
      'TTFB (Time to First Byte)': metrics.TTFB ? `${Math.round(metrics.TTFB)}ms` : 'N/A',
    });
    console.groupEnd();
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor(import.meta.env.DEV);

// Auto-initialize in browser
if (typeof window !== 'undefined') {
  performanceMonitor.init();
  
  // Log summary after page load
  if (import.meta.env.DEV) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        performanceMonitor.logSummary();
      }, 5000);
    });
  }
}

export default performanceMonitor;
export { PerformanceMonitor };
