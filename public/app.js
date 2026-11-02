/**
 * YGT Classes - Staff & Student Management Suite
 * Real-Time Multi-Staff Collaboration, Attendance, Fees & Excel Upload
 */

// Zero Cold-Start: Measure high-resolution start time for smooth ~800ms threshold
const splashStartTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

// Bank of 52 Inspiring Thoughts of the Day (Science, Learning & Education)
const QUOTES_OF_THE_DAY = [
  { quote: "The important thing is not to stop questioning. Curiosity has its own reason for existing.", author: "Albert Einstein", role: "Theoretical Physicist", category: "Curiosity & Wonder" },
  { quote: "Learning gives creativity, creativity leads to thinking, thinking provides knowledge, knowledge makes you great.", author: "Dr. A.P.J. Abdul Kalam", role: "Aerospace Scientist & Former President", category: "Learning & Excellence" },
  { quote: "Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less.", author: "Marie Curie", role: "Physicist & Chemist (2x Nobel Laureate)", category: "Courage in Science" },
  { quote: "If I have seen further, it is by standing on the shoulders of giants.", author: "Sir Isaac Newton", role: "Mathematician & Physicist", category: "Humility & Knowledge" },
  { quote: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela", role: "Global Leader", category: "Power of Education" },
  { quote: "Study hard what interests you the most in the most undisciplined, irreverent and original manner possible.", author: "Richard Feynman", role: "Quantum Physicist", category: "Passion for Learning" },
  { quote: "Somewhere, something incredible is waiting to be known.", author: "Carl Sagan", role: "Astronomer & Astrophysicist", category: "Cosmic Discovery" },
  { quote: "An equation for me has no meaning unless it expresses a thought of God.", author: "Srinivasa Ramanujan", role: "Mathematical Genius", category: "Pure Mathematics" },
  { quote: "Ask the right questions, and nature will open the doors to her secrets.", author: "Sir C.V. Raman", role: "Nobel Laureate in Physics", category: "Scientific Spirit" },
  { quote: "The present is theirs; the future, for which I really worked, is mine.", author: "Nikola Tesla", role: "Inventor & Electrical Pioneer", category: "Vision & Innovation" },
  { quote: "Look up at the stars and not down at your feet. Try to make sense of what you see, and wonder about what makes the universe exist.", author: "Stephen Hawking", role: "Cosmologist & Theoretical Physicist", category: "Endless Wonder" },
  { quote: "Education is not the learning of facts, but the training of the mind to think.", author: "Albert Einstein", role: "Nobel Laureate in Physics", category: "Deep Thinking" },
  { quote: "Tell me and I forget. Teach me and I remember. Involve me and I learn.", author: "Benjamin Franklin", role: "Polymath & Scientist", category: "Interactive Learning" },
  { quote: "You cannot teach a person anything; you can only help them find it within themselves.", author: "Galileo Galilei", role: "Father of Modern Science", category: "Self Discovery" },
  { quote: "Arise, awake, and stop not until the goal is reached.", author: "Swami Vivekananda", role: "Philosopher & Teacher", category: "Unstoppable Drive" },
  { quote: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi", role: "Philosopher & Leader", category: "Lifelong Learning" },
  { quote: "Science is a way of thinking much more than it is a body of knowledge.", author: "Carl Sagan", role: "Planetary Scientist", category: "Scientific Method" },
  { quote: "The good thing about science is that it's true whether or not you believe in it.", author: "Neil deGrasse Tyson", role: "Astrophysicist", category: "Objective Truth" },
  { quote: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch", role: "Philosopher & Educator", category: "Inspiring Passion" },
  { quote: "Equipped with his five senses, man explores the universe around him and calls the adventure Science.", author: "Edwin Hubble", role: "Astronomer", category: "Cosmic Exploration" },
  { quote: "Science knows no country, because knowledge belongs to humanity, and is the torch which illuminates the world.", author: "Louis Pasteur", role: "Microbiologist & Chemist", category: "Knowledge for All" },
  { quote: "A person who never made a mistake never tried anything new.", author: "Albert Einstein", role: "Theoretical Physicist", category: "Embracing Growth" },
  { quote: "Mathematics is the alphabet with which God has written the universe.", author: "Galileo Galilei", role: "Astronomer & Mathematician", category: "Language of Nature" },
  { quote: "If you want to shine like a sun, first burn like a sun.", author: "Dr. A.P.J. Abdul Kalam", role: "Missile Man of India", category: "Hard Work & Glory" },
  { quote: "Nature is an open book for those who care to read with eyes of science.", author: "Sir Jagadish Chandra Bose", role: "Biophysicist & Botanist", category: "Reading Nature" },
  { quote: "The roots of education are bitter, but the fruit is sweet.", author: "Aristotle", role: "Ancient Philosopher & Scientist", category: "Patience & Reward" },
  { quote: "Science and everyday life cannot and should not be separated.", author: "Rosalind Franklin", role: "Chemist & X-ray Crystallographer", category: "Science in Life" },
  { quote: "Creativity is intelligence having fun.", author: "Albert Einstein", role: "Theoretical Physicist", category: "Joy of Creation" },
  { quote: "One child, one teacher, one book, and one pen can change the world.", author: "Malala Yousafzai", role: "Education Advocate & Nobel Laureate", category: "Power of Teaching" },
  { quote: "Genius is 1% inspiration and 99% perspiration.", author: "Thomas A. Edison", role: "Prolific Inventor", category: "Relentless Effort" },
  { quote: "Confidence and hard work is the best medicine to kill the disease called failure.", author: "Dr. A.P.J. Abdul Kalam", role: "Visionary Scientist", category: "Winning Mindset" },
  { quote: "The art of teaching is the art of assisting discovery.", author: "Mark Van Doren", role: "Educator & Poet", category: "Guidance & Mentorship" },
  { quote: "Dream is not that which you see while sleeping, it is something that does not let you sleep.", author: "Dr. A.P.J. Abdul Kalam", role: "Inspirational Leader", category: "Big Dreams" },
  { quote: "The universe is under no obligation to make sense to you. That's why we explore it.", author: "Neil deGrasse Tyson", role: "Astrophysicist", category: "Universal Mystery" },
  { quote: "What you do today can improve all your tomorrows.", author: "Ralph Marston", role: "Thinker & Author", category: "Daily Progress" },
  { quote: "Success is no accident. It is hard work, perseverance, learning, studying, and sacrifice.", author: "Pelé", role: "Sports Icon & Mentor", category: "Dedication" },
  { quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", role: "Philosopher & Teacher", category: "Persistence" },
  { quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant (on Aristotle)", role: "Historian", category: "Habit of Excellence" },
  { quote: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", role: "Theoretical Physicist", category: "Opportunity" },
  { quote: "There are no secrets to success. It is the result of preparation, hard work, and learning from failure.", author: "Colin Powell", role: "Leader", category: "Preparation" },
  { quote: "The expert in anything was once a beginner.", author: "Helen Hayes", role: "Artist & Educator", category: "Humble Beginnings" },
  { quote: "To know that we know what we know, and that we do not know what we do not know, that is true knowledge.", author: "Henry David Thoreau", role: "Philosopher", category: "True Knowledge" },
  { quote: "A rocket will not take off beyond earth's gravity without energy, and no nation can lift itself without science.", author: "Dr. Homi J. Bhabha", role: "Father of Indian Nuclear Programme", category: "National Science" },
  { quote: "Teachers can open the door, but you must enter it yourself.", author: "Ancient Proverb", role: "Timeless Wisdom", category: "Personal Initiative" },
  { quote: "Never let the fear of striking out keep you from playing the game.", author: "Babe Ruth", role: "Inspiration", category: "Courage" },
  { quote: "Science is magic that works.", author: "Kurt Vonnegut", role: "Author & Thinker", category: "Magic of Science" },
  { quote: "Success doesn't come to you, you go to it.", author: "Marva Collins", role: "Pioneering Educator", category: "Proactive Action" },
  { quote: "We are all made of stardust. The nitrogen in our DNA, the calcium in our teeth, the iron in our blood were made in stars.", author: "Carl Sagan", role: "Astronomer", category: "Cosmic Connection" },
  { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", role: "Leader", category: "Belief & Willpower" },
  { quote: "Excellence is not a skill. It is an attitude.", author: "Ralph Marston", role: "Author", category: "Positive Attitude" },
  { quote: "Small aim is a crime; have great aim.", author: "Dr. A.P.J. Abdul Kalam", role: "Scientist & Teacher", category: "High Ambition" },
  { quote: "Everything is theoretically impossible until it is done.", author: "Robert A. Heinlein", role: "Science Fiction Pioneer", category: "Breaking Limits" }
];

// Application State
const state = {
  currentStaff: localStorage.getItem('ygt_staff') || localStorage.getItem('violet_staff') || 'Mr. Roshan Yadav',
  currentRole: localStorage.getItem('ygt_role') || localStorage.getItem('violet_role') || 'Director / Admin',
  batches: [],
  activeView: 'dashboard',
  activeTab: 'tab-pending-fees',
  students: [],
  pendingStudents: [],
  selectedBatchId: '',
  searchQuery: '',
  currentPage: 1,
  pageSize: 50,
  totalStudentsCount: 0,
  attendanceRecords: [],
  attendanceFilter: 'ALL',
  attendanceSearchQuery: '',
  currentAttendanceBatch: null,
  currentAttendanceDate: new Date().toISOString().slice(0, 10),
  sideLogEntries: [],
  sideLogFilter: 'ALL',
  pendingUploadFile: null,
  pendingUploadBuffer: null,
  currentQuoteIndex: Math.floor(Math.random() * QUOTES_OF_THE_DAY.length)
};

// DOM Selectors
const elements = {
  // Splash & Thought Widgets
  appSplashScreen: document.getElementById('appSplashScreen'),
  splashProgressBar: document.getElementById('splashProgressBar'),
  splashStatusText: document.getElementById('splashStatusText'),
  splashThoughtText: document.getElementById('splashThoughtText'),
  splashThoughtAuthor: document.getElementById('splashThoughtAuthor'),
  splashThoughtCategory: document.getElementById('splashThoughtCategory'),
  splashNewThoughtBtn: document.getElementById('splashNewThoughtBtn'),
  splashSkipBtn: document.getElementById('splashSkipBtn'),
  dashThoughtQuote: document.getElementById('dashThoughtQuote'),
  dashThoughtAuthor: document.getElementById('dashThoughtAuthor'),
  dashRefreshThoughtBtn: document.getElementById('dashRefreshThoughtBtn'),

  // Navigation & Greeting
  greetingTimeText: document.getElementById('greetingTimeText'),
  currentStaffName: document.getElementById('currentStaffName'),
  currentStaffAvatar: document.getElementById('currentStaffAvatar'),
  bannerGreeting: document.getElementById('bannerGreeting'),
  bannerStaffName: document.getElementById('bannerStaffName'),
  currentDateStr: document.getElementById('currentDateStr'),
  staffProfileBtn: document.getElementById('staffProfileBtn'),
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  themeToggleIcon: document.getElementById('themeToggleIcon'),
  menuToggleBtn: document.getElementById('menuToggleBtn'),
  navDrawer: document.getElementById('navDrawer'),
  drawerOverlay: document.getElementById('drawerOverlay'),
  closeDrawerBtn: document.getElementById('closeDrawerBtn'),
  toggleSideLogBtn: document.getElementById('toggleSideLogBtn'),
  closeSideLogBtn: document.getElementById('closeSideLogBtn'),
  sideLogPanel: document.getElementById('sideLogPanel'),
  sideLogBody: document.getElementById('sideLogBody'),
  logBadgeCount: document.getElementById('logBadgeCount'),
  badgeActivityLogCount: document.getElementById('badgeActivityLogCount'),
  drawerBadgeLogs: document.getElementById('drawerBadgeLogs'),
  refreshActivityLogBtn: document.getElementById('refreshActivityLogBtn'),

  // Search
  navSearchContainer: document.getElementById('navSearchContainer'),
  headerSearchToggleBtn: document.getElementById('headerSearchToggleBtn'),
  closeSearchBtn: document.getElementById('closeSearchBtn'),
  globalSearchInput: document.getElementById('globalSearchInput'),
  clearSearchBtn: document.getElementById('clearSearchBtn'),
  searchResultsDropdown: document.getElementById('searchResultsDropdown'),

  // Stats
  statTotalPending: document.getElementById('statTotalPending'),
  statPendingCount: document.getElementById('statPendingCount'),
  statTotalStudents: document.getElementById('statTotalStudents'),
  statBatchCount: document.getElementById('statBatchCount'),
  statAttendancePct: document.getElementById('statAttendancePct'),
  statAttendanceDetail: document.getElementById('statAttendanceDetail'),
  statCollectedToday: document.getElementById('statCollectedToday'),
  badgePendingCount: document.getElementById('badgePendingCount'),
  badgeTotalStudents: document.getElementById('badgeTotalStudents'),
  pendingTabTotalSum: document.getElementById('pendingTabTotalSum'),

  // View Containers & Controls
  welcomeBannerSection: document.getElementById('welcomeBannerSection'),
  statsGridSection: document.getElementById('statsGridSection'),
  homeDrawerHintCard: document.getElementById('homeDrawerHintCard'),
  mainTabsSection: document.getElementById('mainTabsSection'),
  activeViewHeader: document.getElementById('activeViewHeader'),
  activeViewTitle: document.getElementById('activeViewTitle'),
  btnBackToHome: document.getElementById('btnBackToHome'),
  hintOpenDrawerBtn: document.getElementById('hintOpenDrawerBtn'),
  drawerBadgePending: document.getElementById('drawerBadgePending'),
  drawerBadgeStudents: document.getElementById('drawerBadgeStudents'),
  drawerBadgeBatches: document.getElementById('drawerBadgeBatches'),
  drawerStaffTag: document.getElementById('drawerStaffTag'),

  // Tabs & Filters
  tabButtons: document.querySelectorAll('.tab-btn'),
  tabPanes: document.querySelectorAll('.tab-pane'),
  tabToolsArea: document.getElementById('tabToolsArea'),
  filterBatchSelect: document.getElementById('filterBatchSelect'),
  tabInlineSearchInput: document.getElementById('tabInlineSearchInput'),

  // Tables
  pendingFeesTableBody: document.getElementById('pendingFeesTableBody'),
  allStudentsTableBody: document.getElementById('allStudentsTableBody'),
  batchesGridContainer: document.getElementById('batchesGridContainer'),
  paginationInfo: document.getElementById('paginationInfo'),
  currentPageNum: document.getElementById('currentPageNum'),
  prevPageBtn: document.getElementById('prevPageBtn'),
  nextPageBtn: document.getElementById('nextPageBtn'),

  // Attendance Elements (Teacher View & Real-Time Live Summary)
  attendanceBatchSelect: document.getElementById('attendanceBatchSelect'),
  attendanceDatePicker: document.getElementById('attendanceDatePicker'),
  btnAttendanceSetToday: document.getElementById('btnAttendanceSetToday'),
  attendanceDateBanner: document.getElementById('attendanceDateBanner'),
  attStatusDot: document.getElementById('attStatusDot'),
  attStatusText: document.getElementById('attStatusText'),
  attendanceTableBody: document.getElementById('attendanceTableBody'),
  attTotalEnrolled: document.getElementById('attTotalEnrolled'),
  attPresentCount: document.getElementById('attPresentCount'),
  attAbsentCount: document.getElementById('attAbsentCount'),
  attRatePct: document.getElementById('attRatePct'),
  btnSaveCountBadge: document.getElementById('btnSaveCountBadge'),
  filterCountAll: document.getElementById('filterCountAll'),
  filterCountPresent: document.getElementById('filterCountPresent'),
  filterCountAbsent: document.getElementById('filterCountAbsent'),
  attendanceSearchInput: document.getElementById('attendanceSearchInput'),
  btnClearAttSearch: document.getElementById('btnClearAttSearch'),
  btnMarkAllPresent: document.getElementById('btnMarkAllPresent'),
  btnMarkAllAbsent: document.getElementById('btnMarkAllAbsent'),
  btnEditAttendance: document.getElementById('btnEditAttendance'),
  btnSaveAttendance: document.getElementById('btnSaveAttendance'),

  // Modals
  uploadModal: document.getElementById('uploadModal'),
  feeModal: document.getElementById('feeModal'),
  studentModal: document.getElementById('studentModal'),
  staffModal: document.getElementById('staffModal'),
  batchModal: document.getElementById('batchModal'),
  receiptModal: document.getElementById('receiptModal'),

  // Upload Elements
  excelFileInput: document.getElementById('excelFileInput'),
  browseFileBtn: document.getElementById('browseFileBtn'),
  uploadDropzone: document.getElementById('uploadDropzone'),
  selectedFileName: document.getElementById('selectedFileName'),
  importBatchSelect: document.getElementById('importBatchSelect'),
  uploadPreviewSection: document.getElementById('uploadPreviewSection'),
  previewTable: document.getElementById('previewTable'),
  columnMappingBadges: document.getElementById('columnMappingBadges'),
  confirmUploadBtn: document.getElementById('confirmUploadBtn'),

  // Fee Form
  feePaymentForm: document.getElementById('feePaymentForm'),
  feeStudentId: document.getElementById('feeStudentId'),
  feeModalSubtitle: document.getElementById('feeModalSubtitle'),
  modalTotalFee: document.getElementById('modalTotalFee'),
  modalPaidFee: document.getElementById('modalPaidFee'),
  modalPendingFee: document.getElementById('modalPendingFee'),
  feeAmountInput: document.getElementById('feeAmountInput'),
  feePaymentMode: document.getElementById('feePaymentMode'),
  feeRefNo: document.getElementById('feeRefNo'),
  feeNotes: document.getElementById('feeNotes'),
  feeStaffBadge: document.getElementById('feeStaffBadge'),

  // Student Form & Profile
  studentEditForm: document.getElementById('studentEditForm'),
  editStudentId: document.getElementById('editStudentId'),
  editStudentName: document.getElementById('editStudentName'),
  editRollNo: document.getElementById('editRollNo'),
  editBatchSelect: document.getElementById('editBatchSelect'),
  editGender: document.getElementById('editGender'),
  editParentName: document.getElementById('editParentName'),
  editParentPhone: document.getElementById('editParentPhone'),
  editStudentPhone: document.getElementById('editStudentPhone'),
  editEmail: document.getElementById('editEmail'),
  editAddress: document.getElementById('editAddress'),
  editTotalFee: document.getElementById('editTotalFee'),
  editStatus: document.getElementById('editStatus'),
  modalStudentAvatar: document.getElementById('modalStudentAvatar'),
  modalStudentHeading: document.getElementById('modalStudentHeading'),
  modalStudentSub: document.getElementById('modalStudentSub'),
  btnWhatsappParent: document.getElementById('btnWhatsappParent'),
  spTotalFee: document.getElementById('spTotalFee'),
  spTotalPaid: document.getElementById('spTotalPaid'),
  spTotalPending: document.getElementById('spTotalPending'),
  studentFeeHistoryBody: document.getElementById('studentFeeHistoryBody'),
  studentAttHistoryBody: document.getElementById('studentAttHistoryBody'),

  // Toast
  toastContainer: document.getElementById('toastContainer')
};

// ==========================================================
// 1. DYNAMIC GREETING & MULTI-STAFF SWITCHER
// ==========================================================
function updateGreeting() {
  const now = new Date();
  const hour = now.getHours();
  let greeting = 'Good Evening';

  if (hour >= 5 && hour < 12) {
    greeting = 'Good Morning';
  } else if (hour >= 12 && hour < 17) {
    greeting = 'Good Afternoon';
  } else if (hour >= 17 && hour < 22) {
    greeting = 'Good Evening';
  } else {
    greeting = 'Good Night';
  }

  if (elements.greetingTimeText) elements.greetingTimeText.textContent = `${greeting},`;
  if (elements.currentStaffName) elements.currentStaffName.textContent = state.currentStaff;
  if (elements.bannerGreeting) elements.bannerGreeting.textContent = greeting;
  if (elements.bannerStaffName) elements.bannerStaffName.textContent = state.currentStaff;

  const initials = state.currentStaff
    .split(' ')
    .map(p => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  if (state.currentStaffPhoto) {
    elements.currentStaffAvatar.innerHTML = `<img src="${state.currentStaffPhoto}" alt="Avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    elements.currentStaffAvatar.style.backgroundColor = 'transparent';
  } else {
    elements.currentStaffAvatar.textContent = initials || 'ST';
    if (state.currentStaffColor) {
      elements.currentStaffAvatar.style.backgroundColor = state.currentStaffColor;
    }
  }

  updateStudentBatchSubtitle();
}

function updateStudentBatchSubtitle() {
  if (elements.currentDateStr) {
    const sCount = state.totalStudentsCount ?? (state.dashboardStats ? state.dashboardStats.totalStudents : 0);
    const bCount = (state.batches && Array.isArray(state.batches)) ? state.batches.length : 0;
    elements.currentDateStr.textContent = `${sCount} Students. ${bCount} Batches`;
  }
}

function setStaff(name, role = 'Staff Member') {
  state.currentStaff = name;
  state.currentRole = role;
  localStorage.setItem('ygt_staff', name);
  localStorage.setItem('violet_staff', name);
  localStorage.setItem('ygt_role', role);
  localStorage.setItem('violet_role', role);
  updateGreeting();
  showToast(`Active staff: ${name}`, 'info');
  closeModal('staffModal');
}

async function openStaffModal() {
  try {
    const res = await apiFetch('/api/staff');
    const container = document.getElementById('staffPickerList');
    container.innerHTML = '';

    res.staff.forEach(s => {
      const isCurrent = s.name === state.currentStaff;
      const item = document.createElement('div');
      item.className = `staff-picker-item ${isCurrent ? 'active' : ''}`;
      item.innerHTML = `
        <div class="staff-pi-info">
          <div class="avatar-circle" style="background: ${s.avatar_color || '#6366f1'}">${s.name.slice(0, 2).toUpperCase()}</div>
          <div>
            <div class="staff-pi-name">${escapeHtml(s.name)}</div>
            <div class="staff-pi-role">${escapeHtml(s.role)}</div>
          </div>
        </div>
        <div class="staff-pi-actions">
          ${isCurrent 
            ? '<span class="text-green font-bold text-sm">✓ Active</span>' 
            : `<button type="button" class="btn btn-sm btn-outline" onclick="setStaff('${escapeHtml(s.name)}', '${escapeHtml(s.role)}')">Select</button>`}
          <div class="card-dots-menu-wrap">
            <button type="button" class="btn-dots-menu" onclick="toggleStaffMenu(event, ${s.id})" title="Staff Options">⋮</button>
            <div class="dots-dropdown-menu" id="staffMenu-${s.id}">
              <button type="button" class="dots-menu-item text-danger" onclick="confirmDeleteStaff(event, ${s.id}, '${escapeHtml(s.name)}')">
                <span>🗑️</span> Delete Staff
              </button>
            </div>
          </div>
        </div>
      `;
      container.appendChild(item);
    });

    openModal('staffModal');
  } catch (err) {
    showToast('Failed to load staff list: ' + err.message, 'danger');
  }
}

let originalProfileData = {};
let profileAvatarPhotoData = null;

function renderProfileAvatarDisplay(name, color, photoData) {
  const avatarEl = document.getElementById('profileAvatarPreview');
  if (!avatarEl) return;
  if (photoData) {
    avatarEl.innerHTML = `<img src="${photoData}" alt="Profile Photo" class="profile-avatar-img-view">`;
    avatarEl.style.backgroundColor = 'transparent';
  } else {
    const initials = (name || 'Staff')
      .split(' ')
      .map(p => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
    avatarEl.innerHTML = `<span id="profileAvatarInitials">${initials || 'ST'}</span>`;
    avatarEl.style.backgroundColor = color || '#0071E3';
  }
}

function checkProfileChanges() {
  const name = document.getElementById('profileInputName')?.value.trim() || '';
  const role = document.getElementById('profileInputRole')?.value.trim() || '';
  const phone = document.getElementById('profileInputPhone')?.value.trim() || '';
  const email = document.getElementById('profileInputEmail')?.value.trim() || '';
  const address = document.getElementById('profileInputAddress')?.value.trim() || '';
  const pin = document.getElementById('profileInputPin')?.value.trim() || '';
  const color = document.getElementById('profileColorPicker')?.value || '#0071E3';
  const photo = profileAvatarPhotoData;

  const hasChanged = (
    name !== (originalProfileData.name || '') ||
    role !== (originalProfileData.role || '') ||
    phone !== (originalProfileData.phone || '') ||
    email !== (originalProfileData.email || '') ||
    address !== (originalProfileData.address || '') ||
    pin !== (originalProfileData.pin || '') ||
    color.toLowerCase() !== (originalProfileData.avatar_color || '#0071E3').toLowerCase() ||
    photo !== (originalProfileData.avatar_image || null)
  );

  const unsavedBar = document.getElementById('profileUnsavedBar');
  if (unsavedBar) {
    if (hasChanged) {
      unsavedBar.classList.add('show');
    } else {
      unsavedBar.classList.remove('show');
    }
  }
}

async function openUserProfileModal() {
  try {
    const res = await apiFetch('/api/staff/current');
    const staff = res.staff || { name: state.currentStaff, role: state.currentRole || 'Staff Member' };

    originalProfileData = {
      name: staff.name || state.currentStaff,
      role: staff.role || '',
      phone: staff.phone || '',
      email: staff.email || '',
      address: staff.address || '',
      pin: staff.pin || '',
      avatar_color: staff.avatar_color || '#0071E3',
      avatar_image: staff.avatar_image || null
    };

    profileAvatarPhotoData = staff.avatar_image || null;

    const idInput = document.getElementById('profileStaffId');
    if (idInput) idInput.value = staff.id || '';

    const nameInput = document.getElementById('profileInputName');
    if (nameInput) nameInput.value = originalProfileData.name;

    const roleInput = document.getElementById('profileInputRole');
    if (roleInput) roleInput.value = originalProfileData.role;

    const phoneInput = document.getElementById('profileInputPhone');
    if (phoneInput) phoneInput.value = originalProfileData.phone;

    const emailInput = document.getElementById('profileInputEmail');
    if (emailInput) emailInput.value = originalProfileData.email;

    const addressInput = document.getElementById('profileInputAddress');
    if (addressInput) addressInput.value = originalProfileData.address;

    const pinInput = document.getElementById('profileInputPin');
    if (pinInput) pinInput.value = originalProfileData.pin;

    const colorPicker = document.getElementById('profileColorPicker');
    if (colorPicker) colorPicker.value = originalProfileData.avatar_color;

    // Render avatar preview
    renderProfileAvatarDisplay(originalProfileData.name, originalProfileData.avatar_color, profileAvatarPhotoData);

    const heroName = document.getElementById('profileHeroName');
    if (heroName) heroName.textContent = originalProfileData.name;

    const heroRole = document.getElementById('profileHeroRole');
    if (heroRole) heroRole.textContent = originalProfileData.role || (staff.is_owner ? 'Institute Director (Owner)' : 'Staff Member');

    const badgeName = document.getElementById('profileCurrentStaffNameBadge');
    if (badgeName) badgeName.textContent = originalProfileData.name;

    // Initially hide unsaved bar until user edits something
    document.getElementById('profileUnsavedBar')?.classList.remove('show');

    // Open fullscreen modal and hide bottom navigation dock
    openModal('profileModal');
    document.body.classList.add('profile-fullscreen-open');
  } catch (err) {
    showToast('Failed to open profile: ' + err.message, 'danger');
  }
}

function toggleStaffMenu(event, id) {
  event.stopPropagation();
  const menu = document.getElementById(`staffMenu-${id}`);
  if (!menu) return;
  const isShown = menu.classList.contains('show');
  document.querySelectorAll('.dots-dropdown-menu.show').forEach(m => m.classList.remove('show'));
  if (!isShown) menu.classList.add('show');
}

async function confirmDeleteStaff(event, id, name) {
  event.stopPropagation();
  document.querySelectorAll('.dots-dropdown-menu.show').forEach(m => m.classList.remove('show'));

  if (name === state.currentStaff) {
    alert(`Cannot delete active staff member "${name}". Please switch to another staff member first.`);
    return;
  }

  if (!confirm(`Are you sure you want to delete staff member "${name}"?`)) {
    return;
  }

  try {
    await apiFetch(`/api/staff/${id}`, { method: 'DELETE' });
    showToast(`Staff member "${name}" deleted`, 'success');
    openStaffModal();
  } catch (err) {
    showToast('Failed to delete staff: ' + err.message, 'danger');
  }
}

// ==========================================================
// 1B. THEME SWITCHER (APPLE LIGHT / DARK MODE)
// ==========================================================
function updateThemeIcon(theme) {
  if (!elements.themeToggleIcon) return;
  if (theme === 'dark') {
    elements.themeToggleIcon.innerHTML = `
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    `;
    if (elements.themeToggleBtn) elements.themeToggleBtn.setAttribute('title', 'Switch to Light Mode');
  } else {
    elements.themeToggleIcon.innerHTML = `
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    `;
    if (elements.themeToggleBtn) elements.themeToggleBtn.setAttribute('title', 'Switch to Dark Mode');
  }
}

function initTheme() {
  const saved = localStorage.getItem('ygt_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = saved || (prefersDark ? 'dark' : 'light');
  
  document.documentElement.setAttribute('data-theme', initialTheme);
  document.body.setAttribute('data-theme', initialTheme);
  updateThemeIcon(initialTheme);

  if (elements.themeToggleBtn) {
    elements.themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      document.body.setAttribute('data-theme', next);
      localStorage.setItem('ygt_theme', next);
      updateThemeIcon(next);
      showToast(`${next === 'dark' ? '🌙 Dark' : '☀️ Light'} mode activated`, 'info');
    });
  }

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('ygt_theme')) {
        const next = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        document.body.setAttribute('data-theme', next);
        updateThemeIcon(next);
      }
    });
  }
}

// ==========================================================
// 2. REAL-TIME SERVER-SENT EVENTS (SSE) & LIVE SIDE LOG
// ==========================================================
function initRealtimeSync() {
  const eventSource = new EventSource('/api/events');

  eventSource.onopen = () => {
    console.log('⚡ Connected to real-time sync stream');
  };

  eventSource.addEventListener('fee_update', e => {
    const data = JSON.parse(e.data);
    showToast(`💰 ${data.staffName} collected fee for ${data.paymentResult.studentName}`, 'success');
    refreshDashboard();
    loadSideLogs();
  });

  eventSource.addEventListener('attendance_update', e => {
    const data = JSON.parse(e.data);
    showToast(`📋 ${data.staffName} saved attendance for Batch`, 'info');
    refreshDashboard();
    loadSideLogs();
  });

  eventSource.addEventListener('data_changed', e => {
    const data = JSON.parse(e.data);
    showToast(`🔄 Data updated by ${data.staffName || 'Staff'}`, 'info');
    refreshDashboard();
    loadSideLogs();
  });

  eventSource.onerror = () => {
    // SSE reconnects automatically
  };
}

async function loadSideLogs() {
  try {
    const res = await apiFetch('/api/logs?limit=40');
    state.sideLogEntries = res.logs || [];
    renderSideLogs();
  } catch (err) {
    console.error('Failed to load logs:', err);
  }
}

function renderSideLogs() {
  const container = elements.sideLogBody;
  let filtered = state.sideLogEntries;

  if (state.sideLogFilter === 'FEE') {
    filtered = filtered.filter(l => l.action_type.includes('FEE'));
  } else if (state.sideLogFilter === 'ATTENDANCE') {
    filtered = filtered.filter(l => l.action_type.includes('ATTENDANCE'));
  } else if (state.sideLogFilter === 'STUDENT') {
    filtered = filtered.filter(l => l.action_type.includes('STUDENT') || l.action_type.includes('EXCEL'));
  }

  if (elements.logBadgeCount) elements.logBadgeCount.textContent = filtered.length;
  if (elements.badgeActivityLogCount) elements.badgeActivityLogCount.textContent = filtered.length;
  if (elements.drawerBadgeLogs) elements.drawerBadgeLogs.textContent = filtered.length;

  if (filtered.length === 0) {
    container.innerHTML = `<div class="text-center text-muted py-8 text-sm">No activity recorded yet</div>`;
    return;
  }

  container.innerHTML = filtered
    .map(log => {
      let cardTypeClass = '';
      if (log.action_type.includes('FEE')) cardTypeClass = 'fee-type';
      else if (log.action_type.includes('ATTENDANCE')) cardTypeClass = 'att-type';
      else if (log.action_type.includes('EXCEL')) cardTypeClass = 'import-type';

      const timeFormatted = formatTimeAgo(log.created_at);

      return `
        <div class="log-entry-card ${cardTypeClass}">
          <div class="log-meta-top">
            <span class="log-staff-pill">👨‍💼 ${escapeHtml(log.staff_name)}</span>
            <span class="log-time-str">${timeFormatted}</span>
          </div>
          <div class="log-desc-text">${escapeHtml(log.description)}</div>
        </div>
      `;
    })
    .join('');
}

// ==========================================================
// 3. DASHBOARD & DATA REFRESH
// ==========================================================
async function refreshDashboard() {
  try {
    const [dashRes, batchesRes] = await Promise.all([
      apiFetch('/api/dashboard'),
      apiFetch('/api/batches')
    ]);

    const stats = dashRes.stats;
    state.batches = batchesRes.batches || [];

    // Update highlight cards
    elements.statTotalPending.textContent = formatCurrency(stats.totalPending);
    elements.statPendingCount.textContent = `${stats.pendingStudentsCount} students with dues`;
    elements.statTotalStudents.textContent = stats.totalStudents.toLocaleString();
    elements.statBatchCount.textContent = stats.totalBatches;
    elements.statCollectedToday.textContent = formatCurrency(stats.todayCollections);

    state.totalStudentsCount = stats.totalStudents;
    state.dashboardStats = stats;
    updateStudentBatchSubtitle();

    if (stats.attendanceTodayPct !== null) {
      elements.statAttendancePct.textContent = `${stats.attendanceTodayPct}%`;
      elements.statAttendanceDetail.textContent = `${stats.todayPresent} / ${stats.todayMarked} present`;
    } else {
      elements.statAttendancePct.textContent = '--%';
      elements.statAttendanceDetail.textContent = 'Not marked today';
    }

    if (elements.badgePendingCount) elements.badgePendingCount.textContent = stats.pendingStudentsCount;
    if (elements.badgeTotalStudents) elements.badgeTotalStudents.textContent = stats.totalStudents;
    if (elements.pendingTabTotalSum) elements.pendingTabTotalSum.textContent = formatCurrency(stats.totalPending);
    if (elements.drawerBadgePending) elements.drawerBadgePending.textContent = stats.pendingStudentsCount;
    if (elements.drawerBadgeStudents) elements.drawerBadgeStudents.textContent = stats.totalStudents;
    if (elements.drawerBadgeBatches) elements.drawerBadgeBatches.textContent = stats.totalBatches ?? (state.batches ? state.batches.length : 0);
    if (elements.drawerStaffTag) elements.drawerStaffTag.textContent = `Staff: ${state.currentStaff}`;

    // Populate batch selects
    populateBatchDropdowns();

    // Re-render active view
    if (state.activeTab === 'tab-pending-fees') {
      loadPendingFees();
    } else if (state.activeTab === 'tab-batches') {
      renderBatchesGrid();
    } else if (state.activeTab === 'tab-students') {
      loadAllStudents();
    }
  } catch (err) {
    console.error('Refresh dashboard error:', err);
  }
}

function populateBatchDropdowns() {
  const selects = [
    elements.filterBatchSelect,
    elements.attendanceBatchSelect,
    elements.importBatchSelect,
    elements.editBatchSelect
  ];

  selects.forEach(select => {
    if (!select) return;
    const currentVal = select.value;
    const isFilter = select === elements.filterBatchSelect;
    const isImport = select === elements.importBatchSelect;
    const isAttendance = select === elements.attendanceBatchSelect;

    select.innerHTML = '';

    if (isFilter) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'All Batches';
      select.appendChild(opt);
    } else if (isImport) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'Auto-detect from "Batch Name" column in Excel';
      select.appendChild(opt);
    } else if (isAttendance) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = '-- Select Batch to Take Attendance --';
      select.appendChild(opt);
    }

    state.batches.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b.id;
      opt.textContent = `${b.name} (${b.student_count || 0} students)`;
      select.appendChild(opt);
    });

    if (currentVal) {
      select.value = currentVal;
    } else if (isAttendance) {
      select.value = '';
    }
  });
}

// ==========================================================
// 4. FEES PENDING TAB (Requested Centerpiece)
// ==========================================================
async function loadPendingFees() {
  elements.pendingFeesTableBody.innerHTML = `<tr><td colspan="7" class="text-center loading-cell">Loading pending fee records...</td></tr>`;
  try {
    const batchId = elements.filterBatchSelect.value;
    const search = elements.tabInlineSearchInput.value;

    const res = await apiFetch(`/api/students?pending_only=true&batch_id=${batchId}&search=${encodeURIComponent(search)}&limit=300`);
    state.pendingStudents = res.students || [];

    if (state.pendingStudents.length === 0) {
      elements.pendingFeesTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-8 text-muted">
            🎉 All students in this selection have cleared their fees! No outstanding balance.
          </td>
        </tr>`;
      return;
    }

    let runningSum = 0;
    elements.pendingFeesTableBody.innerHTML = state.pendingStudents
      .map(s => {
        runningSum += s.pending_fee;

        return `
          <tr>
            <td class="cell-roll">${escapeHtml(s.roll_no)}</td>
            <td>
              <span class="cell-student-name">${escapeHtml(s.name)}</span>
              <div class="text-xs text-muted">Parent: ${escapeHtml(s.parent_name || 'N/A')}</div>
            </td>
            <td><span class="batch-tag">${escapeHtml(s.batch_code || s.batch_name)}</span></td>
            <td>${formatCurrency(s.total_fee)}</td>
            <td class="cell-paid-amt">${formatCurrency(s.fees_paid)}</td>
            <td class="cell-pending-amt">${formatCurrency(s.pending_fee)}</td>
            <td>
              <div style="display:flex; gap:0.4rem;">
                <button class="btn-table-action collect-fee" onclick="openFeeModalForStudent(${s.id})">
                  + Collect Fee
                </button>
                <button class="btn-table-action" onclick="openStudentModal(${s.id})">
                  Profile
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');

    elements.pendingTabTotalSum.textContent = formatCurrency(runningSum);
  } catch (err) {
    elements.pendingFeesTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-red">Failed to load pending fees: ${err.message}</td></tr>`;
  }
}

// ==========================================================
// 5. BATCHES GRID VIEW
// ==========================================================
function renderBatchesGrid() {
  if (elements.drawerBadgeBatches) {
    elements.drawerBadgeBatches.textContent = state.batches ? state.batches.length : 0;
  }
  const container = elements.batchesGridContainer;
  if (!state.batches || state.batches.length === 0) {
    container.innerHTML = `<div class="text-center text-muted py-8">No batches found</div>`;
    return;
  }

  container.innerHTML = state.batches
    .map(b => {
      const pendingVal = Number(b.total_pending || 0);
      const isPending = pendingVal > 0;
      return `
        <div class="batch-card neo-depth">
          <div class="batch-card-info-row">
            <div class="batch-info-name" title="${escapeHtml(b.name)}">
              <span class="batch-name-indicator"></span>
              <span class="batch-name-text">${escapeHtml(b.name)}</span>
            </div>
            <div class="batch-info-badges">
              <span class="batch-stat-badge students">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:3px;">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                </svg>
                ${b.student_count || 0} Students
              </span>
              <span class="batch-stat-badge dues ${isPending ? 'has-dues' : 'clear'}">
                <span class="dues-label">Pending:</span> ${formatCurrency(pendingVal)}
              </span>
              <div class="card-dots-menu-wrap">
                <button type="button" class="btn-dots-menu" onclick="toggleBatchMenu(event, ${b.id})" title="Batch Options">⋮</button>
                <div class="dots-dropdown-menu" id="batchMenu-${b.id}">
                  <button type="button" class="dots-menu-item text-danger" onclick="confirmDeleteBatch(event, ${b.id}, '${escapeHtml(b.name)}')">
                    <span>🗑️</span> Delete Batch
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="batch-card-actions">
            <button class="btn btn-sm btn-outline-neo btn-batch-view" onclick="filterByBatch(${b.id})">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              View Students
            </button>
            <button class="btn btn-sm btn-primary-neo btn-batch-att" onclick="openAttendanceForBatch(${b.id})">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
                <path d="m9 16 2 2 4-4"></path>
              </svg>
              Attendance
            </button>
          </div>
        </div>
      `;
    })
    .join('');
}

function toggleBatchMenu(event, id) {
  event.stopPropagation();
  const menu = document.getElementById(`batchMenu-${id}`);
  if (!menu) return;
  const isShown = menu.classList.contains('show');
  document.querySelectorAll('.dots-dropdown-menu.show').forEach(m => m.classList.remove('show'));
  if (!isShown) menu.classList.add('show');
}

async function confirmDeleteBatch(event, id, name) {
  event.stopPropagation();
  document.querySelectorAll('.dots-dropdown-menu.show').forEach(m => m.classList.remove('show'));

  if (!confirm(`Are you sure you want to delete Batch "${name}"? Enrolled students will be unlinked from this batch.`)) {
    return;
  }

  try {
    await apiFetch(`/api/batches/${id}`, { method: 'DELETE' });
    showToast(`Batch "${name}" deleted successfully`, 'success');
    refreshDashboard();
  } catch (err) {
    showToast('Failed to delete batch: ' + err.message, 'danger');
  }
}

function filterByBatch(batchId) {
  elements.filterBatchSelect.value = batchId;
  switchView('students');
}

function openAttendanceForBatch(batchId) {
  elements.attendanceBatchSelect.value = batchId;
  switchView('attendance');
  loadBatchAttendance();
}

function openUploadForBatch(batchId) {
  elements.importBatchSelect.value = batchId;
  openModal('uploadModal');
}

// ==========================================================
// 6. ALL STUDENTS DIRECTORY
// ==========================================================
async function loadAllStudents() {
  elements.allStudentsTableBody.innerHTML = `<tr><td colspan="8" class="text-center loading-cell">Loading students directory...</td></tr>`;
  try {
    const batchId = elements.filterBatchSelect.value;
    const search = elements.tabInlineSearchInput.value;
    const offset = (state.currentPage - 1) * state.pageSize;

    const res = await apiFetch(`/api/students?batch_id=${batchId}&search=${encodeURIComponent(search)}&limit=${state.pageSize}&offset=${offset}`);
    state.students = res.students || [];
    state.totalStudentsCount = res.total || 0;

    renderStudentsTable();
    updatePagination();
  } catch (err) {
    elements.allStudentsTableBody.innerHTML = `<tr><td colspan="8" class="text-center text-red">Failed to load students: ${err.message}</td></tr>`;
  }
}

function renderStudentsTable() {
  if (state.students.length === 0) {
    elements.allStudentsTableBody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-muted">No students matching criteria</td></tr>`;
    return;
  }

  elements.allStudentsTableBody.innerHTML = state.students
    .map(s => {
      const cleanPhone = (s.parent_phone || '').replace(/[^0-9]/g, '');
      const hasPending = s.pending_fee > 0;

      return `
        <tr>
          <td class="cell-roll">${escapeHtml(s.roll_no)}</td>
          <td>
            <span class="cell-student-name">${escapeHtml(s.name)}</span>
            <div class="text-xs text-muted">Parent: ${escapeHtml(s.parent_name || 'N/A')}</div>
          </td>
          <td><span class="batch-tag">${escapeHtml(s.batch_code || s.batch_name)}</span></td>
          <td>
            <span class="phone-link">
              ${escapeHtml(s.parent_phone)}
              ${cleanPhone ? `<a href="https://wa.me/91${cleanPhone}" target="_blank" class="btn-whatsapp-icon" title="Chat on WhatsApp">💬</a>` : ''}
            </span>
          </td>
          <td>${formatCurrency(s.total_fee)}</td>
          <td class="cell-paid-amt">${formatCurrency(s.fees_paid)}</td>
          <td>
            ${hasPending
              ? `<span class="badge-counter badge-danger">Pending: ${formatCurrency(s.pending_fee)}</span>`
              : `<span class="badge-counter text-green" style="background:#ecfdf5;">Cleared ✓</span>`
            }
          </td>
          <td>
            <div style="display:flex; gap:0.4rem;">
              <button class="btn-table-action" onclick="openStudentModal(${s.id})">Profile</button>
              ${hasPending ? `<button class="btn-table-action collect-fee" onclick="openFeeModalForStudent(${s.id})">Fee</button>` : ''}
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

function updatePagination() {
  const start = (state.currentPage - 1) * state.pageSize + 1;
  const end = Math.min(start + state.pageSize - 1, state.totalStudentsCount);
  elements.paginationInfo.textContent = `Showing ${state.totalStudentsCount > 0 ? start : 0} to ${end} of ${state.totalStudentsCount} students`;
  elements.currentPageNum.textContent = state.currentPage;
  elements.prevPageBtn.disabled = state.currentPage <= 1;
  elements.nextPageBtn.disabled = end >= state.totalStudentsCount;
}

// ==========================================================
// 7. EXPANDABLE SEARCH & LIVE AUTOCOMPLETE
// ==========================================================
function openNavSearch() {
  if (!elements.navSearchContainer) return;
  elements.navSearchContainer.classList.add('expanded');
  setTimeout(() => {
    if (elements.globalSearchInput) {
      elements.globalSearchInput.focus();
      elements.globalSearchInput.select();
    }
  }, 60);
}

function closeNavSearch() {
  if (!elements.navSearchContainer) return;
  elements.navSearchContainer.classList.remove('expanded');
  if (elements.searchResultsDropdown) {
    elements.searchResultsDropdown.style.display = 'none';
  }
}

if (elements.headerSearchToggleBtn) {
  elements.headerSearchToggleBtn.addEventListener('click', e => {
    e.stopPropagation();
    openNavSearch();
  });
}

if (elements.closeSearchBtn) {
  elements.closeSearchBtn.addEventListener('click', e => {
    e.stopPropagation();
    closeNavSearch();
  });
}

// Close when clicking outside of navSearchContainer
document.addEventListener('click', e => {
  if (elements.navSearchContainer && elements.navSearchContainer.classList.contains('expanded')) {
    if (!elements.navSearchContainer.contains(e.target) && e.target !== elements.headerSearchToggleBtn && !elements.headerSearchToggleBtn?.contains(e.target)) {
      closeNavSearch();
    }
  }
});

// Close on Escape, Open on '/'
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeNavSearch();
  }
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
    e.preventDefault();
    openNavSearch();
  }
});

let searchDebounceTimeout = null;
elements.globalSearchInput.addEventListener('input', e => {
  const q = e.target.value.trim();
  elements.clearSearchBtn.style.display = q ? 'block' : 'none';

  clearTimeout(searchDebounceTimeout);
  if (!q) {
    elements.searchResultsDropdown.style.display = 'none';
    return;
  }

  searchDebounceTimeout = setTimeout(async () => {
    try {
      const res = await apiFetch(`/api/students?search=${encodeURIComponent(q)}&limit=15`);
      renderGlobalSearchResults(res.students || []);
    } catch (err) {
      console.error('Search error:', err);
    }
  }, 200);
});

elements.clearSearchBtn.addEventListener('click', () => {
  elements.globalSearchInput.value = '';
  elements.clearSearchBtn.style.display = 'none';
  elements.searchResultsDropdown.style.display = 'none';
  elements.globalSearchInput.focus();
});

function renderGlobalSearchResults(students) {
  const dropdown = elements.searchResultsDropdown;
  if (students.length === 0) {
    dropdown.innerHTML = `<div class="p-4 text-center text-muted text-sm">No students found matching your search</div>`;
    dropdown.style.display = 'block';
    return;
  }

  dropdown.innerHTML = students
    .map(s => {
      const pendingStr = s.pending_fee > 0 ? `<span class="search-item-badge" style="background:#fee2e2; color:#ef4444;">Due: ${formatCurrency(s.pending_fee)}</span>` : `<span class="search-item-badge" style="background:#ecfdf5; color:#10b981;">Cleared</span>`;
      return `
        <div class="search-item" onclick="openStudentModal(${s.id}); closeNavSearch();">
          <div class="search-item-info">
            <span class="search-item-name">${escapeHtml(s.name)} (Roll: ${escapeHtml(s.roll_no)})</span>
            <span class="search-item-meta">🎓 ${escapeHtml(s.batch_name)} • 📞 Parent: ${escapeHtml(s.parent_phone)}</span>
          </div>
          <div>${pendingStr}</div>
        </div>
      `;
    })
    .join('');

  dropdown.style.display = 'block';
}

document.addEventListener('click', e => {
  if (!elements.searchResultsDropdown.contains(e.target) && e.target !== elements.globalSearchInput) {
    elements.searchResultsDropdown.style.display = 'none';
  }
});

// ==========================================================
// 8. ATTENDANCE (TEACHER VIEW - FAST MARKING & LIVE STATS)
// ==========================================================
async function loadBatchAttendance() {
  const batchId = elements.attendanceBatchSelect?.value;
  const date = elements.attendanceDatePicker?.value || new Date().toISOString().slice(0, 10);
  if (elements.attendanceDatePicker && !elements.attendanceDatePicker.value) {
    elements.attendanceDatePicker.value = date;
  }

  // 1. If user has not chosen a batch, display the clean "Select Batch" view
  if (!batchId) {
    state.attendanceRecords = [];
    state.attendanceOriginalRecords = [];
    state.attendanceHasRecorded = false;
    state.attendanceDirty = false;

    if (elements.attendanceTableBody) {
      elements.attendanceTableBody.innerHTML = `
        <tr>
          <td colspan="2">
            <div class="empty-att-state">
              <span class="empty-att-icon">📋</span>
              <div class="empty-att-title">Select a Batch</div>
              <p class="empty-att-desc">Please choose a coaching batch from the dropdown above to view or mark attendance.</p>
            </div>
          </td>
        </tr>
      `;
    }
    if (elements.attTotalEnrolled) elements.attTotalEnrolled.textContent = '0';
    if (elements.attPresentCount) elements.attPresentCount.textContent = '0';
    if (elements.attAbsentCount) elements.attAbsentCount.textContent = '0';
    if (elements.attRatePct) elements.attRatePct.textContent = '0%';
    if (elements.attendanceDateBanner && elements.attStatusDot && elements.attStatusText) {
      elements.attStatusDot.className = 'status-indicator-dot unsaved';
      elements.attStatusText.textContent = `Select a coaching batch above to load student attendance sheet.`;
    }
    if (elements.btnEditAttendance) elements.btnEditAttendance.style.display = 'none';
    hideAttendanceUnsavedBar();
    return;
  }

  if (elements.attendanceTableBody) {
    elements.attendanceTableBody.innerHTML = `<tr><td colspan="2" class="text-center loading-cell">Loading student attendance for ${date}...</td></tr>`;
  }

  try {
    const res = await apiFetch(`/api/attendance?batch_id=${batchId}&date=${date}`);
    const rawAttendance = res.attendance || [];

    const hasRecorded = rawAttendance.some(r => r.status && r.status !== 'Unmarked');

    if (hasRecorded) {
      // Attendance ALREADY recorded in database for this date -> Show recorded statuses!
      state.attendanceHasRecorded = true;
      state.attendanceOriginalRecords = rawAttendance.map(rec => ({
        ...rec,
        status: rec.status === 'Unmarked' ? '' : rec.status
      }));
      state.attendanceRecords = rawAttendance.map(rec => ({
        ...rec,
        status: rec.status === 'Unmarked' ? '' : rec.status
      }));

      const marker = rawAttendance.find(r => r.marked_by_staff)?.marked_by_staff || 'Staff';
      if (elements.attendanceDateBanner && elements.attStatusDot && elements.attStatusText) {
        elements.attStatusDot.className = 'status-indicator-dot saved';
        elements.attStatusText.textContent = `✓ Attendance recorded for ${date} (Marked by ${escapeHtml(marker)}). Tap Present or Absent to make changes.`;
      }
    } else {
      // NEW DAY: No attendance recorded yet -> DO NOT default anyone to Present or Absent!
      state.attendanceHasRecorded = false;
      state.attendanceOriginalRecords = rawAttendance.map(rec => ({
        ...rec,
        status: '' // Unmarked! Neither Present nor Absent
      }));
      state.attendanceRecords = rawAttendance.map(rec => ({
        ...rec,
        status: '' // Unmarked! Neither Present nor Absent
      }));

      if (elements.attendanceDateBanner && elements.attStatusDot && elements.attStatusText) {
        elements.attStatusDot.className = 'status-indicator-dot unsaved';
        elements.attStatusText.textContent = `📋 Unmarked Sheet: Tap Present (✓) or Absent (✕) for each student, then tap Save below.`;
      }
    }

    hideAttendanceUnsavedBar();
    renderAttendanceTable();
    updateAttendanceStats();
  } catch (err) {
    if (elements.attendanceTableBody) {
      elements.attendanceTableBody.innerHTML = `<tr><td colspan="2" class="text-center text-red">Failed to load attendance: ${err.message}</td></tr>`;
    }
  }
}

function renderAttendanceTable() {
  if (!elements.attendanceTableBody) return;

  if (state.attendanceRecords.length === 0) {
    elements.attendanceTableBody.innerHTML = `
      <tr>
        <td colspan="2">
          <div class="empty-att-state">
            <span class="empty-att-icon">📋</span>
            <div class="empty-att-title">No Students Enrolled</div>
            <p class="empty-att-desc">There are no active students in this batch yet. Enroll students or import batch Excel.</p>
          </div>
        </td>
      </tr>
    `;
    updateAttendanceStats();
    return;
  }

  // Filter records
  const query = (state.attendanceSearchQuery || '').toLowerCase().trim();
  const filter = state.attendanceFilter || 'ALL';

  const visibleRecords = state.attendanceRecords.filter(rec => {
    // 1. Search Query
    if (query) {
      const matchName = (rec.name || '').toLowerCase().includes(query);
      if (!matchName) return false;
    }
    // 2. Filter Chip
    if (filter === 'PRESENT' && rec.status !== 'Present') return false;
    if (filter === 'ABSENT' && rec.status !== 'Absent') return false;
    return true;
  });

  if (visibleRecords.length === 0) {
    elements.attendanceTableBody.innerHTML = `
      <tr>
        <td colspan="2">
          <div class="empty-att-state">
            <span class="empty-att-icon">🔍</span>
            <div class="empty-att-title">No matching students</div>
            <p class="empty-att-desc">${query ? `No student found matching "${escapeHtml(query)}"` : `No students marked as ${filter.toLowerCase()}`}</p>
          </div>
        </td>
      </tr>
    `;
    updateAttendanceStats();
    return;
  }

  elements.attendanceTableBody.innerHTML = visibleRecords
    .map(rec => {
      const isPresent = rec.status === 'Present';
      const isAbsent = rec.status === 'Absent';

      return `
        <tr class="${isAbsent ? 'row-absent-highlight' : ''}" data-student-id="${rec.student_id}">
          <td class="cell-student-name font-medium">
            <div class="student-name-main">${escapeHtml(rec.name)}</div>
            ${rec.roll_no ? `<span class="student-roll-sub">Roll #${escapeHtml(rec.roll_no)}</span>` : ''}
          </td>
          <td style="text-align: right; width: 180px;">
            <div class="one-tap-att-group">
              <button type="button" 
                      class="btn-one-tap present ${isPresent ? 'active' : ''}" 
                      onclick="toggleAttendance(${rec.student_id}, 'Present')"
                      aria-label="Mark Present">
                <span>✓</span> Present
              </button>
              <button type="button" 
                      class="btn-one-tap absent ${isAbsent ? 'active' : ''}" 
                      onclick="toggleAttendance(${rec.student_id}, 'Absent')"
                      aria-label="Mark Absent">
                <span>✕</span> Absent
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');

  updateAttendanceStats();
}

// Instant One-Tap Toggle with neutral unmark support
window.toggleAttendance = function(studentId, targetStatus) {
  const rec = state.attendanceRecords.find(r => r.student_id === studentId);
  if (!rec) return;

  // Toggle: If clicking same status, unmark; otherwise set targetStatus
  if (rec.status === targetStatus) {
    rec.status = '';
  } else {
    rec.status = targetStatus;
  }

  // Update row buttons directly
  const row = document.querySelector(`tr[data-student-id="${studentId}"]`);
  if (row) {
    row.classList.toggle('row-absent-highlight', rec.status === 'Absent');
    const btnPresent = row.querySelector('.btn-one-tap.present');
    const btnAbsent = row.querySelector('.btn-one-tap.absent');
    if (btnPresent) btnPresent.classList.toggle('active', rec.status === 'Present');
    if (btnAbsent) btnAbsent.classList.toggle('active', rec.status === 'Absent');
  }

  if (state.attendanceFilter !== 'ALL') {
    renderAttendanceTable();
  }

  checkAttendanceChanges();
  updateAttendanceStats();
};

function checkAttendanceChanges() {
  const hasChanged = state.attendanceRecords.some((rec, idx) => {
    const orig = state.attendanceOriginalRecords[idx];
    return !orig || (rec.status || '') !== (orig.status || '');
  });

  const bar = document.getElementById('attendanceUnsavedBar');
  if (bar) {
    if (hasChanged) {
      bar.classList.add('show');
    } else {
      bar.classList.remove('show');
    }
  }
}

function hideAttendanceUnsavedBar() {
  document.getElementById('attendanceUnsavedBar')?.classList.remove('show');
}

function updateAttendanceStats() {
  const total = state.attendanceRecords.length;
  const present = state.attendanceRecords.filter(r => r.status === 'Present').length;
  const absent = state.attendanceRecords.filter(r => r.status === 'Absent').length;
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;

  // Top Live Summary Card
  if (elements.attTotalEnrolled) elements.attTotalEnrolled.textContent = total;
  if (elements.attPresentCount) elements.attPresentCount.textContent = present;
  if (elements.attAbsentCount) elements.attAbsentCount.textContent = absent;
  if (elements.attRatePct) elements.attRatePct.textContent = `${pct}%`;

  // Filter Chips Count
  if (elements.filterCountAll) elements.filterCountAll.textContent = total;
  if (elements.filterCountPresent) elements.filterCountPresent.textContent = present;
  if (elements.filterCountAbsent) elements.filterCountAbsent.textContent = absent;
}

document.getElementById('btnMarkAllPresent')?.addEventListener('click', () => {
  state.attendanceRecords.forEach(r => (r.status = 'Present'));
  renderAttendanceTable();
  updateAttendanceStats();
  checkAttendanceChanges();
  document.getElementById('attDotsDropdown')?.classList.remove('show');
  showToast('✓ All students marked Present', 'info');
});

document.getElementById('btnMarkAllAbsent')?.addEventListener('click', () => {
  state.attendanceRecords.forEach(r => (r.status = 'Absent'));
  renderAttendanceTable();
  updateAttendanceStats();
  checkAttendanceChanges();
  document.getElementById('attDotsDropdown')?.classList.remove('show');
  showToast('✕ All students marked Absent', 'warning');
});

// Cancel button reverts attendance
document.getElementById('btnAttendanceCancel')?.addEventListener('click', () => {
  state.attendanceRecords = state.attendanceOriginalRecords.map(r => ({ ...r }));
  hideAttendanceUnsavedBar();
  renderAttendanceTable();
  updateAttendanceStats();
  showToast('Attendance changes cancelled', 'info');
});

// Save button submits attendance
document.getElementById('btnAttendanceSave')?.addEventListener('click', async () => {
  const batchId = elements.attendanceBatchSelect?.value;
  const date = elements.attendanceDatePicker?.value || new Date().toISOString().slice(0, 10);
  if (!batchId || !date) return showToast('Please select batch and date', 'warning');

  const markedRecords = state.attendanceRecords.filter(r => r.status === 'Present' || r.status === 'Absent');
  if (markedRecords.length === 0) {
    showToast('Please mark at least one student before saving', 'warning');
    return;
  }

  const saveBtn = document.getElementById('btnAttendanceSave');
  try {
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';
    }

    const payload = {
      batch_id: batchId,
      date,
      records: state.attendanceRecords.map(r => ({ student_id: r.student_id, status: r.status || 'Unmarked' }))
    };
    const res = await apiFetch('/api/attendance', { method: 'POST', body: JSON.stringify(payload) });

    state.attendanceOriginalRecords = state.attendanceRecords.map(r => ({ ...r }));
    state.attendanceHasRecorded = true;
    hideAttendanceUnsavedBar();

    const present = state.attendanceRecords.filter(r => r.status === 'Present').length;
    const absent = state.attendanceRecords.filter(r => r.status === 'Absent').length;

    if (elements.attendanceDateBanner && elements.attStatusDot && elements.attStatusText) {
      elements.attStatusDot.className = 'status-indicator-dot saved';
      elements.attStatusText.textContent = `✓ Attendance recorded for ${date} (Marked by ${escapeHtml(state.currentStaff)}). Tap Present or Absent to make changes.`;
    }

    showToast(`✓ Attendance Saved: ${present} Present, ${absent} Absent! 📋✨`, 'success');
  } catch (err) {
    showToast('Failed to save attendance: ' + err.message, 'danger');
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = '💾 Save Attendance';
    }
  }
});

// Attendance Edit Button
if (elements.btnEditAttendance) {
  elements.btnEditAttendance.addEventListener('click', () => {
    state.attendanceEditable = true;
    state.attendanceDirty = true;
    updateSaveButtonVisibility();
    if (elements.attendanceDateBanner) {
      elements.attendanceDateBanner.classList.add('editing-active');
    }
    if (elements.attStatusDot && elements.attStatusText) {
      elements.attStatusDot.className = 'status-indicator-dot unsaved';
      elements.attStatusText.textContent = `✏️ Attendance Edit Mode: Change student statuses below and tap Save at bottom right.`;
    }
    showToast('✏️ Edit mode active. Tap on students to change status, then tap Save.', 'info');
  });
}

// 3-Dots Bulk Attendance Menu Toggle
window.toggleAttMenu = function(event) {
  event.stopPropagation();
  const menu = document.getElementById('attDotsDropdown');
  if (!menu) return;
  const isShown = menu.classList.contains('show');
  document.querySelectorAll('.dots-dropdown-menu.show').forEach(m => m.classList.remove('show'));
  if (!isShown) menu.classList.add('show');
};

function updateSaveButtonVisibility() {
  if (!elements.btnSaveAttendance) return;
  const shouldShow = (state.activeTab === 'tab-attendance') && !!state.attendanceDirty;
  elements.btnSaveAttendance.style.display = shouldShow ? 'inline-flex' : 'none';
}

// Dismiss any open 3-dots menus on clicking outside
window.addEventListener('click', (e) => {
  if (!e.target.closest('.card-dots-menu-wrap')) {
    document.querySelectorAll('.dots-dropdown-menu.show').forEach(m => m.classList.remove('show'));
  }
});

// Expose 3-dots helpers to global window scope
window.toggleStaffMenu = toggleStaffMenu;
window.confirmDeleteStaff = confirmDeleteStaff;
window.toggleBatchMenu = toggleBatchMenu;
window.confirmDeleteBatch = confirmDeleteBatch;

// ==========================================================
// 9. EXCEL & CSV DIRECT UPLOAD STUDIO
// ==========================================================
elements.browseFileBtn.addEventListener('click', () => elements.excelFileInput.click());
elements.uploadDropzone.addEventListener('click', e => {
  if (e.target !== elements.browseFileBtn) elements.excelFileInput.click();
});

elements.uploadDropzone.addEventListener('dragover', e => {
  e.preventDefault();
  elements.uploadDropzone.classList.add('dragover');
});

elements.uploadDropzone.addEventListener('dragleave', () => {
  elements.uploadDropzone.classList.remove('dragover');
});

elements.uploadDropzone.addEventListener('drop', e => {
  e.preventDefault();
  elements.uploadDropzone.classList.remove('dragover');
  if (e.dataTransfer.files.length > 0) {
    handleFileSelected(e.dataTransfer.files[0]);
  }
});

elements.excelFileInput.addEventListener('change', e => {
  if (e.target.files.length > 0) {
    handleFileSelected(e.target.files[0]);
  }
});

function handleFileSelected(file) {
  state.pendingUploadFile = file;
  elements.selectedFileName.textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
  elements.confirmUploadBtn.disabled = false;

  const reader = new FileReader();
  reader.onload = e => {
    state.pendingUploadBuffer = e.target.result;
    if (file.name.endsWith('.csv')) {
      const text = new TextDecoder('utf-8').decode(new Uint8Array(state.pendingUploadBuffer.slice(0, 10000)));
      previewCsvData(text);
    } else {
      elements.uploadPreviewSection.style.display = 'block';
      elements.columnMappingBadges.innerHTML = `
        <span class="map-badge">Excel (.xlsx) ready</span>
        <span class="map-badge">Auto-detecting Name, Roll No, Fees, Parent Mobile</span>
      `;
    }
  };
  reader.readAsArrayBuffer(file);
}

function previewCsvData(csvText) {
  const lines = csvText.split('\n').filter(l => l.trim()).slice(0, 6);
  if (lines.length === 0) return;

  const rows = lines.map(line => line.split(',').map(c => c.trim().replace(/^"|"$/g, '')));
  const thead = elements.previewTable.querySelector('thead');
  const tbody = elements.previewTable.querySelector('tbody');

  thead.innerHTML = `<tr>${rows[0].map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr>`;
  tbody.innerHTML = rows
    .slice(1)
    .map(r => `<tr>${r.map(c => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`)
    .join('');

  elements.uploadPreviewSection.style.display = 'block';
}

elements.confirmUploadBtn.addEventListener('click', async () => {
  if (!state.pendingUploadFile || !state.pendingUploadBuffer) return;

  elements.confirmUploadBtn.disabled = true;
  elements.confirmUploadBtn.textContent = 'Uploading & Importing...';

  const batchId = elements.importBatchSelect.value;
  const filename = encodeURIComponent(state.pendingUploadFile.name);

  try {
    const res = await fetch(`/api/import?filename=${filename}&batch_id=${batchId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-Staff-Name': encodeURIComponent(state.currentStaff)
      },
      body: state.pendingUploadBuffer
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Upload failed');

    showToast(`✅ Successfully imported ${json.summary.inserted} students, updated ${json.summary.updated}!`, 'success');
    closeModal('uploadModal');
    refreshDashboard();
  } catch (err) {
    showToast('Import error: ' + err.message, 'danger');
  } finally {
    elements.confirmUploadBtn.disabled = false;
    elements.confirmUploadBtn.textContent = '📥 Confirm & Import Students';
  }
});

// ==========================================================
// 10. RECORD FEE PAYMENT & PRINTABLE RECEIPT
// ==========================================================
window.openFeeModalForStudent = async function(studentId) {
  try {
    const res = await apiFetch(`/api/students/${studentId}`);
    const s = res.student;

    elements.feeStudentId.value = s.id;
    elements.feeModalSubtitle.textContent = `Student: ${s.name} (Roll: ${s.roll_no} • ${s.batch_name})`;
    elements.modalTotalFee.textContent = formatCurrency(s.total_fee);
    elements.modalPaidFee.textContent = formatCurrency(s.fees_paid);
    elements.modalPendingFee.textContent = formatCurrency(s.pending_fee);
    elements.feeAmountInput.value = s.pending_fee > 0 ? s.pending_fee : '';
    elements.feeStaffBadge.textContent = state.currentStaff;

    openModal('feeModal');
  } catch (err) {
    showToast('Failed to load student fee details: ' + err.message, 'danger');
  }
};

elements.feePaymentForm.addEventListener('submit', async e => {
  e.preventDefault();
  const studentId = elements.feeStudentId.value;
  const amount = Number(elements.feeAmountInput.value);
  const payment_mode = elements.feePaymentMode.value;
  const reference_no = elements.feeRefNo.value;
  const notes = elements.feeNotes.value;

  if (!amount || amount <= 0) return showToast('Please enter a valid fee amount', 'warning');

  try {
    const res = await apiFetch('/api/fees/pay', {
      method: 'POST',
      body: JSON.stringify({
        student_id: studentId,
        amount,
        payment_mode,
        reference_no,
        notes
      })
    });

    closeModal('feeModal');
    showToast(`Recorded payment of ${formatCurrency(amount)} by ${state.currentStaff}!`, 'success');
    openPrintableReceipt(res.payment, payment_mode, reference_no, notes);
    refreshDashboard();
  } catch (err) {
    showToast('Payment failed: ' + err.message, 'danger');
  }
});

function openPrintableReceipt(p, mode, refNo, notes) {
  document.getElementById('rcptNo').textContent = refNo || ('RCP-' + Date.now().toString().slice(-6));
  document.getElementById('rcptDate').textContent = new Date().toLocaleString('en-IN');
  document.getElementById('rcptStudentName').textContent = p.studentName;
  document.getElementById('rcptRollNo').textContent = `ID #${p.studentId}`;
  document.getElementById('rcptBatch').textContent = p.batchName;
  document.getElementById('rcptMode').textContent = mode;
  document.getElementById('rcptAmount').textContent = formatCurrency(p.amountAdded);
  document.getElementById('rcptTotalFee').textContent = formatCurrency(p.totalPaid + p.pendingAfter);
  document.getElementById('rcptPendingFee').textContent = formatCurrency(p.pendingAfter);
  document.getElementById('rcptRemarks').textContent = notes || 'Course installment payment';
  document.getElementById('rcptStaffSignature').textContent = `Staff: ${state.currentStaff}`;

  openModal('receiptModal');
}

document.getElementById('btnPrintReceipt').addEventListener('click', () => {
  window.print();
});

// ==========================================================
// 11. STUDENT PROFILE MODAL
// ==========================================================
window.openStudentModal = async function(studentId) {
  try {
    const res = await apiFetch(`/api/students/${studentId}`);
    const s = res.student;

    elements.editStudentId.value = s.id;
    elements.editStudentName.value = s.name;
    elements.editRollNo.value = s.roll_no;
    elements.editBatchSelect.value = s.batch_id;
    elements.editGender.value = s.gender || 'Other';
    elements.editParentName.value = s.parent_name || '';
    elements.editParentPhone.value = s.parent_phone || '';
    elements.editStudentPhone.value = s.student_phone || '';
    elements.editEmail.value = s.email || '';
    elements.editAddress.value = s.address || '';
    elements.editTotalFee.value = s.total_fee || 0;
    elements.editStatus.value = s.status || 'Active';

    elements.modalStudentHeading.textContent = s.name;
    elements.modalStudentSub.textContent = `Roll No: ${s.roll_no} • ${s.batch_name}`;
    elements.modalStudentAvatar.textContent = s.name.slice(0, 2).toUpperCase();

    const cleanPhone = (s.parent_phone || '').replace(/[^0-9]/g, '');
    elements.btnWhatsappParent.onclick = () => {
      if (cleanPhone) window.open(`https://wa.me/91${cleanPhone}`, '_blank');
      else showToast('No valid parent phone number', 'warning');
    };

    elements.spTotalFee.textContent = formatCurrency(s.total_fee);
    elements.spTotalPaid.textContent = formatCurrency(s.fees_paid);
    elements.spTotalPending.textContent = formatCurrency(s.pending_fee);

    document.getElementById('btnOpenFeeFromProfile').onclick = () => {
      closeModal('studentModal');
      openFeeModalForStudent(s.id);
    };

    renderFeeHistory(res.transactions || []);
    renderAttHistory(res.attendance || []);

    openModal('studentModal');
  } catch (err) {
    showToast('Failed to load student: ' + err.message, 'danger');
  }
};

function renderFeeHistory(transactions) {
  const tbody = elements.studentFeeHistoryBody;
  if (transactions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No fee payments recorded yet</td></tr>`;
    return;
  }

  tbody.innerHTML = transactions
    .map(t => {
      return `
        <tr>
          <td>${t.payment_date}</td>
          <td class="text-green font-bold">${formatCurrency(t.amount)}</td>
          <td>${escapeHtml(t.payment_mode || 'Cash')}</td>
          <td>${escapeHtml(t.reference_no || '-')}</td>
          <td>👨‍💼 ${escapeHtml(t.staff_name)}</td>
          <td>
            <button class="btn btn-sm btn-outline" onclick="openPrintableReceipt({ studentName:'Student', studentId:${t.student_id}, batchName:'Course', amountAdded:${t.amount}, totalPaid:0, pendingAfter:0 }, '${t.payment_mode}', '${t.reference_no}', '${t.notes || ''}')">
              Receipt
            </button>
          </td>
        </tr>
      `;
    })
    .join('');
}

function renderAttHistory(records) {
  const tbody = elements.studentAttHistoryBody;
  if (records.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">No attendance recorded</td></tr>`;
    return;
  }

  tbody.innerHTML = records
    .map(r => {
      let badge = 'text-green';
      if (r.status === 'Absent') badge = 'text-red font-bold';
      else if (r.status === 'Late') badge = 'text-yellow-600';

      return `
        <tr>
          <td>${r.date}</td>
          <td class="${badge}">${r.status}</td>
          <td>${escapeHtml(r.marked_by_staff || '-')}</td>
          <td>${r.updated_at ? r.updated_at.slice(11, 16) : '-'}</td>
        </tr>
      `;
    })
    .join('');
}

elements.studentEditForm.addEventListener('submit', async e => {
  e.preventDefault();
  const studentId = elements.editStudentId.value;
  const payload = {
    name: elements.editStudentName.value,
    roll_no: elements.editRollNo.value,
    batch_id: elements.editBatchSelect.value,
    gender: elements.editGender.value,
    parent_name: elements.editParentName.value,
    parent_phone: elements.editParentPhone.value,
    student_phone: elements.editStudentPhone.value,
    email: elements.editEmail.value,
    address: elements.editAddress.value,
    total_fee: Number(elements.editTotalFee.value),
    status: elements.editStatus.value
  };

  try {
    if (studentId) {
      await apiFetch(`/api/students/${studentId}`, { method: 'PUT', body: JSON.stringify(payload) });
      showToast('Student details updated successfully!', 'success');
    } else {
      await apiFetch('/api/students', { method: 'POST', body: JSON.stringify(payload) });
      showToast('Student enrolled successfully!', 'success');
    }
    closeModal('studentModal');
    refreshDashboard();
  } catch (err) {
    showToast('Failed to save student: ' + err.message, 'danger');
  }
});

// ==========================================================
// 12. VIEWS, TABS & DRAWER NAVIGATION CONTROL (WITH MOBILE BACK BUTTON SUPPORT)
// ==========================================================
let isClosingModalProgrammatically = false;

function switchView(viewName, pushHistory = true) {
  const previousView = state.activeView;
  state.activeView = viewName;
  const isDashboard = viewName === 'dashboard';

  if (pushHistory) {
    try {
      if (isDashboard) {
        window.history.replaceState({ view: 'dashboard' }, '', window.location.pathname);
      } else {
        if (previousView === 'dashboard') {
          window.history.pushState({ view: viewName }, '', '#' + viewName);
        } else {
          window.history.replaceState({ view: viewName }, '', '#' + viewName);
        }
      }
    } catch (_) {}
  }

  if (elements.welcomeBannerSection) elements.welcomeBannerSection.style.display = isDashboard ? '' : 'none';
  if (elements.statsGridSection) elements.statsGridSection.style.display = isDashboard ? '' : 'none';
  if (elements.homeDrawerHintCard) elements.homeDrawerHintCard.style.display = isDashboard ? '' : 'none';
  if (elements.mainTabsSection) elements.mainTabsSection.style.display = isDashboard ? 'none' : 'flex';

  document.querySelectorAll('.drawer-link[data-view]').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-view') === viewName);
  });

  // Update floating bottom navigation dock active state
  document.querySelectorAll('.bottom-nav-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-bnav') === viewName);
  });

  if (isDashboard) {
    updateSaveButtonVisibility();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  if (viewName === 'pending-fees') switchTab('tab-pending-fees', false);
  else if (viewName === 'batches') switchTab('tab-batches', false);
  else if (viewName === 'students') switchTab('tab-students', false);
  else if (viewName === 'attendance') switchTab('tab-attendance', false);
  else if (viewName === 'activity-log') switchTab('tab-activity-log', false);

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchTab(tabId, pushHistory = true) {
  state.activeTab = tabId;
  const tabViewMap = {
    'tab-pending-fees': 'pending-fees',
    'tab-batches': 'batches',
    'tab-students': 'students',
    'tab-attendance': 'attendance',
    'tab-activity-log': 'activity-log'
  };
  const viewName = tabViewMap[tabId] || 'dashboard';

  if (pushHistory && state.activeView !== viewName) {
    const prevView = state.activeView;
    state.activeView = viewName;
    try {
      if (prevView === 'dashboard') {
        window.history.pushState({ view: viewName }, '', '#' + viewName);
      } else {
        window.history.replaceState({ view: viewName }, '', '#' + viewName);
      }
    } catch (_) {}
  }

  if (elements.tabButtons && elements.tabButtons.length > 0) {
    elements.tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });
  }
  elements.tabPanes.forEach(pane => {
    const isActive = pane.id === tabId;
    pane.classList.toggle('active', isActive);
    pane.style.display = isActive ? 'block' : 'none';
  });

  // Table filter tools (Batch selector & quick search): display only on Fees and All Students Directory
  if (elements.tabToolsArea) {
    elements.tabToolsArea.style.display = (tabId === 'tab-pending-fees' || tabId === 'tab-students') ? 'flex' : 'none';
  }

  if (tabId === 'tab-pending-fees') {
    if (elements.activeViewTitle) elements.activeViewTitle.textContent = '💰 Fees';
    loadPendingFees();
  } else if (tabId === 'tab-batches') {
    if (elements.activeViewTitle) elements.activeViewTitle.textContent = '🎓 Batch';
    renderBatchesGrid();
  } else if (tabId === 'tab-students') {
    if (elements.activeViewTitle) elements.activeViewTitle.textContent = '👥 All Students Directory';
    loadAllStudents();
  } else if (tabId === 'tab-attendance') {
    if (elements.activeViewTitle) elements.activeViewTitle.textContent = '📋 Attendance';
    if (elements.attendanceDatePicker && !elements.attendanceDatePicker.value) {
      elements.attendanceDatePicker.value = new Date().toISOString().slice(0, 10);
    }
    loadBatchAttendance();
  } else if (tabId === 'tab-activity-log') {
    if (elements.activeViewTitle) elements.activeViewTitle.textContent = '⚡ Live Activity Log';
    loadSideLogs();
  }

  updateSaveButtonVisibility();
}

elements.tabButtons.forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
});

if (elements.btnBackToHome) {
  elements.btnBackToHome.addEventListener('click', () => {
    if (window.history.state && window.history.state.view && window.history.state.view !== 'dashboard') {
      window.history.back();
    } else {
      switchView('dashboard');
    }
  });
}

if (elements.hintOpenDrawerBtn) {
  elements.hintOpenDrawerBtn.addEventListener('click', () => toggleDrawer(true));
}

elements.filterBatchSelect.addEventListener('change', () => {
  state.currentPage = 1;
  if (state.activeTab === 'tab-pending-fees') loadPendingFees();
  else if (state.activeTab === 'tab-students') loadAllStudents();
});

let filterDebounce = null;
elements.tabInlineSearchInput.addEventListener('input', () => {
  clearTimeout(filterDebounce);
  filterDebounce = setTimeout(() => {
    state.currentPage = 1;
    if (state.activeTab === 'tab-pending-fees') loadPendingFees();
    else if (state.activeTab === 'tab-students') loadAllStudents();
  }, 250);
});

// Drawer Navigation
function toggleDrawer(open) {
  const isOpen = elements.navDrawer.classList.contains('open');
  if (open && !isOpen) {
    elements.navDrawer.classList.add('open');
    elements.drawerOverlay.classList.add('open');
    try {
      window.history.pushState({ drawer: true, view: state.activeView }, '', '#drawer');
    } catch (_) {}
  } else if (!open && isOpen) {
    elements.navDrawer.classList.remove('open');
    elements.drawerOverlay.classList.remove('open');
    if (window.history.state && window.history.state.drawer) {
      isClosingModalProgrammatically = true;
      try { window.history.back(); } catch (_) {}
    }
  }
}

elements.menuToggleBtn.addEventListener('click', () => toggleDrawer(true));
elements.closeDrawerBtn.addEventListener('click', () => toggleDrawer(false));
elements.drawerOverlay.addEventListener('click', () => toggleDrawer(false));

document.querySelectorAll('.drawer-link[data-view]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    toggleDrawer(false);
    const view = link.getAttribute('data-view') || 'dashboard';
    switchView(view);
  });
});

// Drawer Action Buttons
document.getElementById('drawerUploadBtn').addEventListener('click', () => {
  toggleDrawer(false);
  openModal('uploadModal');
});
document.getElementById('drawerAddStudentBtn').addEventListener('click', () => {
  toggleDrawer(false);
  openNewStudentModal();
});
document.getElementById('drawerAddBatchBtn').addEventListener('click', () => {
  toggleDrawer(false);
  openModal('batchModal');
});
document.getElementById('drawerDownloadTemplateBtn').addEventListener('click', () => {
  window.location.href = '/api/sample-csv';
});
document.getElementById('drawerOpenStaffBtn').addEventListener('click', () => {
  toggleDrawer(false);
  openStaffModal();
});
document.getElementById('drawerOpenSideLogBtn')?.addEventListener('click', () => {
  toggleDrawer(false);
  switchView('activity-log');
});

// Side Log Panel Toggle (if present)
elements.toggleSideLogBtn?.addEventListener('click', () => {
  elements.sideLogPanel?.classList.toggle('open');
});
elements.closeSideLogBtn?.addEventListener('click', () => {
  elements.sideLogPanel?.classList.remove('open');
});
elements.refreshActivityLogBtn?.addEventListener('click', () => {
  loadSideLogs();
  showToast('⚡ Activity stream refreshed', 'info');
});

// Side Log Filter Chips
document.querySelectorAll('.log-filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.log-filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    state.sideLogFilter = chip.getAttribute('data-filter');
    renderSideLogs();
  });
});

// Hero & Card Action Buttons
document.getElementById('openUploadModalBtn')?.addEventListener('click', () => openModal('uploadModal'));
document.getElementById('quickSampleCsvBtn')?.addEventListener('click', () => {
  window.location.href = '/api/sample-csv';
});
document.getElementById('jumpToPendingTabBtn').addEventListener('click', () => switchView('pending-fees'));
document.getElementById('jumpToAttendanceBtn').addEventListener('click', () => switchView('attendance'));
document.getElementById('quickAddStudentBtn').addEventListener('click', () => openNewStudentModal());
document.getElementById('btnDirectoryAddStudent').addEventListener('click', () => openNewStudentModal());
document.getElementById('btnCreateNewBatch').addEventListener('click', () => openModal('batchModal'));
document.getElementById('openSideLogSummaryBtn')?.addEventListener('click', () => switchView('activity-log'));

// Top Right Profile Avatar click -> Opens Profile & Settings Modal
elements.staffProfileBtn.addEventListener('click', () => openUserProfileModal());

// Floating Bottom Navigation Dock Click Handlers
document.querySelectorAll('.bottom-nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-bnav');
    if (target) switchView(target);
  });
});

// Profile Modal Form Handlers & Unsaved Detection
['profileInputName', 'profileInputRole', 'profileInputPhone', 'profileInputEmail', 'profileInputAddress', 'profileInputPin'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', checkProfileChanges);
});

document.getElementById('profileColorPicker')?.addEventListener('input', (e) => {
  const avatarEl = document.getElementById('profileAvatarPreview');
  if (avatarEl && !profileAvatarPhotoData) {
    avatarEl.style.backgroundColor = e.target.value;
  }
  checkProfileChanges();
});

// Gallery Photo Picker Handler
document.getElementById('profilePhotoInput')?.addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('Please select a valid image file', 'warning');
    return;
  }

  const reader = new FileReader();
  reader.onload = (evt) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_SIZE = 360;
      let w = img.width;
      let h = img.height;
      if (w > h) {
        if (w > MAX_SIZE) {
          h = Math.round((h * MAX_SIZE) / w);
          w = MAX_SIZE;
        }
      } else {
        if (h > MAX_SIZE) {
          w = Math.round((w * MAX_SIZE) / h);
          h = MAX_SIZE;
        }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const compressed = canvas.toDataURL('image/jpeg', 0.85);

      profileAvatarPhotoData = compressed;
      renderProfileAvatarDisplay(
        document.getElementById('profileInputName')?.value,
        document.getElementById('profileColorPicker')?.value,
        compressed
      );
      checkProfileChanges();
    };
    img.src = evt.target.result;
  };
  reader.readAsDataURL(file);
});

// Cancel button reverts changes
document.getElementById('btnProfileCancel')?.addEventListener('click', () => {
  document.getElementById('profileInputName').value = originalProfileData.name || '';
  document.getElementById('profileInputRole').value = originalProfileData.role || '';
  document.getElementById('profileInputPhone').value = originalProfileData.phone || '';
  document.getElementById('profileInputEmail').value = originalProfileData.email || '';
  document.getElementById('profileInputAddress').value = originalProfileData.address || '';
  document.getElementById('profileInputPin').value = originalProfileData.pin || '';
  document.getElementById('profileColorPicker').value = originalProfileData.avatar_color || '#0071E3';
  profileAvatarPhotoData = originalProfileData.avatar_image || null;

  renderProfileAvatarDisplay(originalProfileData.name, originalProfileData.avatar_color, profileAvatarPhotoData);
  document.getElementById('profileUnsavedBar')?.classList.remove('show');
});

// Save button triggers form submit
document.getElementById('btnProfileSave')?.addEventListener('click', () => {
  document.getElementById('profileForm')?.requestSubmit();
});

// Switch Staff Buttons
['btnProfileSwitchStaffTop', 'btnProfileSwitchStaff'].forEach(id => {
  document.getElementById(id)?.addEventListener('click', () => {
    closeModal('profileModal');
    document.body.classList.remove('profile-fullscreen-open');
    openStaffModal();
  });
});

// Close Profile Back Button
document.getElementById('closeProfileBtn')?.addEventListener('click', () => {
  closeModal('profileModal');
  document.body.classList.remove('profile-fullscreen-open');
});

document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const staffId = document.getElementById('profileStaffId').value;
  const name = document.getElementById('profileInputName').value.trim();
  const role = document.getElementById('profileInputRole').value.trim();
  const phone = document.getElementById('profileInputPhone').value.trim();
  const email = document.getElementById('profileInputEmail').value.trim();
  const address = document.getElementById('profileInputAddress').value.trim();
  const pin = document.getElementById('profileInputPin').value.trim();
  const avatar_color = document.getElementById('profileColorPicker').value;
  const avatar_image = profileAvatarPhotoData;

  if (!name) {
    showToast('Staff name is required', 'warning');
    return;
  }

  try {
    const payload = { id: staffId, name, role, phone, email, address, pin, avatar_color, avatar_image };
    const res = await apiFetch('/api/staff/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

    if (res.staff) {
      state.currentStaff = res.staff.name;
      state.currentRole = res.staff.role;
      state.currentStaffPhoto = res.staff.avatar_image || null;
      state.currentStaffColor = res.staff.avatar_color || '#0071E3';
      localStorage.setItem('ygt_staff', res.staff.name);
      localStorage.setItem('ygt_role', res.staff.role);
      updateGreeting();
      
      originalProfileData = {
        name: res.staff.name,
        role: res.staff.role,
        phone: res.staff.phone || '',
        email: res.staff.email || '',
        address: res.staff.address || '',
        pin: res.staff.pin || '',
        avatar_color: res.staff.avatar_color || '#0071E3',
        avatar_image: res.staff.avatar_image || null
      };
      profileAvatarPhotoData = res.staff.avatar_image || null;
      document.getElementById('profileUnsavedBar')?.classList.remove('show');
    }
    closeModal('profileModal');
    document.body.classList.remove('profile-fullscreen-open');
    showToast('Profile details saved successfully! 👤✨', 'success');
  } catch (err) {
    showToast('Failed to save profile: ' + err.message, 'danger');
  }
});

function openNewStudentModal() {
  elements.studentEditForm.reset();
  elements.editStudentId.value = '';
  elements.modalStudentHeading.textContent = 'Enroll New Student';
  elements.modalStudentSub.textContent = 'Add student to coaching database';
  elements.modalStudentAvatar.textContent = '➕';
  elements.spTotalFee.textContent = '₹0';
  elements.spTotalPaid.textContent = '₹0';
  elements.spTotalPending.textContent = '₹0';
  elements.studentFeeHistoryBody.innerHTML = `<tr><td colspan="6" class="text-center py-4">Save student to begin fee collection</td></tr>`;
  elements.studentAttHistoryBody.innerHTML = `<tr><td colspan="4" class="text-center py-4">Save student to begin attendance tracking</td></tr>`;
  openModal('studentModal');
}

// Student Profile Tabs
document.querySelectorAll('.sp-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sp-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.sptab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.getAttribute('data-sptab')).classList.add('active');
  });
});

// Batch Modal Form
document.getElementById('createBatchForm').addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('newBatchName').value;
  const code = document.getElementById('newBatchCode').value;
  const schedule = document.getElementById('newBatchSchedule').value;
  const default_fee = document.getElementById('newBatchDefaultFee').value;

  try {
    await apiFetch('/api/batches', {
      method: 'POST',
      body: JSON.stringify({ name, code, schedule, default_fee })
    });
    showToast(`Batch "${name}" created successfully!`, 'success');
    closeModal('batchModal');
    refreshDashboard();
  } catch (err) {
    showToast('Failed to create batch: ' + err.message, 'danger');
  }
});

// Add Staff Form
document.getElementById('addStaffForm').addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('newStaffNameInput').value.trim();
  if (!name) return;

  try {
    await apiFetch('/api/staff', { method: 'POST', body: JSON.stringify({ name, role: 'Staff Member' }) });
    showToast(`Staff member ${name} added!`, 'success');
    document.getElementById('newStaffNameInput').value = '';
    openStaffModal();
  } catch (err) {
    showToast('Failed to add staff: ' + err.message, 'danger');
  }
});

// Attendance Controls
elements.btnLoadAttendance?.addEventListener('click', () => loadBatchAttendance());
elements.attendanceBatchSelect?.addEventListener('change', () => loadBatchAttendance());
elements.attendanceDatePicker?.addEventListener('change', () => loadBatchAttendance());
elements.btnAttendanceSetToday?.addEventListener('click', () => {
  if (elements.attendanceDatePicker) {
    elements.attendanceDatePicker.value = new Date().toISOString().slice(0, 10);
    loadBatchAttendance();
  }
});

// Attendance Filter Chips
document.querySelectorAll('.att-filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.att-filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    state.attendanceFilter = chip.getAttribute('data-att-filter') || 'ALL';
    renderAttendanceTable();
  });
});

// Attendance Search Input
elements.attendanceSearchInput?.addEventListener('input', e => {
  state.attendanceSearchQuery = e.target.value;
  if (elements.btnClearAttSearch) {
    elements.btnClearAttSearch.style.display = e.target.value ? 'block' : 'none';
  }
  renderAttendanceTable();
});

elements.btnClearAttSearch?.addEventListener('click', () => {
  if (elements.attendanceSearchInput) elements.attendanceSearchInput.value = '';
  state.attendanceSearchQuery = '';
  if (elements.btnClearAttSearch) elements.btnClearAttSearch.style.display = 'none';
  renderAttendanceTable();
});

// Export Pending CSV
document.getElementById('exportPendingCsvBtn').addEventListener('click', () => {
  if (state.pendingStudents.length === 0) return showToast('No pending records to export', 'warning');
  let csv = 'Roll No,Student Name,Batch,Parent Mobile,Total Fee,Paid Amount,Pending Balance\n';
  state.pendingStudents.forEach(s => {
    csv += `"${s.roll_no}","${s.name}","${s.batch_name}","${s.parent_phone}",${s.total_fee},${s.fees_paid},${s.pending_fee}\n`;
  });
  downloadCsvFile(csv, 'fees_pending_report.csv');
});

// Export All Students CSV
document.getElementById('btnExportAllCsv').addEventListener('click', async () => {
  try {
    const res = await apiFetch('/api/students?limit=5000');
    let csv = 'Roll No,Student Name,Batch,Parent Name,Parent Mobile,Student Phone,Email,Total Fee,Paid Amount,Pending Fee,Status\n';
    res.students.forEach(s => {
      csv += `"${s.roll_no}","${s.name}","${s.batch_name}","${s.parent_name || ''}","${s.parent_phone}","${s.student_phone || ''}","${s.email || ''}",${s.total_fee},${s.fees_paid},${s.pending_fee},"${s.status}"\n`;
    });
    downloadCsvFile(csv, 'ygt_classes_students_database.csv');
  } catch (err) {
    showToast('Export failed: ' + err.message, 'danger');
  }
});

// Pagination
elements.prevPageBtn.addEventListener('click', () => {
  if (state.currentPage > 1) {
    state.currentPage--;
    loadAllStudents();
  }
});

elements.nextPageBtn.addEventListener('click', () => {
  state.currentPage++;
  loadAllStudents();
});

// ==========================================================
// 13. UTILITIES & MODAL HELPERS
// ==========================================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('open');
    try {
      window.history.pushState({ modal: modalId, view: state.activeView }, '', '#modal-' + modalId);
    } catch (_) {}
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
    if (modalId === 'profileModal') {
      document.body.classList.remove('profile-fullscreen-open');
    }
    if (window.history.state && window.history.state.modal === modalId) {
      isClosingModalProgrammatically = true;
      try { window.history.back(); } catch (_) {}
    }
  }
}

document.querySelectorAll('[data-close-modal]').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.getAttribute('data-close-modal')));
});

document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) closeModal(backdrop.id);
  });
});

// Hardware / Mobile Gesture Back Button Handler
window.addEventListener('popstate', (e) => {
  if (isClosingModalProgrammatically) {
    isClosingModalProgrammatically = false;
    return;
  }

  // 1. If any modal is currently open, phone back closes the modal first
  const openModals = document.querySelectorAll('.modal-backdrop.open');
  if (openModals.length > 0) {
    openModals.forEach(m => m.classList.remove('open'));
    return;
  }

  // 2. If navigation drawer is open, phone back closes drawer
  if (elements.navDrawer && elements.navDrawer.classList.contains('open')) {
    elements.navDrawer.classList.remove('open');
    elements.drawerOverlay.classList.remove('open');
    return;
  }

  // 3. Tab navigation: If user is on any other tab (Fees, Batches, Attendance, etc.), phone back returns to Home!
  const targetView = (e.state && e.state.view) ? e.state.view : 'dashboard';

  if (targetView === 'dashboard') {
    if (state.activeView !== 'dashboard') {
      switchView('dashboard', false);
    }
    // If user is already on dashboard, standard browser back takes over (exits app)
  } else {
    switchView(targetView, false);
  }
});

async function apiFetch(endpoint, options = {}) {
  options.headers = options.headers || {};
  if (!options.headers['Content-Type'] && options.body && typeof options.body === 'string') {
    options.headers['Content-Type'] = 'application/json';
  }
  options.headers['X-Staff-Name'] = encodeURIComponent(state.currentStaff);

  const res = await fetch(endpoint, options);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function formatCurrency(num) {
  return '₹' + (Number(num) || 0).toLocaleString('en-IN');
}

function formatTimeAgo(isoStr) {
  if (!isoStr) return '';
  const date = new Date(isoStr.replace(' ', 'T'));
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function downloadCsvFile(content, fileName) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ==========================================================
// 14. THOUGHT OF THE DAY & SPLASH SCREEN LOGIC
// ==========================================================
function getNextQuote() {
  let nextIdx;
  do {
    nextIdx = Math.floor(Math.random() * QUOTES_OF_THE_DAY.length);
  } while (nextIdx === state.currentQuoteIndex && QUOTES_OF_THE_DAY.length > 1);
  state.currentQuoteIndex = nextIdx;
  return QUOTES_OF_THE_DAY[nextIdx];
}

function displayQuote(item) {
  if (!item) return;
  // Splash elements
  if (elements.splashThoughtText) {
    elements.splashThoughtText.style.opacity = '0';
    setTimeout(() => {
      elements.splashThoughtText.textContent = item.quote;
      elements.splashThoughtAuthor.textContent = `— ${item.author} (${item.role})`;
      elements.splashThoughtCategory.textContent = item.category;
      elements.splashThoughtText.style.opacity = '1';
    }, 150);
  }
  // Dashboard widget
  if (elements.dashThoughtQuote) {
    elements.dashThoughtQuote.textContent = `"${item.quote}"`;
    elements.dashThoughtAuthor.textContent = `— ${item.author} (${item.role})`;
  }
}

function initSplashScreen() {
  const currentQuote = QUOTES_OF_THE_DAY[state.currentQuoteIndex] || QUOTES_OF_THE_DAY[0];
  displayQuote(currentQuote);

  const splashEl = document.getElementById('appSplashScreen');
  if (splashEl) {
    // Tap to dismiss immediately if user prefers
    splashEl.addEventListener('click', () => dismissSplashScreen(0));
  }

  // Dashboard refresh thought button
  if (elements.dashRefreshThoughtBtn) {
    elements.dashRefreshThoughtBtn.addEventListener('click', () => {
      displayQuote(getNextQuote());
      showToast('New Thought of the Day loaded!', 'info');
    });
  }
}

let splashDismissed = false;
function dismissSplashScreen(minDuration = 800) {
  if (splashDismissed) return;
  splashDismissed = true;

  const splashEl = document.getElementById('appSplashScreen');
  if (!splashEl) return;

  if (elements.splashStatusText) {
    elements.splashStatusText.textContent = 'Ready! Opening dashboard...';
  }

  const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  const elapsed = now - splashStartTime;
  const remainingDelay = Math.max(0, minDuration - elapsed);

  setTimeout(() => {
    // Smooth 60fps GPU exit: fade-out + slight scale-up reveal
    splashEl.classList.add('splash-dismissing');

    let cleanedUp = false;
    const cleanupSplash = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      if (splashEl && splashEl.parentNode) {
        splashEl.parentNode.removeChild(splashEl);
      }
    };

    splashEl.addEventListener('transitionend', cleanupSplash, { once: true });
    // Safety fallback in case transitionend does not fire
    setTimeout(cleanupSplash, 500);
  }, remainingDelay);
}

// ==========================================================
// 15. INITIALIZATION
// ==========================================================
window.addEventListener('DOMContentLoaded', async () => {
  localStorage.removeItem('ygt_device_mode');
  document.body.classList.remove('mobile-simulator-active');

  // Initialize base history state for mobile Back button support
  try {
    if (!window.history.state || !window.history.state.view) {
      window.history.replaceState({ view: 'dashboard' }, '', window.location.pathname);
    }
  } catch (_) {}

  initTheme();
  initSplashScreen();

  elements.attendanceDatePicker.value = state.currentAttendanceDate;
  updateGreeting();
  setInterval(updateGreeting, 60000);

  // Load current staff profile & photo
  apiFetch('/api/staff/current').then(res => {
    if (res && res.staff) {
      state.currentStaff = res.staff.name;
      state.currentRole = res.staff.role;
      state.currentStaffPhoto = res.staff.avatar_image || null;
      state.currentStaffColor = res.staff.avatar_color || '#0071E3';
      updateGreeting();
    }
  }).catch(() => {});

  const startTime = Date.now();
  try {
    initRealtimeSync();
    await Promise.all([
      loadSideLogs(),
      refreshDashboard()
    ]);
  } catch (err) {
    console.warn('Initial load warning:', err);
  } finally {
    // Minimum display safety threshold (~800ms) so animation finishes smoothly without abrupt cutoff
    dismissSplashScreen(800);
  }
});
