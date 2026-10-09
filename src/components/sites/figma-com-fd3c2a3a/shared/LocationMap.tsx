"use client";

import Image from "next/image";
import styles from "./LocationMap.module.css";

const locations = [
  { country: "Singapore", region: "South East Asia", x: 760.61, y: 321.75 },
  { country: "Indonesia", region: "South East Asia", x: 754.03, y: 320.84 },
  { country: "India", region: "Asia", x: 691.56, y: 267.57 },
  { country: "Switzerland", region: "Europe", x: 495.81, y: 183.31 },
  { country: "Netherlands", region: "Europe", x: 486.33, y: 167.49 },
  { country: "Belgium", region: "Europe", x: 487.64, y: 171.71 },
  { country: "Italy", region: "Europe", x: 497.75, y: 189.92 },
  { country: "Malaysia", region: "South East Asia", x: 754.17, y: 316.90, major: true },
  { country: "China", region: "Asia", x: 808.61, y: 235.75, major: true },
  { country: "Germany", region: "Europe", x: 489.56, y: 167.19, major: true },
  { country: "United States", region: "Americas", x: 198.39, y: 208.90, major: true },
] as const;

export function LocationMap({ selectedRegion, onSelectRegion }: { selectedRegion: string | null; onSelectRegion: (region: string) => void }) {
  return (
    <div className={styles.map} tabIndex={0} role="region" aria-label="Scrollable KLK OLEO location map">
      <div className={styles.canvas}>
        <Image src="/images/maps/world-map-light.png" width={1781} height={883} alt="World map" sizes="(max-width: 900px) 100vw, 70vw" className={styles.outline} />
        <svg viewBox="0 0 1000 495.79" className={styles.pins} aria-label="Select a location to display its region">
          {locations.map(location => {
            const major = "major" in location;
            const selected = selectedRegion === location.region;
            return (
              <g key={location.country} transform={`translate(${location.x} ${location.y})`} className={`${styles.pin} ${selected ? styles.selected : ""}`}>
                {major && <circle r={17} className={styles.ring} aria-hidden="true" />}
                <circle r={major ? 7 : 3} className={styles.dot} aria-hidden="true" />
                <circle r={major ? 22 : 5} fill="transparent" role="button" tabIndex={0} aria-label={`${location.country}: show ${location.region}`} aria-pressed={selected} onClick={() => onSelectRegion(location.region)} onKeyDown={event => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault(); onSelectRegion(location.region);
                  }
                }}>
                  <title>{location.country}</title>
                </circle>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
