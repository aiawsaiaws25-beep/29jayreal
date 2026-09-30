// ==============================================================================
// JAY REAL ESTATE - SEED DATA DEFINITIONS
// 5 Developers, 6 Off-Plan Projects, 15 Ready Properties, Admin + 3 Agents,
// 40 Scored Leads (0-100, HOT/WARM/COLD), 10 Viewings, 5 Sales with 2% Commission
// ==============================================================================

export function calculateLeadScore(lead) {
  let score = 25; // base score

  // 1. Valid phone provided (+15)
  if (lead.phone && lead.phone.trim().length >= 7) {
    score += 15;
  }

  // 2. Specific property / project interest (+15)
  if (lead.property_id || lead.off_plan_id || (lead.interested_in && (
    lead.interested_in.toLowerCase().includes('villa') ||
    lead.interested_in.toLowerCase().includes('penthouse') ||
    lead.interested_in.toLowerCase().includes('mansion') ||
    lead.interested_in.toLowerCase().includes('residence') ||
    lead.interested_in.toLowerCase().includes('palm') ||
    lead.interested_in.toLowerCase().includes('downtown')
  ))) {
    score += 15;
  }

  // 3. Cash buyer (+20)
  if (lead.is_cash_buyer || (lead.source_form && lead.source_form.toLowerCase().includes('valuation')) || (lead.lead_source && lead.lead_source.toLowerCase().includes('vip'))) {
    score += 20;
  }

  // 4. Timeframe (+25 for Immediate / <1 month, +15 for 1-3 months)
  const tf = (lead.timeframe || '').toLowerCase();
  if (tf.includes('immediate') || tf.includes('within 15') || tf.includes('1 month') || lead.lead_source === 'Call Me Back' || lead.lead_source === 'Viewing Booking' || lead.source_form === 'Property Detail Viewing') {
    score += 25;
  } else if (tf.includes('1-3') || tf.includes('3 months')) {
    score += 15;
  } else {
    score += 5;
  }

  // 5. Budget factor (+25 for >20M, +20 for >10M, +15 for >5M)
  const budget = Number(lead.budget_aed) || 0;
  if (budget >= 20000000) {
    score += 25;
  } else if (budget >= 10000000) {
    score += 20;
  } else if (budget >= 5000000) {
    score += 15;
  } else if (budget > 0) {
    score += 10;
  }

  // Clamp score between 0 and 100
  score = Math.min(100, Math.max(0, score));

  let temperature = 'COLD';
  if (score >= 75) temperature = 'HOT';
  else if (score >= 45) temperature = 'WARM';

  return { score, temperature };
}

export const developersData = [
  {
    slug: "aura-luxury-developments",
    name: "Aura Luxury Developments",
    tagline: "Sculpting Architectural Masterpieces",
    description: "A private high-end development firm recognized for beachfront estates, minimalist sanctuaries, and signature architectural silhouettes across Dubai.",
    headquarters: "DIFC, Dubai, UAE",
    founded_year: 2014,
    completed_projects: 12
  },
  {
    slug: "solarium-haute-living",
    name: "Solarium Haute Living",
    tagline: "Ultra-Prime Waterfront Residences",
    description: "Specializing in super-prime island estates, private marina penthouses, and bespoke private branded residences.",
    headquarters: "Burj Khalifa District, Dubai, UAE",
    founded_year: 2016,
    completed_projects: 8
  },
  {
    slug: "apex-prime-developments",
    name: "Apex Prime Developments",
    tagline: "High-Altitude Urban Excellence",
    description: "Developers of iconic Downtown skyscrapers, sky-villas, and architectural towers overlooking the Burj Khalifa skyline.",
    headquarters: "Business Bay, Dubai, UAE",
    founded_year: 2011,
    completed_projects: 19
  },
  {
    slug: "crestline-estates",
    name: "Crestline Estates",
    tagline: "Serene Golf & Lagoon Communities",
    description: "Crafting master-planned green communities, contemporary golf course villas, and wellness-centric residential enclaves.",
    headquarters: "Dubai Hills Estate, Dubai, UAE",
    founded_year: 2015,
    completed_projects: 14
  },
  {
    slug: "vanguard-urban-assets",
    name: "Vanguard Urban Assets",
    tagline: "Smart Luxury & High-Yield Urban Spaces",
    description: "Pioneering smart-home boutique residences, modern duplexes, and prime rental investments in emerging Dubai hubs.",
    headquarters: "Dubai Internet City, Dubai, UAE",
    founded_year: 2018,
    completed_projects: 6
  }
];

export const agentsData = [
  {
    id: 100,
    full_name: "Jay Al-Sayed",
    title: "Founder & Managing Director",
    role: "admin",
    email: "admin@jayrealestate.ae",
    password_hash: "JayAdmin2026!",
    phone: "+971 4 800 JAY (529)",
    rera_number: "ORN 28910",
    specialization: "Firm Leadership, Master Accounts & Sovereign Portfolios",
    languages: "English, Arabic, French",
    photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    bio: "Visionary founder of Jay Real Estate with 18+ years orchestrating benchmark luxury acquisitions and private placements across the United Arab Emirates.",
    target_sales_aed: 100000000,
    target_commission_aed: 2000000
  },
  {
    id: 1,
    full_name: "Alexander Vance",
    title: "Senior Partner & Head of Private Client Advisory",
    role: "agent",
    email: "alexander.vance@jayrealestate-dubai.ae",
    password_hash: "JayAgent2026!",
    phone: "+971 58 555 9291",
    rera_number: "BRN 48291",
    specialization: "Super-Prime Mansions & Palm Jumeirah Waterfront",
    languages: "English, French, Arabic",
    photo_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80",
    bio: "Over 12 years advising international family offices and UHNW individuals on landmark Dubai real estate transactions exceeding AED 1.8 Billion.",
    target_sales_aed: 35000000,
    target_commission_aed: 700000
  },
  {
    id: 2,
    full_name: "Elena Rostova",
    title: "Director of Off-Plan Investments & Portfolio Strategy",
    role: "agent",
    email: "elena.rostova@jayrealestate-dubai.ae",
    password_hash: "JayAgent2026!",
    phone: "+971 58 555 9292",
    rera_number: "BRN 52140",
    specialization: "Off-Plan Launches, Yield Optimization & Sky Penthouses",
    languages: "English, Russian, German",
    photo_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    bio: "Leading off-plan acquisition specialist with direct priority developer allocations across Downtown, Dubai Harbour, and Dubai Water Canal.",
    target_sales_aed: 30000000,
    target_commission_aed: 600000
  },
  {
    id: 3,
    full_name: "Tariq Al-Mansoor",
    title: "Senior Advisor – Prime Urban & Golf Estates",
    role: "agent",
    email: "tariq.almansoor@jayrealestate-dubai.ae",
    password_hash: "JayAgent2026!",
    phone: "+971 58 555 9293",
    rera_number: "BRN 39812",
    specialization: "Dubai Hills, Business Bay & JVC High-Yield Portfolios",
    languages: "Arabic, English",
    photo_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
    bio: "Dubai native with deep knowledge of master-planned community appreciation, rental yields, and Golden Visa investor pathways.",
    target_sales_aed: 25000000,
    target_commission_aed: 500000
  }
];

export const offPlanProjectsData = [
  {
    id: 1,
    slug: "aura-oceanfront-residences",
    name: "Aura Oceanfront Residences",
    developer_id: 1,
    developer_name: "Aura Luxury Developments",
    location: "Dubai Harbour",
    sub_location: "Dubai Harbour Waterfront Promenade",
    starting_price_aed: 8900000,
    handover_date: "Q3 2027",
    payment_plan: "60/40 On Handover",
    units_type: "1, 2, 3 & 4 Bedroom Waterfront Apartments & Sky Penthouses",
    description: "An iconic luxury tower rising directly on the Dubai Harbour waterfront with uninterrupted maritime vistas towards Ain Dubai, Palm Jumeirah, and the Arabian Gulf. Designed with flowing nautical curves, private yacht slips, and private resident beach club.",
    image_url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=85",
    gallery_urls: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=85"
    ],
    features: [
      "Private Yacht Marina Berthing",
      "Infinity Edge Lagoon Swimming Pool",
      "Private White Sand Resident Beach",
      "Technogym Equipped Wellness Center",
      "Valet & 24/7 White-Glove Concierge"
    ],
    payment_milestones: [
      { milestone: "On Booking (Immediate)", percentage: 10 },
      { milestone: "During Construction (Quarterly)", percentage: 50 },
      { milestone: "On Handover (Q3 2027)", percentage: 40 }
    ],
    featured: true
  },
  {
    id: 2,
    slug: "the-grand-canal-mansion",
    name: "The Grand Canal Mansions",
    developer_id: 2,
    developer_name: "Solarium Haute Living",
    location: "Business Bay",
    sub_location: "Dubai Water Canal Promenade",
    starting_price_aed: 24500000,
    handover_date: "Q4 2026",
    payment_plan: "70/30 Linked to Milestones",
    units_type: "5 & 6 Bedroom Waterfront Mansions",
    description: "A limited collection of ultra-exclusive mansions fronting the Dubai Water Canal. Features private boat docks, double-height light atriums, Italian travertine facades, and private subterranean car galleries.",
    image_url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85",
    gallery_urls: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85"
    ],
    features: [
      "Direct Canal Waterway Frontage",
      "Private Docking Berth for Yachts",
      "Basement 6-Car Showcase Gallery",
      "Private Spa with Turkish Hammam",
      "Internal Zen Reflecting Courtyards"
    ],
    payment_milestones: [
      { milestone: "Down Payment Upon Reservation", percentage: 20 },
      { milestone: "Construction Milestones (4 Installments)", percentage: 50 },
      { milestone: "On Completion & Handover (Q4 2026)", percentage: 30 }
    ],
    featured: true
  },
  {
    id: 3,
    slug: "solarium-sky-villas-downtown",
    name: "Solarium Sky Villas",
    developer_id: 3,
    developer_name: "Apex Prime Developments",
    location: "Downtown",
    sub_location: "Opera District, Downtown Dubai",
    starting_price_aed: 18500000,
    handover_date: "Q1 2028",
    payment_plan: "80/20 Post-Handover Available",
    units_type: "3, 4 & 5 Bedroom Duplex Sky Villas",
    description: "Suspended 60 floors above Downtown Dubai, each Sky Villa boasts double-height glass reception halls, cantilevered glass infinity pools, and front-row views of the Burj Khalifa and the Dubai Fountains.",
    image_url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85",
    gallery_urls: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=85"
    ],
    features: [
      "Private Cantilevered Sky Plunge Pool",
      "Unobstructed Burj Khalifa Panorama",
      "Direct Access to Dubai Opera Plaza",
      "Private Resident Cigar & Wine Club",
      "Custom Italian Poliform Kitchens"
    ],
    payment_milestones: [
      { milestone: "Initial Reservation Fee", percentage: 10 },
      { milestone: "During Construction", percentage: 50 },
      { milestone: "On Handover (Q1 2028)", percentage: 20 },
      { milestone: "1 Year Post-Handover", percentage: 20 }
    ],
    featured: true
  },
  {
    id: 4,
    slug: "crestline-lagoon-villas",
    name: "Crestline Lagoon Sanctuary",
    developer_id: 4,
    developer_name: "Crestline Estates",
    location: "Dubai Hills",
    sub_location: "The Lagoons, Dubai Hills Estate",
    starting_price_aed: 14200000,
    handover_date: "Q2 2027",
    payment_plan: "70/30 On Handover",
    units_type: "4, 5 & 6 Bedroom Contemporary Island Villas",
    description: "Nestled along a crystal swimmable lagoon inside Dubai Hills Estate. Features expansive garden plots, organic sustainable materials, floor-to-ceiling glass pavilions, and direct championship golf course access.",
    image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
    gallery_urls: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85"
    ],
    features: [
      "Private Crystal Swimmable Lagoon Access",
      "Championship 18-Hole Golf Access",
      "Smart Passive Eco-Cooling Design",
      "Private Chef Kitchen & Maid Quarters",
      "Gated Community with 24/7 Security"
    ],
    payment_milestones: [
      { milestone: "Booking Deposit", percentage: 15 },
      { milestone: "Linked to Construction Progress", percentage: 55 },
      { milestone: "On Key Handover (Q2 2027)", percentage: 30 }
    ],
    featured: false
  },
  {
    id: 5,
    slug: "vanguard-lumina-jvc",
    name: "Vanguard Lumina Residences",
    developer_id: 5,
    developer_name: "Vanguard Urban Assets",
    location: "JVC",
    sub_location: "District 12, Jumeirah Village Circle",
    starting_price_aed: 1250000,
    handover_date: "Q4 2026",
    payment_plan: "50/50 Handover Plan",
    units_type: "Studio, 1 & 2 Bedroom Smart Luxury Apartments",
    description: "High-yield investment gem located in central JVC. Equipped with AI smart-home ecosystem, resort-style rooftop infinity pool, co-working lounges, and expected 8.5% net rental ROI.",
    image_url: "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1600&q=85",
    gallery_urls: [
      "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=85"
    ],
    features: [
      "Projected 8.5% Net Rental Yield",
      "Rooftop Infinity Horizon Pool & Cinema",
      "Integrated Smart Home Automation",
      "Co-Working & Executive Meeting Pods",
      "5 Minutes from Circle Mall JVC"
    ],
    payment_milestones: [
      { milestone: "Reservation Fee", percentage: 10 },
      { milestone: "During Construction (30 Months)", percentage: 40 },
      { milestone: "Upon Handover (Q4 2026)", percentage: 50 }
    ],
    featured: false
  },
  {
    id: 6,
    slug: "marina-cove-penthouses",
    name: "Marina Cove Sky Residences",
    developer_id: 1,
    developer_name: "Aura Luxury Developments",
    location: "Dubai Marina",
    sub_location: "Marina Walk Frontage",
    starting_price_aed: 6800000,
    handover_date: "Q1 2027",
    payment_plan: "60/40 On Handover",
    units_type: "2, 3 & 4 Bedroom Luxury Marina Apartments",
    description: "Contemporary waterfront tower with private boardwalk access, direct yacht mooring, and sweeping panoramic views across the Dubai Marina skyline and JBR coastline.",
    image_url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=85",
    gallery_urls: [
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=85"
    ],
    features: [
      "Direct Marina Walk Promenade Access",
      "Residents Private Beach Club Shuttle",
      "Heated Sky Lap Pool & Hydrotherapy",
      "Kids Splash Pad & Daycare Lounge",
      "Smart Keyless Access & Valet"
    ],
    payment_milestones: [
      { milestone: "Immediate Down Payment", percentage: 10 },
      { milestone: "Construction Installments", percentage: 50 },
      { milestone: "Final Handover (Q1 2027)", percentage: 40 }
    ],
    featured: false
  }
];

export const propertiesData = [
  {
    id: 1,
    slug: "the-palm-horizon-villa",
    title: "The Palm Horizon Beach Villa",
    developer_id: 1,
    developer_name: "Aura Luxury Developments",
    property_type: "Villa",
    location: "Palm Jumeirah",
    sub_location: "Frond G (Billionaires' Row), Palm Jumeirah",
    price_aed: 45000000,
    bedrooms: 6,
    bathrooms: 8,
    area_sqft: 12850,
    plot_sqft: 15200,
    status: "Ready",
    tag: "SIGNATURE RESIDENCE",
    image_url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=85",
    gallery_urls: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85"
    ],
    description: "An exceptional beachfront masterpiece situated on the coveted Billionaires' Row of Palm Jumeirah. Boasting direct private beach access, double-height ceiling reception halls, and an infinity swimming pool overlooking the Dubai Marina skyline.",
    amenities: ["Private White Sand Beach", "Infinity Edge Pool", "Rooftop Sunset Lounge", "Subterranean 6-Car Garage", "Smart Home Automation", "Private Spa & Sauna"],
    assigned_agent_id: 1,
    featured: true
  },
  {
    id: 2,
    slug: "palm-crown-mansion",
    title: "The Palm Crown Grand Mansion",
    developer_id: 2,
    developer_name: "Solarium Haute Living",
    property_type: "Mansion",
    location: "Palm Jumeirah",
    sub_location: "Frond N, Palm Jumeirah",
    price_aed: 62000000,
    bedrooms: 7,
    bathrooms: 9,
    area_sqft: 16500,
    plot_sqft: 19800,
    status: "Ready",
    tag: "ULTRA PRIME",
    image_url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85",
    gallery_urls: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85"
    ],
    description: "Masterwork designed by international architectural masters. Highlights include book-matched Calacatta marble, 25-meter beachfront pool, private elevator across 4 floors, and private cinema.",
    amenities: ["Private Beach", "25m Swimming Pool", "Private Cinema", "Wine Cellar", "Staff Quarters for 6", "Elevator Across 4 Levels"],
    assigned_agent_id: 1,
    featured: true
  },
  {
    id: 3,
    slug: "palm-crescent-penthouse",
    title: "The Royal Crescent Penthouse",
    developer_id: 1,
    developer_name: "Aura Luxury Developments",
    property_type: "Penthouse",
    location: "Palm Jumeirah",
    sub_location: "East Crescent, Palm Jumeirah",
    price_aed: 28500000,
    bedrooms: 4,
    bathrooms: 5,
    area_sqft: 7200,
    plot_sqft: null,
    status: "Ready",
    tag: "PENTHOUSE",
    image_url: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85",
    gallery_urls: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85"
    ],
    description: "Full-floor penthouse on Palm Jumeirah's East Crescent with 360-degree ocean panoramas, private infinity plunge pool, and direct access to five-star resort amenities.",
    amenities: ["Private Plunge Pool", "Full Floor Privacy", "Five-Star Resort Access", "Valet Parking", "Concierge 24/7"],
    assigned_agent_id: 1,
    featured: false
  },
  {
    id: 4,
    slug: "downtown-pinnacle-penthouse",
    title: "Downtown Pinnacle Penthouse",
    developer_id: 3,
    developer_name: "Apex Prime Developments",
    property_type: "Penthouse",
    location: "Downtown",
    sub_location: "Opera District, Downtown Dubai",
    price_aed: 32500000,
    bedrooms: 4,
    bathrooms: 5,
    area_sqft: 8400,
    plot_sqft: null,
    status: "Ready",
    tag: "SKY RESIDENCE",
    image_url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85",
    gallery_urls: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=85"
    ],
    description: "Perched high above Downtown Dubai with unobstructed 360-degree panoramic vistas of the Burj Khalifa and the Dubai Fountains. Features bespoke Italian marble finishes and a private cantilevered plunge pool.",
    amenities: ["Direct Burj Khalifa View", "Cantilevered Sky Pool", "Private Elevator", "Poliform Kitchen", "24/7 Concierge", "Wine Cellar"],
    assigned_agent_id: 2,
    featured: true
  },
  {
    id: 5,
    slug: "downtown-boulevard-residence",
    title: "The Boulevard Grand Residence",
    developer_id: 3,
    developer_name: "Apex Prime Developments",
    property_type: "Apartment",
    location: "Downtown",
    sub_location: "Sheikh Mohammed bin Rashid Blvd, Downtown",
    price_aed: 7800000,
    bedrooms: 3,
    bathrooms: 4,
    area_sqft: 2450,
    plot_sqft: null,
    status: "Ready",
    tag: "PRIME RESIDENCE",
    image_url: "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1600&q=85",
    gallery_urls: [
      "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=85"
    ],
    description: "Sophisticated modern living directly on the Boulevard with walkability to Dubai Mall and Opera. Features floor-to-ceiling windows and premium Miele kitchen appliances.",
    amenities: ["Boulevard Views", "Shared Infinity Pool", "Gymnasium", "2 Allocated Parking", "Concierge Service"],
    assigned_agent_id: 2,
    featured: false
  },
  {
    id: 6,
    slug: "downtown-fountain-view-suite",
    title: "Fountain Crest Luxury Suite",
    developer_id: 3,
    developer_name: "Apex Prime Developments",
    property_type: "Apartment",
    location: "Downtown",
    sub_location: "Burj Khalifa Community, Downtown",
    price_aed: 4950000,
    bedrooms: 2,
    bathrooms: 3,
    area_sqft: 1680,
    plot_sqft: null,
    status: "Ready",
    tag: "HIGH ROI",
    image_url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=85",
    gallery_urls: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=85"
    ],
    description: "Fully furnished designer apartment offering prime views of the dancing Dubai Fountains and city skyline. Excellent for premium short-term holiday home rental yields.",
    amenities: ["Dubai Fountain Views", "Designer Furnishing Included", "Valet & Health Club", "High Rental Demand"],
    assigned_agent_id: 2,
    featured: false
  },
  {
    id: 7,
    slug: "marina-sky-duplex",
    title: "The Marina Sky Duplex",
    developer_id: 1,
    developer_name: "Aura Luxury Developments",
    property_type: "Duplex",
    location: "Dubai Marina",
    sub_location: "Marina Promenade, Dubai Marina",
    price_aed: 16800000,
    bedrooms: 4,
    bathrooms: 5,
    area_sqft: 5600,
    plot_sqft: null,
    status: "Ready",
    tag: "WATERFRONT DUPLEX",
    image_url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=85",
    gallery_urls: [
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85"
    ],
    description: "A double-height sky duplex overlooking the luxury superyachts in Dubai Marina. Features a private glass-fronted terrace jacuzzi and custom Italian cabinetry.",
    amenities: ["Private Jacuzzi Terrace", "Superyacht Marina Views", "24/7 Security", "Private Lift Access", "3 Parking Bays"],
    assigned_agent_id: 1,
    featured: true
  },
  {
    id: 8,
    slug: "marina-gate-panoramic-home",
    title: "Marina Gate Panoramic Residence",
    developer_id: 1,
    developer_name: "Aura Luxury Developments",
    property_type: "Apartment",
    location: "Dubai Marina",
    sub_location: "Marina Walk, Dubai Marina",
    price_aed: 5800000,
    bedrooms: 3,
    bathrooms: 4,
    area_sqft: 2150,
    plot_sqft: null,
    status: "Ready",
    tag: "READY HOME",
    image_url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=85",
    gallery_urls: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=85"
    ],
    description: "Corner luxury apartment boasting wrap-around balconies with uninterrupted sunset views across the Marina and Ain Dubai.",
    amenities: ["Corner Unit", "Marina Views", "Infinity Pool", "Squash & Padel Courts", "Covered Parking"],
    assigned_agent_id: 3,
    featured: false
  },
  {
    id: 9,
    slug: "business-bay-canal-penthouse",
    title: "The Opus Canal Penthouse",
    developer_id: 2,
    developer_name: "Solarium Haute Living",
    property_type: "Penthouse",
    location: "Business Bay",
    sub_location: "Canal District, Business Bay",
    price_aed: 19500000,
    bedrooms: 4,
    bathrooms: 5,
    area_sqft: 6100,
    plot_sqft: null,
    status: "Ready",
    tag: "CANAL FRONT",
    image_url: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=85",
    gallery_urls: [
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=85"
    ],
    description: "Architectural masterpiece on the Dubai Water Canal with direct skyline and water views. Features double-glazed minimalist acoustic walls and bespoke Poggenpohl kitchen.",
    amenities: ["Dubai Water Canal View", "Private Plunge Pool", "Bespoke Poggenpohl Kitchen", "Smart Lighting & HVAC", "Valet"],
    assigned_agent_id: 2,
    featured: true
  },
  {
    id: 10,
    slug: "business-bay-waterfront-suite",
    title: "Canal Vista Luxury Suite",
    developer_id: 2,
    developer_name: "Solarium Haute Living",
    property_type: "Apartment",
    location: "Business Bay",
    sub_location: "Marasi Bay, Business Bay",
    price_aed: 3850000,
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: 1420,
    plot_sqft: null,
    status: "Ready",
    tag: "READY HOME",
    image_url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=85",
    gallery_urls: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=85"
    ],
    description: "Spacious two-bedroom residence situated along Marasi Bay promenade with direct access to fine dining and water taxi stations.",
    amenities: ["Marasi Bay Promenade", "Swimming Pool & Spa", "Fitness Studio", "Allocated Parking"],
    assigned_agent_id: 3,
    featured: false
  },
  {
    id: 11,
    slug: "dubai-hills-fairway-mansion",
    title: "Dubai Hills Fairway Estate",
    developer_id: 4,
    developer_name: "Crestline Estates",
    property_type: "Villa",
    location: "Dubai Hills",
    sub_location: "Fairway Vistas, Dubai Hills Estate",
    price_aed: 38500000,
    bedrooms: 6,
    bathrooms: 7,
    area_sqft: 11400,
    plot_sqft: 14500,
    status: "Ready",
    tag: "GOLF ESTATE",
    image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
    gallery_urls: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85"
    ],
    description: "Front-row golf course estate looking over the lush championship 18-hole greens and the Downtown skyline backdrop. Features landscaped zen gardens and private heated pool.",
    amenities: ["Golf Course Fairway Views", "Heated Swimming Pool", "Private Gymnasium", "Chef's Kitchen", "Gated 24/7 Security"],
    assigned_agent_id: 3,
    featured: true
  },
  {
    id: 12,
    slug: "dubai-hills-parkway-villa",
    title: "Parkway Modernist Villa",
    developer_id: 4,
    developer_name: "Crestline Estates",
    property_type: "Villa",
    location: "Dubai Hills",
    sub_location: "Parkway Vistas, Dubai Hills Estate",
    price_aed: 26000000,
    bedrooms: 5,
    bathrooms: 6,
    area_sqft: 8900,
    plot_sqft: 11800,
    status: "Ready",
    tag: "LUXURY VILLA",
    image_url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=85",
    gallery_urls: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=85"
    ],
    description: "Contemporary sanctuary in Dubai Hills Estate with double-height glass reception, internal courtyard with mature olive tree, and private maid and driver quarters.",
    amenities: ["Park Views", "Private Pool", "Zen Courtyard", "Driver & Maid Rooms", "Smart Home Automation"],
    assigned_agent_id: 3,
    featured: false
  },
  {
    id: 13,
    slug: "dubai-hills-park-horizon",
    title: "Park Horizon Skyline Residence",
    developer_id: 4,
    developer_name: "Crestline Estates",
    property_type: "Apartment",
    location: "Dubai Hills",
    sub_location: "Park Ridge, Dubai Hills Estate",
    price_aed: 3650000,
    bedrooms: 3,
    bathrooms: 3,
    area_sqft: 1720,
    plot_sqft: null,
    status: "Ready",
    tag: "HIGH ROI",
    image_url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=85",
    gallery_urls: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=85"
    ],
    description: "Modern apartment overlooking Dubai Hills Park and Mall. Surrounded by landscaped running tracks and international schools.",
    amenities: ["Dubai Hills Park View", "Communal Pool & Gym", "Walking Distance to Mall", "Children Play Area"],
    assigned_agent_id: 3,
    featured: false
  },
  {
    id: 14,
    slug: "jvc-serenity-townhouse",
    title: "Serenity Garden Villa",
    developer_id: 5,
    developer_name: "Vanguard Urban Assets",
    property_type: "Villa",
    location: "JVC",
    sub_location: "District 15, Jumeirah Village Circle",
    price_aed: 2950000,
    bedrooms: 4,
    bathrooms: 5,
    area_sqft: 3450,
    plot_sqft: 2800,
    status: "Ready",
    tag: "PRIME VALUE",
    image_url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85",
    gallery_urls: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85"
    ],
    description: "Modern 4-bedroom family villa in JVC featuring a private rooftop barbecue deck, elevator provision, landscaped private lawn, and maid's room.",
    amenities: ["Private Rooftop Deck", "Private Garden", "Maid Room", "Covered 2-Car Parking", "Near Circle Mall"],
    assigned_agent_id: 3,
    featured: false
  },
  {
    id: 15,
    slug: "jvc-signature-smart-residence",
    title: "Lumina Smart Horizon Apartment",
    developer_id: 5,
    developer_name: "Vanguard Urban Assets",
    property_type: "Apartment",
    location: "JVC",
    sub_location: "District 11, Jumeirah Village Circle",
    price_aed: 1350000,
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: 1180,
    plot_sqft: null,
    status: "Ready",
    tag: "HIGH RENTAL YIELD",
    image_url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=85",
    gallery_urls: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=85"
    ],
    description: "Smartly configured two-bedroom home in JVC delivering an established 8.7% net rental yield. Fully furnished with Alexa-integrated automation and resort pool.",
    amenities: ["8.7% Net Rental Yield", "Fully Furnished", "Smart Home Automation", "Rooftop Pool & Gym"],
    assigned_agent_id: 3,
    featured: false
  }
];

// Raw 40 leads enriched with score and temperature
const rawLeads = [
  { id: 1, full_name: "Lord Henry Cavendish", phone: "+44 7700 900123", email: "h.cavendish@mayfaircapital.co.uk", interested_in: "Palm Jumeirah Beachfront Villa", budget_aed: 50000000, preferred_community: "Palm Jumeirah", lead_source: "Website Form", source_form: "Register Interest Modal", status: "Offer Made", assigned_agent_id: 1, property_id: 1, is_cash_buyer: true, timeframe: "Immediate (< 1 month)" },
  { id: 2, full_name: "Sheikh Mansoor Al-Qasimi", phone: "+971 50 123 4567", email: "m.alqasimi@gulfholdings.ae", interested_in: "Downtown Penthouse with Burj Khalifa View", budget_aed: 35000000, preferred_community: "Downtown", lead_source: "VIP Desk", source_form: "Property Detail Viewing", status: "Viewing Scheduled", assigned_agent_id: 2, property_id: 4, is_cash_buyer: true, timeframe: "Immediate (< 1 month)" },
  { id: 3, full_name: "Maximilian Richter", phone: "+49 151 23456789", email: "m.richter@munich-advisory.de", interested_in: "Aura Oceanfront Off-Plan 3BR", budget_aed: 10000000, preferred_community: "Dubai Harbour", lead_source: "Brochure Download", source_form: "Off-Plan Brochure Download", status: "Negotiating", assigned_agent_id: 2, off_plan_id: 1, is_cash_buyer: true, timeframe: "1-3 months" },
  { id: 4, full_name: "Claire Delacroix", phone: "+33 6 12 34 56 78", email: "claire.delacroix@genevaprivate.ch", interested_in: "Dubai Hills Fairway Villa", budget_aed: 40000000, preferred_community: "Dubai Hills", lead_source: "Valuation Request", source_form: "Sell Valuation Form", status: "Contacted", assigned_agent_id: 3, property_id: 11, is_cash_buyer: true, timeframe: "Immediate (< 1 month)" },
  { id: 5, full_name: "Rahul Singhania", phone: "+91 98200 12345", email: "rahul.s@singhaniawealth.in", interested_in: "Off-Plan Investment Portfolio (2 Units)", budget_aed: 18000000, preferred_community: "Business Bay", lead_source: "Call Me Back", source_form: "Call Me Back Widget", status: "New", assigned_agent_id: 2, off_plan_id: 2, is_cash_buyer: false, timeframe: "1-3 months" },
  { id: 6, full_name: "Dmitry Volkov", phone: "+7 916 555 0192", email: "volkov.d@nordiccapital.ru", interested_in: "The Palm Crown Grand Mansion", budget_aed: 65000000, preferred_community: "Palm Jumeirah", lead_source: "Website Form", source_form: "Property Detail Enquiry", status: "Viewing Scheduled", assigned_agent_id: 1, property_id: 2, is_cash_buyer: true, timeframe: "Immediate (< 1 month)" },
  { id: 7, full_name: "Aisha Al-Nuaimi", phone: "+971 52 987 6543", email: "aisha.alnuaimi@ad-invest.ae", interested_in: "The Opus Canal Penthouse", budget_aed: 20000000, preferred_community: "Business Bay", lead_source: "WhatsApp", source_form: "WhatsApp Desk", status: "Negotiating", assigned_agent_id: 2, property_id: 9, is_cash_buyer: true, timeframe: "1-3 months" },
  { id: 8, full_name: "Zhang Wei", phone: "+86 138 0013 8000", email: "zhang.wei@shanghaitech.cn", interested_in: "Dubai Marina Sky Duplex", budget_aed: 18000000, preferred_community: "Dubai Marina", lead_source: "Website Form", source_form: "Property Detail Enquiry", status: "Contacted", assigned_agent_id: 1, property_id: 7, is_cash_buyer: false, timeframe: "1-3 months" },
  { id: 9, full_name: "Dr. Jonathan Hayes", phone: "+1 212 555 0144", email: "jhayes@manhattanhealth.org", interested_in: "Golden Visa Eligible Downtown Apartment", budget_aed: 5500000, preferred_community: "Downtown", lead_source: "Mortgage Calculator", source_form: "Mortgage Advisor Request", status: "New", assigned_agent_id: 3, property_id: 6, is_cash_buyer: false, timeframe: "3-6 months" },
  { id: 10, full_name: "Fatima Zahra", phone: "+971 55 432 1098", email: "f.zahra@dubaimedia.ae", interested_in: "Parkway Modernist Villa", budget_aed: 28000000, preferred_community: "Dubai Hills", lead_source: "Website Form", source_form: "Property Detail Viewing", status: "Viewing Scheduled", assigned_agent_id: 3, property_id: 12, is_cash_buyer: true, timeframe: "Immediate (< 1 month)" },
  { id: 11, full_name: "Jean-Paul Laurent", phone: "+377 93 10 00 00", email: "jp.laurent@monacofamily.mc", interested_in: "Grand Canal Mansion Off-Plan", budget_aed: 26000000, preferred_community: "Business Bay", lead_source: "Brochure Download", source_form: "Off-Plan Brochure Download", status: "Contacted", assigned_agent_id: 2, off_plan_id: 2, is_cash_buyer: true, timeframe: "1-3 months" },
  { id: 12, full_name: "Oliver Sterling", phone: "+44 20 7946 0912", email: "oliver@sterlingpartners.co.uk", interested_in: "JVC High-Yield Buy-to-Let Package", budget_aed: 4000000, preferred_community: "JVC", lead_source: "Website Form", source_form: "Register Interest Modal", status: "Won", assigned_agent_id: 3, property_id: 15, is_cash_buyer: true, timeframe: "Immediate (< 1 month)" },
  { id: 13, full_name: "Nasser Al-Subaie", phone: "+966 50 555 1234", email: "nasser@subaiegroup.com.sa", interested_in: "Palm Jumeirah Ready Villa with Private Beach", budget_aed: 48000000, preferred_community: "Palm Jumeirah", lead_source: "VIP Desk", source_form: "Property Detail Viewing", status: "Won", assigned_agent_id: 1, property_id: 1, is_cash_buyer: true, timeframe: "Immediate (< 1 month)" },
  { id: 14, full_name: "Elena Popova", phone: "+357 99 123456", email: "elena.p@cyprusinvest.com", interested_in: "Downtown Boulevard 3BR", budget_aed: 8500000, preferred_community: "Downtown", lead_source: "Website Form", source_form: "Property Detail Enquiry", status: "Contacted", assigned_agent_id: 2, property_id: 5, is_cash_buyer: false, timeframe: "1-3 months" },
  { id: 15, full_name: "Vikram Malhotra", phone: "+971 50 888 7766", email: "vikram@malhotracorp.ae", interested_in: "Dubai Hills 3BR Park Horizon", budget_aed: 4000000, preferred_community: "Dubai Hills", lead_source: "Mortgage Calculator", source_form: "Mortgage Advisor Request", status: "New", assigned_agent_id: 3, property_id: 13, is_cash_buyer: false, timeframe: "3-6 months" },
  { id: 16, full_name: "Marcus Aurelius Thorne", phone: "+1 415 555 2671", email: "mthorne@bayventures.io", interested_in: "Solarium Sky Villas Downtown Off-Plan", budget_aed: 20000000, preferred_community: "Downtown", lead_source: "Brochure Download", source_form: "Off-Plan Brochure Download", status: "Offer Made", assigned_agent_id: 2, off_plan_id: 3, is_cash_buyer: true, timeframe: "1-3 months" },
  { id: 17, full_name: "Amina Bint Khalid", phone: "+971 50 999 1122", email: "amina.khalid@royalholding.ae", interested_in: "The Royal Crescent Penthouse", budget_aed: 30000000, preferred_community: "Palm Jumeirah", lead_source: "WhatsApp", source_form: "WhatsApp Desk", status: "Viewing Scheduled", assigned_agent_id: 1, property_id: 3, is_cash_buyer: true, timeframe: "Immediate (< 1 month)" },
  { id: 18, full_name: "Sven Lindqvist", phone: "+46 8 123 4567", email: "sven@nordicnord.se", interested_in: "Marina Gate Panoramic Residence", budget_aed: 6000000, preferred_community: "Dubai Marina", lead_source: "Website Form", source_form: "Property Detail Enquiry", status: "New", assigned_agent_id: 3, property_id: 8, is_cash_buyer: false, timeframe: "1-3 months" },
  { id: 19, full_name: "Tariq Mahmood", phone: "+92 300 1234567", email: "tariq.m@lahoretrading.pk", interested_in: "Serenity Garden Townhouse JVC", budget_aed: 3200000, preferred_community: "JVC", lead_source: "Call Me Back", source_form: "Call Me Back Widget", status: "Contacted", assigned_agent_id: 3, property_id: 14, is_cash_buyer: false, timeframe: "1-3 months" },
  { id: 20, full_name: "Isabella Rossi", phone: "+39 02 555 1234", email: "isabella.rossi@milanoestates.it", interested_in: "Canal Vista Luxury Suite", budget_aed: 4000000, preferred_community: "Business Bay", lead_source: "Website Form", source_form: "Property Detail Enquiry", status: "New", assigned_agent_id: 3, property_id: 10, is_cash_buyer: false, timeframe: "3-6 months" },
  { id: 21, full_name: "Karan Johar", phone: "+91 98111 22334", email: "karan.johar@mumbaimedia.in", interested_in: "Downtown Pinnacle Penthouse", budget_aed: 35000000, preferred_community: "Downtown", lead_source: "VIP Desk", source_form: "Property Detail Viewing", status: "Won", assigned_agent_id: 2, property_id: 4, is_cash_buyer: true, timeframe: "Immediate (< 1 month)" },
  { id: 22, full_name: "Hamad Al-Thani", phone: "+974 55 123 456", email: "h.althani@dohacapital.qa", interested_in: "Palm Jumeirah Beach Mansion", budget_aed: 65000000, preferred_community: "Palm Jumeirah", lead_source: "Website Form", source_form: "Register Interest Modal", status: "Negotiating", assigned_agent_id: 1, property_id: 2, is_cash_buyer: true, timeframe: "Immediate (< 1 month)" },
  { id: 23, full_name: "Christian Müller", phone: "+41 22 555 0199", email: "c.mueller@zurichwealth.ch", interested_in: "Crestline Lagoon Sanctuary Off-Plan", budget_aed: 15000000, preferred_community: "Dubai Hills", lead_source: "Brochure Download", source_form: "Off-Plan Brochure Download", status: "Contacted", assigned_agent_id: 3, off_plan_id: 4, is_cash_buyer: true, timeframe: "1-3 months" },
  { id: 24, full_name: "Sophia Chen", phone: "+65 9123 4567", email: "sophia.chen@singaporefunds.sg", interested_in: "Marina Cove Sky Residences Off-Plan", budget_aed: 7500000, preferred_community: "Dubai Marina", lead_source: "Website Form", source_form: "Register Interest Modal", status: "New", assigned_agent_id: 1, off_plan_id: 6, is_cash_buyer: false, timeframe: "1-3 months" },
  { id: 25, full_name: "Bader Al-Otaibi", phone: "+965 99 123456", email: "bader@kuwaitoil.kw", interested_in: "Dubai Hills Fairway Estate", budget_aed: 42000000, preferred_community: "Dubai Hills", lead_source: "WhatsApp", source_form: "WhatsApp Desk", status: "Viewing Scheduled", assigned_agent_id: 3, property_id: 11, is_cash_buyer: true, timeframe: "Immediate (< 1 month)" },
  { id: 26, full_name: "Lucas Van Der Bilt", phone: "+31 20 555 8899", email: "lucas@amsterdamtech.nl", interested_in: "Vanguard Lumina JVC Off-Plan", budget_aed: 1500000, preferred_community: "JVC", lead_source: "Mortgage Calculator", source_form: "Mortgage Advisor Request", status: "New", assigned_agent_id: 3, off_plan_id: 5, is_cash_buyer: false, timeframe: "3-6 months" },
  { id: 27, full_name: "Faisal Al-Ghamdi", phone: "+966 55 987 6543", email: "faisal.ghamdi@jeddahtrade.sa", interested_in: "The Palm Horizon Beach Villa", budget_aed: 46000000, preferred_community: "Palm Jumeirah", lead_source: "Valuation Request", source_form: "Sell Valuation Form", status: "Offer Made", assigned_agent_id: 1, property_id: 1, is_cash_buyer: true, timeframe: "Immediate (< 1 month)" },
  { id: 28, full_name: "Victoria Romanova", phone: "+7 495 777 8899", email: "victoria.r@moscowfinance.ru", interested_in: "The Opus Canal Penthouse", budget_aed: 22000000, preferred_community: "Business Bay", lead_source: "Website Form", source_form: "Property Detail Enquiry", status: "Contacted", assigned_agent_id: 2, property_id: 9, is_cash_buyer: true, timeframe: "1-3 months" },
  { id: 29, full_name: "David Sterling-Cole", phone: "+44 7800 112233", email: "david@coleholdings.co.uk", interested_in: "Downtown Boulevard 3BR", budget_aed: 8000000, preferred_community: "Downtown", lead_source: "Call Me Back", source_form: "Call Me Back Widget", status: "New", assigned_agent_id: 2, property_id: 5, is_cash_buyer: false, timeframe: "1-3 months" },
  { id: 30, full_name: "Reem Al-Falasi", phone: "+971 50 333 4455", email: "reem.alfalasi@dubaichamber.ae", interested_in: "Parkway Modernist Villa", budget_aed: 27000000, preferred_community: "Dubai Hills", lead_source: "Website Form", source_form: "Property Detail Viewing", status: "Won", assigned_agent_id: 3, property_id: 12, is_cash_buyer: true, timeframe: "Immediate (< 1 month)" },
  { id: 31, full_name: "Arthur Pendelton", phone: "+1 312 555 4400", email: "arthur@chicagoinvest.com", interested_in: "Marina Sky Duplex", budget_aed: 17000000, preferred_community: "Dubai Marina", lead_source: "Website Form", source_form: "Property Detail Enquiry", status: "Won", assigned_agent_id: 1, property_id: 7, is_cash_buyer: true, timeframe: "Immediate (< 1 month)" },
  { id: 32, full_name: "Zaid Al-Harbi", phone: "+971 52 111 2233", email: "zaid.harbi@sharjahholding.ae", interested_in: "Canal Vista Luxury Suite", budget_aed: 4200000, preferred_community: "Business Bay", lead_source: "WhatsApp", source_form: "WhatsApp Desk", status: "Contacted", assigned_agent_id: 3, property_id: 10, is_cash_buyer: false, timeframe: "1-3 months" },
  { id: 33, full_name: "Sebastian Krause", phone: "+49 89 555 6677", email: "s.krause@berlincapital.de", interested_in: "Aura Oceanfront Off-Plan 2BR", budget_aed: 9500000, preferred_community: "Dubai Harbour", lead_source: "Brochure Download", source_form: "Off-Plan Brochure Download", status: "Contacted", assigned_agent_id: 2, off_plan_id: 1, is_cash_buyer: true, timeframe: "1-3 months" },
  { id: 34, full_name: "Ananya Sharma", phone: "+91 99200 33445", email: "ananya@sharmagroup.in", interested_in: "Fountain Crest Luxury Suite", budget_aed: 5200000, preferred_community: "Downtown", lead_source: "Website Form", source_form: "Register Interest Modal", status: "New", assigned_agent_id: 2, property_id: 6, is_cash_buyer: false, timeframe: "1-3 months" },
  { id: 35, full_name: "Khalfan Al-Mazrouei", phone: "+971 50 777 8899", email: "khalfan@abudhabigroup.ae", interested_in: "The Palm Crown Grand Mansion", budget_aed: 64000000, preferred_community: "Palm Jumeirah", lead_source: "VIP Desk", source_form: "Property Detail Viewing", status: "Negotiating", assigned_agent_id: 1, property_id: 2, is_cash_buyer: true, timeframe: "Immediate (< 1 month)" },
  { id: 36, full_name: "Liam O'Connor", phone: "+353 1 496 0123", email: "liam@dublinwealth.ie", interested_in: "Serenity Garden Townhouse JVC", budget_aed: 3000000, preferred_community: "JVC", lead_source: "Mortgage Calculator", source_form: "Mortgage Advisor Request", status: "Contacted", assigned_agent_id: 3, property_id: 14, is_cash_buyer: false, timeframe: "3-6 months" },
  { id: 37, full_name: "Youssef El-Masry", phone: "+20 100 123 4567", email: "youssef@cairoholdings.eg", interested_in: "Grand Canal Mansion Off-Plan", budget_aed: 25000000, preferred_community: "Business Bay", lead_source: "Website Form", source_form: "Register Interest Modal", status: "Offer Made", assigned_agent_id: 2, off_plan_id: 2, is_cash_buyer: true, timeframe: "1-3 months" },
  { id: 38, full_name: "Natalia Kuznetsova", phone: "+7 812 555 9900", email: "natalia@petersburginvest.ru", interested_in: "The Royal Crescent Penthouse", budget_aed: 29000000, preferred_community: "Palm Jumeirah", lead_source: "Website Form", source_form: "Property Detail Enquiry", status: "New", assigned_agent_id: 1, property_id: 3, is_cash_buyer: true, timeframe: "1-3 months" },
  { id: 39, full_name: "Gordon Kingsley", phone: "+44 161 555 4321", email: "gordon@manchesterproperties.co.uk", interested_in: "Lumina Smart Horizon JVC", budget_aed: 1400000, preferred_community: "JVC", lead_source: "Call Me Back", source_form: "Call Me Back Widget", status: "Lost", assigned_agent_id: 3, property_id: 15, is_cash_buyer: false, timeframe: "Browsing" },
  { id: 40, full_name: "Ali Reza Pahlavi", phone: "+971 58 123 9988", email: "alireza@tehrancapital.ae", interested_in: "Downtown Pinnacle Penthouse", budget_aed: 34000000, preferred_community: "Downtown", lead_source: "VIP Desk", source_form: "Property Detail Viewing", status: "Viewing Scheduled", assigned_agent_id: 2, property_id: 4, is_cash_buyer: true, timeframe: "Immediate (< 1 month)" }
];

export const buyerLeadsData = rawLeads.map((l, index) => {
  const { score, temperature } = calculateLeadScore(l);
  // Stagger creation dates for realistic activity tracking
  const daysAgo = (index % 7);
  const date = new Date(Date.now() - daysAgo * 86400000);
  return {
    ...l,
    score,
    temperature,
    created_at: date.toISOString(),
    last_activity_at: (daysAgo >= 4 ? new Date(Date.now() - daysAgo * 86400000).toISOString() : new Date().toISOString())
  };
});

export const viewingsData = [
  { id: 1, property_id: 1, lead_id: 1, agent_id: 1, viewing_date: "2026-10-02", viewing_time: "11:00 AM", viewing_type: "In-Person", status: "Scheduled", feedback: "Client is flying in on private jet from London Heathrow." },
  { id: 2, property_id: 4, lead_id: 2, agent_id: 2, viewing_date: "2026-10-03", viewing_time: "04:30 PM", viewing_type: "In-Person", status: "Scheduled", feedback: "Requires sunset view of Burj Khalifa Fountains." },
  { id: 3, property_id: 2, lead_id: 6, agent_id: 1, viewing_date: "2026-10-04", viewing_time: "02:00 PM", viewing_type: "In-Person", status: "Scheduled", feedback: "Client requesting full security protocol and private yacht approach." },
  { id: 4, property_id: 11, lead_id: 4, agent_id: 3, viewing_date: "2026-10-05", viewing_time: "10:30 AM", viewing_type: "Virtual VIP Walkthrough", status: "Scheduled", feedback: "Geneva family office requested live 4K walkthrough of golf fairway." },
  { id: 5, property_id: 9, lead_id: 7, agent_id: 2, viewing_date: "2026-09-28", viewing_time: "03:00 PM", viewing_type: "In-Person", status: "Completed", feedback: "Client very impressed with Poggenpohl kitchen. Offer submitted." },
  { id: 6, property_id: 12, lead_id: 10, agent_id: 3, viewing_date: "2026-10-06", viewing_time: "05:00 PM", viewing_type: "In-Person", status: "Scheduled", feedback: "Family viewing with architect to review interior styling." },
  { id: 7, property_id: 3, lead_id: 17, agent_id: 1, viewing_date: "2026-10-07", viewing_time: "01:00 PM", viewing_type: "In-Person", status: "Scheduled", feedback: "Client inspecting full-floor penthouse acoustics and crescent views." },
  { id: 8, property_id: 7, lead_id: 8, agent_id: 1, viewing_date: "2026-09-27", viewing_time: "11:30 AM", viewing_type: "Virtual VIP Walkthrough", status: "Completed", feedback: "Contract draft sent to legal representatives in Singapore." },
  { id: 9, property_id: 11, lead_id: 25, agent_id: 3, viewing_date: "2026-10-08", viewing_time: "04:00 PM", viewing_type: "In-Person", status: "Scheduled", feedback: "Investor reviewing fairway orientation and plot boundary." },
  { id: 10, property_id: 4, lead_id: 40, agent_id: 2, viewing_date: "2026-10-09", viewing_time: "06:00 PM", viewing_type: "In-Person", status: "Scheduled", feedback: "Evening twilight viewing of Downtown skyline." }
];

export const salesData = [
  { id: 1, property_id: 1, lead_id: 13, property_title: "The Palm Horizon Beach Villa", buyer_name: "Nasser Al-Subaie", buyer_contact: "+966 50 555 1234", agent_id: 1, sale_price_aed: 45000000, commission_aed: 900000, sale_date: "2026-08-15", transaction_id: "DLD-TRX-2026-8921" },
  { id: 2, property_id: 4, lead_id: 21, property_title: "Downtown Pinnacle Penthouse", buyer_name: "Karan Johar", buyer_contact: "+91 98111 22334", agent_id: 2, sale_price_aed: 32500000, commission_aed: 650000, sale_date: "2026-08-28", transaction_id: "DLD-TRX-2026-9042" },
  { id: 3, property_id: 12, lead_id: 30, property_title: "Parkway Modernist Villa", buyer_name: "Reem Al-Falasi", buyer_contact: "+971 50 333 4455", agent_id: 3, sale_price_aed: 27000000, commission_aed: 540000, sale_date: "2026-09-10", transaction_id: "DLD-TRX-2026-9188" },
  { id: 4, property_id: 7, lead_id: 31, property_title: "The Marina Sky Duplex", buyer_name: "Arthur Pendelton", buyer_contact: "+1 312 555 4400", agent_id: 1, sale_price_aed: 16800000, commission_aed: 336000, sale_date: "2026-09-18", transaction_id: "DLD-TRX-2026-9240" },
  { id: 5, property_id: 15, lead_id: 12, property_title: "Lumina Smart Horizon JVC", buyer_name: "Oliver Sterling", buyer_contact: "+44 20 7946 0912", agent_id: 3, sale_price_aed: 1350000, commission_aed: 27000, sale_date: "2026-09-25", transaction_id: "DLD-TRX-2026-9315" }
];

export const notesData = [
  { id: 1, lead_id: 1, agent_id: 1, note_text: "Client requires escrow structuring via Emirates NBD and NDA for all site staff.", created_at: "2026-09-28T10:30:00Z" },
  { id: 2, lead_id: 2, agent_id: 2, note_text: "Prefers high floor with unobstructed fountain show perspective.", created_at: "2026-09-27T14:15:00Z" },
  { id: 3, lead_id: 3, agent_id: 2, note_text: "Interested in 60/40 payment plan with milestone linkage.", created_at: "2026-09-26T16:00:00Z" },
  { id: 4, lead_id: 4, agent_id: 3, note_text: "Client assessing UAE Golden Visa qualification for family of 4.", created_at: "2026-09-25T11:45:00Z" }
];
