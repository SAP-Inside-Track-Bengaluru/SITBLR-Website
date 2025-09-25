// SITBLR Event Agenda Application
class AgendaApp {
    constructor() {
        this.rawData = null;
        this.parsedData = null;
        this.currentFilters = {
            types: ['Lecture', 'Demo Pod', 'Hands On', 'Break', 'Keynote', 'Registration'],
            tracks: []
        };
        this.currentSearchTerm = '';
        this.currentTab = 'sessions';
        this.isFilterPanelOpen = false;
        
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.setupEventListeners();
            this.setupTheme();
            this.populateFilters();
            this.renderAgenda();
            this.updateYear();
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to load agenda data. Please refresh the page.');
        }
    }

    async loadData() {
        try {
            const response = await fetch('assets/data/events_3rdedition.json');
            if (!response.ok) {
                throw new Error(`Failed to load data: ${response.status}`);
            }
            this.rawData = await response.json();
            
            if (!this.rawData || (!this.rawData.lectures && !this.rawData.demopods)) {
                throw new Error('Invalid data format');
            }
            
            this.parsedData = parseEventData(this.rawData);
            console.log('Data loaded successfully:', this.parsedData);
        } catch (error) {
            console.error('Error loading data:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const clearSearch = document.getElementById('clearSearch');
        
        const debouncedSearch = debounce((term) => {
            this.currentSearchTerm = term;
            this.renderAgenda();
            this.toggleClearButton(term);
        }, 300);

        searchInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });

        clearSearch.addEventListener('click', () => {
            searchInput.value = '';
            this.currentSearchTerm = '';
            this.renderAgenda();
            this.toggleClearButton('');
            searchInput.focus();
        });

        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab));
        });

        // Filter panel toggle
        const filterToggle = document.getElementById('filterToggle');
        const closeFilters = document.getElementById('closeFilters');
        const filterPanel = document.getElementById('filterPanel');

        filterToggle.addEventListener('click', () => this.toggleFilterPanel());
        closeFilters.addEventListener('click', () => this.closeFilterPanel());
        
        // Close filter panel when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isFilterPanelOpen && !filterPanel.contains(e.target) && !filterToggle.contains(e.target)) {
                this.closeFilterPanel();
            }
        });

        // Filter form
        const filtersForm = document.getElementById('filtersForm');
        filtersForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.applyFilters();
        });

        filtersForm.addEventListener('reset', () => {
            setTimeout(() => this.resetFilters(), 0);
        });

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.addEventListener('click', () => this.toggleTheme());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isFilterPanelOpen) {
                this.closeFilterPanel();
            }
        });
    }

    setupTheme() {
        const savedTheme = localStorage.getItem('agenda-theme');
        if (savedTheme) {
            document.body.className = savedTheme;
            this.updateThemeButton();
        } else {
            // Default to dark theme
            document.body.className = 'light';
            this.updateThemeButton();
        }
    }

    toggleTheme() {
        const currentTheme = document.body.className;
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.className = newTheme;
        localStorage.setItem('agenda-theme', newTheme);
        this.updateThemeButton();
    }

    updateThemeButton() {
        const button = document.getElementById('themeToggle');
        const isDark = document.body.className === 'dark';
        button.setAttribute('aria-pressed', isDark.toString());
        button.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    }

    populateFilters() {
        const tracks = getUniqueTracks(this.parsedData);
        const tracksList = document.getElementById('tracksList');
        
        tracksList.innerHTML = tracks.map(track => `
            <label>
                <input type="checkbox" name="track" value="${track}" checked>
                ${track}
            </label>
        `).join('');

        // Set initial filter state
        this.currentFilters.tracks = tracks;
    }

    applyFilters() {
        const formData = new FormData(document.getElementById('filtersForm'));
        
        // Get selected types
        this.currentFilters.types = formData.getAll('type');
        
        // Get selected tracks
        this.currentFilters.tracks = formData.getAll('track');
        
        this.renderAgenda();
        this.closeFilterPanel();
    }

    resetFilters() {
        const tracks = getUniqueTracks(this.parsedData);
        this.currentFilters = {
            types: ['Lecture', 'Demo Pod', 'Hands On', 'Break', 'Keynote', 'Registration'],
            tracks: tracks
        };
        this.renderAgenda();
    }

    switchTab(clickedTab) {
        // Update tab states
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
            tab.setAttribute('aria-selected', 'false');
        });
        
        clickedTab.classList.add('active');
        clickedTab.setAttribute('aria-selected', 'true');
        
        // Update content sections
        const target = clickedTab.dataset.target;
        this.currentTab = target;
        
        document.querySelectorAll('.agenda-section').forEach(section => {
            section.classList.remove('active');
            section.hidden = true;
        });
        
        const targetSection = document.getElementById(target);
        targetSection.classList.add('active');
        targetSection.hidden = false;
        
        this.renderAgenda();
    }

    toggleFilterPanel() {
        this.isFilterPanelOpen = !this.isFilterPanelOpen;
        const panel = document.getElementById('filterPanel');
        const button = document.getElementById('filterToggle');
        
        if (this.isFilterPanelOpen) {
            panel.classList.add('open');
            panel.setAttribute('aria-hidden', 'false');
            button.setAttribute('aria-expanded', 'true');
        } else {
            this.closeFilterPanel();
        }
    }

    closeFilterPanel() {
        this.isFilterPanelOpen = false;
        const panel = document.getElementById('filterPanel');
        const button = document.getElementById('filterToggle');
        
        panel.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
        button.setAttribute('aria-expanded', 'false');
    }

    toggleClearButton(searchTerm) {
        const clearButton = document.getElementById('clearSearch');
        clearButton.hidden = !searchTerm.trim();
    }

    renderAgenda() {
        if (!this.parsedData) return;

        const filteredData = filterEvents(this.parsedData, this.currentSearchTerm, this.currentFilters);
        
        if (this.currentTab === 'sessions') {
            this.renderTimeline('sessionsContainer', filteredData.lectures);
        } else if (this.currentTab === 'demopods') {
            this.renderTimeline('demopodsContainer', filteredData.demopods);
        } else if (this.currentTab === 'handson') {
            this.renderTimeline('handsonContainer', filteredData.handson);
        }
        
        this.updateEmptyState(filteredData);
    }

    renderTimeline(containerId, timeSlots) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        timeSlots.forEach((timeSlot, index) => {
            const timeslotElement = this.createTimeslotElement(timeSlot, index);
            container.appendChild(timeslotElement);
        });
    }

    createTimeslotElement(timeSlot, index) {
        const template = document.getElementById('timeslotTemplate');
        const element = template.content.cloneNode(true);
        
        const timeElement = element.querySelector('.slot-time');
        timeElement.textContent = timeSlot.time;
        
        const sessionsCol = element.querySelector('.sessions-col');
        
        if (timeSlot.type === 'break') {
            // Create a single break card
            const breakCard = this.createSessionCard({
                title: timeSlot.title,
                type: 'Break',
                track: '',
                speaker1: '',
                speaker2: '',
                speakers: '',
                description: ''
            }, `break-${timeSlot.sequence}`, true);
            sessionsCol.appendChild(breakCard);
        } else if (timeSlot.type === 'registration') {
            // Create a single full-width registration card
            sessionsCol.style.gridTemplateColumns = '1fr'; // Force single column for full width
            const registrationCard = this.createSessionCard({
                title: timeSlot.title,
                type: 'Registration',
                track: timeSlot.location || '',
                speaker1: timeSlot.speaker1 || '',
                speaker2: timeSlot.speaker2 || '',
                speaker3: timeSlot.speaker3 || '',
                speaker1_designation: timeSlot.speaker1_designation || '',
                speaker2_designation: timeSlot.speaker2_designation || '',
                speaker3_designation: timeSlot.speaker3_designation || '',
                speakers: '',
                description: '',
                location: timeSlot.location || ''
            }, `registration-${timeSlot.sequence}`, true);
            sessionsCol.appendChild(registrationCard);
        } else if (timeSlot.type === 'keynote') {
            // Create a single full-width keynote card
            sessionsCol.style.gridTemplateColumns = '1fr'; // Force single column for full width
            const keynoteCard = this.createSessionCard({
                title: timeSlot.title,
                type: 'Keynote',
                track: timeSlot.location || '',
                speaker1: timeSlot.speaker1 || '',
                speaker2: timeSlot.speaker2 || '',
                speaker3: timeSlot.speaker3 || '',
                speaker1_designation: timeSlot.speaker1_designation || '',
                speaker2_designation: timeSlot.speaker2_designation || '',
                speaker3_designation: timeSlot.speaker3_designation || '',
                speakers: '',
                description: '',
                location: timeSlot.location || ''
            }, `keynote-${timeSlot.sequence}`, true);
            sessionsCol.appendChild(keynoteCard);
        } else {
            // Create session cards for each session in the time slot
            timeSlot.sessions.forEach((session, sessionIndex) => {
                const sessionCard = this.createSessionCard(
                    session, 
                    generateSessionId(timeSlot.sequence, sessionIndex)
                );
                sessionsCol.appendChild(sessionCard);
            });
        }
        
        return element;
    }

    createSessionCard(session, sessionId, isSpecialSession = false) {
        const template = document.getElementById('sessionCardTemplate');
        const element = template.content.cloneNode(true);
        const card = element.querySelector('.session-card');
        
        // Set unique ID
        card.id = sessionId;
        
        // Add session type classes for styling
        if (session.type === 'Demo Pod') {
            card.classList.add('demo');
        } else if (session.type === 'Hands On') {
            card.classList.add('handson');
        } else if (session.type === 'Break') {
            card.classList.add('break');
        } else if (session.type === 'Keynote') {
            card.classList.add('keynote');
        } else if (session.type === 'Registration') {
            card.classList.add('registration');
        }
        
        if (isSpecialSession) {
            card.classList.add('special-session');
        }
        
        // Set title
        const titleElement = card.querySelector('.session-title');
        titleElement.textContent = session.title || 'No title';
        
        // Set type badge
        const typeBadge = card.querySelector('.type-badge');
        typeBadge.textContent = session.type || 'Session';
        
        // Add appropriate badge class
        if (session.type === 'Demo Pod') {
            typeBadge.classList.add('demo');
        } else if (session.type === 'Hands On') {
            typeBadge.classList.add('handson');
        } else if (session.type === 'Break') {
            typeBadge.classList.add('break');
        } else if (session.type === 'Keynote') {
            typeBadge.classList.add('keynote');
        } else if (session.type === 'Registration') {
            typeBadge.classList.add('registration');
        }
        
        // Set track/location
        const trackBadge = card.querySelector('.track-badge');
        if (session.track || session.location) {
            trackBadge.textContent = session.location || session.track;
            if (isSpecialSession && (session.type === 'Keynote' || session.type === 'Registration')) {
                trackBadge.style.display = 'inline-flex';
            }
        } else {
            trackBadge.style.display = 'none';
        }
        
        // Set speakers
        const speakersElement = card.querySelector('.speakers');
        if (isSpecialSession && (session.type === 'Keynote' || session.type === 'Registration')) {
            // Handle special session speakers with designations (no label)
            const speakersText = formatSpecialSessionSpeakers(session);
            if (speakersText) {
                speakersElement.innerHTML = speakersText;
                speakersElement.style.display = 'block';
            } else {
                speakersElement.style.display = 'none';
            }
        } else if (!isSpecialSession) {
            // Handle regular session speakers
            const speakersText = formatSpeakers(session);
            if (speakersText) {
                speakersElement.textContent = `Speakers: ${speakersText}`;
            } else {
                speakersElement.style.display = 'none';
            }
        } else {
            speakersElement.style.display = 'none';
        }
        
        return element;
    }

    updateEmptyState(filteredData) {
        const emptyState = document.getElementById('emptyState');
        let hasData = false;
        
        if (this.currentTab === 'sessions') {
            hasData = filteredData.lectures.length > 0;
        } else if (this.currentTab === 'demopods') {
            hasData = filteredData.demopods.length > 0;
        } else if (this.currentTab === 'handson') {
            hasData = filteredData.handson.length > 0;
        }
            
        emptyState.hidden = hasData;
    }

    updateYear() {
        const yearElement = document.getElementById('year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    showError(message) {
        const main = document.querySelector('.main');
        main.innerHTML = `
            <div class="error-state" style="text-align: center; padding: 3rem 1rem;">
                <h2>Oops! Something went wrong</h2>
                <p>${message}</p>
            </div>
        `;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AgendaApp();
});