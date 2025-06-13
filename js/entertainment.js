// ErgoSphere Entertainment JavaScript - Netflix-style functionality

class EntertainmentHub {
    constructor() {
        this.currentCarousel = 0;
        this.carousels = {};
        this.featuredContent = [];
        this.recentContent = [];
        this.continueWatching = [];
        this.allData = {};
        this.cardWidth = this.getCardWidth();
        this.cardGap = 20;
        this.init();
    }
    getCardWidth() {
        if (window.innerWidth < 500) return 110;
        if (window.innerWidth < 900) return 140;
        return 170;
    }
    async loadAllData() {
        // Only use local JSON files, do not attempt API endpoints
        const categoryMappings = {
            'loot': '/data/loot.json',
            'movies': '/data/movies.json',
            'anime': '/data/anime.json',
            'coop': '/data/coop.json',
            'pvp': '/data/pvp.json',
            'singleplayer': '/data/singleplayer.json',
            'youtube': '/data/youtube.json',
            'sundaymorning': '/data/sundaymorning.json',
            'sundaynight': '/data/sundaynight.json'
        };
        for (const [category, localPath] of Object.entries(categoryMappings)) {
            let data = [];
            try {
                const localResp = await fetch(localPath);
                if (localResp.ok) {
                    data = await localResp.json();
                } else {
                    data = [];
                }
            } catch (e) {
                data = [];
            }
            this.allData[category] = data;
        }
    }
    async init() {
        try {
            this.showLoadingSpinner();
            await this.loadAllData();
        } catch (e) {
            console.error('Data load failed:', e);
        } finally {
            this.hideLoadingSpinner();
        }
        this.setupCarousels();
        this.setupModal();
        this.setupHeroSection();
        this.populateCarousels();
        this.setupEventListeners();
    }
    showLoadingSpinner() {
        if (!document.getElementById('ent-spinner')) {
            const spinner = document.createElement('div');
            spinner.id = 'ent-spinner';
            spinner.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:2000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.7)';
            spinner.innerHTML = '<div style="border:8px solid #232526;border-top:8px solid #e50914;border-radius:50%;width:60px;height:60px;animation:spin 1s linear infinite"></div>';
            document.body.appendChild(spinner);
        }
    }
    hideLoadingSpinner() {
        const spinner = document.getElementById('ent-spinner');
        if (spinner) spinner.remove();
    }
    setupCarousels() {
        this.carousels = {
            categories: document.getElementById('categories-carousel'),
            featured: document.getElementById('featured-carousel'),
            recent: document.getElementById('recent-carousel'),
            continue: document.getElementById('continue-carousel')
        };
        Object.values(this.carousels).forEach(carousel => {
            if (carousel) {
                carousel.style.minHeight = (this.getCardWidth() * 1.5 + 20) + 'px';
                carousel.style.scrollSnapType = 'x mandatory';
                // Touch/drag support
                let isDown = false, startX, scrollLeft;
                carousel.addEventListener('mousedown', e => {
                    isDown = true;
                    carousel.classList.add('dragging');
                    startX = e.pageX - carousel.offsetLeft;
                    scrollLeft = carousel.scrollLeft;
                });
                carousel.addEventListener('mouseleave', () => {
                    isDown = false;
                    carousel.classList.remove('dragging');
                });
                carousel.addEventListener('mouseup', () => {
                    isDown = false;
                    carousel.classList.remove('dragging');
                });
                carousel.addEventListener('mousemove', e => {
                    if (!isDown) return;
                    e.preventDefault();
                    const x = e.pageX - carousel.offsetLeft;
                    const walk = (x - startX) * 1.2;
                    carousel.scrollLeft = scrollLeft - walk;
                });
                // Touch events
                let touchStartX = 0, touchScrollLeft = 0;
                carousel.addEventListener('touchstart', e => {
                    touchStartX = e.touches[0].pageX;
                    touchScrollLeft = carousel.scrollLeft;
                });
                carousel.addEventListener('touchmove', e => {
                    const x = e.touches[0].pageX;
                    const walk = (x - touchStartX) * 1.2;
                    carousel.scrollLeft = touchScrollLeft - walk;
                });
            }
        });
    }

    setupModal() {
        this.modal = document.getElementById('content-modal');
        this.modalImg = document.getElementById('modal-img');
        this.modalTitle = document.getElementById('modal-title');
        this.modalDescription = document.getElementById('modal-description');
        this.modalGenre = document.getElementById('modal-genre');
        this.modalRuntime = document.getElementById('modal-runtime');
        this.modalStatus = document.getElementById('modal-status');
        this.modalView = document.getElementById('modal-view');
        this.modalAdd = document.getElementById('modal-add');

        // Close modal when clicking X or outside
        document.querySelector('.close').onclick = () => this.closeModal();
        this.modal.onclick = (e) => {
            if (e.target === this.modal) this.closeModal();
        };
    }

    setupHeroSection() {
        const heroBackdrop = document.getElementById('hero-backdrop');
        const heroTitle = document.getElementById('hero-title');
        const heroDescription = document.getElementById('hero-description');
        const heroPlay = document.getElementById('hero-play');
        const heroInfo = document.getElementById('hero-info');

        // Cycle through featured content for hero section
        this.updateHeroContent();
        setInterval(() => this.updateHeroContent(), 10000); // Change every 10 seconds

        heroPlay.onclick = () => this.exploreRandomCategory();
        heroInfo.onclick = () => this.showRandomContent();
    }

    updateHeroContent() {
        const categories = Object.keys(this.allData);
        if (categories.length === 0) return;

        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const categoryData = this.allData[randomCategory];
        
        if (categoryData && categoryData.length > 0) {
            const randomItem = categoryData[Math.floor(Math.random() * categoryData.length)];
            const heroTitle = document.getElementById('hero-title');
            const heroDescription = document.getElementById('hero-description');
            const heroContent = document.querySelector('.hero-content');
            
            heroTitle.textContent = randomItem.Title || randomItem.TITLE || randomItem.name || 'Discover Entertainment';
            heroDescription.textContent = this.truncateText(
                randomItem.DESCRIPTION || randomItem.description || 'Explore our vast collection of entertainment content.',
                150
            );

            // Set hero background image, special handling for YouTube
            let imageUrl = '';
            if (randomCategory === 'youtube' && randomItem.url) {
                // Extract YouTube video ID
                const match = randomItem.url.match(/(?:youtu.be\/|youtube.com\/(?:watch\?v=|embed\/|v\/|shorts\/)?)([\w-]{11})/);
                if (match && match[1]) {
                    imageUrl = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
                } else {
                    imageUrl = '/assets/img/no-image.png';
                }
            } else {
                imageUrl = randomItem.imageUrl || randomItem.image || '';
                if (!imageUrl) imageUrl = '/assets/img/no-image.png';
                if (imageUrl && !/^https?:\/\//.test(imageUrl) && !imageUrl.startsWith('/')) {
                    imageUrl = '/assets/img/' + imageUrl.replace(/^\.?\/?assets\/?img\/?/, '');
                }
            }
            heroContent.style.background = `linear-gradient(120deg, #23252699 60%, #181818cc 100%), url('${imageUrl}') center/cover no-repeat`;
        }
    }

    populateCarousels() {
        this.populateFeaturedCarousel();
        this.populateRecentCarousel();
        this.populateContinueCarousel();
    }

    createContentCard(item) {
        const w = this.getCardWidth();
        const h = Math.round(w * 1.5);
        const title = item.Title || item.TITLE || item.name || 'Unknown Title';
        // Prefer imageUrl, then image, then fallback, but handle YouTube
        let imageUrl = '';
        if ((item.category === 'youtube' || item.GENRE === 'YouTube' || item.genre === 'YouTube') && item.url) {
            // Extract YouTube video ID
            const match = item.url.match(/(?:youtu.be\/|youtube.com\/(?:watch\?v=|embed\/|v\/|shorts\/)?)([\w-]{11})/);
            if (match && match[1]) {
                imageUrl = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
            } else {
                imageUrl = '/assets/img/no-image.png';
            }
        } else {
            imageUrl = item.imageUrl || item.image || '';
            if (!imageUrl) imageUrl = '/assets/img/no-image.png';
            if (imageUrl && !/^https?:\/\//.test(imageUrl) && !imageUrl.startsWith('/')) {
                imageUrl = '/assets/img/' + imageUrl.replace(/^\.?\/?assets\/?img\/?/, '');
            }
        }
        const genre = item.GENRE || item.genre || '';
        const runtime = item.RUNTIME || item.runtime || '';
        const status = this.getStatusIndicator(item);
        return `
            <div class="content-card fade-in" style="width:${w}px;height:${h}px;" data-item='${JSON.stringify(item).replace(/'/g, "&#39;")}' tabindex="0">
                <div class="content-image" style="height:70%;min-height:${Math.round(h*0.7)}px;">
                    <img src="${imageUrl}" alt="${title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;" onerror="this.onerror=null;this.src='/assets/img/no-image.png'">
                </div>
                <div class="content-info">
                    <h4>${this.truncateText(title, 30)}</h4>
                    <div class="content-meta">
                        <span class="status-indicator ${status.class}"></span>
                        <span>${this.truncateText(genre, 20)}</span>
                        ${runtime ? `<span>${runtime}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // Fallback for empty carousels
    populateFeaturedCarousel() {
        const featuredContainer = this.carousels.featured;
        const featured = this.getFeaturedContent();
        if (featured.length === 0) {
            featuredContainer.innerHTML = `<div class="content-card fade-in" style="width:${this.cardWidth}px;height:${Math.round(this.cardWidth*1.5)}px;display:flex;align-items:center;justify-content:center;"><div style='text-align:center;width:100%'><img src='/assets/img/no-image.png' alt='No Content' style='width:60px;height:60px;opacity:0.5;'><div style='color:#aaa;margin-top:1rem;'>No featured content available</div></div></div>`;
        } else {
            featuredContainer.innerHTML = featured.map(item => this.createContentCard(item)).join('');
        }
    }
    populateRecentCarousel() {
        const recentContainer = this.carousels.recent;
        const recent = this.getRecentContent();
        if (recent.length === 0) {
            recentContainer.innerHTML = `<div class="content-card fade-in" style="width:${this.cardWidth}px;height:${Math.round(this.cardWidth*1.5)}px;display:flex;align-items:center;justify-content:center;"><div style='text-align:center;width:100%'><img src='/assets/img/no-image.png' alt='No Content' style='width:60px;height:60px;opacity:0.5;'><div style='color:#aaa;margin-top:1rem;'>No recent content available</div></div></div>`;
        } else {
            recentContainer.innerHTML = recent.map(item => this.createContentCard(item)).join('');
        }
    }
    populateContinueCarousel() {
        const continueContainer = this.carousels.continue;
        const continue_watching = this.getContinueWatching();
        if (continue_watching.length === 0) {
            continueContainer.innerHTML = `<div class="content-card fade-in" style="width:${this.cardWidth}px;height:${Math.round(this.cardWidth*1.5)}px;display:flex;align-items:center;justify-content:center;"><div style='text-align:center;width:100%'><img src='/assets/img/no-image.png' alt='No Content' style='width:60px;height:60px;opacity:0.5;'><div style='color:#aaa;margin-top:1rem;'>No continue watching content</div></div></div>`;
        } else {
            continueContainer.innerHTML = continue_watching.map(item => this.createContentCard(item)).join('');
        }
    }

    getFeaturedContent() {
        const featured = [];
        
        // Get items with high ratings or popular status
        Object.entries(this.allData).forEach(([category, items]) => {
            if (Array.isArray(items)) {
                const categoryFeatured = items
                    .filter(item => this.isFeatured(item))
                    .slice(0, 3)
                    .map(item => ({ ...item, category }));
                featured.push(...categoryFeatured);
            }
        });
        
        return this.shuffleArray(featured).slice(0, 12);
    }

    getRecentContent() {
        const recent = [];
        
        Object.entries(this.allData).forEach(([category, items]) => {
            if (Array.isArray(items)) {
                const categoryRecent = items
                    .filter(item => this.isRecentlyActive(item))
                    .slice(0, 4)
                    .map(item => ({ ...item, category }));
                recent.push(...categoryRecent);
            }
        });
        
        return recent.slice(0, 12);
    }

    getContinueWatching() {
        const continue_watching = [];
        
        Object.entries(this.allData).forEach(([category, items]) => {
            if (Array.isArray(items)) {
                const categoryContinue = items
                    .filter(item => this.isInProgress(item))
                    .slice(0, 4)
                    .map(item => ({ ...item, category }));
                continue_watching.push(...categoryContinue);
            }
        });
        
        return continue_watching.slice(0, 12);
    }

    isFeatured(item) {
        // Logic to determine if content is featured
        return item.imageUrl && (
            item.STATUS === '🟢' || 
            item.WATCHED === '👀' ||
            (item.copies && item.copies > 0) ||
            item.GENRE?.includes('Action') ||
            item.DESCRIPTION?.length > 200
        );
    }

    isRecentlyActive(item) {
        // Logic to determine recently active content
        return item.STATUS === '🟢' || 
               item.WATCHED === '👀' ||
               item['LAST WATCHED'] ||
               (item.copies && item.copies > 0);
    }

    isInProgress(item) {
        // Logic to determine in-progress content
        return item.STATUS === '🟡' || 
               item['LAST WATCHED'] ||
               (item.WATCHED && item.WATCHED !== '👀');
    }

    getStatusIndicator(item) {
        if (item.STATUS === '🟢' || (item.copies && item.copies > 0)) {
            return { class: 'status-active', text: 'Active' };
        } else if (item.STATUS === '🟡' || item.WATCHED === '👀') {
            return { class: 'status-watching', text: 'Watching' };
        } else {
            return { class: 'status-inactive', text: 'Inactive' };
        }
    }

    setupEventListeners() {
        // Content card clicks (use event delegation for performance)
        document.body.addEventListener('click', (e) => {
            const contentCard = e.target.closest('.content-card');
            if (contentCard) {
                const itemData = JSON.parse(contentCard.dataset.item);
                this.showModal(itemData);
            }
        });
        // Keyboard navigation for cards
        document.body.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const contentCard = document.activeElement.closest('.content-card');
                if (contentCard) {
                    const itemData = JSON.parse(contentCard.dataset.item);
                    this.showModal(itemData);
                }
            }
        });
        // Category card navigation
        document.querySelectorAll('.category-link').forEach(link => {
            link.onclick = (e) => {
                e.preventDefault();
                const href = e.target.getAttribute('href');
                this.navigateToCategory(href);
            };
        });
    }

    showModal(item) {
        const title = item.Title || item.TITLE || item.name || 'Unknown Title';
        // Use YouTube thumbnail if YouTube content
        let imageUrl = '';
        if ((item.category === 'youtube' || item.GENRE === 'YouTube' || item.genre === 'YouTube') && item.url) {
            const match = item.url.match(/(?:youtu.be\/|youtube.com\/(?:watch\?v=|embed\/|v\/|shorts\/)?)([\w-]{11})/);
            if (match && match[1]) {
                imageUrl = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
            } else {
                imageUrl = '/assets/img/no-image.png';
            }
        } else {
            imageUrl = item.imageUrl || item.image || 'https://via.placeholder.com/400x600?text=No+Image';
            if (imageUrl && !/^https?:\/\//.test(imageUrl) && !imageUrl.startsWith('/')) {
                imageUrl = '/assets/img/' + imageUrl.replace(/^\.?\/?assets\/?img\/?/, '');
            }
        }
        const description = item.DESCRIPTION || item.description || 'No description available.';
        const genre = item.GENRE || item.genre || 'Unknown Genre';
        const runtime = item.RUNTIME || item.runtime || 'Unknown Runtime';
        const status = this.getStatusIndicator(item);

        this.modalImg.src = imageUrl;
        this.modalTitle.textContent = title;
        this.modalDescription.textContent = description;
        this.modalGenre.textContent = genre;
        this.modalRuntime.textContent = runtime;
        this.modalStatus.textContent = status.text;

        // Set up modal buttons
        this.modalView.onclick = () => {
            this.closeModal();
            if (item.Link || item.link) {
                window.open(item.Link || item.link, '_blank');
            }
        };

        this.modalAdd.onclick = () => {
            this.addToMyList(item);
        };

        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        // Trap focus inside modal
        const focusable = this.modal.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
        let first = focusable[0], last = focusable[focusable.length-1];
        const trap = e => {
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
            if (e.key === 'Escape') this.closeModal();
        };
        this.modal.addEventListener('keydown', trap);
        setTimeout(() => { first && first.focus(); }, 100);
        // Close on click outside
        this.modal.onclick = (e) => { if (e.target === this.modal) this.closeModal(); };
    }

    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.modal.onkeydown = null;
    }

    addToMyList(item) {
        // Implementation for adding to user's list
        console.log('Adding to My List:', item);
        // You could implement local storage or API call here
        alert(`Added "${item.Title || item.TITLE || item.name}" to your list!`);
    }

    navigateToCategory(href) {
        // Add smooth transition effect
        document.body.style.transition = 'opacity 0.3s ease';
        document.body.style.opacity = '0';
        
        setTimeout(() => {
            window.location.href = href;
        }, 300);
    }

    exploreRandomCategory() {
        const categories = [
            'admin/movies.html', 'admin/anime.html', 'admin/coop.html', 
            'admin/pvp.html', 'admin/singleplayer.html', 'admin/youtube.html'
        ];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        this.navigateToCategory(randomCategory);
    }

    showRandomContent() {
        const allItems = [];
        Object.entries(this.allData).forEach(([category, items]) => {
            if (Array.isArray(items)) {
                allItems.push(...items.map(item => ({ ...item, category })));
            }
        });
        
        if (allItems.length > 0) {
            const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
            this.showModal(randomItem);
        }
    }

    truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EntertainmentHub();
    // Dynamically set category card images to a random image from each category
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (window.entHub && window.entHub.allData && window.entHub.allData[category]) {
            const items = window.entHub.allData[category];
            if (Array.isArray(items) && items.length > 0) {
                // Pick a random item
                const randomItem = items[Math.floor(Math.random() * items.length)];
                let imageUrl = '';
                if ((category === 'youtube' || randomItem.GENRE === 'YouTube' || randomItem.genre === 'YouTube') && randomItem.url) {
                    const match = randomItem.url.match(/(?:youtu.be\/|youtube.com\/(?:watch\?v=|embed\/|v\/|shorts\/)?)([\w-]{11})/);
                    if (match && match[1]) {
                        imageUrl = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
                    } else {
                        imageUrl = '/assets/img/no-image.png';
                    }
                } else {
                    imageUrl = randomItem.imageUrl || randomItem.image || '';
                    if (!imageUrl) imageUrl = '/assets/img/no-image.png';
                    if (imageUrl && !/^https?:\/\//.test(imageUrl) && !imageUrl.startsWith('/')) {
                        imageUrl = '/assets/img/' + imageUrl.replace(/^\.?\/?assets\/?img\/?/, '');
                    }
                }
                const img = card.querySelector('.category-image img');
                if (img) img.src = imageUrl;
            }
        }
    });
});

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('content-modal');
    if (modal.style.display === 'block' && e.key === 'Escape') {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Fade-in animation
const style = document.createElement('style');
style.innerHTML = `@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}
.fade-in{animation:fadeIn 0.7s cubic-bezier(.4,0,.2,1);}
@keyframes fadeIn{from{opacity:0;transform:translateY(30px);}to{opacity:1;transform:translateY(0);}}`;
document.head.appendChild(style);
