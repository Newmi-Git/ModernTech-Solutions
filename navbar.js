const { createApp } = Vue;

createApp({
  data() {
    return {
      currentPage: window.location.pathname.split('/').pop()
    };
  },
  template: `    
    <section class="nav-section">

        <nav>
            <ul> 
                <li> <a href="index.html">Home</a></li>
                <li><a href="employee.html">Employees</a></li>
                <li><a href="performance.html">Performance</a></li> 
                <li><a class="active" href="requests.html">Leave Requests</a></li> 
                <li><a href="about.html">About Us</a></li>
                <li><a href="contact.html">Contact</a></li>
            </ul> 
        </nav> 
        
        <button class="logout"> Logout </button>

    </section>
  `,
}).mount('#app-navbar');


dispatchEvent