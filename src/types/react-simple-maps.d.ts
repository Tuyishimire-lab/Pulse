declare module 'react-simple-maps' {
  import { ComponentType, ReactNode, MouseEvent } from 'react';

  interface ComposableMapProps {
    projection?: string;
    projectionConfig?: Record<string, unknown>;
    width?: number;
    height?: number;
    style?: React.CSSProperties;
    className?: string;
    children?: ReactNode;
  }

  interface ZoomableGroupProps {
    center?: [number, number];
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    translateExtent?: [[number, number], [number, number]];
    onMoveStart?: (pos: { coordinates: [number, number]; zoom: number }) => void;
    onMove?: (pos: { coordinates: [number, number]; zoom: number }) => void;
    onMoveEnd?: (pos: { coordinates: [number, number]; zoom: number }) => void;
    children?: ReactNode;
  }

  interface GeographiesProps {
    geography: string | object;
    children: (args: { geographies: Geography[] }) => ReactNode;
    parseGeographies?: (features: unknown[]) => unknown[];
  }

  interface Geography {
    rsmKey: string;
    id?: string | number;
    type: string;
    properties: Record<string, unknown>;
    geometry: object;
  }

  interface GeographyProps {
    geography: Geography;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
    onClick?: (event: MouseEvent<SVGPathElement>, geography: Geography) => void;
    onMouseEnter?: (event: MouseEvent<SVGPathElement>, geography: Geography) => void;
    onMouseLeave?: (event: MouseEvent<SVGPathElement>, geography: Geography) => void;
    className?: string;
  }

  export const ComposableMap: ComponentType<ComposableMapProps>;
  export const ZoomableGroup: ComponentType<ZoomableGroupProps>;
  export const Geographies: ComponentType<GeographiesProps>;
  export const Geography: ComponentType<GeographyProps>;
  export const Marker: ComponentType<{ coordinates: [number, number]; children?: ReactNode }>;
  export const Line: ComponentType<Record<string, unknown>>;
  export const Graticule: ComponentType<{ stroke?: string; strokeWidth?: number }>;
  export const Sphere: ComponentType<{ fill?: string; stroke?: string }>;
  export function useZoomPan(config?: object): object;
}
