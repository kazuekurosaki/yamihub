/**
 * YAMIHUB ENGINE - GitHub Pages Ready
 */

let allPosts = [];
let currentLimit = 10; 

// 1. Path & Navigation Fixer (Menangani Error 404 GitHub Pages)
function getBasePath() {
    const path = window.location.pathname;
    // Jika kita di dalam folder 'pages', kita butuh '../' untuk kembali ke root
    return path.includes('/pages/') ? '../' : './';
}

async function injectIncludes() {
    const base = getBasePath();
    const headers = document.querySelectorAll('#header-placeholder');
    const footers = document.querySelectorAll('#footer-placeholder');

    if (headers.length > 0) {
        const res = await fetch(`${base}includes/header.html`);
        const html = await res.text();
        headers.forEach(el => {
            el.innerHTML = html;
            // Perbaiki link di dalam header yang baru saja di-inject
            el.querySelectorAll('a').forEach(link => {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('http') && !href.startsWith('#')) {
                    link.setAttribute('href', base + href);
                }
            });
        });
        updateNSFWButton();
    }

    if (footers.length > 0) {
        const res = await fetch(`${base}includes/footer.html`);
        const html = await res.text();
        footers.forEach(el => {
            el.innerHTML = html;
            el.querySelectorAll('a').forEach(link => {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('http') && !href.startsWith('#')) {
                    link.setAttribute('href', base + href);
                }
            });
        });
    }
}

// 2. Data Fetcher
async function fetchData() {
    try {
        const base = getBasePath();
        const response = await fetch(`${base}data/post.json`);
        allPosts = await response.json();
        
        // Cek fungsi inisialisasi di halaman masing-masing
        if (typeof initPage === 'function') initPage();
        else if (document.getElementById('post-grid')) renderGrid();
        
    } catch (error) {
        console.error("Data Load Error:", error);
    }
}

// 3. Render Card System
function renderGrid(dataToRender = null) {
    const container = document.getElementById('post-grid');
    if (!container) return;

    const base = getBasePath();
    const isNSFW = localStorage.getItem('mode-nsfw') === 'true';
    const source = dataToRender || allPosts;
    
    const filtered = source.filter(post => isNSFW ? true : post.type === 'SFW');
    const limited = filtered.slice(0, currentLimit);

    container.innerHTML = limited.map(post => `
        <div class="post-card glass fade-in shadow-xl">
            <a href="${base}detail.html?id=${post.id}">
                <div class="relative">
                    <img src="${post.cover}" alt="${post.title}" loading="lazy" onerror="this.src='${base}src/no-cover.jpg'">
                    <div class="play-overlay">
                        <div class="play-icon">▶</div>
                    </div>
                </div>
                <div class="p-3">
                    <h3 class="text-[11px] font-bold line-clamp-2 h-8 leading-tight uppercase tracking-tighter">${post.title}</h3>
                    <div class="flex justify-between items-center mt-2">
                        <span class="text-[10px] text-amber-500 font-black">★ ${post.rating}</span>
                        <span class="badge-hd text-[9px]">${post.quality}</span>
                    </div>
                </div>
            </a>
        </div>
    `).join('');

    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) loadMoreBtn.style.display = currentLimit >= filtered.length ? 'none' : 'block';
}

// 4. Engine Fitur (Search, Bookmark, Toggles)
function searchEngine(query) {
    const q = query.toLowerCase();
    const results = allPosts.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.artist.some(a => a.toLowerCase().includes(q)) ||
        p.genre.some(g => g.toLowerCase().includes(q))
    );
    renderGrid(results);
}

function toggleTheme() {
    const isDark = document.body.classList.contains('dark-mode');
    const newTheme = isDark ? 'light-mode' : 'dark-mode';
    document.body.className = newTheme;
    localStorage.setItem('theme', newTheme);
}

function toggleNSFW() {
    const nsfw = localStorage.getItem('mode-nsfw') === 'true';
    localStorage.setItem('mode-nsfw', !nsfw);
    location.reload();
}

function updateNSFWButton() {
    const btn = document.getElementById('nsfw-indicator');
    if (!btn) return;
    const isNSFW = localStorage.getItem('mode-nsfw') === 'true';
    btn.innerText = isNSFW ? "NSFW: ON" : "NSFW: OFF";
    btn.className = isNSFW ? "text-[9px] px-2 py-1.5 rounded-full font-black bg-rose-600 text-white shadow-rose-900/40" : "text-[9px] px-2 py-1.5 rounded-full font-black bg-slate-700 text-white";
}

function toggleBookmark(id) {
    let favs = JSON.parse(localStorage.getItem('yamihub_fav')) || [];
    const idx = favs.indexOf(id);
    if (idx === -1) favs.push(id);
    else favs.splice(idx, 1);
    localStorage.setItem('yamihub_fav', JSON.stringify(favs));
    location.reload();
}

// 5. UI Helpers
function toggleMobileMenu() { document.getElementById('mobile-menu').classList.toggle('hidden'); }
function toggleSearch() { 
    const box = document.getElementById('search-overlay');
    box.classList.toggle('hidden');
    if (!box.classList.contains('hidden')) document.getElementById('main-search').focus();
}

// 6. Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'dark-mode';
    document.body.className = savedTheme;
    injectIncludes();
    fetchData();
});
