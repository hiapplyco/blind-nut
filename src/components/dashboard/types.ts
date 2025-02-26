
export type CardType = 
  | 'counter'
  | 'gauge'
  | 'pie'
  | 'map'
  | 'boxplot'
  | 'line'
  | 'bar'
  | 'radar'
  | 'heatmap'
  | 'funnel';

export type CardSize = '1x1' | '1x2' | '2x1' | '2x2';

export interface CardConfig {
  id: string;
  title: string;
  type: CardType;
  dataKeys: string[];
  size: CardSize;
  priority: number;
  minDataPoints: number;
  fallbackCard?: string;
}

export interface CardData {
  config: CardConfig;
  content: any;
}

export interface DashboardProps {
  data: any;
  configs: CardConfig[];
}
