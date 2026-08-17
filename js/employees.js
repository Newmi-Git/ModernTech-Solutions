let employees = [];
let editingId = null;
let employeeToDelete = null;

/* ---------------- Load Employees ---------------- */

async function loadEmployees() {
    try {
        employees = await EmployeesAPI.getAll();
        displayEmployees();
    } catch (err) {
        showPopup(
            "fa-solid fa-circle-exclamation",
            "#ef4444",
            "Couldn't load employees",
            err.message
        );
    }
}

loadEmployees();

/* ---------------- Display Employees ---------------- */

function displayEmployees() {

    const table = document.getElementById("employees-data");

    table.innerHTML = "";

    employees.forEach((employee) => {

        table.innerHTML += `

        <tr>

            <td>${employee.employee_id}</td>

            <td>${employee.name}</td>

            <td>${employee.department}</td>

            <td>

                <button
                    class="view-btn"
                    onclick="viewEmployee(${employee.employee_id})">

                    View

                </button>

            </td>

            <td>

                <button
                    class="edit-btn"
                    onclick="editEmployee(${employee.employee_id})">

                    Edit

                </button>

            </td>

            <td>

                <button
                    class="delete-btn"
                    onclick="deleteEmployee(${employee.employee_id})">

                    Delete

                </button>

            </td>

        </tr>

        `;

    });

}

/* ---------------- helper ---------------- */

function findEmployee(employeeId) {
    return employees.find(e => e.employee_id === employeeId);
}

/* ---------------- View Employee ---------------- */

function viewEmployee(employeeId) {

    const employee = findEmployee(employeeId);

    document.getElementById("employee-modal").style.display = "flex";

    document.getElementById("emp-id").textContent =
        employee.employee_id;

    document.getElementById("emp-name").textContent =
        employee.name;

    document.getElementById("emp-department").textContent =
        employee.department;

    document.getElementById("emp-position").textContent =
        employee.position;

    document.getElementById("emp-salary").textContent =
        "R" + Number(employee.salary).toLocaleString();

    document.getElementById("emp-history").textContent =
        employee.employment_history;

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
/* Note: there is no backend endpoint for employee comments yet — this stays local-only. */

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

    editingId = null;

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

function editEmployee(employeeId) {

    editingId = employeeId;

    const employee = findEmployee(employeeId);

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
        employee.employment_history;

    document.getElementById("new-contact").value =
        employee.contact;

    document.getElementById("employee-form-modal").style.display =
        "flex";

}

/* ---------------- Save Employee ---------------- */

async function saveEmployee() {

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

    const payload = {
        name,
        department,
        position,
        salary: Number(salary),
        employment_history: history,
        contact,
        // Leave score unset (null) for a brand-new hire — the performance page
        // treats a null score as "Awaiting Review". goals_met/goals_total
        // default to 0 on the backend if omitted.
        score: editingId ? findEmployee(editingId).score ?? null : null,
        goals_met: editingId ? findEmployee(editingId).goals_met ?? 0 : 0,
        goals_total: editingId ? findEmployee(editingId).goals_total ?? 0 : 0,
    };

    try {

        if (editingId === null) {

            const result = await EmployeesAPI.create(payload);

            closeEmployeeForm();
            await loadEmployees();

            const creds = result.login
                ? ` Login: ${result.login.email} / temp password: ${result.login.temporary_password}`
                : "";

            showPopup(
                "fa-solid fa-circle-check",
                "#22c55e",
                "Employee Added!",
                "The employee has been added successfully." + creds
            );

        } else {

            await EmployeesAPI.update(editingId, payload);

            closeEmployeeForm();
            await loadEmployees();

            showPopup(
                "fa-solid fa-circle-check",
                "#22c55e",
                "Employee Updated!",
                "Employee information has been updated."
            );

        }

    } catch (err) {

        showPopup(
            "fa-solid fa-circle-exclamation",
            "#ef4444",
            "Save Failed",
            err.message
        );

    }

}

/* ---------------- Delete Employee ---------------- */

function deleteEmployee(employeeId) {

    employeeToDelete = employeeId;

    document.getElementById("delete-popup").style.display =
        "flex";

}

/* ---------------- Confirm Delete ---------------- */

async function confirmDelete() {

    try {

        await EmployeesAPI.remove(employeeToDelete);

        await loadEmployees();

        closeDeletePopup();

        showPopup(
            "fa-solid fa-trash",
            "#ef4444",
            "Employee Deleted",
            "The employee has been removed successfully."
        );

    } catch (err) {

        closeDeletePopup();

        showPopup(
            "fa-solid fa-circle-exclamation",
            "#ef4444",
            "Delete Failed",
            err.message
        );

    }

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
