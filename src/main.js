import './style.css';
import {
  propertiesData,
  offPlanProjectsData,
  developersData,
  agentsData,
  buyerLeadsData,
  viewingsData,
  salesData,
  calculateLeadScore
} from '../db/seed-data.js';

// Application State
const state = {
  properties: [...propertiesData],
  offPlanProjects: [...offPlanProjectsData],
  developers: [...developersData],
  agents: [...agentsData],
  leads: [...buyerLeadsData],
  viewings: [...viewingsData],
  sales: [...salesData],
  currentUser: null, // Admin user session
  currentPage: 'home',
  currentPropertyId: null,
  currentOffPlanId: null,
  filters: {
    location: 'all',
    type: 'all',
    bedrooms: 'all',
    maxPrice: 'all'
  },
  adminLeadFilters: {
    search: '',
    stage: 'all',
    temperature: 'all',
    agent: 'all'
  },
  unreadLeadsCount: 0,
  bellInterval: null
};

// DOM References
const appView = document.getElementById('app-view');
const header = document.getElementById('main-header');
const headerLogo = document.getElementById('header-logo');
const navLinks = document.querySelectorAll('.nav-link');
const mobileMenu = document.getElementById('mobile-menu');
const mobileToggle = document.getElementById('mobile-menu-toggle');
const mobileClose = document.getElementById('mobile-menu-close');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

// Modals
const registerModal = document.getElementById('register-modal');
const callbackModal = document.getElementById('callback-modal');
const brochureModal = document.getElementById('brochure-modal');
const thankyouModal = document.getElementById('thankyou-modal');
const wonDealModal = document.getElementById('won-deal-modal');
const propertyCrudModal = document.getElementById('property-crud-modal');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

// Floating Buttons
const floatingCallBackBtn = document.getElementById('floating-call-back-btn');
const floatingWhatsappBtn = document.getElementById('floating-whatsapp-btn');

// Utility: Currency Formatter (AED)
function formatAED(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return 'AED 0';
  return 'AED ' + Number(Math.round(amount)).toLocaleString('en-US');
}

// Global Standard Confirmation Message
const STANDARD_CONFIRMATION_MSG = "Thank you. A Jay Real Estate advisor will contact you within 24 hours.";

// Check local storage for session
function loadSession() {
  const saved = localStorage.getItem('jay_staff_user');
  if (saved) {
    try {
      state.currentUser = JSON.parse(saved);
    } catch (e) {
      state.currentUser = null;
    }
  }
}

// ==============================================================================
// ROUTER & NAVIGATION
// ==============================================================================

function navigate() {
  const hash = window.location.hash || '#home';
  window.scrollTo(0, 0);

  // Close mobile menu if open
  if (mobileMenu) {
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Update active nav link
  navLinks.forEach(link => {
    const pageTarget = link.getAttribute('href');
    if (pageTarget === hash || (hash.startsWith(pageTarget) && pageTarget !== '#home')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Admin Routes
  if (hash.startsWith('#admin')) {
    handleAdminRouting(hash);
    handleHeaderScroll();
    return;
  }

  // Public Routes
  if (hash === '#home' || hash === '' || hash === '#') {
    state.currentPage = 'home';
    renderHomePage();
  } else if (hash === '#properties') {
    state.currentPage = 'properties';
    renderPropertiesPage();
  } else if (hash.startsWith('#property/')) {
    const id = hash.replace('#property/', '');
    state.currentPage = 'property-detail';
    renderPropertyDetailPage(id);
  } else if (hash === '#off-plan') {
    state.currentPage = 'off-plan';
    renderOffPlanPage();
  } else if (hash.startsWith('#off-plan/')) {
    const id = hash.replace('#off-plan/', '');
    state.currentPage = 'offplan-detail';
    renderOffPlanDetailPage(id);
  } else if (hash === '#calculator') {
    state.currentPage = 'calculator';
    renderCalculatorPage();
  } else if (hash === '#sell') {
    state.currentPage = 'sell';
    renderSellPage();
  } else if (hash === '#about') {
    state.currentPage = 'about';
    renderAboutPage();
  } else if (hash === '#contact') {
    state.currentPage = 'contact';
    renderContactPage();
  } else {
    state.currentPage = 'home';
    renderHomePage();
  }

  handleHeaderScroll();
}

function handleHeaderScroll() {
  const isHome = state.currentPage === 'home';
  const isAdmin = state.currentPage.startsWith('admin');
  const scrolled = window.scrollY > 40;

  if (scrolled || !isHome || isAdmin) {
    header.classList.remove('header-transparent');
    header.classList.add('header-scrolled');
    const logoWrap = headerLogo.querySelector('.logo-wrap');
    if (logoWrap) {
      logoWrap.classList.remove('logo-white');
      logoWrap.classList.add('logo-charcoal');
    }
  } else {
    header.classList.remove('header-scrolled');
    header.classList.add('header-transparent');
    const logoWrap = headerLogo.querySelector('.logo-wrap');
    if (logoWrap) {
      logoWrap.classList.remove('logo-charcoal');
      logoWrap.classList.add('logo-white');
    }
  }
}

// ==============================================================================
// PUBLIC PAGES
// ==============================================================================

// PAGE 1: HOME PAGE
function renderHomePage() {
  const featuredProperties = state.properties.filter(p => p.featured && p.status !== 'Sold').slice(0, 6);
  const featuredOffPlan = state.offPlanProjects.filter(p => p.featured).slice(0, 3);

  appView.innerHTML = `
    <!-- Full-Screen Hero -->
    <section class="hero-section" id="hero">
      <div class="hero-bg-container">
        <img src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=2400&q=85" alt="Dubai Luxury Skyline" class="hero-bg-img">
        <div class="hero-overlay"></div>
      </div>
      
      <div class="hero-content">
        <div class="container hero-inner">
          <span class="hero-gold-label">DUBAI LUXURY REAL ESTATE</span>
          <h1 class="hero-heading">Live Where Luxury Meets the Skyline</h1>
          <p class="hero-subheading">
            Exclusive homes and off-plan investments across Dubai's most sought-after communities
          </p>
          <div class="hero-buttons">
            <a href="#properties" class="btn btn-primary">Explore Properties</a>
            <button class="btn btn-outline" id="home-btn-register">Register Interest</button>
          </div>

          <!-- Hero Quick Filter Bar -->
          <div class="hero-filter-bar">
            <div class="filter-item">
              <label class="filter-label">LOCATION</label>
              <select id="quick-location" class="filter-select">
                <option value="all">All Prime Areas</option>
                <option value="Palm Jumeirah">Palm Jumeirah</option>
                <option value="Downtown">Downtown Dubai</option>
                <option value="Dubai Marina">Dubai Marina</option>
                <option value="Business Bay">Business Bay</option>
                <option value="Dubai Hills">Dubai Hills</option>
                <option value="JVC">JVC</option>
              </select>
            </div>
            <div class="filter-item">
              <label class="filter-label">PROPERTY TYPE</label>
              <select id="quick-type" class="filter-select">
                <option value="all">All Types</option>
                <option value="Villa">Villas & Mansions</option>
                <option value="Penthouse">Penthouses</option>
                <option value="Apartment">Apartments</option>
                <option value="Duplex">Duplexes</option>
              </select>
            </div>
            <div class="filter-item">
              <label class="filter-label">BUDGET (AED)</label>
              <select id="quick-budget" class="filter-select">
                <option value="all">Any Price</option>
                <option value="5000000">Up to AED 5M</option>
                <option value="15000000">Up to AED 15M</option>
                <option value="35000000">Up to AED 35M</option>
                <option value="50000000">Up to AED 50M</option>
                <option value="50000001">Above AED 50M</option>
              </select>
            </div>
            <div class="filter-item">
              <label class="filter-label">BEDROOMS</label>
              <select id="quick-beds" class="filter-select">
                <option value="all">Any Beds</option>
                <option value="2">2 Beds</option>
                <option value="3">3 Beds</option>
                <option value="4">4 Beds</option>
                <option value="5">5+ Beds</option>
              </select>
            </div>
            <button class="btn btn-gold filter-search-btn" id="home-quick-search-btn">
              Find Residences
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Ready Properties -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <span class="section-label">DISCOVER</span>
          <h2 class="section-heading">Featured Ready Residences</h2>
          <p class="section-description">
            A curated portfolio of ultra-prime beachfront villas, penthouses, and private estates in Dubai.
          </p>
        </div>

        <div class="properties-grid">
          ${featuredProperties.map(p => renderPropertyCardHtml(p)).join('')}
        </div>

        <div style="text-align: center; margin-top: 3.5rem;">
          <a href="#properties" class="btn btn-outline-dark">View All Ready Properties (${state.properties.length})</a>
        </div>
      </div>
    </section>

    <!-- Featured Off-Plan Projects -->
    <section class="section bg-offwhite">
      <div class="container">
        <div class="section-header">
          <span class="section-label">OFF-PLAN PROJECTS</span>
          <h2 class="section-heading">Next-Generation Dubai Landmarks</h2>
          <p class="section-description">
            Secure exceptional capital appreciation with flexible developer milestone payment plans.
          </p>
        </div>

        <div class="offplan-grid">
          ${featuredOffPlan.map(p => renderOffPlanCardHtml(p)).join('')}
        </div>

        <div style="text-align: center; margin-top: 3.5rem;">
          <a href="#off-plan" class="btn btn-charcoal">Explore All Off-Plan Projects</a>
        </div>
      </div>
    </section>

    <!-- Why Invest in Dubai Section -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <span class="section-label">THE DUBAI ADVANTAGE</span>
          <h2 class="section-heading">Why Invest in Dubai Real Estate</h2>
          <p class="section-description">
            Dubai stands as one of the world's most resilient and profitable luxury real estate markets.
          </p>
        </div>

        <div class="why-invest-grid">
          <div class="why-card">
            <span class="why-icon-number">01</span>
            <h3 class="why-title">100% Tax-Free Returns</h3>
            <p class="why-text">
              Zero personal income tax, zero capital gains tax, and zero property tax. Retain 100% of your rental yields and capital gains.
            </p>
          </div>

          <div class="why-card">
            <span class="why-icon-number">02</span>
            <h3 class="why-title">High Rental Yields</h3>
            <p class="why-text">
              Dubai consistently outpaces London, New York, and Singapore, delivering net rental returns between 6.5% and 9.2% annually.
            </p>
          </div>

          <div class="why-card">
            <span class="why-icon-number">03</span>
            <h3 class="why-title">UAE 10-Year Golden Visa</h3>
            <p class="why-text">
              Property purchases of AED 2,000,000+ qualify investors and their immediate families for the renewable 10-Year UAE Golden Residency.
            </p>
          </div>

          <div class="why-card">
            <span class="why-icon-number">04</span>
            <h3 class="why-title">Global Safety & Stability</h3>
            <p class="why-text">
              Ranked among the world's top 3 safest cities with a dirham currency pegged securely to the US Dollar (USD).
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Popular Communities -->
    <section class="section bg-offwhite">
      <div class="container">
        <div class="section-header">
          <span class="section-label">PRIME LOCATIONS</span>
          <h2 class="section-heading">Dubai's Most Coveted Communities</h2>
          <p class="section-description">
            Explore premier neighborhoods offering world-class lifestyle and sustained appreciation.
          </p>
        </div>

        <div class="communities-grid">
          <div class="community-card" onclick="window.filterByCommunity('Palm Jumeirah')">
            <img src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1000&q=80" alt="Palm Jumeirah" class="community-bg">
            <div class="community-overlay"></div>
            <div class="community-info">
              <h3 class="community-name">Palm Jumeirah</h3>
              <p class="community-tagline">Iconic Beachfront Living & Mansions</p>
              <div class="community-meta"><span>From AED 28.5M</span><span>Billionaires' Row</span></div>
            </div>
          </div>

          <div class="community-card" onclick="window.filterByCommunity('Downtown')">
            <img src="https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1000&q=80" alt="Downtown Dubai" class="community-bg">
            <div class="community-overlay"></div>
            <div class="community-info">
              <h3 class="community-name">Downtown Dubai</h3>
              <p class="community-tagline">Burj Khalifa & Opera District</p>
              <div class="community-meta"><span>From AED 4.95M</span><span>Urban Penthouses</span></div>
            </div>
          </div>

          <div class="community-card" onclick="window.filterByCommunity('Dubai Marina')">
            <img src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80" alt="Dubai Marina" class="community-bg">
            <div class="community-overlay"></div>
            <div class="community-info">
              <h3 class="community-name">Dubai Marina</h3>
              <p class="community-tagline">Superyacht Promenade & Sky Duplexes</p>
              <div class="community-meta"><span>From AED 5.8M</span><span>Marina Front</span></div>
            </div>
          </div>

          <div class="community-card" onclick="window.filterByCommunity('Dubai Hills')">
            <img src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1000&q=80" alt="Dubai Hills" class="community-bg">
            <div class="community-overlay"></div>
            <div class="community-info">
              <h3 class="community-name">Dubai Hills Estate</h3>
              <p class="community-tagline">Championship Golf & Fairway Mansions</p>
              <div class="community-meta"><span>From AED 3.65M</span><span>Golf Course</span></div>
            </div>
          </div>

          <div class="community-card" onclick="window.filterByCommunity('Business Bay')">
            <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80" alt="Business Bay" class="community-bg">
            <div class="community-overlay"></div>
            <div class="community-info">
              <h3 class="community-name">Business Bay</h3>
              <p class="community-tagline">Dubai Water Canal Frontage</p>
              <div class="community-meta"><span>From AED 3.85M</span><span>Canal Views</span></div>
            </div>
          </div>

          <div class="community-card" onclick="window.filterByCommunity('JVC')">
            <img src="https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1000&q=80" alt="JVC" class="community-bg">
            <div class="community-overlay"></div>
            <div class="community-info">
              <h3 class="community-name">Jumeirah Village Circle (JVC)</h3>
              <p class="community-tagline">High-Yield Smart Residences (8.5%+ ROI)</p>
              <div class="community-meta"><span>From AED 1.25M</span><span>High ROI</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Register Interest CTA Banner -->
    <section class="section bg-charcoal-dark text-white">
      <div class="container">
        <div style="max-width: 780px; margin: 0 auto; text-align: center;">
          <span class="section-label">CONFIDENTIAL ADVISORY</span>
          <h2 class="section-heading text-white">Unlock Off-Market Dubai Allocations</h2>
          <div class="gold-separator" style="margin: 1.25rem auto;"></div>
          <p style="color: rgba(255,255,255,0.8); font-size: 1.05rem; margin-bottom: 2.5rem; line-height: 1.8;">
            Connect with a Senior Private Client Director for discrete access to off-market mansions and priority off-plan developer allocations before public launch.
          </p>
          <button class="btn btn-gold" id="home-banner-register-btn">Register Your Interest</button>
        </div>
      </div>
    </section>
  `;

  // Bind Home Events
  const homeRegisterBtn = document.getElementById('home-btn-register');
  if (homeRegisterBtn) homeRegisterBtn.addEventListener('click', openRegisterModal);

  const homeBannerRegisterBtn = document.getElementById('home-banner-register-btn');
  if (homeBannerRegisterBtn) homeBannerRegisterBtn.addEventListener('click', openRegisterModal);

  const homeQuickSearchBtn = document.getElementById('home-quick-search-btn');
  if (homeQuickSearchBtn) {
    homeQuickSearchBtn.addEventListener('click', () => {
      const loc = document.getElementById('quick-location').value;
      const type = document.getElementById('quick-type').value;
      const budget = document.getElementById('quick-budget').value;
      const beds = document.getElementById('quick-beds').value;

      state.filters.location = loc;
      state.filters.type = type;
      state.filters.maxPrice = budget;
      state.filters.bedrooms = beds;

      window.location.hash = '#properties';
    });
  }
}

// PAGE 2: PROPERTIES CATALOG PAGE
function renderPropertiesPage() {
  const filtered = getFilteredProperties();

  appView.innerHTML = `
    <div class="subpage-hero">
      <div class="subpage-hero-overlay"></div>
      <div class="container">
        <span class="section-label">CURATED COLLECTION</span>
        <h1 class="hero-heading">Ready Luxury Properties</h1>
        <p class="hero-subheading">
          Explore luxury villas, sky penthouses, and prime ready homes in Dubai.
        </p>
      </div>
    </div>

    <section class="section">
      <div class="container">
        <!-- Interactive Multi-Facet Filter Bar -->
        <div class="catalog-filter-bar">
          <div class="filter-field">
            <label>COMMUNITY</label>
            <select id="prop-filter-location" class="filter-input-select">
              <option value="all" ${state.filters.location === 'all' ? 'selected' : ''}>All Communities</option>
              <option value="Palm Jumeirah" ${state.filters.location === 'Palm Jumeirah' ? 'selected' : ''}>Palm Jumeirah</option>
              <option value="Downtown" ${state.filters.location === 'Downtown' ? 'selected' : ''}>Downtown Dubai</option>
              <option value="Dubai Marina" ${state.filters.location === 'Dubai Marina' ? 'selected' : ''}>Dubai Marina</option>
              <option value="Business Bay" ${state.filters.location === 'Business Bay' ? 'selected' : ''}>Business Bay</option>
              <option value="Dubai Hills" ${state.filters.location === 'Dubai Hills' ? 'selected' : ''}>Dubai Hills</option>
              <option value="JVC" ${state.filters.location === 'JVC' ? 'selected' : ''}>JVC</option>
            </select>
          </div>

          <div class="filter-field">
            <label>PROPERTY TYPE</label>
            <select id="prop-filter-type" class="filter-input-select">
              <option value="all" ${state.filters.type === 'all' ? 'selected' : ''}>All Types</option>
              <option value="Villa" ${state.filters.type === 'Villa' ? 'selected' : ''}>Villa</option>
              <option value="Mansion" ${state.filters.type === 'Mansion' ? 'selected' : ''}>Mansion</option>
              <option value="Penthouse" ${state.filters.type === 'Penthouse' ? 'selected' : ''}>Penthouse</option>
              <option value="Duplex" ${state.filters.type === 'Duplex' ? 'selected' : ''}>Duplex</option>
              <option value="Apartment" ${state.filters.type === 'Apartment' ? 'selected' : ''}>Apartment</option>
            </select>
          </div>

          <div class="filter-field">
            <label>BEDROOMS</label>
            <select id="prop-filter-beds" class="filter-input-select">
              <option value="all" ${state.filters.bedrooms === 'all' ? 'selected' : ''}>Any Bedrooms</option>
              <option value="2" ${state.filters.bedrooms === '2' ? 'selected' : ''}>2 Bedrooms</option>
              <option value="3" ${state.filters.bedrooms === '3' ? 'selected' : ''}>3 Bedrooms</option>
              <option value="4" ${state.filters.bedrooms === '4' ? 'selected' : ''}>4 Bedrooms</option>
              <option value="5" ${state.filters.bedrooms === '5' ? 'selected' : ''}>5 Bedrooms</option>
              <option value="6" ${state.filters.bedrooms === '6' ? 'selected' : ''}>6+ Bedrooms</option>
            </select>
          </div>

          <div class="filter-field">
            <label>MAX BUDGET (AED)</label>
            <select id="prop-filter-price" class="filter-input-select">
              <option value="all" ${state.filters.maxPrice === 'all' ? 'selected' : ''}>Any Price</option>
              <option value="5000000" ${state.filters.maxPrice === '5000000' ? 'selected' : ''}>Up to AED 5,000,000</option>
              <option value="15000000" ${state.filters.maxPrice === '15000000' ? 'selected' : ''}>Up to AED 15,000,000</option>
              <option value="35000000" ${state.filters.maxPrice === '35000000' ? 'selected' : ''}>Up to AED 35,000,000</option>
              <option value="50000000" ${state.filters.maxPrice === '50000000' ? 'selected' : ''}>Up to AED 50,000,000</option>
              <option value="50000001" ${state.filters.maxPrice === '50000001' ? 'selected' : ''}>Above AED 50,000,000</option>
            </select>
          </div>

          <button class="btn btn-gold" id="btn-reset-filters" style="padding: 11px 24px;">Reset</button>
        </div>

        <!-- Property Cards Grid -->
        <div class="properties-grid" id="catalog-grid">
          ${filtered.length > 0 ? filtered.map(p => renderPropertyCardHtml(p)).join('') : `
            <div style="grid-column: 1/-1; text-align: center; padding: 5rem 1rem; color: var(--color-warm-gray);">
              <p style="font-size: 1.2rem; margin-bottom: 1.5rem;">No properties match your exact search criteria.</p>
              <button class="btn btn-outline-dark" onclick="window.resetCatalogFilters()">Clear All Filters</button>
            </div>
          `}
        </div>
      </div>
    </section>
  `;

  const locSelect = document.getElementById('prop-filter-location');
  const typeSelect = document.getElementById('prop-filter-type');
  const bedsSelect = document.getElementById('prop-filter-beds');
  const priceSelect = document.getElementById('prop-filter-price');
  const resetBtn = document.getElementById('btn-reset-filters');

  function updateFilters() {
    state.filters.location = locSelect.value;
    state.filters.type = typeSelect.value;
    state.filters.bedrooms = bedsSelect.value;
    state.filters.maxPrice = priceSelect.value;
    renderPropertiesPage();
  }

  if (locSelect) locSelect.addEventListener('change', updateFilters);
  if (typeSelect) typeSelect.addEventListener('change', updateFilters);
  if (bedsSelect) bedsSelect.addEventListener('change', updateFilters);
  if (priceSelect) priceSelect.addEventListener('change', updateFilters);
  if (resetBtn) resetBtn.addEventListener('click', window.resetCatalogFilters);
}

function getFilteredProperties() {
  return state.properties.filter(p => {
    if (state.filters.location !== 'all' && p.location !== state.filters.location) return false;
    if (state.filters.type !== 'all' && p.property_type !== state.filters.type) return false;
    if (state.filters.bedrooms !== 'all') {
      const beds = parseInt(state.filters.bedrooms, 10);
      if (beds === 6 ? p.bedrooms < 6 : p.bedrooms !== beds) return false;
    }
    if (state.filters.maxPrice !== 'all') {
      const max = Number(state.filters.maxPrice);
      if (max === 50000001) {
        if (p.price_aed <= 50000000) return false;
      } else {
        if (p.price_aed > max) return false;
      }
    }
    return true;
  });
}

window.resetCatalogFilters = () => {
  state.filters = { location: 'all', type: 'all', bedrooms: 'all', maxPrice: 'all' };
  renderPropertiesPage();
};

window.filterByCommunity = (commName) => {
  state.filters.location = commName;
  state.filters.type = 'all';
  state.filters.bedrooms = 'all';
  state.filters.maxPrice = 'all';
  window.location.hash = '#properties';
};

function renderPropertyCardHtml(p) {
  const isSold = p.status === 'Sold';
  return `
    <div class="property-card" onclick="window.location.hash='#property/${p.id}'" style="${isSold ? 'opacity: 0.75;' : ''}">
      <div class="property-img-wrap">
        <img src="${p.image_url}" alt="${p.title}" class="property-img" loading="lazy">
        <span class="property-badge" style="${isSold ? 'background-color: #C0392B;' : ''}">${p.status}</span>
        <span class="property-type-tag">${p.tag || p.property_type}</span>
      </div>
      <div class="property-info">
        <span class="property-location">${p.location} • ${p.sub_location || ''}</span>
        <h3 class="property-name">${p.title}</h3>
        <div class="card-gold-line"></div>
        <div class="property-specs">
          <span class="spec-item"><strong>${p.bedrooms}</strong> Beds</span>
          <span>•</span>
          <span class="spec-item"><strong>${p.bathrooms}</strong> Baths</span>
          <span>•</span>
          <span class="spec-item">${Number(p.area_sqft).toLocaleString()} sq ft</span>
        </div>
        <div class="property-footer">
          <div class="property-price-wrap">
            <span class="price-label">FROM</span>
            <span class="price-amount">${formatAED(p.price_aed)}</span>
          </div>
          <button class="btn btn-outline-dark btn-sm">${isSold ? 'View Sold Dossier' : 'View Details'}</button>
        </div>
      </div>
    </div>
  `;
}

// PAGE: SINGLE PROPERTY DETAIL VIEW
function renderPropertyDetailPage(id) {
  const prop = state.properties.find(p => p.id == id || p.slug === id) || state.properties[0];
  const agent = state.agents.find(a => a.id === prop.assigned_agent_id) || state.agents[1] || state.agents[0];

  const galleryList = Array.isArray(prop.gallery_urls) && prop.gallery_urls.length > 0
    ? prop.gallery_urls
    : [prop.image_url];

  const amenitiesList = Array.isArray(prop.amenities)
    ? prop.amenities
    : ["Private Beach", "Infinity Pool", "Smart Home", "Concierge 24/7", "Private Parking"];

  appView.innerHTML = `
    <div class="detail-view-container">
      <div class="detail-hero-gallery">
        <img src="${galleryList[0]}" alt="${prop.title}" class="gallery-main-img" id="detail-main-img">
      </div>

      <div class="container">
        <div class="gallery-thumbnails">
          ${galleryList.map((img, idx) => `
            <img src="${img}" alt="Thumbnail ${idx + 1}" class="gallery-thumb ${idx === 0 ? 'active' : ''}" onclick="window.switchDetailImg('${img}', this)">
          `).join('')}
        </div>

        <div class="detail-layout-grid">
          <div class="detail-main-content">
            <span class="detail-eyebrow">${prop.location} • ${prop.sub_location || ''}</span>
            <h1 class="detail-title">${prop.title}</h1>
            <div class="detail-price-badge">${formatAED(prop.price_aed)}</div>

            <div class="card-gold-line"></div>

            <div class="specs-table-box">
              <div class="spec-box-item">
                <span class="spec-box-label">PROPERTY TYPE</span>
                <span class="spec-box-val">${prop.property_type}</span>
              </div>
              <div class="spec-box-item">
                <span class="spec-box-label">BEDROOMS</span>
                <span class="spec-box-val">${prop.bedrooms} Suites</span>
              </div>
              <div class="spec-box-item">
                <span class="spec-box-label">BATHROOMS</span>
                <span class="spec-box-val">${prop.bathrooms}</span>
              </div>
              <div class="spec-box-item">
                <span class="spec-box-label">BUA AREA</span>
                <span class="spec-box-val">${Number(prop.area_sqft).toLocaleString()} sq ft</span>
              </div>
              ${prop.plot_sqft ? `
                <div class="spec-box-item">
                  <span class="spec-box-label">PLOT SIZE</span>
                  <span class="spec-box-val">${Number(prop.plot_sqft).toLocaleString()} sq ft</span>
                </div>
              ` : ''}
              <div class="spec-box-item">
                <span class="spec-box-label">STATUS</span>
                <span class="spec-box-val" style="${prop.status === 'Sold' ? 'color: #C0392B;' : ''}">${prop.status}</span>
              </div>
            </div>

            <h3 style="font-family: var(--font-heading); font-size: 1.8rem; font-weight: 300; margin: 1.5rem 0 0.75rem 0;">
              Architectural Overview
            </h3>
            <p style="font-size: 1rem; color: var(--color-warm-gray); line-height: 1.8; margin-bottom: 2.5rem;">
              ${prop.description}
            </p>

            <h3 style="font-family: var(--font-heading); font-size: 1.8rem; font-weight: 300; margin-bottom: 1.25rem;">
              Signature Features & Amenities
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 3rem;">
              ${amenitiesList.map(a => `
                <div style="display: flex; align-items: center; gap: 0.6rem; font-size: 0.9rem; color: var(--color-charcoal);">
                  <span style="color: var(--color-gold); font-weight: bold;">✓</span> ${a}
                </div>
              `).join('')}
            </div>

            <!-- Assigned Private Client Advisor Card -->
            <div style="background-color: var(--color-offwhite); border: 1px solid var(--color-light-gray); padding: 2rem; display: flex; gap: 1.5rem; align-items: center; flex-wrap: wrap;">
              <img src="${agent.photo_url}" alt="${agent.full_name}" style="width: 80px; height: 80px; object-fit: cover; border: 1px solid var(--color-gold);">
              <div style="flex-grow: 1;">
                <span style="font-size: 0.62rem; font-weight: 600; letter-spacing: 0.2em; color: var(--color-gold); text-transform: uppercase;">ASSIGNED PRIVATE CLIENT ADVISOR</span>
                <h4 style="font-family: var(--font-heading); font-size: 1.4rem; color: var(--color-charcoal);">${agent.full_name}</h4>
                <p style="font-size: 0.8rem; color: var(--color-warm-gray);">${agent.title} • ${agent.rera_number}</p>
                <p style="font-size: 0.82rem; margin-top: 0.25rem;">Direct: <strong>${agent.phone}</strong></p>
              </div>
            </div>
          </div>

          <!-- Sidebar Forms: Book a Viewing & Enquire -->
          <div class="detail-sidebar">
            <!-- Form 1: Book a Viewing -->
            <div class="sidebar-form-card highlight">
              <span class="section-label">PRIVATE APPOINTMENT</span>
              <h3 class="sidebar-form-title">Book a Private Viewing</h3>
              <p class="sidebar-form-desc">Schedule a discrete in-person tour or a 4K virtual video walkthrough.</p>
              
              <form id="viewing-booking-form" class="luxury-form">
                <input type="text" name="_gotcha" class="honeypot" tabindex="-1" autocomplete="off">
                <input type="hidden" name="property_id" value="${prop.id}">
                <input type="hidden" name="source_form" value="Property Detail Viewing">
                
                <div class="form-group">
                  <label class="form-label">YOUR FULL NAME <span class="req">*</span></label>
                  <input type="text" name="full_name" class="form-input" placeholder="Full name" required minlength="2">
                </div>

                <div class="form-group">
                  <label class="form-label">PHONE NUMBER / WHATSAPP <span class="req">*</span></label>
                  <input type="tel" name="phone" class="form-input" placeholder="+971 50 000 0000" required>
                </div>

                <div class="form-group">
                  <label class="form-label">PREFERRED DATE <span class="req">*</span></label>
                  <input type="date" name="viewing_date" class="form-input" required value="${new Date(Date.now() + 86400000).toISOString().split('T')[0]}">
                </div>

                <div class="form-group">
                  <label class="form-label">PREFERRED TIME SLOT <span class="req">*</span></label>
                  <select name="viewing_time" class="form-select">
                    <option value="11:00 AM">11:00 AM (Morning)</option>
                    <option value="02:30 PM">02:30 PM (Afternoon)</option>
                    <option value="05:30 PM">05:30 PM (Sunset / Twilight)</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">VIEWING FORMAT</label>
                  <select name="viewing_type" class="form-select">
                    <option value="In-Person Private Tour">In-Person Private Tour</option>
                    <option value="Virtual 4K VIP Video Walkthrough">Virtual 4K VIP Video Walkthrough</option>
                  </select>
                </div>

                <button type="submit" class="btn btn-gold btn-block">Confirm Appointment</button>
              </form>
            </div>

            <!-- Form 2: Enquire / Private Dossier -->
            <div class="sidebar-form-card">
              <span class="section-label">INQUIRY DESK</span>
              <h3 class="sidebar-form-title">Enquire About Residence</h3>
              <p class="sidebar-form-desc">Request floorplans, deeds, or financing advisory.</p>

              <form id="prop-enquiry-form" class="luxury-form">
                <input type="text" name="_gotcha" class="honeypot" tabindex="-1" autocomplete="off">
                <input type="hidden" name="property_id" value="${prop.id}">
                <input type="hidden" name="interested_in" value="Inquiry for ${prop.title}">
                <input type="hidden" name="source_form" value="Property Detail Enquiry">

                <div class="form-group">
                  <label class="form-label">NAME <span class="req">*</span></label>
                  <input type="text" name="full_name" class="form-input" placeholder="Your name" required minlength="2">
                </div>

                <div class="form-group">
                  <label class="form-label">WHATSAPP / PHONE <span class="req">*</span></label>
                  <input type="tel" name="phone" class="form-input" placeholder="+971 50 000 0000" required>
                </div>

                <div class="form-group">
                  <label class="form-label">TIMEFRAME</label>
                  <select name="timeframe" class="form-select">
                    <option value="Immediate (Under 1 month)">Immediate (Under 1 Month)</option>
                    <option value="1-3 months">1-3 Months</option>
                    <option value="3-6 months">3-6 Months</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">QUESTIONS OR SPECIFIC REQUESTS</label>
                  <textarea name="notes" class="form-textarea" placeholder="e.g. Please share detailed floor plans and escrow transfer requirements."></textarea>
                </div>

                <button type="submit" class="btn btn-charcoal btn-block">Submit Inquiry</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const viewingForm = document.getElementById('viewing-booking-form');
  if (viewingForm) {
    viewingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleGenericFormSubmit(viewingForm, '/api/viewings', 'Property Detail Viewing');
    });
  }

  const enquiryForm = document.getElementById('prop-enquiry-form');
  if (enquiryForm) {
    enquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleGenericFormSubmit(enquiryForm, '/api/leads', 'Property Detail Enquiry');
    });
  }
}

window.switchDetailImg = (src, thumbEl) => {
  const mainImg = document.getElementById('detail-main-img');
  if (mainImg) mainImg.src = src;
  document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
  if (thumbEl) thumbEl.classList.add('active');
};

// PAGE 3: OFF-PLAN PROJECTS CATALOG PAGE
function renderOffPlanPage() {
  appView.innerHTML = `
    <div class="subpage-hero">
      <div class="subpage-hero-overlay"></div>
      <div class="container">
        <span class="section-label">UPCOMING DUBAI LANDMARKS</span>
        <h1 class="hero-heading">Off-Plan Developments</h1>
        <p class="hero-subheading">
          Direct developer allocations, milestone payment plans, and superior capital growth in Dubai.
        </p>
      </div>
    </div>

    <section class="section">
      <div class="container">
        <div class="offplan-grid">
          ${state.offPlanProjects.map(p => renderOffPlanCardHtml(p)).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderOffPlanCardHtml(p) {
  return `
    <div class="offplan-card" onclick="window.location.hash='#off-plan/${p.id}'">
      <div class="offplan-card-img-wrap">
        <img src="${p.image_url}" alt="${p.name}" class="offplan-card-img" loading="lazy">
        <span class="property-badge">${p.handover_date}</span>
      </div>
      <div class="offplan-card-body">
        <span class="offplan-dev-badge">${p.developer_name || 'Prime Developer'}</span>
        <span class="property-location">${p.location}</span>
        <h3 class="property-name">${p.name}</h3>
        <p style="font-size: 0.85rem; color: var(--color-warm-gray); line-height: 1.6; margin-bottom: 1rem;">
          ${p.units_type}
        </p>

        <div class="offplan-meta-row">
          <div class="offplan-meta-item">
            <span class="offplan-meta-label">STARTING PRICE</span>
            <span class="offplan-meta-val">${formatAED(p.starting_price_aed)}</span>
          </div>
          <div class="offplan-meta-item">
            <span class="offplan-meta-label">PAYMENT PLAN</span>
            <span class="offplan-meta-val">${p.payment_plan}</span>
          </div>
          <div class="offplan-meta-item">
            <span class="offplan-meta-label">HANDOVER</span>
            <span class="offplan-meta-val">${p.handover_date}</span>
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem; margin-top: auto;">
          <button class="btn btn-charcoal btn-sm btn-block">Explore Project</button>
        </div>
      </div>
    </div>
  `;
}

// PAGE: SINGLE OFF-PLAN PROJECT DETAIL VIEW
function renderOffPlanDetailPage(id) {
  const proj = state.offPlanProjects.find(p => p.id == id || p.slug === id) || state.offPlanProjects[0];
  const milestones = Array.isArray(proj.payment_milestones) ? proj.payment_milestones : [
    { milestone: "On Booking", percentage: 10 },
    { milestone: "During Construction", percentage: 50 },
    { milestone: "On Handover", percentage: 40 }
  ];

  const features = Array.isArray(proj.features) ? proj.features : [
    "Private Beach Access", "Infinity Pool", "State of the Art Fitness Studio", "Valet Parking"
  ];

  appView.innerHTML = `
    <div class="detail-view-container">
      <div class="detail-hero-gallery">
        <img src="${proj.image_url}" alt="${proj.name}" class="gallery-main-img">
      </div>

      <div class="container">
        <div class="detail-layout-grid">
          <div class="detail-main-content">
            <span class="detail-eyebrow">${proj.location} • DEVELOPED BY ${proj.developer_name}</span>
            <h1 class="detail-title">${proj.name}</h1>
            <div class="detail-price-badge">Starting from ${formatAED(proj.starting_price_aed)}</div>

            <div class="card-gold-line"></div>

            <div class="specs-table-box">
              <div class="spec-box-item">
                <span class="spec-box-label">ESTIMATED HANDOVER</span>
                <span class="spec-box-val">${proj.handover_date}</span>
              </div>
              <div class="spec-box-item">
                <span class="spec-box-label">PAYMENT STRUCTURE</span>
                <span class="spec-box-val">${proj.payment_plan}</span>
              </div>
              <div class="spec-box-item">
                <span class="spec-box-label">UNIT TYPES</span>
                <span class="spec-box-val">${proj.units_type}</span>
              </div>
            </div>

            <h3 style="font-family: var(--font-heading); font-size: 1.8rem; font-weight: 300; margin: 1.5rem 0 0.75rem 0;">
              Project Vision & Concept
            </h3>
            <p style="font-size: 1rem; color: var(--color-warm-gray); line-height: 1.8; margin-bottom: 2rem;">
              ${proj.description}
            </p>

            <h3 style="font-family: var(--font-heading); font-size: 1.8rem; font-weight: 300; margin-bottom: 1rem;">
              Payment Milestone Breakdown
            </h3>
            <div class="milestones-container">
              ${milestones.map(m => `
                <div class="milestone-bar-wrap">
                  <div class="milestone-info">
                    <span>${m.milestone}</span>
                    <strong style="color: var(--color-gold);">${m.percentage}%</strong>
                  </div>
                  <div class="milestone-progress">
                    <div class="milestone-fill" style="width: ${m.percentage}%;"></div>
                  </div>
                </div>
              `).join('')}
            </div>

            <h3 style="font-family: var(--font-heading); font-size: 1.8rem; font-weight: 300; margin: 2rem 0 1rem 0;">
              Masterplan Lifestyle & Facilities
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 3rem;">
              ${features.map(f => `
                <div style="display: flex; align-items: center; gap: 0.6rem; font-size: 0.9rem; color: var(--color-charcoal);">
                  <span style="color: var(--color-gold); font-weight: bold;">✓</span> ${f}
                </div>
              `).join('')}
            </div>
          </div>

          <div class="detail-sidebar">
            <div class="sidebar-form-card highlight">
              <span class="section-label">INVESTMENT DOSSIER</span>
              <h3 class="sidebar-form-title">Download Masterplan Brochure</h3>
              <p class="sidebar-form-desc">Instant access to unit floorplans, price lists, and developer payment schedules.</p>

              <form id="project-brochure-download-form" class="luxury-form">
                <input type="text" name="_gotcha" class="honeypot" tabindex="-1" autocomplete="off">
                <input type="hidden" name="off_plan_id" value="${proj.id}">
                <input type="hidden" name="interested_in" value="Brochure for ${proj.name}">
                <input type="hidden" name="source_form" value="Off-Plan Brochure Download">

                <div class="form-group">
                  <label class="form-label">FULL NAME <span class="req">*</span></label>
                  <input type="text" name="full_name" class="form-input" placeholder="Your name" required minlength="2">
                </div>

                <div class="form-group">
                  <label class="form-label">PHONE NUMBER / WHATSAPP <span class="req">*</span></label>
                  <input type="tel" name="phone" class="form-input" placeholder="+971 50 000 0000" required>
                </div>

                <div class="form-group">
                  <label class="form-label">INVESTMENT PROFILE</label>
                  <select name="investor_type" class="form-select">
                    <option value="Private Investor (High ROI)">Private Investor (High ROI)</option>
                    <option value="End-User / Family Home">End-User / Family Home</option>
                    <option value="International Family Office">International Family Office</option>
                  </select>
                </div>

                <button type="submit" class="btn btn-gold btn-block">Download Brochure</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const brochureForm = document.getElementById('project-brochure-download-form');
  if (brochureForm) {
    brochureForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleGenericFormSubmit(brochureForm, '/api/leads', 'Off-Plan Brochure Download');
    });
  }
}

// PAGE 4: MORTGAGE CALCULATOR
function renderCalculatorPage() {
  appView.innerHTML = `
    <div class="subpage-hero">
      <div class="subpage-hero-overlay"></div>
      <div class="container">
        <span class="section-label">FINANCIAL ADVISORY</span>
        <h1 class="hero-heading">Dubai Mortgage Calculator</h1>
        <p class="hero-subheading">
          Calculate estimated monthly payments in AED and full acquisition costs under UAE Central Bank guidelines.
        </p>
      </div>
    </div>

    <section class="section">
      <div class="container">
        <div class="calc-wrapper">
          <div class="calc-inputs-panel">
            <div class="calc-group">
              <div class="calc-group-header">
                <label for="page-calc-price" class="calc-label">PROPERTY PURCHASE PRICE (AED)</label>
                <span class="calc-val-display" id="page-calc-price-display">AED 25,000,000</span>
              </div>
              <input type="range" id="page-calc-price" min="1500000" max="100000000" step="500000" value="25000000" class="calc-slider">
              <div class="calc-range-marks">
                <span>AED 1.5M</span>
                <span>AED 50M</span>
                <span>AED 100M</span>
              </div>
            </div>

            <div class="calc-group">
              <div class="calc-group-header">
                <label for="page-calc-downpayment" class="calc-label">DOWN PAYMENT (%)</label>
                <span class="calc-val-display" id="page-calc-downpayment-display">20% (AED 5,000,000)</span>
              </div>
              <input type="range" id="page-calc-downpayment" min="15" max="80" step="5" value="20" class="calc-slider">
              <div class="calc-range-marks">
                <span>15% (Min UAE Resident)</span>
                <span>20% (Standard Non-Resident)</span>
                <span>50%+</span>
              </div>
            </div>

            <div class="calc-row">
              <div class="calc-group half">
                <div class="calc-group-header">
                  <label for="page-calc-term" class="calc-label">LOAN DURATION</label>
                  <span class="calc-val-display" id="page-calc-term-display">25 Years</span>
                </div>
                <select id="page-calc-term" class="form-select">
                  <option value="5">5 Years</option>
                  <option value="10">10 Years</option>
                  <option value="15">15 Years</option>
                  <option value="20">20 Years</option>
                  <option value="25" selected>25 Years (Max Term)</option>
                </select>
              </div>

              <div class="calc-group half">
                <div class="calc-group-header">
                  <label for="page-calc-interest" class="calc-label">INTEREST RATE (%)</label>
                  <span class="calc-val-display" id="page-calc-interest-display">4.25%</span>
                </div>
                <input type="number" id="page-calc-interest" min="1.0" max="12.0" step="0.05" value="4.25" class="form-input">
              </div>
            </div>

            <div style="margin-top: 1.5rem; padding: 2rem; background-color: var(--color-offwhite); border: 1px solid var(--color-light-gray);">
              <span class="section-label">FINANCING PRE-APPROVAL</span>
              <h3 style="font-family: var(--font-heading); font-size: 1.5rem; margin-bottom: 0.5rem;">Speak with a Mortgage Specialist</h3>
              <p style="font-size: 0.82rem; color: var(--color-warm-gray); margin-bottom: 1.25rem;">We negotiate prime rates across Emirates NBD, FAB, and Dubai Islamic Bank.</p>

              <form id="calc-advisor-form" class="luxury-form">
                <input type="text" name="_gotcha" class="honeypot" tabindex="-1" autocomplete="off">
                <input type="hidden" name="source_form" value="Mortgage Advisor Request">
                <input type="hidden" name="interested_in" value="Mortgage Financing Advisory">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                  <input type="text" name="full_name" class="form-input" placeholder="Your Name" required minlength="2">
                  <input type="tel" name="phone" class="form-input" placeholder="WhatsApp / Phone" required>
                </div>
                <button type="submit" class="btn btn-gold btn-block" style="margin-top: 0.5rem;">Connect with Mortgage Desk</button>
              </form>
            </div>
          </div>

          <div class="calc-results-card">
            <div>
              <span class="results-label">ESTIMATED MONTHLY COMMITMENT</span>
              <div class="results-monthly-payment" id="page-res-monthly">AED 108,350</div>
              <span class="results-sub" id="page-res-sub">Per month for 25 years</span>
            </div>

            <div class="gold-separator"></div>

            <div class="breakdown-list">
              <div class="breakdown-row">
                <span>Loan Principal Amount</span>
                <strong id="page-res-loan">AED 20,000,000</strong>
              </div>
              <div class="breakdown-row">
                <span>Down Payment Required</span>
                <strong id="page-res-down">AED 5,000,000</strong>
              </div>
              <div class="breakdown-row">
                <span>Dubai Land Dept (DLD 4%) Fee</span>
                <strong id="page-res-dld">AED 1,000,000</strong>
              </div>
              <div class="breakdown-row">
                <span>Mortgage Registration (0.25%)</span>
                <strong id="page-res-reg">AED 50,000</strong>
              </div>
              <div class="breakdown-row">
                <span>Property Valuation & Admin</span>
                <strong>AED 4,000</strong>
              </div>
              <div class="breakdown-row total-row">
                <span>Estimated Upfront Acquisition Capital</span>
                <strong id="page-res-upfront" class="gold-text">AED 6,054,000</strong>
              </div>
            </div>

            <button class="btn btn-primary btn-block" onclick="window.openCallbackModal()">
              Request Official Pre-Approval
            </button>
          </div>
        </div>
      </div>
    </section>
  `;

  setupPageCalculatorMath();

  const advisorForm = document.getElementById('calc-advisor-form');
  if (advisorForm) {
    advisorForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleGenericFormSubmit(advisorForm, '/api/leads', 'Mortgage Advisor Request');
    });
  }
}

function setupPageCalculatorMath() {
  const priceInput = document.getElementById('page-calc-price');
  const priceDisplay = document.getElementById('page-calc-price-display');
  const downInput = document.getElementById('page-calc-downpayment');
  const downDisplay = document.getElementById('page-calc-downpayment-display');
  const termSelect = document.getElementById('page-calc-term');
  const termDisplay = document.getElementById('page-calc-term-display');
  const interestInput = document.getElementById('page-calc-interest');
  const interestDisplay = document.getElementById('page-calc-interest-display');

  const resMonthly = document.getElementById('page-res-monthly');
  const resSub = document.getElementById('page-res-sub');
  const resLoan = document.getElementById('page-res-loan');
  const resDown = document.getElementById('page-res-down');
  const resDld = document.getElementById('page-res-dld');
  const resReg = document.getElementById('page-res-reg');
  const resUpfront = document.getElementById('page-res-upfront');

  if (!priceInput) return;

  function recalculate() {
    const price = Number(priceInput.value);
    const downPercent = Number(downInput.value);
    const termYears = Number(termSelect.value);
    const annualRate = Number(interestInput.value);

    priceDisplay.textContent = formatAED(price);
    const downAmount = (price * downPercent) / 100;
    downDisplay.textContent = `${downPercent}% (${formatAED(downAmount)})`;
    termDisplay.textContent = `${termYears} Years`;
    interestDisplay.textContent = `${annualRate.toFixed(2)}%`;

    const loanAmount = price - downAmount;
    const monthlyRate = (annualRate / 100) / 12;
    const numberOfPayments = termYears * 12;

    let monthlyPayment = 0;
    if (monthlyRate > 0) {
      monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    } else {
      monthlyPayment = loanAmount / numberOfPayments;
    }

    const dldFee = price * 0.04;
    const mortgageRegFee = loanAmount * 0.0025;
    const upfrontTotal = downAmount + dldFee + mortgageRegFee + 4000;

    resMonthly.textContent = formatAED(monthlyPayment);
    resSub.textContent = `Per month for ${termYears} years`;
    resLoan.textContent = formatAED(loanAmount);
    resDown.textContent = formatAED(downAmount);
    resDld.textContent = formatAED(dldFee);
    resReg.textContent = formatAED(mortgageRegFee);
    resUpfront.textContent = formatAED(upfrontTotal);
  }

  priceInput.addEventListener('input', recalculate);
  downInput.addEventListener('input', recalculate);
  termSelect.addEventListener('change', recalculate);
  interestInput.addEventListener('input', recalculate);

  recalculate();
}

// PAGE 5: SELL YOUR PROPERTY
function renderSellPage() {
  appView.innerHTML = `
    <div class="subpage-hero">
      <div class="subpage-hero-overlay"></div>
      <div class="container">
        <span class="section-label">PRIVATE CLIENT ADVISORY</span>
        <h1 class="hero-heading">Sell Your Dubai Luxury Property</h1>
        <p class="hero-subheading">
          Discrete off-market placement, global wealth networks, and record-setting valuations.
        </p>
      </div>
    </div>

    <section class="section">
      <div class="container">
        <div class="sell-container">
          <div class="sell-content">
            <span class="section-label">EXPERT VALUATION</span>
            <h2 class="section-heading">Maximize Your Capital Realization</h2>
            <div class="gold-separator"></div>
            <p class="sell-text" style="color: var(--color-warm-gray);">
              Selling an ultra-prime property in Dubai requires discretion, bespoke media production, and direct access to qualified international buyers across London, Geneva, Singapore, and New York.
            </p>
            <ul class="sell-perks" style="color: var(--color-charcoal); margin-bottom: 2.5rem;">
              <li style="color: var(--color-charcoal);">Confidential Off-Market Brokerage</li>
              <li style="color: var(--color-charcoal);">Cinematic 4K Architectural Photography & Film</li>
              <li style="color: var(--color-charcoal);">Global Family Office & UHNW Investor Network</li>
              <li style="color: var(--color-charcoal);">Senior Partner-Level Representation from Inception to DLD Transfer</li>
            </ul>
          </div>

          <div class="sell-form-card">
            <h3 class="sell-form-title">Request Property Valuation</h3>
            <p class="sell-form-sub">Complimentary and strictly confidential analysis.</p>

            <form id="sell-property-form" class="luxury-form">
              <input type="text" name="_gotcha" class="honeypot" tabindex="-1" autocomplete="off">
              <input type="hidden" name="source_form" value="Sell Valuation Form">
              <input type="hidden" name="is_cash_buyer" value="true">
              <input type="hidden" name="timeframe" value="Immediate (Under 1 month)">
              
              <div class="form-group">
                <label class="form-label">COMMUNITY / LOCATION <span class="req">*</span></label>
                <input type="text" name="location" class="form-input" placeholder="e.g. Palm Jumeirah Frond G / Downtown" required minlength="2">
              </div>

              <div class="form-group">
                <label class="form-label">PROPERTY TYPE & BEDROOMS <span class="req">*</span></label>
                <select name="property_type" class="form-select">
                  <option value="Luxury Beachfront Villa">Luxury Beachfront Villa</option>
                  <option value="Sky Penthouse / Duplex">Sky Penthouse / Duplex</option>
                  <option value="Golf Course Mansion">Golf Course Mansion</option>
                  <option value="Prime Apartment">Prime Apartment</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">YOUR FULL NAME <span class="req">*</span></label>
                <input type="text" name="full_name" class="form-input" placeholder="Full name" required minlength="2">
              </div>

              <div class="form-group">
                <label class="form-label">PHONE NUMBER / WHATSAPP <span class="req">*</span></label>
                <input type="tel" name="phone" class="form-input" placeholder="+971 50 000 0000" required>
              </div>

              <button type="submit" class="btn btn-gold btn-block">Submit Valuation Request</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  `;

  const sellForm = document.getElementById('sell-property-form');
  if (sellForm) {
    sellForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleGenericFormSubmit(sellForm, '/api/leads', 'Sell Valuation Form');
    });
  }
}

// PAGE: ABOUT JAY REAL ESTATE
function renderAboutPage() {
  appView.innerHTML = `
    <div class="subpage-hero">
      <div class="subpage-hero-overlay"></div>
      <div class="container">
        <span class="section-label">OUR HERITAGE</span>
        <h1 class="hero-heading">About Jay Real Estate</h1>
        <p class="hero-subheading">
          Setting the benchmark for luxury property advisory in Dubai.
        </p>
      </div>
    </div>

    <section class="section">
      <div class="container">
        <div style="max-width: 860px; margin: 0 auto 5rem auto; text-align: center;">
          <span class="section-label">ESTABLISHED IN DUBAI</span>
          <h2 class="section-heading">Uncompromising Discretion & Excellence</h2>
          <div class="gold-separator" style="margin: 1.25rem auto;"></div>
          <p style="font-size: 1.08rem; color: var(--color-warm-gray); line-height: 1.85; margin-bottom: 1.5rem;">
            Jay Real Estate was founded on the principles of architectural appreciation, institutional integrity, and private client service. We specialize in representing Dubai's most distinguished residential assets across Palm Jumeirah, Downtown, and luxury waterfront enclaves.
          </p>
          <p style="font-size: 1rem; color: var(--color-warm-gray); line-height: 1.8;">
            Fully licensed and regulated by the Dubai Real Estate Regulatory Authority (RERA), our multilingual partners combine decades of market insight with direct developer access.
          </p>
        </div>

        <div class="section-header">
          <span class="section-label">LEADERSHIP</span>
          <h2 class="section-heading">Private Client Directors</h2>
        </div>

        <div class="agents-grid">
          ${state.agents.map(agent => `
            <div class="agent-card">
              <div class="agent-img-wrap">
                <img src="${agent.photo_url}" alt="${agent.full_name}" class="agent-img" loading="lazy">
              </div>
              <div class="agent-body">
                <h3 class="agent-name">${agent.full_name}</h3>
                <span class="agent-title">${agent.title}</span>
                <p class="agent-bio">${agent.bio}</p>
                <div class="agent-details-list">
                  <div><strong>Specialization:</strong> ${agent.specialization}</div>
                  <div><strong>Languages:</strong> ${agent.languages}</div>
                  <div><strong>RERA Registration:</strong> ${agent.rera_number}</div>
                  <div><strong>Direct Phone:</strong> ${agent.phone}</div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

// PAGE: CONTACT PAGE
function renderContactPage() {
  appView.innerHTML = `
    <div class="subpage-hero">
      <div class="subpage-hero-overlay"></div>
      <div class="container">
        <span class="section-label">GET IN TOUCH</span>
        <h1 class="hero-heading">Private Client Offices</h1>
        <p class="hero-subheading">
          Confidential appointments, portfolio reviews, and bespoke private tours.
        </p>
      </div>
    </div>

    <section class="section">
      <div class="container">
        <div class="contact-split-grid">
          <div class="contact-info-panel">
            <div>
              <span class="section-label">HEADQUARTERS</span>
              <h3 class="contact-block-title">DIFC Gate Village</h3>
              <p class="contact-block-text">
                Gate Village Building 03, Level 8<br>
                Dubai International Financial Centre<br>
                Dubai, United Arab Emirates
              </p>
            </div>

            <div>
              <span class="section-label">DIRECT DESK</span>
              <h3 class="contact-block-title">Telephone & Inquiries</h3>
              <p class="contact-block-text">
                Main Line: <strong>+971 4 800 JAY (529)</strong><br>
                VIP WhatsApp Desk: <strong>+971 58 555 9292</strong><br>
                Email Advisory: <strong>concierge@jayrealestate-dubai.ae</strong>
              </p>
            </div>

            <div>
              <span class="section-label">OFFICE HOURS</span>
              <p class="contact-block-text">
                Monday – Saturday: 09:00 – 20:00 (GST)<br>
                Sunday: Private Viewings by Appointment Only
              </p>
            </div>
          </div>

          <div class="sell-form-card">
            <h3 class="sell-form-title">Send a Message</h3>
            <p class="sell-form-sub">A Senior Advisor will respond within 24 hours.</p>

            <form id="contact-page-form" class="luxury-form">
              <input type="text" name="_gotcha" class="honeypot" tabindex="-1" autocomplete="off">
              <input type="hidden" name="source_form" value="Contact Page">
              
              <div class="form-group">
                <label class="form-label">YOUR FULL NAME <span class="req">*</span></label>
                <input type="text" name="full_name" class="form-input" placeholder="Full name" required minlength="2">
              </div>

              <div class="form-group">
                <label class="form-label">PHONE NUMBER / WHATSAPP <span class="req">*</span></label>
                <input type="tel" name="phone" class="form-input" placeholder="+971 50 000 0000" required>
              </div>

              <div class="form-group">
                <label class="form-label">INQUIRY SUBJECT</label>
                <select name="subject" class="form-select">
                  <option value="Ready Property Purchase">Ready Property Purchase</option>
                  <option value="Off-Plan Investment">Off-Plan Investment</option>
                  <option value="Selling / Listing a Property">Selling / Listing a Property</option>
                  <option value="Golden Visa & Wealth Structuring">Golden Visa & Wealth Structuring</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">MESSAGE</label>
                <textarea name="message" class="form-textarea" placeholder="How may our private client desk assist you?"></textarea>
              </div>

              <button type="submit" class="btn btn-gold btn-block">Send Confidential Message</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  `;

  const contactForm = document.getElementById('contact-page-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleGenericFormSubmit(contactForm, '/api/leads', 'Contact Page');
    });
  }
}

// ==============================================================================
// FORM SUBMISSION & LEAD SAVING (With 24h standard message & lead scoring)
// ==============================================================================

async function handleGenericFormSubmit(form, endpoint, sourceName) {
  const formData = new FormData(form);
  if (formData.get('_gotcha')) return; // bot blocked

  const fullName = (formData.get('full_name') || '').trim();
  const phone = (formData.get('phone') || '').trim();

  if (!fullName || !phone) {
    showToast('Please fill in all required fields.');
    return;
  }

  const payload = {
    full_name: fullName,
    phone: phone,
    email: (formData.get('email') || '').trim() || null,
    interested_in: formData.get('interested_in') || formData.get('subject') || `Inquiry from ${sourceName}`,
    property_id: formData.get('property_id') ? Number(formData.get('property_id')) : null,
    off_plan_id: formData.get('off_plan_id') ? Number(formData.get('off_plan_id')) : null,
    budget_aed: formData.get('budget_aed') ? Number(formData.get('budget_aed')) : 15000000,
    preferred_community: formData.get('preferred_community') || formData.get('location') || 'Prime Dubai',
    source_form: sourceName,
    is_cash_buyer: formData.get('is_cash_buyer') === 'true',
    timeframe: formData.get('timeframe') || '1-3 months',
    viewing_date: formData.get('viewing_date'),
    viewing_time: formData.get('viewing_time'),
    viewing_type: formData.get('viewing_type')
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.error) {
      showToast(data.error);
      return;
    }

    if (data.lead) {
      state.leads.unshift(data.lead);
    }
  } catch (err) {
    // Local in-memory fallback
    const { score, temperature } = calculateLeadScore(payload);
    const newLead = {
      id: state.leads.length + 1,
      ...payload,
      score,
      temperature,
      status: 'New',
      assigned_agent_id: payload.property_id ? (payload.property_id % 3) + 1 : 1,
      created_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString()
    };
    state.leads.unshift(newLead);
  }

  form.reset();
  showThankYouModal(
    'Request Received',
    STANDARD_CONFIRMATION_MSG
  );
}

// ==============================================================================
// ADMIN PORTAL & AGENT SYSTEM
// ==============================================================================

function handleAdminRouting(hash) {
  state.currentPage = 'admin';

  // Check login
  if (!state.currentUser && hash !== '#admin/login' && hash !== '#admin') {
    window.location.hash = '#admin/login';
    return;
  }

  if (!state.currentUser || hash === '#admin/login' || hash === '#admin' && !state.currentUser) {
    renderAdminLoginPage();
    return;
  }

  // Start 60-second bell refresh timer
  startBellNotificationTimer();

  if (hash === '#admin' || hash === '#admin/dashboard') {
    renderAdminDashboard();
  } else if (hash === '#admin/board') {
    renderAdminKanbanBoard();
  } else if (hash === '#admin/leads') {
    renderAdminLeadsList();
  } else if (hash.startsWith('#admin/lead/')) {
    const id = hash.replace('#admin/lead/', '');
    renderAdminLeadDetail(id);
  } else if (hash === '#admin/viewings') {
    renderAdminViewings();
  } else if (hash === '#admin/team') {
    renderAdminTeam();
  } else if (hash === '#admin/properties') {
    renderAdminProperties();
  } else if (hash === '#admin/projects') {
    renderAdminProjects();
  } else {
    renderAdminDashboard();
  }
}

// 1. Admin Login Page
function renderAdminLoginPage() {
  appView.innerHTML = `
    <div class="admin-login-wrapper">
      <div class="admin-login-card">
        <div class="logo-wrap logo-charcoal" style="margin-bottom: 1.5rem;">
          <span class="logo-title">J A Y</span>
          <div class="logo-gold-line"></div>
          <span class="logo-subtitle">REAL ESTATE</span>
        </div>
        <span class="section-label center-label">PRIVATE ACCESS</span>
        <h2 style="font-family: var(--font-heading); font-size: 2rem; margin-bottom: 0.5rem;">Staff & Agent Portal</h2>
        <p style="font-size: 0.85rem; color: var(--color-warm-gray); margin-bottom: 2rem;">Sign in to access your CRM pipeline, viewings, and leads.</p>

        <form id="admin-login-form" class="luxury-form">
          <div class="form-group">
            <label class="form-label">EMAIL ADDRESS</label>
            <input type="email" id="login-email" class="form-input" placeholder="name@jayrealestate.ae" required value="admin@jayrealestate.ae">
          </div>

          <div class="form-group">
            <label class="form-label">PASSWORD</label>
            <input type="password" id="login-password" class="form-input" placeholder="••••••••••••" required value="JayAdmin2026!">
          </div>

          <button type="submit" class="btn btn-gold btn-block">Sign In to Dashboard</button>
        </form>

        <!-- Quick Demo Login Buttons -->
        <div class="demo-credentials-box">
          <strong>⚡ Quick 1-Click Demo Login:</strong>
          <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.75rem;">
            <button class="btn btn-outline-dark btn-sm" onclick="window.quickLogin('admin@jayrealestate.ae', 'JayAdmin2026!')">
              Sign In as Managing Director (Admin)
            </button>
            <button class="btn btn-outline-dark btn-sm" onclick="window.quickLogin('alexander.vance@jayrealestate-dubai.ae', 'JayAgent2026!')">
              Sign In as Alexander Vance (Agent)
            </button>
            <button class="btn btn-outline-dark btn-sm" onclick="window.quickLogin('elena.rostova@jayrealestate-dubai.ae', 'JayAgent2026!')">
              Sign In as Elena Rostova (Agent)
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  const form = document.getElementById('admin-login-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const pass = document.getElementById('login-password').value;
      await performLogin(email, pass);
    });
  }
}

window.quickLogin = async (email, pass) => {
  await performLogin(email, pass);
};

async function performLogin(email, password) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success && data.user) {
      state.currentUser = data.user;
      localStorage.setItem('jay_staff_user', JSON.stringify(data.user));
      showToast(`Welcome, ${data.user.full_name}. Signed in as ${data.user.role.toUpperCase()}.`);
      window.location.hash = '#admin/dashboard';
    } else {
      showToast(data.error || 'Invalid email or password.');
    }
  } catch (e) {
    // In-memory fallback
    const found = state.agents.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (found) {
      state.currentUser = found;
      localStorage.setItem('jay_staff_user', JSON.stringify(found));
      showToast(`Welcome, ${found.full_name}. Signed in as ${found.role.toUpperCase()}.`);
      window.location.hash = '#admin/dashboard';
    } else {
      showToast('Invalid email or password.');
    }
  }
}

window.adminLogout = () => {
  state.currentUser = null;
  localStorage.removeItem('jay_staff_user');
  if (state.bellInterval) clearInterval(state.bellInterval);
  showToast('You have been signed out.');
  window.location.hash = '#home';
};

// 60-Second Bell Notification Poller
function startBellNotificationTimer() {
  if (state.bellInterval) clearInterval(state.bellInterval);
  updateUnreadLeadsCount();
  state.bellInterval = setInterval(updateUnreadLeadsCount, 60000); // 60s
}

async function updateUnreadLeadsCount() {
  const agentParam = state.currentUser && state.currentUser.role === 'agent' ? state.currentUser.id : 'all';
  try {
    const res = await fetch(`/api/admin/unread-count?agent_id=${agentParam}`);
    const data = await res.json();
    state.unreadLeadsCount = data.count || 0;
  } catch (e) {
    let unread = state.leads.filter(l => l.status === 'New');
    if (state.currentUser && state.currentUser.role === 'agent') {
      unread = unread.filter(l => l.assigned_agent_id === state.currentUser.id);
    }
    state.unreadLeadsCount = unread.length;
  }

  const bellEl = document.getElementById('admin-bell-badge');
  if (bellEl) {
    bellEl.textContent = state.unreadLeadsCount;
    bellEl.style.display = state.unreadLeadsCount > 0 ? 'inline-block' : 'none';
  }
}

// Admin Layout Shell
function renderAdminShell(title, contentHtml, activeNav) {
  const u = state.currentUser || { full_name: "Jay Al-Sayed", title: "Managing Director", role: "admin", photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80" };
  const isAdmin = u.role === 'admin';

  appView.innerHTML = `
    <div class="admin-wrapper">
      <!-- Sidebar -->
      <aside class="admin-sidebar">
        <div class="admin-sidebar-header">
          <div class="logo-wrap logo-white">
            <span class="logo-title" style="font-size: 1.4rem;">J A Y</span>
            <div class="logo-gold-line" style="max-width: 60px;"></div>
            <span class="logo-subtitle" style="font-size: 0.5rem;">PRIVATE PORTAL</span>
          </div>
        </div>

        <div class="admin-user-card">
          <img src="${u.photo_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80'}" alt="${u.full_name}" class="admin-user-avatar">
          <div class="admin-user-info">
            <span class="admin-user-name">${u.full_name}</span>
            <span class="admin-user-role">${u.role.toUpperCase()}</span>
          </div>
        </div>

        <nav class="admin-nav">
          <a href="#admin/dashboard" class="admin-nav-item ${activeNav === 'dashboard' ? 'active' : ''}">
            <span>📊 Dashboard</span>
          </a>
          <a href="#admin/board" class="admin-nav-item ${activeNav === 'board' ? 'active' : ''}">
            <span>📋 Pipeline Board</span>
          </a>
          <a href="#admin/leads" class="admin-nav-item ${activeNav === 'leads' ? 'active' : ''}">
            <span>👥 Leads List</span>
            <span class="badge-count" id="nav-leads-badge">${getVisibleLeads().length}</span>
          </a>
          <a href="#admin/viewings" class="admin-nav-item ${activeNav === 'viewings' ? 'active' : ''}">
            <span>📅 Viewings</span>
          </a>
          <a href="#admin/team" class="admin-nav-item ${activeNav === 'team' ? 'active' : ''}">
            <span>🏆 Leaderboard & Stale</span>
          </a>
          ${isAdmin ? `
            <a href="#admin/properties" class="admin-nav-item ${activeNav === 'properties' ? 'active' : ''}">
              <span>🏡 Properties (CRUD)</span>
            </a>
            <a href="#admin/projects" class="admin-nav-item ${activeNav === 'projects' ? 'active' : ''}">
              <span>🏗️ Off-Plan Projects</span>
            </a>
          ` : ''}
          <a href="#home" class="admin-nav-item" style="margin-top: auto; color: var(--color-gold);">
            <span>🌐 View Live Website</span>
          </a>
        </nav>

        <div class="admin-sidebar-footer">
          <button class="btn btn-outline btn-sm btn-block" onclick="window.adminLogout()">Sign Out</button>
        </div>
      </aside>

      <!-- Main Workspace -->
      <main class="admin-main">
        <div class="admin-topbar">
          <div>
            <h1 class="admin-topbar-title">${title}</h1>
            <span style="font-size: 0.75rem; color: var(--color-warm-gray); letter-spacing: 0.1em;">
              ${isAdmin ? 'FULL FIRM OVERVIEW' : `ASSIGNED PORTFOLIO FOR ${u.full_name.toUpperCase()}`}
            </span>
          </div>

          <div class="admin-topbar-actions">
            <!-- Bell Icon (Refreshes Every Minute) -->
            <button class="bell-btn" onclick="window.location.hash='#admin/leads'" title="Click to view new leads">
              <span>🔔</span>
              <span>New Leads</span>
              <span class="bell-badge" id="admin-bell-badge">${state.unreadLeadsCount || 0}</span>
            </button>
          </div>
        </div>

        ${contentHtml}
      </main>
    </div>
  `;
}

function getVisibleLeads() {
  if (!state.currentUser || state.currentUser.role === 'admin') {
    return state.leads;
  }
  return state.leads.filter(l => l.assigned_agent_id === state.currentUser.id);
}

// 2. Admin Dashboard
function renderAdminDashboard() {
  const visibleLeads = getVisibleLeads();
  const totalDealVal = visibleLeads.reduce((sum, l) => sum + (Number(l.budget_aed) || 0), 0);
  const totalSalesVal = state.sales.reduce((sum, s) => sum + Number(s.sale_price_aed), 0);
  const totalCommission = state.sales.reduce((sum, s) => sum + Number(s.commission_aed), 0);
  const todayStr = new Date().toISOString().split('T')[0];
  const newToday = visibleLeads.filter(l => (l.created_at || '').startsWith(todayStr)).length;

  const hotLeads = visibleLeads.filter(l => l.temperature === 'HOT').length;
  const warmLeads = visibleLeads.filter(l => l.temperature === 'WARM').length;
  const coldLeads = visibleLeads.filter(l => l.temperature === 'COLD').length;

  const content = `
    <!-- Metric Cards -->
    <div class="metrics-grid">
      <div class="metric-card gold-border">
        <span class="metric-card-label">NEW LEADS TODAY</span>
        <div class="metric-card-val">${newToday}</div>
        <span class="metric-card-sub">${visibleLeads.length} Total Pipeline Leads</span>
      </div>

      <div class="metric-card">
        <span class="metric-card-label">TOTAL PIPELINE VALUE</span>
        <div class="metric-card-val" style="font-size: 1.8rem;">${formatAED(totalDealVal)}</div>
        <span class="metric-card-sub">Estimated Gross Buyer Budgets</span>
      </div>

      <div class="metric-card">
        <span class="metric-card-label">VIEWINGS THIS WEEK</span>
        <div class="metric-card-val">${state.viewings.length}</div>
        <span class="metric-card-sub">In-Person & VIP Virtual Tours</span>
      </div>

      <div class="metric-card gold-border">
        <span class="metric-card-label">CLOSED SALES (2% COMMISSION)</span>
        <div class="metric-card-val" style="font-size: 1.8rem; color: var(--color-gold);">${formatAED(totalCommission)}</div>
        <span class="metric-card-sub">From ${formatAED(totalSalesVal)} Total Sales</span>
      </div>
    </div>

    <!-- Visual Charts & Split Grid -->
    <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 2rem; margin-bottom: 2.5rem;">
      <!-- Pipeline Stages Distribution -->
      <div style="background: var(--color-white); border: 1px solid var(--color-light-gray); padding: 2rem;">
        <span class="section-label">PIPELINE BREAKDOWN</span>
        <h3 style="font-family: var(--font-heading); font-size: 1.5rem; margin-bottom: 1.5rem;">Deals by Stage</h3>
        
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${['New', 'Contacted', 'Viewing Scheduled', 'Offer Made', 'Negotiating', 'Won', 'Lost'].map(st => {
            const count = visibleLeads.filter(l => l.status === st).length;
            const pct = visibleLeads.length > 0 ? Math.round((count / visibleLeads.length) * 100) : 0;
            return `
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.3rem;">
                  <span><strong>${st}</strong> (${count} leads)</span>
                  <span style="color: var(--color-warm-gray);">${pct}%</span>
                </div>
                <div style="height: 7px; background: #eee; width: 100%;">
                  <div style="height: 100%; width: ${pct}%; background: ${st === 'Won' ? '#27AE60' : st === 'Lost' ? '#95A5A6' : 'var(--color-gold)'};"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Lead Temperature Distribution -->
      <div style="background: var(--color-white); border: 1px solid var(--color-light-gray); padding: 2rem; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <span class="section-label">SCORING RADAR</span>
          <h3 style="font-family: var(--font-heading); font-size: 1.5rem; margin-bottom: 1.25rem;">Buyer Temperature</h3>
          
          <div style="display: flex; flex-direction: column; gap: 1.25rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: rgba(231, 76, 60, 0.08); border-left: 3px solid #E74C3C;">
              <div>
                <strong style="color: #C0392B;">🔥 HOT LEADS (Score 75-100)</strong>
                <p style="font-size: 0.75rem; color: var(--color-warm-gray);">Cash ready / immediate buyers</p>
              </div>
              <span style="font-size: 1.4rem; font-weight: 700; color: #C0392B;">${hotLeads}</span>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: rgba(184, 151, 90, 0.08); border-left: 3px solid var(--color-gold);">
              <div>
                <strong style="color: #8C6D34;">⚡ WARM LEADS (Score 45-74)</strong>
                <p style="font-size: 0.75rem; color: var(--color-warm-gray);">1-3 months investment timeframe</p>
              </div>
              <span style="font-size: 1.4rem; font-weight: 700; color: #8C6D34;">${warmLeads}</span>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: rgba(107, 107, 107, 0.08); border-left: 3px solid #7F8C8D;">
              <div>
                <strong style="color: #555;">❄️ COLD LEADS (Score 0-44)</strong>
                <p style="font-size: 0.75rem; color: var(--color-warm-gray);">Browsing / early exploratory stage</p>
              </div>
              <span style="font-size: 1.4rem; font-weight: 700; color: #555;">${coldLeads}</span>
            </div>
          </div>
        </div>

        <a href="#admin/board" class="btn btn-gold btn-block" style="margin-top: 1.5rem;">Open Pipeline Board</a>
      </div>
    </div>
  `;

  renderAdminShell('Dashboard', content, 'dashboard');
}

// 3. Admin Kanban Pipeline Board (Drag / Switch Stages)
function renderAdminKanbanBoard() {
  const visibleLeads = getVisibleLeads();
  const stages = ['New', 'Contacted', 'Viewing Scheduled', 'Offer Made', 'Negotiating', 'Won', 'Lost'];

  const content = `
    <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
      <p style="font-size: 0.85rem; color: var(--color-warm-gray);">
        Drag and drop or click stage arrows to move leads through the sales pipeline.
      </p>
      <div style="display: flex; gap: 0.5rem;">
        <button class="btn btn-outline-dark btn-sm" onclick="window.location.hash='#admin/leads'">Table View</button>
      </div>
    </div>

    <div class="kanban-board">
      ${stages.map(st => {
        const stageLeads = visibleLeads.filter(l => l.status === st);
        const stageVal = stageLeads.reduce((s, l) => s + (Number(l.budget_aed) || 0), 0);
        return `
          <div class="kanban-column" ondragover="event.preventDefault()" ondrop="window.dropLead(event, '${st}')">
            <div class="kanban-column-header">
              <span class="kanban-column-title">${st}</span>
              <span style="font-size: 0.7rem; font-weight: bold; color: var(--color-gold);">${stageLeads.length}</span>
            </div>
            <div style="font-size: 0.65rem; color: var(--color-warm-gray); padding: 4px 1.25rem; background: #fff; border-bottom: 1px solid #f0f0f0;">
              ${formatAED(stageVal)}
            </div>
            <div class="kanban-card-list" id="kanban-col-${st.replace(/\s+/g, '-')}">
              ${stageLeads.map(lead => {
                const agent = state.agents.find(a => a.id === lead.assigned_agent_id) || {};
                const tempClass = (lead.temperature || 'WARM').toLowerCase();
                return `
                  <div class="kanban-card" draggable="true" ondragstart="window.dragLead(event, ${lead.id})">
                    <div class="kanban-card-header">
                      <span class="kanban-card-name" onclick="window.location.hash='#admin/lead/${lead.id}'">${lead.full_name}</span>
                      <span class="score-badge ${tempClass}">${lead.temperature} ${lead.score || 50}</span>
                    </div>
                    <div class="kanban-card-budget">${formatAED(lead.budget_aed)}</div>
                    <div class="kanban-card-interest">📍 ${lead.preferred_community || 'Dubai'} • ${lead.interested_in || 'General'}</div>
                    <div class="kanban-card-footer">
                      <span style="color: var(--color-warm-gray);">👤 ${agent.full_name ? agent.full_name.split(' ')[0] : 'Unassigned'}</span>
                      <div style="display: flex; gap: 0.25rem;">
                        <button style="border: none; background: #eee; padding: 2px 6px; cursor: pointer; font-size: 0.7rem;" onclick="window.promptMoveLead(${lead.id})" title="Change stage">➔</button>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  renderAdminShell('Pipeline Board', content, 'board');
}

let draggedLeadId = null;
window.dragLead = (e, leadId) => {
  draggedLeadId = leadId;
  e.dataTransfer.setData('text/plain', leadId);
};

window.dropLead = async (e, newStage) => {
  e.preventDefault();
  if (!draggedLeadId) return;
  await updateLeadStageAndRender(draggedLeadId, newStage);
  draggedLeadId = null;
};

window.promptMoveLead = async (leadId) => {
  const lead = state.leads.find(l => l.id == leadId);
  if (!lead) return;
  const stages = ['New', 'Contacted', 'Viewing Scheduled', 'Offer Made', 'Negotiating', 'Won', 'Lost'];
  const newStage = prompt(`Move "${lead.full_name}" to stage:\n\n${stages.join('\n')}`, lead.status);
  if (newStage && stages.includes(newStage.trim())) {
    await updateLeadStageAndRender(leadId, newStage.trim());
  }
};

async function updateLeadStageAndRender(leadId, newStage) {
  const lead = state.leads.find(l => l.id == leadId);
  if (!lead) return;

  if (newStage === 'Won') {
    openWonDealModal(lead);
    return;
  }

  lead.status = newStage;
  lead.last_activity_at = new Date().toISOString();

  try {
    await fetch(`/api/admin/leads/${leadId}/stage`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: newStage })
    });
  } catch (e) {}

  showToast(`Lead moved to stage: ${newStage}`);
  if (state.currentPage === 'admin') {
    if (window.location.hash === '#admin/board') renderAdminKanbanBoard();
    else if (window.location.hash === '#admin/leads') renderAdminLeadsList();
    else renderAdminDashboard();
  }
}

// 4. Admin Leads Table with Search, Filter & Excel/CSV Download
function renderAdminLeadsList() {
  let leads = getVisibleLeads();

  // Apply filters
  if (state.adminLeadFilters.search) {
    const q = state.adminLeadFilters.search.toLowerCase();
    leads = leads.filter(l =>
      (l.full_name && l.full_name.toLowerCase().includes(q)) ||
      (l.phone && l.phone.includes(q)) ||
      (l.preferred_community && l.preferred_community.toLowerCase().includes(q)) ||
      (l.interested_in && l.interested_in.toLowerCase().includes(q))
    );
  }
  if (state.adminLeadFilters.stage !== 'all') {
    leads = leads.filter(l => l.status === state.adminLeadFilters.stage);
  }
  if (state.adminLeadFilters.temperature !== 'all') {
    leads = leads.filter(l => l.temperature === state.adminLeadFilters.temperature);
  }
  if (state.adminLeadFilters.agent !== 'all') {
    leads = leads.filter(l => l.assigned_agent_id === Number(state.adminLeadFilters.agent));
  }

  const content = `
    <!-- Search & Filter Bar -->
    <div style="background: var(--color-white); border: 1px solid var(--color-light-gray); padding: 1.5rem; margin-bottom: 2rem; display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; justify-content: space-between;">
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; flex-grow: 1;">
        <input type="text" id="admin-lead-search" class="form-input" placeholder="Search by name, phone, community..." style="max-width: 260px;" value="${state.adminLeadFilters.search}">
        
        <select id="admin-lead-stage-filter" class="form-select" style="max-width: 170px;">
          <option value="all" ${state.adminLeadFilters.stage === 'all' ? 'selected' : ''}>All Stages</option>
          <option value="New" ${state.adminLeadFilters.stage === 'New' ? 'selected' : ''}>New</option>
          <option value="Contacted" ${state.adminLeadFilters.stage === 'Contacted' ? 'selected' : ''}>Contacted</option>
          <option value="Viewing Scheduled" ${state.adminLeadFilters.stage === 'Viewing Scheduled' ? 'selected' : ''}>Viewing Scheduled</option>
          <option value="Offer Made" ${state.adminLeadFilters.stage === 'Offer Made' ? 'selected' : ''}>Offer Made</option>
          <option value="Negotiating" ${state.adminLeadFilters.stage === 'Negotiating' ? 'selected' : ''}>Negotiating</option>
          <option value="Won" ${state.adminLeadFilters.stage === 'Won' ? 'selected' : ''}>Won (Sold)</option>
          <option value="Lost" ${state.adminLeadFilters.stage === 'Lost' ? 'selected' : ''}>Lost</option>
        </select>

        <select id="admin-lead-temp-filter" class="form-select" style="max-width: 160px;">
          <option value="all" ${state.adminLeadFilters.temperature === 'all' ? 'selected' : ''}>All Temperatures</option>
          <option value="HOT" ${state.adminLeadFilters.temperature === 'HOT' ? 'selected' : ''}>HOT (75-100)</option>
          <option value="WARM" ${state.adminLeadFilters.temperature === 'WARM' ? 'selected' : ''}>WARM (45-74)</option>
          <option value="COLD" ${state.adminLeadFilters.temperature === 'COLD' ? 'selected' : ''}>COLD (0-44)</option>
        </select>

        ${state.currentUser && state.currentUser.role === 'admin' ? `
          <select id="admin-lead-agent-filter" class="form-select" style="max-width: 180px;">
            <option value="all">All Agents</option>
            ${state.agents.filter(a => a.role === 'agent').map(a => `
              <option value="${a.id}" ${state.adminLeadFilters.agent == a.id ? 'selected' : ''}>${a.full_name}</option>
            `).join('')}
          </select>
        ` : ''}
      </div>

      <button class="btn btn-gold" id="btn-export-csv" onclick="window.downloadLeadsCSV()">
        📥 Download Excel / CSV
      </button>
    </div>

    <!-- Leads Table -->
    <div class="table-responsive">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Lead Name</th>
            <th>Score & Temp</th>
            <th>Phone / WhatsApp</th>
            <th>Budget (AED)</th>
            <th>Community & Interest</th>
            <th>Source Form</th>
            <th>Stage</th>
            <th>Assigned Agent</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${leads.length > 0 ? leads.map(l => {
            const tempClass = (l.temperature || 'WARM').toLowerCase();
            const agent = state.agents.find(a => a.id === l.assigned_agent_id) || {};
            return `
              <tr>
                <td class="lead-name-cell" onclick="window.location.hash='#admin/lead/${l.id}'">
                  ${l.full_name}
                  ${l.is_cash_buyer ? '<span style="font-size: 0.6rem; background: #e8f8f5; color: #117a65; padding: 2px 4px; margin-left: 4px; border-radius: 2px;">CASH</span>' : ''}
                </td>
                <td>
                  <span class="score-badge ${tempClass}">${l.temperature} ${l.score || 50}</span>
                </td>
                <td>
                  <a href="tel:${l.phone}" style="color: var(--color-charcoal); font-weight: 500;">${l.phone}</a>
                </td>
                <td style="font-weight: 600;">${formatAED(l.budget_aed)}</td>
                <td>${l.preferred_community || 'Dubai'} • ${l.interested_in || 'Residence'}</td>
                <td><span style="font-size: 0.72rem; color: var(--color-warm-gray);">${l.source_form || l.lead_source || 'Website Form'}</span></td>
                <td>
                  <span style="font-weight: 600; font-size: 0.75rem; color: ${l.status === 'Won' ? '#27AE60' : 'var(--color-charcoal)'};">
                    ${l.status}
                  </span>
                </td>
                <td>${agent.full_name || 'Unassigned'}</td>
                <td>
                  <button class="btn btn-outline-dark btn-sm" onclick="window.location.hash='#admin/lead/${l.id}'">Dossier</button>
                </td>
              </tr>
            `;
          }).join('') : `
            <tr>
              <td colspan="9" style="text-align: center; padding: 3rem; color: var(--color-warm-gray);">
                No buyer leads found matching the filters.
              </td>
            </tr>
          `}
        </tbody>
      </table>
    </div>
  `;

  renderAdminShell('Buyer Leads Directory', content, 'leads');

  // Bind filter events
  const searchInp = document.getElementById('admin-lead-search');
  const stageSel = document.getElementById('admin-lead-stage-filter');
  const tempSel = document.getElementById('admin-lead-temp-filter');
  const agentSel = document.getElementById('admin-lead-agent-filter');

  if (searchInp) {
    searchInp.addEventListener('input', () => {
      state.adminLeadFilters.search = searchInp.value;
      renderAdminLeadsList();
    });
  }
  if (stageSel) {
    stageSel.addEventListener('change', () => {
      state.adminLeadFilters.stage = stageSel.value;
      renderAdminLeadsList();
    });
  }
  if (tempSel) {
    tempSel.addEventListener('change', () => {
      state.adminLeadFilters.temperature = tempSel.value;
      renderAdminLeadsList();
    });
  }
  if (agentSel) {
    agentSel.addEventListener('change', () => {
      state.adminLeadFilters.agent = agentSel.value;
      renderAdminLeadsList();
    });
  }
}

// Download Leads CSV Helper
window.downloadLeadsCSV = () => {
  const leads = getVisibleLeads();
  const headers = ['ID', 'Full Name', 'Phone', 'Email', 'Score', 'Temperature', 'Budget (AED)', 'Community', 'Interest', 'Source Form', 'Stage', 'Cash Buyer', 'Timeframe', 'Created At'];
  
  const csvRows = [];
  csvRows.push(headers.join(','));

  leads.forEach(l => {
    const row = [
      l.id,
      `"${(l.full_name || '').replace(/"/g, '""')}"`,
      `"${l.phone || ''}"`,
      `"${l.email || ''}"`,
      l.score || 50,
      l.temperature || 'WARM',
      l.budget_aed || 0,
      `"${(l.preferred_community || '').replace(/"/g, '""')}"`,
      `"${(l.interested_in || '').replace(/"/g, '""')}"`,
      `"${(l.source_form || l.lead_source || '').replace(/"/g, '""')}"`,
      `"${l.status || 'New'}"`,
      l.is_cash_buyer ? 'Yes' : 'No',
      `"${l.timeframe || '1-3 months'}"`,
      `"${l.created_at || ''}"`
    ];
    csvRows.push(row.join(','));
  });

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `jay_real_estate_leads_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('Excel / CSV Lead Export generated successfully.');
};

// 5. Admin Single Lead Detail Dossier
function renderAdminLeadDetail(id) {
  const lead = state.leads.find(l => l.id == id) || state.leads[0];
  const agent = state.agents.find(a => a.id === lead.assigned_agent_id) || {};
  const leadNotes = (state.leads.find(l => l.id == id) || {}).notes || [];
  const tempClass = (lead.temperature || 'WARM').toLowerCase();
  const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');

  const content = `
    <div style="margin-bottom: 1.5rem;">
      <a href="#admin/leads" style="font-size: 0.8rem; color: var(--color-gold); text-transform: uppercase; letter-spacing: 0.15em;">
        ← Back to Leads List
      </a>
    </div>

    <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 2rem;">
      <!-- Left Column: Dossier -->
      <div style="background: var(--color-white); border: 1px solid var(--color-light-gray); padding: 2.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
          <div>
            <span class="section-label">CLIENT PROFILE #${lead.id}</span>
            <h2 style="font-family: var(--font-heading); font-size: 2.2rem; color: var(--color-charcoal); margin-bottom: 0.25rem;">
              ${lead.full_name}
            </h2>
            <p style="font-size: 0.85rem; color: var(--color-warm-gray);">Registered via <strong>${lead.source_form || lead.lead_source || 'Website Form'}</strong></p>
          </div>
          <span class="score-badge ${tempClass}" style="font-size: 0.85rem; padding: 6px 14px;">
            ${lead.temperature} • SCORE ${lead.score || 50}/100
          </span>
        </div>

        <!-- Quick Communication Action Buttons -->
        <div style="display: flex; gap: 0.75rem; margin: 1.5rem 0 2rem 0;">
          <a href="tel:${lead.phone}" class="btn btn-charcoal btn-sm" style="flex-grow: 1;">
            📞 Call Client (${lead.phone})
          </a>
          <a href="https://api.whatsapp.com/send?phone=${cleanPhone}&text=Hello%20${encodeURIComponent(lead.full_name)},%20this%20is%20Jay%20Real%20Estate%20Private%20Client%20Advisory." target="_blank" class="btn btn-gold btn-sm" style="flex-grow: 1;">
            💬 WhatsApp
          </a>
        </div>

        <div class="card-gold-line"></div>

        <!-- Details Grid -->
        <div class="specs-table-box" style="margin: 1.5rem 0;">
          <div class="spec-box-item">
            <span class="spec-box-label">INVESTMENT BUDGET</span>
            <span class="spec-box-val">${formatAED(lead.budget_aed)}</span>
          </div>
          <div class="spec-box-item">
            <span class="spec-box-label">COMMUNITY PREFERENCE</span>
            <span class="spec-box-val">${lead.preferred_community || 'Dubai Prime'}</span>
          </div>
          <div class="spec-box-item">
            <span class="spec-box-label">PURCHASE TIMEFRAME</span>
            <span class="spec-box-val">${lead.timeframe || '1-3 months'}</span>
          </div>
          <div class="spec-box-item">
            <span class="spec-box-label">FINANCING METHOD</span>
            <span class="spec-box-val">${lead.is_cash_buyer ? '100% Cash / Liquid' : 'Bank Mortgage'}</span>
          </div>
        </div>

        <h4 style="font-family: var(--font-heading); font-size: 1.4rem; margin: 1.5rem 0 0.5rem 0;">Property Interest</h4>
        <p style="font-size: 0.95rem; color: var(--color-warm-gray);">${lead.interested_in || 'General Ultra-Prime Portfolio'}</p>

        <!-- Internal Notes Thread -->
        <div style="margin-top: 2.5rem; border-top: 1px solid var(--color-light-gray); padding-top: 2rem;">
          <span class="section-label">ADVISOR NOTES</span>
          <h4 style="font-family: var(--font-heading); font-size: 1.4rem; margin-bottom: 1rem;">Internal Communication Log</h4>

          <div id="lead-notes-list" style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem;">
            ${(lead.notes || []).length > 0 ? lead.notes.map(n => `
              <div style="background: var(--color-offwhite); border: 1px solid var(--color-light-gray); padding: 1rem;">
                <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--color-gold); margin-bottom: 0.25rem;">
                  <strong>${n.agent_name || 'Senior Advisor'}</strong>
                  <span>${n.created_at ? new Date(n.created_at).toLocaleString() : 'Recent'}</span>
                </div>
                <p style="font-size: 0.88rem; color: var(--color-charcoal);">${n.note_text}</p>
              </div>
            `).join('') : `
              <p style="font-size: 0.85rem; color: var(--color-warm-gray);">No internal notes logged yet.</p>
            `}
          </div>

          <!-- Add Note Form -->
          <form id="add-note-form" style="display: flex; flex-direction: column; gap: 0.75rem;">
            <textarea id="new-note-text" class="form-textarea" placeholder="Add an advisor note (e.g. Client requested title deed verification and video tour on Tuesday)..." required style="min-height: 80px;"></textarea>
            <button type="submit" class="btn btn-outline-dark btn-sm" style="align-self: flex-start;">Post Note</button>
          </form>
        </div>
      </div>

      <!-- Right Column: Stage Controls & Actions -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <!-- Stage Switcher Card -->
        <div class="sidebar-form-card highlight">
          <span class="section-label">PIPELINE STATUS</span>
          <h3 class="sidebar-form-title">Current Stage: ${lead.status}</h3>
          <p class="sidebar-form-desc">Select a new stage to advance this transaction.</p>

          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            ${['New', 'Contacted', 'Viewing Scheduled', 'Offer Made', 'Negotiating', 'Won', 'Lost'].map(st => `
              <button class="btn ${lead.status === st ? 'btn-charcoal' : 'btn-outline-dark'} btn-sm" onclick="window.updateLeadStageFromDetail(${lead.id}, '${st}')">
                ${lead.status === st ? '✓ ' : ''}${st}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Assign Advisor Card -->
        ${state.currentUser && state.currentUser.role === 'admin' ? `
          <div class="sidebar-form-card">
            <span class="section-label">ASSIGNMENT</span>
            <h3 class="sidebar-form-title">Assigned Agent</h3>
            <select id="lead-assign-agent-select" class="form-select" onchange="window.assignAgentToLead(${lead.id}, this.value)" style="margin-top: 0.75rem;">
              ${state.agents.filter(a => a.role === 'agent').map(a => `
                <option value="${a.id}" ${lead.assigned_agent_id === a.id ? 'selected' : ''}>${a.full_name} (${a.specialization})</option>
              `).join('')}
            </select>
          </div>
        ` : ''}

        <!-- Book Viewing from Lead View -->
        <div class="sidebar-form-card">
          <span class="section-label">CALENDAR</span>
          <h3 class="sidebar-form-title">Book Viewing with Client</h3>
          <form id="lead-direct-viewing-form" class="luxury-form" style="margin-top: 1rem;">
            <input type="date" id="direct-viewing-date" class="form-input" required value="${new Date(Date.now() + 86400000).toISOString().split('T')[0]}">
            <select id="direct-viewing-time" class="form-select">
              <option value="11:00 AM">11:00 AM (Morning)</option>
              <option value="02:30 PM">02:30 PM (Afternoon)</option>
              <option value="05:30 PM">05:30 PM (Sunset)</option>
            </select>
            <select id="direct-viewing-type" class="form-select">
              <option value="In-Person">In-Person Tour</option>
              <option value="Virtual VIP Walkthrough">Virtual 4K VIP Tour</option>
            </select>
            <button type="submit" class="btn btn-gold btn-sm btn-block">Schedule Viewing</button>
          </form>
        </div>
      </div>
    </div>
  `;

  renderAdminShell(`Lead: ${lead.full_name}`, content, 'leads');

  // Add Note Handler
  const noteForm = document.getElementById('add-note-form');
  if (noteForm) {
    noteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = document.getElementById('new-note-text').value;
      if (!text || !text.trim()) return;

      const newNote = {
        id: (lead.notes || []).length + 1,
        lead_id: lead.id,
        agent_id: state.currentUser ? state.currentUser.id : 1,
        agent_name: state.currentUser ? state.currentUser.full_name : 'Advisor',
        note_text: text.trim(),
        created_at: new Date().toISOString()
      };

      if (!lead.notes) lead.notes = [];
      lead.notes.unshift(newNote);
      lead.last_activity_at = new Date().toISOString();

      try {
        await fetch(`/api/admin/leads/${lead.id}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ note_text: text.trim(), agent_id: newNote.agent_id })
        });
      } catch (err) {}

      showToast('Note added to client timeline.');
      renderAdminLeadDetail(lead.id);
    });
  }

  // Direct Viewing Form Handler
  const viewingForm = document.getElementById('lead-direct-viewing-form');
  if (viewingForm) {
    viewingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const vDate = document.getElementById('direct-viewing-date').value;
      const vTime = document.getElementById('direct-viewing-time').value;
      const vType = document.getElementById('direct-viewing-type').value;

      const newViewing = {
        id: state.viewings.length + 1,
        property_id: lead.property_id || 1,
        lead_id: lead.id,
        agent_id: lead.assigned_agent_id || 1,
        viewing_date: vDate,
        viewing_time: vTime,
        viewing_type: vType,
        status: 'Scheduled',
        feedback: `Viewing booked directly for ${vDate} at ${vTime}`
      };
      state.viewings.unshift(newViewing);
      lead.status = 'Viewing Scheduled';
      lead.last_activity_at = new Date().toISOString();

      showToast(`Viewing scheduled for ${vDate} at ${vTime}.`);
      renderAdminLeadDetail(lead.id);
    });
  }
}

window.updateLeadStageFromDetail = async (leadId, newStage) => {
  await updateLeadStageAndRender(leadId, newStage);
  renderAdminLeadDetail(leadId);
};

window.assignAgentToLead = async (leadId, agentId) => {
  const lead = state.leads.find(l => l.id == leadId);
  if (lead) {
    lead.assigned_agent_id = Number(agentId);
    lead.last_activity_at = new Date().toISOString();
    try {
      await fetch(`/api/admin/leads/${leadId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: agentId })
      });
    } catch (e) {}
    showToast('Lead successfully assigned to agent.');
    renderAdminLeadDetail(leadId);
  }
};

// 6. Won Deal Modal & Commission Workflow
function openWonDealModal(lead) {
  const leadIdInp = document.getElementById('won-lead-id');
  const priceInp = document.getElementById('won-sale-price');
  const subtitle = document.getElementById('won-deal-subtitle');
  const preview = document.getElementById('won-commission-preview');

  if (leadIdInp) leadIdInp.value = lead.id;
  if (subtitle) subtitle.textContent = `Closing sale for client: ${lead.full_name} (${lead.interested_in || 'Dubai Property'})`;

  const defaultPrice = lead.budget_aed || 25000000;
  if (priceInp) {
    priceInp.value = defaultPrice;
    priceInp.oninput = () => {
      const p = Number(priceInp.value) || 0;
      if (preview) preview.textContent = formatAED(p * 0.02);
    };
  }
  if (preview) preview.textContent = formatAED(defaultPrice * 0.02);

  if (wonDealModal) {
    wonDealModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeWonDealModal() {
  if (wonDealModal) {
    wonDealModal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// 7. Admin Viewings Schedule
function renderAdminViewings() {
  let viewings = state.viewings;
  if (state.currentUser && state.currentUser.role === 'agent') {
    viewings = viewings.filter(v => v.agent_id === state.currentUser.id);
  }

  const content = `
    <div class="table-responsive">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>Lead / Client</th>
            <th>Property</th>
            <th>Format</th>
            <th>Assigned Advisor</th>
            <th>Status</th>
            <th>Feedback / Notes</th>
          </tr>
        </thead>
        <tbody>
          ${viewings.map(v => {
            const lead = state.leads.find(l => l.id === v.lead_id) || {};
            const prop = state.properties.find(p => p.id === v.property_id) || {};
            const agent = state.agents.find(a => a.id === v.agent_id) || {};
            return `
              <tr>
                <td style="font-weight: 600;">📅 ${v.viewing_date} • ${v.viewing_time}</td>
                <td class="lead-name-cell" onclick="window.location.hash='#admin/lead/${v.lead_id}'">${lead.full_name || 'Client'}</td>
                <td>${prop.title || 'Dubai Residence'}</td>
                <td>${v.viewing_type || 'In-Person'}</td>
                <td>${agent.full_name || 'Advisor'}</td>
                <td>
                  <span style="font-weight: 600; color: ${v.status === 'Completed' ? '#27AE60' : 'var(--color-gold)'};">
                    ${v.status}
                  </span>
                </td>
                <td style="font-size: 0.78rem; color: var(--color-warm-gray);">${v.feedback || 'Scheduled'}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  renderAdminShell('Client Viewings Calendar', content, 'viewings');
}

// 8. Admin Agent Leaderboard & Stale Leads (No activity for 3+ days)
function renderAdminTeam() {
  const threeDaysAgo = Date.now() - (3 * 86400000);
  const visibleLeads = getVisibleLeads();
  const staleLeads = visibleLeads.filter(l => {
    if (l.status === 'Won' || l.status === 'Lost') return false;
    const lastActive = l.last_activity_at ? new Date(l.last_activity_at).getTime() : new Date(l.created_at).getTime();
    return lastActive < threeDaysAgo;
  });

  const content = `
    <!-- Stale Leads (3+ Days Inactive) Alert Panel -->
    <div class="stale-leads-panel">
      <div class="stale-leads-title">
        <span>⚠️ ATTENTION REQUIRED: ${staleLeads.length} INACTIVE LEADS (NO ACTIVITY IN 3+ DAYS)</span>
      </div>
      <p style="font-size: 0.8rem; color: #7F5800; margin-bottom: 1rem;">
        These buyer prospects have had no calls, stage changes, or advisor notes in over 72 hours.
      </p>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
        ${staleLeads.slice(0, 6).map(sl => `
          <div style="background: #fff; padding: 1rem; border: 1px solid #FFE082; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="color: var(--color-charcoal); font-size: 0.9rem;">${sl.full_name}</strong>
              <div style="font-size: 0.75rem; color: var(--color-warm-gray);">${sl.preferred_community || 'Dubai'} • ${formatAED(sl.budget_aed)}</div>
            </div>
            <button class="btn btn-gold btn-sm" onclick="window.location.hash='#admin/lead/${sl.id}'">Follow Up</button>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Agent Leaderboard -->
    <div style="background: var(--color-white); border: 1px solid var(--color-light-gray); padding: 2rem;">
      <span class="section-label">MONTHLY TARGETS</span>
      <h3 style="font-family: var(--font-heading); font-size: 1.8rem; margin-bottom: 1.5rem;">Agent Performance Leaderboard</h3>

      <div class="leaderboard-list">
        ${state.agents.filter(a => a.role === 'agent').map((ag, idx) => {
          const aSales = state.sales.filter(s => s.agent_id === ag.id);
          const vol = aSales.reduce((s, x) => s + Number(x.sale_price_aed), 0);
          const comm = aSales.reduce((s, x) => s + Number(x.commission_aed), 0);
          const target = ag.target_commission_aed || 500000;
          const progress = Math.min(100, Math.round((comm / target) * 100));

          return `
            <div class="leaderboard-item">
              <div style="font-family: var(--font-heading); font-size: 1.8rem; font-weight: 300; color: var(--color-gold); width: 30px;">
                #${idx + 1}
              </div>
              <div style="display: flex; align-items: center; gap: 1rem;">
                <img src="${ag.photo_url}" alt="${ag.full_name}" class="leaderboard-avatar">
                <div>
                  <h4 style="font-family: var(--font-heading); font-size: 1.25rem; margin-bottom: 0.15rem;">${ag.full_name}</h4>
                  <span style="font-size: 0.75rem; color: var(--color-warm-gray);">${ag.specialization}</span>
                </div>
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.35rem;">
                  <span><strong>${formatAED(comm)}</strong> earned</span>
                  <span style="color: var(--color-warm-gray);">Target: ${formatAED(target)} (${progress}%)</span>
                </div>
                <div style="height: 8px; background: #eee; width: 100%; border-radius: 4px; overflow: hidden;">
                  <div style="height: 100%; width: ${progress}%; background: var(--color-gold);"></div>
                </div>
              </div>

              <div style="text-align: right;">
                <span style="font-size: 0.7rem; color: var(--color-warm-gray); display: block;">CLOSED VOLUME</span>
                <strong style="font-size: 0.95rem;">${formatAED(vol)}</strong>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  renderAdminShell('Performance & Activity', content, 'team');
}

// 9. Admin Properties Inventory CRUD
function renderAdminProperties() {
  const content = `
    <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
      <p style="font-size: 0.85rem; color: var(--color-warm-gray);">
        Manage live property listings, update statuses, or add new ready residences.
      </p>
      <button class="btn btn-gold" onclick="window.openPropertyCrudModal()">+ Add New Property</button>
    </div>

    <div class="table-responsive">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Property Title</th>
            <th>Community</th>
            <th>Type</th>
            <th>Price (AED)</th>
            <th>Bedrooms</th>
            <th>BUA (sq ft)</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${state.properties.map(p => `
            <tr>
              <td style="font-weight: 600;">${p.title}</td>
              <td>${p.location}</td>
              <td>${p.property_type}</td>
              <td>${formatAED(p.price_aed)}</td>
              <td>${p.bedrooms}</td>
              <td>${Number(p.area_sqft).toLocaleString()}</td>
              <td><span style="font-weight: 600; color: ${p.status === 'Sold' ? '#C0392B' : 'var(--color-charcoal)'};">${p.status}</span></td>
              <td>
                <div style="display: flex; gap: 0.5rem;">
                  <button class="btn btn-outline-dark btn-sm" onclick="window.editPropertyModal(${p.id})">Edit</button>
                  <button class="btn btn-outline-dark btn-sm" style="color: #C0392B; border-color: #C0392B;" onclick="window.deletePropertyItem(${p.id})">Delete</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  renderAdminShell('Properties Inventory (CRUD)', content, 'properties');
}

window.openPropertyCrudModal = () => {
  document.getElementById('crud-prop-id').value = '';
  document.getElementById('crud-modal-title').textContent = 'Add New Luxury Property';
  document.getElementById('property-crud-form').reset();
  if (propertyCrudModal) propertyCrudModal.classList.add('active');
};

window.editPropertyModal = (id) => {
  const p = state.properties.find(x => x.id == id);
  if (!p) return;
  document.getElementById('crud-prop-id').value = p.id;
  document.getElementById('crud-modal-title').textContent = `Edit Property: ${p.title}`;
  document.getElementById('crud-title').value = p.title;
  document.getElementById('crud-location').value = p.location;
  document.getElementById('crud-type').value = p.property_type;
  document.getElementById('crud-price').value = p.price_aed;
  document.getElementById('crud-status').value = p.status;
  document.getElementById('crud-bedrooms').value = p.bedrooms;
  document.getElementById('crud-bathrooms').value = p.bathrooms;
  document.getElementById('crud-area').value = p.area_sqft;
  document.getElementById('crud-image').value = p.image_url;
  document.getElementById('crud-desc').value = p.description || '';
  if (propertyCrudModal) propertyCrudModal.classList.add('active');
};

window.deletePropertyItem = async (id) => {
  if (!confirm('Are you sure you want to remove this luxury property listing?')) return;
  const index = state.properties.findIndex(p => p.id == id);
  if (index !== -1) {
    state.properties.splice(index, 1);
    try {
      await fetch(`/api/admin/properties/${id}`, { method: 'DELETE' });
    } catch (e) {}
    showToast('Property listing deleted.');
    renderAdminProperties();
  }
};

// 10. Admin Off-Plan Projects Management
function renderAdminProjects() {
  const content = `
    <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
      <p style="font-size: 0.85rem; color: var(--color-warm-gray);">
        Off-plan landmark masterplans and developer allocations.
      </p>
    </div>

    <div class="table-responsive">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Project Name</th>
            <th>Developer</th>
            <th>Location</th>
            <th>Starting Price</th>
            <th>Payment Plan</th>
            <th>Handover</th>
          </tr>
        </thead>
        <tbody>
          ${state.offPlanProjects.map(op => `
            <tr>
              <td style="font-weight: 600;">${op.name}</td>
              <td>${op.developer_name || 'Prime Developer'}</td>
              <td>${op.location}</td>
              <td>${formatAED(op.starting_price_aed)}</td>
              <td>${op.payment_plan}</td>
              <td>${op.handover_date}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  renderAdminShell('Off-Plan Projects Directory', content, 'projects');
}

// ==============================================================================
// MODAL CONTROLS & GLOBAL EVENT BINDINGS
// ==============================================================================

function openRegisterModal() {
  if (registerModal) {
    registerModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeRegisterModal() {
  if (registerModal) {
    registerModal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

window.openCallbackModal = () => {
  if (callbackModal) {
    callbackModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

function closeCallbackModal() {
  if (callbackModal) {
    callbackModal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function showThankYouModal(title, message) {
  const tTitle = document.getElementById('thankyou-title');
  const tMsg = document.getElementById('thankyou-message');
  if (tTitle) tTitle.textContent = title;
  if (tMsg) tMsg.textContent = message || STANDARD_CONFIRMATION_MSG;
  if (thankyouModal) {
    thankyouModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeThankYouModal() {
  if (thankyouModal) {
    thankyouModal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function showToast(msg) {
  if (!toast || !toastMessage) return;
  toastMessage.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}

function setupGlobalModals() {
  // Register Modal
  const btnOpenRegister = document.getElementById('btn-open-register');
  const registerCloseBtn = document.getElementById('register-close-btn');
  const registerForm = document.getElementById('register-interest-form');

  if (btnOpenRegister) btnOpenRegister.addEventListener('click', openRegisterModal);
  if (registerCloseBtn) registerCloseBtn.addEventListener('click', closeRegisterModal);

  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      closeRegisterModal();
      handleGenericFormSubmit(registerForm, '/api/leads', 'Register Interest Modal');
    });
  }

  // Callback Modal
  const callbackCloseBtn = document.getElementById('callback-close-btn');
  const callbackForm = document.getElementById('callback-form');

  if (floatingCallBackBtn) floatingCallBackBtn.addEventListener('click', window.openCallbackModal);
  if (callbackCloseBtn) callbackCloseBtn.addEventListener('click', closeCallbackModal);

  if (callbackForm) {
    callbackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      closeCallbackModal();
      handleGenericFormSubmit(callbackForm, '/api/leads', 'Call Me Back Widget');
    });
  }

  // Floating WhatsApp Button
  if (floatingWhatsappBtn) {
    floatingWhatsappBtn.addEventListener('click', () => {
      showToast('Opening Jay Real Estate VIP Concierge WhatsApp desk (+971 58 555 9292)...');
      setTimeout(() => {
        window.open('https://api.whatsapp.com/send?phone=971585559292&text=Hello%20Jay%20Real%20Estate%20Concierge,%20I%20would%20like%20to%20inquire%20about%20luxury%20Dubai%20properties.', '_blank');
      }, 700);
    });
  }

  // Won Deal Modal Handlers
  const wonCloseBtn = document.getElementById('won-deal-close-btn');
  const wonForm = document.getElementById('won-deal-form');
  if (wonCloseBtn) wonCloseBtn.addEventListener('click', closeWonDealModal);

  if (wonForm) {
    wonForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const leadId = document.getElementById('won-lead-id').value;
      const salePrice = Number(document.getElementById('won-sale-price').value);
      const commission = salePrice * 0.02;

      const lead = state.leads.find(l => l.id == leadId);
      if (lead) {
        lead.status = 'Won';
        lead.last_activity_at = new Date().toISOString();

        if (lead.property_id) {
          const prop = state.properties.find(p => p.id === lead.property_id);
          if (prop) prop.status = 'Sold';
        }

        const newSale = {
          id: state.sales.length + 1,
          property_id: lead.property_id || null,
          lead_id: lead.id,
          property_title: lead.interested_in || 'Dubai Luxury Residence',
          buyer_name: lead.full_name,
          buyer_contact: lead.phone,
          agent_id: lead.assigned_agent_id || (state.currentUser ? state.currentUser.id : 1),
          sale_price_aed: salePrice,
          commission_aed: commission,
          sale_date: new Date().toISOString().split('T')[0],
          transaction_id: 'DLD-TRX-' + Date.now().toString().slice(-6)
        };
        state.sales.unshift(newSale);

        try {
          await fetch(`/api/admin/leads/${leadId}/won`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sale_price_aed: salePrice, agent_id: newSale.agent_id })
          });
        } catch (err) {}
      }

      closeWonDealModal();
      showToast(`Deal Won! Sale price ${formatAED(salePrice)} logged. Commission earned: ${formatAED(commission)}.`);
      if (state.currentPage === 'admin') {
        if (window.location.hash === '#admin/board') renderAdminKanbanBoard();
        else if (window.location.hash === '#admin/leads') renderAdminLeadsList();
        else renderAdminDashboard();
      }
    });
  }

  // Property CRUD Modal
  const crudCloseBtn = document.getElementById('property-crud-close-btn');
  const crudCancelBtn = document.getElementById('crud-cancel-btn');
  const crudForm = document.getElementById('property-crud-form');

  if (crudCloseBtn) crudCloseBtn.addEventListener('click', () => propertyCrudModal.classList.remove('active'));
  if (crudCancelBtn) crudCancelBtn.addEventListener('click', () => propertyCrudModal.classList.remove('active'));

  if (crudForm) {
    crudForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pId = document.getElementById('crud-prop-id').value;
      const propData = {
        title: document.getElementById('crud-title').value,
        location: document.getElementById('crud-location').value,
        property_type: document.getElementById('crud-type').value,
        price_aed: Number(document.getElementById('crud-price').value),
        status: document.getElementById('crud-status').value,
        bedrooms: Number(document.getElementById('crud-bedrooms').value),
        bathrooms: Number(document.getElementById('crud-bathrooms').value),
        area_sqft: Number(document.getElementById('crud-area').value),
        image_url: document.getElementById('crud-image').value,
        description: document.getElementById('crud-desc').value
      };

      if (pId) {
        // Edit
        const p = state.properties.find(x => x.id == pId);
        if (p) Object.assign(p, propData);
        try {
          await fetch(`/api/admin/properties/${pId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(propData)
          });
        } catch (err) {}
        showToast('Property updated successfully.');
      } else {
        // Add
        const newProp = {
          id: state.properties.length + 1,
          slug: propData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4),
          ...propData,
          gallery_urls: [propData.image_url],
          amenities: ["Private Beach Access", "Infinity Pool", "Smart Home", "Valet"],
          assigned_agent_id: 1,
          featured: true
        };
        state.properties.unshift(newProp);
        try {
          await fetch('/api/admin/properties', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProp)
          });
        } catch (err) {}
        showToast('New property created successfully.');
      }

      propertyCrudModal.classList.remove('active');
      renderAdminProperties();
    });
  }

  // Thank You Modal Close
  const thankyouCloseBtn = document.getElementById('thankyou-close-btn');
  const thankyouOkBtn = document.getElementById('thankyou-ok-btn');
  if (thankyouCloseBtn) thankyouCloseBtn.addEventListener('click', closeThankYouModal);
  if (thankyouOkBtn) thankyouOkBtn.addEventListener('click', closeThankYouModal);

  // Close Modals on click outside
  window.addEventListener('click', (e) => {
    if (e.target === registerModal) closeRegisterModal();
    if (e.target === callbackModal) closeCallbackModal();
    if (e.target === thankyouModal) closeThankYouModal();
    if (e.target === wonDealModal) closeWonDealModal();
    if (e.target === propertyCrudModal) propertyCrudModal.classList.remove('active');
  });
}

function setupMobileNav() {
  if (mobileToggle && mobileMenu && mobileClose) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    mobileClose.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    const mobileRegBtn = document.getElementById('mobile-register-btn');
    if (mobileRegBtn) {
      mobileRegBtn.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
        openRegisterModal();
      });
    }
  }
}

// 4. Initialize Application
async function init() {
  loadSession();
  setupMobileNav();
  setupGlobalModals();
  window.addEventListener('hashchange', navigate);
  window.addEventListener('scroll', handleHeaderScroll, { passive: true });

  // Load from API if available
  try {
    const [pRes, offRes, devRes, agRes, lRes, vRes, sRes] = await Promise.all([
      fetch('/api/properties').then(r => r.json()).catch(() => null),
      fetch('/api/off-plan').then(r => r.json()).catch(() => null),
      fetch('/api/developers').then(r => r.json()).catch(() => null),
      fetch('/api/agents').then(r => r.json()).catch(() => null),
      fetch('/api/admin/leads').then(r => r.json()).catch(() => null),
      fetch('/api/admin/viewings').then(r => r.json()).catch(() => null),
      fetch('/api/admin/sales').then(r => r.json()).catch(() => null)
    ]);

    if (Array.isArray(pRes) && pRes.length > 0) state.properties = pRes;
    if (Array.isArray(offRes) && offRes.length > 0) state.offPlanProjects = offRes;
    if (Array.isArray(devRes) && devRes.length > 0) state.developers = devRes;
    if (Array.isArray(agRes) && agRes.length > 0) state.agents = agRes;
    if (Array.isArray(lRes) && lRes.length > 0) state.leads = lRes;
    if (Array.isArray(vRes) && vRes.length > 0) state.viewings = vRes;
    if (Array.isArray(sRes) && sRes.length > 0) state.sales = sRes;
  } catch (e) {
    console.log('Running with local high-performance cache.');
  }

  navigate();
}

document.addEventListener('DOMContentLoaded', init);
