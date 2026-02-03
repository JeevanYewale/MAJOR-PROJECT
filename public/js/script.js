// TravelStay - Main JavaScript File

document.addEventListener('DOMContentLoaded', function() {
  console.log('TravelStay loaded successfully!');
  
  // Initialize all components
  initializeNavigation();
  initializeSearch();
  initializeFavorites();
  initializeImageLazyLoading();
  initializeTooltips();
  initializeAlerts();
});

// Navigation functionality
function initializeNavigation() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  
  // Add scroll effect to navbar
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      navbar.classList.add('navbar-scrolled');
    } else {
      navbar.classList.remove('navbar-scrolled');
    }
  });
  
  // Mobile menu toggle
  const navbarToggler = document.querySelector('.navbar-toggler');
  const navbarCollapse = document.querySelector('.navbar-collapse');
  
  if (navbarToggler && navbarCollapse) {
    navbarToggler.addEventListener('click', function() {
      navbarCollapse.classList.toggle('show');
    });
  }
}

// Search functionality
function initializeSearch() {
  const searchForm = document.querySelector('.search-form');
  if (!searchForm) return;
  
  const checkinInput = searchForm.querySelector('input[name="checkIn"]');
  const checkoutInput = searchForm.querySelector('input[name="checkOut"]');
  
  if (checkinInput && checkoutInput) {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    checkinInput.min = today;
    checkoutInput.min = today;
    
    // Update checkout minimum when checkin changes
    checkinInput.addEventListener('change', function() {
      checkoutInput.min = this.value;
      if (checkoutInput.value && checkoutInput.value <= this.value) {
        checkoutInput.value = '';
      }
    });
  }
  
  // Location autocomplete (basic implementation)
  const locationInput = searchForm.querySelector('input[name="location"]');
  if (locationInput) {
    const popularDestinations = [
      'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad',
      'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur',
      'Goa', 'Kerala', 'Rajasthan', 'Kashmir', 'Himachal Pradesh'
    ];
    
    locationInput.addEventListener('input', function() {
      const value = this.value.toLowerCase();
      if (value.length < 2) return;
      
      // Simple autocomplete logic
      const suggestions = popularDestinations.filter(dest => 
        dest.toLowerCase().includes(value)
      );
      
      // You can implement a dropdown here
      console.log('Suggestions:', suggestions);
    });
  }
}

// Favorites functionality
function initializeFavorites() {
  const favoriteButtons = document.querySelectorAll('.favorite-btn');
  
  favoriteButtons.forEach(btn => {
    btn.addEventListener('click', async function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      if (!window.currentUser) {
        showAlert('Please log in to save favorites', 'warning');
        return;
      }
      
      const listingId = this.dataset.listingId;
      const icon = this.querySelector('i');
      
      // Optimistic UI update
      const wasActive = this.classList.contains('active');
      this.classList.toggle('active');
      icon.classList.toggle('far');
      icon.classList.toggle('fas');
      
      try {
        const response = await fetch(`/listings/${listingId}/favorite`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        if (data.success) {
          showAlert(
            data.isFavorite ? 'Added to favorites!' : 'Removed from favorites!',
            'success'
          );
        } else {
          throw new Error(data.error || 'Failed to update favorite');
        }
      } catch (error) {
        console.error('Error toggling favorite:', error);
        
        // Revert optimistic update
        this.classList.toggle('active');
        icon.classList.toggle('far');
        icon.classList.toggle('fas');
        
        showAlert('Failed to update favorite. Please try again.', 'error');
      }
    });
  });
}

// Image lazy loading
function initializeImageLazyLoading() {
  const images = document.querySelectorAll('img[loading="lazy"]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  }
}

// Initialize Bootstrap tooltips
function initializeTooltips() {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }
}

// Auto-dismiss alerts
function initializeAlerts() {
  const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
  
  alerts.forEach(alert => {
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      if (alert && alert.parentNode) {
        alert.style.opacity = '0';
        alert.style.transform = 'translateY(-20px)';
        setTimeout(() => {
          if (alert.parentNode) {
            alert.remove();
          }
        }, 300);
      }
    }, 5000);
  });
}

// Utility function to show alerts
function showAlert(message, type = 'info') {
  const alertContainer = document.querySelector('.container') || document.body;
  
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.style.position = 'fixed';
  alertDiv.style.top = '20px';
  alertDiv.style.right = '20px';
  alertDiv.style.zIndex = '9999';
  alertDiv.style.minWidth = '300px';
  
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  document.body.appendChild(alertDiv);
  
  // Auto-remove after 4 seconds
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove();
    }
  }, 4000);
}

// Form validation helpers
function validateForm(form) {
  const requiredFields = form.querySelectorAll('[required]');
  let isValid = true;
  
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      field.classList.add('is-invalid');
      isValid = false;
    } else {
      field.classList.remove('is-invalid');
    }
  });
  
  return isValid;
}

// Price formatting
function formatPrice(price, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(price);
}

// Date formatting
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Loading state management
function showLoading(element) {
  if (element) {
    element.classList.add('loading');
    element.disabled = true;
  }
}

function hideLoading(element) {
  if (element) {
    element.classList.remove('loading');
    element.disabled = false;
  }
}

// Export functions for use in other scripts
window.TravelStay = {
  showAlert,
  validateForm,
  formatPrice,
  formatDate,
  showLoading,
  hideLoading
};

// Add some CSS for loading states and animations
const style = document.createElement('style');
style.textContent = `
  .navbar-scrolled {
    background-color: rgba(255, 255, 255, 0.95) !important;
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  
  .loading {
    position: relative;
    pointer-events: none;
  }
  
  .loading::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    margin: -10px 0 0 -10px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .fade-in {
    animation: fadeIn 0.5s ease-in;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .is-invalid {
    border-color: #dc3545 !important;
  }
`;
document.head.appendChild(style);