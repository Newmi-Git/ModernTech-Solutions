let employees = [];

fetch("./JSON/employee_info (2).json")
  .then(response => response.json())
  .then(data => {

    employees = data.employeeInformation;

    const table = document.getElementById("employees-data");

    employees.forEach((employee, index) => {

      table.innerHTML += `
        <tr>

          <td>${employee.employeeId}</td>

          <td>${employee.name}</td>

          <td>${employee.department}</td>

          <td>

            <button
              class="view-btn"
              onclick="viewEmployee(${index})">

              View

            </button>

          </td>

        </tr>
      `;

    });

  })

  .catch(error => console.log(error));



function viewEmployee(index){

    const employee = employees[index];

    document.getElementById("employee-modal").style.display = "flex";

    document.getElementById("emp-id").textContent = employee.employeeId;
    document.getElementById("emp-name").textContent = employee.name;
    document.getElementById("emp-department").textContent = employee.department;
    document.getElementById("emp-position").textContent = employee.position;
    document.getElementById("emp-salary").textContent =
        "R" + employee.salary.toLocaleString();
    document.getElementById("emp-history").textContent =
        employee.employmentHistory;
    document.getElementById("emp-contact").textContent =
        employee.contact;

    document.getElementById("comments").value = "";

}

function closeModal(){

    document.getElementById("employee-modal").style.display = "none";

}

function saveComment(){

    alert("Comment saved successfully!");

    document.getElementById("comments").value = "";

}

window.onclick = function(event){

    const modal = document.getElementById("employee-modal");

    if(event.target === modal){

        closeModal();

    }

}
