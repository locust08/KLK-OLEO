"use client";

import { useId, useState } from "react";
import { groupMapPoints, mapRegions, type MapPoint, type MapRegion } from "@/lib/maps/model";
import styles from "./WorldMap.module.css";

const asset = (name: string) => `/images/about/global-presence/${name}`;
const anchors: Record<MapRegion, { x: number; y: number }> = {
  "South East Asia": { x: 76.89, y: 61.50 },
  Asia: { x: 73.71, y: 42.55 },
  Europe: { x: 49.72, y: 33.40 },
  Americas: { x: 17.87, y: 38.05 },
};
const legend = [
  { label: "Corporate Headquarters", icons: ["headquarters.svg"] },
  { label: "International Sales Office", icons: ["sales-office.svg"] },
  { label: "Sales & Marketing Network", icons: ["sales-network.svg"] },
  { label: "R&D Centers", icons: ["research.svg"] },
  { label: "Operating Facilities", icons: ["operating.svg", "operating-storage.svg"] },
];
function locationIcon(label: string, country: string) {
  if (label.includes("Stolthaven")) return "storage.svg";
  if (label.includes("Davos")) return "facility-singapore.svg";
  if (country === "Indonesia") return "facility-indonesia.svg";
  if (label.includes("India") || label.includes("Shanghai") || label.includes("Americas")) return "sales-office.svg";
  return "facility.svg";
}

export function WorldMap({ points }: { points: MapPoint[] }) {
  const id = useId();
  const [active, setActive] = useState<MapRegion | null>(points[0]?.region ?? null);
  const regions = mapRegions.filter(region => points.some(point => point.region === region));
  return <div className={styles.layout}>
    <div className={styles.mapColumn}>
      <div className={styles.map} aria-label="KLK OLEO location map">
        <div className={styles.canvas}>
          <img src={asset("map-texture.png")} width="2518" height="1246" alt="World map of KLK OLEO global presence" className={styles.outline} />
          <img src={asset("network.svg")} alt="" className={styles.network} />
          {regions.map(region => <button key={region} type="button"
            className={`${styles.pin} ${active === region ? styles.selected : ""}`}
            style={{ left: `${anchors[region].x}%`, top: `${anchors[region].y}%` }}
            aria-label={`Show ${region} locations`} aria-pressed={active === region}
            aria-controls={`${id}-${mapRegions.indexOf(region)}`}
            onClick={() => setActive(region)}>
            <img src={asset(region === "South East Asia" ? "dot-headquarters.svg" : "dot-region.svg")} alt="" />
          </button>)}
        </div>
      </div>
      <ul className={styles.legend} aria-label="Map legend">
        {legend.map(item => <li key={item.label}><span className={styles.legendIcons}>{item.icons.map(icon => <img key={icon} src={asset(icon)} alt="" />)}</span><span>{item.label}</span></li>)}
      </ul>
    </div>
    <div className={styles.regions} aria-label="KLK OLEO global regions">
      {regions.map(region => <section key={region} className={`${styles.region} ${active === region ? styles.open : ""}`}>
        <h3><button type="button" aria-expanded={active === region} aria-controls={`${id}-${mapRegions.indexOf(region)}`} onClick={() => setActive(active === region ? null : region)}>
          {region}<span aria-hidden="true" className={styles.arrow}>{active === region ? "↑" : "↓"}</span>
        </button></h3>
        <div id={`${id}-${mapRegions.indexOf(region)}`} hidden={active !== region} className={styles.body}>
          {groupMapPoints(points, region).map(([country, locations]) => <div key={country} className={styles.country}>
            <h4>{country === "Malaysia" && <img src={asset("headquarters-light.svg")} alt="" />}{(country === "Malaysia" || country === "Singapore") && <img src={asset("research.svg")} alt="" />}{country}</h4>
            <ul>{locations.map(point => <li key={point.id}>
              <img src={asset(locationIcon(point.label, country))} alt="" />
              <div>{point.url ? <a href={point.url}>{point.label}</a> : point.label}{point.description && <p>{point.description}</p>}</div>
            </li>)}</ul>
          </div>)}
        </div>
      </section>)}
      {!points.length && <p>Location information is currently unavailable.</p>}
    </div>
  </div>;
}