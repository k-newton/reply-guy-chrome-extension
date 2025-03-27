/**
 * Reply Guy - Chrome Extension Popup
 * Last modified: March 14, 2025, 14:00
 * 
 * Changes:
 * - Enhanced error handling with try/catch blocks
 * - Improved validation for numeric inputs
 * - Better user feedback for settings changes
 * - Clean separation of concerns with discrete functions
 */

document.addEventListener('DOMContentLoaded', function() {
  // Get UI element references
  const enableFilterCheckbox = document.getElementById('enableFilter');
  const maxAgeSelect = document.getElementById('maxAge');
  const enableFollowerFilterCheckbox = document.getElementById('enableFollowerFilter');
  const minFollowersInput = document.getElementById('minFollowers');
  const followerContainer = document.getElementById('followerContainer');
  const statusElement = document.getElementById('status');
  
  // Initialize UI
  initializeUI();
  
  // Add event listeners for settings changes
  setupEventListeners();
  
  /**
   * Initialize the UI with saved settings
   */
  function initializeUI() {
    chrome.storage.sync.get({
      enabled: true,
      maxAge: 120,
      followerFilterEnabled: false,
      minFollowers: 2000
    }, function(items) {
      try {
        console.log('Loading saved settings:', items);
        
        // Apply loaded settings to UI
        enableFilterCheckbox.checked = items.enabled !== false;
        maxAgeSelect.value = String(items.maxAge || '120');
        enableFollowerFilterCheckbox.checked = items.followerFilterEnabled === true;
        minFollowersInput.value = String(items.minFollowers || '2000');
        
        // Show/hide follower input based on checkbox state
        updateFollowerInputVisibility();
      } catch (error) {
        console.error('Error loading settings:', error);
        showSaveError('Failed to load settings. Using defaults.');
        
        // Use defaults
        enableFilterCheckbox.checked = true;
        maxAgeSelect.value = '120';
        enableFollowerFilterCheckbox.checked = false;
        minFollowersInput.value = '2000';
        updateFollowerInputVisibility();
      }
    });
  }
  
  /**
   * Set up event listeners for all UI elements
   */
  function setupEventListeners() {
    // Main filter toggle
    enableFilterCheckbox.addEventListener('change', function() {
      saveSettings();
    });
    
    // Time threshold dropdown
    maxAgeSelect.addEventListener('change', function() {
      saveSettings();
    });
    
    // Follower filter toggle
    enableFollowerFilterCheckbox.addEventListener('change', function() {
      updateFollowerInputVisibility();
      saveSettings();
    });
    
    // Minimum follower count input
    minFollowersInput.addEventListener('change', function() {
      validateAndSaveFollowerCount();
    });
    
    // Also validate on input to provide immediate feedback
    minFollowersInput.addEventListener('input', function() {
      // Only validate on input, don't save yet (save on change event)
      validateFollowerCount();
    });
  }
  
  /**
   * Toggle follower input visibility based on checkbox state
   */
  function updateFollowerInputVisibility() {
    followerContainer.style.display = enableFollowerFilterCheckbox.checked ? 'block' : 'none';
  }
  
  /**
   * Validate follower count is a positive number
   */
  function validateFollowerCount() {
    const value = minFollowersInput.value.trim();
    const numericValue = parseInt(value);
    
    if (value === '' || isNaN(numericValue) || numericValue < 0) {
      minFollowersInput.style.borderColor = '#F4212E';
      return false;
    } else {
      minFollowersInput.style.borderColor = '#CFD9DE';
      return true;
    }
  }
  
  /**
   * Validate follower count and save if valid
   */
  function validateAndSaveFollowerCount() {
    if (validateFollowerCount()) {
      const value = parseInt(minFollowersInput.value.trim());
      minFollowersInput.value = String(value); // Clean up display
      saveSettings();
    } else {
      // Fix invalid input
      minFollowersInput.value = '0';
      saveSettings();
    }
  }
  
  /**
   * Save all settings to Chrome storage
   */
  function saveSettings() {
    try {
      const settings = {
        enabled: enableFilterCheckbox.checked,
        maxAge: parseInt(maxAgeSelect.value),
        followerFilterEnabled: enableFollowerFilterCheckbox.checked,
        minFollowers: parseInt(minFollowersInput.value)
      };
      
      console.log('Saving settings:', settings);
      
      chrome.storage.sync.set(settings, function() {
        if (chrome.runtime.lastError) {
          showSaveError(chrome.runtime.lastError.message);
        } else {
          showSaveStatus();
        }
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      showSaveError('Failed to save settings');
    }
  }
  
  /**
   * Show success message
   */
  function showSaveStatus() {
    statusElement.textContent = 'Settings saved!';
    statusElement.style.opacity = '1';
    statusElement.style.backgroundColor = '#E8F5FD';
    statusElement.style.color = '#1D9BF0';
    
    // Hide message after a delay
    setTimeout(() => {
      statusElement.style.opacity = '0';
    }, 1500);
  }
  
  /**
   * Show error message
   */
  function showSaveError(message = 'Error saving settings!') {
    statusElement.textContent = message;
    statusElement.style.opacity = '1';
    statusElement.style.backgroundColor = '#FFEBED';
    statusElement.style.color = '#F4212E';
    
    // Hide message after a longer delay
    setTimeout(() => {
      statusElement.style.opacity = '0';
    }, 3000);
  }
});