import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import { PrototypePageBanner, prototypeImageRoot } from "../shared/PrototypePageShell";

type Office = { company: string; address: string[]; phone?: string; email?: string };

function OfficeDetails({ office }: { office: Office }) {
  return (
    <div className="flex flex-1 flex-col p-6">
      <h3 className="klk-h6 mb-3 text-klk-text">{office.company}</h3>
      <div className="klk-body-small mb-4 flex items-start gap-3 text-klk-text-secondary">
        <MapPin aria-hidden="true" className="mt-1 size-4 shrink-0 text-klk-lime" />
        <address className="not-italic">{office.address.map((line) => <span className="block" key={line}>{line}</span>)}</address>
      </div>
      {office.phone && <a href={`tel:${office.phone.replace("(0)", "").replace(/[^+\d]/g, "")}`} className="klk-body-small mb-4 flex items-center gap-3 text-klk-text-secondary hover:text-klk-primary focus-visible:outline-2 focus-visible:outline-klk-brand-blue"><Phone aria-hidden="true" className="size-4 text-klk-lime" />{office.phone}</a>}
      {office.email && <a href={`mailto:${office.email}`} className="klk-button mt-auto flex min-h-11 items-center justify-center gap-3 rounded-sm bg-klk-primary px-3 py-2 text-center text-white hover:bg-klk-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-klk-brand-blue"><span className="break-all">{office.email}</span><Mail aria-hidden="true" className="size-4 shrink-0" /></a>}
    </div>
  );
}
function OfficeCard({ title, flag, country, offices }: { title: string; flag: string; country: string; offices: Office[] }) {
  return (
    <section className="flex flex-col overflow-hidden rounded-md border border-klk-border bg-white shadow-klk">
      <div className="flex min-h-16 items-center justify-between gap-4 border-b border-klk-border px-5 py-3">
        <h2 className="klk-h6 text-klk-primary">{title}</h2><Image src={`${prototypeImageRoot}/prototype-contact-flag-${flag}.svg`} alt={country} width={66} height={44} className="h-10 w-[3.75rem] rounded-xs object-cover" />
      </div>
      <div className={`grid flex-1 divide-klk-border ${offices.length > 1 ? "divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0" : ""}`}>{offices.map((office) => <OfficeDetails key={office.company} office={office} />)}</div>
    </section>
  );
}

export function ContactPrototype() {
  return (
    <>
      <PrototypePageBanner title="Contact Us" image={`${prototypeImageRoot}/prototype-contact-meeting.jpg`} breadcrumbs={[{ label: "Contact Us" }]} />
      <section className="klk-section bg-white">
        <div className="klk-container">
        <h2 className="klk-h2 text-center text-klk-primary">Our Global Offices</h2>
        <p className="klk-body mb-10 mt-4 text-center text-klk-text-secondary">Find the nearest KLK OLEO representative or sales office to assist with your regional requirements.</p>
        <div className="relative mb-6 overflow-hidden rounded-md bg-klk-surface-subtle p-5 md:p-9">
          <Image src={`${prototypeImageRoot}/About-KLK-OLEO-MKLK-scaled.jpg`} alt="KLK OLEO corporate headquarters in Malaysia" fill sizes="100vw" className="object-cover object-right" />
          <div className="relative max-w-[47.5rem] rounded-md bg-white shadow-klk lg:w-1/2">
            <div className="flex items-center justify-between gap-4 border-b border-klk-border px-5 py-4"><h3 className="klk-h6 text-klk-primary">Corporate Headquarters</h3><Image src={`${prototypeImageRoot}/prototype-contact-flag-malaysia.svg`} alt="Malaysia" width={66} height={44} className="h-10 w-[3.75rem] rounded-xs object-cover" /></div>
            <OfficeDetails office={{ company: "KLK OLEO", address: ["Level 8, Menara KLK, No.1,", "Jalan PJU 7/6, Mutiara Damansara,", "47810 Petaling Jaya, Selangor, Malaysia."] }} />
            <div className="px-5 pb-5">
              <p className="klk-body-small mb-4 flex items-center gap-3 text-klk-text-secondary"><Mail aria-hidden="true" className="size-4 text-klk-lime" />General Enquiry</p>
              <button disabled type="button" aria-describedby="product-enquiry-unavailable" className="klk-button flex min-h-11 w-full items-center justify-center gap-3 rounded-sm bg-klk-primary px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60">PRODUCT ENQUIRY <Mail aria-hidden="true" className="size-4" /></button>
              <span id="product-enquiry-unavailable" className="sr-only">Product enquiry is not available in this prototype. Contact a regional sales office using the email links below.</span>
            </div>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <OfficeCard title="China Sales Office" flag="china" country="China" offices={[{ company: "KLK OLEO (Shanghai) Co. Ltd.", address: ["T7, Room 501, No. 1199,", "Zhen Nan Road, Putuo District,", "Shanghai City, PRC. Post Code: 200331"], phone: "+86 21 3636 1130", email: "info.china@klkoleo.com" }]} />
          <OfficeCard title="Europe Sales Office" flag="europe" country="Europe" offices={[{ company: "KLK EMMERICH GmbH", address: ["Steintor 9,", "46446 Emmerich am Rhein,", "Germany."], phone: "+49 (0) 2822 72 0", email: "info.europe@klkoleo.com" }, { company: "Kolb Distribution Ltd.", address: ["Maienbrunnenstrasse 1,", "8908 Hedingen,", "Switzerland."], phone: "+41 44 762 46 46", email: "info.europe@klkoleo.com" }]} />
          <OfficeCard title="Americas Sales Office" flag="americas" country="United States" offices={[{ company: "KLK OLEO Americas Inc.", address: ["7600 Jericho Turnpike,", "Woodbury, NY 11797,", "United States."], phone: "+1 516 584 6268", email: "info.americas@klkoleo.com" }]} />
          <OfficeCard title="India Sales Office" flag="india" country="India" offices={[{ company: "KLK OLEO India Pvt. Ltd.", address: ["Office No. 32A, Khatau Building,", "8/10, A D Modi Marg, Fort,", "Mumbai 400023, India."], phone: "+91 98 1997 8060", email: "info.india@klkoleo.com" }]} />
        </div>
        </div>
      </section>
    </>
  );
}

