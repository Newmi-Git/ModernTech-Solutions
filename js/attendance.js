const { createApp } = Vue;

createApp({
  data() {
    return {
      employees: [],
      startDate: '2025-07-25',
      endDate: '2025-07-29',
      columns: [],
      statusCycle: ['Present', 'Late', 'Absent', 'Half Day', 'Leave'],
      loading: true,
      error: null
    };
  },
  computed: {
    avgPresent() {
      let total = 0, count = 0;
      this.employees.forEach(emp => {
        this.columns.forEach(date => {
          const record = emp.attendance.find(a => a.date === date);
          if (record) {
            count++;
            if (record.status === 'Present' || record.status === 'Late' || record.status === 'Half Day') total++;
          }
        });
      });
      return count === 0 ? 0 : Math.round((total / count) * 100);
    },
    avgAbsent() {
      let total = 0, count = 0;
      this.employees.forEach(emp => {
        this.columns.forEach(date => {
          const record = emp.attendance.find(a => a.date === date);
          if (record) {
            count++;
            if (record.status === 'Absent' || record.status === 'Leave') total++;
          }
        });
      });
      return count === 0 ? 0 : Math.round((total / count) * 100);
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
    this.initializeData();
  },
  methods: {
    async initializeData() {
      this.loading = true;
      this.error = null;

      try {
        const [employeeRows, attendanceRows, leaveRows] = await Promise.all([
          EmployeesAPI.getAll(),
          AttendanceAPI.getAll(),
          LeaveRequestsAPI.getAll()
        ]);

        // Reshape the flat backend rows into one attendance/leaveRequests
        // array per employee, matching what the template expects.
        this.employees = employeeRows.map(emp => ({
          employeeId: emp.employee_id,
          name: emp.name,
          attendance: attendanceRows
            .filter(a => a.employee_id === emp.employee_id)
            .map(a => ({ date: typeof a.date === 'string' ? a.date.slice(0, 10) : a.date, status: a.status })),
          leaveRequests: leaveRows
            .filter(l => l.employee_id === emp.employee_id)
            .map(l => ({ status: l.status, startDate: l.start_date, endDate: l.end_date }))
        }));
      } catch (err) {
        console.error("Failed to load attendance data:", err);
        this.error = err.message || "Failed to load attendance data.";
      }

      this.loading = false;
      this.generateColumns();
    },

    generateColumns() {
      this.columns = [];
      let current = new Date(this.startDate + 'T00:00:00');
      let end = new Date(this.endDate + 'T00:00:00');

      if (current > end) return;

      while (current <= end) {
        const dayOfWeek = current.getDay();

        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          const year = current.getFullYear();
          const month = String(current.getMonth() + 1).padStart(2, '0');
          const day = String(current.getDate()).padStart(2, '0');
          this.columns.push(`${year}-${month}-${day}`);
        }
        current.setDate(current.getDate() + 1);
      }
    },

    updateView() { this.generateColumns(); },

    formatDateHeader(dateStr) {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    },

    async toggleStatus(empId, date) {
      const emp = this.employees.find(e => e.employeeId === empId);
      if (!emp) return;
      let record = emp.attendance.find(a => a.date === date);

      const nextStatus = !record
        ? 'Present'
        : (() => {
            const currentIndex = this.statusCycle.indexOf(record.status);
            return currentIndex === -1 || currentIndex === this.statusCycle.length - 1
              ? 'Present'
              : this.statusCycle[currentIndex + 1];
          })();

      try {
        await AttendanceAPI.mark(empId, date, nextStatus);

        if (!record) {
          emp.attendance.push({ date, status: nextStatus });
        } else {
          record.status = nextStatus;
        }
        this.employees = [...this.employees];
      } catch (err) {
        this.error = err.message || "Failed to update attendance.";
      }
    },

    async markAllPresent(date) {
      try {
        await Promise.all(this.employees.map(emp => AttendanceAPI.mark(emp.employeeId, date, 'Present')));

        this.employees.forEach(emp => {
          let record = emp.attendance.find(a => a.date === date);
          if (!record) {
            emp.attendance.push({ date, status: 'Present' });
          } else {
            record.status = 'Present';
          }
        });
        this.employees = [...this.employees];
      } catch (err) {
        this.error = err.message || "Failed to mark all present.";
      }
    },

    getLocalDateString(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    setPresetToday() {
      const str = this.getLocalDateString(new Date());
      this.startDate = str;
      this.endDate = str;
      this.updateView();
    },

    setPresetWeek() {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      const friday = new Date(monday);
      friday.setDate(monday.getDate() + 4);

      this.startDate = this.getLocalDateString(monday);
      this.endDate = this.getLocalDateString(friday);
      this.updateView();
    },

    setPresetMonth() {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      this.startDate = this.getLocalDateString(firstDay);
      this.endDate = this.getLocalDateString(lastDay);
      this.updateView();
    },

    exportCSV() {
      let csv = 'Employee Name,' + this.columns.map(d => this.formatDateHeader(d)).join(',') + '\n';
      this.employees.forEach(emp => {
        let row = emp.name;
        this.columns.forEach(date => {
          const record = emp.attendance.find(a => a.date === date);
          row += `,${record ? record.status : '-'}`;
        });
        csv += row + '\n';
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Attendance_${this.startDate}_to_${this.endDate}.csv`;
      link.click();
    },

    getStatus(empId, date) {
      const emp = this.employees.find(e => e.employeeId === empId);
      if (!emp) return null;
      const record = emp.attendance.find(a => a.date === date);
      return record ? record.status : null;
    },
    getStatusClass(empId, date) {
      const status = this.getStatus(empId, date);
      if (status === 'Present') return 'att-present';
      if (status === 'Late') return 'att-late';
      if (status === 'Absent') return 'att-absent';
      if (status === 'Half Day') return 'att-half-day';
      if (status === 'Leave') return 'att-leave';
      return 'att-none';
    },
    getStatusText(empId, date) {
      const status = this.getStatus(empId, date);
      if (status === 'Present') return 'P';
      if (status === 'Late') return 'L';
      if (status === 'Absent') return 'A';
      if (status === 'Half Day') return 'HD';
      if (status === 'Leave') return 'LV';
      return '-';
    }
  }
}).mount('#attendance-app');
