const { createApp } = Vue;

createApp({
  data() {
    return {
      currentPage: window.location.pathname.split('/').pop()
    };
  },
  template: `
    <nav class="site-nav">
      <div class="nav-brand">ModernTech Solutions</div>
      <ul class="nav-links">
        <li><a href="index.html" :class="{active: currentPage === 'index.html'}">Home</a></li>
        <li><a href="dashboard.html" :class="{active: currentPage === 'dashboard.html'}">Dashboard</a></li>
        <li><a href="login.html" :class="{active: currentPage === 'login.html'}">Login</a></li>
      </ul>
    </nav>
  `
}).mount('#app-navbar');


dispatchEvent