
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slack_channel_id VARCHAR(255) UNIQUE NOT NULL,
    team_info TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY, 
    first_name VARCHAR(255) NOT NULL, 
	title TEXT, 
	last_name TEXT,
    email VARCHAR(255) UNIQUE NOT NULL,
    slack_user_id VARCHAR(255) UNIQUE,
    slack_access_token VARCHAR(255) UNIQUE,
	check_in_time TIME NOT NULL DEFAULT NOW(),
	check_out_time TIME NOT NULL DEFAULT NOW(),
	timezone TEXT NOT NULL,
	about_you TEXT,
	location TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
);
 
CREATE TABLE user_team_mappings (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id INT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    UNIQUE (user_id, team_id)
);

CREATE TABLE checkins (
    id SERIAL PRIMARY KEY,
    slack_user_id VARCHAR(255) NOT NULL REFERENCES users(slack_user_id) ON DELETE CASCADE,
    slack_channel_id VARCHAR(255) NOT NULL REFERENCES teams(slack_channel_id) ON DELETE CASCADE,
    feeling VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    blocker TEXT NULL,
	checkin_date DATE NOT NULL
);

CREATE TABLE goals (
    id SERIAL PRIMARY KEY,
    checkin_id INT NOT NULL REFERENCES checkins(id) ON DELETE CASCADE,
    goal_text TEXT NOT NULL,
    is_smart BOOLEAN DEFAULT FALSE
);

CREATE TABLE checkouts (
    id SERIAL PRIMARY KEY,
    checkin_id INT NOT NULL REFERENCES checkins(id) ON DELETE CASCADE,
    feeling VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    blocker TEXT NULL,
	checkout_date DATE NOT NULL
);

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


CREATE TABLE user_team_role (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  team_id INTEGER NOT NULL,
  role_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

ALTER TABLE user_team_role
ADD CONSTRAINT uq_user_team_role UNIQUE (user_id, team_id, role_id);