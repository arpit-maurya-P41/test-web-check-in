-- 🚀 Teams Table
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slack_channel_id VARCHAR(255) UNIQUE NOT NULL
);

-- 🚀 Roles Table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(255) UNIQUE NOT NULL,
    can_manage_teams BOOLEAN DEFAULT FALSE NOT NULL,
    can_manage_users BOOLEAN DEFAULT FALSE NOT NULL,
    can_view_reports BOOLEAN DEFAULT FALSE NOT NULL,
    can_manage_roles BOOLEAN DEFAULT FALSE NOT NULL
);

-- 🚀 Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
	title TEXT,
    first_name VARCHAR(255) NOT NULL,
	last_name TEXT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    slack_user_id VARCHAR(255) UNIQUE NOT NULL,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
	check_in_time TIME NOT NULL DEFAULT NOW(),
	check_out_time TIME NOT NULL DEFAULT NOW(),
	timezone TEXT,
	about_you TEXT,
	location TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);
 

-- 🚀 User & Team Mappings Table (Renamed for consistency)
CREATE TABLE user_team_mappings (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id INT NOT NULL REFERENCES teams(id) ON DELETE CASCADE
);

-- 🚀 Check-ins Table
CREATE TABLE checkins (
    id SERIAL PRIMARY KEY,
    slack_user_id VARCHAR(255) NOT NULL REFERENCES users(slack_user_id) ON DELETE CASCADE,
    slack_channel_id VARCHAR(255) NOT NULL REFERENCES teams(slack_channel_id) ON DELETE CASCADE,
    feeling VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    blocker TEXT NULL,
	checkin_date DATE NOT NULL
);

-- 🚀 Goals Table (Stores Goals for Check-ins)
CREATE TABLE goals (
    id SERIAL PRIMARY KEY,
    checkin_id INT NOT NULL REFERENCES checkins(id) ON DELETE CASCADE,
    goal_text TEXT NOT NULL,
    is_smart BOOLEAN DEFAULT FALSE
);

-- 🚀 Checkouts Table (Now References Goal Progress)
CREATE TABLE checkouts (
    id SERIAL PRIMARY KEY,
    checkin_id INT NOT NULL REFERENCES checkins(id) ON DELETE CASCADE,
    feeling VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    blocker TEXT NULL,
	checkout_date DATE NOT NULL
);

-- 🚀 Goal Progress Table (Tracks if a Goal was Met)
CREATE TABLE goal_progress (
    id SERIAL PRIMARY KEY,
    goal_id INT UNIQUE NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    checkout_id INT NOT NULL REFERENCES checkouts(id) ON DELETE CASCADE,
    is_met BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
); 

CREATE TABLE users_notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(255) NOT NULL,
    notification_status VARCHAR(255) NOT NULL DEFAULT 'pending', 
    retry_count INT NOT NULL DEFAULT 0,
    error_message VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION check_retry_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.retry_count > 3 AND NEW.notification_status != 'failure') THEN
        UPDATE users_notifications 
        SET notification_status = 'failure', updated_at = NOW()
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_retry_count
AFTER UPDATE ON users_notifications
FOR EACH ROW 
WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION check_retry_count();

ALTER TABLE user_team_mappings
ADD CONSTRAINT unique_user_team UNIQUE (user_id, team_id);

ALTER TABLE users ADD column is_admin BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE teams ADD column is_active BOOLEAN NOT NULL DEFAULT true

ALTER TABLE users ALTER COLUMN slack_user_id DROP NOT NULL;
