

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
            <a href="index.html" class="nav-item" :class="{active: currentPage === 'index.html'}">Home</a>
            <a href="requests.html" class="nav-item" :class="{active: currentPage === 'requests.html'}">Requests</a>
            <a v-if="currentUser?.role === 'hr'" href="performance.html" class="nav-item" :class="{active: currentPage === 'performance.html'}">Performance</a>
            <a v-if="currentUser?.role === 'hr'" href="employee.html" class="nav-item" :class="{active: currentPage === 'employee.html'}">Employees</a>
            <a v-if="currentUser?.role === 'hr'" href="payroll.html" class="nav-item" :class="{active: currentPage === 'payroll.html'}">Payroll</a>
            <a href="about.html" class="nav-item" :class="{active: currentPage === 'about.html'}">About</a>
            <a href="contact.html" class="nav-item" :class="{active: currentPage === 'contact.html'}">Contact</a>

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