/**
 * Royal Footprints Transport Ltd - Interactive Engine
 */

// Global State
let currentCurrency = 'USD';
let currentTripType = 'One-Way';
let paxCount = 2;
let bagsCount = 2;
let selectedFleet = 'Executive Sedan';

// Exchange rate constants
const EXCHANGE_RATE_UGX = 3750;

// Base fares in USD
const BASE_FARES = {
  sedan: 40,
  suv: 60,
  van: 80
};

// Route estimates (Pickup -> Dropoff -> USD Rate)
const POPULAR_ROUTES = [
  { pickup: 'Entebbe Airport (EBB)', dropoff: 'Kampala Central (Serena / Sheraton)', sedan: 40, suv: 65, van: 85, duration: '45 mins' },
  { pickup: 'Entebbe Airport (EBB)', dropoff: 'Munyonyo Commonwealth Resort', sedan: 40, suv: 60, van: 80, duration: '35 mins' },
  { pickup: 'Entebbe Airport (EBB)', dropoff: 'Jinja Source of the Nile Hub', sedan: 90, suv: 130, van: 160, duration: '2.5 hrs' },
  { pickup: 'Kampala City Hotel', dropoff: 'Entebbe Airport (EBB) Departure', sedan: 40, suv: 65, van: 85, duration: '45 mins' }
];

// Mobile Navigation Drawer Toggle
function toggleMobileNav() {
  const drawer = document.getElementById('mobileNav');
  const icon = document.getElementById('menuIcon');
  if (drawer) {
    const isActive = drawer.classList.toggle('active');
    if (icon) {
      icon.textContent = isActive ? 'close' : 'menu';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initDefaultDateTime();
  updateCurrencyDisplay();
  initLocationAutocomplete();
});

// Initialize DateTime picker to tomorrow 10:00 AM
function initDefaultDateTime() {
  const dateInput = document.getElementById('pickupDateTime');
  if (dateInput) {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    now.setHours(10, 0, 0, 0);
    // Format YYYY-MM-DDTHH:mm
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    dateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}

// Currency Switcher
function setCurrency(curr) {
  currentCurrency = curr;
  document.querySelectorAll('.currency-btn').forEach(btn => {
    const isUsd = btn.id.includes('usd');
    btn.classList.toggle('active', (isUsd && curr === 'USD') || (!isUsd && curr === 'UGX'));
  });
  updateCurrencyDisplay();
}

function formatPrice(usdPrice) {
  if (currentCurrency === 'UGX') {
    const ugxVal = Math.round((usdPrice * EXCHANGE_RATE_UGX) / 1000) * 1000;
    return `UGX ${ugxVal.toLocaleString()}`;
  }
  return `$${usdPrice}`;
}

function updateCurrencyDisplay() {
  // Update Fleet Cards
  document.getElementById('price-sedan').textContent = `From ${formatPrice(40)}`;
  document.getElementById('price-suv').textContent = `From ${formatPrice(60)}`;
  document.getElementById('price-van').textContent = `From ${formatPrice(80)}`;

  // Update Route Table
  const tableRows = document.querySelectorAll('.route-row');
  tableRows.forEach(row => {
    const sedanUsd = parseInt(row.getAttribute('data-sedan-usd'), 10);
    const suvUsd = parseInt(row.getAttribute('data-suv-usd'), 10);
    
    const sedanEl = row.querySelector('.sedan-rate');
    const suvEl = row.querySelector('.suv-rate');
    
    if (sedanEl) sedanEl.textContent = formatPrice(sedanUsd);
    if (suvEl) suvEl.textContent = formatPrice(suvUsd);
  });
}

// Trip Type Switcher
function setTripType(type) {
  currentTripType = type;
  document.getElementById('tab-oneway').classList.toggle('active', type === 'One-Way');
  document.getElementById('tab-roundtrip').classList.toggle('active', type === 'Two-Way');
}

// Stepper Adjusters
function adjustCount(target, delta) {
  if (target === 'pax') {
    paxCount = Math.max(1, Math.min(10, paxCount + delta));
    document.getElementById('paxCount').textContent = paxCount;
  } else if (target === 'bags') {
    bagsCount = Math.max(0, Math.min(12, bagsCount + delta));
    document.getElementById('bagsCount').textContent = bagsCount;
  }
}

// Apply Fast Route Presets
function applyPreset(pickup, dropoff) {
  const pickupEl = document.getElementById('pickupInput');
  const dropoffEl = document.getElementById('dropoffInput');
  
  if (pickupEl) pickupEl.value = pickup;
  if (dropoffEl) dropoffEl.value = dropoff;

  // Flash highlight input cards
  pickupEl.closest('.input-card').style.borderColor = 'var(--primary)';
  dropoffEl.closest('.input-card').style.borderColor = 'var(--primary)';
  setTimeout(() => {
    pickupEl.closest('.input-card').style.borderColor = '#cbd5e1';
    dropoffEl.closest('.input-card').style.borderColor = '#cbd5e1';
  }, 1000);
}

function applyPresetAndInquire(pickup, dropoff) {
  applyPreset(pickup, dropoff);
  sendWhatsAppInquiry();
}

// Fleet Selection Inquiry
function selectFleetAndInquire(fleetName, baseUsdPrice) {
  selectedFleet = fleetName;
  sendWhatsAppInquiry(fleetName, baseUsdPrice);
}

// Main WhatsApp Dispatch Link Builder
function sendWhatsAppInquiry(overrideFleet = null, overrideUsdRate = null) {
  const pickup = document.getElementById('pickupInput').value.trim() || 'Entebbe International Airport (EBB)';
  const dropoff = document.getElementById('dropoffInput').value.trim() || 'Kampala Serena Hotel';
  const dateVal = document.getElementById('pickupDateTime').value || 'Immediate Dispatch';
  
  const fleetTier = overrideFleet || selectedFleet;
  
  // Calculate estimate
  let usdBase = overrideUsdRate || 40;
  if (!overrideUsdRate) {
    if (fleetTier.includes('SUV')) usdBase = 60;
    else if (fleetTier.includes('Van')) usdBase = 80;
  }

  // Adjust for two way
  const finalUsd = currentTripType === 'Two-Way' ? Math.round(usdBase * 1.85) : usdBase;
  const priceDisplay = formatPrice(finalUsd);

  const message = 
`*ROYAL FOOTPRINTS EXECUTIVE CAR DISPATCH*%0A` +
`----------------------------------------%0A` +
`*Vehicle Tier:* ${fleetTier}%0A` +
`*Trip Type:* ${currentTripType}%0A` +
`*Pick-up Location:* ${pickup}%0A` +
`*Drop-off Destination:* ${dropoff}%0A` +
`*Date & Time:* ${dateVal}%0A` +
`*Passengers:* ${paxCount} pax | *Luggage:* ${bagsCount} bags%0A` +
`*Estimated Rate:* ${priceDisplay}%0A` +
`----------------------------------------%0A` +
`Please confirm chauffeur availability and pickup window.`;

  const whatsappNumber = "256700000000";
  window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
}

// FAQ Accordion Toggle
function toggleFaq(id) {
  const item = document.getElementById(`faq-item-${id}`);
  if (item) {
    item.classList.toggle('active');
  }
}

// Fleet Spec Inspection Modal
function openFleetModal(fleetType) {
  const modal = document.getElementById('fleetModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  let title = "Vehicle Specifications";
  let content = "";

  if (fleetType === 'sedan') {
    title = "Executive Sedan: Mercedes-Benz E-Class / Toyota Crown";
    content = `
      <div style="display:flex; flex-direction:column; gap:1rem;">
        <img src="assets/sedan.png" style="width:100%; height:200px; object-fit:cover; border-radius:12px;" />
        <p style="font-size:0.9rem; color:var(--text-variant);">Ideal for executive solo travelers, diplomats, and couples requiring quiet, refined airport transfers across Entebbe and Kampala.</p>
        <ul style="list-style:none; display:flex; flex-direction:column; gap:0.5rem; font-size:0.85rem; font-weight:600;">
          <li style="display:flex; align-items:center; gap:0.35rem;"><span class="material-symbols-outlined" style="font-size:16px; color:var(--primary);">check</span> Capacity: Up to 3 Passengers + 2 Suitcases</li>
          <li style="display:flex; align-items:center; gap:0.35rem;"><span class="material-symbols-outlined" style="font-size:16px; color:var(--primary);">check</span> In-Car Amenities: High-speed Wi-Fi, chilled mineral water, universal USB-C chargers</li>
          <li style="display:flex; align-items:center; gap:0.35rem;"><span class="material-symbols-outlined" style="font-size:16px; color:var(--primary);">check</span> Security & Comfort: Privacy tinted rear glass, multi-zone automatic climate control</li>
          <li style="display:flex; align-items:center; gap:0.35rem;"><span class="material-symbols-outlined" style="font-size:16px; color:var(--primary);">check</span> All-Inclusive Rate: Express toll card included, zero surprise airport parking fees</li>
        </ul>
        <button onclick="selectFleetAndInquire('Executive Sedan', 40)" class="btn-whatsapp-inquire" style="width:100%; margin-top:0.5rem;">Book Executive Sedan Now</button>
      </div>
    `;
  } else if (fleetType === 'suv') {
    title = "VIP SUV: Toyota Land Cruiser V8 / Prado Executive";
    content = `
      <div style="display:flex; flex-direction:column; gap:1rem;">
        <img src="assets/suv.png" style="width:100%; height:200px; object-fit:cover; border-radius:12px;" />
        <p style="font-size:0.9rem; color:var(--text-variant);">Built for ultimate luxury, diplomatic delegations, high-profile executives, and off-road stability for intercity travel across Uganda.</p>
        <ul style="list-style:none; display:flex; flex-direction:column; gap:0.5rem; font-size:0.85rem; font-weight:600;">
          <li style="display:flex; align-items:center; gap:0.35rem;"><span class="material-symbols-outlined" style="font-size:16px; color:var(--primary);">check</span> Capacity: Up to 4 Passengers + 4 Large Suitcases</li>
          <li style="display:flex; align-items:center; gap:0.35rem;"><span class="material-symbols-outlined" style="font-size:16px; color:var(--primary);">check</span> In-Car Amenities: Premium leather reclining seats, satellite navigation, Wi-Fi</li>
          <li style="display:flex; align-items:center; gap:0.35rem;"><span class="material-symbols-outlined" style="font-size:16px; color:var(--primary);">check</span> Ground Clearance: High-suspension smooth ride for both Expressway and rugged terrain</li>
          <li style="display:flex; align-items:center; gap:0.35rem;"><span class="material-symbols-outlined" style="font-size:16px; color:var(--primary);">check</span> Security & Protocol: Vetted uniformed chauffeur, live GPS tracking</li>
        </ul>
        <button onclick="selectFleetAndInquire('Luxury Chauffeur SUV', 60)" class="btn-whatsapp-inquire" style="width:100%; margin-top:0.5rem;">Book VIP SUV Now</button>
      </div>
    `;
  } else if (fleetType === 'van') {
    title = "Executive Van: Toyota Alphard VIP / Custom HiAce";
    content = `
      <div style="display:flex; flex-direction:column; gap:1rem;">
        <img src="assets/van.png" style="width:100%; height:200px; object-fit:cover; border-radius:12px;" />
        <p style="font-size:0.9rem; color:var(--text-variant);">The gold standard for corporate teams, family delegations, and tour groups seeking spacious first-class comfort.</p>
        <ul style="list-style:none; display:flex; flex-direction:column; gap:0.5rem; font-size:0.85rem; font-weight:600;">
          <li style="display:flex; align-items:center; gap:0.35rem;"><span class="material-symbols-outlined" style="font-size:16px; color:var(--primary);">check</span> Capacity: Up to 7-9 Passengers + 8 Large Suitcases</li>
          <li style="display:flex; align-items:center; gap:0.35rem;"><span class="material-symbols-outlined" style="font-size:16px; color:var(--primary);">check</span> Interior Luxury: First-class captain reclining seats, dual automatic electric sliding doors</li>
          <li style="display:flex; align-items:center; gap:0.35rem;"><span class="material-symbols-outlined" style="font-size:16px; color:var(--primary);">check</span> Climate Control: Dual front and rear independent AC cooling blowers</li>
          <li style="display:flex; align-items:center; gap:0.35rem;"><span class="material-symbols-outlined" style="font-size:16px; color:var(--primary);">check</span> Complimentary: Airport Meet & Greet with personalized digital nameboard</li>
        </ul>
        <button onclick="selectFleetAndInquire('Executive Passenger Van', 80)" class="btn-whatsapp-inquire" style="width:100%; margin-top:0.5rem;">Book Executive Van Now</button>
      </div>
    `;
  }

  modalTitle.textContent = title;
  modalBody.innerHTML = content;
  modal.classList.add('active');
}

function closeModal() {
  document.getElementById('fleetModal').classList.remove('active');
}

// GOOGLE LOCATION AUTOCOMPLETE & HELPER ENGINE
const EXECUTIVE_LOCATIONS = [
  { title: 'Entebbe International Airport (EBB)', subtitle: 'Main International Terminal, Airport Road', icon: 'flight_takeoff', category: 'Airport', keywords: 'ebb entebbe airport terminal flight' },
  { title: 'Entebbe VIP & Diplomatic Air Lounge', subtitle: 'VIP Terminal, EBB Airport Road', icon: 'flight_takeoff', category: 'VIP Lounge', keywords: 'vip lounge entebbe charter private' },
  { title: 'Kampala Serena Hotel', subtitle: 'Kintu Road, Nakasero, Kampala', icon: 'hotel', category: 'Luxury Hotel', keywords: 'serena hotel kampala nakasero' },
  { title: 'Sheraton Kampala Hotel', subtitle: 'Ternan Avenue, Nakasero, Kampala', icon: 'hotel', category: 'Luxury Hotel', keywords: 'sheraton hotel kampala nakasero' },
  { title: 'Speke Resort Munyonyo & Conference Centre', subtitle: 'Wavamunno Road, Lake Victoria, Munyonyo', icon: 'hotel', category: 'Resort', keywords: 'speke resort munyonyo commonwealth lake victoria' },
  { title: 'Lake Victoria Serena Golf Resort & Spa', subtitle: 'Kigo, Entebbe Express Highway', icon: 'hotel', category: 'Golf Resort', keywords: 'serena kigo lake victoria golf resort spa' },
  { title: 'Latitude 0 Degrees Hotel', subtitle: 'Mobutu Road, Bugolobi, Kampala', icon: 'hotel', category: 'Boutique Hotel', keywords: 'latitude 0 zero bugolobi hotel' },
  { title: 'Protea Hotel Kampala Skyz', subtitle: 'Waterloo Road, Naguru, Kampala', icon: 'hotel', category: 'Luxury Hotel', keywords: 'protea skyz naguru hill kampala' },
  { title: 'Protea Hotel Entebbe', subtitle: 'Airport Road, Entebbe Shoreline', icon: 'hotel', category: 'Airport Hotel', keywords: 'protea hotel entebbe airport road' },
  { title: 'Hotel No.5 Entebbe', subtitle: 'Helena Road, Executive Entebbe', icon: 'hotel', category: 'Boutique Suites', keywords: 'hotel 5 no 5 entebbe' },
  { title: 'Mestil Hotel & Residences', subtitle: 'Barracks Drive, Nsambya, Kampala', icon: 'hotel', category: 'Luxury Suites', keywords: 'mestil nsambya hotel residence' },
  { title: 'The Boma Hotel Entebbe', subtitle: 'Julia Sebutinde Road, Entebbe', icon: 'hotel', category: 'Boutique Hotel', keywords: 'boma hotel entebbe' },
  { title: 'Acacia Mall & Dining Hub', subtitle: 'Acacia Avenue, Kololo, Kampala', icon: 'business', category: 'Commercial Hub', keywords: 'acacia mall kololo shopping dining' },
  { title: 'Oasis & Garden City Mall', subtitle: 'Yusuf Lule Road, Golf Course Area, Kampala', icon: 'business', category: 'Shopping Hub', keywords: 'oasis garden city mall kampala cbd' },
  { title: 'Village Mall Bugolobi', subtitle: 'Spring Road, Bugolobi, Kampala', icon: 'business', category: 'Dining Hub', keywords: 'village mall bugolobi spring road' },
  { title: 'Victoria Mall Entebbe', subtitle: 'Berkeley Road, Entebbe Town', icon: 'business', category: 'Shopping Hub', keywords: 'victoria mall entebbe town' },
  { title: 'Nakasero Diplomatic District', subtitle: 'Nakasero Hill, Kampala Central', icon: 'location_on', category: 'Embassy Zone', keywords: 'nakasero embassy diplomatic district' },
  { title: 'Kololo Executive Ridge', subtitle: 'Kololo Hill Drive, Kampala', icon: 'location_on', category: 'Executive Zone', keywords: 'kololo hill residence diplomatic' },
  { title: 'Naguru Heights', subtitle: 'Naguru Drive, Kampala East', icon: 'location_on', category: 'Residential Zone', keywords: 'naguru heights kampala' },
  { title: 'Jinja Source of the Nile Hub', subtitle: 'Nile Avenue, Jinja Adventure City', icon: 'location_on', category: 'Tourist Hub', keywords: 'jinja nile source rafting tour' }
];

function initLocationAutocomplete() {
  setupAutocompleteForInput('pickupInput', 'pickupSuggestions', 'clearPickup');
  setupAutocompleteForInput('dropoffInput', 'dropoffSuggestions', 'clearDropoff');

  // Attempt Google Places API Autocomplete if Google Maps script is injected
  if (window.google && window.google.maps && window.google.maps.places) {
    try {
      const pickupEl = document.getElementById('pickupInput');
      const dropoffEl = document.getElementById('dropoffInput');
      if (pickupEl) new window.google.maps.places.Autocomplete(pickupEl);
      if (dropoffEl) new window.google.maps.places.Autocomplete(dropoffEl);
    } catch (e) {
      console.log('Google Places API initialized with local helper fallback.');
    }
  }
}

function setupAutocompleteForInput(inputId, dropdownId, clearBtnId) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(dropdownId);
  const clearBtn = document.getElementById(clearBtnId);

  if (!input || !dropdown) return;

  let activeIndex = -1;

  function renderSuggestions(query) {
    const cleanQuery = query.toLowerCase().trim();
    let matches = EXECUTIVE_LOCATIONS;

    if (cleanQuery.length > 0) {
      matches = EXECUTIVE_LOCATIONS.filter(loc => 
        loc.title.toLowerCase().includes(cleanQuery) || 
        loc.subtitle.toLowerCase().includes(cleanQuery) ||
        loc.keywords.toLowerCase().includes(cleanQuery)
      );
    }

    if (matches.length === 0 && cleanQuery.length > 0) {
      dropdown.innerHTML = `
        <div class="suggestion-item" onclick="selectCustomLocation('${inputId}', '${escapeHtml(query)}')">
          <div class="suggestion-icon"><span class="material-symbols-outlined">edit_location</span></div>
          <div class="suggestion-details">
            <div class="suggestion-title">Use Custom Location: "${escapeHtml(query)}"</div>
            <div class="suggestion-meta">
              <span class="suggestion-sub">Custom address or landmark for dispatch</span>
              <span class="suggestion-badge">Custom</span>
            </div>
          </div>
        </div>
        <div class="autocomplete-footer">
          <span>Location Auto-Help Active</span>
          <span style="color:var(--primary); font-weight:700;">Google Location Helper</span>
        </div>
      `;
    } else {
      let html = matches.slice(0, 6).map((loc, idx) => `
        <div class="suggestion-item ${idx === activeIndex ? 'highlighted' : ''}" onclick="selectLocation('${inputId}', '${escapeHtml(loc.title)}')">
          <div class="suggestion-icon"><span class="material-symbols-outlined">${loc.icon}</span></div>
          <div class="suggestion-details">
            <div class="suggestion-title">${loc.title}</div>
            <div class="suggestion-meta">
              <span class="suggestion-sub">${loc.subtitle}</span>
              <span class="suggestion-badge">${loc.category}</span>
            </div>
          </div>
        </div>
      `).join('');

      html += `
        <div class="autocomplete-footer">
          <span>Google Location Auto-Help</span>
          <span style="color:var(--primary); font-weight:700;">24/7 Verified Dispatch</span>
        </div>
      `;
      dropdown.innerHTML = html;
    }

    dropdown.classList.add('active');
  }

  input.addEventListener('focus', () => {
    renderSuggestions(input.value);
    toggleClearBtn(input, clearBtn);
  });

  input.addEventListener('input', () => {
    activeIndex = -1;
    renderSuggestions(input.value);
    toggleClearBtn(input, clearBtn);
  });

  input.addEventListener('keydown', (e) => {
    const items = dropdown.querySelectorAll('.suggestion-item');
    if (!items.length || !dropdown.classList.contains('active')) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = (activeIndex + 1) % items.length;
      updateHighlight(items, activeIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = (activeIndex - 1 + items.length) % items.length;
      updateHighlight(items, activeIndex);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && items[activeIndex]) {
        e.preventDefault();
        items[activeIndex].click();
      }
    } else if (e.key === 'Escape') {
      dropdown.classList.remove('active');
    }
  });

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('active');
    }
  });
}

function updateHighlight(items, index) {
  items.forEach((item, i) => {
    item.classList.toggle('highlighted', i === index);
  });
}

function toggleClearBtn(input, clearBtn) {
  if (clearBtn) {
    clearBtn.style.display = input.value.trim().length > 0 ? 'flex' : 'none';
  }
}

function clearLocationInput(inputId) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(inputId === 'pickupInput' ? 'pickupSuggestions' : 'dropoffSuggestions');
  const clearBtn = document.getElementById(inputId === 'pickupInput' ? 'clearPickup' : 'clearDropoff');

  if (input) {
    input.value = '';
    input.focus();
  }
  if (clearBtn) clearBtn.style.display = 'none';
  if (dropdown) dropdown.classList.remove('active');
}

function selectLocation(inputId, text) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(inputId === 'pickupInput' ? 'pickupSuggestions' : 'dropoffSuggestions');
  const clearBtn = document.getElementById(inputId === 'pickupInput' ? 'clearPickup' : 'clearDropoff');

  if (input) {
    input.value = text;
    input.closest('.input-card').style.borderColor = 'var(--primary)';
    setTimeout(() => {
      input.closest('.input-card').style.borderColor = '#cbd5e1';
    }, 800);
  }
  if (clearBtn) clearBtn.style.display = 'flex';
  if (dropdown) dropdown.classList.remove('active');
}

function selectCustomLocation(inputId, text) {
  selectLocation(inputId, text);
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
