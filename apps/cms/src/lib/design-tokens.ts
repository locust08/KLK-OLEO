/**
 * Reference-derived values shared by components and visual regression tests.
 * CSS remains the source for presentation; this module avoids duplicated magic numbers.
 */
export const designTokens = {
  colors: {
    brandGreen: "#016836",
    leafGreen: "#79B82C",
    heading: "#1D1D1D",
    body: "#333333",
    secondaryText: "#33373D",
    white: "#FFFFFF",
    widgetMagenta: "#CC3366",
    widgetGold: "#A99767",
  },
  layout: {
    contentMax: 800,
    wideMax: 1200,
    desktopSectionGutter: 50,
    desktopContentOffset: 60,
    mobileSectionGutter: 15,
    mobileHeroOffset: 25,
  },
  type: {
    eyebrowDesktop: 22,
    eyebrowMobile: 18,
    titleDesktop: 48,
    titleMobile: 28,
    featureDesktop: 36,
    featureMobile: 24,
  },
} as const;
