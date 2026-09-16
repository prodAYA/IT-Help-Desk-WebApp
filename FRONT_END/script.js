document.addEventListener('DOMContentLoaded', function() {
    applyStoredDarkMode();
    setupDropdown();
    setupNotificationPanel();
    setupTicketForm();
    setupRegistrationPanel();
    setupAdminTicketSection();
    setupBackButton();
});

function applyStoredDarkMode() {
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }

    updateDarkModeButtonText();
}

function updateDarkModeButtonText() {
    document.querySelectorAll('#darkmode-toggle').forEach(function(toggle) {
        toggle.textContent = document.body.classList.contains('dark-mode')
            ? '☀️ Disable Dark Mode'
            : '🌙 Enable Dark Mode';
    });
}

function setupDropdown() {
    document.querySelectorAll('.dropdown-btn').forEach(function(button) {
        button.addEventListener('click', function(event) {
            event.stopPropagation();
            const menu = button.nextElementSibling;

            document.querySelectorAll('.dropdown-content.active').forEach(function(activeMenu) {
                if (activeMenu !== menu) {
                    activeMenu.classList.remove('active');
                }
            });

            menu.classList.toggle('active');
        });
    });

    document.querySelectorAll('.dropdown-content a').forEach(function(link) {
        link.addEventListener('click', function() {
            document.querySelectorAll('.dropdown-content').forEach(function(menu) {
                menu.classList.remove('active');
            });
        });
    });

    document.addEventListener('click', function() {
        document.querySelectorAll('.dropdown-content.active').forEach(function(menu) {
            menu.classList.remove('active');
        });
    });

    document.querySelectorAll('#darkmode-toggle').forEach(function(toggle) {
        toggle.addEventListener('click', function(event) {
            event.preventDefault();
            document.body.classList.toggle('dark-mode');
            localStorage.setItem(
                'darkMode',
                document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled'
            );
            updateDarkModeButtonText();
        });
    });
}

function setupNotificationPanel() {
    const notificationButton = document.getElementById('notification-btn');
    const notificationPanel = document.getElementById('notification-panel');
    const closeButton = document.getElementById('close-notifications');

    if (!notificationButton || !notificationPanel) {
        return;
    }

    function setPanelOpen(isOpen) {
        notificationPanel.classList.toggle('open', isOpen);
        document.body.classList.toggle('notifications-open', isOpen);
    }

    notificationButton.addEventListener('click', function() {
        setPanelOpen(!notificationPanel.classList.contains('open'));
    });

    if (closeButton) {
        closeButton.addEventListener('click', function() {
            setPanelOpen(false);
        });
    }
}

function setupTicketForm() {
    const toggleButton = document.getElementById('toggle-ticket-form');
    const formWrapper = document.getElementById('ticket-form-wrapper');
    const descriptionField = document.getElementById('ticket-description');
    const characterCount = document.getElementById('ticket-char-count');

    if (toggleButton && formWrapper) {
        toggleButton.addEventListener('click', function() {
            const isOpen = formWrapper.classList.toggle('open');
            formWrapper.classList.toggle('collapsed', !isOpen);
            toggleButton.textContent = isOpen ? 'Cancel' : 'Create New Ticket';
            toggleButton.classList.toggle('cancel-mode', isOpen);
        });
    }

    if (descriptionField && characterCount) {
        descriptionField.addEventListener('input', function() {
            characterCount.textContent = descriptionField.value.length;
        });
    }
}

function setupRegistrationPanel() {
    const panel = document.getElementById('registration-panel');
    const form = document.getElementById('registration-form');
    const title = document.getElementById('registration-title');
    const userFields = document.getElementById('user-registration-fields');
    const adminFields = document.getElementById('admin-registration-fields');
    const userLink = document.getElementById('create-user-link');
    const adminLink = document.getElementById('create-admin-link');
    const closeButton = document.getElementById('close-registration');

    if (!panel || !form || !title || !userFields || !adminFields) {
        return;
    }

    function openPanel(mode) {
        const isAdmin = mode === 'admin';
        title.textContent = isAdmin ? 'Create New Admin' : 'Create New User';
        userFields.hidden = isAdmin;
        adminFields.hidden = !isAdmin;
        panel.classList.add('open');
        document.body.classList.add('registration-open');
    }

    function closePanel() {
        panel.classList.remove('open');
        document.body.classList.remove('registration-open');
    }

    if (userLink) {
        userLink.addEventListener('click', function(event) {
            event.preventDefault();
            openPanel('user');
        });
    }

    if (adminLink) {
        adminLink.addEventListener('click', function(event) {
            event.preventDefault();
            openPanel('admin');
        });
    }

    if (closeButton) {
        closeButton.addEventListener('click', closePanel);
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();
    });
}

function setupAdminTicketSection() {
    const ticketList = document.getElementById('admin-ticket-list');
    const viewOptions = document.querySelectorAll('[data-admin-ticket-status]');

    if (!ticketList || !viewOptions.length) {
        return;
    }

    viewOptions.forEach(function(option) {
        option.addEventListener('click', function() {
            viewOptions.forEach(function(button) {
                button.classList.remove('active');
            });

            option.classList.add('active');
            ticketList.dataset.activeStatus = option.dataset.adminTicketStatus;
        });
    });

    ticketList.addEventListener('click', function(event) {
        const selection = event.target.closest('.admin-ticket-select');
        if (selection) {
            const ticketItem = selection.closest('.admin-ticket-item');
            if (ticketItem) {
                ticketItem.classList.toggle('selected', selection.checked);
            }
            return;
        }

        const ticketItem = event.target.closest('.admin-ticket-item');
        if (!ticketItem) {
            return;
        }

        window.location.href = 'ticket-view.html';
    });
}

function setupBackButton() {
    const backButton = document.getElementById('back-to-tickets');
    if (!backButton) {
        return;
    }
    backButton.addEventListener('click', function() {
        window.history.back();
    });
}