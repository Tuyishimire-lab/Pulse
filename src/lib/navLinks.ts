import { getCurrentWeekSlug } from './weekSlug';

/**
 * Single source of truth for all site navigation links.
 *
 * Both NavHeader (top bar) and Footer (Platform column) import from here so
 * adding, removing, or reordering a link only requires changing this file.
 *
 * Order matters for the NavHeader tab bar; Footer can subset or reorder as needed.
 */
export interface NavLink {
  href: string;
  label: string;
}

/**
 * Primary platform nav - shown in the NavHeader tab bar and the Footer
 * "Platform" column. Keep this list in the same order you want the tabs.
 */
export function getPlatformLinks(): NavLink[] {
  return [
    { href: '/',                               label: 'Live Dashboard' },
    { href: '/top-sites',                     label: 'Top Sites' },
    { href: '/trending',                       label: 'Trending' },
    { href: '/compare',                        label: 'Compare' },
    { href: '/category/ai',                    label: 'Categories' },
    { href: '/map',                            label: 'Traffic Map' },
    { href: '/report/' + getCurrentWeekSlug(), label: 'Weekly Report' },
  ];
}

/**
 * Resource / legal links - shown in the Footer "Resources" column.
 * Also added as secondary links in the NavHeader mobile menu.
 */
export const RESOURCE_LINKS: NavLink[] = [
  { href: '/methodology', label: 'Data & Methodology' },
  { href: '/about',       label: 'About Pulse' },
  { href: '/privacy',     label: 'Privacy Policy' },
  { href: '/terms',       label: 'Terms of Service' },
];
