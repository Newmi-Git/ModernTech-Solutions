document.addEventListener('DOMContentLoaded', () => {
  const reasonSelect = document.getElementById('reason');
  const leaveModal = document.getElementById('leaveModal');
  const closeModalButtons = document.querySelectorAll('[data-close-modal]');
  const leaveRequestForm = document.getElementById('leaveRequestForm');
  const feedbackMessage = document.getElementById('leaveFormFeedback');
  const submittingAsEl = document.getElementById('submitting-as');
  if (submittingAsEl) {
    const user = getCurrentUser();
    submittingAsEl.textContent = user?.name ? `Submitting as: ${user.name}` : '';
  }
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
    leaveRequestForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = new FormData(leaveRequestForm);

      const startDate = formData.get('startDate') || '';
      const endDate = formData.get('endDate') || '';
      const reason = formData.get('leaveType') || 'General Leave';

      // The request is tied to whichever employee is actually logged in —
      // not whatever name was typed in the contact form fields.
      const currentUser = getCurrentUser();
      if (!currentUser || !currentUser.employeeId) {
        if (feedbackMessage) {
          feedbackMessage.textContent = 'You must be logged in as an employee to submit a leave request.';
        }
        return;
      }

      if (!startDate || !endDate) {
        if (feedbackMessage) {
          feedbackMessage.textContent = 'Please provide both a start and end date.';
        }
        return;
      }

      try {
        await LeaveRequestsAPI.submit(currentUser.employeeId, startDate, endDate, reason);

        leaveRequestForm.reset();
        leaveModal?.classList.add('hidden');

        if (feedbackMessage) {
          feedbackMessage.textContent = 'Your leave request has been submitted successfully.';
        }
      } catch (err) {
        if (feedbackMessage) {
          feedbackMessage.textContent = err.message || 'Failed to submit leave request.';
        }
      }
    });
  }
});
