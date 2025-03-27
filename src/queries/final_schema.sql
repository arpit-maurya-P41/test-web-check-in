-- Drop tables if they exist (for rerunning scripts safely)
DROP TABLE IF EXISTS user_role_mapping, user_team_mapping, sessions, checkouts, checkins, users, roles, teams CASCADE;

-- 1️⃣ Roles Table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

-- 2️⃣ Teams Table
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slack_channel_id VARCHAR(50) UNIQUE NOT NULL
);

-- 3️⃣ Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    slack_user_id VARCHAR(50) UNIQUE NOT NULL
);

-- 4️⃣ User-Role Mapping (Many-to-Many)
CREATE TABLE user_role_mapping (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE (user_id, role_id) -- Prevent duplicate role assignments
);

-- 5️⃣ User-Team Mapping (Many-to-Many)
CREATE TABLE user_team_mapping (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    team_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    UNIQUE (user_id, team_id) -- Prevent duplicate team assignments
);

-- 6️⃣ Check-ins Table (Updated goals/blockers + default date)
CREATE TABLE checkins (
    id SERIAL PRIMARY KEY,
    slack_user_id VARCHAR(50) NOT NULL,
    slack_channel_id VARCHAR(50) NOT NULL,
    goals TEXT NOT NULL,       -- Renamed from goal
    blockers TEXT,             -- Renamed from blocker
    feeling VARCHAR(20) CHECK (feeling IN ('happy', 'neutral', 'frustrated', 'excited', 'tired')),
    is_smart_goal BOOLEAN DEFAULT FALSE,
    date DATE DEFAULT CURRENT_DATE NOT NULL, -- Default value to today
    created_at TIMESTAMP DEFAULT NOW()
);

-- 7️⃣ Check-outs Table (Added date with default value)
CREATE TABLE checkouts (
    id SERIAL PRIMARY KEY,
    slack_user_id VARCHAR(50) NOT NULL,
    slack_channel_id VARCHAR(50) NOT NULL,
    updates TEXT NOT NULL,
    blockers TEXT,
    goals_met BOOLEAN DEFAULT FALSE,
    feeling VARCHAR(20) CHECK (feeling IN ('happy', 'neutral', 'frustrated', 'excited', 'tired')),
    date DATE DEFAULT CURRENT_DATE NOT NULL, -- New column with default today
    created_at TIMESTAMP DEFAULT NOW()
);

-- 8️⃣ Sessions Table (Removed token)
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
