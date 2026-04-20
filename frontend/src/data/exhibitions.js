// Exhibition data for Rudralife

export const domesticCities = [
  {
    id: "hyderabad",
    name: "Hyderabad",
    image: "https://images.unsplash.com/photo-1641722995655-0cd1e5e3f8bd?w=1200&q=80",
    status: "live",
    dates: "16th to 20th April 2026",
    dateRange: { start: "2026-04-16", end: "2026-04-20" },
    venue: "Lemon Tree Hotel",
    address: "Banjara Hills, Hyderabad, Telangana",
    timings: "10:00 AM to 8:00 PM (Sunday Open)",
  },
  {
    id: "visakhapatnam",
    name: "Visakhapatnam",
    image: "https://images.unsplash.com/photo-1606298855672-3efb63017be8?w=1200&q=80",
    status: "live",
    dates: "24th to 26th April 2026",
    dateRange: { start: "2026-04-24", end: "2026-04-26" },
    venue: "Dolphin Hotels",
    address: "Dabagardens, Visakhapatnam, Andhra Pradesh",
    timings: "10:00 AM to 8:00 PM (Sunday Open)",
  },
  {
    id: "bengaluru",
    name: "Bengaluru",
    image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&q=80",
    status: "live",
    dates: "23rd to 27th April 2026",
    dateRange: { start: "2026-04-23", end: "2026-04-27" },
    venue: "Lemon Tree Premier",
    address: "Ulsoor Lake, Bengaluru, Karnataka",
    timings: "10:00 AM to 8:00 PM (Sunday Open)",
  },
  { id: "chennai", name: "Chennai", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&q=80", status: "soon" },
  { id: "delhi", name: "Delhi", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&q=80", status: "soon" },
  { id: "ahmedabad", name: "Ahmedabad", image: "https://images.unsplash.com/photo-1624458382968-06a56c26ba9c?w=1200&q=80", status: "soon" },
  { id: "mumbai", name: "Mumbai", image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&q=80", status: "soon" },
  { id: "kolkata", name: "Kolkata", image: "https://images.unsplash.com/photo-1558431382-27e303142255?w=1200&q=80", status: "soon" },
  { id: "gandhinagar", name: "Gandhinagar", image: "https://images.unsplash.com/photo-1609920658906-8223bd289001?w=1200&q=80", status: "soon" },
  { id: "vadodara", name: "Vadodara", image: "https://images.unsplash.com/photo-1609948543911-d4fab7c50b1c?w=1200&q=80", status: "soon" },
  { id: "rajkot", name: "Rajkot", image: "https://images.unsplash.com/photo-1624359136353-f60129a367b9?w=1200&q=80", status: "soon" },
  { id: "surat", name: "Surat", image: "https://images.unsplash.com/photo-1609947017307-cf89f0b37ea8?w=1200&q=80", status: "soon" },
  { id: "jamnagar", name: "Jamnagar", image: "https://images.unsplash.com/photo-1609920658906-8223bd289001?w=1200&q=80", status: "soon" },
  { id: "pune", name: "Pune", image: "https://images.unsplash.com/photo-1572445271230-a78b5944a659?w=1200&q=80", status: "soon" },
  { id: "indore", name: "Indore", image: "https://images.unsplash.com/photo-1609947017307-cf89f0b37ea8?w=1200&q=80", status: "soon" },
  { id: "jaipur", name: "Jaipur", image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&q=80", status: "soon" },
];

export const internationalCities = [
  { id: "dubai", name: "Dubai", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80", status: "soon" },
  { id: "singapore", name: "Singapore", image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&q=80", status: "soon" },
  { id: "uk", name: "United Kingdom", image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80", status: "soon" },
  { id: "malaysia", name: "Malaysia", image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200&q=80", status: "soon" },
];

export const allCities = [...domesticCities, ...internationalCities];

// Generate date options for an exhibition
export const getDateOptions = (dateRange) => {
  if (!dateRange) return [];
  const dates = [];
  const start = new Date(dateRange.start);
  const end = new Date(dateRange.end);
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDate();
    const mon = monthNames[d.getMonth()];
    const yr = d.getFullYear();
    const wk = dayNames[d.getDay()];
    dates.push({
      value: `${day} ${mon} ${yr}`,
      label: `${day} ${mon} ${yr} (${wk})`,
    });
  }
  return dates;
};
