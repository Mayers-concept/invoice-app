// Initialize app
let invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
let stats = JSON.parse(localStorage.getItem('stats') || '{"total": 0, "today": 0, "timesSaved": 0}');

// Update stats on load
updateStats();
displayInvoices();

// Camera button
document.getElementById('cameraBtn').addEventListener('click', () => {
    document.getElementById('fileInput').setAttribute('capture', 'environment');
    document.getElementById('fileInput').click();
});

// Upload button
document.getElementById('uploadBtn').addEventListener('click', () => {
    document.getElementById('fileInput').removeAttribute('capture');
    document.getElementById('fileInput').click();
});

// File input handler
document.getElementById('fileInput').addEventListener('change', handleFileSelect);

// Drag and drop
const uploadArea = document.getElementById('uploadArea');

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('active');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('active');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('active');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
});

uploadArea.addEventListener('click', () => {
    document.getElementById('fileInput').click();
});

// Handle file selection
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

// Process uploaded file
async function processFile(file) {
    // Show loading
    document.getElementById('loading').classList.add('active');
    
    // Convert to base64 for processing
    const reader = new FileReader();
    reader.onload = async function(e) {
        const base64 = e.target.result;
        
        // Simulate OCR processing (2 seconds)
        setTimeout(() => {
            // Extract text (mock OCR - in production, use real OCR API)
            const extractedData = mockOCR(file.name);
            
            // Hide loading
            document.getElementById('loading').classList.remove('active');
            
            // Show preview modal
            showPreview(extractedData);
        }, 2000);
    };
    reader.readAsDataURL(file);
}

// Mock OCR function (replace with real OCR API)
function mockOCR(filename) {
    // Generate realistic mock data
    const vendors = ['ABC Corp', 'XYZ Ltd', 'Tech Solutions', 'Office Supplies Co', 'Global Services'];
    const vendor = vendors[Math.floor(Math.random() * vendors.length)];
    const invoiceNum = 'INV-' + Math.floor(Math.random() * 10000);
    const amount = (Math.random() * 5000 + 100).toFixed(2);
    const date = new Date().toISOString().split('T')[0];
    
    return {
        vendor: vendor,
        invoiceNumber: invoiceNum,
        amount: amount,
        date: date,
        confidence: 0.95
    };
}

// Show preview modal
function showPreview(data) {
    document.getElementById('vendorName').value = data.vendor;
    document.getElementById('invoiceNumber').value = data.invoiceNumber;
    document.getElementById('amount').value = data.amount;
    document.getElementById('invoiceDate').value = data.date;
    
    document.getElementById('previewModal').classList.add('active');
}

// Close preview
function closePreview() {
    document.getElementById('previewModal').classList.remove('active');
}

// Save invoice
function saveInvoice() {
    const invoice = {
        id: Date.now(),
        vendor: document.getElementById('vendorName').value,
        invoiceNumber: document.getElementById('invoiceNumber').value,
        amount: parseFloat(document.getElementById('amount').value),
        date: document.getElementById('invoiceDate').value,
        timestamp: new Date().toISOString(),
        status: 'processed'
    };
    
    // Add to invoices array
    invoices.unshift(invoice);
    
    // Update stats
    stats.total++;
    stats.today++;
    stats.timesSaved += 15; // 15 minutes saved per invoice
    
    // Save to localStorage
    localStorage.setItem('invoices', JSON.stringify(invoices));
    localStorage.setItem('stats', JSON.stringify(stats));
    
    // Update UI
    updateStats();
    displayInvoices();
    
    // Close modal
    closePreview();
    
    // Show success message
    showNotification('Invoice processed successfully!');
}

// Update statistics display
function updateStats() {
    document.getElementById('totalCount').textContent = stats.total;
    document.getElementById('todayCount').textContent = stats.today;
    
    // Calculate hours saved
    const hours = Math.floor(stats.timesSaved / 60);
    const minutes = stats.timesSaved % 60;
    document.getElementById('savedTime').textContent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

// Display invoices
function displayInvoices() {
    const container = document.getElementById('invoiceItems');
    
    if (invoices.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #9CA3AF;">No invoices yet. Upload your first invoice!</p>';
        return;
    }
    
    container.innerHTML = invoices.slice(0, 5).map(invoice => `
        <div class="invoice-item">
            <div class="invoice-info">
                <h3>${invoice.vendor}</h3>
                <p>${invoice.invoiceNumber} • ${formatDate(invoice.date)}</p>
            </div>
            <div class="invoice-amount">$${invoice.amount.toFixed(2)}</div>
        </div>
    `).join('');
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #10B981;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 2000;
        animation: slideDown 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('ServiceWorker registered');
    }).catch(err => {
        console.log('ServiceWorker registration failed');
    });
}

// Install prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button after 5 seconds
    setTimeout(() => {
        if (deferredPrompt) {
            showInstallPrompt();
        }
    }, 5000);
});

function showInstallPrompt() {
    const prompt = document.createElement('div');
    prompt.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 20px;
        right: 20px;
        background: white;
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        z-index: 1000;
        text-align: center;
    `;
    prompt.innerHTML = `
        <h3 style="margin-bottom: 10px;">Install InvoiceFlow</h3>
        <p style="color: #6B7280; margin-bottom: 15px; font-size: 14px;">Add to home screen for quick access</p>
        <button onclick="installApp()" class="btn" style="margin-top: 0;">Install</button>
        <button onclick="this.parentElement.remove()" style="
            background: none;
            border: none;
            color: #6B7280;
            margin-top: 10px;
            cursor: pointer;
        ">Maybe later</button>
    `;
    document.body.appendChild(prompt);
}

function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            deferredPrompt = null;
        });
    }
}

// Reset stats daily
function resetDailyStats() {
    const lastReset = localStorage.getItem('lastReset');
    const today = new Date().toDateString();
    
    if (lastReset !== today) {
        stats.today = 0;
        localStorage.setItem('stats', JSON.stringify(stats));
        localStorage.setItem('lastReset', today);
    }
}

// Run daily reset check
resetDailyStats();
