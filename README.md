# real-estate-api
# E Real Estate Finder

A modern web application that helps users search and discover real estate properties using real market data from the Zillow API via RapidAPI.

##  Features

- **Real-time Property Search**: Search properties by location with live market data
- **Advanced Filtering**: Filter by property type, price range, bedrooms, and bathrooms
- **Multiple Sorting Options**: Sort by price, size, or newest listings
- **Market Statistics**: View average, minimum, and maximum prices for search results
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Error Handling**: Graceful handling of API errors and network issues
- **Modern UI**: Beautiful gradient design with smooth animations

##  Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript 
- **API**: Zillow Real Estate API via RapidAPI
- **Styling**:  CSS 
- **Architecture**: JavaScript 

##  Prerequisites

- Web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- RapidAPI account with Zillow API access
- Valid API key from RapidAPI

##  Installation & Setup

### Local Development

1. **Clone or download the project files:**
   ```bash
   git clone <your-repository-url>
   cd east-africa-real-estate
   ```

2. **Configure API Key:**
   - Open `script.js`
   - Replace the placeholder API key with your actual RapidAPI key:
   ```javascript
   const API_CONFIG = {
       host: 'zillow-com1.p.rapidapi.com',
       key: '0025178b0msh5fc4ca96d725123p18e20cjsn8683c26792e2', 
       baseUrl: 'https://zillow-com1.p.rapidapi.com'
   };
   ```

3. **Run locally:**
   - Simply open `index.html` in your web browser
   - Or use a local server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js (if you have http-server installed)
   npx http-server
   ```

##  Deployment Instructions

### Part 1: Deploy to Web Servers

1. **Prepare your files:**
   - Ensure all files are in the project directory
   - Verify API key is configured in `script.js`
   - Test locally before deployment

2. **Upload to Web01 and Web02:**
   ```bash
   # Example using SCP
   scp -r * user@web01-server:/var/www/html/
   scp -r * user@web02-server:/var/www/html/
   
   # Or using SFTP
   sftp user@web01-server
   put -r * /var/www/html/
   ```

3. **Set proper permissions:**
   ```bash
   chmod 644 *.html *.css *.js *.md
   chmod 755 /var/www/html/
   ```

### Part 2: Load Balancer Configuration

1. **Configure Load Balancer (Lb01):**
   
   **For Nginx Load Balancer:**
   ```nginx
   upstream backend {
       server web01-server:80;
       server web02-server:80;
   }
   
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://backend;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```

   **For Apache Load Balancer:**
   ```apache
   <VirtualHost *:80>
       ServerName your-domain.com
       
       ProxyPreserveHost On
       ProxyPass / balancer://mycluster/
       ProxyPassReverse / balancer://mycluster/
       
       <Proxy balancer://mycluster>
           BalancerMember http://web01-server:80
           BalancerMember http://web02-server:80
       </Proxy>
   </VirtualHost>
   ```

2. **Restart services:**
   ```bash
   # Nginx
   sudo systemctl restart nginx
   
   # Apache
   sudo systemctl restart apache2
   ```

3. **Test load balancing:**
   ```bash
   # Test multiple requests to see different servers responding
   curl -H "Host: your-domain.com" http://load-balancer-ip/
   ```

### Part 3: Verification

1. **Test individual servers:**
   - http://web01-server-ip/
   - http://web02-server-ip/

2. **Test load balancer:**
   - http://load-balancer-ip/
   - Verify requests are distributed between servers

3. **Test application functionality:**
   - Search for properties
   - Test filtering and sorting
   - Verify API integration works

##  Configuration

### Environment Variables (Optional)
For production deployment, consider using environment variables:

```javascript
const API_CONFIG = {
    host: process.env.RAPIDAPI_HOST || 'zillow-com1.p.rapidapi.com',
    key: process.env.RAPIDAPI_KEY || 'your-api-key',
    baseUrl: process.env.API_BASE_URL || 'https://zillow-com1.p.rapidapi.com'
};
```

### API Rate Limits
- **Free Tier**: 100 requests/month
- **Basic Plan**: 1,000 requests/month
- Monitor usage to avoid rate limiting

##  Usage

1. **Search Properties:**
   - Enter a location (e.g., "New York, NY")
   - Set optional filters (price, type, bedrooms)
   - Click "Search Properties"

2. **Filter Results:**
   - Use dropdown menus to refine results
   - Filters apply in real-time to current results

3. **Sort Results:**
   - Sort by price (low to high, high to low)
   - Sort by size (largest first)
   - Sort by newest listings

4. **View Details:**
   - Click "View Details" to see full property listing

##  Troubleshooting

### Common Issues:

1. **API Key Error (401):**
   - Verify API key is correct in `script.js`
   - Check RapidAPI subscription status

2. **Rate Limit Error (429):**
   - Wait before making more requests
   - Consider upgrading API plan

3. **No Results:**
   - Try different location names
   - Expand search criteria
   - Check internet connection

4. **Load Balancer Issues:**
   - Verify both web servers are running
   - Check load balancer configuration
   - Test individual server endpoints

##  API Documentation

This application uses the **Zillow Real Estate API** via RapidAPI:

- **Endpoint**: `/propertyExtendedSearch`
- **Method**: GET
- **Parameters**:
  - `location` (required): Search location
  - `home_type`: Property type filter
  - `minPrice`: Minimum price filter
  - `maxPrice`: Maximum price filter
  - `bedrooms`: Minimum bedrooms
  - `bathrooms`: Minimum bathrooms
  - `sort`: Sort parameter

##  Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request



##  Credits

- **API Provider**: Zillow via RapidAPI
- **Design**: Modern gradient-based responsive design
