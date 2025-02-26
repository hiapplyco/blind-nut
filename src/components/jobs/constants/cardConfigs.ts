
import { CardConfig } from '@/components/dashboard/types';

export const DEFAULT_CARD_CONFIGS: CardConfig[] = [
  {
    id: 'salary-overview',
    title: 'Salary Range Overview',
    type: 'bar',
    dataKeys: ['analysis.extractedData.salaryRange'],
    size: '2x1',
    priority: 100,
    minDataPoints: 1
  },
  {
    id: 'skills-required',
    title: 'Required Skills',
    type: 'bar',
    dataKeys: ['analysis.extractedData.skills'],
    size: '1x2',
    priority: 90,
    minDataPoints: 1
  },
  {
    id: 'market-health',
    title: 'Job Market Health',
    type: 'pie',
    dataKeys: ['analysis.marketHealth'],
    size: '1x1',
    priority: 85,
    minDataPoints: 1
  }
];
