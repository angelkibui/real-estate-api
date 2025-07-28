// API Configuration
const API_CONFIG = {
    host: 'zillow-com1.p.rapidapi.com',
    key: '00225178b0msh5fc4ca96d725123p18e20cjsn8683c26792e2', 
    baseUrl: 'https://loopnet-api.p.rapidapi.com/loopnet/sale/advanceSearch'
};

// Global variables
let currentProperties = [];
let currentSearchParams = {};

// Utility functions
function formatCurrency(amount) {
    if (!amount || amount === 0) return 'Price not available';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatNumber(num) {
    if (!num) return 'N/A';
    return new Intl.NumberFormat('en-US').format(num);
}

function showLoading() {
    document.getElementById('loadingModal').style.display = 'flex';
    document.getElementById('searchBtn').disabled = true;
}

function hideLoading() {
    document.getElementById('loadingModal').style.display = 'none';
    document.getElementById('searchBtn').disabled = false;
}

function showError(message, details = '') {
    const results = document.getElementById('results');
    results.innerHTML = `
        <div class="error">
            <h3>⚠️ Error</h3>
            <p><strong>${message}</strong></p>
            ${details ? `<p><small>${details}</small></p>` : ''}
            <p><small>Please try again with different search parameters.</small></p>
        </div>
    `;
}

// API Functions
async function searchPropertiesAPI() {
    const location = document.getElementById('searchLocation').value.trim();
    if (!location) {
        showError('Please enter a search location');
        return;
    }

    const params = {
        location: location,
        home_type: document.getElementById('propertyType').value || '',
        minPrice: document.getElementById('minPrice').value || '',
        maxPrice: document.getElementById('maxPrice').value || '',
        bedrooms: document.getElementById('bedrooms').value || '',
        bathrooms: document.getElementById('bathrooms').value || '',
        sort: getSortParameter()
    };

    const url = new URL(`${API_CONFIG.baseUrl}/propertyExtendedSearch`);
    
    // Add non-empty parameters to URL
    Object.keys(params).forEach(key => {
        if (params[key]) {
            url.searchParams.append(key, params[key]);
        }
    });

    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-host': API_CONFIG.host,
            'x-rapidapi-key': API_CONFIG.key
        }
    };

    try {
        console.log('Searching with URL:', url.toString());
        const response = await fetch(url.toString(), options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

function getSortParameter() {
    const sortBy = document.getElementById('sortBy').value;
    const sortMap = {
        'newest': 'newest',
        'price_asc': 'price_asc',
        'price_desc': 'price_desc',
        'sqft_desc': 'sqft_desc'
    };
    return sortMap[sortBy] || 'newest';
}

// Main search function
async function searchProperties() {
    showLoading();
    
    try {
        // Store current search parameters
        currentSearchParams = {
            location: document.getElementById('searchLocation').value,
            propertyType: document.getElementById('propertyType').value,
            minPrice: document.getElementById('minPrice').value,
            maxPrice: document.getElementById('maxPrice').value,
            bedrooms: document.getElementById('bedrooms').value,
            bathrooms: document.getElementById('bathrooms').value,
            sortBy: document.getElementById('sortBy').value
        };

        const data = await searchPropertiesAPI();
        
        if (data && data.props && Array.isArray(data.props)) {
            currentProperties = data.props;
            displayResults(data.props);
        } else if (data && data.results && Array.isArray(data.results)) {
            currentProperties = data.results;
            displayResults(data.results);
        } else {
            // If no properties found or different data structure
            console.log('Unexpected data structure:', data);
            displayResults([]);
        }
        
    } catch (error) {
        console.error('Search error:', error);
        let errorMessage = 'Failed to fetch properties';
        let errorDetails = '';
        
        if (error.message.includes('401')) {
            errorMessage = 'API Authentication Error';
            errorDetails = 'Please check your API key configuration.';
        } else if (error.message.includes('429')) {
            errorMessage = 'Rate Limit Exceeded';
            errorDetails = 'Too many requests. Please wait a moment and try again.';
        } else if (error.message.includes('404')) {
            errorMessage = 'API Endpoint Not Found';
            errorDetails = 'The search service may be temporarily unavailable.';
        } else {
            errorDetails = error.message;
        }
        
        showError(errorMessage, errorDetails);
    } finally {
        hideLoading();
    }
}

// Display functions
function displayResults(properties) {
    const results = document.getElementById('results');
    
    if (!properties || properties.length === 0) {
        results.innerHTML = `
            <div class="no-results">
                <h3>🔍 No Properties Found</h3>
                <p>We couldn't find any properties matching your criteria.</p>
                <div class="suggestions">
                    <h4>Try adjusting your search:</h4>
                    <ul>
                        <li>Expand your price range</li>
                        <li>Try a different location</li>
                        <li>Reduce the number of bedrooms/bathrooms</li>
                        <li>Change the property type</li>
                    </ul>
                </div>
            </div>
        `;
        return;
    }

    // Calculate statistics
    const stats = calculateStats(properties);
    
    // Generate HTML
    const statsHtml = generateStatsHTML(stats, properties.length);
    const propertiesHtml = generatePropertiesHTML(properties);
    
    results.innerHTML = statsHtml + propertiesHtml;
}

function calculateStats(properties) {
    if (properties.length === 0) {
        return { avgPrice: 0, minPrice: 0, maxPrice: 0, avgSqft: 0 };
    }
    
    const validPrices = properties
        .map(p => p.price || p.listPrice || 0)
        .filter(price => price > 0);
    
    const validSqft = properties
        .map(p => p.livingArea || p.sqft || 0)
        .filter(sqft => sqft > 0);
    
    return {
        avgPrice: validPrices.length > 0 ? Math.round(validPrices.reduce((a, b) => a + b, 0) / validPrices.length) : 0,
        minPrice: validPrices.length > 0 ? Math.min(...validPrices) : 0,
        maxPrice: validPrices.length > 0 ? Math.max(...validPrices) : 0,
        avgSqft: validSqft.length > 0 ? Math.round(validSqft.reduce((a, b) => a + b, 0) / validSqft.length) : 0
    };
}

function generateStatsHTML(stats, totalProperties) {
    return `
        <div class="stats-section">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${totalProperties}</div>
                    <div class="stat-label">Properties Found</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${formatCurrency(stats.avgPrice)}</div>
                    <div class="stat-label">Average Price</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${formatCurrency(stats.minPrice)}</div>
                    <div class="stat-label">Lowest Price</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${formatCurrency(stats.maxPrice)}</div>
                    <div class="stat-label">Highest Price</div>
                </div>
            </div>
        </div>
    `;
}

function generatePropertiesHTML(properties) {
    return `
        <div class="property-grid">
            ${properties.map(property => generatePropertyCardHTML(property)).join('')}
        </div>
    `;
}

function generatePropertyCardHTML(property) {
    const price = property.price || property.listPrice || 0;
    const bedrooms = property.bedrooms || property.beds || 0;
    const bathrooms = property.bathrooms || property.baths || 0;
    const sqft = property.livingArea || property.sqft || 0;
    const address = property.address || property.streetAddress || 'Address not available';
    const city = property.city || '';
    const state = property.state || '';
    const zipcode = property.zipcode || '';
    const propertyType = property.propertyType || property.homeType || 'Property';
    const listingUrl = property.detailUrl || property.url || '#';
    const imageUrl = property.imgSrc || property.image || null;

    // Create full address
    const fullAddress = [address, city, state, zipcode].filter(Boolean).join(', ');

    return `
        <div class="property-card">
            <div class="property-image">
                ${imageUrl ? 
                    `<img src="${imageUrl}" alt="Property Image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                     <div class="placeholder" style="display:none;">
                         <div style="font-size: 3rem;">🏠</div>
                         <div>${propertyType.toUpperCase()}</div>
                     </div>` :
                    `<div class="placeholder">
                         <div style="font-size: 3rem;">🏠</div>
                         <div>${propertyType.toUpperCase()}</div>
                     </div>`
                }
            </div>
            <div class="property-content">
                <div class="property-title">${address}</div>
                <div class="property-price">${formatCurrency(price)}</div>
                <div class="property-details">
                    ${bedrooms > 0 ? `<div class="property-detail">🛏️ ${bedrooms} Beds</div>` : ''}
                    ${bathrooms > 0 ? `<div class="property-detail">🚿 ${bathrooms} Baths</div>` : ''}
                    ${sqft > 0 ? `<div class="property-detail">📐 ${formatNumber(sqft)} sqft</div>` : ''}
                    <div class="property-detail">🏠 ${propertyType}</div>
                </div>
                <div class="property-location">
                    📍 ${fullAddress}
                </div>
                ${listingUrl && listingUrl !== '#' ? `
                    <div class="property-link">
                        <a href="${listingUrl}" target="_blank" rel="noopener noreferrer">View Details</a>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Add enter key support for search inputs
    const searchInputs = ['searchLocation', 'minPrice', 'maxPrice'];
    searchInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    searchProperties();
                }
            });
        }
    });

    // Load default search on page load
    console.log('Page loaded. Ready for property search.');
});

// Filter and sort functions for client-side manipulation
function filterProperties() {
    if (currentProperties.length === 0) return;

    const filters = {
        propertyType: document.getElementById('propertyType').value,
        minPrice: parseFloat(document.getElementById('minPrice').value) || 0,
        maxPrice: parseFloat(document.getElementById('maxPrice').value) || Infinity,
        bedrooms: parseInt(document.getElementById('bedrooms').value) || 0,
        bathrooms: parseInt(document.getElementById('bathrooms').value) || 0
    };

    let filtered = currentProperties.filter(property => {
        const price = property.price || property.listPrice || 0;
        const beds = property.bedrooms || property.beds || 0;
        const baths = property.bathrooms || property.baths || 0;
        const type = property.propertyType || property.homeType || '';

        return (
            (!filters.propertyType || type.toLowerCase().includes(filters.propertyType.toLowerCase())) &&
            (price >= filters.minPrice) &&
            (price <= filters.maxPrice) &&
            (beds >= filters.bedrooms) &&
            (baths >= filters.bathrooms)
        );
    });

    // Apply sorting
    const sortBy = document.getElementById('sortBy').value;
    filtered = sortProperties(filtered, sortBy);

    displayResults(filtered);
}

function sortProperties(properties, sortBy) {
    return properties.sort((a, b) => {
        const priceA = a.price || a.listPrice || 0;
        const priceB = b.price || b.listPrice || 0;
        const sqftA = a.livingArea || a.sqft || 0;
        const sqftB = b.livingArea || b.sqft || 0;

        switch (sortBy) {
            case 'price_asc':
                return priceA - priceB;
            case 'price_desc':
                return priceB - priceA;
            case 'sqft_desc':
                return sqftB - sqftA;
            case 'newest':
            default:
                // If we have date information, sort by that, otherwise maintain original order
                return 0;
        }
    });
}

// Add event listeners for real-time filtering 
function addFilterListeners() {
    const filterElements = ['propertyType', 'minPrice', 'maxPrice', 'bedrooms', 'bathrooms', 'sortBy'];
    
    filterElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener('change', function() {
                if (currentProperties.length > 0) {
                    filterProperties();
                }
            });
        }
    });
}

// Error handling for network issues
window.addEventListener('online', function() {
    console.log('Connection restored');
});

window.addEventListener('offline', function() {
    showError('No internet connection', 'Please check your internet connection and try again.');
});

// Initialize filter listeners when page loads
document.addEventListener('DOMContentLoaded', addFilterListeners);