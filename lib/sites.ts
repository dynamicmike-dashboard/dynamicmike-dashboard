export interface SiteConfig {
  name: string;
  domain: string;
  driveFolderId: string;
  description: string;
  subdomain: string; // Used for local testing (e.g., breath.localhost:3000)
}

export const sites: SiteConfig[] = [
  {
    name: "Breath of Life PDC",
    domain: "breathoflifepdc.org",
    driveFolderId: "1KdddRN8_U-2949SOqoWwufIhYIyWDYXm",
    description: "Charity supporting families in Playa del Carmen.",
    subdomain: "breath"
  },
  {
    name: "Secondary Charity",
    domain: "yoursecondsite.com",
    driveFolderId: "DRIVE_FOLDER_ID_TWO",
    description: "Your second rescued site.",
    subdomain: "second"
  }
];

export function getSiteByDomain(hostname: string) {
  return sites.find(s => s.domain === hostname || s.subdomain === hostname.split('.')[0]);
}