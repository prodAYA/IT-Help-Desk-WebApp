CREATE TABLE IF NOT EXISTS users (

    employee_code VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP

);

CREATE TABLE IF NOT EXISTS admins (

	admin_code VARCHAR(20) PRIMARY KEY,
	password_hash VARCHAR(255) NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP

);

CREATE TABLE IF NOT EXISTS categories (

    category_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE

);

INSERT INTO categories (category_name) VALUES

    ('Network'),
    ('Hardware'),
    ('Software'),
    ('Account / Access'),
    ('Email / Collaboration'),
    ('Security'),
    ('Other')
	
ON CONFLICT (category_name) DO NOTHING;

CREATE TABLE IF NOT EXISTS statuses (

	status_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    status_name VARCHAR(25) NOT NULL UNIQUE

);

INSERT INTO statuses (status_name) VALUES

    ('Live'),
    ('Resolved')
	
ON CONFLICT (status_name) DO NOTHING;

CREATE TABLE IF NOT EXISTS tickets (

    ticket_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	employee_code VARCHAR(7) NOT NULL REFERENCES users(employee_code) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES categories(category_id) ON DELETE RESTRICT,
    status_id INT NOT NULL REFERENCES statuses(status_id) ON DELETE RESTRICT,
	description VARCHAR(650) NOT NULL,
    attachment_path VARCHAR(255),
	created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ
	
);

CREATE TABLE IF NOT EXISTS notifications (

    notification_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	employee_code VARCHAR(7) NOT NULL REFERENCES users(employee_code) ON DELETE CASCADE,
    ticket_id INT REFERENCES tickets(ticket_id) ON DELETE CASCADE,
	message VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
	
);

CREATE TABLE IF NOT EXISTS comments (
    
	comment_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	ticket_id INT NOT NULL REFERENCES tickets(ticket_id) ON DELETE CASCADE,
    employee_code VARCHAR(7) REFERENCES users(employee_code) ON DELETE CASCADE,
    admin_code VARCHAR(7) REFERENCES admins(admin_code) ON DELETE CASCADE,
	message VARCHAR(350) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT one_author_only CHECK (
    
		(employee_code IS NOT NULL AND admin_code IS NULL)
        OR
        (employee_code IS NULL AND admin_code IS NOT NULL)
    
	)

);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    token_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_code VARCHAR(7) REFERENCES users(employee_code) ON DELETE CASCADE,
    admin_code VARCHAR(7) REFERENCES admins(admin_code) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP

    CONSTRAINT one_owner_only CHECK (
    
		(employee_code IS NOT NULL AND admin_code IS NULL)
        OR
        (employee_code IS NULL AND admin_code IS NOT NULL)
    
	)

);

TRUNCATE TABLE RESTART IDENTITY CASCADE;

SELECT * FROM admins;

SELECT * FROM users;

SELECT * FROM refresh_tokens;

SELECT * FROM tickets;

SELECT * FROM notifications;