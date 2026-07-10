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

      // Build the employee's name from first-name + last-name — this form
      // has no field literally named "employeeName", so reading that key
      // directly always fell back to "Unknown Employee". Build it instead.
      const firstName = formData.get('first-name') || '';
      const lastName = formData.get('last-name') || '';
      const employeeName = (firstName + ' ' + lastName).trim() || 'Unknown Employee';

      // Combine start date and end date into a single readable string format
      const startDate = formData.get('startDate') || '';
      const endDate = formData.get('endDate') || '';
      const dateRangeString = startDate && endDate ? `${startDate} to ${endDate}` : (startDate || 'N/A');

      // Structure individual leave request object to match the dashboard schema
      const newLeaveItem = {
        reason: formData.get('leaveType') || 'General Leave',
        date: dateRangeString,
        status: 'Pending'
      };

      // Pull current data or structure fallback array
      let currentData = JSON.parse(localStorage.getItem('leaveRequests'));

      if (!currentData || !Array.isArray(currentData)) {
        currentData = [];
      }

      // Check if employee record container already exists in the system
      let employeeRecord = currentData.find(emp => emp.name.toLowerCase() === employeeName.toLowerCase());

      if (employeeRecord) {
        // If employee exists, append the new application parameters
        if (!employeeRecord.leaveRequests) {
          employeeRecord.leaveRequests = [];
        }
        employeeRecord.leaveRequests.push(newLeaveItem);
      } else {
        // If it's a completely new employee, build their structural profile shell
        currentData.push({
          name: employeeName,
          leaveRequests: [newLeaveItem]
        });
      }

      // Save back to local storage
      localStorage.setItem('leaveRequests', JSON.stringify(currentData));

      leaveRequestForm.reset();

      if (feedbackMessage) {
        feedbackMessage.textContent = 'Your leave request has been submitted successfully.';
      }
    });
  }
});