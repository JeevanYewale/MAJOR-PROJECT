// ===== GLOBAL VARIABLES =====
let listingPageInitialized = false;

// ===== UTILITY FUNCTIONS =====
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ===== MAIN INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
  // Initialize global features
  initGlobalFeatures();
  
  // Initialize listing page if we're on it
  if (window.listingData && !listingPageInitialized) {
    initListingPage();
    listingPageInitialized = true;
  }
});

// ===== GLOBAL FEATURES =====
function initGlobalFeatures() {
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

  // Enhanced card hover effects
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-8px)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });

  // Bootstrap tooltip initialization
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
}

// ===== LISTING PAGE FUNCTIONALITY =====
function initListingPage() {
  console.log('Initializing listing page...');
  
  // Initialize all listing page components
  setupAmenityToggle();
  setupReviewSorting();
  setupFavoriteButton();
  setupReviewForm();
  setupDeleteConfirmations();
  setupCharacterCounter();
  setupDateInputs();
  setupShareButton();
  setupImageGallery();
  setupScrollEffects();
  setupBookingForm();
}

// ===== AMENITY TOGGLE FUNCTIONALITY =====
function setupAmenityToggle() {
  const toggleBtn = document.getElementById('toggle-amenities');
  const hiddenAmenities = document.getElementById('hidden-amenities');
  const amenitiesText = document.getElementById('amenities-text');
  const amenitiesIcon = document.getElementById('amenities-icon');
  
  if (!toggleBtn || !hiddenAmenities) return;

  let isExpanded = false;
  
  toggleBtn.addEventListener('click', function() {
    isExpanded = !isExpanded;
    
    if (isExpanded) {
      hiddenAmenities.classList.remove('d-none');
      if (amenitiesText) amenitiesText.textContent = 'Show less amenities';
      if (amenitiesIcon) {
        amenitiesIcon.classList.replace('fa-chevron-down', 'fa-chevron-up');
      }
      
      // Smooth reveal animation
      hiddenAmenities.style.opacity = '0';
      hiddenAmenities.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        hiddenAmenities.style.transition = 'all 0.3s ease';
        hiddenAmenities.style.opacity = '1';
        hiddenAmenities.style.transform = 'translateY(0)';
      }, 10);
    } else {
      hiddenAmenities.style.transition = 'all 0.3s ease';
      hiddenAmenities.style.opacity = '0';
      hiddenAmenities.style.transform = 'translateY(-10px)';
      
      setTimeout(() => {
        hiddenAmenities.classList.add('d-none');
      }, 300);
      
      if (amenitiesText) {
        const totalAmenities = document.querySelectorAll('.amenity-item').length;
        amenitiesText.textContent = `Show all ${totalAmenities} amenities`;
      }
      if (amenitiesIcon) {
        amenitiesIcon.classList.replace('fa-chevron-up', 'fa-chevron-down');
      }
    }
  });
}

// ===== REVIEW SORTING FUNCTIONALITY =====
function setupReviewSorting() {
  const sortSelect = document.getElementById('review-sort');
  const modalSortSelect = document.getElementById('modal-review-sort');
  
  [sortSelect, modalSortSelect].forEach(select => {
    if (!select) return;
    
    select.addEventListener('change', function(e) {
      const isModal = e.target.id.includes('modal');
      sortReviews(e.target.value, isModal);
    });
  });
}

function sortReviews(sortBy, isModal = false) {
  const container = isModal ? 
    document.getElementById('modal-reviews-container') : 
    document.getElementById('reviews-list');
  
  if (!container) return;

  const reviews = Array.from(container.children);
  
  reviews.sort((a, b) => {
    const aRating = parseInt(a.dataset.rating) || 0;
    const bRating = parseInt(b.dataset.rating) || 0;
    const aDate = new Date(a.dataset.date);
    const bDate = new Date(b.dataset.date);
    
    switch(sortBy) {
      case 'newest':
        return bDate - aDate;
      case 'oldest':
        return aDate - bDate;
      case 'highest':
        return bRating - aRating;
      case 'lowest':
        return aRating - bRating;
      default:
        return 0;
    }
  });
  
  // Animate the sorting
  container.style.opacity = '0.5';
  setTimeout(() => {
    reviews.forEach(review => container.appendChild(review));
    container.style.opacity = '1';
  }, 150);
}

// ===== FAVORITE BUTTON FUNCTIONALITY =====
function setupFavoriteButton() {
  const favoriteBtn = document.getElementById('favorite-btn');
  if (!favoriteBtn) return;

  favoriteBtn.addEventListener('click', async function() {
    try {
      const listingId = this.dataset.listingId;
      const icon = this.querySelector('i');
      
      // Optimistic UI update
      const wasActive = this.classList.contains('favorited');
      
      if (wasActive) {
        icon.classList.replace('fas', 'far');
        this.classList.remove('favorited');
        this.setAttribute('aria-label', 'Add to favorites');
      } else {
        icon.classList.replace('far', 'fas');
        this.classList.add('favorited');
        this.setAttribute('aria-label', 'Remove from favorites');
      }
      
      // Add animation
      icon.style.transform = 'scale(1.3)';
      setTimeout(() => {
        icon.style.transform = 'scale(1)';
      }, 200);

      // API call (you'll need to implement this endpoint)
      const response = await fetch(`/api/listings/${listingId}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (!response.ok) {
        // Revert on error
        if (wasActive) {
          icon.classList.replace('far', 'fas');
          this.classList.add('favorited');
          this.setAttribute('aria-label', 'Remove from favorites');
        } else {
          icon.classList.replace('fas', 'far');
          this.classList.remove('favorited');
          this.setAttribute('aria-label', 'Add to favorites');
        }
        throw new Error('Failed to update favorite status');
      }
      
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // You might want to show a toast notification here
    }
  });
}

// ===== REVIEW FORM ENHANCEMENTS =====
function setupReviewForm() {
  const form = document.getElementById('review-form');
  if (!form) return;

  const nameInput = document.getElementById('reviewer-name');
  const commentInput = document.getElementById('review-comment');
  const starInputs = document.querySelectorAll('.star-rating input');
  const starLabels = document.querySelectorAll('.star-rating .star-label');
  const submitBtn = document.getElementById('submit-review-btn');
  
  // Real-time validation with debounce
  const debouncedValidation = debounce(validateReviewForm, 300);
  
  [nameInput, commentInput].forEach(input => {
    if (!input) return;
    
    input.addEventListener('input', debouncedValidation);
    
    // Visual feedback
    input.addEventListener('focus', function() {
      this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
      this.parentElement.classList.remove('focused');
    });
  });

  // Enhanced star rating interaction
  starLabels.forEach((label, index) => {
    label.addEventListener('mouseenter', function() {
      highlightStars(index + 1);
      // Add subtle animation
      this.style.transform = 'scale(1.1)';
    });
    
    label.addEventListener('mouseleave', function() {
      const checkedStar = document.querySelector('.star-rating input:checked');
      highlightStars(checkedStar ? parseInt(checkedStar.value) : 0);
      this.style.transform = 'scale(1)';
    });
    
    // Accessibility: keyboard navigation
    label.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        starInputs[index].click();
      }
    });
  });

  starInputs.forEach((input, index) => {
    input.addEventListener('change', function() {
      highlightStars(parseInt(this.value));
      validateReviewForm();
      
      // Success animation
      starLabels[index].style.transform = 'scale(1.2)';
      setTimeout(() => {
        starLabels[index].style.transform = 'scale(1)';
      }, 200);
    });
  });

  // Enhanced form submission
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!validateReviewForm()) {
      // Shake invalid fields
      const invalidFields = form.querySelectorAll('.is-invalid');
      invalidFields.forEach(field => {
        field.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
          field.style.animation = '';
        }, 500);
      });
      return;
    }
    
    await submitReview(form);
  });
}

function highlightStars(count, animate = false) {
  const labels = document.querySelectorAll('.star-rating .star-label');
  labels.forEach((label, index) => {
    const shouldHighlight = index < count;
    label.style.color = shouldHighlight ? '#ffc107' : '#ddd';
    
    if (animate && shouldHighlight) {
      label.style.transform = 'scale(1.1)';
      setTimeout(() => {
        label.style.transform = 'scale(1)';
      }, 100);
    }
  });
}

function validateReviewForm() {
  const form = document.getElementById('review-form');
  const nameInput = document.getElementById('reviewer-name');
  const commentInput = document.getElementById('review-comment');
  const ratingInput = document.querySelector('.star-rating input:checked');
  const submitBtn = document.getElementById('submit-review-btn');
  
  let isValid = true;
  
  // Validate name
  if (nameInput) {
    const nameValue = nameInput.value.trim();
    if (nameValue.length < 2 || nameValue.length > 100) {
      nameInput.classList.add('is-invalid');
      nameInput.classList.remove('is-valid');
      isValid = false;
    } else {
      nameInput.classList.remove('is-invalid');
      nameInput.classList.add('is-valid');
    }
  }
  
  // Validate comment
  if (commentInput) {
    const commentValue = commentInput.value.trim();
    if (commentValue.length < 5 || commentValue.length > 500) {
      commentInput.classList.add('is-invalid');
      commentInput.classList.remove('is-valid');
      isValid = false;
    } else {
      commentInput.classList.remove('is-invalid');
      commentInput.classList.add('is-valid');
    }
  }
  
  // Validate rating
  const starContainer = document.querySelector('.star-rating');
  if (!ratingInput) {
    if (starContainer) starContainer.classList.add('is-invalid');
    isValid = false;
  } else {
    if (starContainer) starContainer.classList.remove('is-invalid');
  }
  
  // Update submit button
  if (submitBtn) {
    submitBtn.disabled = !isValid;
    submitBtn.classList.toggle('btn-success', isValid);
    submitBtn.classList.toggle('btn-secondary', !isValid);
  }
  
  return isValid;
}

async function submitReview(form) {
  const submitBtn = document.getElementById('submit-review-btn');
  const submitText = submitBtn.querySelector('.submit-text');
  const submitLoading = submitBtn.querySelector('.submit-loading');
  
  // Show loading state
  submitText.classList.add('d-none');
  submitLoading.classList.remove('d-none');
  submitBtn.disabled = true;
  
  try {
    const formData = new FormData(form);
    const response = await fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    if (response.ok) {
      // Success animation
      submitBtn.innerHTML = '<i class="fas fa-check me-2"></i>Success!';
      submitBtn.classList.replace('btn-primary', 'btn-success');
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      throw new Error('Failed to submit review');
    }
  } catch (error) {
    console.error('Error submitting review:', error);
    
    // Error state
    submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>Try Again';
    submitBtn.classList.replace('btn-primary', 'btn-danger');
    
    setTimeout(() => {
      submitText.classList.remove('d-none');
      submitLoading.classList.add('d-none');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span class="submit-text">Submit Review</span><span class="submit-loading d-none"><span class="spinner-border spinner-border-sm me-2"></span>Submitting...</span>';
      submitBtn.classList.replace('btn-danger', 'btn-primary');
    }, 2000);
  }
}

// ===== CHARACTER COUNTER =====
function setupCharacterCounter() {
  const commentInput = document.getElementById('review-comment');
  const charCount = document.getElementById('char-count');
  
  if (!commentInput || !charCount) return;
  
  const updateCounter = () => {
    const count = commentInput.value.length;
    charCount.textContent = count;
    
    // Color coding
    if (count > 450) {
      charCount.style.color = '#dc3545';
      charCount.style.fontWeight = '600';
    } else if (count > 400) {
      charCount.style.color = '#ffc107';
      charCount.style.fontWeight = '500';
    } else {
      charCount.style.color = '#6c757d';
      charCount.style.fontWeight = '400';
    }
    
    // Progress animation
    const progress = Math.min(count / 500, 1);
    charCount.style.transform = `scale(${1 + progress * 0.1})`;
  };
  
  commentInput.addEventListener('input', updateCounter);
  
  // Initialize counter
  updateCounter();
}

// ===== DELETE CONFIRMATIONS =====
function setupDeleteConfirmations() {
  const deleteReviewBtns = document.querySelectorAll('.delete-review-btn');
  const deleteReviewForm = document.getElementById('delete-review-form');
  
  deleteReviewBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const reviewId = this.dataset.reviewId;
      const listingId = this.dataset.listingId;
      
      if (deleteReviewForm) {
        deleteReviewForm.action = `/listings/${listingId}/reviews/${reviewId}`;
      }
      
      const modal = new bootstrap.Modal(document.getElementById('deleteReviewModal'));
      modal.show();
    });
  });
}

// ===== DATE INPUTS SETUP =====
function setupDateInputs() {
  const checkIn = document.getElementById('check-in');
  const checkOut = document.getElementById('check-out');
  
  if (!checkIn || !checkOut) return;
  
  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];
  checkIn.setAttribute('min', today);
  
  checkIn.addEventListener('change', function() {
    // Set checkout minimum to day after checkin
    const checkInDate = new Date(this.value);
    checkInDate.setDate(checkInDate.getDate() + 1);
    checkOut.setAttribute('min', checkInDate.toISOString().split('T')[0]);
    
    // Clear checkout if it's before new minimum
    if (checkOut.value && new Date(checkOut.value) <= new Date(this.value)) {
      checkOut.value = '';
    }
    
    // Update price calculation (placeholder)
    updatePriceCalculation();
  });
  
  checkOut.addEventListener('change', updatePriceCalculation);
}

function updatePriceCalculation() {
  const checkIn = document.getElementById('check-in');
  const checkOut = document.getElementById('check-out');
  
  if (!checkIn.value || !checkOut.value) return;
  
  const checkInDate = new Date(checkIn.value);
  const checkOutDate = new Date(checkOut.value);
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  
  if (nights > 0) {
    // You can implement price calculation here
    console.log(`Selected ${nights} nights`);
  }
}

// ===== SHARE FUNCTIONALITY =====
function setupShareButton() {
  const shareBtn = document.getElementById('share-btn');
  if (!shareBtn) return;
  
  shareBtn.addEventListener('click', async function() {
    const url = window.location.href;
    const title = window.listingData?.title || document.title;
    
    // Add click animation
    this.style.transform = 'scale(0.95)';
    setTimeout(() => {
      this.style.transform = 'scale(1)';
    }, 150);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: url,
          text: `Check out this amazing place: ${title}`
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          copyToClipboard(url);
        }
      }
    } else {
      copyToClipboard(url);
    }
  });
}

function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Link copied to clipboard!', 'success');
    }).catch(() => {
      fallbackCopyToClipboard(text);
    });
  } else {
    fallbackCopyToClipboard(text);
  }
}

function fallbackCopyToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
    showToast('Link copied to clipboard!', 'success');
  } catch (err) {
    showToast('Failed to copy link', 'error');
  }
  
  document.body.removeChild(textArea);
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'info') {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'primary'} border-0`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  
  // Add to page
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(toastContainer);
  }
  
  toastContainer.appendChild(toast);
  
  // Initialize and show
  const bsToast = new bootstrap.Toast(toast);
  bsToast.show();
  
  // Clean up after hiding
  toast.addEventListener('hidden.bs.toast', () => {
    toast.remove();
  });
}

// ===== IMAGE GALLERY ENHANCEMENTS =====
function setupImageGallery() {
  const mainImage = document.querySelector('.main-image');
  if (!mainImage) return;
  
  // Add click to zoom functionality
  mainImage.addEventListener('click', function() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content bg-transparent border-0">
          <div class="modal-body p-0">
            <button type="button" class="btn-close btn-close-white position-absolute top-0 end-0 m-3" data-bs-dismiss="modal" style="z-index: 1050;"></button>
            <img src="${this.src}" class="img-fluid w-100 rounded" alt="${this.alt}">
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    modal.addEventListener('hidden.bs.modal', () => {
      modal.remove();
    });
  });
  
  // Add cursor pointer to indicate clickability
  mainImage.style.cursor = 'pointer';
  mainImage.title = 'Click to view full size';
}

// ===== SCROLL EFFECTS =====
function setupScrollEffects() {
  // Smooth reveal animations for elements
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observe elements for scroll animations
  const animateElements = document.querySelectorAll('.amenities-section, .reviews-section, .booking-card, .host-card');
  animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
  });
}

// ===== BOOKING FORM ENHANCEMENTS =====
function setupBookingForm() {
  const bookingForm = document.querySelector('.booking-form');
  if (!bookingForm) return;
  
  const reserveBtn = bookingForm.querySelector('.btn-primary');
  
  if (reserveBtn) {
    reserveBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Add click animation
      this.style.transform = 'scale(0.98)';
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 150);
      
      // Placeholder for booking functionality
      alert('Booking system coming soon! This will redirect to a payment page.');
    });
  }
}

// ===== GOOGLE MAPS INTEGRATION =====
function initMap() {
  const loadMapBtn = document.getElementById('load-map');
  
  if (loadMapBtn) {
    loadMapBtn.addEventListener('click', function() {
      if (!window.google || !window.listingData) {
        showToast('Maps failed to load. Please try again later.', 'error');
        return;
      }
      
      const mapContainer = document.getElementById('map');
      const mapPlaceholder = document.getElementById('map-placeholder');
      
      if (!mapContainer || !mapPlaceholder) return;
      
      // Hide placeholder and show map
      mapPlaceholder.classList.add('d-none');
      mapContainer.classList.remove('d-none');
      
      // Initialize map
      const map = new google.maps.Map(mapContainer, {
        zoom: 13,
        center: window.listingData.coordinates,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });
      
      // Add marker
      const marker = new google.maps.Marker({
        position: window.listingData.coordinates,
        map: map,
        title: window.listingData.title,
        animation: google.maps.Animation.DROP
      });
      
      // Add click listener to marker
      marker.addListener('click', () => {
        const infoWindow = new google.maps.InfoWindow({
          content: `<div class="p-2"><strong>${window.listingData.title}</strong><br>${window.listingData.location}, ${window.listingData.country}</div>`
        });
        infoWindow.open(map, marker);
      });
      
      // Remove the load button
      this.remove();
    });
  }
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', function(e) {
  // Escape key to close modals
  if (e.key === 'Escape') {
    const openModals = document.querySelectorAll('.modal.show');
    openModals.forEach(modal => {
      const bsModal = bootstrap.Modal.getInstance(modal);
      if (bsModal) bsModal.hide();
    });
  }
  
  // Ctrl/Cmd + K to focus on search (if you have one)
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const searchInput = document.querySelector('input[type="search"]');
    if (searchInput) searchInput.focus();
  }
});

// ===== ERROR HANDLING =====
window.addEventListener('error', function(e) {
  console.error('Global error:', e.error);
  // You might want to send this to an error tracking service
});

// ===== PERFORMANCE MONITORING =====
window.addEventListener('load', function() {
  // Monitor page load performance
  if ('performance' in window) {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    console.log(`Page loaded in ${loadTime}ms`);
  }
});

// Add shake animation keyframes to CSS if not already present
if (!document.querySelector('#shake-keyframes')) {
  const style = document.createElement('style');
  style.id = 'shake-keyframes';
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(style);
}
