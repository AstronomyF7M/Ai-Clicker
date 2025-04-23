// script.js

// --- Game Variables ---
let score = 0;
let clickValue = 1;
let passiveIncome = 0; // Income per second

// --- DOM Elements ---
const scoreDisplay = document.getElementById('score');
const clickTarget = document.getElementById('click-target');
const shopButton = document.getElementById('shop-button');
const shopOverlay = document.getElementById('shop-overlay');
const shopContent = document.getElementById('shop-content'); // Needs to be overlay-content
const closeShopButton = document.getElementById('close-shop');
const shopItemsContainer = document.getElementById('shop-items');
const clickFeedbackElement = document.getElementById('click-feedback');
const aboutButton = document.querySelector('.menu-item.clickable:last-child'); // Assuming About is the last clickable menu item
const aboutOverlay = document.getElementById('about-overlay');
const closeAboutButton = document.getElementById('close-about');


// --- Shop Items Data ---
// Define items with their properties
const shopItems = [
    {
        id: 'upgrade1',
        name: 'Click Multiplier',
        description: '+1 Click Value',
        baseCost: 10,
        costMultiplier: 1.5,
        effect: 'increaseClickValue',
        currentLevel: 0,
        initialEffectAmount: 1
    },
    {
        id: 'upgrade2',
        name: 'Auto-Clicker',
        description: '+1 Passive Income/s',
        baseCost: 50,
        costMultiplier: 2,
        effect: 'increasePassiveIncome',
        currentLevel: 0,
        initialEffectAmount: 1
    }
    // Add more shop items here
];

// --- Game Logic ---

// Function to update the score display
function updateScoreDisplay() {
    scoreDisplay.textContent = Math.floor(score).toLocaleString(); // Use floor for whole numbers, format with commas
}

// Handle click event on the target
clickTarget.addEventListener('click', () => {
    const pointsGained = clickValue;
    score += pointsGained; // Add click value to score
    updateScoreDisplay(); // Update the display

    // --- Click Feedback Animation ---
    // Create a new feedback element on each click for a burst effect
    const feedback = document.createElement('div');
    feedback.classList.add('click-feedback-animation'); // Use a class for multiple animations
    feedback.textContent = `+${pointsGained}`; // Show points gained

    // Get click position relative to click target (optional, for more scattered effect)
    // const rect = clickTarget.getBoundingClientRect();
    // const x = event.clientX - rect.left;
    // const y = event.clientY - rect.top;
    // feedback.style.left = `${x}px`;
    // feedback.style.top = `${y}px`;

    clickTarget.appendChild(feedback); // Add to click target container

    // Use an animationend event to remove the element after animation
    feedback.addEventListener('animationend', () => {
        feedback.remove();
    });
});

// Function to render shop items
function renderShop() {
    shopItemsContainer.innerHTML = ''; // Clear current items

    shopItems.forEach(item => {
        const cost = Math.floor(item.baseCost * Math.pow(item.costMultiplier, item.currentLevel)); // Calculate cost
        const itemElement = document.createElement('div');
        itemElement.classList.add('shop-item');

        itemElement.innerHTML = `
            <div class="item-info">
                <h3>${item.name} (Lvl ${item.currentLevel})</h3>
                <p>${item.description}</p>
                <p>Cost: ${cost.toLocaleString()}</p>
            </div>
            <button class="buy-button clickable" data-item-id="${item.id}">Buy</button>
        `;

        // Add event listener to the buy button
        const buyButton = itemElement.querySelector('.buy-button');
        buyButton.addEventListener('click', () => buyItem(item.id));

        // Disable button if not enough score
        if (score < cost) {
            buyButton.disabled = true;
            buyButton.textContent = 'Too Poor!';
        }

        shopItemsContainer.appendChild(itemElement);
    });
}

// Function to handle buying an item
function buyItem(itemId) {
    const item = shopItems.find(i => i.id === itemId);
    if (!item) return; // Item not found

    const cost = Math.floor(item.baseCost * Math.pow(item.costMultiplier, item.currentLevel));

    if (score >= cost) {
        score -= cost; // Deduct cost
        item.currentLevel++; // Increase item level
        updateScoreDisplay(); // Update score display

        // Apply item effect
        applyItemEffect(item);

        // Re-render the shop to update costs and levels
        renderShop();
    } else {
        // Optional: Add visual feedback for insufficient funds
        console.log("Not enough score to buy!");
    }
}

// Function to apply item effects
function applyItemEffect(item) {
    switch (item.effect) {
        case 'increaseClickValue':
            // Click value increases by the initial effect amount for each level
            clickValue = 1 + (shopItems.find(i => i.id === 'upgrade1').currentLevel * item.initialEffectAmount);
            break;
        case 'increasePassiveIncome':
             // Passive income increases by the initial effect amount for each level
            passiveIncome = shopItems.find(i => i.id === 'upgrade2').currentLevel * item.initialEffectAmount;
            // Ensure passive income interval is running if not already
            if (!passiveIncomeInterval) {
                 startPassiveIncome();
            }
            break;
        // Add cases for other item effects
    }
}

// --- Passive Income ---
let passiveIncomeInterval = null;

function startPassiveIncome() {
    // Only start if passive income is positive and interval is not already running
    if (passiveIncome > 0 && !passiveIncomeInterval) {
        passiveIncomeInterval = setInterval(() => {
            score += passiveIncome; // Add passive income per second
            updateScoreDisplay(); // Update display
            // Re-render shop periodically to update button states based on new score
            renderShop();
        }, 1000); // 1000 milliseconds = 1 second
    }
}

function stopPassiveIncome() {
    if (passiveIncomeInterval) {
        clearInterval(passiveIncomeInterval);
        passiveIncomeInterval = null;
    }
}

// --- UI Toggles ---

// Function to show an overlay
function showOverlay(overlayElement) {
    // Hide other overlays if open
    document.querySelectorAll('.overlay').forEach(overlay => {
        if (overlay !== overlayElement) {
            overlay.classList.remove('visible');
        }
    });
     // Ensure shop is rendered before showing
    if(overlayElement === shopOverlay) {
       renderShop();
    }
    overlayElement.classList.add('visible');
}

// Function to hide an overlay
function hideOverlay(overlayElement) {
    overlayElement.classList.remove('visible');
    // Optional: Delay rendering shop until it's shown again for performance if shop is complex
}


// Event listeners for menu buttons
shopButton.addEventListener('click', () => showOverlay(shopOverlay));
closeShopButton.addEventListener('click', () => hideOverlay(shopOverlay));

// Example for About button (assuming it's the last clickable menu item)
aboutButton.addEventListener('click', () => showOverlay(aboutOverlay));
closeAboutButton.addEventListener('click', () => hideOverlay(aboutOverlay));


// Hide overlays if clicked outside their content (optional)
shopOverlay.addEventListener('click', (event) => {
    // Check if the click was directly on the overlay, not its content
    if (event.target === shopOverlay) {
        hideOverlay(shopOverlay);
    }
});

aboutOverlay.addEventListener('click', (event) => {
    if (event.target === aboutOverlay) {
        hideOverlay(aboutOverlay);
    }
});


// --- Initial Setup ---
// Initialize the game state
updateScoreDisplay(); // Set initial score display

// Add a class for click feedback animation styles defined in CSS
// This approach is better than manipulating the single #click-feedback element directly for bursts
const style = document.createElement('style');
style.innerHTML = `
.click-feedback-animation {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%); /* Start centered */
    font-size: 1.5em; /* Smaller initial size */
    color: yellow;
    text-shadow: 2px 2px #000;
    pointer-events: none;
    opacity: 1;
    animation: fade-up-and-scale 0.8s ease-out forwards; /* Apply animation */
    white-space: nowrap; /* Prevent wrapping */
    z-index: 5; /* Ensure feedback is above target */
}

@keyframes fade-up-and-scale {
    0% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1); /* Start centered at normal size */
    }
    100% {
        opacity: 0;
        transform: translate(-50%, -150%) scale(1.5); /* Move up and enlarge */
    }
}
`;
document.head.appendChild(style);

// Initially render the shop (but it will be hidden by CSS)
renderShop();

// Start the passive income loop if there is any passive income (though initially it's 0)
// This call isn't strictly necessary initially as passiveIncome is 0,
// but it's good practice if passive income could start > 0 from a save state.
// The applyItemEffect function for Auto-Clicker will call startPassiveIncome when needed.
// startPassiveIncome(); // Keeping this commented out as applyItemEffect handles starting it
