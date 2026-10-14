"use client";

import Image from "next/image";
import { useId } from "react";
import { geoProjection } from "d3-geo";
import { ComposableMap, Marker } from "react-simple-maps/core";
import { worldMapLocations, type WorldMapLocation } from "@/lib/world-map-locations";
import styles from "./LocationMap.module.css";

const assetRoot = "/images/maps/global-presence";
const mapWidth = 1000;
const mapHeight = mapWidth * 1246 / 2518;
// The reference artwork uses this Miller cylindrical projection, rotated 10° east.
const millerY = (latitude: number) => 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * latitude));
const north = millerY(85 * Math.PI / 180);
const scale = mapHeight / (north - millerY(-55 * Math.PI / 180));
const horizontalScale = mapWidth / (2 * Math.PI) / scale;
const artworkProjection = geoProjection((longitude, latitude) => [longitude * horizontalScale, millerY(latitude)])
  .rotate([-10, 0])
  .scale(scale)
  .translate([mapWidth / 2, north * scale]);
// Normalize insignificant engine-specific floating point differences for SSR hydration.
const mapProjection = Object.assign((coordinates: [number, number]): [number, number] | null => {
  const point = artworkProjection(coordinates);
  return point ? [Math.round(point[0] * 1e8) / 1e8, Math.round(point[1] * 1e8) / 1e8] : null;
}, artworkProjection);
const legend = [
  { label: "Corporate Headquarters", icons: ["headquarters"] },
  { label: "International Sales Office", icons: ["sales-office"] },
  { label: "Sales & Marketing Network", icons: ["sales-network"] },
  { label: "R&D Centers", icons: ["research"] },
  { label: "Operating Facilities", icons: ["operating", "operating-storage"] },
];

export function LocationMap({ selectedRegion, onSelectRegion, locations = worldMapLocations }: { selectedRegion: string | null; onSelectRegion: (region: string) => void; locations?: WorldMapLocation[] }) {
  const maskId = `world-map-mask-${useId().replace(/:/g, "")}`;
  return (
    <div className={styles.column}>
      <div className={styles.map} role="region" aria-label="KLK OLEO location map">
        <div className={styles.canvas}>
          <ComposableMap width={mapWidth} height={mapHeight} projection={mapProjection} className={styles.pins} aria-label="World map of KLK OLEO global presence">
            <defs>
              <mask id={maskId} maskUnits="userSpaceOnUse" x={0} y={0} width={mapWidth} height={mapHeight}>
                <image href={`${assetRoot}/map-mask.png`} width={mapWidth} height={mapHeight} />
              </mask>
            </defs>
            <image href={`${assetRoot}/map-texture.png`} width={mapWidth} height={mapHeight} preserveAspectRatio="xMidYMid slice" mask={`url(#${maskId})`} />
            <image href={`${assetRoot}/network.svg`} x={188.25} y={mapHeight * 0.2537} width={771.25} height={mapHeight * 0.64064} />
            {locations.map(location => (
              <Marker key={location.id} coordinates={[location.longitude, location.latitude]}>
                <image href={`${assetRoot}/${location.headquarters ? "dot-headquarters" : "dot-region"}.svg`} x={-16} y={-16} width={32} height={32} className={`${styles.pin} ${selectedRegion === location.region ? styles.selected : ""}`} />
                <circle r={22} fill="transparent" role="button" tabIndex={0} aria-label={`Show ${location.region} locations`} aria-pressed={selectedRegion === location.region} onClick={() => onSelectRegion(location.region)} onKeyDown={event => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectRegion(location.region);
                  }
                }} />
              </Marker>
            ))}
          </ComposableMap>
        </div>
      </div>
      <ul className={styles.legend} aria-label="Map legend">
        {legend.map(item => <li key={item.label}><span className={styles.legendIcons}>{item.icons.map(icon => <Image key={icon} src={`${assetRoot}/${icon}.svg`} width={25} height={25} alt="" />)}</span><span>{item.label}</span></li>)}
      </ul>
    </div>
  );
}
