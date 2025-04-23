// script.js

// --- Game Variables ---
let score = 0;
let clickValue = 1;
let passiveIncome = 0; // Income per second
let totalClicks = 0; // Track total clicks for achievements
let totalSpent = 0; // Track total score spent for achievements
let feverModeActive = false;
let feverModeEndTime = 0;
const FEVER_MODE_DURATION = 10; // seconds
const FEVER_MODE_CLICK_MULTIPLIER = 5; // Click value multiplier during fever mode
const FEVER_MODE_PASSIVE_MULTIPLIER = 2; // Passive income multiplier during fever mode


// --- DOM Elements ---
const scoreDisplay = document.getElementById('score');
const clickTarget = document.getElementById('click-target');
const feedbackContainer = document.getElementById('feedback-container'); // Container for particles
const shopButton = document.getElementById('shop-button');
const shopOverlay = document.getElementById('shop-overlay');
const closeShopButton = document.getElementById('close-shop');
const shopItemsContainer = document.getElementById('shop-items');
const achievementsButton = document.getElementById('achievements-button');
const achievementsOverlay = document.getElementById('achievements-overlay');
const closeAchievementsButton = document.getElementById('close-achievements');
const achievementListContainer = document.getElementById('achievement-list');
const achievementNotification = document.getElementById('achievement-notification');
const notificationText = document.getElementById('notification-text');
const aboutButton = document.querySelector('#top-menu .menu-item.clickable:last-child'); // Assuming About is the last clickable menu item in top-menu
const aboutOverlay = document.getElementById('about-overlay');
const closeAboutButton = document.getElementById('close-about');


// --- Shop Items Data ---
const shopItems = [
    {
        id: 'clickUpgrade1',
        name: 'Finger Strength',
        description: '+1 Click Value',
        baseCost: 10,
        costMultiplier: 1.5,
        effect: 'increaseClickValue',
        initialEffectAmount: 1,
        currentLevel: 0
    },
    {
        id: 'clickUpgrade2',
        name: 'Click Mastery',
        description: '+5 Click Value',
        baseCost: 100,
        costMultiplier: 1.8,
        effect: 'increaseClickValue',
        initialEffectAmount: 5, // This item adds 5 per level
        currentLevel: 0
    },
     {
        id: 'passiveUpgrade1',
        name: 'Tiny Bot',
        description: '+1 Passive Income/s',
        baseCost: 50,
        costMultiplier: 1.7,
        effect: 'increasePassiveIncome',
        initialEffectAmount: 1,
        currentLevel: 0
    },
    {
        id: 'passiveUpgrade2',
        name: 'Worker Drone',
        description: '+5 Passive Income/s',
        baseCost: 300,
        costMultiplier: 2,
        effect: 'increasePassiveIncome',
        initialEffectAmount: 5,
        currentLevel: 0
    },
    {
        id: 'feverUnlock',
        name: 'Hyper Click Module',
        description: 'Unlocks Fever Mode',
        baseCost: 1000,
        costMultiplier: 1, // No cost increase for this type of item, maybe only one purchase
        effect: 'unlockFeverMode',
        initialEffectAmount: 0, // No numerical effect value
        currentLevel: 0,
        maxLevel: 1 // Can only buy once
    }
    // Add more diverse items:
    // - Items that increase click value AND passive income
    // - Items that decrease cost multiplier for other items
    // - Items that grant a one-time large score boost
    // - Items that increase particle count/effect
];

// --- Achievements Data ---
const achievements = [
    {
        id: 'firstClick',
        name: 'First Click!',
        description: 'Click the target for the first time.',
        condition: 'totalClicks', // Condition type
        threshold: 1, // Value to reach
        unlocked: false
    },
    {
        id: 'reach100Score',
        name: 'Score Master I',
        description: 'Reach a score of 100.',
        condition: 'score',
        threshold: 100,
        unlocked: false
    },
     {
        id: 'buyFirstItem',
        name: 'First Purchase',
        description: 'Buy your first item from the shop.',
        condition: 'totalSpent',
        threshold: 1, // Check if total spent is > 0 (or count purchases) - tracking totalSpent is easier
        unlocked: false
    },
    {
        id: 'clicks100',
        name: 'Clicker Rookie',
        description: 'Perform 100 clicks.',
        condition: 'totalClicks',
        threshold: 100,
        unlocked: false
    },
     {
        id: 'passiveIncome5',
        name: 'Automation Beginner',
        description: 'Reach 5 passive income per second.',
        condition: 'passiveIncome',
        threshold: 5,
        unlocked: false
    },
     {
        id: 'feverUsed',
        name: 'Feeling Hyper!',
        description: 'Activate Fever Mode for the first time.',
        condition: 'feverModeTriggered', // Custom condition flag
        threshold: 1,
        unlocked: false
    }
    // Add more achievements
];

// --- Game Logic ---

// Function to update the score display
function updateScoreDisplay() {
    scoreDisplay.textContent = Math.floor(score).toLocaleString();
    checkAchievements('score', score); // Check score-based achievements
}

// Handle click event on the target
clickTarget.addEventListener('click', (event) => {
    totalClicks++; // Increment total clicks
    checkAchievements('totalClicks', totalClicks); // Check click-based achievements

    let currentClickValue = clickValue;
    if (feverModeActive) {
        currentClickValue *= FEVER_MODE_CLICK_MULTIPLIER;
    }

    const pointsGained = currentClickValue;
    score += pointsGained;
    updateScoreDisplay();

    // --- Click Feedback Animation (Particles) ---
    const rect = clickTarget.getBoundingClientRect();
    const targetCenterX = rect.left + rect.width / 2;
    const targetCenterY = rect.top + rect.height / 2;

    // Create multiple particles
    const particleCount = feverModeActive ? 15 : 5; // More particles in fever mode
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('click-feedback-particle');
        // Position particle relative to the feedback container (which covers the game area)
        // Need to adjust coordinates from clickTarget relative to feedbackContainer
        const containerRect = feedbackContainer.getBoundingClientRect();
         // Randomize starting position slightly around the click target center
        const startX = targetCenterX - containerRect.left + (Math.random() - 0.5) * 20; // +/- 10px
        const startY = targetCenterY - containerRect.top + (Math.random() - 0.5) * 20; // +/- 10px

        particle.style.left = `${startX}px`;
        particle.style.top = `${startY}px`;

        // Randomize animation direction using CSS variables
        const angle = Math.random() * Math.PI * 2; // Random angle in radians
        const distance = 80 + Math.random() * 50; // Random distance
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;
        particle.style.setProperty('--dx', `${dx}px`);
        particle.style.setProperty('--dy', `${dy}px`);

        feedbackContainer.appendChild(particle);

        // Remove particle after animation ends
        particle.addEventListener('animationend', () => {
            particle.remove();
        });
    }

    // --- Click Feedback Text Animation (Optional, can be combined with particles) ---
     // If you still want the text, use a separate element and style similar to previous example
    const textFeedback = document.createElement('div');
    textFeedback.classList.add('click-feedback-animation'); // Re-use or adapt previous text animation class
    textFeedback.textContent = `+${Math.floor(pointsGained)}`; // Show points gained
    textFeedback.style.left = `${targetCenterX - containerRect.left}px`;
    textFeedback.style.top = `${targetCenterY - containerRect.top - 20}px`; // Position above target center
     // Make text yellow during fever mode
    if(feverModeActive) {
        textFeedback.style.color = '#ffff00'; // Yellow
        textFeedback.style.textShadow = '2px 2px #f00, 0 0 10px #ffff00'; // Red outline, yellow glow
    } else {
        textFeedback.style.color = 'yellow';
        textFeedback.style.textShadow = '2px 2px #000';
    }

    feedbackContainer.appendChild(textFeedback);
    textFeedback.addEventListener('animationend', () => {
        textFeedback.remove();
    });
});

// Function to render shop items
function renderShop() {
    shopItemsContainer.innerHTML = ''; // Clear current items

    shopItems.forEach(item => {
        // Check if item has a max level and is already at max level
        if (item.maxLevel && item.currentLevel >= item.maxLevel) {
            return; // Don't render item if maxed out
        }

        const cost = Math.floor(item.baseCost * Math.pow(item.costMultiplier, item.currentLevel));
        const itemElement = document.createElement('div');
        itemElement.classList.add('shop-item');
        itemElement.dataset.itemId = item.id; // Store item ID on the element

        itemElement.innerHTML = `
            <div class="item-info">
                <h3>${item.name} ${item.maxLevel ? '' : '(Lvl ' + item.currentLevel + ')'}</h3>
                <p>${item.description}</p>
                <p>Cost: ${cost.toLocaleString()}</p>
            </div>
            <button class="buy-button clickable" data-item-id="${item.id}">Buy</button>
        `;

        const buyButton = itemElement.querySelector('.buy-button');
        buyButton.addEventListener('click', () => buyItem(item.id));

        if (score < cost) {
            buyButton.disabled = true;
            buyButton.textContent = 'Too Poor!';
             itemElement.style.borderColor = '#555'; // Grey border for disabled
             itemElement.style.boxShadow = 'none'; // No glow
        } else {
             itemElement.style.borderColor = '#00ff00'; // Green border
             itemElement.style.boxShadow = '0 0 12px

