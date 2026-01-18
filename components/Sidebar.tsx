// Replace your existing sites array with this map
const sites = [
  { id: "Breath of Life", domain: "breathoflifepdc.org" }, // Example: Adjust to your actual domain
{ id: "InspiringSpeakersPDC", domain: "inspiringspeakerspdc.com" },
{ id: "mAIstermind", domain: "maistermind.com" },
{ id: "PDCYES", domain: "pdcyes.com" },
{ id: "Playa Photos", domain: "playa.photos" },
  { id: "PlayaVida", domain: "playavida.org" }, // Note the .org

  // Add the new sites you added to middleware here:
  { id: "Celestial Sign", domain: "celestialsigndesign.com" },
{ id: "Chat All Day", domain: "chatall.day" },
{ id: "Chillmaster Scotland", domain: "chillmasterscotland.com" },
{ id: "Conscious Shifts", domain: "consciousshifts.co.uk" },
{ id: "FifeArt", domain: "fifeart.com" },
{ id: "Louise VDV", domain: "louisevandervelde.com" },
  { id: "PranaTowers", domain: "pranatowers.com" },
  { id: "RealLifeAvengers", domain: "reallifeavengers.com" },
{ id: "RealAi casa", domain: "realaicasa.com" },
{ id: "SMMS", domain: "social-media-management-services.com" },


];

// Update the filtering logic
const filteredSites = sites.filter(site => 
  site.id.toLowerCase().includes(search.toLowerCase())
);

// Update the "VIEW LIVE" link in the JSX:
<a 
  href={`https://${site.domain}`} 
  target="_blank"
  className="flex-1 text-[10px] font-bold text-center py-1.5 bg-slate-800 text-slate-400 rounded hover:bg-slate-700 hover:text-white transition-all"
>
  VIEW LIVE
</a>