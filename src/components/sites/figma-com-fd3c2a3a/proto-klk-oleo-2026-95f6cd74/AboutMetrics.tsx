import Image from "next/image";

const imageRoot =
  "/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/images";

const awards = [
  {
    image: `${imageRoot}/The-Edge-Billion-Ringgit-Club-2023-Logo.png`,
    label: "The Edge Billion Ringgit Club",
  },
  {
    image: `${imageRoot}/Fortune-500-Lime.png`,
    label: "FORTUNE Southeast Asia 500 (Ranked 69th)",
  },
  {
    image: `${imageRoot}/bestmanagedcompanies2025.png`,
    label: "Malaysia’s Best Managed Companies 2025",
  },
] as const;

const metrics = [
  {
    image: `${imageRoot}/solutions-oleo-basics.jpg`,
    number: "30+",
    label: "Years Of Excellence In Oleochemicals",
  },
  {
    image: `${imageRoot}/AboutUs-01.png`,
    number: "15+",
    label: "Operating Facilities Worldwide",
  },
  {
    image: `${imageRoot}/slide01-03.jpg`,
    number: "3.5",
    label: "Million Metric Tonnes Manufacturing Capacity",
  },
  {
    image: `${imageRoot}/About-KLK-OLEO-MKLK-scaled.jpg`,
    number: "4,200+",
    label: "Global Workforce",
  },
  {
    image: `${imageRoot}/ESG-Palm-Fruit-01.png`,
    kicker: "Since",
    number: "2014",
    label: "RSPO Supply Chain Certified (SCC)",
  },
  {
    image: `${imageRoot}/2026-01-Global-Presence_English-1.jpg`,
    kicker: "Supplying To",
    number: "120+",
    label: "Countries",
  },
] as const;

export function AboutMetrics() {
  return (
    <>
      <section
        id="about-us"
        aria-labelledby="about-klk-heading"
        className="bg-white px-10 py-[72px] max-md:px-5 max-md:py-12"
      >
        <div className="mx-auto grid max-w-[1360px] grid-cols-2 gap-[60px] max-md:grid-cols-1 max-md:gap-9">
          <div className="min-w-0">
            <p className="mb-3 text-[13px] font-semibold text-[#202a25]">
              About KLK OLEO
            </p>
            <h2
              id="about-klk-heading"
              className="max-w-[600px] text-[37px] leading-[1.18] font-semibold tracking-[-0.025em] text-[#006b3f] max-sm:text-[31px]"
            >
              Global Oleochemical Producer For More Than 30 Years
            </h2>

            <div className="mt-14 flex gap-7 overflow-x-auto pb-3 max-md:-mx-5 max-md:px-5">
              {awards.map((award) => (
                <article key={award.label} className="w-[200px] shrink-0">
                  <div className="relative h-[145px] overflow-hidden rounded-[10px] border border-[#c6ddd1] bg-white">
                    <Image
                      src={award.image}
                      alt=""
                      fill
                      sizes="200px"
                      className="object-contain p-4"
                    />
                  </div>
                  <p className="mt-3 text-center text-[15px] leading-[1.25] font-semibold text-[#202a25]">
                    {award.label}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="pt-1 text-[14px] leading-[1.8] text-[#6e746f]">
            <p>
              KLK OLEO is a global oleochemical producer, which has integrated
              complexes located strategically in Malaysia, Indonesia, China,
              and Europe. KLK OLEO offers an array of high quality, innovative
              and sustainable products and solutions. We are the manufacturing
              division of our parent company, {" "}
              <strong className="font-semibold text-[#16824d]">
                Kuala Lumpur Kepong Berhad
              </strong>
              , a leading international plantations group listed on Main Market
              of Bursa Malaysia Securities Berhad with a market capitalisation
              of approximately RM22.94 (USD5.45) billion at the end of September
              2025.
            </p>
            <p className="mt-6">
              KLK OLEO’s production portfolio ranges from basic oleochemical
              products, such as Fatty Acids, Glycerine, Fatty Alcohols and Fatty
              Esters, all the way down the spectrum to specialties, such as
              Methyl Ester Sulphonates (MES), Surfactants and Phytonutrients.
              Our products are used in diverse end-use applications, including
              beauty &amp; personal care, home care, industries &amp;
              institutional (I&amp;I) cleaning, life science, food &amp;
              nutrition, lubricants, polymers and more.
            </p>
            <a
              href="#solutions"
              className="mt-8 inline-flex items-center gap-4 border-b border-[#078f96] pb-2 text-[12px] font-semibold tracking-[0.12em] text-[#202a25] uppercase transition-colors duration-200 hover:text-[#006b3f] motion-reduce:transition-none"
            >
              Learn More
              <span aria-hidden="true" className="text-xl leading-none text-[#7bbf2a]">
                →
              </span>
            </a>
          </div>
        </div>
      </section>

      <section
        aria-label="KLK OLEO in numbers"
        className="bg-[#e8f3ed] px-10 pt-16 pb-[72px] max-md:px-5 max-md:py-12"
      >
        <div className="mx-auto grid max-w-[1360px] grid-cols-3 gap-6 max-lg:grid-cols-2 max-md:grid-cols-1">
          {metrics.map((metric) => (
            <article
              key={metric.number}
              className="group relative aspect-[1.48] min-h-[250px] overflow-hidden rounded-[11px] bg-[#174c36]"
            >
              <Image
                src={metric.image}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transition-none"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#003f27] via-[#003f27]/45 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 px-5 pb-7 text-white max-sm:gap-3 max-sm:px-4 max-sm:pb-5">
                <div className="shrink-0">
                  {"kicker" in metric && metric.kicker ? (
                    <p className="mb-[-3px] text-[13px] leading-none font-semibold">
                      {metric.kicker}
                    </p>
                  ) : null}
                  <p className="text-[52px] leading-[0.9] font-semibold tracking-[-0.04em] max-sm:text-[46px]">
                    {metric.number}
                  </p>
                </div>
                <p className="max-w-[270px] pb-0.5 text-[25px] leading-[1.08] font-semibold max-sm:text-[21px]">
                  {metric.label}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
