// Deployment configuration with feature flags and rollback strategy
export interface DeploymentStage {
  name: string;
  percentage: number;
  features: Record<string, boolean>;
  monitoring: {
    errorRateThreshold: number; // Percentage
    latencyThreshold: number; // Milliseconds
    minSampleSize: number;
  };
}

export const DEPLOYMENT_STAGES: DeploymentStage[] = [
  {
    name: 'canary',
    percentage: 10,
    features: {
      USE_ENHANCED_AGENTS: true,
      USE_NEW_ORCHESTRATOR: false,
      USE_WORKFLOW_TEMPLATES: false,
      ENABLE_AGENT_TOOLS: true
    },
    monitoring: {
      errorRateThreshold: 5,
      latencyThreshold: 3000,
      minSampleSize: 100
    }
  },
  {
    name: 'beta',
    percentage: 25,
    features: {
      USE_ENHANCED_AGENTS: true,
      USE_NEW_ORCHESTRATOR: true,
      USE_WORKFLOW_TEMPLATES: false,
      ENABLE_AGENT_TOOLS: true
    },
    monitoring: {
      errorRateThreshold: 3,
      latencyThreshold: 2500,
      minSampleSize: 500
    }
  },
  {
    name: 'gradual',
    percentage: 50,
    features: {
      USE_ENHANCED_AGENTS: true,
      USE_NEW_ORCHESTRATOR: true,
      USE_WORKFLOW_TEMPLATES: true,
      ENABLE_AGENT_TOOLS: true
    },
    monitoring: {
      errorRateThreshold: 2,
      latencyThreshold: 2000,
      minSampleSize: 1000
    }
  },
  {
    name: 'general',
    percentage: 100,
    features: {
      USE_ENHANCED_AGENTS: true,
      USE_NEW_ORCHESTRATOR: true,
      USE_WORKFLOW_TEMPLATES: true,
      ENABLE_AGENT_TOOLS: true
    },
    monitoring: {
      errorRateThreshold: 1,
      latencyThreshold: 1500,
      minSampleSize: 5000
    }
  }
];

export interface RollbackCriteria {
  metric: 'error_rate' | 'latency' | 'success_rate';
  threshold: number;
  duration: number; // Minutes
  action: 'rollback' | 'alert' | 'pause';
}

export const ROLLBACK_CRITERIA: RollbackCriteria[] = [
  {
    metric: 'error_rate',
    threshold: 5, // 5% error rate
    duration: 5,
    action: 'rollback'
  },
  {
    metric: 'latency',
    threshold: 3000, // 3 seconds
    duration: 10,
    action: 'alert'
  },
  {
    metric: 'success_rate',
    threshold: 95, // Less than 95% success
    duration: 15,
    action: 'pause'
  }
];

// Monitoring configuration
export interface MonitoringConfig {
  metricsEndpoint: string;
  alertWebhook: string;
  dashboardUrl: string;
  sampleRate: number;
}

export const MONITORING_CONFIG: MonitoringConfig = {
  metricsEndpoint: Deno.env.get('METRICS_ENDPOINT') || 'https://metrics.example.com/api/v1/metrics',
  alertWebhook: Deno.env.get('ALERT_WEBHOOK') || 'https://hooks.slack.com/services/xxx',
  dashboardUrl: Deno.env.get('DASHBOARD_URL') || 'https://dashboard.example.com',
  sampleRate: parseFloat(Deno.env.get('METRICS_SAMPLE_RATE') || '0.1') // 10% sampling
};

// Feature flag service
export class FeatureFlagService {
  private static instance: FeatureFlagService;
  private flags: Record<string, boolean> = {};
  private userOverrides: Map<string, Record<string, boolean>> = new Map();

  private constructor() {
    this.loadFlags();
  }

  static getInstance(): FeatureFlagService {
    if (!this.instance) {
      this.instance = new FeatureFlagService();
    }
    return this.instance;
  }

  private loadFlags(): void {
    // Load from environment or configuration service
    const stage = this.getCurrentStage();
    if (stage) {
      this.flags = stage.features;
    }
  }

  private getCurrentStage(): DeploymentStage | undefined {
    const stageName = Deno.env.get('DEPLOYMENT_STAGE') || 'canary';
    return DEPLOYMENT_STAGES.find(s => s.name === stageName);
  }

  isEnabled(flag: string, userId?: string): boolean {
    // Check user-specific overrides first
    if (userId && this.userOverrides.has(userId)) {
      const userFlags = this.userOverrides.get(userId)!;
      if (flag in userFlags) {
        return userFlags[flag];
      }
    }

    // Check percentage-based rollout
    if (userId && this.shouldEnableForUser(flag, userId)) {
      return true;
    }

    // Default to global flag value
    return this.flags[flag] || false;
  }

  private shouldEnableForUser(flag: string, userId: string): boolean {
    const stage = this.getCurrentStage();
    if (!stage) return false;

    // Simple hash-based distribution
    const hash = this.hashString(userId + flag);
    const percentage = (hash % 100) + 1;
    
    return percentage <= stage.percentage;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  setUserOverride(userId: string, flags: Record<string, boolean>): void {
    this.userOverrides.set(userId, flags);
  }

  clearUserOverride(userId: string): void {
    this.userOverrides.delete(userId);
  }

  getAllFlags(): Record<string, boolean> {
    return { ...this.flags };
  }

  updateFlag(flag: string, enabled: boolean): void {
    this.flags[flag] = enabled;
    // In production, persist to configuration service
  }
}

// Deployment manager
export class DeploymentManager {
  private currentStage: string;
  private metrics: Map<string, number[]> = new Map();

  constructor() {
    this.currentStage = Deno.env.get('DEPLOYMENT_STAGE') || 'canary';
  }

  async checkRollbackCriteria(): Promise<{ shouldRollback: boolean; reason?: string }> {
    for (const criteria of ROLLBACK_CRITERIA) {
      const metricValues = this.getMetricValues(criteria.metric, criteria.duration);
      const average = this.calculateAverage(metricValues);

      let shouldTrigger = false;
      switch (criteria.metric) {
        case 'error_rate':
          shouldTrigger = average > criteria.threshold;
          break;
        case 'latency':
          shouldTrigger = average > criteria.threshold;
          break;
        case 'success_rate':
          shouldTrigger = average < criteria.threshold;
          break;
      }

      if (shouldTrigger) {
        return {
          shouldRollback: criteria.action === 'rollback',
          reason: `${criteria.metric} exceeded threshold: ${average} (threshold: ${criteria.threshold})`
        };
      }
    }

    return { shouldRollback: false };
  }

  private getMetricValues(metric: string, durationMinutes: number): number[] {
    // In production, fetch from metrics service
    // For now, return mock data
    const values = this.metrics.get(metric) || [];
    const cutoff = Date.now() - (durationMinutes * 60 * 1000);
    return values.filter((_, index) => index > values.length - durationMinutes);
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  async promoteToNextStage(): Promise<boolean> {
    const currentIndex = DEPLOYMENT_STAGES.findIndex(s => s.name === this.currentStage);
    if (currentIndex === -1 || currentIndex === DEPLOYMENT_STAGES.length - 1) {
      return false;
    }

    const nextStage = DEPLOYMENT_STAGES[currentIndex + 1];
    
    // Update environment
    Deno.env.set('DEPLOYMENT_STAGE', nextStage.name);
    
    // Update feature flags
    const flagService = FeatureFlagService.getInstance();
    Object.entries(nextStage.features).forEach(([flag, enabled]) => {
      flagService.updateFlag(flag, enabled);
    });

    this.currentStage = nextStage.name;
    
    // Log promotion
    console.log(`Promoted to stage: ${nextStage.name} (${nextStage.percentage}% rollout)`);
    
    return true;
  }

  async rollback(): Promise<void> {
    console.log('Initiating rollback...');
    
    // Disable all new features
    const flagService = FeatureFlagService.getInstance();
    flagService.updateFlag('USE_ENHANCED_AGENTS', false);
    flagService.updateFlag('USE_NEW_ORCHESTRATOR', false);
    flagService.updateFlag('USE_WORKFLOW_TEMPLATES', false);
    flagService.updateFlag('ENABLE_AGENT_TOOLS', false);
    
    // Set stage back to stable
    Deno.env.set('DEPLOYMENT_STAGE', 'stable');
    this.currentStage = 'stable';
    
    // Send alert
    await this.sendAlert('Deployment rolled back due to issues');
  }

  private async sendAlert(message: string): Promise<void> {
    if (MONITORING_CONFIG.alertWebhook) {
      try {
        await fetch(MONITORING_CONFIG.alertWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: message })
        });
      } catch (error) {
        console.error('Failed to send alert:', error);
      }
    }
  }

  recordMetric(metric: string, value: number): void {
    if (!this.metrics.has(metric)) {
      this.metrics.set(metric, []);
    }
    
    const values = this.metrics.get(metric)!;
    values.push(value);
    
    // Keep only last 1000 values
    if (values.length > 1000) {
      values.shift();
    }
  }
}

// Export singleton instances
export const featureFlags = FeatureFlagService.getInstance();
export const deploymentManager = new DeploymentManager();