// API Configuration for JobHunt
const API_CONFIG = {
    // JSearch Endpoints
    BASE_URL: 'https://jsearch.p.rapidapi.com',
    API_HOST: 'jsearch.p.rapidapi.com',
    
    // Endpoints
    SEARCH_ENDPOINT: '/search',
    SALARY_ENDPOINT: '/company-job-salary',
    DETAILS_ENDPOINT: '/job-details',

    // API keys
    DEFAULT_KEY: '',

    // Cache Duration (1 Hour for jobs is reasonable)
    CACHE_DURATION: 1000 * 60 * 60
};

// JSearch Parameters
const APP_PARAMS = {
    // JSearch uses ISO-2 country codes
    COUNTRIES: [
        { name: 'United States', code: 'us' },
        { name: 'United Kingdom', code: 'gb' },
        { name: 'Canada', code: 'ca' },
        { name: 'Australia', code: 'au' },
        { name: 'Germany', code: 'de' },
        { name: 'France', code: 'fr' },
        { name: 'India', code: 'in' },
        { name: 'Singapore', code: 'sg' }
    ],
    // Date Posted Filters
    DATE_FILTERS: [
        { name: 'All Time', value: 'all' },
        { name: 'Today', value: 'today' },
        { name: 'Last 3 Days', value: '3days' },
        { name: 'This Week', value: 'week' },
        { name: 'This Month', value: 'month' }
    ],
    // Employment Types
    JOB_TYPES: [
        { name: 'Full Time', value: 'FULLTIME' },
        { name: 'Contractor', value: 'CONTRACTOR' },
        { name: 'Part Time', value: 'PARTTIME' },
        { name: 'Intern', value: 'INTERN' }
    ]
};
