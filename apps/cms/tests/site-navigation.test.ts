import assert from "node:assert/strict";
import test from "node:test";
import { SiteProvider } from "../src/components/layout/SiteContext";
import type { SiteChromeViewModel } from "../src/lib/cms/view-models";

const site: SiteChromeViewModel = {
  name: "KLK OLEO Agrochemicals", brandName: "KLK OLEO | Agrochemicals",
  contactEmail: "agrochem@klkoleo.com", parentDomain: "https://www.klkoleo.com",
  parentLinkLabel: "Part of KLK OLEO", navigation: [],copy:{},footer:{description:"",quickLinks:[],productLinks:[],legalLinks:[]},
};

test("an empty CMS menu is not replaced with code-owned marketing content",()=>{const provided=SiteProvider({value:site,children:null}).props.value;assert.deepEqual(provided.navigation,[]);assert.equal(provided.brandName,site.brandName);});

test("an explicitly configured CMS menu is preserved", () => {
  const navigation = [{ label: "Custom products", path: "/products" }];
  const provided = SiteProvider({ value: { ...site, navigation }, children: null }).props.value;
  assert.deepEqual(provided.navigation, navigation);
});
