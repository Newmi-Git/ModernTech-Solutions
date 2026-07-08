// --- DYNAMIC DATA INJECTION ---
const rawAttendanceData = {
    "attendanceAndLeave": [
        { "employeeId": 1, "name": "Sibongile Nkosi", "attendance": [ { "date": "2025-07-25", "status": "Present" }, { "date": "2025-07-26", "status": "Absent" }, { "date": "2025-07-27", "status": "Present" }, { "date": "2025-07-28", "status": "Present" }, { "date": "2025-07-29", "status": "Present" } ], "leaveRequests": [ { "date": "2025-07-22", "reason": "Sick Leave", "status": "Approved" }, { "date": "2024-12-01", "reason": "Personal", "status": "Pending" } ] },
        { "employeeId": 2, "name": "Lungile Moyo", "attendance": [ { "date": "2025-07-25", "status": "Present" }, { "date": "2025-07-26", "status": "Present" }, { "date": "2025-07-27", "status": "Absent" }, { "date": "2025-07-28", "status": "Present" }, { "date": "2025-07-29", "status": "Present" } ], "leaveRequests": [ { "date": "2025-07-15", "reason": "Family Responsibility", "status": "Denied" }, { "date": "2024-12-02", "reason": "Vacation", "status": "Approved" } ] },
        { "employeeId": 3, "name": "Thabo Molefe", "attendance": [ { "date": "2025-07-25", "status": "Present" }, { "date": "2025-07-26", "status": "Present" }, { "date": "2025-07-27", "status": "Present" }, { "date": "2025-07-28", "status": "Absent" }, { "date": "2025-07-29", "status": "Present" } ], "leaveRequests": [ { "date": "2025-07-10", "reason": "Medical Appointment", "status": "Approved" }, { "date": "2024-12-05", "reason": "Personal", "status": "Pending" } ] },
        { "employeeId": 4, "name": "Keshav Naidoo", "attendance": [ { "date": "2025-07-25", "status": "Absent" }, { "date": "2025-07-26", "status": "Present" }, { "date": "2025-07-27", "status": "Present" }, { "date": "2025-07-28", "status": "Present" }, { "date": "2025-07-29", "status": "Present" } ], "leaveRequests": [ { "date": "2025-07-20", "reason": "Bereavement", "status": "Approved" } ] },
        { "employeeId": 5, "name": "Zanele Khumalo", "attendance": [ { "date": "2025-07-25", "status": "Present" }, { "date": "2025-07-26", "status": "Present" }, { "date": "2025-07-27", "status": "Absent" }, { "date": "2025-07-28", "status": "Present" }, { "date": "2025-07-29", "status": "Present" } ], "leaveRequests": [ { "date": "2024-12-01", "reason": "Childcare", "status": "Pending" } ] },
        { "employeeId": 6, "name": "Sipho Zulu", "attendance": [ { "date": "2025-07-25", "status": "Present" }, { "date": "2025-07-26", "status": "Present" }, { "date": "2025-07-27", "status": "Absent" }, { "date": "2025-07-28", "status": "Present" }, { "date": "2025-07-29", "status": "Present" } ], "leaveRequests": [ { "date": "2025-07-18", "reason": "Sick Leave", "status": "Approved" } ] },
        { "employeeId": 7, "name": "Naledi Moeketsi", "attendance": [ { "date": "2025-07-25", "status": "Present" }, { "date": "2025-07-26", "status": "Present" }, { "date": "2025-07-27", "status": "Present" }, { "date": "2025-07-28", "status": "Absent" }, { "date": "2025-07-29", "status": "Present" } ], "leaveRequests": [ { "date": "2025-07-22", "reason": "Vacation", "status": "Pending" } ] },
        { "employeeId": 8, "name": "Farai Gumbo", "attendance": [ { "date": "2025-07-25", "status": "Present" }, { "date": "2025-07-26", "status": "Absent" }, { "date": "2025-07-27", "status": "Present" }, { "date": "2025-07-28", "status": "Present" }, { "date": "2025-07-29", "status": "Present" } ], "leaveRequests": [ { "date": "2024-12-02", "reason": "Medical Appointment", "status": "Approved" } ] },
        { "employeeId": 9, "name": "Karabo Dlamini", "attendance": [ { "date": "2025-07-25", "status": "Present" }, { "date": "2025-07-26", "status": "Present" }, { "date": "2025-07-27", "status": "Present" }, { "date": "2025-07-28", "status": "Absent" }, { "date": "2025-07-29", "status": "Present" } ], "leaveRequests": [ { "date": "2025-07-19", "reason": "Childcare", "status": "Denied" } ] },
        { "employeeId": 10, "name": "Fatima Patel", "attendance": [ { "date": "2025-07-25", "status": "Present" }, { "date": "2025-07-26", "status": "Present" }, { "date": "2025-07-27", "status": "Absent" }, { "date": "2025-07-28", "status": "Present" }, { "date": "2025-07-29", "status": "Present" } ], "leaveRequests": [ { "date": "2024-12-03", "reason": "Vacation", "status": "Pending" } ] }
    ]
};

// --- VUE APPLICATION ---
const { createApp } = Vue;

createApp({
  data() {
    return {
      employees: rawAttendanceData.attendanceAndLeave,
      startDate: '2025-07-25',
      endDate: '2025-07-29',
      columns: [] // Will hold array of dates
    };
  },
  computed: {
    // Calculate stats dynamically based on selected dates
    avgPresent() {
      let total = 0;
      let count = 0;
      this.employees.forEach(emp => {
        this.columns.forEach(date => {
          const record = emp.attendance.find(a => a.date === date);
          if (record) {
            count++;
            if (record.status === 'Present') total++;
          }
        });
      });
      return count === 0 ? 0 : Math.round((total / count) * 100);
    },
    avgAbsent() {
      return 100 - this.avgPresent;
    },
    pendingLeaves() {
      let count = 0;
      this.employees.forEach(emp => {
        count += emp.leaveRequests.filter(l => l.status === 'Pending').length;
      });
      return count;
    }
  },
  mounted() {
    this.generateColumns();
  },
  methods: {
    // Generate array of dates between start and end
    generateColumns() {
      this.columns = [];
      let current = new Date(this.startDate);
      let end = new Date(this.endDate);
      
      // Handle case where end date is before start date
      if(current > end) return;

      while (current <= end) {
        // Format to YYYY-MM-DD
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const day = String(current.getDate()).padStart(2, '0');
        this.columns.push(`${year}-${month}-${day}`);
        current.setDate(current.getDate() + 1);
      }
    },
    updateView() {
      this.generateColumns();
    },
    // Excel-like Header formatting (e.g., "Fri 25 Jul")
    formatDateHeader(dateStr) {
      const date = new Date(dateStr + 'T00:00:00'); // Adjust for timezone offset
      return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    },
    // Find status for specific cell
    getStatus(empId, date) {
      const emp = this.employees.find(e => e.employeeId === empId);
      if (!emp) return null;
      const record = emp.attendance.find(a => a.date === date);
      return record ? record.status : null;
    },
    // Return CSS class based on status
    getStatusClass(empId, date) {
      const status = this.getStatus(empId, date);
      if (status === 'Present') return 'att-present';
      if (status === 'Absent') return 'att-absent';
      return 'att-none';
    },
    // Return text for cell
    getStatusText(empId, date) {
      const status = this.getStatus(empId, date);
      if (status) return status.charAt(0); // P or A
      return '-';
    },
    // Interactive toggle functionality
    toggleStatus(empId, date) {
      const emp = this.employees.find(e => e.employeeId === empId);
      if (!emp) return;
      
      let record = emp.attendance.find(a => a.date === date);
      
      if (!record) {
        // If no data exists for this date, create it as 'Present'
        emp.attendance.push({ date: date, status: 'Present' });
      } else {
        // Toggle logic: Present -> Absent -> Present
        record.status = record.status === 'Present' ? 'Absent' : 'Present';
      }
      
      // Force Vue reactivity on array change
      this.employees = [...this.employees];
    }
  }
}).mount('#attendance-app');