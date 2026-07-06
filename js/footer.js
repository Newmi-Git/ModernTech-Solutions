
createApp({
  data() {
    return {
      year: new Date().getFullYear()
    };
  },
  template: `
    <footer class="site-footer">
      <div class="footer-top">
        <div class="footer-brand">
          <span class="footer-logo">MT<span>Solutions</span></span>
          <p class="footer-tagline">Custom software for the healthcare industry.</p>
        </div>

        <div class="footer-links">
          <p class="footer-heading">Navigate</p>
          <a href="index.html">Home</a>
          <a href="requests.html">Requests</a>
          <a href="about.html">About</a>
          <a href="contact.html">Contact</a>
        </div>

        <div class="footer-contact">
          <p class="footer-heading">Contact</p>
          <p>info@moderntechsolutions.com</p>
          <p>Cape Town, South Africa</p>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; {{ year }} ModernTech Solutions. All rights reserved.</p>
      </div>
    </footer>
  `
}).mount('#app-footer');


