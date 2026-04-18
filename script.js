function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(pageId);
  if (target) {
    target.classList.add('active');
    window.scrollTo(0, 0);
    // Trigger reveal animations on landing
    if (pageId === 'landing-page') setTimeout(initReveal, 100);
    if (pageId === 'dashboard-page') queueMicrotask(() => loadStaticDashboard());
  }
}

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

const breedMapByPetType = {
  dog: ['Labrador Retriever', 'German Shepherd', 'Golden Retriever', 'Beagle', 'Shih Tzu', 'Indie Dog'],
  cat: ['Indian Shorthair', 'Persian', 'Siamese', 'Maine Coon', 'Bengal'],
  bird: ['Budgie', 'Parrot', 'Cockatiel', 'Lovebird', 'Canary'],
  rabbit: ['Lop', 'Dutch', 'Rex', 'Angora', 'Lionhead'],
  fish: ['Goldfish', 'Betta', 'Guppy', 'Koi', 'Molly']
};

function updateBreedOptions(petTypeSelectId, breedSelectId) {
  const petTypeSelect = document.getElementById(petTypeSelectId);
  const breedSelect = document.getElementById(breedSelectId);
  if (!petTypeSelect || !breedSelect) return;

  const petType = petTypeSelect.value;
  const breeds = breedMapByPetType[petType] || [];
  breedSelect.innerHTML = '';

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = breeds.length ? 'Select Breed' : 'Select Pet Type First';
  breedSelect.appendChild(placeholder);

  breeds.forEach((breed) => {
    const option = document.createElement('option');
    option.value = breed;
    option.textContent = breed;
    breedSelect.appendChild(option);
  });
}

/* ──────────────────────────────────────────
   AUTH TABS
────────────────────────────────────────── */
function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  document.getElementById(`form-${tab}`).classList.add('active');
}

/* ──────────────────────────────────────────
   AVATAR PREVIEW
────────────────────────────────────────── */
function previewAvatar(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const preview = document.getElementById('avatar-preview');
    preview.innerHTML = `<img src="${e.target.result}" alt="Pet avatar" />`;
  };
  reader.readAsDataURL(file);
}

/* ──────────────────────────────────────────
   GENDER TOGGLE
────────────────────────────────────────── */
function selectModalGender(gender) {
  document.getElementById('modal-g-male')?.classList.toggle('active', gender === 'male');
  document.getElementById('modal-g-female')?.classList.toggle('active', gender === 'female');
  document.getElementById('modal-g-unknown')?.classList.toggle('active', gender === 'unknown');
  window.__modalPetGender = gender;
}

/* ──────────────────────────────────────────
   WEIGHT SLIDER SYNC
────────────────────────────────────────── */
function syncSlider() {
  const num = document.getElementById('weight-num');
  const slider = document.getElementById('weight-slider');
  if (slider && num.value) slider.value = num.value;
}
function syncWeight() {
  const slider = document.getElementById('weight-slider');
  const num = document.getElementById('weight-num');
  if (num && slider) num.value = slider.value;
}

/* ──────────────────────────────────────────
   AUTH + DASHBOARD DATA (localStorage only, no API)
────────────────────────────────────────── */
const PAW_USERS_KEY = 'pawlife_users';
const PAW_CURRENT_USER_KEY = 'pawlife_current_user';
const PAW_LEGACY_SESSION_KEY = 'pawlife_session';
const PAW_PETS_KEY = 'pawlife_pets';
const PAW_SELECTED_PET_KEY = 'pawlife_selected_pet_id';
const PAW_NOTIFICATIONS_KEY = 'pawlife_notifications';
const PAW_DIETS_KEY = 'pawlife_diets';
const PAW_SUBSCRIPTIONS_KEY = 'pawlife_subscriptions';
const PAW_PETMATES_REQUESTS_KEY = 'pawlife_petmates_requests';
const PAW_PETMATES_WELCOME_KEY = 'pawlife_petmates_welcome_sent';
const PAW_PETMATES_DEMO_KEY = 'pawlife_petmates_demo_profiles';
const PAW_PETMATES_MODE_KEY = 'pawlife_petmates_mode';

const DIET_FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const PM_CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata'];

function readPetmatesDemoDb() {
  try {
    const raw = localStorage.getItem(PAW_PETMATES_DEMO_KEY);
    const o = raw ? JSON.parse(raw) : {};
    return typeof o === 'object' && o && !Array.isArray(o) ? o : {};
  } catch {
    return {};
  }
}

function writePetmatesDemoDb(db) {
  localStorage.setItem(PAW_PETMATES_DEMO_KEY, JSON.stringify(db));
}

function buildPetmatesProfilesForSpecies(species) {
  const intents = ['breeding', 'companion', 'playdate'];
  const rows = {
    dog: [
      ['Asha', 'Golden Retriever', 'female', 3, true, true, 'Up to date', 'Healthy', 'Friendly retriever who loves fetch and calm introductions.'],
      ['Motu', 'Labrador Retriever', 'male', 4, true, true, 'Up to date', 'Healthy', 'Swims daily — great for active playdates.'],
      ['Choti', 'Beagle', 'female', 2, false, true, 'Due in 30 days', 'Healthy', 'Curious nose; prefers leashed meet-and-greets.'],
      ['Raja', 'Indie Dog', 'male', 5, true, false, 'Up to date', 'Healthy', 'Rescue with gentle leash manners.'],
      ['Snow', 'Shih Tzu', 'male', 6, true, true, 'Up to date', 'Healthy', 'Small-frame companion for quiet homes.']
    ],
    cat: [
      ['Meena', 'Persian', 'female', 4, true, true, 'Up to date', 'Healthy', 'Quiet lap cat; slow introductions work best.'],
      ['Raju', 'Indian Shorthair', 'male', 3, true, true, 'Up to date', 'Healthy', 'Street-smart indoor cat, playful evenings.'],
      ['Bini', 'Siamese', 'female', 2, false, true, 'Due in 45 days', 'Healthy', 'Chatty but affectionate with familiar faces.'],
      ['Sapphire', 'Bengal', 'male', 3, true, true, 'Up to date', 'Healthy', 'Needs climbing space; high play drive.'],
      ['Fluffy', 'Maine Coon', 'female', 5, true, true, 'Up to date', 'Healthy', 'Gentle giant; good with supervised visits.']
    ],
    bird: [
      ['Kiwi', 'Budgie', 'female', 1, true, false, 'N/A', 'Healthy', 'Colourful budgie; short supervised out-of-cage meets.'],
      ['Rio', 'Cockatiel', 'male', 2, true, true, 'Up to date', 'Healthy', 'Whistles softly; enjoys shoulder time with trusted humans.'],
      ['Mithu', 'Parrot', 'female', 6, true, true, 'Up to date', 'Healthy', 'Larger bird — structured sessions only.'],
      ['Sunny', 'Lovebird', 'male', 1, false, true, 'N/A', 'Healthy', 'Pair-oriented; calm flock-style introductions.'],
      ['Sky', 'Canary', 'female', 2, true, false, 'N/A', 'Healthy', 'Delicate songbird; low-stress environment.']
    ],
    rabbit: [
      ['Thumper', 'Lop', 'male', 2, true, true, 'Up to date', 'Healthy', 'Hay-first diet; gentle handling only.'],
      ['Momo', 'Rex', 'female', 3, true, true, 'Up to date', 'Healthy', 'Velvet coat; loves floor time in safe pens.'],
      ['Basil', 'Dutch', 'male', 1, false, true, 'Due in 14 days', 'Healthy', 'Young bun — supervised play only.'],
      ['Clover', 'Angora', 'female', 4, true, false, 'Up to date', 'Healthy', 'Grooming routine in place; calm temperament.'],
      ['Hazel', 'Lionhead', 'female', 2, true, true, 'Up to date', 'Healthy', 'Fluffy mane; prefers same-species bonding.']
    ],
    fish: [
      ['Bubbles', 'Goldfish', 'unknown', 1, false, false, 'N/A', 'Healthy', 'Cold-water community tank; meet for care tips only.'],
      ['Flash', 'Betta', 'male', 1, true, false, 'N/A', 'Healthy', 'Solo tank — no cohab demos; species-care chat.'],
      ['Dot', 'Guppy', 'unknown', 1, false, false, 'N/A', 'Healthy', 'Peaceful nano tank; breeding by intent only in demo.'],
      ['River', 'Koi', 'unknown', 4, true, false, 'N/A', 'Healthy', 'Pond fish — outdoor meet guidance only.'],
      ['Pearl', 'Molly', 'female', 1, false, true, 'N/A', 'Healthy', 'Brackish-friendly; social schooling species.']
    ]
  };
  const pack = rows[species] || rows.dog;
  return pack.map((row, i) => ({
    id: `pm_${species}_${i}`,
    petName: row[0],
    species,
    breed: row[1],
    gender: row[2],
    ageYears: row[3],
    ownerVerified: row[4],
    vaccinationVerified: row[5],
    vaccinationStatus: row[6],
    healthStatus: row[7],
    healthClearance: true,
    locationCity: PM_CITIES[i % PM_CITIES.length],
    intentSupported: [...intents],
    description: row[8],
    weightKg: species === 'fish' ? Math.round((0.02 + i * 0.01) * 100) / 100 : 1.5 + i * 1.2
  }));
}

function getDemoProfilesForSpecies(species) {
  const sp = String(species || 'dog').toLowerCase();
  const db = readPetmatesDemoDb();
  if (Array.isArray(db[sp]) && db[sp].length >= 5) return db[sp];
  const built = buildPetmatesProfilesForSpecies(sp);
  db[sp] = built;
  writePetmatesDemoDb(db);
  return built;
}

function getPersistedPetmatesMode() {
  try {
    const m = localStorage.getItem(PAW_PETMATES_MODE_KEY);
    if (m === 'breeding' || m === 'companion' || m === 'playdate') return m;
  } catch {
    /* ignore */
  }
  return 'breeding';
}

function profileSupportsMode(pr, mode) {
  return Array.isArray(pr.intentSupported) && pr.intentSupported.includes(mode);
}

function readSubsDb() {
  try {
    const raw = localStorage.getItem(PAW_SUBSCRIPTIONS_KEY);
    const o = raw ? JSON.parse(raw) : {};
    return typeof o === 'object' && o && !Array.isArray(o) ? o : {};
  } catch {
    return {};
  }
}

function saveSubsDb(db) {
  localStorage.setItem(PAW_SUBSCRIPTIONS_KEY, JSON.stringify(db));
}

function ensureSubscription(email) {
  const k = normalizeEmail(email);
  const db = readSubsDb();
  if (!db[k]) {
    db[k] = {
      plan: 'free',
      expiresAt: Date.now() + 365 * 86400000
    };
    saveSubsDb(db);
  }
  return db[k];
}

function getSubscription() {
  const s = getSession();
  if (!s) return { plan: 'free', expiresAt: Date.now() + 365 * 86400000 };
  return ensureSubscription(s.email);
}

function planTier(plan) {
  const p = String(plan || 'free').toLowerCase();
  if (p === 'elite') return 2;
  if (p === 'pro') return 1;
  return 0;
}

function hasPro() {
  return planTier(getSubscription().plan) >= 1;
}

function hasElite() {
  return planTier(getSubscription().plan) >= 2;
}

function maxPetsForPlan() {
  return hasElite() ? 99 : hasPro() ? 25 : 2;
}

function setSubscriptionPlan(plan) {
  const s = getSession();
  if (!s) return;
  const k = normalizeEmail(s.email);
  ensureSubscription(k);
  const db = readSubsDb();
  const next = plan === 'elite' ? 'elite' : plan === 'pro' ? 'pro' : 'free';
  db[k] = {
    plan: next,
    expiresAt: Date.now() + 90 * 86400000
  };
  saveSubsDb(db);
  const expStr = new Date(db[k].expiresAt).toLocaleDateString();
  addNotification({
    title: 'Subscription updated',
    message: `Your demo plan is now ${next.toUpperCase()}. Renewal date: ${expStr}.`,
    type: 'subscription'
  });
  showToast(`You're on ${next.toUpperCase()} (demo).`, 'success');
  updatePlanBadge();
  renderSubscriptionPage();
  loadStaticDashboard();
}

function updatePlanBadge() {
  const el = document.getElementById('plan-chip-badge');
  if (!el) return;
  const sub = getSubscription();
  const p = String(sub.plan || 'free').toLowerCase();
  if (p === 'elite') {
    el.textContent = 'ELITE';
    el.style.display = 'inline-block';
  } else if (p === 'pro') {
    el.textContent = 'PRO';
    el.style.display = 'inline-block';
  } else {
    el.textContent = '';
    el.style.display = 'none';
  }
}

function updateDoctorPriorityBadge() {
  const b = document.getElementById('doctor-priority-badge');
  if (b) b.style.display = hasElite() ? 'inline' : 'none';
}

function applyUpgradeFromModal() {
  const p = window.__upgradeTargetPlan === 'elite' ? 'elite' : 'pro';
  setSubscriptionPlan(p);
  closeModal('upgrade-modal');
}

function demoSetRequestStatus(reqId, status) {
  const list = getPetmatesRequestsForUser().map((r) => (r.id === reqId ? { ...r, status } : r));
  savePetmatesRequestForUser(list);
  addNotification({
    title: 'Match request updated',
    message: `Request marked ${status} (local demo).`,
    type: 'petmates'
  });
  renderPetmatesRequestList();
}

function openUpgradeModal(title, message, targetPlan) {
  const t = document.getElementById('upgrade-modal-title');
  const m = document.getElementById('upgrade-modal-body');
  const hint = document.getElementById('upgrade-modal-hint');
  if (t) t.textContent = title;
  if (m) m.textContent = message;
  if (hint) {
    hint.textContent =
      targetPlan === 'elite'
        ? 'Elite unlocks this feature.'
        : 'Upgrade to Pro or Elite to unlock this feature.';
  }
  window.__upgradeTargetPlan = targetPlan || 'pro';
  openModal('upgrade-modal');
}

function goToSubscriptionFromUpgrade() {
  closeModal('upgrade-modal');
  const link = document.querySelector('.sidebar-nav a[onclick*="subscription"]');
  if (link) showSection('subscription', link);
  else showSection('subscription', null);
}

function renderSubscriptionPage() {
  const sub = getSession() ? getSubscription() : { plan: 'free', expiresAt: Date.now() };
  const plan = String(sub.plan || 'free').toLowerCase();
  const exp = sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString() : '—';
  const cur = document.getElementById('sub-current-plan');
  const ex = document.getElementById('sub-expiry-date');
  if (cur) cur.textContent = plan.charAt(0).toUpperCase() + plan.slice(1);
  if (ex) ex.textContent = exp;
  document.querySelectorAll('[data-plan-row]').forEach((row) => {
    const r = row.getAttribute('data-plan-row');
    row.classList.toggle('sub-row-active', r === plan);
  });
}

function readPetmatesRequestsDb() {
  try {
    const raw = localStorage.getItem(PAW_PETMATES_REQUESTS_KEY);
    const o = raw ? JSON.parse(raw) : {};
    return typeof o === 'object' && o && !Array.isArray(o) ? o : {};
  } catch {
    return {};
  }
}

function getPetmatesRequestsForUser() {
  const s = getSession();
  if (!s) return [];
  const db = readPetmatesRequestsDb();
  const list = db[normalizeEmail(s.email)];
  return Array.isArray(list) ? list : [];
}

function savePetmatesRequestForUser(list) {
  const s = getSession();
  if (!s) return;
  const db = readPetmatesRequestsDb();
  db[normalizeEmail(s.email)] = list;
  localStorage.setItem(PAW_PETMATES_REQUESTS_KEY, JSON.stringify(db));
}

function proPetmatesRequestCap() {
  return 30;
}

function canSendPetmatesRequest() {
  if (hasElite()) return true;
  if (!hasPro()) return false;
  return getPetmatesRequestsForUser().length < proPetmatesRequestCap();
}

function maybePetmatesWelcomeNotif() {
  if (!getSession() || localStorage.getItem(PAW_PETMATES_WELCOME_KEY)) return;
  localStorage.setItem(PAW_PETMATES_WELCOME_KEY, '1');
  addNotification({
    title: 'PetMates demo profiles',
    message: 'Browse responsible matches. Upgrade to Pro to send requests.',
    type: 'petmates'
  });
}

function petAgeYears(pet) {
  return Math.max(0.25, Number(pet?.ageYears) || 1);
}

function profileAgeYears(pr) {
  return Math.max(0.25, Number(pr.ageYears != null ? pr.ageYears : pr.age) || 1);
}

function breedingGenderPairOk(myGender, profileGender) {
  const g = (x) => String(x || '').toLowerCase();
  const a = g(myGender);
  const b = g(profileGender);
  if (a === 'unknown' || b === 'unknown') return { ok: true, warn: 'Unknown gender — confirm before breeding.' };
  if (a === b) return { ok: false, warn: 'Same sex — not ideal for breeding introductions.' };
  return { ok: true, warn: '' };
}

function computeMatchScore(myPet, profile, mode, cityFilter) {
  const reasons = [];
  let score = 35;
  if (!myPet) return { score: 0, reasons: ['Add a pet to compute compatibility.'], warn: '' };
  if (String(myPet.petType) !== String(profile.species)) {
    return { score: 0, reasons: ['Different species.'], warn: '' };
  }
  score += 18;
  reasons.push('Same species');
  if (String(myPet.breed) === String(profile.breed)) {
    score += 14;
    reasons.push('Same breed');
  } else {
    score += 5;
    reasons.push('Compatible breed pool');
  }
  const myAge = petAgeYears(myPet);
  const prAge = profileAgeYears(profile);
  const ageDiff = Math.abs(myAge - prAge);
  if (ageDiff <= 2) {
    score += 12;
    reasons.push('Similar age');
  } else if (ageDiff <= 4) {
    score += 6;
    reasons.push('Reasonable age gap');
  }
  const cf = (cityFilter || '').trim().toLowerCase();
  if (cf && String(profile.locationCity).toLowerCase().includes(cf)) {
    score += 8;
    reasons.push('City filter match');
  }
  if (profile.vaccinationVerified) {
    score += 7;
    reasons.push('Match: vaccination verified');
  }
  if (profile.healthClearance) {
    score += 5;
    reasons.push('Health clearance');
  }
  if (profile.ownerVerified) {
    score += 4;
    reasons.push('Owner verified');
  }
  if (mode === 'breeding') {
    score += 4;
    reasons.push('Breeding mode');
    if (myAge < 1 || prAge < 1) {
      score -= 20;
      reasons.push('Age under 1y — not ideal for breeding (demo rule).');
    }
    const g = breedingGenderPairOk(myPet.gender, profile.gender);
    if (!g.ok) {
      score -= 18;
      reasons.push(g.warn);
    } else if (g.warn) reasons.push(g.warn);
    else {
      score += 6;
      reasons.push('Opposite / compatible gender for breeding');
    }
  } else if (mode === 'companion') {
    score += 8;
    reasons.push('Companion-friendly social match');
  } else if (mode === 'playdate') {
    score += 8;
    reasons.push('Playdate / casual social');
    if (cf && String(profile.locationCity).toLowerCase().includes(cf)) score += 3;
  }
  if (!myPet.vaccinationRecords || !myPet.vaccinationRecords.length) {
    score -= 6;
    reasons.push('Your pet: vaccination records empty — add for trust.');
  }
  let warn = '';
  if (mode === 'breeding' && (myAge < 1 || prAge < 1)) {
    warn = 'Breeding: demo recommends both pets be at least 1 year old.';
  }
  score = Math.max(0, Math.min(100, Math.round(score)));
  return { score, reasons, warn };
}

let __petmatesMode = getPersistedPetmatesMode();
let __petmatesMatchProfileId = null;
window.__petmatesProfileMap = {};

function setPetmatesMode(mode) {
  if (mode !== 'breeding' && mode !== 'companion' && mode !== 'playdate') return;
  __petmatesMode = mode;
  try {
    localStorage.setItem(PAW_PETMATES_MODE_KEY, mode);
  } catch {
    /* ignore */
  }
  document.querySelectorAll('.pm-mode-btn').forEach((b) => {
    b.classList.toggle('active', b.getAttribute('data-pm-mode') === mode);
  });
  renderPetMatesPage();
}

function filterProfilesForPetmatesMode(myPet, profiles, mode) {
  const base = profiles.filter((pr) => profileSupportsMode(pr, mode));
  if (mode !== 'breeding') return base;
  const myAge = petAgeYears(myPet);
  const mg = String(myPet.gender || '').toLowerCase();
  const strict = base.filter((pr) => {
    if (profileAgeYears(pr) < 1 || myAge < 1) return false;
    if (mg === 'unknown') return true;
    return breedingGenderPairOk(myPet.gender, pr.gender).ok;
  });
  if (strict.length > 0) return strict;
  return base.filter((pr) => profileAgeYears(pr) >= 0.5);
}

function renderPetmatesReadiness(myPet) {
  const box = document.getElementById('pm-readiness');
  if (!box || !myPet) return;
  const ageOk = petAgeYears(myPet) >= 1;
  const vax = !!(myPet.vaccinationRecords && myPet.vaccinationRecords.length);
  const hc = String(myPet.healthStatus || '')
    .toLowerCase()
    .includes('health');
  const rows = [
    ['Age OK for breeding (1y+)', ageOk],
    ['Vaccination records on profile', vax],
    ['Health status noted', hc || !!myPet.healthStatus],
    ['Species / breed set', !!(myPet.petType && myPet.breed)]
  ];
  box.innerHTML = `<strong style="display:block;margin-bottom:8px;color:var(--brown);">Readiness (demo checklist)</strong><ul style="margin:0;padding-left:18px;line-height:1.6;">${rows
    .map(([label, ok]) => `<li>${ok ? '✓' : '○'} ${escapeHtml(label)}</li>`)
    .join('')}</ul>`;
}

function renderPetmatesWarnings(myPet, mode, relaxedNote) {
  const w = document.getElementById('pm-warnings');
  if (!w) return;
  const msgs = [];
  if (!myPet) {
    w.innerHTML = '';
    w.style.display = 'none';
    return;
  }
  if (mode === 'breeding' && petAgeYears(myPet) < 1) {
    msgs.push('Your pet is under 1 year — breeding matches are shown for browsing only; consult a vet before any real breeding.');
  }
  if (!myPet.vaccinationRecords || !myPet.vaccinationRecords.length) {
    msgs.push('Vaccination details are missing on your pet — matches may be lower-trust until you add records.');
  }
  if (mode === 'breeding' && relaxedNote) {
    msgs.push('We widened the demo pool (age / gender rules relaxed) so you still see same-species matches with guidance.');
  }
  if (mode === 'breeding') {
    const mg = String(myPet.gender || '').toLowerCase();
    if (mg !== 'unknown' && mg !== 'male' && mg !== 'female') {
      msgs.push('Set a clear gender on your pet for clearer breeding compatibility in this demo.');
    }
  }
  if (!msgs.length) {
    w.innerHTML = '';
    w.style.display = 'none';
    return;
  }
  w.style.display = 'block';
  w.innerHTML = `<div class="diet-note" style="margin:0;"><i class="fas fa-triangle-exclamation"></i><span>${msgs.map((m) => escapeHtml(m)).join(' ')}</span></div>`;
}

function renderPetMatesPage() {
  maybePetmatesWelcomeNotif();
  __petmatesMode = getPersistedPetmatesMode();
  const teaser = document.getElementById('pm-elite-teaser');
  if (teaser) teaser.classList.toggle('pm-hidden', !(hasPro() && !hasElite()));
  const cityEl = document.getElementById('pm-filter-city');
  const breedStrict = document.getElementById('pm-filter-breed-strict');
  const vaxOnly = document.getElementById('pm-filter-vax-only');
  const city = cityEl ? cityEl.value.trim().toLowerCase() : '';
  const myPet = (window.__pawPets || []).find((p) => p._id === window.__pawSelectedPetId);
  const mode = __petmatesMode || 'breeding';
  const sub = getSubscription();
  const tier = planTier(sub.plan);

  document.querySelectorAll('.pm-mode-btn').forEach((b) => {
    b.classList.toggle('active', b.getAttribute('data-pm-mode') === mode);
  });

  const s = getSession();
  if (myPet && s) {
    const tipk = `pawlife_pm_profile_tip_${normalizeEmail(s.email)}`;
    if (!localStorage.getItem(tipk)) {
      localStorage.setItem(tipk, '1');
      addNotification({
        title: 'PetMates profile created',
        message: `${myPet.name} can be matched using your saved pet details (local demo).`,
        type: 'petmates'
      });
    }
  }

  [breedStrict, vaxOnly].forEach((inp) => {
    if (!inp) return;
    inp.disabled = false;
    inp.onchange = null;
    if (!hasElite()) {
      inp.checked = false;
      inp.onchange = () => {
        inp.checked = false;
        openUpgradeModal(
          'Elite filters',
          'Same-breed-only and vaccination-verified filters are part of Elite.',
          'elite'
        );
      };
    }
  });

  const wrap = document.getElementById('petmates-results');
  if (!wrap) return;

  if (!myPet) {
    window.__petmatesProfileMap = {};
    const rd = document.getElementById('pm-readiness');
    if (rd) rd.innerHTML = '';
    renderPetmatesWarnings(null, mode, false);
    wrap.innerHTML =
      '<p class="text-sm" style="opacity:0.85;padding:16px;">Add a pet in <strong>My Pets</strong>, then select it here. PetMates uses your pet’s species, breed, age, gender, and health fields for demo matching.</p>';
    renderPetmatesRequestList();
    return;
  }

  renderPetmatesReadiness(myPet);

  let all = getDemoProfilesForSpecies(myPet.petType);
  let list = filterProfilesForPetmatesMode(myPet, all, mode);
  let relaxedNote = false;
  if (mode === 'breeding' && list.length === 0) {
    list = all.filter((pr) => profileSupportsMode(pr, mode));
    relaxedNote = true;
  } else if (mode === 'breeding' && list.length < 3) {
    const wider = all.filter((pr) => profileSupportsMode(pr, mode) && profileAgeYears(pr) >= 0.5);
    if (wider.length > list.length) {
      list = wider;
      relaxedNote = true;
    }
  }
  list = list.filter((pr) => !city || String(pr.locationCity).toLowerCase().includes(city));
  if (hasElite() && breedStrict && breedStrict.checked) {
    list = list.filter((pr) => String(pr.breed) === String(myPet.breed));
  }
  if (hasElite() && vaxOnly && vaxOnly.checked) {
    list = list.filter((pr) => !!pr.vaccinationVerified);
  }
  if (tier === 0) list = list.slice(0, 3);

  window.__petmatesProfileMap = {};
  list.forEach((pr) => {
    window.__petmatesProfileMap[pr.id] = pr;
  });

  renderPetmatesWarnings(myPet, mode, relaxedNote);

  if (!list.length) {
    wrap.innerHTML = `<p class="text-sm" style="opacity:0.85;padding:16px;">No demo matches for <strong>${escapeHtml(
      myPet.name
    )}</strong> in <strong>${escapeHtml(
      mode
    )}</strong> mode with the current filters. Try another mode, clear the city filter, or adjust Elite filters.</p>`;
    renderPetmatesRequestList();
    return;
  }

  const sorted = list
    .map((pr) => ({
      pr,
      sc: computeMatchScore(myPet, pr, mode, city).score
    }))
    .sort((a, b) => b.sc - a.sc);

  wrap.innerHTML = sorted
    .map(({ pr }) => {
      const { score, reasons, warn } = computeMatchScore(myPet, pr, mode, city);
      const badges = [
        pr.vaccinationVerified ? '<span class="pm-badge">Vaccinated</span>' : '',
        pr.healthClearance ? '<span class="pm-badge">Health cleared</span>' : '',
        pr.ownerVerified ? '<span class="pm-badge">Owner verified</span>' : ''
      ]
        .filter(Boolean)
        .join(' ');
      const eliteTag = hasElite() ? '<span class="pm-badge pm-priority">Priority</span>' : '';
      const loc = escapeHtml(pr.locationCity);
      const intentLabel = (Array.isArray(pr.intentSupported) ? pr.intentSupported : []).join(' · ');
      return `<div class="petmate-card section-panel">
        <div class="petmate-card-head">
          <h4>${escapeHtml(pr.petName)} · ${escapeHtml(pr.breed)}</h4>
          <div class="pm-score">${score}% compatible</div>
        </div>
        <p class="text-sm" style="opacity:0.85;margin:0 0 6px;"><strong>${escapeHtml(pr.species)}</strong> · Intent: ${escapeHtml(intentLabel)}</p>
        <p class="text-sm" style="opacity:0.85;margin:0 0 8px;">${escapeHtml(pr.description)}</p>
        <p class="text-sm" style="margin:0 0 8px;"><strong>City area:</strong> ${loc} (approx.)</p>
        <p class="text-sm" style="margin:0 0 8px;">Age ${profileAgeYears(pr)} yrs · ${escapeHtml(pr.gender)} · ${escapeHtml(pr.healthStatus)} · Vax: ${escapeHtml(pr.vaccinationStatus)}</p>
        <div class="pm-badges">${badges}${eliteTag}</div>
        <p class="text-sm pm-reasons">${escapeHtml(reasons.join(' · '))}</p>
        ${warn ? `<p class="text-sm pm-warn">${escapeHtml(warn)}</p>` : ''}
        <button type="button" class="btn-add pm-request-btn" data-pm-id="${escapeHtml(pr.id)}">Request match</button>
      </div>`;
    })
    .join('');

  wrap.querySelectorAll('.pm-request-btn').forEach((btn) => {
    btn.addEventListener('click', () => openPetmatesRequestModal(btn.getAttribute('data-pm-id')));
  });

  renderPetmatesRequestList();
}

function renderPetmatesRequestList() {
  const box = document.getElementById('petmates-requests-list');
  if (!box) return;
  const rows = getPetmatesRequestsForUser();
  if (!rows.length) {
    box.innerHTML = '<p class="text-sm" style="opacity:0.8;">No match requests yet.</p>';
    return;
  }
  box.innerHTML = rows
    .map(
      (r) => `
    <div class="pm-req-row section-panel" style="padding:14px 16px;margin-bottom:10px;">
      <p class="text-sm" style="margin:0 0 4px;opacity:0.85;"><strong>${escapeHtml(r.myPetName || 'Your pet')}</strong> → <strong>${escapeHtml(r.profilePetName)}</strong></p>
      <span class="text-sm">${escapeHtml(r.status)}</span>
      <p class="text-sm" style="margin:6px 0 0;opacity:0.85;">${escapeHtml(r.note || '')}</p>
      <span class="text-sm" style="opacity:0.7;">${new Date(r.createdAt).toLocaleString()}</span>
      <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:8px;">
        <button type="button" class="btn-submit" style="padding:6px 12px;font-size:.78rem;" onclick="demoSetRequestStatus('${r.id}','approved')">Mark approved (demo)</button>
        <button type="button" class="btn-submit" style="padding:6px 12px;font-size:.78rem;background:var(--cream);color:var(--brown);border:1.5px solid var(--gray-lt);" onclick="demoSetRequestStatus('${r.id}','declined')">Mark declined (demo)</button>
      </div>
    </div>`
    )
    .join('');
}

function openPetmatesRequestModal(profileId) {
  if (!hasPro()) {
    openUpgradeModal(
      'Pro required',
      'Sending match requests is a Pro or Elite feature. Free plan includes browsing a few profiles only.',
      'pro'
    );
    return;
  }
  if (!canSendPetmatesRequest()) {
    showToast('Request limit reached. Upgrade to Elite for unlimited requests (demo).', 'info');
    openUpgradeModal('Upgrade to Elite', 'You have reached the Pro demo request cap. Elite includes unlimited requests.', 'elite');
    return;
  }
  const myPet = (window.__pawPets || []).find((p) => p._id === window.__pawSelectedPetId);
  if (!myPet) {
    showToast('Select a pet in My Pets first.', 'info');
    return;
  }
  const pr = window.__petmatesProfileMap && window.__petmatesProfileMap[profileId];
  if (!pr) return;
  __petmatesMatchProfileId = profileId;
  const myPetEl = document.getElementById('pm-req-mypet');
  if (myPetEl) {
    myPetEl.textContent = `${myPet.name} (${myPet.breed}, ${myPet.petType})`;
  }
  const sum = document.getElementById('pm-req-summary');
  if (sum) {
    sum.textContent = `${pr.petName} (${pr.breed}, ${pr.locationCity})`;
  }
  const note = document.getElementById('pm-req-note');
  if (note) note.value = '';
  openModal('petmates-request-modal');
}

function submitPetmatesRequest() {
  const profileId = __petmatesMatchProfileId;
  const pr = window.__petmatesProfileMap && window.__petmatesProfileMap[profileId];
  const myPet = (window.__pawPets || []).find((p) => p._id === window.__pawSelectedPetId);
  if (!pr || !getSession()) {
    closeModal('petmates-request-modal');
    return;
  }
  if (!myPet) {
    closeModal('petmates-request-modal');
    showToast('Select a pet in My Pets first.', 'info');
    return;
  }
  if (!hasPro()) {
    closeModal('petmates-request-modal');
    openUpgradeModal('Pro required', 'Upgrade to send match requests.', 'pro');
    return;
  }
  if (!canSendPetmatesRequest()) {
    closeModal('petmates-request-modal');
    showToast('Request limit reached.', 'info');
    return;
  }
  const note = document.getElementById('pm-req-note')?.value?.trim() || '';
  const list = getPetmatesRequestsForUser();
  list.unshift({
    id: 'req_' + Date.now().toString(36),
    profileId,
    profilePetName: pr.petName,
    myPetId: myPet._id,
    myPetName: myPet.name,
    matchedSpecies: pr.species,
    matchedBreed: pr.breed,
    note,
    status: 'pending',
    createdAt: Date.now(),
    mode: __petmatesMode
  });
  savePetmatesRequestForUser(list);
  addNotification({
    title: 'Match request sent',
    message: `${myPet.name} → ${pr.petName} (${String(__petmatesMode || 'breeding')} mode, local demo).`,
    type: 'petmates'
  });
  closeModal('petmates-request-modal');
  showToast('Request saved locally.', 'success');
  renderPetMatesPage();
}

function renderHealthInsightsPanel() {
  const box = document.getElementById('health-insights-body');
  if (!box) return;
  const pet = (window.__pawPets || []).find((p) => p._id === window.__pawSelectedPetId);
  if (!hasElite()) {
    box.innerHTML = `
      <p class="text-sm" style="opacity:0.9;margin:0 0 10px;">Health insights are an <strong>Elite</strong> feature (local demo).</p>
      <button type="button" class="btn-add" onclick="setSubscriptionPlan('elite');">Try Elite (demo)</button>
      <button type="button" class="btn-submit" style="margin-top:10px;background:transparent;color:var(--brown);border:1.5px solid var(--gray-lt);" onclick="goToSubscriptionFromUpgrade()">View plans</button>`;
    return;
  }
  if (!pet) {
    box.innerHTML = '<p class="text-sm" style="opacity:0.85;">Select a pet to see tailored insights.</p>';
    return;
  }
  const diet = getDietForPet(pet._id);
  const hyd = diet
    ? `Hydration: about ${(Number(diet.waterIntakeMl) / 1000).toFixed(1)}L/day target for ${pet.name}.`
    : 'Add a diet plan by opening Diet Plan for hydration targets.';
  const cal = diet
    ? `Calories: ~${diet.dailyCalories} kcal/day suits ${pet.breed} at ${pet.weightKg} kg (demo estimate).`
    : 'Open Diet Plan to generate calorie guidance.';
  const vax =
    pet.vaccinationRecords && pet.vaccinationRecords.length
      ? 'Vaccination records are on file — keep annual boosters in mind.'
      : 'Vaccination: records empty — add details before breeding matches (demo reminder).';
  const breedTip =
    pet.petType === 'cat'
      ? 'Breed tip: offer vertical space and stable litter routine.'
      : pet.petType === 'dog'
        ? 'Breed tip: daily mental stimulation reduces chewing stress.'
        : 'Species tip: keep environment stable and monitor appetite.';
  const matchReadiness =
    pet.vaccinationRecords && pet.vaccinationRecords.length
      ? 'PetMates readiness looks good for introductions (demo).'
      : 'PetMates: add vaccination info on your pet profile for stronger trust badges.';
  box.innerHTML = `<ul class="hi-list text-sm" style="margin:0;padding-left:18px;line-height:1.65;">
    <li>${escapeHtml(hyd)}</li>
    <li>${escapeHtml(cal)}</li>
    <li>${escapeHtml(breedTip)}</li>
    <li>${escapeHtml(vax)}</li>
    <li>${escapeHtml(matchReadiness)}</li>
  </ul>`;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getUsers() {
  try {
    const raw = localStorage.getItem(PAW_USERS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(PAW_USERS_KEY, JSON.stringify(users));
}

function getSession() {
  try {
    let raw = localStorage.getItem(PAW_CURRENT_USER_KEY);
    if (!raw) {
      raw = localStorage.getItem(PAW_LEGACY_SESSION_KEY);
      if (raw) {
        localStorage.setItem(PAW_CURRENT_USER_KEY, raw);
        localStorage.removeItem(PAW_LEGACY_SESSION_KEY);
      }
    }
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (s && s.email && s.isLoggedIn === true) {
      return {
        name: s.name || '',
        username: s.username || '',
        email: normalizeEmail(s.email),
        isLoggedIn: true
      };
    }
    return null;
  } catch {
    return null;
  }
}

function setSession(name, email) {
  const payload = JSON.stringify({
    name,
    email: normalizeEmail(email),
    isLoggedIn: true
  });
  localStorage.setItem(PAW_CURRENT_USER_KEY, payload);
  localStorage.removeItem(PAW_LEGACY_SESSION_KEY);
}

function clearSession() {
  localStorage.removeItem(PAW_CURRENT_USER_KEY);
  localStorage.removeItem(PAW_LEGACY_SESSION_KEY);
}

function getCurrentUser() {
  const session = getSession();
  if (!session) return null;
  const row = getUsers().find((u) => normalizeEmail(u.email) === session.email);
  return {
    ...session,
    name: (row && row.name) || session.name || '',
    username: (row && row.username) || session.username || ''
  };
}

function chipDisplayName() {
  const u = getCurrentUser();
  if (!u) return 'Account';
  const n = (u.name || '').trim();
  const un = (u.username || '').trim();
  if (n) return n;
  if (un) return un;
  return 'User';
}

function getSelectedPetId() {
  try {
    const id = localStorage.getItem(PAW_SELECTED_PET_KEY);
    return id && String(id).length ? String(id) : null;
  } catch {
    return null;
  }
}

function setSelectedPetId(id) {
  if (id) localStorage.setItem(PAW_SELECTED_PET_KEY, String(id));
  else localStorage.removeItem(PAW_SELECTED_PET_KEY);
}

function getStoredNotifications() {
  try {
    const raw = localStorage.getItem(PAW_NOTIFICATIONS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveStoredNotifications(list) {
  localStorage.setItem(PAW_NOTIFICATIONS_KEY, JSON.stringify(list));
}

function addNotification({ title, message, petId = null, type = 'info' }) {
  const list = getStoredNotifications();
  list.unshift({
    id: 'n_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    title,
    message: message || '',
    isRead: false,
    createdAt: Date.now(),
    petId,
    type
  });
  saveStoredNotifications(list.slice(0, 100));
  updateNotifDot();
  const panel = document.getElementById('notif-panel');
  if (panel && !panel.hidden) renderNotifications();
}

function readDietsDb() {
  try {
    const raw = localStorage.getItem(PAW_DIETS_KEY);
    const o = raw ? JSON.parse(raw) : {};
    return typeof o === 'object' && o && !Array.isArray(o) ? o : {};
  } catch {
    return {};
  }
}

function getDietForPet(petId) {
  if (!petId) return null;
  const d = readDietsDb()[petId];
  return d && typeof d === 'object' ? d : null ;
}

function saveDietForPet(petId, diet) {
  const db = readDietsDb();
  db[petId] = { ...diet, petId };
  localStorage.setItem(PAW_DIETS_KEY, JSON.stringify(db));
}

function dietHash(pet) {
  let h = 0;
  const s = `${pet._id}|${pet.breed}|${pet.petType}`;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return Math.abs(h);
}

function generateDietForPet(pet) {
  const w = Math.max(0.05, Number(pet.weightKg) || 1);
  const age = Math.max(0.25, Number(pet.ageYears) || 1);
  const breed = String(pet.breed || 'mixed');
  const h = dietHash(pet);
  const t = pet.petType || 'dog';
  const ageF = age < 1 ? 1.12 : age < 7 ? 1 : 0.9;

  let dailyCalories;
  let proteinPercent;
  let carbsPercent;
  let waterIntakeMl;

  if (t === 'dog') {
    dailyCalories = Math.round(70 * Math.pow(w, 0.75) * ageF * (1 + (h % 15) / 100));
    proteinPercent = Math.min(34, 24 + (h % 10));
    carbsPercent = Math.min(46, 100 - proteinPercent - (12 + (h % 6)));
    waterIntakeMl = Math.round(48 * w * 14 + (h % 60) * 6);
  } else if (t === 'cat') {
    dailyCalories = Math.round(60 * Math.pow(w, 0.75) * ageF * (1 + (h % 12) / 100));
    proteinPercent = Math.min(48, 36 + (h % 10));
    carbsPercent = Math.max(12, Math.min(30, 100 - proteinPercent - (16 + (h % 5))));
    waterIntakeMl = Math.round(52 * w * 15 + (h % 70) * 5);
  } else if (t === 'bird') {
    const br = breed.toLowerCase();
    const large = br.includes('parrot') || br.includes('cockatoo') || br.includes('macaw');
    dailyCalories = Math.round((large ? 160 : 72) + (h % 45) + w * 220);
    proteinPercent = 15 + (h % 9);
    carbsPercent = Math.min(52, 100 - proteinPercent - (18 + (h % 7)));
    waterIntakeMl = Math.round(35 + w * 3000 + (h % 40) * 12);
  } else if (t === 'rabbit') {
    dailyCalories = Math.round(88 + w * 30 + (h % 25));
    proteinPercent = 12 + (h % 5);
    carbsPercent = Math.min(36, 100 - proteinPercent - (38 + (h % 6)));
    waterIntakeMl = Math.round(95 + w * 130 + (h % 30) * 9);
  } else if (t === 'fish') {
    dailyCalories = Math.round(14 + w * 10 + (h % 10));
    proteinPercent = 33 + (h % 8);
    carbsPercent = Math.max(18, 100 - proteinPercent - (14 + (h % 8)));
    waterIntakeMl = Math.round(800 + w * 50000 + (h % 200) * 20);
  } else {
    dailyCalories = 420;
    proteinPercent = 28;
    carbsPercent = 40;
    waterIntakeMl = 900;
  }

  proteinPercent = Math.max(8, Math.min(55, Math.round(proteinPercent)));
  carbsPercent = Math.max(10, Math.min(60, Math.round(carbsPercent)));
  if (proteinPercent + carbsPercent > 92) carbsPercent = 92 - proteinPercent;

  const dogRows = [
    { m: 'Kibble + pumpkin purée', a: 'Lean chicken & rice bowl', e: 'Light kibble + carrot sticks' },
    { m: 'Wet food topper on kibble', a: 'Beef strips + green beans', e: 'Fish oil drizzle + small meal' },
    { m: 'Shredded turkey + brown rice', a: 'Puzzle feeder kibble', e: 'Dental chew + kibble' },
    { m: 'Greek yogurt dollop + kibble', a: 'Sweet potato mash side', e: 'Warm broth-soaked kibble' },
    { m: 'Salmon meal topper', a: 'Training treats + veg', e: 'Bedtime biscuit portion' },
    { m: 'Egg scramble bite + kibble', a: 'Hydration break + kibble', e: 'Slow-feeder dinner' },
    { m: 'Rotisserie chicken shred', a: 'Long walk snack', e: 'Low-fat cottage + rice' }
  ];
  const catRows = [
    { m: 'Wet pâté (high protein)', a: 'Broth hydration + kibble dust', e: 'Chicken shreds before bed' },
    { m: 'Salmon wet rotation', a: 'Interactive feeder kibble', e: 'Taurine-rich turkey wet' },
    { m: 'Tuna-in-jelly portion', a: 'Water fountain refresh', e: 'Gravy topper supper' },
    { m: 'Rabbit protein wet', a: 'Freeze-dry crumble snack', e: 'Split wet evening meal' },
    { m: 'Duck chunks in gravy', a: 'Feather toy + kibble hunt', e: 'Light kibble night cap' },
    { m: 'Chicken liver bite + wet', a: 'Kibble foraging box', e: 'Warm wet comfort meal' },
    { m: 'Beef paté + hydration', a: 'Crunchy kibble side', e: 'Bedtime soft chew' }
  ];
  const birdRows = [
    { m: 'Pellets + fresh chop (pepper)', a: 'Small millet spray pinch', e: 'Seeded veg medley' },
    { m: 'Calcium greens + pellets', a: 'Apple dice + water refresh', e: 'Soaked legume bite' },
    { m: 'Sprouted seeds bowl', a: 'Vitamin sprinkle on pellets', e: 'Evening millet reward' },
    { m: 'Broccoli florets + pellets', a: 'Nut sliver (tiny portion)', e: 'Herb mix (basil)' },
    { m: 'Carrot matchsticks + pellets', a: 'Fruit rotation cube', e: 'Pellet top-up before roost' },
    { m: 'Corn shred + pellets', a: 'Cooked quinoa spoon', e: 'Calcium block nibble' },
    { m: 'Pepper strips + pellets', a: 'Egg food (tiny)', e: 'Lights-dim quiet feed' }
  ];
  const rabbitRows = [
    { m: 'Timothy hay (free choice)', a: 'Spring greens mix (small)', e: 'Hay + cilantro sprig' },
    { m: 'Orchard hay + measured pellets', a: 'Romaine + basil leaves', e: 'Hay + dried rose hip' },
    { m: 'Fresh hay refill', a: 'Bok choy ribbons', e: 'Hay + mint leaf' },
    { m: 'Herb hay blend', a: 'Parsley + spinach (limited)', e: 'Willow twig chew' },
    { m: 'Second cutting hay', a: 'Carrot tops only', e: 'Hay + timothy cube' },
    { m: 'Hay pile + water greens', a: 'Arugula + fennel frond', e: 'Hay + pellet ration' },
    { m: 'Unlimited hay', a: 'Kale + radish tops', e: 'Hay + dandelion leaf' }
  ];
  const fishRows = [
    { m: 'Quality flake (pinch, surface)', a: 'Micro pellets (sinking)', e: 'Dim lights; light portion' },
    { m: 'Thawed brine shrimp', a: 'Spirulina tab crumble', e: 'Skip if bloated' },
    { m: 'Daphnia treat pinch', a: 'Algae wafer quarter', e: 'Observation feed' },
    { m: 'Color flake (sparingly)', a: 'Zucchini clip nibble', e: 'Tank rest' },
    { m: 'Frozen mix rotation', a: 'Protein pellet crush', e: 'Cleanup day light feed' },
    { m: 'Bloodworm (tiny)', a: 'Community flake dust', e: 'Cucumber overnight nibble' },
    { m: 'Weekend variety flakes', a: 'Shrimp pellet (1 piece)', e: 'Monday lighter prep' }
  ];

  const pickRows =
    t === 'cat' ? catRows : t === 'bird' ? birdRows : t === 'rabbit' ? rabbitRows : t === 'fish' ? fishRows : dogRows;
  const off = h % pickRows.length;

  const meals = DIET_FULL_DAYS.map((dayName, i) => {
    const r = pickRows[(i + off) % pickRows.length];
    const base = dailyCalories / 3;
    const cal = Math.max(t === 'fish' ? 8 : 45, Math.round(base + ((i + h) % 5) * 12 - (t === 'fish' ? 15 : 0)));
    return {
      day: dayName.slice(0, 3),
      morning: r.m,
      afternoon: r.a,
      evening: r.e,
      calories: cal
    };
  });

  return {
    petId: pet._id,
    dailyCalories,
    proteinPercent,
    carbsPercent,
    waterIntakeMl,
    meals
  };
}

function ensureDietForPet(pet, { notify = false } = {}) {
  if (!pet || !pet._id) return null;
  let diet = getDietForPet(pet._id);
  if (diet && Array.isArray(diet.meals) && diet.meals.length >= 7) return diet;
  diet = generateDietForPet(pet);
  saveDietForPet(pet._id, diet);
  if (notify) {
    addNotification({
      title: `Diet plan generated for ${pet.name}`,
      message: 'Your weekly meals and targets are ready. Open Diet Plan to review.',
      petId: pet._id,
      type: 'diet'
    });
  }
  return diet;
}

let __notifPanelOpen = false;

function updateNotifDot() {
  const dot = document.querySelector('.notif-dot');
  if (!dot) return;
  const unread = getStoredNotifications().filter((n) => !n.isRead).length;
  dot.style.display = unread > 0 ? 'inline-block' : 'none';
}

function formatNotifTime(ts) {
  const d = new Date(ts);
  const now = Date.now();
  const diff = Math.floor((now - ts) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return d.toLocaleDateString();
}

function renderNotifications() {
  const panel = document.getElementById('notif-panel');
  if (!panel) return;
  const items = getStoredNotifications();
  if (!items.length) {
    panel.innerHTML = `
      <div class="notif-panel-inner">
        <div class="notif-empty">No notifications yet.</div>
        <button type="button" class="notif-mark-all" id="notif-mark-all">Mark all as read</button>
      </div>`;
  } else {
    panel.innerHTML = `
      <div class="notif-panel-inner">
        <div class="notif-list">
          ${items
            .map(
              (n) => `
            <div class="notif-item${n.isRead ? ' read' : ''}" data-notif-id="${escapeHtml(n.id)}">
              <strong>${escapeHtml(n.title)}</strong>
              <p>${escapeHtml(n.message)}</p>
              <span class="notif-time">${formatNotifTime(n.createdAt)}</span>
            </div>`
            )
            .join('')}
        </div>
        <button type="button" class="notif-mark-all" id="notif-mark-all">Mark all as read</button>
      </div>`;
  }
  panel.querySelector('#notif-mark-all')?.addEventListener('click', (e) => {
    e.stopPropagation();
    markAllNotificationsRead();
  });
  panel.querySelectorAll('.notif-item').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = el.getAttribute('data-notif-id');
      const list = getStoredNotifications().map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      );
      saveStoredNotifications(list);
      el.classList.add('read');
      updateNotifDot();
    });
  });
}

function markAllNotificationsRead() {
  saveStoredNotifications(getStoredNotifications().map((n) => ({ ...n, isRead: true })));
  updateNotifDot();
  renderNotifications();
}

function toggleNotificationsPanel() {
  const panel = document.getElementById('notif-panel');
  if (!panel) return;
  __notifPanelOpen = !__notifPanelOpen;
  panel.hidden = !__notifPanelOpen;
  if (__notifPanelOpen) renderNotifications();
  const btn = document.getElementById('notif-btn');
  if (btn) btn.setAttribute('aria-expanded', __notifPanelOpen ? 'true' : 'false');
}

function closeNotificationsPanel() {
  const panel = document.getElementById('notif-panel');
  if (!panel) return;
  __notifPanelOpen = false;
  panel.hidden = true;
  const btn = document.getElementById('notif-btn');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}

function initNotifBell() {
  const btn = document.getElementById('notif-btn');
  if (!btn || btn.dataset.bound === '1') return;
  btn.dataset.bound = '1';
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleNotificationsPanel();
  });
  document.addEventListener('click', (e) => {
    if (!__notifPanelOpen) return;
    if (e.target.closest('#notif-wrap')) return;
    closeNotificationsPanel();
  });
  updateNotifDot();
}

let __customizeDietPetId = null;

function openCustomizeDietModal() {
  const session = getSession();
  const petId = window.__pawSelectedPetId;
  if (!session) {
    showPage('auth-page');
    return;
  }
  if (!hasPro()) {
    openUpgradeModal(
      'Upgrade to Pro',
      'Customizing weekly meals is included with Pro and Elite. Free plan uses the smart default diet only.',
      'pro'
    );
    return;
  }
  const pet = (window.__pawPets || []).find((p) => p._id === petId);
  if (!pet) {
    showToast('Select a pet first.', 'info');
    return;
  }
  let diet = getDietForPet(pet._id);
  if (!diet || !Array.isArray(diet.meals) || diet.meals.length < 7) {
    diet = ensureDietForPet(pet, { notify: false });
  }
  __customizeDietPetId = pet._id;
  const mount = document.getElementById('customize-diet-mount');
  if (!mount) return;
  const waterL = (diet.waterIntakeMl / 1000).toFixed(1);
  mount.innerHTML = `
    <p class="text-sm" style="opacity:0.85;margin:0 0 12px;">Editing weekly plan for <strong>${escapeHtml(pet.name)}</strong> (${escapeHtml(pet.breed)}).</p>
    <div class="form-group">
      <label>Water intake (liters / day)</label>
      <input type="number" id="custom-diet-water-l" min="0.1" step="0.1" value="${waterL}" />
    </div>
    <div class="form-group">
      <label>Target daily calories (kcal)</label>
      <input type="number" id="custom-diet-daily-cal" min="40" step="10" value="${Number(diet.dailyCalories) || 0}" />
    </div>
    <div class="form-group">
      <label>Protein %</label>
      <input type="number" id="custom-diet-protein" min="8" max="55" step="1" value="${Number(diet.proteinPercent) || 0}" />
    </div>
    <div class="form-group">
      <label>Carbs %</label>
      <input type="number" id="custom-diet-carbs" min="10" max="60" step="1" value="${Number(diet.carbsPercent) || 0}" />
    </div>
    <div class="custom-diet-week">${
      (diet.meals || []).map(
        (row, idx) => `
      <div class="custom-diet-day" data-day-idx="${idx}">
        <h4 class="custom-diet-day-title">${escapeHtml(DIET_FULL_DAYS[idx] || 'Day')}</h4>
        <div class="form-group"><label>Morning</label><input type="text" class="cd-morning" value="${escapeHtml(row.morning)}" /></div>
        <div class="form-group"><label>Afternoon</label><input type="text" class="cd-afternoon" value="${escapeHtml(row.afternoon)}" /></div>
        <div class="form-group"><label>Evening</label><input type="text" class="cd-evening" value="${escapeHtml(row.evening)}" /></div>
        <div class="form-group"><label>Day calories (kcal)</label><input type="number" class="cd-cal" min="10" step="5" value="${Number(row.calories) || 0}" /></div>
      </div>`
      ).join('')}</div>${
      hasElite()
        ? `<div class="form-group"><label>Elite notes (advanced)</label><textarea id="custom-diet-elite-notes" rows="2" placeholder="Optional feeding / rotation notes…">${escapeHtml(
            (getDietForPet(pet._id) || {}).eliteNotes || ''
          )}</textarea></div>`
        : ''
    }`;
  openModal('customize-diet-modal');
}

function saveCustomizedDiet() {
  if (!hasPro()) {
    openUpgradeModal('Upgrade to Pro', 'Saving custom meals requires Pro or Elite.', 'pro');
    return;
  }
  const petId = __customizeDietPetId;
  const pet = (window.__pawPets || []).find((p) => p._id === petId);
  if (!pet) {
    closeModal('customize-diet-modal');
    return;
  }
  const waterL = Number(document.getElementById('custom-diet-water-l')?.value || '0');
  const dailyCalories = Math.round(Number(document.getElementById('custom-diet-daily-cal')?.value || '0'));
  const proteinPercent = Math.round(Number(document.getElementById('custom-diet-protein')?.value || '0'));
  const carbsPercent = Math.round(Number(document.getElementById('custom-diet-carbs')?.value || '0'));
  const days = document.querySelectorAll('.custom-diet-day');
  const meals = [];
  days.forEach((dayEl, idx) => {
    meals.push({
      day: (DIET_FULL_DAYS[idx] || 'Day').slice(0, 3),
      morning: dayEl.querySelector('.cd-morning')?.value?.trim() || '',
      afternoon: dayEl.querySelector('.cd-afternoon')?.value?.trim() || '',
      evening: dayEl.querySelector('.cd-evening')?.value?.trim() || '',
      calories: Math.round(Number(dayEl.querySelector('.cd-cal')?.value || '0')) || 0
    });
  });
  let pPct = Math.min(55, Math.max(8, proteinPercent || 25));
  let cPct = Math.min(60, Math.max(10, carbsPercent || 35));
  if (pPct + cPct > 90) cPct = Math.max(10, 90 - pPct);
  const diet = {
    petId,
    dailyCalories: dailyCalories || getDietForPet(petId)?.dailyCalories || 300,
    proteinPercent: pPct,
    carbsPercent: cPct,
    waterIntakeMl: Math.max(50, Math.round((Number.isFinite(waterL) ? waterL : 1) * 1000)),
    meals: meals.length ? meals : getDietForPet(petId)?.meals || []
  };
  if (hasElite()) {
    diet.eliteNotes = document.getElementById('custom-diet-elite-notes')?.value?.trim() || '';
  }
  saveDietForPet(petId, diet);
  addNotification({
    title: `Diet updated for ${pet.name}`,
    message: 'Your customized weekly plan and nutrition targets were saved.',
    petId,
    type: 'diet'
  });
  closeModal('customize-diet-modal');
  showToast('Diet plan saved.', 'success');
  loadStaticDiet();
  renderHealthInsightsPanel();
}

function readPetsDb() {
  try {
    const raw = localStorage.getItem(PAW_PETS_KEY);
    const o = raw ? JSON.parse(raw) : {};
    return typeof o === 'object' && o && !Array.isArray(o) ? o : {};
  } catch {
    return {};
  }
}

function getPetsForEmail(email) {
  const key = normalizeEmail(email);
  const db = readPetsDb();
  const list = db[key];
  return Array.isArray(list) ? list : [];
}

function setPetsForEmail(email, pets) {
  const key = normalizeEmail(email);
  const db = readPetsDb();
  db[key] = pets;
  localStorage.setItem(PAW_PETS_KEY, JSON.stringify(db));
}

function apiSignup() {
  const name = document.getElementById('signup-name')?.value?.trim();
  const emailRaw = document.getElementById('signup-email')?.value?.trim();
  const password = document.getElementById('signup-pass')?.value;
  if (!name || !emailRaw || !password) {
    showToast('Please fill name, email, and password.', 'info');
    return;
  }
  const email = normalizeEmail(emailRaw);
  if (!isValidEmail(email)) {
    showToast('Please enter a valid email address.', 'info');
    return;
  }
  if (password.length < 6) {
    showToast('Password must be at least 6 characters.', 'info');
    return;
  }
  const users = getUsers();
  if (users.some((u) => normalizeEmail(u.email) === email)) {
    showToast('An account with this email already exists.', 'info');
    return;
  }
  users.push({ name, email, password, isLoggedIn: false });
  saveUsers(users);
  setSession(name, email);
  ensureSubscription(email);
  showToast('Account created!', 'success');
  showPage('dashboard-page');
}

function apiLogin() {
  const emailRaw = document.getElementById('login-email')?.value?.trim();
  const password = document.getElementById('login-pass')?.value;
  if (!emailRaw || !password) {
    showToast('Email and password required.', 'info');
    return;
  }
  const email = normalizeEmail(emailRaw);
  if (!isValidEmail(email)) {
    showToast('Please enter a valid email address.', 'info');
    return;
  }
  const users = getUsers();
  const user = users.find((u) => normalizeEmail(u.email) === email && u.password === password);
  if (!user) {
    showToast('Invalid email or password', 'info');
    return;
  }
  setSession(user.name, user.email);
  ensureSubscription(user.email);
  showToast('Welcome back!', 'success');
  showPage('dashboard-page');
}

function apiLogout() {
  clearSession();
  localStorage.removeItem('pawlife_token');
  localStorage.removeItem('pawlife_user');
  localStorage.removeItem(PAW_SELECTED_PET_KEY);
  window.__pawPets = [];
  window.__pawSelectedPetId = null;
  closeNotificationsPanel();
  showToast('Logged out.', 'success');
  showPage('auth-page');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function loadStaticDashboard() {
  const session = getSession();
  if (!session) {
    showPage('auth-page');
    return;
  }

  const chip = document.querySelector('.user-chip span');
  if (chip) chip.textContent = chipDisplayName();

  const pets = getPetsForEmail(session.email);
  window.__pawPets = pets;
  const savedId = getSelectedPetId();
  if (savedId && pets.some((x) => x._id === savedId)) window.__pawSelectedPetId = savedId;
  if (!window.__pawSelectedPetId && pets[0]) window.__pawSelectedPetId = pets[0]._id;
  if (window.__pawSelectedPetId && !pets.some((x) => x._id === window.__pawSelectedPetId)) {
    window.__pawSelectedPetId = pets[0]?._id || null;
  }
  if (window.__pawSelectedPetId) setSelectedPetId(window.__pawSelectedPetId);
  else setSelectedPetId(null);

  const mini = document.querySelector('.dog-profile-mini');
  if (mini) {
    const p = pets.find((x) => x._id === window.__pawSelectedPetId) || pets[0];
    if (p) {
      mini.querySelector('strong').textContent = p.name;
      mini.querySelector('small').textContent = `${p.petType} · ${p.breed} · ${p.ageYears}y`;
    } else {
      mini.querySelector('strong').textContent = 'No pets yet';
      mini.querySelector('small').textContent = 'Add a pet from the grid';
    }
  }

  const countEl = document.querySelector('.info-card.ic-orange strong');
  if (countEl) countEl.textContent = String(pets.length);

  const grid = document.querySelector('.pets-grid');
  if (grid) {
    const cards = pets
      .map(
        (p) => `
        <div class="pet-card" data-pet-id="${p._id}" style="cursor:pointer;">
          <div class="pet-card-header">
            <div class="pet-avatar-big">${p.petType === 'cat' ? '🐈' : p.petType === 'bird' ? '🐦' : p.petType === 'rabbit' ? '🐇' : p.petType === 'fish' ? '🐠' : '🐕'}</div>
            <div class="pet-status online">${escapeHtml(p.healthStatus || 'healthy')}</div>
          </div>
          <h4>${escapeHtml(p.name)}</h4>
          <p>${escapeHtml(p.breed)}</p>
          <div class="pet-details">
            <span><i class="fas fa-calendar"></i> ${p.ageYears} yrs</span>
            <span><i class="fas fa-venus-mars"></i> ${escapeHtml(p.gender || 'unknown')}</span>
            <span><i class="fas fa-weight-scale"></i> ${p.weightKg} kg</span>
          </div>
        </div>`
      )
      .join('');
    grid.innerHTML =
      cards +
      `<div class="pet-card add-new-card" onclick="openModal('add-pet-modal')"><i class="fas fa-plus-circle"></i><p>Add a pet</p></div>`;
    grid.querySelectorAll('.pet-card[data-pet-id]').forEach((el) => {
      el.addEventListener('click', () => {
        window.__pawSelectedPetId = el.getAttribute('data-pet-id');
        setSelectedPetId(window.__pawSelectedPetId);
        loadStaticDashboard();
        loadStaticDiet();
        if (document.getElementById('sec-petmates')?.classList.contains('active')) {
          queueMicrotask(() => renderPetMatesPage());
        }
      });
    });
  }

  updateNotifDot();

  const dietNote = document.querySelector('#sec-diet-plan .diet-note span');
  if (dietNote) {
    dietNote.textContent =
      'Default plans use your pet profile in this demo. Data stays in this browser only.';
  }

  updatePlanBadge();
  updateDoctorPriorityBadge();
  renderHealthInsightsPanel();
  loadStaticDiet();
}

function loadStaticDiet() {
  const session = getSession();
  const petId = window.__pawSelectedPetId;
  if (!session || !petId) return;

  const tbody = document.querySelector('.diet-table tbody');
  const title = document.querySelector('#sec-diet-plan .panel-header h3');
  const pet = (window.__pawPets || []).find((p) => p._id === petId);
  if (!pet) {
    if (title) title.textContent = 'Weekly diet plan';
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;opacity:0.85;">Select a pet from My Pets to view their diet.</td></tr>`;
    }
    const calCard = document.querySelector('#sec-diet-plan .info-card.ic-green strong');
    const proteinCard = document.querySelector('#sec-diet-plan .info-card.ic-orange strong');
    const carbsCard = document.querySelector('#sec-diet-plan .info-card.ic-blue strong');
    const waterCard = document.querySelector('#sec-diet-plan .info-card.ic-red strong');
    if (calCard) calCard.textContent = '—';
    if (proteinCard) proteinCard.textContent = '—';
    if (carbsCard) carbsCard.textContent = '—';
    if (waterCard) waterCard.textContent = '—';
    return;
  }
  if (title) title.textContent = `Weekly diet — ${pet.name}`;

  const existingDiet = getDietForPet(petId);
  const hadFullDiet =
    existingDiet && Array.isArray(existingDiet.meals) && existingDiet.meals.length >= 7;
  const diet = pet ? ensureDietForPet(pet, { notify: !hadFullDiet }) : null;

  if (tbody && diet && Array.isArray(diet.meals) && diet.meals.length) {
    tbody.innerHTML = diet.meals
      .map(
        (m) => `<tr>
            <td><span class="day-badge">${escapeHtml((m.day || '').slice(0, 3))}</span></td>
            <td>${escapeHtml(m.morning || '')}</td>
            <td>${escapeHtml(m.afternoon || '')}</td>
            <td>${escapeHtml(m.evening || '')}</td>
            <td><span class="cal-badge">${m.calories != null ? escapeHtml(String(m.calories)) : '—'}</span></td>
          </tr>`
      )
      .join('');
  } else if (tbody) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;opacity:0.85;">Add a pet and select it to see a weekly plan.</td></tr>`;
  }

  const calCard = document.querySelector('#sec-diet-plan .info-card.ic-green strong');
  const proteinCard = document.querySelector('#sec-diet-plan .info-card.ic-orange strong');
  const carbsCard = document.querySelector('#sec-diet-plan .info-card.ic-blue strong');
  const waterCard = document.querySelector('#sec-diet-plan .info-card.ic-red strong');
  if (diet) {
    if (calCard) calCard.textContent = String(diet.dailyCalories ?? '—');
    if (proteinCard) proteinCard.textContent = `${diet.proteinPercent ?? '—'}%`;
    if (carbsCard) carbsCard.textContent = `${diet.carbsPercent ?? '—'}%`;
    if (waterCard) {
      const ml = Number(diet.waterIntakeMl) || 0;
      waterCard.textContent = ml > 0 ? `${(ml / 1000).toFixed(1)}L` : '—';
    }
  } else {
    if (calCard) calCard.textContent = '—';
    if (proteinCard) proteinCard.textContent = '—';
    if (carbsCard) carbsCard.textContent = '—';
    if (waterCard) waterCard.textContent = '—';
  }
}

function submitModalPet() {
  const err = document.getElementById('modal-pet-error');
  if (err) {
    err.style.display = 'none';
    err.textContent = '';
  }
  const session = getSession();
  if (!session) {
    showPage('auth-page');
    return;
  }
  const name = document.getElementById('modal-pet-name')?.value?.trim();
  const petType = document.getElementById('modal-pet-type')?.value;
  const breed = document.getElementById('modal-breed')?.value;
  const birthdate = document.getElementById('modal-birthdate')?.value || undefined;
  const weightKg = Number(document.getElementById('modal-weight')?.value || '1');
  const gender = window.__modalPetGender || 'unknown';
  if (!name || !petType || !breed) {
    if (err) {
      err.textContent = 'Name, type, and breed are required.';
      err.style.display = 'block';
    }
    return;
  }
  const pets = getPetsForEmail(session.email);
  if (pets.length >= maxPetsForPlan()) {
    if (err) {
      err.textContent = '';
      err.style.display = 'none';
    }
    openUpgradeModal(
      'Pet limit reached',
      hasPro()
        ? 'You have reached the pet limit for your current demo plan. Elite allows the most pets in this demo.'
        : 'Free plan allows up to 2 pets. Upgrade to Pro or Elite to add more in this demo.',
      hasPro() ? 'elite' : 'pro'
    );
    return;
  }
  const _id = 'p_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
  pets.push({
    _id,
    name,
    petType,
    breed,
    birthdate,
    weightKg: Number.isFinite(weightKg) ? weightKg : 1,
    ageYears: 1,
    gender,
    healthStatus: 'healthy',
    medicalHistory: [],
    vaccinationRecords: []
  });
  setPetsForEmail(session.email, pets);
  window.__pawSelectedPetId = _id;
  setSelectedPetId(_id);
  const newPet = pets[pets.length - 1];
  addNotification({
    title: 'Pet added successfully',
    message: `${name} is now on your dashboard.`,
    petId: _id,
    type: 'pet'
  });
  ensureDietForPet(newPet, { notify: true });
  closeModal('add-pet-modal');
  showToast('Pet added successfully', 'success');
  loadStaticDashboard();
}

/* ──────────────────────────────────────────
   PASSWORD TOGGLE
────────────────────────────────────────── */
function togglePass(inputId, btn) {
  const inp = document.getElementById(inputId);
  const icon = btn.querySelector('i');
  if (inp.type === 'password') {
    inp.type = 'text';
    icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    inp.type = 'password';
    icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
}

/* ──────────────────────────────────────────
   DASHBOARD SECTION SWITCHING
────────────────────────────────────────── */
const sectionMeta = {
  'add-pets':  { title: 'My Pets',              sub: 'Manage your registered pets' },
  'diet-plan': { title: 'Diet Plan',             sub: 'Personalised nutrition for your selected pet' },
  subscription: { title: 'Subscription',       sub: 'Local demo plans — no payment' },
  petmates:    { title: 'PetMates',             sub: 'Responsible matching demo (local only)' },
  'doctor':    { title: 'Doctor Consultation',   sub: 'Book a vet appointment' },
  'emergency': { title: 'Emergency AI Chatbot',  sub: 'Powered by Gemini AI · Available 24/7' },
};

function showSection(section, el) {
  document.querySelectorAll('.nav-item').forEach((n) => n.classList.remove('active'));
  let navEl = el;
  if (!navEl) {
    document.querySelectorAll('.sidebar-nav a').forEach((a) => {
      const oc = a.getAttribute('onclick') || '';
      if (oc.includes(`showSection('${section}'`) || oc.includes(`showSection(\"${section}\"`)) navEl = a;
    });
  }
  if (navEl) navEl.classList.add('active');

  document.querySelectorAll('.dash-section').forEach((s) => s.classList.remove('active'));
  const target = document.getElementById(`sec-${section}`);
  if (target) target.classList.add('active');

  const meta = sectionMeta[section];
  if (meta) {
    document.getElementById('section-title').textContent = meta.title;
    document.getElementById('section-sub').textContent = meta.sub;
  }

  document.getElementById('sidebar').classList.remove('open');

  if (section === 'diet-plan') queueMicrotask(() => loadStaticDiet());
  if (section === 'subscription') queueMicrotask(() => renderSubscriptionPage());
  if (section === 'petmates') queueMicrotask(() => renderPetMatesPage());
}

/* ──────────────────────────────────────────
   MOBILE SIDEBAR
────────────────────────────────────────── */
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

/* ──────────────────────────────────────────
   MODALS
────────────────────────────────────────── */
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('open');
}
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}
// Close on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

function showBookingConfirm() {
  showToast('✅ Appointment booked successfully!', 'success');
}

/* ──────────────────────────────────────────
   TOAST NOTIFICATION
────────────────────────────────────────── */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = message;
  toast.style.cssText = `
    position:fixed; bottom:28px; right:28px; z-index:9999;
    background:${type === 'success' ? '#3d7a55' : '#e07b39'};
    color:white; padding:14px 22px; border-radius:12px;
    font-size:.9rem; font-weight:600; box-shadow:0 6px 24px rgba(0,0,0,.18);
    animation:slideUp .3s ease; max-width:320px;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

/* ──────────────────────────────────────────
   AI CHATBOT (Gemini)
────────────────────────────────────────── */
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY'; // Replace with your key
const SYSTEM_CONTEXT = `You are PawLife's emergency veterinary assistant powered by Gemini AI. 
You answer multi-pet health and care questions for dogs, cats, birds, rabbits, and fish. Be warm, concise and helpful. 
Always recommend consulting a real vet for serious issues. Keep responses under 3 sentences unless detail is critical.`;

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  appendMsg(text, 'user');
  input.value = '';
  await getAIResponse(text);
}

function sendQuickMsg(text) {
  appendMsg(text, 'user');
  getAIResponse(text);
}

function appendMsg(text, role) {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.innerHTML = `<div class="msg-bubble"><p>${text}</p></div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function showTyping() {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'msg bot typing-bubble';
  div.id = 'typing-indicator';
  div.innerHTML = `<div class="msg-bubble">
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
  </div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function removeTyping() {
  document.getElementById('typing-indicator')?.remove();
}

async function getAIResponse(userMsg) {
  showTyping();
  try {
    if (GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
      // Demo mode — simulated responses
      await new Promise(r => setTimeout(r, 1200));
      removeTyping();
      const demos = {
        'vomiting': 'For dogs, repeated vomiting can indicate digestion issues or toxicity. Offer water in small amounts and seek urgent care if blood appears or lethargy increases.',
        'hairball': 'For cats, frequent hairballs plus low appetite may indicate gut irritation. Increase hydration and consult your vet if episodes become frequent.',
        'feather': 'For birds, feather loss with breathing issues can become serious quickly. Keep warm, reduce stress, and contact an avian vet immediately.',
        'rabbit': 'For rabbits, reduced droppings and appetite can indicate digestive stasis. This is time-sensitive; contact an exotic vet as soon as possible.',
        'fish': 'For fish gasping at the surface, check oxygen and water quality immediately. Increase aeration and test ammonia/nitrite levels.',
      };
      let reply = 'I understand your concern about your pet! 🐾 Based on what you described, monitor closely for the next few hours and consult a licensed veterinarian quickly if symptoms worsen.';
      for (const [key, val] of Object.entries(demos)) {
        if (userMsg.toLowerCase().includes(key)) { reply = val; break; }
      }
      appendBotMsg(reply);
      return;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${SYSTEM_CONTEXT}\n\nUser: ${userMsg}` }]
          }]
        })
      }
    );
    const data = await response.json();
    removeTyping();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I couldn\'t process that right now. Please try again.';
    appendBotMsg(text);
  } catch (err) {
    removeTyping();
    appendBotMsg('I\'m having trouble connecting right now. For emergencies, please call your vet directly. 🏥');
  }
}

function appendBotMsg(text) {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'msg bot';
  div.innerHTML = `<div class="msg-bubble"><strong>PawLife AI</strong><p>${text}</p></div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

/* ──────────────────────────────────────────
   SCROLL REVEAL ANIMATION
────────────────────────────────────────── */
function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ──────────────────────────────────────────
   NAVBAR SCROLL STYLE
────────────────────────────────────────── */
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.navbar');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
});

/* ──────────────────────────────────────────
   INIT ON LOAD
────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initReveal();

  if (getSession()) showPage('dashboard-page');

  // Escape key closes modals
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeNotificationsPanel();
      document.querySelectorAll('.modal-overlay.open')
        .forEach(m => m.classList.remove('open'));
    }
  });

  // Sync weight slider default
  const slider = document.getElementById('weight-slider');
  const numInput = document.getElementById('weight-num');
  if (slider && numInput) numInput.value = slider.value;

  updateBreedOptions('modal-pet-type', 'modal-breed');
  window.__modalPetGender = window.__modalPetGender || 'male';

  initNotifBell();
});
