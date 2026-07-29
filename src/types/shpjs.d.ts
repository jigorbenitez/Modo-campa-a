declare module "shpjs" {
  interface ShapefileFeatureCollection {
    type: "FeatureCollection";
    features: Array<{
      id?: string | number;
      geometry: Record<string, unknown> | null;
      properties: Record<string, unknown> | null;
    }>;
  }

  export default function parse(
    content: ArrayBuffer | Uint8Array,
  ): Promise<ShapefileFeatureCollection | ShapefileFeatureCollection[]>;
}
