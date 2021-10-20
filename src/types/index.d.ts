export interface TileType {
  name: string;
  key?: number;
  width: number;
  icon?: JSX.Element[];
  tile?: any;
  row?: number;
  col?: number;
  color?: string;
  type: string;
}