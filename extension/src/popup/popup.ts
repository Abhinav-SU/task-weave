// Popup UI logic for TaskWeave extension

import browser from 'webextension-polyfill';
import { Storage } from '../utils/storage';
import { Api } from '../utils/api';

// DOM Elements
let authContainer: HTMLElement;
let dashboardContainer: HTMLElement;
let loading: HTMLElement;
let emailInput: HTMLInputElement;
let passwordInput: HTMLInputElement;
let loginBtn: HTMLButtonElement;
let authError: HTMLElement;
let taskCount: HTMLElement;
let wsIndicator: HTMLElement;
let wsStatus: HTMLElement;
let userEmail: HTMLElement;
let openDashboardBtn: HTMLButtonElement;
let newTaskBtn: HTMLButtonElement;
let logoutBtn: HTMLButtonElement;

// Initialize popup
async function init() {
  console.log('🔧 Initializing popup...');
  
  // Get DOM elements
  authContainer = document.getElementById('auth-container')!;
  dashboardContainer = document.getElementById('dashboard-container')!;
  loading = document.getElementById('loading')!;
  emailInput = document.getElementById('email') as HTMLInputElement;
  passwordInput = document.getElementById('password') as HTMLInputElement;
  loginBtn = document.getElementById('login-btn') as HTMLButtonElement;
  authError = document.getElementById('auth-error')!;
  taskCount = document.getElementById('task-count')!;
  wsIndicator = document.getElementById('ws-indicator')!;
  wsStatus = document.getElementById('ws-status')!;
  userEmail = document.getElementById('user-email')!;
  openDashboardBtn = document.getElementById('open-dashboard-btn') as HTMLButtonElement;
  newTaskBtn = document.getElementById('new-task-btn') as HTMLButtonElement;
  logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;

  // Setup event listeners
  setupEventListeners();

  // Check authentication status
  const isAuth = await Storage.isAuthenticated();
  
  loading.style.display = 'none';
  
  if (isAuth) {
    await showDashboard();
  } else {
    showAuth();
  }
}

// Setup event listeners
function setupEventListeners() {
  loginBtn.addEventListener('click', handleLogin);
  
  passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  });

  document.getElementById('open-dashboard')?.addEventListener('click', () => {
    openDashboard();
  });

  openDashboardBtn.addEventListener('click', () => {
    openDashboard();
  });

  newTaskBtn.addEventListener('click', () => {
    openDashboard('/tasks/new');
  });

  logoutBtn.addEventListener('click', handleLogout);
}

// Show authentication view
function showAuth() {
  authContainer.classList.add('active');
  dashboardContainer.classList.remove('active');
}

// Show dashboard view
async function showDashboard() {
  authContainer.classList.remove('active');
  dashboardContainer.classList.add('active');

  // Load user info
  await loadUserInfo();
  
  // Load tasks
  await loadTasks();

  // Check WebSocket status
  checkWebSocketStatus();
}

// Handle login
async function handleLogin() {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showError('Please enter email and password');
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = 'Signing in...';
  authError.textContent = '';

  try {
    const response = await browser.runtime.sendMessage({
      type: 'authenticate',
      payload: { email, password },
    });

    if (response.success) {
      await showDashboard();
    } else {
      showError(response.error || 'Authentication failed');
    }
  } catch (error) {
    showError('Connection error. Make sure the backend is running.');
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Sign In';
  }
}

// Handle logout
async function handleLogout() {
  logoutBtn.disabled = true;
  logoutBtn.textContent = 'Signing out...';

  await browser.runtime.sendMessage({ type: 'logout' });
  
  // Clear inputs
  emailInput.value = '';
  passwordInput.value = '';
  
  showAuth();
  
  logoutBtn.disabled = false;
  logoutBtn.textContent = 'Sign Out';
}

// Load user info
async function loadUserInfo() {
  try {
    const { userEmail: email } = await Storage.getUserInfo();
    
    if (email) {
      userEmail.textContent = email;
    } else {
      // Fetch from API
      const response = await Api.getCurrentUser();
      if (response.success && response.data) {
        userEmail.textContent = response.data.email;
      }
    }
  } catch (error) {
    console.error('Failed to load user info:', error);
    userEmail.textContent = 'Unknown user';
  }
}

// Load tasks
async function loadTasks() {
  try {
    const response = await browser.runtime.sendMessage({ type: 'get-tasks' });
    
    if (response.success && response.data) {
      const activeTasks = response.data.filter((task: any) => task.status !== 'completed');
      taskCount.textContent = activeTasks.length.toString();
    } else {
      taskCount.textContent = '0';
    }
  } catch (error) {
    console.error('Failed to load tasks:', error);
    taskCount.textContent = '?';
  }
}

// Check WebSocket status
function checkWebSocketStatus() {
  // This is a simplified status check
  // In reality, you'd query the background script for actual WebSocket status
  wsIndicator.classList.add('connected');
  wsStatus.textContent = 'Connected';
}

// Show error message
function showError(message: string) {
  authError.textContent = message;
  authError.style.display = 'block';
}

// Open dashboard
function openDashboard(path: string = '') {
  const apiUrl = 'http://localhost:5173'; // Default Vite dev server
  browser.tabs.create({ url: `${apiUrl}${path}` });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Listen for updates from background script
browser.runtime.onMessage.addListener((message) => {
  if (message.type === 'task:updated') {
    loadTasks();
  }
});

