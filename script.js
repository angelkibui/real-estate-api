// Application State
let currentProperties = [];
let filteredProperties = [];
let currentPage = 1;
const propertiesPerPage = 9;

// API Configuration
const API_CONFIG = {
    url: 'https://loopnet-api.p.rapidapi.com/loopnet/sale/advanceSearch',
    key: '00225178b0msh5fc4ca96d725123p18e20cjsn8683c26792e2',
    host: 'loopnet-api.p.rapidapi.com'
};

// DOM Elements
const searchForm = document.getElementById('search-form');
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const filtersElement = document.getElementById('filters');
const resultsElement = document.getElementById('results');
const resultsCount = document.getElementById('results-count');
const propertiesGrid = document.getElementById('properties-grid');
const sortSelect = document.getElementById('sort-by');
const searchFilter = document.getElementById('search-filter');
const paginationElement = document.getElementById('pagination');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    searchForm.addEventListener('submit', handleSearch);
    sortSelect.addEventListener('change', handleSort);
    searchFilter.addEventListener('input', handleFilter);
    prevPageBtn.addEventListener('click', () => changePage(-1));
    nextPageBtn.addEventListener('click', () => changePage(1));
});

// Search Properties Function
async function handleSearch(event) {
    event.preventDefault();
    
    const formData = new FormData(searchForm);
    const searchParams = {
        location: formData.get('location') || 'New York, NY',
        propertyType: formData.get('propertyType') || '',
        minPrice: parseInt(formData.get('minPrice')) || 0,
        maxPrice: parseInt(formData.get('maxPrice')) || 50000000,
        minSqft: parseInt(formData.get('minSqft')) || 0,
        maxSqft: parseInt(formData.get('maxSqft')) || 1000000
    };

    showLoading(true);
    hideError();
    
    try {
        const properties = await searchProperties(searchParams);
        currentProperties = properties;
        filteredProperties = [...properties];
        currentPage = 1;
        
        displayResults();
        showFilters();
        
    } catch (error) {
        console.error('Search error:', error);
        showError('Failed to search properties. Please try again.');
    } finally {
        showLoading(false);
    }
}

// API Call Function
async function searchProperties(params) {
    const requestBody = {
        "location": params.location,
        "propertyType": params.propertyType,
        "priceRange": {
            "min": params.minPrice,
            "max": params.maxPrice
        },
        "sizeRange": {
            "min": params.minSqft,
            "max": params.maxSqft
        },
        "limit": 50
    };

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': API_CONFIG.key,
            'X-RapidAPI-Host': API_CONFIG.host
        },
        body: JSON.stringify(requestBody)
    };

    try {
        const response = await fetch(API_CONFIG.url, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Handle different response structures
        if (data.properties && Array.isArray(data.properties)) {
            return data.properties;
        } else if (Array.isArray(data)) {
            return data;
        } else {
            // If API is down or returns unexpected format, return mock data
            return generateMockData(params);
        }
        
    } catch (error) {
        console.warn('API call failed, using mock data:', error);
        return generateMockData(params);
    }
}

// mock data
function generateMockData(params) {
    const mockProperties = [
        {
            id: '1',
            title: 'Premium Office Tower',
            location: 'Manhattan, NY',
            price: 15000000,
            sqft: 25000,
            propertyType: 'Office',
            yearBuilt: 2018,
            description: 'State-of-the-art office building in prime Manhattan location'
        },
        {
            id: '2',
            title: 'Retail Shopping Center',
            location: 'Brooklyn, NY',
            price: 8500000,
            sqft: 35000,
            propertyType: 'Retail',
            yearBuilt: 2015,
            description: 'High-traffic retail center with excellent visibility'
        },
        {
            id: '3',
            title: 'Industrial Warehouse Complex',
            location: 'Queens, NY',
            price: 12000000,
            sqft: 80000,
            propertyType: 'Industrial',
            yearBuilt: 2020,
            description: 'Modern warehouse facility with loading docks'
        },
        {
            id: '4',
            title: 'Mixed-Use Development',
            location: 'Bronx, NY',
            price: 22000000,
            sqft: 45000,
            propertyType: 'Mixed Use',
            yearBuilt: 2019,
            description: 'Versatile mixed-use property with retail and office space'
        },
        {
            id: '5',
            title: 'Medical Office Building',
            location: 'Staten Island, NY',
            price: 6750000,
            sqft: 18000,
            propertyType: 'Office',
            yearBuilt: 2017,
            description: 'Purpose-built medical facility with modern amenities'
        },
        {
            id: '6',
            title: 'Distribution Center',
            location: 'Long Island, NY',
            price: 18500000,
            sqft: 120000,
            propertyType: 'Industrial',
            yearBuilt: 2021,
            description: 'Large-scale distribution center with advanced logistics features'
        }
    ];

    // Filter mock data based on search parameters
    return mockProperties.filter(property => {
        const matchesType = !params.propertyType || 
            property.propertyType.toLowerCase().includes(params.propertyType.toLowerCase());
        const matchesPrice = property.price >= params.minPrice && property.price <= params.maxPrice;
        const matchesSize = property.sqft >= params.minSqft && property.sqft <= params.maxSqft;
        
        return matchesType && matchesPrice && matchesSize;
    });
}

// Display Results Function
function displayResults() {
    const startIndex = (currentPage - 1) * propertiesPerPage;
    const endIndex = startIndex + propertiesPerPage;
    const pagifiedProperties = filteredProperties.slice(startIndex, endIndex);
    
    resultsCount.textContent = `Found ${filteredProperties.length} properties`;
    
    if (filteredProperties.length === 0) {
        propertiesGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No properties found</h3>
                <p>Try adjusting your search criteria</p>
            </div>
        `;
        paginationElement.style.display = 'none';
        return;
    }
    
    propertiesGrid.innerHTML = pagifiedProperties.map(property => createPropertyCard(property)).join('');
    
    // Update pagination
    updatePagination();
    
    // Show results
    resultsElement.style.display = 'block';
    
    // Smooth scroll to results
    resultsElement.scrollIntoView({ behavior: 'smooth' });
}

// Create Property Card HTML
function createPropertyCard(property) {
    const formattedPrice = formatCurrency(property.price);
    const formattedSqft = formatNumber(property.sqft);
    
    return `
        <div class="property-card" onclick="showPropertyDetails('${property.id}')">
            <div class="property-image">
                <i class="fas fa-building"></i>
            </div>
            <div class="property-info">
                <h3 class="property-title">
                    <i class="fas fa-map-marker-alt"></i>
                    ${property.title || 'Commercial Property'}
                </h3>
                <div class="property-details">
                    <div class="detail-item">
                        <i class="fas fa-location-dot"></i>
                        <span>${property.location || 'Location TBD'}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-expand-arrows-alt"></i>
                        <span>${formattedSqft} sq ft</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Built: ${property.yearBuilt || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-tag"></i>
                        <span>${property.propertyType || 'Commercial'}</span>
                    </div>
                </div>
                <div class="property-description">
                    ${property.description || 'Prime commercial property opportunity'}
                </div>
                <div class="property-price">
                    ${formattedPrice}
                </div>
            </div>
        </div>
    `;
}

// Show Property Details 
function showPropertyDetails(propertyId) {
    const property = currentProperties.find(p => p.id === propertyId);
    if (property) {
        alert(`Property Details:\n\nTitle: ${property.title}\nLocation: ${property.location}\nPrice: ${formatCurrency(property.price)}\nSize: ${formatNumber(property.sqft)} sq ft\nType: ${property.propertyType}\n\nDescription: ${property.description}`);
    }
}

// Sorting Function
function handleSort() {
    const sortBy = sortSelect.value;
    
    filteredProperties.sort((a, b) => {
        switch (sortBy) {
            case 'price-asc':
                return a.price - b.price;
            case 'price-desc':
                return b.price - a.price;
            case 'size-asc':
                return a.sqft - b.sqft;
            case 'size-desc':
                return b.sqft - a.sqft;
            case 'newest':
                return (b.yearBuilt || 0) - (a.yearBuilt || 0);
            default:
                return 0;
        }
    });
    
    currentPage = 1;
    displayResults();
}

// Filtering Function
function handleFilter() {
    const filterText = searchFilter.value.toLowerCase();
    
    if (!filterText) {
        filteredProperties = [...currentProperties];
    } else {
        filteredProperties = currentProperties.filter(property => {
            return (
                (property.title || '').toLowerCase().includes(filterText) ||
                (property.location || '').toLowerCase().includes(filterText) ||
                (property.propertyType || '').toLowerCase().includes(filterText) ||
                (property.description || '').toLowerCase().includes(filterText)
            );
        });
    }
    
    currentPage = 1;
    displayResults();
}

// Pagination Functions
function changePage(direction) {
    const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        displayResults();
    }
}

function updatePagination() {
    const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
    
    if (totalPages <= 1) {
        paginationElement.style.display = 'none';
        return;
    }
    
    paginationElement.style.display = 'flex';
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
}

function showLoading(show) {
    loadingElement.style.display = show ? 'flex' : 'none';
}

function showError(message) {
    errorText.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

function hideError() {
    errorElement.style.display = 'none';
}

function showFilters() {
    filtersElement.style.display = 'block';
}

