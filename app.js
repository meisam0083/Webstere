let currentPage = 1;
let map = null;
let marker = null;

// مدیریت صفحات
function showPage(pageNumber) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(['loginPage', 'paymentPage', 'mapPage'][pageNumber - 1]).classList.add('active');
    currentPage = pageNumber;
    
    if(pageNumber === 3 && !map) initMap();
}

// فعال‌سازی نقشه
function initMap() {
    map = L.map('map').setView([35.6892, 51.3890], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    updateMap();
}

// آپدیت موقعیت مارکر
function updateMap() {
    if(!map) return;
    
    const main = parseInt(document.getElementById('main').value) || 0;
    const sub = parseInt(document.getElementById('sub').value) || 0;
    
    const lat = 35.6892 + (main * 0.0001);
    const lng = 51.3890 + (sub * 0.0001);

    if(marker) map.removeLayer(marker);
    
    marker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`پلاک: ${main}-${sub}`)
        .openPopup();

    map.setView([lat, lng], 18);
}

// سیستم پرداخت تستی
function activatePlan(price) {
    localStorage.setItem('subscription', Date.now() + (price === 149000 ? 15552000000 : 31536000000)); // 6 ماه یا 1 سال
    showPage(3);
}

// راه‌اندازی اولیه
function init() {
    if(localStorage.getItem('subscription')) {
        showPage(3);
    } else {
        showPage(1);
    }
}

// اجرای خودکار
document.addEventListener('DOMContentLoaded', init);