# Resources thumbnail update

Four user-supplied images replace the four matching resource covers in the live CMS. The mapping and original-image SHA-256 checksums are recorded in `apps/cms/data/agrochemical-resource-thumbnails.json`. The fifth attachment was a layout reference, not a resource thumbnail.

The live resource records, PDF relationships and publication statuses remain unchanged. Existing thumbnail Media records 5–8 retain their site ownership, public visibility and Payload R2 object-key folders. Their file metadata, descriptive alt text and captions now point to the supplied PNG/JPEG files. The original PDF objects and media records were not changed. Original thumbnail files also remain available in storage for recovery. The website reads the CMS data dynamically; no frontend rebuild or Worker redeployment is needed.

The local SQLite CMS was empty. Matching sites, four resource records, thumbnails and verified copies of their existing PDFs were imported through the trusted Payload Local API. No local user account was created. The local server URL is configured as `http://127.0.0.1:4173` so CMS-generated image URLs resolve to this project. Local database and uploaded media remain ignored by Git.

Playwright verified all four thumbnails at 1440, 1031, 768 and 390px locally and at 1440, 768 and 390px live. All images decoded and no document overflow was found. Live Download dialogs opened for the matching resource and closed with Escape. Every live thumbnail response returned 200 and matched its supplied source checksum. Screenshots are in `apps/cms/output/playwright/resource-thumbnails/`.
