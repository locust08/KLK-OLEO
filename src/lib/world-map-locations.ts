/** Serializable region data; Payload can supply this shape without changing the renderer. */
export type WorldMapLocation = {
  id: string;
  region: string;
  longitude: number;
  latitude: number;
  headquarters?: boolean;
};

// Geographic region anchors from the corrected Agrochemical map, not facility addresses.
export const worldMapLocations: WorldMapLocation[] = [
  { id: "south-east-asia", region: "South East Asia", longitude: 106.804, latitude: 7.407370709668522, headquarters: true },
  { id: "asia", region: "Asia", longitude: 95.356, latitude: 39.16800369389987 },
  { id: "europe", region: "Europe", longitude: 8.992, latitude: 52.2598367739813 },
  { id: "americas", region: "Americas", longitude: -105.668, latitude: 45.829445640747515 },
];
