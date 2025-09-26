// Utility functions for SITBLR Event Agenda

/**
 * Parse the event data JSON into a standardized format
 * @param {Object} eventData - Raw JSON data from events_3rdedition.json
 * @returns {Object} Parsed data with lectures and demopods
 */
function parseEventData(eventData) {
    const parsedData = {
        lectures: [],
        demopods: [],
        handson: []
    };

    // Parse lectures (sessions)
    if (eventData.lectures) {
        eventData.lectures.forEach(lecture => {
            if (lecture.type === 'break') {
                // Handle break sessions
                parsedData.lectures.push({
                    sequence: lecture.sequence,
                    time: lecture.time,
                    type: 'break',
                    title: lecture.tracktitle,
                    sessions: []
                });
            } else if (lecture.type === 'Registration') {
                // Handle registration sessions
                parsedData.lectures.push({
                    sequence: lecture.sequence,
                    time: lecture.time,
                    type: 'registration',
                    title: lecture.tracktitle,
                    speaker1: lecture.speaker1 || '',
                    speaker1_designation: lecture.speaker1_designation || '',
                    speaker2: lecture.speaker2 || '',
                    speaker2_designation: lecture.speaker2_designation || '',
                    speaker3: lecture.speaker3 || '',
                    speaker3_designation: lecture.speaker3_designation || '',
                    location: lecture.location || '',
                    sessions: []
                });
            } else if (lecture.type === 'Keynote') {
                // Handle keynote sessions
                parsedData.lectures.push({
                    sequence: lecture.sequence,
                    time: lecture.time,
                    type: 'keynote',
                    title: lecture.tracktitle,
                    speaker1: lecture.speaker1 || '',
                    speaker1_designation: lecture.speaker1_designation || '',
                    speaker2: lecture.speaker2 || '',
                    speaker2_designation: lecture.speaker2_designation || '',
                    speaker3: lecture.speaker3 || '',
                    speaker3_designation: lecture.speaker3_designation || '',
                    location: lecture.location || '',
                    sessions: []
                });
            } else if (lecture.type === 'grid' && lecture.sessionsBySequence) {
                // Handle regular sessions with multiple tracks
                parsedData.lectures.push({
                    sequence: lecture.sequence,
                    time: lecture.time,
                    type: 'session',
                    title: '',
                    sessions: lecture.sessionsBySequence.map(session => ({
                        title: session.sessiontitle || '',
                        speaker1: session.speaker1 || '',
                        speaker2: session.speaker2 || '',
                        speakers: session.speakers || '',
                        track: session.tracktitle || '',
                        trackId: session.trackid || '',
                        type: session.type || 'Lecture',
                        description: session.description || '',
                        organization: session.organization1 || ''
                    }))
                });
            }
        });
    }

    // Parse demo pods
    if (eventData.demopods) {
        eventData.demopods.forEach(demo => {
            if (demo.sessionsBySequence) {
                parsedData.demopods.push({
                    sequence: demo.sequence,
                    time: demo.time,
                    type: 'demo',
                    title: '',
                    sessions: demo.sessionsBySequence.map(session => ({
                        title: session.sessiontitle || '',
                        speaker1: session.speaker1 || '',
                        speaker2: session.speaker2 || '',
                        speakers: session.speakers || '',
                        track: session.tracktitle || '',
                        trackId: session.trackid || '',
                        type: session.type || 'Demo Pod',
                        description: session.description || '',
                        organization: session.organization1 || ''
                    }))
                });
            }
        });
    }

    // Parse hands-on sessions
    if (eventData.handson && Array.isArray(eventData.handson)) {
        const handsonSessions = eventData.handson
            .filter(session => session.sessiontitle && session.sessiontitle.trim() !== '')
            .map(session => ({
                title: session.sessiontitle || '',
                speaker1: session.speaker1 || '',
                speaker2: session.speaker2 || '',
                speakers: session.speakers || '',
                track: session.location || session.tracktitle || 'BLR05 Cafeteria',
                trackId: session.trackid || session.location || 'cafeteria',
                type: 'Hands On',
                description: session.description || '',
                organization: session.organization1 || ''
            }));

        if (handsonSessions.length > 0) {
            parsedData.handson.push({
                sequence: 'handson',
                time: 'Workshop Sessions',
                type: 'handson',
                title: 'Hands-On Workshops',
                sessions: handsonSessions
            });
        }
    }

    return parsedData;
}

/**
 * Get all unique tracks from the data
 * @param {Object} parsedData - Parsed event data
 * @returns {Array} Array of unique tracks
 */
function getUniqueTracks(parsedData) {
    const tracks = new Set();
    
    [...parsedData.lectures, ...parsedData.demopods, ...parsedData.handson].forEach(timeSlot => {
        if (timeSlot.sessions) {
            timeSlot.sessions.forEach(session => {
                if (session.track && session.track.trim() !== '') {
                    tracks.add(session.track);
                }
            });
        }
    });
    
    return Array.from(tracks).sort();
}

/**
 * Get all unique session types from the data
 * @param {Object} parsedData - Parsed event data
 * @returns {Array} Array of unique types
 */
function getUniqueTypes(parsedData) {
    const types = new Set();
    
    parsedData.lectures.forEach(timeSlot => {
        if (timeSlot.type === 'break') {
            types.add('Break');
        } else if (timeSlot.type === 'registration') {
            types.add('Registration');
        } else if (timeSlot.type === 'keynote') {
            types.add('Keynote');
        } else if (timeSlot.sessions) {
            timeSlot.sessions.forEach(session => {
                types.add(session.type);
            });
        }
    });
    
    parsedData.demopods.forEach(timeSlot => {
        if (timeSlot.sessions) {
            timeSlot.sessions.forEach(session => {
                types.add(session.type);
            });
        }
    });
    
    parsedData.handson.forEach(timeSlot => {
        if (timeSlot.sessions) {
            timeSlot.sessions.forEach(session => {
                types.add(session.type);
            });
        }
    });
    
    return Array.from(types).sort();
}

/**
 * Format speakers for display
 * @param {Object} session - Session object
 * @returns {String} Formatted speaker string
 */
function formatSpeakers(session) {
    const speakers = [];
    
    if (session.speakers && session.speakers.trim()) {
        speakers.push(session.speakers);
    }
    if (session.speaker1 && session.speaker1.trim()) {
        speakers.push(session.speaker1);
    }
    if (session.speaker2 && session.speaker2.trim()) {
        speakers.push(session.speaker2);
    }
    
    return speakers.length > 0 ? speakers.join(', ') : '';
}

/**
 * Filter events based on search term and filters
 * @param {Object} parsedData - Parsed event data
 * @param {String} searchTerm - Search term
 * @param {Object} filters - Active filters
 * @returns {Object} Filtered data
 */
function filterEvents(parsedData, searchTerm = '', filters = {}) {
    const filtered = {
        lectures: [],
        demopods: [],
        handson: []
    };

    const searchLower = searchTerm.toLowerCase();

    // Filter lectures
    filtered.lectures = parsedData.lectures.map(timeSlot => {
        if (timeSlot.type === 'break') {
            // Always include breaks if Break type is selected
            if (!filters.types || filters.types.includes('Break')) {
                return timeSlot;
            }
            return null;
        } else if (timeSlot.type === 'registration') {
            // Always include registration if Registration type is selected
            if (!filters.types || filters.types.includes('Registration')) {
                return timeSlot;
            }
            return null;
        } else if (timeSlot.type === 'keynote') {
            // Always include keynotes if Keynote type is selected
            if (!filters.types || filters.types.includes('Keynote')) {
                return timeSlot;
            }
            return null;
        }

        const filteredSessions = timeSlot.sessions.filter(session => {
            // Type filter
            if (filters.types && !filters.types.includes(session.type)) {
                return false;
            }

            // Track filter
            if (filters.tracks && filters.tracks.length > 0 && !filters.tracks.includes(session.track)) {
                return false;
            }

            // Search filter
            if (searchTerm) {
                const sessionText = [
                    session.title,
                    formatSpeakers(session),
                    session.track,
                    session.description
                ].join(' ').toLowerCase();
                
                if (!sessionText.includes(searchLower)) {
                    return false;
                }
            }

            return true;
        });

        if (filteredSessions.length > 0) {
            return {
                ...timeSlot,
                sessions: filteredSessions
            };
        }
        return null;
    }).filter(Boolean);

    // Filter demo pods
    filtered.demopods = parsedData.demopods.map(timeSlot => {
        const filteredSessions = timeSlot.sessions.filter(session => {
            // Type filter
            if (filters.types && !filters.types.includes(session.type)) {
                return false;
            }

            // Track filter
            if (filters.tracks && filters.tracks.length > 0 && !filters.tracks.includes(session.track)) {
                return false;
            }

            // Search filter
            if (searchTerm) {
                const sessionText = [
                    session.title,
                    formatSpeakers(session),
                    session.track,
                    session.description
                ].join(' ').toLowerCase();
                
                if (!sessionText.includes(searchLower)) {
                    return false;
                }
            }

            return true;
        });

        if (filteredSessions.length > 0) {
            return {
                ...timeSlot,
                sessions: filteredSessions
            };
        }
        return null;
    }).filter(Boolean);

    // Filter hands-on sessions
    filtered.handson = parsedData.handson.map(timeSlot => {
        const filteredSessions = timeSlot.sessions.filter(session => {
            // Type filter
            if (filters.types && !filters.types.includes(session.type)) {
                return false;
            }

            // Track filter
            if (filters.tracks && filters.tracks.length > 0 && !filters.tracks.includes(session.track)) {
                return false;
            }

            // Search filter
            if (searchTerm) {
                const sessionText = [
                    session.title,
                    formatSpeakers(session),
                    session.track,
                    session.description
                ].join(' ').toLowerCase();
                
                if (!sessionText.includes(searchLower)) {
                    return false;
                }
            }

            return true;
        });

        if (filteredSessions.length > 0) {
            return {
                ...timeSlot,
                sessions: filteredSessions
            };
        }
        return null;
    }).filter(Boolean);

    return filtered;
}

/**
 * Debounce function for search input
 * @param {Function} func - Function to debounce
 * @param {Number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Format speakers with their designations for special sessions
 * @param {Object} sessionData - Session data with speaker information
 * @returns {String} Formatted speakers string
 */
function formatSpecialSessionSpeakers(sessionData) {
    const speakers = [];
    
    for (let i = 1; i <= 3; i++) {
        const speaker = sessionData[`speaker${i}`];
        const designation = sessionData[`speaker${i}_designation`];
        
        if (speaker && speaker.trim()) {
            if (designation && designation.trim()) {
                speakers.push(`${speaker}, ${designation}`);
            } else {
                speakers.push(speaker);
            }
        }
    }
    
    return speakers.length > 0 ? speakers.join(' | ') : '';
}

/**
 * Generate a unique ID for session cards
 * @param {String} sequence - Time slot sequence
 * @param {Number} index - Session index
 * @returns {String} Unique ID
 */
function generateSessionId(sequence, index) {
    return `session-${sequence}-${index}`;
}

/**
 * Parse the concur-specific event data JSON into a standardized format
 * @param {Object} concurData - Raw JSON data from concur_3rdedition.json
 * @returns {Object} Parsed concur data with timeline structure
 */
function parseConcurEventData(concurData) {
    const parsedData = {
        concurschedule: []
    };

    // Parse concur schedule data
    if (concurData.concur) {
        concurData.concur.forEach(timeSlot => {
            if (timeSlot.type === 'break') {
                // Handle break sessions
                parsedData.concurschedule.push({
                    sequence: timeSlot.sequence,
                    time: timeSlot.time,
                    type: 'break',
                    title: timeSlot.tracktitle,
                    sessions: []
                });
            } else if (timeSlot.type === 'grid' && timeSlot.sessionsBySequence) {
                // Handle regular concur sessions
                parsedData.concurschedule.push({
                    sequence: timeSlot.sequence,
                    time: timeSlot.time,
                    type: 'session',
                    title: '',
                    sessions: timeSlot.sessionsBySequence.map(session => ({
                        title: session.sessiontitle || '',
                        speaker1: session.speaker1 || '',
                        speaker2: session.speaker2 || '',
                        speakers: session.speakers || '',
                        track: session.tracktitle || '',
                        trackId: session.trackid || '',
                        type: session.type || 'Concur Session',
                        description: session.description || '',
                        organization: session.organization1 || ''
                    }))
                });
            }
        });
    }

    return parsedData;
}

/**
 * Get all unique tracks from concur data
 * @param {Object} parsedConcurData - Parsed concur event data
 * @returns {Array} Array of unique tracks
 */
function getConcurUniqueTracks(parsedConcurData) {
    const tracks = new Set();
    
    parsedConcurData.concurschedule.forEach(timeSlot => {
        if (timeSlot.sessions) {
            timeSlot.sessions.forEach(session => {
                if (session.track && session.track.trim() !== '') {
                    tracks.add(session.track);
                }
            });
        }
    });
    
    return Array.from(tracks).sort();
}

/**
 * Get all unique session types from concur data
 * @param {Object} parsedConcurData - Parsed concur event data
 * @returns {Array} Array of unique types
 */
function getConcurUniqueTypes(parsedConcurData) {
    const types = new Set();
    
    parsedConcurData.concurschedule.forEach(timeSlot => {
        if (timeSlot.type === 'break') {
            types.add('Break');
        } else if (timeSlot.sessions) {
            timeSlot.sessions.forEach(session => {
                types.add(session.type);
            });
        }
    });
    
    return Array.from(types).sort();
}

/**
 * Filter concur events based on search term and filters
 * @param {Object} parsedConcurData - Parsed concur event data
 * @param {String} searchTerm - Search term
 * @param {Object} filters - Active filters
 * @returns {Object} Filtered data
 */
function filterConcurEvents(parsedConcurData, searchTerm = '', filters = {}) {
    const filtered = {
        concurschedule: []
    };

    const searchLower = searchTerm.toLowerCase();

    // Filter concur schedule
    filtered.concurschedule = parsedConcurData.concurschedule.map(timeSlot => {
        if (timeSlot.type === 'break') {
            // Always include breaks if Break type is selected
            if (!filters.types || filters.types.includes('Break')) {
                return timeSlot;
            }
            return null;
        }

        const filteredSessions = timeSlot.sessions.filter(session => {
            // Type filter
            if (filters.types && !filters.types.includes(session.type)) {
                return false;
            }

            // Track filter
            if (filters.tracks && filters.tracks.length > 0 && !filters.tracks.includes(session.track)) {
                return false;
            }

            // Search filter
            if (searchTerm) {
                const sessionText = [
                    session.title,
                    formatSpeakers(session),
                    session.track,
                    session.description
                ].join(' ').toLowerCase();
                
                if (!sessionText.includes(searchLower)) {
                    return false;
                }
            }

            return true;
        });

        if (filteredSessions.length > 0) {
            return {
                ...timeSlot,
                sessions: filteredSessions
            };
        }
        return null;
    }).filter(Boolean);

    return filtered;
}