document.addEventListener('DOMContentLoaded', function() {
    applyStoredDarkMode();
    setupDropdown();
    Login();
    showUserName();
    Logout();
    setupNotificationPanel();
    setupTicketForm();
    setupTicketList();
    setupTicketDetails();
    setupCommentSection();
    setupRegistrationPanel();
    setupBackButton();
    setupDeleteTicketButton();
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

function showUserName() {

    const greetTopBar = document.getElementById('welcome-name');
    const userName = localStorage.getItem('userName');

    if (greetTopBar) {
        greetTopBar.innerText = `Hello, ${userName}`; 
    }
}

async function forceLogout() {

    const authData = JSON.parse(localStorage.getItem('authData'));

    try {
        await fetch('http://127.0.0.1:8000/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "refresh_token": authData.refresh_token })
        });
    }
    catch (error) {
        //no need to alert the user here, as we want to log them out regardless of server response
    }
        
        localStorage.removeItem('authData');
        window.location.href = 'login.html';
}

async function forceBackToDashboard() {
    try{

        const response = await fetchWithAuth('http://127.0.0.1:8000/back_to_dashboard', {
            method: 'GET'});
        
        if (!response.ok) {
            let errorData = await response.json();
                
            alert('Error: ' + (errorData.detail || 'Something went wrong'));
            return;
        }

        const path = await response.json();

        window.location.href = path.path;
    }

    catch (error) {
        alert('Could not reach the server.');
    }
}


/*TOKEN CYCLE HANDLERS*/

async function requestNewTokens() {

    const authData = JSON.parse(localStorage.getItem('authData'));
    const endpoint = 'http://127.0.0.1:8000/refresh_token';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({"refresh_token": authData.refresh_token})
        });

        if (!response.ok) {
            let errorData = await response.json();
            alert('Error: ' + (errorData.detail || 'Something went wrong'));
            await forceLogout();
            return false;
        }

        const newAuthData = await response.json();
        localStorage.setItem('authData', JSON.stringify(newAuthData));
        return true;
    }
    catch (error) {
        alert('Could not reach the server.');
        return false;
    }
}


async function fetchWithAuth(endpoint, options = {}) {
    const authData = JSON.parse(localStorage.getItem('authData'));

    options.headers = {
        ...options.headers,
        'Authorization': authData.token_type + ' ' + authData.access_token
    };

    let response = await fetch(endpoint, options);

    if (response.status === 401) {
        const refreshed = await requestNewTokens();
        if (!refreshed) {
            return response;
        }

        const newAuthData = JSON.parse(localStorage.getItem('authData'));
        options.headers['Authorization'] = newAuthData.token_type + ' ' + newAuthData.access_token;
        response = await fetch(endpoint, options);

    }

    if (response.status === 403) {
        await forceLogout();
        return response;
    }


    return response;
}

/*-------------*/


function Login() {

    const userLogin = document.getElementById('login-form');
    const adminLogin = document.getElementById('admin-login-form');
    const loginForm = userLogin || adminLogin;

    if (!loginForm) {
        return;
    }

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        let payload;
        let endpoint;

        if (userLogin) {

        const employeeCode = document.getElementById('employee-code').value;
        const password = document.getElementById('password').value;

        payload = {
            employee_code: employeeCode,
            password: password
        };

        endpoint = 'http://127.0.0.1:8000/user_login';

        }

        else if (adminLogin) {

        const adminCode = document.getElementById('admin-code').value;
        const password = document.getElementById('admin-password').value;

        payload = {
            admin_code: adminCode,
            password: password
        };

        endpoint = 'http://127.0.0.1:8000/admin_login';

        }

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

        if (!response.ok) {
            let errorData = await response.json();
             
                alert('Error: ' + (errorData.detail || 'Something went wrong'));
                return;
                
        }

        const authDataAndName = await response.json();
        const authData = {'access_token': authDataAndName.access_token, 'refresh_token': authDataAndName.refresh_token, 'token_type': authDataAndName.token_type}
        const currentUserName = authDataAndName.user_name;
        localStorage.setItem('authData', JSON.stringify(authData));
        localStorage.setItem('userName', currentUserName);
        window.location.href = userLogin ? 'user-dashboard.html' : 'admin-dashboard.html';
        alert('Login successful! Redirecting...');
        }
        
        catch (error) {
        alert('Could not reach the server.');
        }
    })
}    

function Logout() {

    const logOut = document.getElementById('logout-btn');

    if (!logOut) {
        return;
    }

    logOut.addEventListener('click', async function(event) {
        event.preventDefault();
        
        await forceLogout();

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
    const form = document.getElementById('new-ticket-form')

     if (!toggleButton || !formWrapper || !form) {
        return;
    }

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

    form.addEventListener('submit', async function(event) {

        event.preventDefault();

        const category = document.getElementById('ticket-category').value;
        const description = document.getElementById('ticket-description').value;
        const attachmentInput = document.getElementById('ticket-attachment');

        const formData = new FormData();
        formData.append('category', category);
        formData.append('description', description);

        if (attachmentInput.files[0]) {
            formData.append('attachment', attachmentInput.files[0]);
        }

        try {
            
            const response = await fetchWithAuth('http://127.0.0.1:8000/create_ticket', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert('Error: ' + (errorData.detail || 'Something went wrong'));
            return;
        }

        alert('Ticket created successfully!');
        setupTicketList();
        form.reset();
        }

        catch (error) {
        alert('Could not reach the server.');
        }

    });

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
        form.reset();
        const isAdmin = mode === 'admin';
        title.textContent = isAdmin ? 'Create New Admin' : 'Create New User';
        userFields.hidden = isAdmin;
        adminFields.hidden = !isAdmin;
        userFields.querySelectorAll('input').forEach(function(input) {
            input.required = !isAdmin;
        });
        adminFields.querySelectorAll('input').forEach(function(input) {
            input.required = isAdmin;
        });
        panel.classList.add('open');
        document.body.classList.add('registration-open');
    }

    function closePanel() {
        panel.classList.remove('open');
        document.body.classList.remove('registration-open');
        form.reset();
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

    form.addEventListener('submit', async function(event) {

        event.preventDefault();

        const isAdmin = !adminFields.hidden;
        const registrationPassword = document.getElementById('registration-password').value;
        const registrationPasswordConfirm = document.getElementById('registration-password-confirm').value;
        let adminCode, userName, employeeCode;
        const validationErrors = {
            adminCode: document.getElementById('admin-code-error'),
            userName: document.getElementById('user-name-error'),
            employeeCode: document.getElementById('employee-code-error'),
            password: document.getElementById('registration-password-error'),
            passwordConfirm: document.getElementById('registration-password-confirm-error')
        };

        Object.values(validationErrors).forEach(function(errorElement) {
            errorElement.hidden = true;
        });

        if(isAdmin){
            adminCode = document.getElementById('admin-code').value;
            if (adminCode.length < 3 || adminCode.length > 20) {
                validationErrors.adminCode.hidden = false;
                return;
            }

        }

        else if (!isAdmin) {
            userName = document.getElementById('user-name').value;
            if (userName.length > 100) {
                validationErrors.userName.hidden = false;
                return;
            }
            employeeCode = document.getElementById('employee-code').value;
            if (employeeCode.length < 3 || employeeCode.length > 20) {
                validationErrors.employeeCode.hidden = false;
                return;
            }

        }

        if (registrationPassword.length < 8 || registrationPassword.length > 100) {
            validationErrors.password.hidden = false;
            return;
        }
        else if (registrationPassword !== registrationPasswordConfirm) {
            validationErrors.passwordConfirm.hidden = false;
            return;
        }
        
        const payload = isAdmin
            ? {
                admin_code: adminCode,
                password: registrationPassword,
                password_confirm: registrationPasswordConfirm
            }
            : {
                name: userName,
                employee_code: employeeCode,
                password: registrationPassword,
                password_confirm: registrationPasswordConfirm
            };

        const endpoint = isAdmin ? 'http://127.0.0.1:8000/admins' : 'http://127.0.0.1:8000/users';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

        if (!response.ok) {
            let errorData = await response.json();
             
                alert('Error: ' + (errorData.detail || 'Something went wrong'));
                return;
                
        }

        alert('Created successfully!');
        closePanel();
        form.reset();

        }
        
        catch (error) {
        alert('Could not reach the server.');
        }
        
    });
}

function setupTicketList() {
    const ticketList = document.getElementById('ticket-list');
    const viewOptions = document.querySelectorAll('[data-ticket-status]');

    if (!ticketList) {
        return;
    }

    async function loadTickets() {
        const status = ticketList.dataset.activeStatus;

        const response = await fetchWithAuth('http://127.0.0.1:8000/tickets', {
            method: 'GET'
        });

        if (!response.ok) {
            return;
        }

        const data = await response.json();

        ticketList.innerHTML = '';

        data.tickets
            .filter(function(ticket) { return ticket.status === status; })
            .forEach(function(ticket) {
                const ticketElement = document.createElement('div');
                ticketElement.classList.add('ticket-item');
                ticketElement.dataset.ticketId = ticket.ticket_id;
                ticketElement.innerHTML = `
                    <span class='ticket-id ticket-item-top'>Ticket ID: #${ticket.ticket_id}</span>
                    <span class='ticket-category'>${ticket.category}</span>
                    <span class='ticket-detail'>${ticket.created_at}</span>
                `;
                ticketList.appendChild(ticketElement);
            });
    }

    viewOptions.forEach(function(option) {
        option.addEventListener('click', function() {
            viewOptions.forEach(function(btn) { btn.classList.remove('active'); });
            option.classList.add('active');
            ticketList.dataset.activeStatus = option.dataset.ticketStatus;
            loadTickets();
        });
    });

    ticketList.addEventListener('click', function(event) {
        const ticketItem = event.target.closest('.ticket-item');
        if (!ticketItem) {
            return;
        }
        window.location.href = 'ticket-view.html?ticket_id=' + ticketItem.dataset.ticketId;
    });

    loadTickets();
}

async function setupTicketDetails() {
    const detailsContainer = document.getElementById('ticket-details');
    if (!detailsContainer) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const ticketId = params.get('ticket_id');

    if (!ticketId) {
        detailsContainer.innerHTML = '<p>No ticket specified.</p>';
        return;
    }

    const response = await fetchWithAuth('http://127.0.0.1:8000/tickets?ticket_id=' + ticketId, {
        method: 'GET'
    });

    if (!response.ok) {
        detailsContainer.innerHTML = '<p>Could not load ticket.</p>';
        return;
    }

    const data = await response.json();
    const ticket = data.ticket;

    detailsContainer.innerHTML = `
        <p><strong>Category:</strong> ${ticket.category}</p>
        <p><strong>Status:</strong> ${ticket.status}</p>
        <p><strong>Description:</strong> ${ticket.description}</p>
    `;
}

function setupBackButton() {
    const backButton = document.getElementById('back-to-tickets');
    if (!backButton) {
        return;
    }
    backButton.addEventListener('click', async function() {
        await forceBackToDashboard();
    });
}

function setupDeleteTicketButton() {

    const deleteButton = document.getElementById('delete-ticket');

    if (!deleteButton){
        return;
    }


    deleteButton.addEventListener('click', async function() {
    
        const params = new URLSearchParams(window.location.search);
        const ticket_id = params.get('ticket_id');

        try{

            const response = await fetchWithAuth('http://127.0.0.1:8000/tickets/' + ticket_id, {
                method: 'DELETE'
            })

            if (!response.ok) {
                let errorData = await response.json();
                
                alert('Error: ' + (errorData.detail || 'Something went wrong'));
                return;
            }

            await forceBackToDashboard();

        }

        catch (error) {
        alert('Could not reach the server.');
        }

    });

}

function setupCommentSection() {
    const commentList = document.getElementById('comment-list');
    const commentForm = document.getElementById('comment-form');
    const messageField = document.getElementById('comment-message');

    if (!commentList || !commentForm) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const ticketId = params.get('ticket_id');

    if (!ticketId) {
        return;
    }

    async function loadComments() {
        const response = await fetchWithAuth('http://127.0.0.1:8000/get_comment?ticket_id=' + ticketId, {
            method: 'GET'
        });

        if (!response.ok) {
            return;
        }

        const data = await response.json();

        commentList.innerHTML = '';

        data.comments.forEach(function(comment) {
            const commentElement = document.createElement('div');
            commentElement.classList.add('comment-item');

            const author = comment.admin_code ? comment.admin_code : comment.employee_code;

            commentElement.innerHTML = `
                <p><strong>${author}:</strong> ${comment.message}</p>
                <span class="comment-time">${new Date(comment.created_at).toLocaleString()}</span>
            `;
            commentList.appendChild(commentElement);
        });
    }

    commentForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const message = messageField.value;

        const response = await fetchWithAuth('http://127.0.0.1:8000/push_comment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ticket_id: parseInt(ticketId),
                message: message
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert('Error: ' + (errorData.detail || 'Something went wrong'));
            return;
        }

        messageField.value = '';
        loadComments();
    });

    loadComments();
}