# Commercial Real Estate Search Application

A modern, responsive web application for searching commercial real estate properties using the LoopNet API. This application provides users with an intuitive interface to search, filter, and sort commercial properties for sale.

##  Features

- **Advanced Property Search**: Search by location, property type, price range, and square footage
- **Real-time Filtering**: Filter results by multiple criteria with instant updates
- **Sorting Options**: Sort properties by price, size, or construction date
- **Responsive Design**: Fully responsive interface that works on desktop, tablet, and mobile devices
- **Interactive UI**: Modern glass-morphism design with smooth animations and hover effects
- **Error Handling**: Graceful error handling with user-friendly messages

##  Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **API**: LoopNet API via RapidAPI
- **Styling**: Modern CSS 

##  Project Structure

real-estate-api/
├── index.html         
├── script.js          
├── style.css           
├── .gitignore          
└── README.md           

##  Installation & Setup

### Local Development

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd commercial-real-estate-search
   ```

2. **Open the application**:
   -  open `index.html` in your web browser
   - Or use a local server for better development experience:
   ```bash
   - Using Python 3
   python -m http.server 8000
   
    - or using Live Server (VS Code extension)
   Right-click on index.html → "Open with Live Server"
   ```

3. **Access the application**:
   - Direct file: `file:///path/to/index.html`
   - Local server: `http://localhost:8000`

### Part Two: Server Deployment & Load Balancing

This application has been designed for deployment across multiple web servers with load balancing capability.

#### Server Setup

**Web Servers (Web01 & Web02)**:

1. **Install Nginx** on both servers:
   ```bash
   sudo apt update
   sudo apt install nginx -y
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```

2. **Deploy application files**:
   ```bash
   - Create application directory
   sudo mkdir -p /var/www/real-estate-app
   
   - Copy application files
   sudo cp index.html /var/www/real-estate-app/
   sudo cp script.js /var/www/real-estate-app/
   sudo cp style.css /var/www/real-estate-app/
   
   - Set proper permissions
   sudo chown -R www-data:www-data /var/www/real-estate-app
   sudo chmod -R 755 /var/www/real-estate-app
   ```

3. **Configure Nginx** on both servers:
   ```nginx
    /etc/nginx/sites-available/real-estate-app
   server {
       listen 80;
       server_name web01.yourdomain.com; # Change for each server
       
       root /var/www/real-estate-app;
       index index.html;
       
       location / {
           try_files $uri $uri/ =404;
       }
       

4. **Enable the site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/real-estate-app /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

#### (Lb01)

1. **Install Nginx** on load balancer:
   ```bash
   sudo apt update
   sudo apt install nginx -y
   ```

2. **Configure load balancer**:
   ```nginx
   # /etc/nginx/nginx.conf
   
   upstream real_estate_backend {
       least_conn;
       server WEB01_IP:80 weight=1 max_fails=3 fail_timeout=30s;
       server WEB02_IP:80 weight=1 max_fails=3 fail_timeout=30s;
   }
   
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://real_estate_backend;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           
           # Health check
           proxy_connect_timeout 5s;
           proxy_send_timeout 5s;
           proxy_read_timeout 5s;
       }
       
       # Health check endpoint
       location /health {
           access_log off;
           return 200 "healthy\n";
           add_header Content-Type text/plain;
       }
   }
   ```

3. **Test and reload**:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

#### Load Balancer Testing

1. **Test individual servers**:
   ```bash
   curl -I http://WEB01_IP
   curl -I http://WEB02_IP
   ```

2. **Test load balancer**:
   ```bash
   curl -I http://LOAD_BALANCER_IP
   ```

3. **Monitor traffic distribution**:
   ```bash
   # Check access logs on both web servers
   sudo tail -f /var/log/nginx/access.log
   ```
   ```

##  API Configuration

### LoopNet API Integration

This application uses the LoopNet API through RapidAPI for fetching commercial real estate data.

**API Details**:
- **Provider**: LoopNet via RapidAPI
- **Endpoint**: `https://loopnet-api.p.rapidapi.com/loopnet/sale/advanceSearch`
- **Method**: POST
- **Rate Limits**: Check RapidAPI dashboard for current limits
.

##  Usage

### Search Properties

1. **Enter Search Criteria**:
   - Location (city, state, or zip code)
   - Property type (Office, Retail, Industrial, etc.)
   - Price range (minimum and maximum)
   - Square footage range

2. **Submit Search**: Click the "Search Properties" button

3. **View Results**: Browse through the returned properties with detailed information

### Filter and Sort

1. **Sort Options**:
   - Price: High to Low / Low to High
   - Size: Large to Small / Small to Large
   - Newest First

2. **Filter Results**: Use the search box to filter current results by keywords

3. **Pagination**: Navigate through multiple pages of results

### Property Details

- Click on any property card to view detailed information
- Properties display: price, location, size, type, year built, and description

##  Testing

### Manual Testing Checklist

- [ ] Search functionality with various parameters
- [ ] Sorting by different criteria
- [ ] Filtering results with keywords
- [ ] Pagination navigation
- [ ] Responsive design on different screen sizes
- [ ] Error handling when API is unavailable
- [ ] Load balancer traffic distribution
- [ ] Server failover functionality

### Load Balancer Testing

1. **Traffic Distribution**:
   ```bash
   # Make multiple requests and check server logs
   for i in {1..10}; do curl http://your-domain.com; done
   ```

2. **Health Monitoring**:
   ```bash
   # Monitor health check endpoint
   watch -n 5 'curl -s http://your-domain.com/health'
   ```

3. **Failover Testing**:
   - Stop one web server
   - Verify traffic routes to remaining server
   - Restart stopped server
   - Verify traffic resumes load balancing

##  Credits

- **LoopNet API**: Commercial real estate data provider
- **RapidAPI**: API marketplace and hosting


##  Troubleshooting

### Common Issues

1. **API Not Responding**:
   - Check API key validity
   - Verify rate limits not exceeded
   - Application will fallback to mock data

2. **Load Balancer Issues**:
   - Verify server connectivity
   - Check Nginx configuration
   - Review server logs for errors

3. **Styling Issues**:
   - Clear browser cache
   - Check CSS file loading
   - Verify font awesome CDN

### Server Monitoring

```bash
# Check server status
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/error.log

# Monitor resource usage
htop
```

---