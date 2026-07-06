const { createApp } = Vue;

createApp({
  data() {
    return {
      currentPage: window.location.pathname.split('/').pop()
    };
  },
  template: ` 
  <div class="footer">
    <div class="footer-content">
        <div class="footer-content-one">
            <p>Socials</p>
            <div class="footer-logos>
                <a>Instagram</a>
                <a></a>
            </div>
        </div>
        <div class="footer-content-two">
            <p>Contact Us:</p>
            <p><img><a></a></p>
            <p><img><a></a></p>
            <p><img><a></a></p>
        </div>
    </div>
  </div>`

}).mount('#app-footer');
