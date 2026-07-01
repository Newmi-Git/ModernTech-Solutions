// Array containing the department information
const departments = [
  {
    title: 'Engineering & QA',
    description: 'Creating flawless, secure, and fully compliant healthcare platforms.'
  },
  {
    title: 'Customer Support',
    description: 'Providing round-the-clock aid to healthcare professionals globally.'
  },
  {
    title: 'Sales & Marketing',
    description: 'Connecting cutting-edge technical answers with the hospitals that need them.'
  },
  {
    title: 'Human Resources',
    description: 'Supporting a collaborative powerhouse of 250 experts worldwide.'
  }
];

// Run this logic as soon as the DOM loads fully
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('departments-list');
  
  // Create and append a card element for each item in the data array
  departments.forEach(dept => {
    const item = document.createElement('div');
    item.classList.add('dept-item');
    
    item.innerHTML = `
      <h3>${dept.title}</h3>
      <p>${dept.description}</p>
    `;
    
    container.appendChild(item);
  });
});
