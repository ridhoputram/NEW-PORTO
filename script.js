/* ==========================================================================
   1. FUNGSI TRANSLATE & LANGUAGE SWITCHER
   ========================================================================== */

// Fungsi untuk menerapkan bahasa ke seluruh elemen bertanda [data-en] & [data-id]
function applyLanguage(isEn) {
    const switchEl = document.getElementById('languageSwitch') || document.querySelector('.language-switch');
    if (!switchEl) return;

    const langID = document.getElementById('langID') || switchEl.querySelector('[data-lang="id"]');
    const langEN = document.getElementById('langEN') || switchEl.querySelector('[data-lang="en"]');

    if (isEn) {
        switchEl.classList.add('active-en');
        switchEl.classList.remove('active-id');
    } else {
        switchEl.classList.remove('active-en');
        switchEl.classList.add('active-id');
    }

    if (langEN) {
        langEN.classList.toggle('active', isEn);
        langEN.style.color = isEn ? '#ffffff' : '#8e8e93';
    }
    if (langID) {
        langID.classList.toggle('active', !isEn);
        langID.style.color = !isEn ? '#ffffff' : '#8e8e93';
    }

    // 1. Update Teks Konten Biasa
    const elements = document.querySelectorAll('[data-en], [data-id]');
    elements.forEach(el => {
        const text = isEn ? el.getAttribute('data-en') : el.getAttribute('data-id');
        if (text !== null && text !== '') {
            el.textContent = text;
        }
    });

    // 2. Update Atribut Tooltip Multi-Bahasa
    const tooltipElements = document.querySelectorAll('[data-tooltip-en], [data-tooltip-id]');
    tooltipElements.forEach(el => {
        const tooltipText = isEn ? el.getAttribute('data-tooltip-en') : el.getAttribute('data-tooltip-id');
        if (tooltipText !== null && tooltipText !== '') {
            el.setAttribute('data-tooltip', tooltipText);
        }
    });

    localStorage.setItem('selectedLanguage', isEn ? 'en' : 'id');
}

// Inisialisasi Event Listener pada Tombol Switch Bahasa
function initLanguage() {
    const switchEl = document.getElementById('languageSwitch') || document.querySelector('.language-switch');
    
    // Cek preferensi tersimpan (Default: EN jika belum ada)
    const savedLang = localStorage.getItem('selectedLanguage');
    const initialIsEn = savedLang ? savedLang === 'en' : true;

    // Terapkan bahasa saat ini
    applyLanguage(initialIsEn);

    if (switchEl && !switchEl.dataset.initialized) {
        switchEl.dataset.initialized = 'true'; // Hindari pendaftaran event berulang
        switchEl.addEventListener('click', (e) => {
            e.stopPropagation();
            const isCurrentlyEn = switchEl.classList.contains('active-en');
            applyLanguage(!isCurrentlyEn);
        });
    }
}


/* ==========================================================================
   2. POP-UP FULLSCREEN PPT (Halaman Sub-Page)
   ========================================================================== */

function initPPTModal() {
    const btnFullscreen = document.getElementById('btnFullscreen');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const pptModal = document.getElementById('pptModal');
    const pptIframe = document.getElementById('pptIframe');
    const modalIframe = document.getElementById('modalIframe');

    if (btnFullscreen && pptModal) {
        // Buka Pop-up
        btnFullscreen.addEventListener('click', () => {
            if (pptIframe && modalIframe) {
                modalIframe.src = pptIframe.src;
            }
            pptModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        // Tutup Pop-up
        const closeModal = () => {
            pptModal.classList.remove('active');
            if (modalIframe) modalIframe.src = '';
            document.body.style.overflow = 'auto';
        };

        if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);

        pptModal.addEventListener('click', (e) => {
            if (e.target === pptModal) closeModal();
        });
    }
}


/* ==========================================================================
   3. MEMUAT KOMPONEN HEADER & FOOTER
   ========================================================================== */

function loadLayoutComponents() {
    // Menyesuaikan path file components.html jika sedang di dalam subfolder
    const isSubfolder = window.location.pathname.includes('/projects/');
    const componentPath = isSubfolder ? '../components.html' : 'components.html';

    fetch(componentPath)
        .then(response => {
            if (!response.ok) throw new Error('Gagal memuat komponen layout');
            return response.text();
        })
        .then(htmlString => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlString, 'text/html');

            const headerContent = doc.getElementById('header-component');
            const footerContent = doc.getElementById('footer-component');

            const headerContainer = document.getElementById('header-container');
            const footerContainer = document.getElementById('footer-container');

            if (headerContainer && headerContent) headerContainer.appendChild(headerContent);
            if (footerContainer && footerContent) footerContainer.appendChild(footerContent);

            // Jalankan sistem bahasa SETELAH navbar di-inject ke DOM
            initLanguage();
        })
        .catch(error => console.error('Error loading layout:', error));
}


/* ==========================================================================
   4. Message Modal POP UP (FORM KONTAK)
   ========================================================================== */

function initContactForm() {
    const contactForm = document.getElementById("contactForm");
    const statusModal = document.getElementById("statusModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const submitBtn = document.getElementById("submitBtn");

    if (contactForm) {
        contactForm.addEventListener("submit", async function (event) {
            event.preventDefault(); // Mencegah pindah halaman ke Formspree

            const formData = new FormData(contactForm);
            
            // Ubah teks tombol saat sedang mengirim
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = "Sending...";
            submitBtn.disabled = true;

            try {
                const response = await fetch(contactForm.action, {
                    method: "POST",
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    // Tampilkan Modal Pop-up Sukses
                    statusModal.classList.add("active");
                    contactForm.reset(); // Kosongkan isi form
                } else {
                    alert("Ops! Terjadi masalah saat mengirim pesan. Silakan coba lagi.");
                }
            } catch (error) {
                alert("Gagal terhubung ke server. Periksa koneksi internet Anda.");
            } finally {
                // Kembalikan tombol ke keadaan semula
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    // Tutup Modal saat tombol Close diklik
    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", function () {
            statusModal.classList.remove("active");
        });
    }

    // Tutup Modal saat area di luar card diklik
    if (statusModal) {
        statusModal.addEventListener("click", function (e) {
            if (e.target === statusModal) {
                statusModal.classList.remove("active");
            }
        });
    }
}


/* ==========================================================================
   5. LOGIKA CAROUSEL FOTO DALAM KARTU
   ========================================================================== */

// 1. Geser Foto Kartu via Tombol Prev / Next
function moveSlide(button, direction) {
    const carousel = button.closest('.card-carousel');
    if (!carousel) return;

    const images = carousel.querySelectorAll('.carousel-img');
    const dots = carousel.querySelectorAll('.dot');
    
    let activeIndex = Array.from(images).findIndex(img => img.classList.contains('active'));
    if (activeIndex === -1) activeIndex = 0;
    
    // Hapus status active lama
    images[activeIndex].classList.remove('active');
    if (dots.length > 0 && dots[activeIndex]) {
        dots[activeIndex].classList.remove('active');
    }
    
    // Hitung indeks baru (Looping)
    activeIndex = (activeIndex + direction + images.length) % images.length;
    
    // Aktifkan elemen baru
    images[activeIndex].classList.add('active');
    if (dots.length > 0 && dots[activeIndex]) {
        dots[activeIndex].classList.add('active');
    }
}

// 2. Geser Foto Kartu via Titik Indikator (Dots)
function setSlide(dot, index) {
    const carousel = dot.closest('.card-carousel');
    if (!carousel) return;

    const images = carousel.querySelectorAll('.carousel-img');
    const dots = carousel.querySelectorAll('.dot');
    
    images.forEach(img => img.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    
    if (images[index]) images[index].classList.add('active');
    if (dots[index]) dots[index].classList.add('active');
}


/* ==========================================================================
   6. LOGIKA POPUP LIGHTBOX (ZOOM FOTO FULLSCREEN)
   ========================================================================== */

let currentLightboxImages = [];
let currentLightboxIndex = 0;

// 1. Buka Lightbox saat Foto Klik
function openLightbox(clickedImage) {
    const carousel = clickedImage.closest('.card-carousel');
    if (!carousel) return;

    const images = carousel.querySelectorAll('.carousel-img');
    
    currentLightboxImages = Array.from(images);
    currentLightboxIndex = currentLightboxImages.indexOf(clickedImage);
    
    updateLightbox();
    
    const lightboxModal = document.getElementById('lightboxModal');
    if (lightboxModal) {
        lightboxModal.classList.add('show');
    }
}

// 2. Perbarui Tampilan Gambar di Lightbox
function updateLightbox() {
    const imgElement = document.getElementById('lightboxImage');
    const captionElement = document.getElementById('lightboxCaption');
    
    if (!imgElement || currentLightboxImages.length === 0) return;
    
    const activeImg = currentLightboxImages[currentLightboxIndex];
    imgElement.src = activeImg.src;
    
    if (captionElement) {
        captionElement.innerText = activeImg.alt || 'Esports Moment';
    }
}

// 3. Navigasi Next/Prev di Lightbox
function moveLightboxSlide(direction) {
    if (currentLightboxImages.length === 0) return;
    
    currentLightboxIndex = (currentLightboxIndex + direction + currentLightboxImages.length) % currentLightboxImages.length;
    updateLightbox();
}

// 4. Tutup Lightbox
function closeLightbox() {
    const lightboxModal = document.getElementById('lightboxModal');
    if (lightboxModal) {
        lightboxModal.classList.remove('show');
    }
}

function initLightbox() {
    const lightboxModal = document.getElementById('lightboxModal');

    // Tutup saat klik background hitam
    if (lightboxModal) {
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) {
                closeLightbox();
            }
        });
    }

    // Navigasi Keyboard (Esc, Panah Kiri, Panah Kanan)
    document.addEventListener('keydown', (e) => {
        if (!lightboxModal || !lightboxModal.classList.contains('show')) return;
        
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') moveLightboxSlide(-1);
        if (e.key === 'ArrowRight') moveLightboxSlide(1);
    });
}


/* ==========================================================================
   7. LOGIKA SHOWCASE GALERI (GAMBAR BESAR + THUMBNAILS)
   ========================================================================== */

let currentIndex = 0;

// Fungsi memperbarui gambar utama dan status thumbnail
function updateMainImage(index) {
    const thumbs = document.querySelectorAll('.thumb-item');
    if (thumbs.length === 0) return;

    // Menangani putaran navigasi (loop)
    if (index < 0) index = thumbs.length - 1;
    if (index >= thumbs.length) index = 0;
    
    currentIndex = index;
    const selectedThumb = thumbs[currentIndex];
    const mainImg = document.getElementById('mainDisplayImg');
    const mainCap = document.getElementById('mainDisplayCaption');
    
    if (selectedThumb) {
        // 1. Ambil URL gambar dari data-img ATAU tag <img> di dalam thumbnail
        const imgSrc = selectedThumb.getAttribute('data-img') || selectedThumb.querySelector('img')?.src;
        if (imgSrc && mainImg) {
            mainImg.src = imgSrc;
        }
        
        // 2. Update teks caption sesuai bahasa aktif
        const textEN = selectedThumb.getAttribute('data-en') || '';
        const textID = selectedThumb.getAttribute('data-id') || '';
        
        if (mainCap) {
            mainCap.setAttribute('data-en', textEN);
            mainCap.setAttribute('data-id', textID);

            const savedLang = localStorage.getItem('selectedLanguage');
            const isEn = savedLang === 'en';
            mainCap.innerText = isEn ? textEN : textID;
        }
        
        // 3. Pindahkan status class active
        thumbs.forEach(t => t.classList.remove('active'));
        selectedThumb.classList.add('active');
        
        // 4. Scroll thumbnail aktif ke tengah secara halus
        selectedThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
}

// Klik langsung pada thumbnail
function selectImage(element) {
    const thumbs = Array.from(document.querySelectorAll('.thumb-item'));
    const index = thumbs.indexOf(element);
    updateMainImage(index);
}

// Klik tombol panah kiri / kanan
function changeImage(direction) {
    updateMainImage(currentIndex + direction);
}

// Fungsi pengganti/penerjemah bahasa yang aman untuk thumbnail
function updateLanguage(lang) {
    const isEn = lang === 'en';
    
    // Mengubah semua elemen ber-atribut data-id / data-en KECUALI .thumb-item
    document.querySelectorAll('[data-id], [data-en]').forEach(el => {
        if (!el.classList.contains('thumb-item')) {
            const textID = el.getAttribute('data-id');
            const textEN = el.getAttribute('data-en');
            el.innerText = isEn ? (textEN || textID) : (textID || textEN);
        }
    });
}


/* ==========================================================================
   8. EKSEKUSI UTAMA (DOM CONTENT LOADED)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    if (typeof loadLayoutComponents === 'function') loadLayoutComponents();
    if (typeof initPPTModal === 'function') initPPTModal();
    if (typeof initContactForm === 'function') initContactForm();
    if (typeof initLightbox === 'function') initLightbox();

    // Navigasi Keyboard untuk Galeri Utama
    document.addEventListener('keydown', (e) => {
        const lightboxModal = document.getElementById('lightboxModal');
        const pptModal = document.getElementById('pptModal');
        const isModalActive = (lightboxModal && lightboxModal.classList.contains('show')) ||
                              (pptModal && pptModal.classList.contains('active'));

        if (!isModalActive) {
            if (e.key === 'ArrowLeft') changeImage(-1);
            if (e.key === 'ArrowRight') changeImage(1);
        }
    });
});