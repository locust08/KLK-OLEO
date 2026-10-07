"use client";

import Image from "next/image";
import { useState } from "react";
import { FaAnglesRight, FaFilePdf } from "react-icons/fa6";
import type { ContactFormViewModel, ResourceViewModel } from "@/lib/cms/view-models";
import { ResourceRequestForm } from "./ResourceRequestForm";
import styles from "./Resources.module.css";

export function ResourceListing({ resources, form }: {
  resources: ResourceViewModel[]; form: ContactFormViewModel | null;
}) {
  const [requested, setRequested] = useState<ResourceViewModel | null>(null);
  return <section className={`resource-section ${styles.section}`} aria-label="Available resources">
    <div className="resource-grid">
      {resources.map(resource => <article className="resource-card" key={resource.id}>
        <div className="resource-card__preview">
          {resource.imageUrl ? <Image src={resource.imageUrl} fill unoptimized sizes="(max-width: 767px) 100vw, (max-width: 900px) 50vw, (max-width: 1199px) 33vw, 25vw" alt={resource.imageAlt || `${resource.title} document cover`} /> : <div className="resource-card__no-preview"><FaFilePdf aria-hidden="true" /><span>Document preview unavailable</span></div>}
        </div>
        <div className="resource-card__body"><h2>{resource.title}</h2>
          <button type="button" className={`resource-card__action ${styles.action}`} onClick={() => setRequested(resource)} aria-label={`Download ${resource.title}`} aria-haspopup="dialog"><span>Download</span><FaAnglesRight aria-hidden="true" /></button>
        </div>
      </article>)}
      {!resources.length && <div className={`catalog-empty ${styles.empty}`}><h2>Resources are being prepared.</h2><p>Please contact our team for the latest approved materials.</p></div>}
    </div>
    {requested && <ResourceRequestForm key={requested.id} resource={requested} form={form} onClose={() => setRequested(null)} />}
  </section>;
}