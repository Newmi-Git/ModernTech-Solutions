fetch("./JSON/employee_info (2).json")
  .then(response => response.json())
  .then(data => {

    const table = document.getElementById("employees-data");

    data.employeeInformation.forEach(employee => {

      table.innerHTML += `
        <tr>

          <td>${employee.employeeId}</td>

          <td>${employee.name}</td>

          <td>${employee.department}</td>

          <td>${employee.position}</td>

          <td>R${employee.salary.toLocaleString()}</td>

          <td>${employee.contact}</td>

          <td>

            <button class="view-btn">
              View
            </button>

          </td>

        </tr>
      `;

    });

  })
  .catch(error => console.log(error));