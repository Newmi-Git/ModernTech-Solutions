let employees = [];
let editingIndex = -1;
let employeeToDelete = null;

/* ---------------- Load Employees ---------------- */

const savedEmployees = localStorage.getItem("employees");

if (savedEmployees) {

    employees = JSON.parse(savedEmployees);

    displayEmployees();

} else {

    fetch("./JSON/employee_info (2).json")
        .then(response => response.json())
        .then(data => {

            employees = data.employeeInformation;

            saveEmployees();

            displayEmployees();

        })
        .catch(error => console.log(error));

}

/* ---------------- Save to Local Storage ---------------- */

function saveEmployees() {

    localStorage.setItem(
        "employees",
        JSON.stringify(employees)
    );

}

/* ---------------- Display Employees ---------------- */

function displayEmployees() {

    const table = document.getElementById("employees-data");

    table.innerHTML = "";

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

            <td>

                <button
                    class="edit-btn"
                    onclick="editEmployee(${index})">

                    Edit

                </button>

            </td>

            <td>

                <button
                    class="delete-btn"
                    onclick="deleteEmployee(${index})">

                    Delete

                </button>

            </td>

        </tr>

        `;

    });

}

/* ---------------- View Employee ---------------- */

function viewEmployee(index) {

    const employee = employees[index];

    document.getElementById("employee-modal").style.display = "flex";

    document.getElementById("emp-id").textContent =
        employee.employeeId;

    document.getElementById("emp-name").textContent =
        employee.name;

    document.getElementById("emp-department").textContent =
        employee.department;

    document.getElementById("emp-position").textContent =
        employee.position;

    document.getElementById("emp-salary").textContent =
        "R" + employee.salary.toLocaleString();

    document.getElementById("emp-history").textContent =
        employee.employmentHistory;

    document.getElementById("emp-contact").textContent =
        employee.contact;

    document.getElementById("comments").value = "";

}

/* ---------------- Close Employee Modal ---------------- */

function closeModal() {

    document.getElementById("employee-modal").style.display = "none";

}

/* ---------------- Show Popup ---------------- */

function showPopup(icon, color, title, message) {

    document.getElementById("popup-icon").className = icon;
    document.getElementById("popup-icon").style.color = color;

    document.getElementById("popup-title").textContent = title;

    document.getElementById("popup-message").textContent = message;

    document.getElementById("popup").style.display = "flex";

}

/* ---------------- Save Comment ---------------- */

function saveComment() {

    const comment =
        document.getElementById("comments").value.trim();

    if (comment === "") {

        showPopup(

            "fa-solid fa-circle-exclamation",

            "#f59e0b",

            "No Comment",

            "Please enter a comment before saving."

        );

        return;

    }

    document.getElementById("comments").value = "";

    closeModal();

    showPopup(

        "fa-solid fa-circle-check",

        "#22c55e",

        "Comment Saved!",

        "Your employee comment has been saved successfully."

    );

}

/* ---------------- Close Popup ---------------- */

function closePopup() {

    document.getElementById("popup").style.display = "none";

}

/* ---------------- Open Add Employee ---------------- */

function openAddModal() {

    editingIndex = -1;

    document.getElementById("form-title").textContent =
        "Add Employee";

    document.getElementById("new-name").value = "";
    document.getElementById("new-department").value = "";
    document.getElementById("new-position").value = "";
    document.getElementById("new-salary").value = "";
    document.getElementById("new-history").value = "";
    document.getElementById("new-contact").value = "";

    document.getElementById("employee-form-modal").style.display =
        "flex";

}

/* ---------------- Edit Employee ---------------- */

function editEmployee(index) {

    editingIndex = index;

    const employee = employees[index];

    document.getElementById("form-title").textContent =
        "Edit Employee";

    document.getElementById("new-name").value =
        employee.name;

    document.getElementById("new-department").value =
        employee.department;

    document.getElementById("new-position").value =
        employee.position;

    document.getElementById("new-salary").value =
        employee.salary;

    document.getElementById("new-history").value =
        employee.employmentHistory;

    document.getElementById("new-contact").value =
        employee.contact;

    document.getElementById("employee-form-modal").style.display =
        "flex";

}

/* ---------------- Save Employee ---------------- */

function saveEmployee() {

  // Validate form
const name = document.getElementById("new-name").value.trim();
const department = document.getElementById("new-department").value.trim();
const position = document.getElementById("new-position").value.trim();
const salary = document.getElementById("new-salary").value.trim();
const history = document.getElementById("new-history").value.trim();
const contact = document.getElementById("new-contact").value.trim();

if (
    name === "" ||
    department === "" ||
    position === "" ||
    salary === "" ||
    history === "" ||
    contact === ""
) {

    showPopup(
        "fa-solid fa-circle-exclamation",
        "#f59e0b",
        "Missing Information",
        "Please fill in all employee details before saving."
    );

    return;

}

const employee = {

    employeeId:
        editingIndex === -1
            ? employees.length + 1
            : employees[editingIndex].employeeId,

    name: name,

    department: department,

    position: position,

    salary: Number(salary),

    employmentHistory: history,

    contact: contact

};

    if (editingIndex === -1) {

        employees.push(employee);

    } else {

        employees[editingIndex] = employee;

    }

    saveEmployees();

    closeEmployeeForm();

    displayEmployees();

    showPopup(

        "fa-solid fa-circle-check",

        "#22c55e",

        editingIndex === -1
            ? "Employee Added!"
            : "Employee Updated!",

        editingIndex === -1
            ? "The employee has been added successfully."
            : "Employee information has been updated."

    );

}

/* ---------------- Delete Employee ---------------- */

function deleteEmployee(index) {

    employeeToDelete = index;

    document.getElementById("delete-popup").style.display =
        "flex";

}

/* ---------------- Confirm Delete ---------------- */

function confirmDelete() {

    employees.splice(employeeToDelete, 1);

    saveEmployees();

    displayEmployees();

    closeDeletePopup();

    showPopup(

        "fa-solid fa-trash",

        "#ef4444",

        "Employee Deleted",

        "The employee has been removed successfully."

    );

}

/* ---------------- Close Delete Popup ---------------- */

function closeDeletePopup() {

    document.getElementById("delete-popup").style.display =
        "none";

}

/* ---------------- Close Employee Form ---------------- */

function closeEmployeeForm() {

    document.getElementById("employee-form-modal").style.display =
        "none";

}

/* ---------------- Close Modals ---------------- */

window.onclick = function(event) {

    const detailsModal =
        document.getElementById("employee-modal");

    const formModal =
        document.getElementById("employee-form-modal");

    const deletePopup =
        document.getElementById("delete-popup");

    if (event.target === detailsModal) {

        closeModal();

    }

    if (event.target === formModal) {

        closeEmployeeForm();

    }

    if (event.target === deletePopup) {

        closeDeletePopup();

    }

};
