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
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    slack_user_id VARCHAR(255) UNIQUE NOT NULL,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE cascade
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
    blocker TEXT NULL
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
    blocker TEXT NULL
);

-- 🚀 Goal Progress Table (Tracks if a Goal was Met)
CREATE TABLE goal_progress (
    id SERIAL PRIMARY KEY,
    goal_id INT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    checkout_id INT NOT NULL REFERENCES checkouts(id) ON DELETE CASCADE,
    is_met BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 🚀 Sessions Table (User Authentication Tracking)
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL
);

ALTER TABLE users
ADD COLUMN check_in_time VARCHAR(5) NOT NULL DEFAULT '10:00',
ADD COLUMN check_out_time VARCHAR(5) NOT NULL DEFAULT '18:00',
ADD COLUMN timezone TEXT,
ADD COLUMN about_you TEXT,
ADD COLUMN location TEXT,
ADD COLUMN last_name TEXT,
ADD COLUMN title TEXT;

ALTER TABLE users 
RENAME COLUMN name TO first_name;

ALTER TABLE goals
    ADD CONSTRAINT fk_goals_checkin FOREIGN KEY (checkin_id) REFERENCES checkins (id);

ALTER TABLE goal_progress
ADD CONSTRAINT uq_goals_progress_goal_id
UNIQUE (goal_id);