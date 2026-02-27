// SITBLR Event Agenda Application
class AgendaApp {
    constructor() {
        this.params = new URLSearchParams(window.location.search);
        this.year = this.params.get('year') || '2025';
        this.quarter = this.params.get('q') || '3';
        this.dataPath = `assets/data/${this.year}/Q${this.quarter}`;
        
        this.rawData = null;
        this.parsedData = null;
        this.concurRawData = null;
        this.concurParsedData = null;
        this.academiaRawData = null;
        this.academiaParsedData = null;
        this.ui5RawData = null;
        this.ui5ParsedData = null;
        this.currentFilters = {
            types: ['Lecture', 'Demo Pod', 'Hands On', 'Break', 'Keynote', 'Registration'],
            tracks: []
        };
        this.concurFilters = {
            types: ['Concur Session', 'Break', 'Commute', 'Keynote', 'Industry Talk'],
            tracks: []
        };
        this.academiaFilters = {
            types: ['Academia Session', 'Break', 'Commute', 'Keynote', 'Industry Talk'],
            tracks: []
        };
        this.ui5Filters = {
            types: ['UI5 Session', 'Break', 'Commute', 'Keynote', 'Industry Talk'],
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
            if (!this.rawData) return; // Load data handled coming soon
            await this.loadConcurData();
            await this.loadAcademiaData();
            await this.loadUI5Data();
            this.setupEventListeners();
            this.setupTheme();
            this.populateFilters();
            this.renderAgenda();
            this.updateYear();
            this.updateBrandTagline();
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to load agenda data. Please refresh the page.');
        }
    }

    updateBrandTagline() {
        const tagline = document.querySelector('.tagline');
        if (tagline) {
            tagline.textContent = `${this.year} Q${this.quarter} - Agenda`;
        }
    }

    async loadData() {
        try {
            const response = await fetch(`${this.dataPath}/events.json`);
            if (!response.ok) {
                if (response.status === 404) {
                    this.showComingSoon();
                    return;
                }
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

    async loadConcurData() {
        try {
            const response = await fetch(`${this.dataPath}/concur.json`);
            if (!response.ok) {
                throw new Error(`Failed to load concur data: ${response.status}`);
            }
            this.concurRawData = await response.json();
            
            if (!this.concurRawData || !this.concurRawData.concur) {
                throw new Error('Invalid concur data format');
            }
            
            this.concurParsedData = parseConcurEventData(this.concurRawData);
            console.log('Concur data loaded successfully:', this.concurParsedData);
        } catch (error) {
            console.error('Error loading concur data:', error);
            // Don't throw error for concur data - make it optional
            console.warn('Concur schedule will not be available');
        }
    }

    async loadAcademiaData() {
        try {
            const response = await fetch(`${this.dataPath}/academia.json`);
            if (!response.ok) {
                throw new Error(`Failed to load academia data: ${response.status}`);
            }
            this.academiaRawData = await response.json();
            
            if (!this.academiaRawData || !this.academiaRawData.academia) {
                throw new Error('Invalid academia data format');
            }
            
            this.academiaParsedData = parseAcademiaEventData(this.academiaRawData);
            console.log('Academia data loaded successfully:', this.academiaParsedData);
        } catch (error) {
            console.error('Error loading academia data:', error);
            // Don't throw error for academia data - make it optional
            console.warn('Academia schedule will not be available');
        }
    }

    async loadUI5Data() {
        try {
            const response = await fetch(`${this.dataPath}/ui5.json`);
            if (!response.ok) {
                throw new Error(`Failed to load UI5con data: ${response.status}`);
            }
            this.ui5RawData = await response.json();
            
            if (!this.ui5RawData || !this.ui5RawData.ui5) {
                throw new Error('Invalid UI5con data format');
            }
            
            this.ui5ParsedData = parseUI5EventData(this.ui5RawData);
            console.log('UI5con data loaded successfully:', this.ui5ParsedData);
        } catch (error) {
            console.error('Error loading UI5con data:', error);
            // Don't throw error for UI5con data - make it optional
            console.warn('UI5con schedule will not be available');
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
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.className = savedTheme === 'dark' ? 'dark' : '';
        this.updateThemeButton();
    }

    toggleTheme() {
        const isDark = document.body.classList.contains('dark');
        const newTheme = isDark ? 'light' : 'dark';
        
        if (newTheme === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
        
        localStorage.setItem('theme', newTheme);
        this.updateThemeButton();
    }

    updateThemeButton() {
        const button = document.getElementById('themeToggle');
        const isDark = document.body.classList.contains('dark');
        button.setAttribute('aria-pressed', isDark.toString());
        button.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    }

    populateFilters() {
        let tracks, types;
        
        if (this.currentTab === 'concurschedule' && this.concurParsedData) {
            // Use concur-specific tracks and types
            tracks = getConcurUniqueTracks(this.concurParsedData);
            types = getConcurUniqueTypes(this.concurParsedData);
            this.concurFilters.tracks = tracks;
            this.concurFilters.types = types;
        } else if (this.currentTab === 'academiaschedule' && this.academiaParsedData) {
            // Use academia-specific tracks and types
            tracks = getAcademiaUniqueTracks(this.academiaParsedData);
            types = getAcademiaUniqueTypes(this.academiaParsedData);
            this.academiaFilters.tracks = tracks;
            this.academiaFilters.types = types;
        } else if (this.currentTab === 'ui5schedule' && this.ui5ParsedData) {
            // Use UI5con-specific tracks and types
            tracks = getUI5UniqueTracks(this.ui5ParsedData);
            types = getUI5UniqueTypes(this.ui5ParsedData);
            this.ui5Filters.tracks = tracks;
            this.ui5Filters.types = types;
        } else {
            // Use regular tracks and types
            tracks = getUniqueTracks(this.parsedData);
            this.currentFilters.tracks = tracks;
        }
        
        const tracksList = document.getElementById('tracksList');
        tracksList.innerHTML = tracks.map(track => `
            <label>
                <input type="checkbox" name="track" value="${track}" checked>
                ${track}
            </label>
        `).join('');

        // Ensure all type filters are visible and properly set
        this.resetTypeFiltersVisibility();
    }

    resetTypeFiltersVisibility() {
        const fieldsets = document.querySelectorAll('fieldset');
        let typeFieldset = null;
        
        fieldsets.forEach(fieldset => {
            const legend = fieldset.querySelector('legend');
            if (legend && legend.textContent.trim() === 'Type') {
                typeFieldset = fieldset;
            }
        });
        
        if (!typeFieldset) return;

        // Add Concur Session checkbox if it doesn't exist
        const existingConcurCheckbox = typeFieldset.querySelector('input[value="Concur Session"]');
        if (!existingConcurCheckbox) {
            const concurLabel = document.createElement('label');
            concurLabel.innerHTML = '<input type="checkbox" name="type" value="Concur Session" checked> Concur Session';
            typeFieldset.appendChild(concurLabel);
        }

        // Add Academia Session checkbox if it doesn't exist
        const existingAcademiaCheckbox = typeFieldset.querySelector('input[value="Academia Session"]');
        if (!existingAcademiaCheckbox) {
            const academiaLabel = document.createElement('label');
            academiaLabel.innerHTML = '<input type="checkbox" name="type" value="Academia Session" checked> Academia Session';
            typeFieldset.appendChild(academiaLabel);
        }

        // Make all labels visible and set appropriate checked state
        const typeLabels = Array.from(typeFieldset.querySelectorAll('label'));
        typeLabels.forEach(label => {
            const checkbox = label.querySelector('input[name="type"]');
            if (!checkbox) return;
            
            label.style.display = 'flex';
            
            if (this.currentTab === 'concurschedule') {
                // For concur tab, only check Concur Session and Break
                checkbox.checked = (checkbox.value === 'Concur Session' || checkbox.value === 'Break');
            } else if (this.currentTab === 'academiaschedule') {
                // For academia tab, check Academia Session, Lecture and Break
                checkbox.checked = (checkbox.value === 'Academia Session' || checkbox.value === 'Lecture' || checkbox.value === 'Break');
            } else if (this.currentTab === 'ui5schedule') {
                // For UI5con tab, check UI5 Session, Lecture and Break
                checkbox.checked = (checkbox.value === 'UI5 Session' || checkbox.value === 'Lecture' || checkbox.value === 'Break');
            } else {
                // For other tabs, use the current filter state
                const activeTypes = this.currentFilters.types;
                checkbox.checked = activeTypes.includes(checkbox.value);
            }
        });
    }

    applyFilters() {
        const formData = new FormData(document.getElementById('filtersForm'));
        
        if (this.currentTab === 'concurschedule') {
            // Get selected types and tracks for concur
            this.concurFilters.types = formData.getAll('type');
            this.concurFilters.tracks = formData.getAll('track');
        } else if (this.currentTab === 'academiaschedule') {
            // Get selected types and tracks for academia
            this.academiaFilters.types = formData.getAll('type');
            this.academiaFilters.tracks = formData.getAll('track');
        } else if (this.currentTab === 'ui5schedule') {
            // Get selected types and tracks for UI5con
            this.ui5Filters.types = formData.getAll('type');
            this.ui5Filters.tracks = formData.getAll('track');
        } else {
            // Get selected types and tracks for regular tabs
            this.currentFilters.types = formData.getAll('type');
            this.currentFilters.tracks = formData.getAll('track');
        }
        
        this.renderAgenda();
        this.closeFilterPanel();
    }

    resetFilters() {
        if (this.currentTab === 'concurschedule' && this.concurParsedData) {
            const tracks = getConcurUniqueTracks(this.concurParsedData);
            const types = getConcurUniqueTypes(this.concurParsedData);
            this.concurFilters = {
                types: types,
                tracks: tracks
            };
        } else if (this.currentTab === 'academiaschedule' && this.academiaParsedData) {
            const tracks = getAcademiaUniqueTracks(this.academiaParsedData);
            const types = getAcademiaUniqueTypes(this.academiaParsedData);
            this.academiaFilters = {
                types: types,
                tracks: tracks
            };
        } else if (this.currentTab === 'ui5schedule' && this.ui5ParsedData) {
            const tracks = getUI5UniqueTracks(this.ui5ParsedData);
            const types = getUI5UniqueTypes(this.ui5ParsedData);
            this.ui5Filters = {
                types: types,
                tracks: tracks
            };
        } else {
            const tracks = getUniqueTracks(this.parsedData);
            this.currentFilters = {
                types: ['Lecture', 'Demo Pod', 'Hands On', 'Break', 'Keynote', 'Registration'],
                tracks: tracks
            };
        }
        this.populateFilters();
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
        
        // Update filters for the new tab
        this.populateFilters();
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
        if (this.currentTab === 'concurschedule') {
            if (!this.concurParsedData) {
                this.updateEmptyState({ concurschedule: [] });
                return;
            }
            const filteredConcurData = filterConcurEvents(this.concurParsedData, this.currentSearchTerm, this.concurFilters);
            this.renderTimeline('concurscheduleContainer', filteredConcurData.concurschedule);
            this.updateEmptyState(filteredConcurData);
        } else if (this.currentTab === 'academiaschedule') {
            if (!this.academiaParsedData) {
                this.updateEmptyState({ academiaschedule: [] });
                return;
            }
            const filteredAcademiaData = filterAcademiaEvents(this.academiaParsedData, this.currentSearchTerm, this.academiaFilters);
            this.renderTimeline('academiascheduleContainer', filteredAcademiaData.academiaschedule);
            this.updateEmptyState(filteredAcademiaData);
        } else if (this.currentTab === 'ui5schedule') {
            if (!this.ui5ParsedData) {
                this.updateEmptyState({ ui5schedule: [] });
                return;
            }
            const filteredUI5Data = filterUI5Events(this.ui5ParsedData, this.currentSearchTerm, this.ui5Filters);
            this.renderTimeline('ui5scheduleContainer', filteredUI5Data.ui5schedule);
            this.updateEmptyState(filteredUI5Data);
        } else {
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
        
        // Handle track-group type differently
        if (timeSlot.type === 'track-group') {
            timeElement.textContent = timeSlot.title; // Use track name instead of time
            timeElement.style.fontWeight = 'bold';
            timeElement.style.fontSize = '1.2rem';
            timeElement.style.color = 'var(--accent)';
        } else {
            timeElement.textContent = timeSlot.time;
        }
        
        const sessionsCol = element.querySelector('.sessions-col');
        
        if (timeSlot.type === 'break') {
            // Create a single full-width break card
            sessionsCol.style.gridTemplateColumns = '1fr'; // Force single column for full width
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
        } else if (timeSlot.type === 'commute') {
            // Create a single full-width commute card
            sessionsCol.style.gridTemplateColumns = '1fr'; // Force single column for full width
            const commuteCard = this.createSessionCard({
                title: timeSlot.title,
                type: 'Commute',
                track: '',
                speaker1: '',
                speaker2: '',
                speakers: '',
                description: ''
            }, `commute-${timeSlot.sequence}`, true);
            sessionsCol.appendChild(commuteCard);
        } else if (timeSlot.type === 'industry-talk') {
            // Create a single full-width industry talk card
            sessionsCol.style.gridTemplateColumns = '1fr'; // Force single column for full width
            const industryTalkCard = this.createSessionCard({
                title: timeSlot.title,
                type: 'Industry Talk',
                track: '',
                speaker1: '',
                speaker2: '',
                speakers: '',
                description: ''
            }, `industry-talk-${timeSlot.sequence}`, true);
            sessionsCol.appendChild(industryTalkCard);
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
        } else if (timeSlot.type === 'track-group') {
            // Create session cards for track-grouped sessions
            timeSlot.sessions.forEach((session, sessionIndex) => {
                const sessionCard = this.createSessionCard(
                    session, 
                    generateSessionId(`track-${timeSlot.title}`, sessionIndex)
                );
                sessionsCol.appendChild(sessionCard);
            });
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
        } else if (session.type === 'Concur Session') {
            card.classList.add('concur');
        } else if (session.type === 'Academia Session') {
            card.classList.add('academia');
        } else if (session.type === 'UI5 Session') {
            card.classList.add('ui5');
        } else if (session.type === 'Break') {
            card.classList.add('break');
        } else if (session.type === 'Commute') {
            card.classList.add('commute');
        } else if (session.type === 'Industry Talk') {
            card.classList.add('industry-talk');
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
        
        // For UI5 Sessions with time, show time instead of type
        if (session.type === 'UI5 Session' && session.time) {
            typeBadge.textContent = session.time;
        } else {
            typeBadge.textContent = session.type || 'Session';
        }
        
        // Add appropriate badge class
        if (session.type === 'Demo Pod') {
            typeBadge.classList.add('demo');
        } else if (session.type === 'Hands On') {
            typeBadge.classList.add('handson');
        } else if (session.type === 'Concur Session') {
            typeBadge.classList.add('concur');
        } else if (session.type === 'Academia Session') {
            typeBadge.classList.add('academia');
        } else if (session.type === 'UI5 Session') {
            typeBadge.classList.add('ui5');
        } else if (session.type === 'Break') {
            typeBadge.classList.add('break');
        } else if (session.type === 'Commute') {
            typeBadge.classList.add('commute');
        } else if (session.type === 'Industry Talk') {
            typeBadge.classList.add('industry-talk');
        } else if (session.type === 'Keynote') {
            typeBadge.classList.add('keynote');
        } else if (session.type === 'Registration') {
            typeBadge.classList.add('registration');
        }
        
        // Set track/location
        const trackBadge = card.querySelector('.track-badge');
        const timeElement = card.querySelector('.session-time');
        
        // Hide time element for UI5 sessions since time is shown in type badge
        if (session.type === 'UI5 Session' && session.time) {
            timeElement.style.display = 'none';
        } else if (session.time) {
            // Show time for other sessions that have it
            timeElement.textContent = `🕒 ${session.time}`;
            timeElement.style.display = 'inline-block';
            timeElement.style.fontWeight = 'bold';
        }
        
        if (session.type === 'Academia Session') {
            // Hide track badge for Academia sessions
            trackBadge.style.display = 'none';
        } else if (session.type === 'UI5 Session' && session.time) {
            // Hide track badge for UI5 sessions in track-grouped view (track is shown as section header)
            trackBadge.style.display = 'none';
        } else if (session.track || session.location) {
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
                // Use "Organizers:" label for Vibe Coding session
                const label = session.title && session.title.includes('Vibe Coding') ? 'Organizers:' : 'Speakers:';
                speakersElement.textContent = `${label} ${speakersText}`;
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
            hasData = filteredData.lectures && filteredData.lectures.length > 0;
        } else if (this.currentTab === 'demopods') {
            hasData = filteredData.demopods && filteredData.demopods.length > 0;
        } else if (this.currentTab === 'handson') {
            hasData = filteredData.handson && filteredData.handson.length > 0;
        } else if (this.currentTab === 'concurschedule') {
            hasData = filteredData.concurschedule && filteredData.concurschedule.length > 0;
        } else if (this.currentTab === 'academiaschedule') {
            hasData = filteredData.academiaschedule && filteredData.academiaschedule.length > 0;
        } else if (this.currentTab === 'ui5schedule') {
            hasData = filteredData.ui5schedule && filteredData.ui5schedule.length > 0;
        }
            
        emptyState.hidden = hasData;
    }

    updateYear() {
        const yearElement = document.getElementById('year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    showComingSoon() {
        const main = document.querySelector('.main');
        const brandTextTagline = document.querySelector('.tagline');
        if (brandTextTagline) {
            brandTextTagline.textContent = `${this.year} Q${this.quarter} - Coming Soon`;
        }
        main.innerHTML = `
            <div class="coming-soon-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; text-align: center; padding: 2rem;">
                <h1 style="font-size: 3rem; margin-bottom: 1rem; color: var(--accent);">Agenda ${this.year} Q${this.quarter}</h1>
                <p>Coming Soon! We are currently planning this edition of SAP Inside Track Bengaluru.</p>
                <p>Stay tuned for updates!</p>
                <a href="index.html" class="primary-btn" style="margin-top: 2rem; text-decoration: none; background: var(--accent); color: white; padding: 0.75rem 1.5rem; border-radius: 4px;">Back to Home</a>
            </div>
        `;
        // Hide tabs and header actions as they are not needed for coming soon
        const tabs = document.querySelector('.tabs');
        if (tabs) tabs.style.display = 'none';
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
            // Keep theme toggle but hide search/filter
            const search = headerActions.querySelector('.search-wrapper');
            if (search) search.style.display = 'none';
            const filter = document.getElementById('filterToggle');
            if (filter) filter.style.display = 'none';
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