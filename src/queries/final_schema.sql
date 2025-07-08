
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

ALTER TABLE user_team_role
ADD COLUMN check_in BOOLEAN DEFAULT TRUE;


ALTER TABLE checkins
ADD COLUMN user_id INTEGER,
ADD COLUMN team_id INTEGER,
ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
ALTER COLUMN user_id SET NOT NULL,
ALTER COLUMN team_id SET NOT NULL;


CREATE TABLE daily_user_checkins	 (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  team_id INTEGER NOT NULL,
  check_in_date DATE NOT NULL,
  has_checked_in BOOLEAN DEFAULT FALSE,
  has_participated BOOLEAN,
  is_blocked BOOLEAN,
  smart_goals INTEGER, 
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_check_in_date_team ON daily_user_checkins (check_in_date, team_id);
CREATE INDEX idx_user_check_user ON daily_user_checkins (user_id);
CREATE INDEX idx_user_check_is_active ON daily_user_checkins (is_active);




CREATE OR REPLACE FUNCTION insert_daily_user_checkins() 
RETURNS TRIGGER AS $$
DECLARE
  total_goals INTEGER;
  smart_goals INTEGER;
  smart_goal_percentage NUMERIC;
BEGIN
  -- Count total and smart goals for this checkin
  SELECT COUNT(*), COALESCE(SUM(CASE WHEN is_smart THEN 1 ELSE 0 END), 0)
  INTO total_goals, smart_goals
  FROM goals
  WHERE checkin_id = NEW.id;

  IF total_goals > 0 THEN
    smart_goal_percentage := ROUND((smart_goals::NUMERIC / total_goals) * 100);
  ELSE
    smart_goal_percentage := 0;
  END IF;


  UPDATE daily_user_checkins
  SET
    is_blocked = (NEW.blocker IS NOT NULL AND LENGTH(TRIM(NEW.blocker)) > 0),
    has_checked_in = TRUE,
    has_participated = TRUE,
    smart_goals = smart_goal_percentage,
    updated_at = CURRENT_TIMESTAMP
  WHERE user_id = NEW.user_id
    AND team_id = NEW.team_id
    AND check_in_date = NEW.checkin_date;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;



CREATE TRIGGER trg_insert_daily_user_checkins
AFTER INSERT ON checkins
FOR EACH ROW
EXECUTE FUNCTION insert_daily_user_checkins();

CREATE TRIGGER trg_update_daily_user_checkins
AFTER UPDATE ON checkins
FOR EACH ROW
EXECUTE FUNCTION insert_daily_user_checkins();


ALTER TABLE daily_user_checkins
ADD CONSTRAINT unique_user_team_date UNIQUE (user_id, team_id, check_in_date);
