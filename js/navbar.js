Vue.createApp({
  data() {
    return {
      currentPage: window.location.pathname.split('/').pop() || 'index.html',
      currentUser: getCurrentUser(),
      menuOpen: false
    };
  },
  template: `
    <nav class="top-navbar">
        <div class="nav-bar-row">
          <div class="nav-logo">MT<span>Solutions</span></div>

          <button class="nav-toggle" @click="menuOpen = !menuOpen" :class="{active: menuOpen}">
            <span></span><span></span><span></span>
          </button>
        </div>

        <div class="nav-links" :class="{open: menuOpen}">
            <!-- HR Navigation -->
            <template v-if="currentUser?.role === 'hr'">
                <a href="index.html" class="nav-item" :class="{active: currentPage === 'index.html'}">Home</a>
                <a href="requests.html" class="nav-item" :class="{active: currentPage === 'requests.html'}">Requests</a>
                <a href="performance.html" class="nav-item" :class="{active: currentPage === 'performance.html'}">Performance</a>
                <a href="employee.html" class="nav-item" :class="{active: currentPage === 'employee.html'}">Employees</a>
                <a href="payroll.html" class="nav-item" :class="{active: currentPage === 'payroll.html'}">Payroll</a>
                <!-- ADD THE LINE BELOW HERE -->
                <a href="attendance.html" class="nav-item" :class="{active: currentPage === 'attendance.html'}">Attendance</a>
                <a href="about.html" class="nav-item" :class="{active: currentPage === 'about.html'}">About</a>
            </template>
            
            <!-- Employee Navigation -->
            <template v-else-if="currentUser?.role === 'employee'">
                <a href="about.html" class="nav-item" :class="{active: currentPage === 'about.html'}">About</a>
                <a href="contact.html" class="nav-item" :class="{active: currentPage === 'contact.html'}">Contact</a>
            </template>

            <div class="profile-corner">
              <div class="profile-avatar">{{ currentUser?.name?.charAt(0) || '?' }}</div>
              <div class="profile-dropdown">
                <p class="profile-name">{{ currentUser?.name }}</p>
                <p style="font-size:11px; color:#888;">{{ currentUser?.role }}</p>
                <button class="logout" @click="logoutUser">Logout</button>
              </div>
            </div>
        </div>
    </nav>
  `,
  methods: { logoutUser }
}).mount('#app-navbar');