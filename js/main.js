/**
 * YAMIHUB ENGINE
 * Logic: Theme, NSFW Toggle, Search, Pagination, and Data Fetching
 */

let allPosts = [];
let currentLimit = 10; // Untuk Pagination Unlimited

// 1. Load Header & Footer secara Otomatis
async function injectIncludes() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    if (headerPlaceholder) {
        const res = await fetch('includes/header.html');
        headerPlaceholder.innerHTML = await res.text();
        updateNSFWButton(); // Update teks tombol NSFW setelah header masuk
    }
    if (footerPlaceholder) {
        const res = await fetch('includes/footer.html');
        footerPlaceholder.innerHTML = await res.text();
    }
}

// 2. Data Master Fetcher
async function fetchData() {
    try {
        const response = await fetch('data/post.json');
        allPosts = await response.json();
        
        // Cek halaman apa yang sedang dibuka
        const path = window.location.pathname;
        if (path.includes('index.html') || path === '/' || path.includes('yamihub/')) {
            renderGrid();
        }
    } catch (error) {
        console.error("Gagal memuat data JSON:", error);
    }
}

// 3. Render Card Video (Reusable)
function renderGrid(dataToRender = null) {
    const container = document.getElementById('post-grid');
    if (!container) return;

    const isNSFW = localStorage.getItem('mode-nsfw') === 'true';
    const source = dataToRender || allPosts;
    
    // Filter SFW/NSFW
    const filtered = source.filter(post => isNSFW ? true : post.type === 'SFW');
    
    // Pagination Slice
    const limited = filtered.slice(0, currentLimit);

    container.innerHTML = limited.map(post => `
        <div class="post-card glass fade-in">
            <a href="detail.html?id=${post.id}">
                <div class="relative">
                    <img src="${post.cover}" alt="${post.title}" loading="lazy">
                    <div class="play-overlay">
                        <div class="play-icon">▶</div>
                    </div>
                </div>
                <div class="p-3">
                    <h3 class="text-xs font-semibold line-clamp-2 h-8 leading-tight">${post.title}</h3>
                    <div class="flex justify-between items-center mt-2">
                        <span class="text-[10px] text-amber-500 font-bold">★ ${post.rating}</span>
                        <span class="badge-hd">${post.quality}</span>
                    </div>
                </div>
            </a>
        </div>
    `).join('');

    // Sembunyikan tombol Load More jika data habis
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = currentLimit >= filtered.length ? 'none' : 'block';
    }
}

// 4. Fitur Search
function searchEngine(query) {
    const q = query.toLowerCase();
    const results = allPosts.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.artist.some(a => a.toLowerCase().includes(q)) ||
        p.genre.some(g => g.toLowerCase().includes(q))
    );
    renderGrid(results);
}

// 5. Toggle Fitur (Theme & NSFW)
function toggleTheme() {
    const isDark = document.body.classList.contains('dark-mode');
    document.body.classList.toggle('dark-mode', !isDark);
    document.body.classList.toggle('light-mode', isDark);
    localStorage.setItem('theme', isDark ? 'light-mode' : 'dark-mode');
}

function toggleNSFW() {
    const nsfw = localStorage.getItem('mode-nsfw') === 'true';
    localStorage.setItem('mode-nsfw', !nsfw);
    location.reload(); // Reload untuk apply filter
}

function updateNSFWButton() {
    const btn = document.getElementById('nsfw-indicator');
    if (!btn) return;
    const isNSFW = localStorage.getItem('mode-nsfw') === 'true';
    btn.innerText = isNSFW ? "MODE: NSFW" : "MODE: SFW";
    btn.className = isNSFW ? "text-[10px] px-3 py-1.5 rounded-full font-bold bg-rose-600 text-white" : "text-[10px] px-3 py-1.5 rounded-full font-bold bg-emerald-600 text-white";
}

// 6. UI Toggles
function toggleMobileMenu() {
    document.getElementById('mobile-menu').classList.toggle('hidden');
}

function toggleSearch() {
    const box = document.getElementById('search-overlay');
    box.classList.toggle('hidden');
    if (!box.classList.contains('hidden')) document.getElementById('main-search').focus();
}

// 7. Load More Function
function loadMore() {
    currentLimit += 10;
    renderGrid();
}

// 8. Inisialisasi Saat Load
document.addEventListener('DOMContentLoaded', () => {
    // Apply Theme
    const savedTheme = localStorage.getItem('theme') || 'dark-mode';
    document.body.classList.add(savedTheme);

    injectIncludes();
    fetchData();
});
