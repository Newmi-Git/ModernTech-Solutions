
document.addEventListener('DOMContentLoaded', () => {
  const reasonSelect = document.getElementById('reason');
  const leaveModal = document.getElementById('leaveModal');
  const closeModalButtons = document.querySelectorAll('[data-close-modal]');
  const leaveRequestForm = document.getElementById('leaveRequestForm');
  const feedbackMessage = document.getElementById('leaveFormFeedback');

  if (reasonSelect && leaveModal) {
    const toggleLeaveModal = () => {
      if (reasonSelect.value === 'leave') {
        leaveModal.classList.remove('hidden');
      } else {
        leaveModal.classList.add('hidden');
      }
    };

    reasonSelect.addEventListener('change', toggleLeaveModal);
    toggleLeaveModal();

    closeModalButtons.forEach((button) => {
      button.addEventListener('click', () => leaveModal.classList.add('hidden'));
    });

    leaveModal.addEventListener('click', (event) => {
      if (event.target === leaveModal) {
        leaveModal.classList.add('hidden');
      }
    });
  }

  if (leaveRequestForm) {
    leaveRequestForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const formData = new FormData(leaveRequestForm);
      const newRequest = {
        employeeName: formData.get('employeeName') || '',
        leaveType: formData.get('leaveType') || '',
        startDate: formData.get('startDate') || '',
        endDate: formData.get('endDate') || '',
        reason: formData.get('reasonText') || '',
        submittedAt: new Date().toLocaleString()
      };

      const currentRequests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
      currentRequests.push(newRequest);
      localStorage.setItem('leaveRequests', JSON.stringify(currentRequests));

      leaveRequestForm.reset();

      if (feedbackMessage) {
        feedbackMessage.textContent = 'Your leave request has been submitted successfully.';
      }
    });
  }
});
