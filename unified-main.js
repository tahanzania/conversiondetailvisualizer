// Unified main JavaScript file for Trader Visualization Dashboard

// Global variables
let dataProcessor;
let chartVisualizer;
let timeToConvertVisualizer;
let devicePathVisualizer;
let filterManager;
let exportManager;

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initializeDashboard();
    
    // Set up event listeners
    setupEventListeners();
    
    // Check for sample data
    checkForSampleData();
});

/**
 * Initialize dashboard components
 */
function initializeDashboard() {
    // Initialize unified data processor
    dataProcessor = new UnifiedDataProcessor();
    
    // Initialize chart visualizer
    chartVisualizer = new ChartVisualizer(dataProcessor);
    
    // Initialize time to convert visualizer
    timeToConvertVisualizer = new TimeToConvertVisualizer(dataProcessor, chartVisualizer);
    window.timeToConvertVisualizer = timeToConvertVisualizer;
    
    // Initialize device path visualizer
    devicePathVisualizer = new DevicePathVisualizer(dataProcessor, chartVisualizer);
    window.devicePathVisualizer = devicePathVisualizer;
    
    // Initialize unified filter manager
    filterManager = new UnifiedFilterManager(dataProcessor, chartVisualizer);
    
    // Initialize export manager
    exportManager = new ExportManager(dataProcessor, chartVisualizer);
    
    // Initialize export UI
    exportManager.initializeExport();
    
    // Show welcome message
    showWelcomeMessage();
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // File upload event listener
    const fileInput = document.getElementById('csv-file-input');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);

        // File name display update
        fileInput.addEventListener('change', function() {
            const fileNameDisplay = document.getElementById('file-name-display');
            if (fileNameDisplay) {
                if (fileInput.files.length > 0) {
                    fileNameDisplay.textContent = fileInput.files[0].name;
                } else {
                    fileNameDisplay.textContent = 'No file selected';
                }
            }
        });
    }

    initializeSectionToggles();
    initializeSectionNavigation();
}

/**
 * Check for sample data and load if available
 */
function checkForSampleData() {
    // In a real implementation, this would check for sample data
    // For this example, we'll just show a message
    console.log('Unified dashboard initialized. Upload a CSV file to begin.');
}

/**
 * Handle file upload
 * @param {Event} event - File input change event
 */
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Show loading overlay
    showLoadingOverlay();
    
    // Process file
    dataProcessor.processFile(file)
        .then(data => {
            // Initialize filters
            filterManager.initializeFilters();
            
            // Initialize charts
            chartVisualizer.initializeCharts(data);
            
            // Initialize time to convert visualizations
            timeToConvertVisualizer.initializeVisualizations(data);
            
            // Initialize device path visualizations
            devicePathVisualizer.initializeVisualizations(data);
            
            // Add site performance chart
            createSitePerformanceChart(data.sitePerformance);
            
            // Hide loading overlay
            hideLoadingOverlay();
        })
        .catch(error => {
            console.error('Error processing file:', error);
            alert('Error processing file. Please check the file format and try again.');
            hideLoadingOverlay();
        });
}

/**
 * Create site performance chart
 * @param {Object} siteData - Site performance data
 */
function createSitePerformanceChart(siteData) {
    if (!siteData || !siteData.lastImpressionSites) return;
    
    const ctx = document.getElementById('site-performance-chart');
    if (!ctx) return;
    
    // Sort sites by conversions
    const sortedSites = Object.entries(siteData.lastImpressionSites)
        .sort((a, b) => b[1].conversions - a[1].conversions)
        .slice(0, 15); // Top 15 sites
    
    const sites = sortedSites.map(([site]) => site);
    const conversions = sortedSites.map(([, data]) => data.conversions);
    const conversionRates = sortedSites.map(([, data]) => data.conversionRate.toFixed(2));
    
    const siteChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sites,
            datasets: [
                {
                    label: 'Conversions',
                    data: conversions,
                    backgroundColor: 'rgba(78, 121, 167, 0.7)',
                    borderColor: 'rgba(78, 121, 167, 1)',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Conversion Rate (%)',
                    data: conversionRates,
                    backgroundColor: 'rgba(242, 142, 44, 0.7)',
                    borderColor: 'rgba(242, 142, 44, 1)',
                    borderWidth: 1,
                    type: 'line',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Top Sites by Conversions',
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Conversions'
                    },
                    position: 'left'
                },
                y1: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Conversion Rate (%)'
                    },
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Site'
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
    
    // Store chart reference
    if (!chartVisualizer.charts) {
        chartVisualizer.charts = {};
    }
    chartVisualizer.charts.sitePerformance = siteChart;
}

/**
 * Show welcome message
 */
function showWelcomeMessage() {
    const primarySummary = document.querySelector('#global-overview [data-summary="global"]');
    if (primarySummary) {
        primarySummary.innerHTML = `
            <div class="welcome-message">
                <h2>Welcome to the Unified Trader Visualization Dashboard</h2>
                <p>Upload a CSV file to begin analyzing your conversion data.</p>
                <p>This unified dashboard provides insights on:</p>
                <ul>
                    <li>Conversion drivers</li>
                    <li>Time to convert metrics</li>
                    <li>Device path analysis</li>
                    <li>Media performance</li>
                    <li>Channel effectiveness</li>
                    <li>Creative performance</li>
                    <li>Geographic insights</li>
                    <li>Frequency analysis</li>
                    <li>Site performance</li>
                </ul>
                <p>All data is processed client-side only — no data is stored on any server.</p>
            </div>
        `;
    }

    const otherSummaries = document.querySelectorAll('.dashboard-section:not(#global-overview) [data-summary="global"]');
    otherSummaries.forEach(container => {
        container.innerHTML = '<div class="summary-placeholder">Upload a CSV file to populate this section.</div>';
    });

    const filterChips = document.getElementById('global-filter-chips');
    if (filterChips) {
        filterChips.innerHTML = '<span class="filter-chip"><span class="filter-chip-label">Status:</span> Awaiting data upload</span>';
    }
}

/**
 * Show loading overlay
 */
function showLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

/**
 * Hide loading overlay
 */
function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

/**
 * Utility function to format date
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
    if (!date) return '';
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

/**
 * Utility function to format number with commas
 * @param {number} number - Number to format
 * @returns {string} - Formatted number string
 */
function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Utility function to format currency
 * @param {number} value - Value to format
 * @returns {string} - Formatted currency string
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
}

/**
 * Utility function to get random color
 * @returns {string} - Random color in rgba format
 */
function getRandomColor() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r}, ${g}, ${b}, 0.7)`;
}

/**
 * Utility function to debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

/**
 * Initialize collapsible section toggle controls
 */
function initializeSectionToggles() {
    const toggles = document.querySelectorAll('.section-toggle');

    toggles.forEach(toggle => {
        const targetSelector = toggle.getAttribute('data-bs-target');
        if (!targetSelector) return;

        const target = document.querySelector(targetSelector);
        if (!target) return;

        const updateState = () => {
            const isOpen = target.classList.contains('show');
            const textElement = toggle.querySelector('.toggle-text');

            if (textElement) {
                textElement.textContent = isOpen ? 'Collapse' : 'Expand';
            }

            toggle.classList.toggle('collapsed', !isOpen);
            toggle.setAttribute('aria-expanded', isOpen);
        };

        target.addEventListener('shown.bs.collapse', updateState);
        target.addEventListener('hidden.bs.collapse', updateState);

        updateState();
    });
}

/**
 * Initialize sticky navigation behavior for sections
 */
function initializeSectionNavigation() {
    const navLinks = document.querySelectorAll('.section-nav-link');
    if (!navLinks.length) return;

    const scrollContainer = document.querySelector('.visualization-area');
    const sections = Array.from(navLinks)
        .map(link => {
            const href = link.getAttribute('href');
            if (!href || !href.startsWith('#')) return null;

            const section = document.querySelector(href);
            return section ? { link, section, href } : null;
        })
        .filter(Boolean);

    if (!sections.length) return;

    const activateLink = (href) => {
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === href);
        });
    };

    sections.forEach(({ link, href, section }) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();

            if (section && typeof section.scrollIntoView === 'function') {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            activateLink(href);
        });
    });

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            const visibleEntry = entries
                .filter(entry => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

            if (visibleEntry) {
                activateLink(`#${visibleEntry.target.id}`);
            }
        }, {
            root: scrollContainer || null,
            threshold: [0.25, 0.5, 0.75],
            rootMargin: '-80px 0px -40% 0px'
        });

        sections.forEach(({ section }) => observer.observe(section));
    } else {
        activateLink(sections[0].href);
    }

    activateLink(sections[0].href);
}
