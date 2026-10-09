"use client";

import { useId, useState } from "react";
import { groupMapPoints, mapRegions, projectPoint, type MapPoint, type MapRegion } from "@/lib/maps/model";
import styles from "./WorldMap.module.css";

export function WorldMap({ points }: { points: MapPoint[] }) {
  const id = useId();
  const [active, setActive] = useState<MapRegion | null>(points[0]?.region ?? null);
  const [hovered, setHovered] = useState<MapRegion | null>(null);
  const pins = [...new Map(points.map(point => [`${point.region}:${point.latitude}:${point.longitude}`, point])).values()];
  return <div className={styles.layout}>
    <div className={styles.map} data-reveal="up" tabIndex={0} aria-label="Scrollable KLK OLEO location map">
      <div className={styles.canvas}>
      {/* The image is only an outline; every location comes from shared CMS data. */}
      <img src="/images/about/world-map-light.png" width="1781" height="883" alt="World map" className={styles.outline} />
      <svg viewBox="0 0 1000 495.79" className={styles.pins} aria-label="Select a location to display its region">
        {pins.map(point => {
          const position = projectPoint(point.latitude, point.longitude);
          const selected = active === point.region;
          const anchor = pins.find(pin => pin.region === point.region)?.id === point.id;
          return <g key={point.id} transform={`translate(${(position.x * 10).toFixed(2)} ${(position.y * 4.9579).toFixed(2)})`} className={`${styles.pin} ${selected ? styles.selected : ""} ${hovered === point.region ? styles.hovered : ""}`}>
            {anchor && <circle r="17" className={styles.ring} />}
            <circle r={anchor ? 7 : 3} className={styles.dot} />
            <circle r="22" fill="transparent" role="button" tabIndex={0} aria-label={`${point.country}: show ${point.region}`} aria-pressed={active === point.region}
              onMouseEnter={() => setHovered(point.region)} onMouseLeave={() => setHovered(null)} onFocus={() => setHovered(point.region)} onBlur={() => setHovered(null)}
              onClick={() => setActive(point.region)} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setActive(point.region); } }}>
              <title>{point.country}</title>
            </circle>
          </g>;
        })}
      </svg>
      </div>
    </div>
    <div className={styles.regions} data-reveal="up" aria-label="KLK OLEO global regions">
      {mapRegions.filter(region => points.some(point => point.region === region)).map(region => <section key={region} className={`${styles.region} ${active === region ? styles.open : ""}`}>
        <h3><button type="button" aria-expanded={active === region} aria-controls={`${id}-${mapRegions.indexOf(region)}`} onFocus={() => setHovered(null)} onClick={() => setActive(active === region ? null : region)}>
          {region}<span aria-hidden="true" className={styles.arrow}>{active === region ? "↑" : "↓"}</span>
        </button></h3>
        <div id={`${id}-${mapRegions.indexOf(region)}`} hidden={active !== region} className={styles.body}>
          {groupMapPoints(points, region).map(([country, locations]) => <div key={country} className={styles.country}>
            <h4>{country}</h4><ul>{locations.map(point => <li key={point.id}>
              {point.url ? <a href={point.url}>{point.label}</a> : point.label}
              {point.description && <p>{point.description}</p>}
            </li>)}</ul>
          </div>)}
        </div>
      </section>)}
      {!points.length && <p>Location information is currently unavailable.</p>}
    </div>
  </div>;
}
