let darkModeToggle = document.getElementById('darkModeToggle');
let brightnessSlider = document.getElementById('brightness');
let contrastSlider = document.getElementById('contrast');

// Initialize UI values
chrome.storage.sync.get(["darkMode", "brightness", "contrast"], function(result) {
    darkModeToggle.checked = result.darkMode || false;
    brightnessSlider.value = result.brightness || 100;
    contrastSlider.value = result.contrast || 100;
    updateFilters(result.brightness || 100, result.contrast || 100); // Apply saved filters
});

// Update dark mode on toggle change
darkModeToggle.addEventListener('change', function() {
    chrome.storage.sync.set({ darkMode: darkModeToggle.checked }, function() {
        toggleDarkMode(darkModeToggle.checked);
    });
});

// Update brightness on slider change
brightnessSlider.addEventListener('input', function() {
    chrome.storage.sync.set({ brightness: brightnessSlider.value }, function() {
        updateFilters(brightnessSlider.value, contrastSlider.value);
    });
});

// Update contrast on slider change
contrastSlider.addEventListener('input', function() {
    chrome.storage.sync.set({ contrast: contrastSlider.value }, function() {
        updateFilters(brightnessSlider.value, contrastSlider.value);
    });
});

// Function to update brightness and contrast filters
function updateFilters(brightness, contrast) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const url = tabs[0].url;
        if (!url.startsWith("chrome://")) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: applyFilters,
                args: [brightness, contrast]
            });
        } else {
            console.warn("Cannot apply filters to a chrome:// URL.");
        }
    });
}

// Function to apply the filters to the web page
function applyFilters(brightness, contrast) {
    document.body.style.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
}

// Function to toggle dark mode
function toggleDarkMode(isEnabled) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const url = tabs[0].url;
        if (!url.startsWith("chrome://")) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: (isEnabled) => {
                    if (isEnabled) {
                        document.body.style.filter = "invert(1) hue-rotate(180deg)";
                    } else {
                        document.body.style.filter = "none";
                    }
                },
                args: [isEnabled]
            });
        } else {
            console.warn("Cannot toggle dark mode on a chrome:// URL.");
        }
    });
}
