document.addEventListener('DOMContentLoaded', function() {
    applyStoredDarkMode();
    setupDropdown();
    setupPageLogic();
});

function applyStoredDarkMode() {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
    updateDarkModeButtonText();
}

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

function setupDropdown() {
    const dropdownBtns = document.querySelectorAll('.dropdown-btn');

    dropdownBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const dropdownContent = this.nextElementSibling;

            document.querySelectorAll('.dropdown-content.active').forEach(content => {
                if (content !== dropdownContent) {
                    content.classList.remove('active');
                }
            });

            dropdownContent.classList.toggle('active');
        });
    });

    const dropdownLinks = document.querySelectorAll('.dropdown-content a');
    dropdownLinks.forEach(link => {
        link.addEventListener('click', function() {
            document.querySelectorAll('.dropdown-content').forEach(content => {
                content.classList.remove('active');
            });
        });
    });

    document.addEventListener('click', function() {
        document.querySelectorAll('.dropdown-content.active').forEach(content => {
            content.classList.remove('active');
        });
    });

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
}

function setupPageLogic() {
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

    const userDashboardPage = document.body.dataset.page === 'user-dashboard';
    if (userDashboardPage) {
        initializeUserDashboard();
    }

    const adminDashboardPage = document.body.dataset.page === 'admin-dashboard';
    if (adminDashboardPage) {
        initializeAdminDashboard();
    }
}

function handleUserLogin() {
    const employeeCode = document.getElementById('employee-code').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!employeeCode || !password) {
        alert('Please fill in all fields');
        return;
    }

    const matchedUser = users.find(user => {
        return user.employeeCode.toLowerCase() === employeeCode.toLowerCase() && user.password === password;
    });

    if (!matchedUser) {
        alert('Invalid employee code or password.');
        return;
    }

    localStorage.setItem('currentUser', JSON.stringify(matchedUser));
    localStorage.removeItem('currentAdmin');
    window.location.href = 'user-dashboard.html';
}

function handleAdminLogin() {
    const adminPassword = document.getElementById('admin-password').value.trim();

    if (!adminPassword) {
        alert('Please enter the admin password');
        return;
    }

    if (admin.password !== adminPassword) {
        alert('Invalid admin password.');
        return;
    }

    localStorage.setItem('currentAdmin', JSON.stringify(admin));
    localStorage.removeItem('currentUser');
    window.location.href = 'admin-dashboard.html';
}

function initializeUserDashboard() {
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!storedUser) {
        window.location.href = 'login.html';
        return;
    }

    const welcomeEl = document.getElementById('welcome-name');
    const welcomeMainEl = document.getElementById('welcome-name-main');
    const greeting = 'Hello, ' + storedUser.name;

    if (welcomeEl) {
        welcomeEl.textContent = greeting;
    }

    if (welcomeMainEl) {
        welcomeMainEl.textContent = greeting;
    }

    const notificationBtn = document.getElementById('notification-btn');
    const notificationPanel = document.getElementById('notification-panel');
    const closeNotificationBtn = document.getElementById('close-notifications');
    const notificationTabButtons = document.querySelectorAll('.notification-tab');
    const notificationList = document.getElementById('notification-list');

    if (notificationBtn && notificationPanel) {
        notificationBtn.addEventListener('click', function() {
            notificationPanel.classList.toggle('open');
        });
    }

    if (closeNotificationBtn && notificationPanel) {
        closeNotificationBtn.addEventListener('click', function() {
            notificationPanel.classList.remove('open');
        });
    }

    const userNotifications = notifications.filter(item => item.employeeCode === storedUser.employeeCode);
    const defaultTab = 'New Comments';

    function renderNotifications(tabName) {
        const filteredNotifications = userNotifications.filter(item => {
            if (tabName === 'New Comments') {
                return item.type === 'new_comment';
            }
            if (tabName === 'Ticket Status') {
                return item.type === 'ticket_resolved';
            }
            return false;
        });

        if (!notificationList) return;

        if (filteredNotifications.length === 0) {
            notificationList.innerHTML = '<div class="empty-state">No notifications in this section.</div>';
            return;
        }

        notificationList.innerHTML = filteredNotifications.map(item => {
            const date = new Date(item.createdAt);
            const timestamp = date.toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            });

            return `
                <div class="notification-item">
                    <div class="notification-message">${item.message}</div>
                    <div class="notification-time">${timestamp}</div>
                </div>
            `;
        }).join('');
    }

    notificationTabButtons.forEach(tab => {
        tab.addEventListener('click', function() {
            notificationTabButtons.forEach(button => button.classList.remove('active'));
            this.classList.add('active');
            renderNotifications(this.dataset.tab);
        });
    });

    const activeTab = [...notificationTabButtons].find(tab => tab.classList.contains('active')) || [...notificationTabButtons].find(tab => tab.dataset.tab === defaultTab);
    if (activeTab) {
        activeTab.classList.add('active');
        renderNotifications(activeTab.dataset.tab);
    }
}

function initializeAdminDashboard() {
    const storedAdmin = JSON.parse(localStorage.getItem('currentAdmin'));

    if (!storedAdmin) {
        window.location.href = 'admin-login.html';
        return;
    }

    const dashboardTitle = document.getElementById('admin-dashboard-title');
    if (dashboardTitle) {
        dashboardTitle.textContent = 'Admin Dashboard';
    }
}

