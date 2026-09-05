import { STATIC_TRAFFIC_FACTS } from '../data/marquee';
import { MarqueeItem } from '../types/radar';

export async function getMarqueeItems(): Promise<MarqueeItem[]> {
  // Return curated real traffic facts directly for server-rendering
  // Live statuspage checks run client-side on mount or via /api/marquee
  return STATIC_TRAFFIC_FACTS.map((item) => ({
    text: item.text,
    type: item.type,
  }));
}
