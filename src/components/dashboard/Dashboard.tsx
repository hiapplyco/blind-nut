
import { DashboardCard } from "./Card";
import { DashboardProps, CardConfig, CardData } from "./types";

const filterAndSortCards = (data: any, configs: CardConfig[]): CardData[] => {
  return configs
    .filter(config => {
      // Check if all required data keys exist and have sufficient data points
      const hasRequiredData = config.dataKeys.every(key => {
        const value = data[key];
        return value && (Array.isArray(value) ? value.length >= config.minDataPoints : true);
      });
      return hasRequiredData;
    })
    .sort((a, b) => b.priority - a.priority)
    .map(config => ({
      config,
      content: config.dataKeys.reduce((acc, key) => {
        acc[key] = data[key];
        return acc;
      }, {}),
    }));
};

export function Dashboard({ data, configs }: DashboardProps) {
  const cards = filterAndSortCards(data, configs);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max">
      {cards.map((card) => (
        <DashboardCard key={card.config.id} data={card} />
      ))}
    </div>
  );
}
