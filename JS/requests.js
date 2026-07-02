fetch("./JSON/attendance.json")
  .then(response => response.json())
  .then(data => {

    const table = document.getElementById("leave-requests");

    data.attendanceAndLeave.forEach(employee => {

      employee.leaveRequests.forEach(request => {

        let buttons = "";

        if (request.status === "Pending") {

          buttons = `
            <button class="approve">Approve</button>
            <button class="reject">Reject</button>
          `;

        } else {

          buttons = `
            <button class="view">View</button>
          `;

        }

        table.innerHTML += `
          <tr>

            <td>${employee.name}</td>

            <td>${request.reason}</td>

            <td>${request.date}</td>

            <td>
              <span class="${request.status.toLowerCase()}">
                ${request.status}
              </span>
            </td>

            <td>
              ${buttons}
            </td>

          </tr>
        `;

      });

    });

  })
  .catch(error => console.log(error));