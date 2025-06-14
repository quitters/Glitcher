/**
 * Notifications Module
 * Handles toast notifications and alerts
 */

/**
 * Create a toast notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (default, success, warning, error)
 * @param {number} duration - Duration in ms
 */
export function createToast(message, type = 'default', duration = 3000) {
  const container = document.getElementById('toast-container') || createToastContainer();
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  // Add to container
  container.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // Auto remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      container.removeChild(toast);
    }, 300);
  }, duration);
}

/**
 * Create the toast container if it doesn't exist
 * @returns {HTMLElement} Toast container
 */
function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  document.body.appendChild(container);
  return container;
}

/**
 * Show a confirmation dialog
 * @param {string} message - Dialog message
 * @param {Function} onConfirm - Callback on confirm
 * @param {Function} onCancel - Callback on cancel
 */
export function showConfirmation(message, onConfirm, onCancel) {
  const overlay = document.createElement('div');
  overlay.className = 'dialog-overlay';
  
  const dialog = document.createElement('div');
  dialog.className = 'dialog confirmation-dialog';
  
  const messageEl = document.createElement('div');
  messageEl.className = 'dialog-message';
  messageEl.textContent = message;
  
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'dialog-buttons';
  
  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'dialog-button confirm-button';
  confirmBtn.textContent = 'Confirm';
  confirmBtn.addEventListener('click', () => {
    document.body.removeChild(overlay);
    if (onConfirm) onConfirm();
  });
  
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'dialog-button cancel-button';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', () => {
    document.body.removeChild(overlay);
    if (onCancel) onCancel();
  });
  
  buttonContainer.appendChild(confirmBtn);
  buttonContainer.appendChild(cancelBtn);
  
  dialog.appendChild(messageEl);
  dialog.appendChild(buttonContainer);
  overlay.appendChild(dialog);
  
  document.body.appendChild(overlay);
}

/**
 * Show an alert dialog
 * @param {string} message - Dialog message
 * @param {Function} onClose - Callback on close
 */
export function showAlert(message, onClose) {
  const overlay = document.createElement('div');
  overlay.className = 'dialog-overlay';
  
  const dialog = document.createElement('div');
  dialog.className = 'dialog alert-dialog';
  
  const messageEl = document.createElement('div');
  messageEl.className = 'dialog-message';
  messageEl.textContent = message;
  
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'dialog-buttons';
  
  const okBtn = document.createElement('button');
  okBtn.className = 'dialog-button ok-button';
  okBtn.textContent = 'OK';
  okBtn.addEventListener('click', () => {
    document.body.removeChild(overlay);
    if (onClose) onClose();
  });
  
  buttonContainer.appendChild(okBtn);
  
  dialog.appendChild(messageEl);
  dialog.appendChild(buttonContainer);
  overlay.appendChild(dialog);
  
  document.body.appendChild(overlay);
}
