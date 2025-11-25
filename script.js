// --- Cache System ---
const CacheSystem = {
    save: (key, data) => {
        try {
            const item = { timestamp: Date.now(), data: data };
            localStorage.setItem(key, JSON.stringify(item));
        } catch (e) { console.warn('Cache full', e); }
    },
    get: (key) => {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;
        const item = JSON.parse(itemStr);
        if (Date.now() - item.timestamp > API_CONFIG.CACHE_DURATION) {
            localStorage.removeItem(key);
            return null;
        }
        return item.data;
    },
    key: (prefix, obj) => `${prefix}_${JSON.stringify(obj)}`
};

// --- State ---
let currentUser = { name: '', apiKey: '' };
let currentJobData = null; 

// --- DOM Elements ---
const authScreen = document.getElementById('authScreen');
const appScreen = document.getElementById('appScreen');
const resultsContainer = document.getElementById('resultsContainer');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const emptyState = document.getElementById('emptyState');
const detailsModal = document.getElementById('detailsModal');
const detailsContent = document.getElementById('detailsContent');
const detailsLoading = document.getElementById('detailsLoading');
const salarySection = document.getElementById('salarySection');
const salaryResult = document.getElementById('salaryResult');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initUI();
    checkAuth();
    
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('searchForm').addEventListener('submit', handleSearch);
    document.getElementById('checkSalaryBtn').addEventListener('click', handleCheckSalary);
});

function initUI() {
    // Populate Countries - Essential for location filtering
    const countrySelect = document.getElementById('countrySelect');
    if (countrySelect) {
        countrySelect.innerHTML = ''; // Clear existing
        APP_PARAMS.COUNTRIES.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.code;
            opt.textContent = c.name;
            if(c.code === 'us') opt.selected = true;
            countrySelect.appendChild(opt);
        });
    }

    // Populate Date Filters
    const dateSelect = document.getElementById('dateSelect');
    if (dateSelect) {
        dateSelect.innerHTML = '';
        APP_PARAMS.DATE_FILTERS.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.value;
            opt.textContent = d.name;
            dateSelect.appendChild(opt);
        });
    }
}

// --- Auth Logic ---
function checkAuth() {
    const stored = localStorage.getItem('jobhunt_user');
    if (stored) {
        currentUser = JSON.parse(stored);
        showApp();
    } else {
        authScreen.classList.add('active');
        authScreen.style.display = 'flex';
        appScreen.classList.remove('active');
    }
}

function handleLogin(e) {
    e.preventDefault();
    const name = document.getElementById('userNameInput').value.trim();
    const key = document.getElementById('apiKeyInput').value.trim() || API_CONFIG.DEFAULT_KEY;
    currentUser = { name, apiKey: key };
    localStorage.setItem('jobhunt_user', JSON.stringify(currentUser));
    showApp();
}

function handleLogout() {
    localStorage.removeItem('jobhunt_user');
    location.reload();
}

function showApp() {
    authScreen.classList.remove('active');
    authScreen.style.display = 'none';
    appScreen.classList.add('active');
    document.getElementById('userGreeting').textContent = `Hi, ${currentUser.name}`;
}

// --- Job Search Logic ---
async function handleSearch(e) {
    e.preventDefault();
    
    const query = document.getElementById('queryInput').value.trim();
    const country = document.getElementById('countrySelect').value;
    const datePosted = document.getElementById('dateSelect').value;
    const isRemote = document.getElementById('remoteCheckbox').checked;

    if (!query) { alert('Please enter a job title or keyword'); return; }

    toggleState('loading');

    const params = new URLSearchParams({
        query: query,
        page: '1',
        num_pages: '1',
        country: country,
        date_posted: datePosted
    });

    if (isRemote) params.append('remote_jobs', 'true');

    const cacheKey = CacheSystem.key('jobs', { query, country, datePosted, isRemote });
    const cached = CacheSystem.get(cacheKey);

    if (cached) {
        renderJobs(cached);
        return;
    }

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.SEARCH_ENDPOINT}?${params.toString()}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': currentUser.apiKey,
                'x-rapidapi-host': API_CONFIG.API_HOST
            }
        });

        const data = await response.json();

        if (data.data && data.data.length > 0) {
            CacheSystem.save(cacheKey, data.data);
            renderJobs(data.data);
        } else {
            toggleState('empty');
            document.querySelector('#emptyState p').textContent = `No jobs found for "${query}". Try broadening your search.`;
        }

    } catch (err) {
        console.error(err);
        document.getElementById('errorMessage').textContent = err.message;
        toggleState('error');
    }
}

function renderJobs(jobs) {
    resultsContainer.innerHTML = '';
    
    jobs.forEach(job => {
        const card = document.createElement('div');
        card.className = 'job-card';
        
        const title = job.job_title;
        const employer = job.employer_name || 'Confidential';
        const city = job.job_city || '';
        const country = job.job_country || '';
        const location = city ? `${city}, ${country}` : (country || 'Remote');
        const type = job.job_employment_type || 'Full Time';
        
        card.innerHTML = `
            <div class="job-info">
                <h3>${title}</h3>
                <div class="employer-name">${employer}</div>
                <div class="job-meta">
                    <span class="meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        ${location}
                    </span>
                    <span class="tag">${type}</span>
                    <span class="meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        ${formatDate(job.job_posted_at_datetime_utc)}
                    </span>
                </div>
            </div>
            <div class="job-action">
                <button class="btn-primary">View</button>
            </div>
        `;

        card.addEventListener('click', () => openJobDetails(job));
        resultsContainer.appendChild(card);
    });
    toggleState('results');
}

// --- Details Logic (Updated with /job-details endpoint) ---
async function openJobDetails(basicJobData) {
    currentJobData = basicJobData; // Fallback data
    
    // UI Reset
    detailsModal.style.display = 'flex';
    salarySection.style.display = 'none'; // Hide salary until loaded
    salaryResult.textContent = '';
    detailsContent.style.display = 'none';
    detailsLoading.style.display = 'flex';

    const jobId = basicJobData.job_id;
    const country = document.getElementById('countrySelect').value || 'us';

    if (!jobId) {
        // Fallback if no ID (rare)
        renderDetailsContent(basicJobData);
        return;
    }

    // Call /job-details endpoint
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.DETAILS_ENDPOINT}?job_id=${jobId}&country=${country}`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': currentUser.apiKey,
                'x-rapidapi-host': API_CONFIG.API_HOST
            }
        });

        const data = await response.json();
        
        // If we get detailed data, use the first item, otherwise fallback to basic data
        const detailedJob = (data.data && data.data.length > 0) ? data.data[0] : basicJobData;
        
        // Update current data for salary check
        currentJobData = detailedJob;
        renderDetailsContent(detailedJob);

    } catch (err) {
        console.warn('Failed to fetch full details, showing basic info', err);
        renderDetailsContent(basicJobData);
    }
}

function renderDetailsContent(job) {
    detailsLoading.style.display = 'none';
    detailsContent.style.display = 'block';
    salarySection.style.display = 'block';

    const description = job.job_description ? job.job_description.replace(/\n/g, '<br>') : 'No description provided.';
    const applyLink = job.job_apply_link || job.job_google_link || '#';
    
    // Highlights (Benefits, Qualifications) - JSearch specific fields
    let highlightsHTML = '';
    if (job.job_highlights) {
        if (job.job_highlights.Qualifications) {
            highlightsHTML += `<h4>Qualifications</h4><ul>${job.job_highlights.Qualifications.map(q => `<li>${q}</li>`).join('')}</ul>`;
        }
        if (job.job_highlights.Responsibilities) {
            highlightsHTML += `<h4>Responsibilities</h4><ul>${job.job_highlights.Responsibilities.map(r => `<li>${r}</li>`).join('')}</ul>`;
        }
    }

    detailsContent.innerHTML = `
        <h2>${job.job_title}</h2>
        <div class="modal-meta">
            <strong>${job.employer_name}</strong> • ${job.job_city || ''}, ${job.job_country || ''} • ${job.job_employment_type || 'Full Time'}
        </div>
        <div class="job-description">
            ${description}
        </div>
        <div class="job-highlights">
            ${highlightsHTML}
        </div>
        <div class="action-area">
            <a href="${applyLink}" target="_blank" class="apply-btn">Apply Now</a>
        </div>
    `;
}

// --- Salary Logic ---
async function handleCheckSalary() {
    if (!currentJobData) return;

    const btn = document.getElementById('checkSalaryBtn');
    btn.textContent = 'Calculating...';
    btn.disabled = true;

    const title = currentJobData.job_title;
    const location = currentJobData.job_city || currentJobData.job_country || 'USA';

    const params = new URLSearchParams({
        job_title: title,
        location: location,
        radius: '200'
    });

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.SALARY_ENDPOINT}?${params.toString()}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': currentUser.apiKey,
                'x-rapidapi-host': API_CONFIG.API_HOST
            }
        });

        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            const est = data.data[0];
            const min = est.min_salary ? Math.round(est.min_salary).toLocaleString() : 'N/A';
            const max = est.max_salary ? Math.round(est.max_salary).toLocaleString() : 'N/A';
            const currency = est.salary_currency || 'USD';
            const period = est.salary_period || 'YEAR';

            salaryResult.innerHTML = `<span style="color:#05944f">Estimated Range: ${currency} ${min} - ${max} / ${period.toLowerCase()}</span>`;
        } else {
            salaryResult.textContent = 'Data unavailable for this specific role/location.';
        }

    } catch (err) {
        console.error(err);
        salaryResult.textContent = 'Could not fetch salary data.';
    } finally {
        btn.textContent = 'Check Estimation';
        btn.disabled = false;
    }
}

window.closeDetailsModal = () => {
    detailsModal.style.display = 'none';
};

// --- Utilities ---
function toggleState(state) {
    loadingState.style.display = 'none';
    errorState.style.display = 'none';
    emptyState.style.display = 'none';
    resultsContainer.style.display = 'none';
    
    if (state === 'loading') loadingState.style.display = 'block';
    if (state === 'error') errorState.style.display = 'block';
    if (state === 'empty') emptyState.style.display = 'block';
    if (state === 'results') resultsContainer.style.display = 'flex';
}

function formatDate(dateString) {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString();
}
