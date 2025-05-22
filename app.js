// ==========================================
// شبیه‌ساز reCAPTCHA برای محیط تستی
// ==========================================
const RecaptchaMock = {
  init: () => {
    window.grecaptcha = {
      ready: (cb) => cb(),
      render: (container, options) => {
        console.log('reCAPTCHA در حالت تستی فعال شد');
        return 'test-widget-id';
      },
      getResponse: () => 'test-response-token',
      reset: () => console.log('reCAPTCHA ریست شد')
    };
    
    window.onCaptchaSuccess = () => console.log('تأیید تستی موفق');
    window.onCaptchaError = () => console.log('تأیید تستی ناموفق');
  }
};

// فعال‌سازی فقط در محیط توسعه
if (window.location.hostname === 'localhost') {
  RecaptchaMock.init();
}

// ==========================================
// منطق اصلی برنامه
// ==========================================
class RealEstateApp {
  constructor() {
    this.currentPage = 1;
    this.map = null;
    this.marker = null;
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.checkSubscription();
  }

  bindEvents() {
    document.getElementById('authForm').addEventListener('submit', (e) => this.handleAuth(e));
    document.addEventListener('click', (e) => {
      if (e.target.closest('.plan-card')) this.handlePlanSelect(e);
    });
    document.getElementById('backButton').addEventListener('click', () => this.navigate(-1));
  }

  handleAuth(e) {
    e.preventDefault();
    const phone = document.getElementById('phoneInput').value;
    
    if (!this.validatePhone(phone)) {
      this.showError('شماره موبایل معتبر نیست');
      return;
    }

    if (!grecaptcha.getResponse()) {
      this.showError('لطفاً گزینه امنیتی را تأیید کنید');
      return;
    }

    this.navigate(2);
  }

  handlePlanSelect(e) {
    const plan = e.target.closest('.plan-card').dataset.plan;
    this.processPayment(plan);
  }

  async processPayment(amount) {
    this.showLoading();
    
    try {
      await this.simulatePayment();
      this.setSubscription(amount);
      this.navigate(3);
    } catch (error) {
      this.showError(error.message);
    } finally {
      this.hideLoading();
    }
  }

  navigate(page) {
    document.querySelectorAll('.page').forEach(p => {
      p.hidden = true;
      p.classList.remove('active');
    });

    const targetPage = document.querySelector(`#${this.getPageId(page)}`);
    targetPage.hidden = false;
    targetPage.classList.add('active');
    
    this.updateNavigation();
    this.handlePageSpecificFeatures(page);
  }

  handlePageSpecificFeatures(page) {
    if (page === 3) this.initMap();
  }

  initMap() {
    if (!this.map) {
      this.map = L.map('map').setView([35.6892, 51.3890], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
    }
    this.updateMarker();
  }

  updateMarker() {
    const main = parseInt(document.getElementById('mainPlate').value) || 0;
    const sub = parseInt(document.getElementById('subPlate').value) || 0;
    
    const lat = 35.6892 + (main * 0.0001);
    const lng = 51.3890 + (sub * 0.0001);

    if (this.marker) this.map.removeLayer(this.marker);
    
    this.marker = L.marker([lat, lng]).addTo(this.map)
      .bindPopup(`پلاک: ${main}-${sub}`)
      .openPopup();

    this.map.setView([lat, lng], 18);
  }

  // ==========================================
  // توابع کمکی
  // ==========================================
  validatePhone(phone) {
    return /^09\d{9}$/.test(phone);
  }

  showError(message) {
    document.getElementById('phoneError').textContent = message;
  }

  showLoading() {
    document.querySelector('.loading-overlay').hidden = false;
  }

  hideLoading() {
    document.querySelector('.loading-overlay').hidden = true;
  }

  setSubscription(amount) {
    const duration = amount === '149000' ? 6 : 12;
    localStorage.setItem('subscription', new Date().setMonth(new Date().getMonth() + duration));
  }

  checkSubscription() {
    if (localStorage.getItem('subscription') > Date.now()) {
      this.navigate(3);
    }
  }

  simulatePayment() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.1 ? resolve() : reject(new Error('پرداخت ناموفق'));
      }, 1500);
    });
  }

  getPageId(page) {
    return ['authPage', 'paymentPage', 'mapPage'][page - 1];
  }

  updateNavigation() {
    document.getElementById('backButton').hidden = this.currentPage === 1;
  }
}

// ==========================================
// راه‌اندازی برنامه
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  new RealEstateApp();
});