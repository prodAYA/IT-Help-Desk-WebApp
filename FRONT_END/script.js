// Dark Mode Toggle
document.addEventListener('DOMContentLoaded', function() {
    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'enabled') {
        document.body.classList.add('dark-mode');
        updateDarkModeButtonText();
    }

    // Setup dropdown functionality
    setupDropdown();

    // Dark mode toggle button
    const darkModeToggles = document.querySelectorAll('#darkmode-toggle');
    darkModeToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            document.body.classList.toggle('dark-mode');
            
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('darkMode', 'enabled');
            } else {
                localStorage.setItem('darkMode', 'disabled');
            }
            
            updateDarkModeButtonText();
        });
    });

    // Update dark mode button text
    function updateDarkModeButtonText() {
        const darkModeToggles = document.querySelectorAll('#darkmode-toggle');
        darkModeToggles.forEach(toggle => {
            if (document.body.classList.contains('dark-mode')) {
                toggle.textContent = '☀️ Disable Dark Mode';
            } else {
                toggle.textContent = '🌙 Enable Dark Mode';
            }
        });
    }

    // Form submission handling
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleUserLogin();
        });
    }

    const adminLoginForm = document.getElementById('admin-login-form');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleAdminLogin();
        });
    }
});

// Setup Dropdown Click Functionality
function setupDropdown() {
    const dropdownBtns = document.querySelectorAll('.dropdown-btn');
    
    dropdownBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const dropdownContent = this.nextElementSibling;
            const isActive = dropdownContent.classList.contains('active');
            
            // Close all other dropdowns
            document.querySelectorAll('.dropdown-content.active').forEach(content => {
                if (content !== dropdownContent) {
                    content.classList.remove('active');
                }
            });
            
            // Toggle current dropdown
            dropdownContent.classList.toggle('active');
        });
    });
    
    // Close dropdown when clicking on a link
    const dropdownLinks = document.querySelectorAll('.dropdown-content a');
    dropdownLinks.forEach(link => {
        link.addEventListener('click', function() {
            document.querySelectorAll('.dropdown-content').forEach(content => {
                content.classList.remove('active');
            });
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        document.querySelectorAll('.dropdown-content.active').forEach(content => {
            content.classList.remove('active');
        });
    });
}

// User Login Handler
function handleUserLogin() {
    const employeeCode = document.getElementById('employee-code').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!employeeCode || !password) {
        alert('Please fill in all fields');
        return;
    }

    // Placeholder for actual login logic
    console.log('User Login Attempt:', {
        employeeCode: employeeCode,
        password: '[hidden]'
    });

    // TODO: Add actual backend authentication here
    alert('Login attempt processed. Backend integration coming soon!');
}

// Admin Login Handler
function handleAdminLogin() {
    const adminPassword = document.getElementById('admin-password').value.trim();

    if (!adminPassword) {
        alert('Please enter the admin password');
        return;
    }

    // Placeholder for actual login logic
    console.log('Admin Login Attempt');

    // TODO: Add actual backend authentication here
    alert('Admin login attempt processed. Backend integration coming soon!');
}
