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

    const ticketViewPage = document.body.dataset.page === 'ticket-view';
    if (ticketViewPage) {
        initializeTicketView();
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
            const isOpen = notificationPanel.classList.toggle('open');
            document.body.classList.toggle('notifications-open', isOpen);
        });
    }

    if (closeNotificationBtn && notificationPanel) {
        closeNotificationBtn.addEventListener('click', function() {
            notificationPanel.classList.remove('open');
            document.body.classList.remove('notifications-open');
        });
    }

    const userNotifications = notifications.filter(item => item.employeeCode === storedUser.employeeCode);
    const dismissedNotificationIds = new Set();
    const defaultTab = 'New Comments';

    function renderNotifications(tabName) {
        const filteredNotifications = userNotifications.filter(item => {
            if (dismissedNotificationIds.has(item.notificationId)) {
                return false;
            }

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
                <div class="notification-item" data-notification-id="${item.notificationId}">
                    <button class="dismiss-notification" type="button" aria-label="Dismiss notification">Dismiss</button>
                    <div class="notification-message">${item.message}</div>
                    <div class="notification-time">${timestamp}</div>
                </div>
            `;
        }).join('');
    }

    if (notificationList) {
        notificationList.addEventListener('click', function(e) {
            const dismissButton = e.target.closest('.dismiss-notification');
            if (!dismissButton) {
                return;
            }

            const notificationItem = dismissButton.closest('.notification-item');
            const notificationId = Number(notificationItem.dataset.notificationId);
            dismissedNotificationIds.add(notificationId);
            notificationItem.classList.add('is-dismissing');

            notificationItem.addEventListener('transitionend', function() {
                renderNotifications(document.querySelector('.notification-tab.active').dataset.tab);
            }, { once: true });
        });
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

    setupTicketForm(storedUser);
    setupTicketViewSwitch(storedUser.employeeCode);
}

function setupTicketForm(currentUser) {
    const toggleButton = document.getElementById('toggle-ticket-form');
    const formWrapper = document.getElementById('ticket-form-wrapper');
    const ticketForm = document.getElementById('new-ticket-form');
    const descriptionField = document.getElementById('ticket-description');
    const charCount = document.getElementById('ticket-char-count');
    const attachmentField = document.getElementById('ticket-attachment');

    if (!toggleButton || !formWrapper || !ticketForm) {
        return;
    }

    function setFormOpenState(isOpen) {
        formWrapper.classList.toggle('open', isOpen);
        formWrapper.classList.toggle('collapsed', !isOpen);
        toggleButton.textContent = isOpen ? 'Cancel' : 'Create New Ticket';
        toggleButton.classList.toggle('cancel-mode', isOpen);
    }

    toggleButton.addEventListener('click', function() {
        const isOpen = formWrapper.classList.contains('open');
        setFormOpenState(!isOpen);
    });

    if (descriptionField && charCount) {
        const updateCounter = function() {
            charCount.textContent = descriptionField.value.length;
        };

        descriptionField.addEventListener('input', updateCounter);
        updateCounter();
    }

    ticketForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const category = document.getElementById('ticket-category').value.trim();
        const description = descriptionField.value.trim();
        const file = attachmentField.files && attachmentField.files[0] ? attachmentField.files[0] : null;

        if (!category) {
            alert('Please select a ticket category.');
            return;
        }

        if (!description) {
            alert('Please enter a ticket description.');
            return;
        }

        if (description.length > 650) {
            alert('Ticket description must be 650 characters or less.');
            return;
        }

        if (file && !file.type.startsWith('image/')) {
            alert('Only image files can be attached to a ticket.');
            attachmentField.value = '';
            return;
        }

        const highestTicketId = tickets.reduce((max, ticket) => Math.max(max, Number(ticket.ticketId) || 0), 0);
        const newTicket = {
            ticketId: highestTicketId + 1,
            employeeCode: currentUser.employeeCode,
            category: category,
            description: description,
            attachment: file ? file.name : null,
            status: 'pending',
            createdAt: new Date().toISOString(),
            resolvedAt: null
        };

        tickets.push(newTicket);
        refreshTicketList(currentUser.employeeCode);
        ticketForm.reset();
        if (charCount) {
            charCount.textContent = '0';
        }
        setFormOpenState(false);
    });
}

function setupTicketViewSwitch(employeeCode) {
    const ticketList = document.getElementById('ticket-list');
    const viewOptions = document.querySelectorAll('.ticket-view-option');

    if (!ticketList || !viewOptions.length) {
        return;
    }

    function renderTickets(status) {
        renderTicketList(employeeCode, status, ticketList);
    }

    viewOptions.forEach(option => {
        option.addEventListener('click', function() {
            viewOptions.forEach(button => button.classList.remove('active'));
            this.classList.add('active');
            renderTickets(this.dataset.ticketStatus);
        });
    });

    ticketList.addEventListener('click', function(e) {
        const ticketPreview = e.target.closest('.ticket-item');
        if (!ticketPreview) {
            return;
        }

        localStorage.setItem('selectedTicketId', ticketPreview.dataset.ticketId);
        window.location.href = 'ticket-view.html';
    });

    renderTickets('pending');
}

function refreshTicketList(employeeCode) {
    const ticketList = document.getElementById('ticket-list');
    const activeOption = document.querySelector('.ticket-view-option.active');
    const activeStatus = activeOption ? activeOption.dataset.ticketStatus : 'pending';

    if (ticketList) {
        renderTicketList(employeeCode, activeStatus, ticketList);
    }
}

function renderTicketList(employeeCode, status, ticketList) {
    const userTickets = tickets.filter(ticket => {
        return ticket.employeeCode === employeeCode && ticket.status === status;
    });

    ticketList.innerHTML = userTickets.length
        ? userTickets.map(ticket => renderTicketPreview(ticket)).join('')
        : '<div class="empty-ticket-state">No ' + (status === 'pending' ? 'live' : 'resolved') + ' tickets.</div>';
}

function renderTicketPreview(ticket) {
    const createdAt = new Date(ticket.createdAt).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });

    return `
        <button class="ticket-item" type="button" data-ticket-id="${ticket.ticketId}">
            <div class="ticket-item-top">
                <span class="ticket-id">#${ticket.ticketId}</span>
                <span class="ticket-category">${ticket.category}</span>
            </div>
            <div class="ticket-preview-meta">
                <span>${ticket.status === 'pending' ? 'Live' : 'Resolved'}</span>
                <span>${createdAt}</span>
            </div>
        </button>
    `;
}

function initializeTicketView() {
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    const ticketId = Number(localStorage.getItem('selectedTicketId'));
    const ticket = storedUser
        ? tickets.find(item => item.employeeCode === storedUser.employeeCode && item.ticketId === ticketId)
        : null;

    if (!storedUser || !ticket) {
        window.location.href = 'user-dashboard.html';
        return;
    }

    const titleEl = document.getElementById('ticket-view-title');
    const detailEl = document.getElementById('ticket-details');
    const attachmentText = ticket.attachment || 'None';

    if (titleEl) {
        titleEl.textContent = 'Ticket #' + ticket.ticketId;
    }

    if (detailEl) {
        detailEl.innerHTML = `
            <div class="ticket-detail-row"><span>Ticket ID</span><strong>#${ticket.ticketId}</strong></div>
            <div class="ticket-detail-row"><span>Employee Code</span><strong>${ticket.employeeCode}</strong></div>
            <div class="ticket-detail-row"><span>Category</span><strong>${ticket.category}</strong></div>
            <div class="ticket-detail-row"><span>Status</span><strong>${ticket.status === 'pending' ? 'Live' : 'Resolved'}</strong></div>
            <div class="ticket-detail-row"><span>Created</span><strong>${formatTicketDate(ticket.createdAt)}</strong></div>
            <div class="ticket-detail-row"><span>Resolved</span><strong>${ticket.resolvedAt ? formatTicketDate(ticket.resolvedAt) : 'Not resolved'}</strong></div>
            <div class="ticket-detail-row ticket-detail-description"><span>Description</span><p>${ticket.description}</p></div>
            <div class="ticket-detail-row"><span>Attachment</span><strong>${attachmentText}</strong></div>
        `;
    }
}

function formatTicketDate(dateValue) {
    return new Date(dateValue).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
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

