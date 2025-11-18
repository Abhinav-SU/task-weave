// Claude Content Script - Captures conversations from Claude.ai
// Monitors chat interactions and enables task linking

import browser from 'webextension-polyfill';

console.log('🤖 TaskWeave Claude injector loaded');

// Claude conversation state
interface Message {
  sender: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

let currentConversation: Message[] = [];
let isCapturing = false;
let captureButton: HTMLElement | null = null;

// Initialize the injector
function init() {
  console.log('🔧 Initializing Claude injector...');
  
  // Wait for Claude to load
  waitForClaude().then(() => {
    console.log('✅ Claude detected, setting up capture');
    setupCaptureButton();
    observeMessages();
  });
}

// Wait for Claude UI to be ready
async function waitForClaude(): Promise<void> {
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      // Check for Claude main container
      const mainContent = document.querySelector('main') || 
                         document.querySelector('[class*="conversation"]') ||
                         document.querySelector('[data-testid="conversation"]') ||
                         document.querySelector('.claude-conversation');
      
      if (mainContent) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 500);
    
    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      resolve();
    }, 10000);
  });
}

// Create and inject capture button
function setupCaptureButton() {
  // Remove existing button if any
  if (captureButton) {
    captureButton.remove();
  }

  // Create floating capture button
  captureButton = document.createElement('div');
  captureButton.id = 'taskweave-capture-btn';
  captureButton.innerHTML = `
    <button id="taskweave-btn-inner" style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      width: 56px;
      height: 56px;
      border-radius: 28px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      font-size: 24px;
    " title="Capture to TaskWeave">
      📋
    </button>
  `;

  // Add hover effect
  const btn = captureButton.querySelector('#taskweave-btn-inner') as HTMLElement;
  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'scale(1.1)';
    btn.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'scale(1)';
    btn.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
  });

  // Add click handler
  btn.addEventListener('click', handleCaptureClick);

  document.body.appendChild(captureButton);
  console.log('✅ Capture button added');
}

// Handle capture button click
async function handleCaptureClick() {
  console.log('📸 Capture button clicked');
  
  // Extract conversation
  const messages = extractConversation();
  
  if (messages.length === 0) {
    showNotification('No conversation to capture', 'error');
    return;
  }

  console.log(`📝 Captured ${messages.length} messages`);

  // Show capture dialog
  showCaptureDialog(messages);
}

// Extract conversation from Claude UI
function extractConversation(): Message[] {
  const messages: Message[] = [];

  try {
    // Claude message selectors (may need updates as UI changes)
    // Try multiple selector strategies
    
    // Strategy 1: Look for message containers with specific attributes
    let messageContainers = document.querySelectorAll('[data-is-human-message]');
    
    if (messageContainers.length === 0) {
      // Strategy 2: Look for common class patterns
      messageContainers = document.querySelectorAll('.font-user-message, .font-claude-message') ||
                         document.querySelectorAll('[class*="message"]');
    }

    if (messageContainers.length === 0) {
      // Strategy 3: Look for paragraph elements in conversation
      const conversationEl = document.querySelector('main') || document.querySelector('[role="main"]');
      if (conversationEl) {
        const paragraphs = conversationEl.querySelectorAll('p');
        let isUser = true;
        
        paragraphs.forEach((p) => {
          const content = p.textContent?.trim() || '';
          if (content && content.length > 10) { // Filter out short UI text
            messages.push({
              sender: isUser ? 'user' : 'assistant',
              content,
              timestamp: new Date(),
            });
            isUser = !isUser; // Alternate between user and assistant
          }
        });
      }
    } else {
      // Process found message containers
      messageContainers.forEach((container) => {
        const isUserMessage = container.getAttribute('data-is-human-message') === 'true' ||
                             container.classList.contains('font-user-message') ||
                             container.querySelector('[data-is-human-message="true"]');
        
        const contentEl = container.querySelector('p') ||
                         container.querySelector('[class*="content"]') ||
                         container;

        if (contentEl) {
          const content = contentEl.textContent?.trim() || '';
          if (content && content.length > 5) {
            messages.push({
              sender: isUserMessage ? 'user' : 'assistant',
              content,
              timestamp: new Date(),
            });
          }
        }
      });
    }

  } catch (error) {
    console.error('Failed to extract conversation:', error);
  }

  return messages;
}

// Show capture dialog (same as ChatGPT)
function showCaptureDialog(messages: Message[]) {
  // Create dialog overlay
  const overlay = document.createElement('div');
  overlay.id = 'taskweave-capture-dialog';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
  `;

  // Create dialog
  const dialog = document.createElement('div');
  dialog.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 24px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  `;

  dialog.innerHTML = `
    <h2 style="margin: 0 0 16px 0; color: #333; font-size: 24px;">
      📋 Capture to TaskWeave
    </h2>
    <p style="margin: 0 0 16px 0; color: #666;">
      ${messages.length} messages from Claude will be captured
    </p>
    <div style="margin-bottom: 16px;">
      <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 500;">
        Title
      </label>
      <input 
        type="text" 
        id="taskweave-conv-title" 
        placeholder="Conversation title..."
        style="
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          box-sizing: border-box;
        "
      >
    </div>
    <div style="margin-bottom: 16px;">
      <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 500;">
        Link to Task
      </label>
      <select 
        id="taskweave-task-select"
        style="
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          box-sizing: border-box;
        "
      >
        <option value="">Loading tasks...</option>
      </select>
    </div>
    <div style="display: flex; gap: 12px; justify-content: flex-end;">
      <button id="taskweave-cancel" style="
        padding: 12px 24px;
        border: 2px solid #e0e0e0;
        background: white;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        color: #666;
      ">
        Cancel
      </button>
      <button id="taskweave-save" style="
        padding: 12px 24px;
        border: none;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
      ">
        Save to TaskWeave
      </button>
    </div>
  `;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  // Load tasks
  loadTasks();

  // Event listeners
  const cancelBtn = dialog.querySelector('#taskweave-cancel');
  const saveBtn = dialog.querySelector('#taskweave-save');

  cancelBtn?.addEventListener('click', () => {
    overlay.remove();
  });

  saveBtn?.addEventListener('click', async () => {
    const title = (dialog.querySelector('#taskweave-conv-title') as HTMLInputElement).value;
    const taskId = (dialog.querySelector('#taskweave-task-select') as HTMLSelectElement).value;

    if (!title || !taskId) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    // Save conversation
    const result = await saveConversation(taskId, title, messages);
    
    if (result.success) {
      showNotification('Conversation captured successfully!', 'success');
      overlay.remove();
    } else {
      showNotification(`Failed to capture: ${result.error}`, 'error');
    }
  });

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}

// Load tasks from backend
async function loadTasks() {
  try {
    const response = await browser.runtime.sendMessage({
      type: 'get-tasks',
    });

    const select = document.querySelector('#taskweave-task-select') as HTMLSelectElement;
    if (!select) return;

    if (response.success && response.data) {
      const tasks = response.data;
      select.innerHTML = '<option value="">Select a task...</option>';
      
      tasks.forEach((task: any) => {
        const option = document.createElement('option');
        option.value = task.id;
        option.textContent = task.title;
        select.appendChild(option);
      });

      // Add "Create new task" option
      const newOption = document.createElement('option');
      newOption.value = 'new';
      newOption.textContent = '+ Create new task';
      select.appendChild(newOption);
    } else {
      select.innerHTML = '<option value="">Error loading tasks</option>';
    }
  } catch (error) {
    console.error('Failed to load tasks:', error);
  }
}

// Save conversation to backend
async function saveConversation(taskId: string, title: string, messages: Message[]): Promise<any> {
  try {
    // If creating new task
    if (taskId === 'new') {
      const createResponse = await browser.runtime.sendMessage({
        type: 'create-task',
        payload: {
          title: title,
          description: 'Created from Claude',
          tags: ['claude'],
        },
      });

      if (!createResponse.success) {
        return createResponse;
      }

      taskId = createResponse.data.id;
    }

    // Capture conversation
    const response = await browser.runtime.sendMessage({
      type: 'capture-conversation',
      payload: {
        taskId,
        platform: 'claude',
        title,
        messages: messages.map(m => ({
          sender: m.sender,
          content: m.content,
        })),
      },
    });

    return response;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Show notification
function showNotification(message: string, type: 'success' | 'error' = 'success') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10001;
    padding: 16px 24px;
    background: ${type === 'success' ? '#4CAF50' : '#f44336'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    font-size: 14px;
    font-weight: 500;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Observe new messages (for real-time capture)
function observeMessages() {
  const observer = new MutationObserver((mutations) => {
    // Monitor for new messages being added
    // This can be used for auto-capture or real-time sync features
  });

  const main = document.querySelector('main');
  if (main) {
    observer.observe(main, {
      childList: true,
      subtree: true,
    });
  }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Listen for messages from background script
browser.runtime.onMessage.addListener((message) => {
  console.log('📨 Message from background:', message.type);
  
  if (message.type === 'task:updated') {
    // Handle task updates
    console.log('Task updated:', message.payload);
  }
  
  return Promise.resolve({ received: true });
});

