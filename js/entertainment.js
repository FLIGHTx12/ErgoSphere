// ErgoSphere Entertainment JavaScript - Netflix-style functionality

class EntertainmentHub {
    constructor() {
        this.currentCarousel = 0;
        this.carousels = {};
        this.featuredContent = [];
        this.recentContent = [];
        this.continueWatching = [];
        this.allData = {};
        
        this.init();
    }    async init() {
        console.log('🎬 Initializing Entertainment Hub...');
        await this.loadAllData();
        console.log('📊 Data loaded:', Object.keys(this.allData));
        this.setupCarousels();
        console.log('🎠 Carousels setup complete');
        this.setupModal();
        console.log('🖼️ Modal setup complete');
        this.setupHeroSection();
        console.log('🎭 Hero section setup complete');
        this.populateCarousels();
        console.log('📚 Carousels populated');
        this.setupEventListeners();
        console.log('🎮 Event listeners setup complete');
        console.log('✅ Entertainment Hub initialization complete!');
    }async loadAllData() {
        const categoryMappings = {
            'loot': '/api/loot',
            'movies': '/api/data/movies',
            'anime': '/api/data/anime',
            'coop': '/api/data/coop',
            'pvp': '/api/data/pvp',
            'singleplayer': '/api/data/singleplayer',
            'youtube': '/api/data/youtube',
            'sundaymorning': '/api/data/sundaymorning',
            'sundaynight': '/api/data/sundaynight'
        };

        for (const [category, endpoint] of Object.entries(categoryMappings)) {
            try {
                const response = await fetch(endpoint);
                if (response.ok) {
                    this.allData[category] = await response.json();
                    console.log(`Loaded ${category}:`, this.allData[category].length, 'items');
                } else {
                    console.error(`Failed to load ${category} data, status:`, response.status);
                    this.allData[category] = [];
                }
            } catch (error) {
                console.error(`Error loading ${category}:`, error);
                this.allData[category] = [];
            }
        }
    }

    setupCarousels() {
        this.carousels = {
            categories: document.getElementById('categories-carousel'),
            featured: document.getElementById('featured-carousel'),
            recent: document.getElementById('recent-carousel'),
            continue: document.getElementById('continue-carousel')
        };
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
            
            heroTitle.textContent = randomItem.Title || randomItem.TITLE || randomItem.name || 'Discover Entertainment';
            heroDescription.textContent = this.truncateText(
                randomItem.DESCRIPTION || randomItem.description || 'Explore our vast collection of entertainment content.',
                150
            );
        }
    }

    populateCarousels() {
        this.populateFeaturedCarousel();
        this.populateRecentCarousel();
        this.populateContinueCarousel();
    }

    populateFeaturedCarousel() {
        const featuredContainer = this.carousels.featured;
        const featured = this.getFeaturedContent();
        
        featuredContainer.innerHTML = featured.map(item => this.createContentCard(item)).join('');
    }

    populateRecentCarousel() {
        const recentContainer = this.carousels.recent;
        const recent = this.getRecentContent();
        
        recentContainer.innerHTML = recent.map(item => this.createContentCard(item)).join('');
    }

    populateContinueCarousel() {
        const continueContainer = this.carousels.continue;
        const continue_watching = this.getContinueWatching();
        
        continueContainer.innerHTML = continue_watching.map(item => this.createContentCard(item)).join('');
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

    createContentCard(item) {
        const title = item.Title || item.TITLE || item.name || 'Unknown Title';
        const imageUrl = item.imageUrl || item.image || 'https://via.placeholder.com/250x350?text=No+Image';
        const genre = item.GENRE || item.genre || '';
        const runtime = item.RUNTIME || item.runtime || '';
        const status = this.getStatusIndicator(item);
        
        return `
            <div class="content-card" data-item='${JSON.stringify(item).replace(/'/g, "&#39;")}'>
                <div class="content-image">
                    <img src="${imageUrl}" alt="${title}" loading="lazy" onerror="this.src='https://via.placeholder.com/250x350?text=No+Image'">
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
        // Carousel navigation
        document.querySelectorAll('.carousel-nav').forEach(nav => {
            nav.addEventListener('click', (e) => {
                const carouselType = e.target.dataset.carousel;
                const direction = e.target.classList.contains('next') ? 1 : -1;
                this.scrollCarousel(carouselType, direction);
            });
        });

        // Content card clicks
        document.addEventListener('click', (e) => {
            const contentCard = e.target.closest('.content-card');
            if (contentCard) {
                const itemData = JSON.parse(contentCard.dataset.item);
                this.showModal(itemData);
            }
        });

        // Category card navigation
        document.querySelectorAll('.category-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = e.target.getAttribute('href');
                this.navigateToCategory(href);
            });
        });
    }

    scrollCarousel(carouselType, direction) {
        const carousel = this.carousels[carouselType];
        if (!carousel) return;

        const scrollAmount = 300;
        const currentScroll = carousel.scrollLeft;
        const newScroll = currentScroll + (direction * scrollAmount);
        
        carousel.scrollTo({
            left: newScroll,
            behavior: 'smooth'
        });
    }

    showModal(item) {
        const title = item.Title || item.TITLE || item.name || 'Unknown Title';
        const imageUrl = item.imageUrl || item.image || 'https://via.placeholder.com/400x600?text=No+Image';
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
    }

    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
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
});

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('content-modal');
    if (modal.style.display === 'block' && e.key === 'Escape') {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});
