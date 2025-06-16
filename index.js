class SamsungCloudServices {
    constructor() {
        this.services = [];
        this.groupedServices = {};
        this.currentSearch = '';
        this.activeGroup = null;

        // Fix 3: Define custom group order
        this.groupOrder = [
            'Compute',
            'Storage',
            'Database',
            'Container',
            'Networking',
            'Security',
            'Application Service',
            'DevOps Tools',
            'Data Analytics',
            'AI/ML',
            'Management',
            'Hybrid Cloud'
        ];

        this.initializeElements();
        this.bindEvents();
        this.loadServices();
    }

    initializeElements() {
        this.elements = {
            searchInput: document.getElementById('searchInput'),
            clearSearch: document.getElementById('clearSearch'),
            searchResults: document.getElementById('searchResults'),
            sidebarNav: document.getElementById('sidebarNav'),
            sidebarToggle: document.getElementById('sidebarToggle'),
            sidebar: document.getElementById('sidebar'),
            mainContent: document.querySelector('.main-content'),
            servicesContainer: document.getElementById('servicesContainer'),
            loadingSpinner: document.getElementById('loadingSpinner'),
            noResults: document.getElementById('noResults')
        };
    }

    bindEvents() {
        // Search functionality
        this.elements.searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        this.elements.clearSearch.addEventListener('click', () => {
            this.clearSearch();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                this.elements.searchInput.focus();
            } else if (e.key === 'Escape') {
                this.clearSearch();
            }
        });

        // Sidebar toggle
        this.elements.sidebarToggle.addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Close sidebar on mobile when clicking outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!this.elements.sidebar.contains(e.target) &&
                    !this.elements.sidebarToggle.contains(e.target)) {
                    this.closeSidebar();
                }
            }
        });

        // Responsive handling
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    async loadServices() {
        try {
            const response = await fetch('product_data_final.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.services = await response.json();
            this.processServices();
            this.renderSidebar();
            this.renderServices();
            this.hideLoading();
        } catch (error) {
            console.error('Error loading services:', error);
            this.showError('Failed to load services. Please check if product_data_final.json exists.');
        }
    }

    processServices() {
        this.groupedServices = {};

        this.services.forEach(service => {
            const group = service.group || 'Other';
            if (!this.groupedServices[group]) {
                this.groupedServices[group] = {
                    title: group,
                    services: [],
                    icon: this.getGroupIcon(group)
                };
            }
            this.groupedServices[group].services.push(service);
        });

        // Fix 3: Sort groups according to custom order
        const sortedGroups = [];

        // First, add groups in the specified order
        this.groupOrder.forEach(groupName => {
            if (this.groupedServices[groupName]) {
                sortedGroups.push([groupName, this.groupedServices[groupName]]);
            }
        });

        // Then add any remaining groups not in the specified order
        Object.entries(this.groupedServices).forEach(([groupName, group]) => {
            if (!this.groupOrder.includes(groupName)) {
                sortedGroups.push([groupName, group]);
            }
        });

        this.groupedServices = Object.fromEntries(sortedGroups);
    }

    getGroupIcon(group) {
        const iconMap = {
            'Compute': 'fas fa-server',
            'Storage': 'fas fa-hdd',
            'Database': 'fas fa-database',
            'Container': 'fab fa-docker',
            'Networking': 'fas fa-network-wired',
            'Security': 'fas fa-shield-alt',
            'Application Service': 'fas fa-layer-group',
            'DevOps Tools': 'fas fa-code-branch',
            'Data Analytics': 'fas fa-chart-line',
            'AI/ML': 'fas fa-brain',
            'Management': 'fas fa-cogs',
            'Hybrid Cloud': 'fas fa-cloud',
            'Developer Tools': 'fas fa-code',
            'IoT': 'fas fa-microchip',
            'Migration': 'fas fa-exchange-alt',
            'Integration': 'fas fa-plug'
        };

        return iconMap[group] || 'fas fa-folder';
    }

    renderSidebar() {
        const navHtml = Object.entries(this.groupedServices).map(([groupTitle, group]) => {
            const serviceCount = group.services.length;
            return `
                <div class="nav-item" data-group="${groupTitle}" role="button" tabindex="0">
                    <i class="${group.icon}"></i>
                    <span class="nav-item-text">${groupTitle}</span>
                    <span class="nav-item-badge">${serviceCount}</span>
                </div>
            `;
        }).join('');

        this.elements.sidebarNav.innerHTML = navHtml;

        // Bind navigation events
        this.elements.sidebarNav.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const groupTitle = e.currentTarget.dataset.group;
                this.navigateToGroup(groupTitle);
            });

            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const groupTitle = e.currentTarget.dataset.group;
                    this.navigateToGroup(groupTitle);
                }
            });
        });
    }

    renderServices() {
        const containerHtml = Object.entries(this.groupedServices).map(([groupTitle, group]) => {
            const servicesHtml = group.services.map(service => this.createServiceCard(service)).join('');

            // Fix 2: Remove collapsible functionality - always show services
            return `
                <div class="service-group" id="group-${this.sanitizeId(groupTitle)}">
                    <div class="group-header">
                        <div class="group-title">
                            <i class="${group.icon}"></i>
                            <h2>${groupTitle}</h2>
                        </div>
                        <div class="group-meta">
                            <span class="service-count">${group.services.length} services</span>
                        </div>
                    </div>
                    <div class="services-grid">
                        ${servicesHtml}
                    </div>
                </div>
            `;
        }).join('');

        this.elements.servicesContainer.innerHTML = containerHtml;
    }

    createServiceCard(service) {
        return `
            <div class="service-card" onclick="window.open('${service.url}', '_blank')" style="cursor: pointer;">
                <div class="service-title">${this.escapeHtml(service.title)}</div>
                <div class="service-short-desc">${this.escapeHtml(service.short_desc)}</div>
                <div class="service-long-desc">${this.escapeHtml(service.long_desc)}</div>
            </div>
        `;
    }

    navigateToGroup(groupTitle) {
        // Update active state in sidebar
        this.elements.sidebarNav.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const activeItem = this.elements.sidebarNav.querySelector(`[data-group="${groupTitle}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }

        // Scroll to the group
        const groupElement = document.getElementById(`group-${this.sanitizeId(groupTitle)}`);
        if (groupElement) {
            // Scroll to the group with offset for fixed header
            const headerHeight = 80;
            const elementTop = groupElement.offsetTop - headerHeight - 20;

            window.scrollTo({
                top: elementTop,
                behavior: 'smooth'
            });
        }

        // Close sidebar on mobile after navigation
        if (window.innerWidth <= 768) {
            this.closeSidebar();
        }

        this.activeGroup = groupTitle;
    }

    handleSearch(query) {
        this.currentSearch = query.toLowerCase().trim();

        // Show/hide clear button
        this.elements.clearSearch.style.display = query ? 'block' : 'none';

        if (!query) {
            this.showAllServices();
            this.updateSearchResults('');
            return;
        }

        this.performSearch();
    }

    performSearch() {
        let matchCount = 0;
        let groupCount = 0;
        const searchTerms = this.currentSearch.split(' ').filter(term => term.length > 0);

        Object.entries(this.groupedServices).forEach(([groupTitle, group]) => {
            const groupElement = document.getElementById(`group-${this.sanitizeId(groupTitle)}`);
            const servicesGrid = groupElement.querySelector('.services-grid');
            let groupHasMatches = false;

            group.services.forEach((service, index) => {
                const serviceCard = servicesGrid.children[index];
                const matchResult = this.searchService(service, searchTerms);

                if (matchResult.hasMatch) {
                    serviceCard.style.display = 'block';
                    serviceCard.innerHTML = `
                        <div class="service-title">${matchResult.title}</div>
                        <div class="service-short-desc">${matchResult.shortDesc}</div>
                        <div class="service-long-desc">${matchResult.longDesc}</div>
                    `;
                    matchCount++;
                    groupHasMatches = true;
                } else {
                    serviceCard.style.display = 'none';
                }
            });

            // Show/hide groups based on matches
            if (groupHasMatches) {
                groupElement.style.display = 'block';
                groupCount++;
            } else {
                groupElement.style.display = 'none';
            }
        });

        // Show no results if no matches found
        if (matchCount === 0) {
            this.elements.noResults.style.display = 'block';
            this.elements.servicesContainer.style.display = 'none';
        } else {
            this.elements.noResults.style.display = 'none';
            this.elements.servicesContainer.style.display = 'block';
        }

        this.updateSearchResults(`${matchCount} services found in ${groupCount} categories`);
    }

    searchService(service, searchTerms) {
        const fields = {
            title: service.title,
            shortDesc: service.short_desc,
            longDesc: service.long_desc
        };

        let hasMatch = false;
        const result = {};

        Object.entries(fields).forEach(([key, value]) => {
            const lowerValue = value.toLowerCase();
            let highlightedValue = this.escapeHtml(value);

            searchTerms.forEach(term => {
                const regex = new RegExp(`(${this.escapeRegex(term)})`, 'gi');
                if (regex.test(lowerValue)) {
                    hasMatch = true;
                    highlightedValue = highlightedValue.replace(regex, '<span class="highlight">$1</span>');
                }
            });

            result[key] = highlightedValue;
        });

        return { ...result, hasMatch };
    }

    showAllServices() {
        // Show all groups and services
        Object.keys(this.groupedServices).forEach(groupTitle => {
            const groupElement = document.getElementById(`group-${this.sanitizeId(groupTitle)}`);
            groupElement.style.display = 'block';

            const servicesGrid = groupElement.querySelector('.services-grid');
            Array.from(servicesGrid.children).forEach((serviceCard, index) => {
                serviceCard.style.display = 'block';
                // Restore original content without highlighting
                const service = this.groupedServices[groupTitle].services[index];
                serviceCard.innerHTML = `
                    <div class="service-title">${this.escapeHtml(service.title)}</div>
                    <div class="service-short-desc">${this.escapeHtml(service.short_desc)}</div>
                    <div class="service-long-desc">${this.escapeHtml(service.long_desc)}</div>
                `;
            });
        });

        this.elements.noResults.style.display = 'none';
        this.elements.servicesContainer.style.display = 'block';
    }

    clearSearch() {
        this.elements.searchInput.value = '';
        this.currentSearch = '';
        this.showAllServices();
        this.updateSearchResults('');
        this.elements.clearSearch.style.display = 'none';
        this.elements.searchInput.focus();
    }

    updateSearchResults(text) {
        this.elements.searchResults.textContent = text;
    }

    toggleSidebar() {
        this.elements.sidebar.classList.toggle('open');
        this.elements.sidebar.classList.toggle('collapsed');
    }

    closeSidebar() {
        this.elements.sidebar.classList.remove('open');
        this.elements.sidebar.classList.add('collapsed');
    }

    handleResize() {
        if (window.innerWidth > 768) {
            this.elements.sidebar.classList.remove('open', 'collapsed');
            this.elements.mainContent.classList.remove('sidebar-collapsed');
        } else {
            this.elements.sidebar.classList.add('collapsed');
            this.elements.mainContent.classList.add('sidebar-collapsed');
        }
    }

    hideLoading() {
        this.elements.loadingSpinner.style.display = 'none';
        this.elements.servicesContainer.style.display = 'block';
    }

    showError(message) {
        this.elements.loadingSpinner.innerHTML = `
            <div style="text-align: center; color: var(--error-color);">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>${message}</p>
            </div>
        `;
    }

    // Utility functions
    sanitizeId(str) {
        return str.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SamsungCloudServices();
});

