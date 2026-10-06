import Image from "next/image";
import { GlobalPresence } from "./PresenceNewsEsg";
import { AboutPrototypeValues } from "./AboutPrototypeValues";
import { prototypeImageRoot } from "../shared/PrototypePageShell";

const missions = [
  ["Sustainability", "Commit to deliver positive impact to climate and people in every possible way."],
  ["Quality", "Consistent delivery of competitive high quality products and solutions that are focused on meeting and exceeding customer expectations."],
  ["Operational Excellence", "Value addition through commitment to the highest standards of operational excellence driven by a culture of continuous improvement and innovation."],
  ["People", "Cultivating a team that values and develops people of all backgrounds through empowerment and recognition."],
  ["Ethical Practices", "Values built on the legacy of ethical practices embraced by its founder, committed to operate responsibly and with integrity."],
];

export function AboutPrototype() {
  return (
    <>
      <section id="background" className="klk-section scroll-mt-28 overflow-hidden bg-white">
        <div className="klk-container">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <figure className="relative aspect-[1.58] overflow-hidden rounded-md bg-klk-surface shadow-klk">
              <Image src={`${prototypeImageRoot}/2025-RISE-Thumbnail-01.png`} alt="KLK OLEO palm leaf corporate visual" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            </figure>
            <div className="klk-body pt-2 text-klk-text-secondary">
              <p className="klk-overline mb-3 text-klk-primary">Our Background</p>
              <h2 className="klk-h2 mb-6 max-w-[40rem] text-klk-primary">Delivering Oleochemical Excellence Worldwide</h2>
              <p className="mb-6">KLK OLEO is one of the world’s leading oleochemical producers committed to delivering excellence in the global marketplace.</p>
              <p className="mb-6">Our integrated oleochemicals complexes located in key sourcing and supply markets (Malaysia, Indonesia, China and Europe) produce a wide range of high quality sustainable oleochemical products from natural renewable raw materials.</p>
              <p>KLK OLEO is the oleochemicals manufacturing division of <strong className="font-semibold text-klk-primary">Kuala Lumpur Kepong Berhad (KLK)</strong>, a leading international plantations group listed on the Main Market of Bursa Malaysia Securities Berhad. Strategically integrated with our upstream plantations parent, KLK OLEO can extract synergies and focus on developing sustainable solutions and reliable supply for our customers. At KLK OLEO, sustainability is integral to our business. We believe that everything we do impacts the entire ecosystem, going beyond just people. Together with our customers and partners, we have the power to create more sustainable products and solutions.</p>
            </div>
          </div>
          <div className="relative mt-14 grid items-center gap-10 overflow-hidden rounded-md bg-klk-surface-subtle lg:min-h-[32rem] lg:grid-cols-2 lg:gap-0">
            <div className="klk-body relative z-10 space-y-6 p-6 text-klk-text-secondary sm:p-10 lg:p-12">
              <p>KLK OLEO’s production portfolio ranges from basic oleochemical products, such as Fatty Acids, Glycerine, Fatty Alcohols and Fatty Esters, all the way down the spectrum to specialties, such as Methyl Ester Sulphonates (MES), Surfactants and Phytonutrients. Our products are used in diverse end-use applications, including beauty &amp; personal care, home care, industries &amp; institutional (I&amp;I) cleaning, life science, food &amp; nutrition, lubricants, polymers and many more.</p>
              <p>We strongly believe in innovation and have a strong focus on research and development. Creating new downstream businesses is central to our strategy of maximising the integrated value chain. KLK OLEO’s approach combines research and industry focus to develop innovative and sustainable products for customers and partners, ensuring performance, quality, and security of supply.</p>
              <p>We are proud to be a part of the global oleochemical industry. By focusing on sustainability, quality, operation excellence, people and ethical practices, our vision is growing to be the most trusted global partner in oleo-based products and solutions, thus enriching lives in a sustainable manner every day.</p>
            </div>
            <div className="relative aspect-[1.42] w-full self-stretch lg:aspect-auto lg:min-h-[32rem]">
              <Image src={`${prototypeImageRoot}/About-KLK-OLEO-MKLK-scaled.jpg`} alt="KLK OLEO headquarters" fill sizes="(max-width: 1023px) 100vw, 67vw" className="object-cover object-right-bottom" />
            </div>
          </div>
        </div>
      </section>
      <section id="vision-mission" className="grid scroll-mt-28 lg:grid-cols-2">
        <div className="relative min-h-[32.5rem] overflow-hidden bg-klk-surface px-5 py-12 sm:px-10 lg:px-12 lg:py-16">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 bottom-[40vw] overflow-hidden lg:bottom-[20vw]">
            <Image src={`${prototypeImageRoot}/about-vision-mission.jpg`} alt="" width={1767} height={890} unoptimized className="absolute top-0 -left-[21.428571%] h-[285.714286%] w-[142.857143%] max-w-none" />
          </div>
          <Image src={`${prototypeImageRoot}/about-vision-mission.jpg`} alt="KLK OLEO Vision and Mission at the production facility" width={1767} height={890} unoptimized className="absolute bottom-0 left-0 h-auto w-full max-w-none lg:w-[115%] [mask-image:linear-gradient(to_bottom,transparent,black_18%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/10 to-transparent" />
          <div className="relative w-full">
            <h2 className="klk-h2 mb-4 text-klk-primary">Our Vision</h2>
            <p className="klk-h5 text-klk-text">Growing To Be The Most Trusted Global Partner In Oleo-Based Products And Solutions, Thus Enriching Lives In A Sustainable Manner Every Day.</p>
          </div>
        </div>
        <div className="bg-gradient-to-b from-klk-primary to-klk-primary-hover px-5 py-12 sm:px-10 lg:px-12 lg:py-16">
          <h2 className="klk-h2 mb-6 text-white">Our Mission</h2>
          <div className="space-y-3">
            {missions.map(([title, body]) => (
              <article key={title} className="rounded-sm bg-klk-surface px-6 py-5">
                <h3 className="klk-h6 mb-2 text-klk-primary">{title}</h3>
                <p className="klk-body-small text-klk-text">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <AboutPrototypeValues />
      <GlobalPresence heading="Impacting Lives Worldwide" />
    </>
  );
}
