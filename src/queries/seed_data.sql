-- Seed Data for Teams
INSERT INTO teams (name, slack_channel_id) VALUES 
('Augeo', 'C08FD2CP3T9'),
('RepSpark', 'C08FEE2J8TF'),
('Nigel', 'C08F79MUE04');

-- Seed Data for Roles
INSERT INTO roles (role_name, can_manage_teams, can_manage_users, can_view_reports) VALUES 
('Admin', true, true, true),
('QA', false, false, false);

-- Seed Data for Users
INSERT INTO users (name, email, password, slack_user_id, role_id) VALUES 
('Vivek', 'vivek@example.com', 'password123', 'U08F2KGPG7P', (SELECT id FROM roles WHERE role_name = 'Admin')),
('Kajal', 'kajal@example.com', 'password123', 'U08H3T0547J', (SELECT id FROM roles WHERE role_name = 'QA'));

-- Seed Data for User & Team Mappings
INSERT INTO user_team_mappings (user_id, team_id) VALUES
((SELECT id FROM users WHERE email = 'vivek@example.com'), (SELECT id FROM teams WHERE name = 'Augeo')),
((SELECT id FROM users WHERE email = 'vivek@example.com'), (SELECT id FROM teams WHERE name = 'RepSpark')),
((SELECT id FROM users WHERE email = 'vivek@example.com'), (SELECT id FROM teams WHERE name = 'Nigel')),
((SELECT id FROM users WHERE email = 'kajal@example.com'), (SELECT id FROM teams WHERE name = 'Augeo')),
((SELECT id FROM users WHERE email = 'kajal@example.com'), (SELECT id FROM teams WHERE name = 'RepSpark')),
((SELECT id FROM users WHERE email = 'kajal@example.com'), (SELECT id FROM teams WHERE name = 'Nigel'));

-- Vivek Check-ins (SMART Goals, Blockers, Feelings)
INSERT INTO checkins (slack_user_id, slack_channel_id, feeling, created_at) VALUES
('D08F2KGSK8V', 'C08FD2CP3T9', 'excited', NOW() - INTERVAL '1 day'), -- Augeo Checkin
('D08F2KGSK8V', 'C08FEE2J8TF', 'neutral', NOW() - INTERVAL '2 days'), -- RepSpark Checkin
('D08F2KGSK8V', 'C08F79MUE04', 'neutral', NOW() - INTERVAL '3 days'), -- Nigel Checkin
('D08F2KGSK8V', 'C08FD2CP3T9', null, NOW() - INTERVAL '4 days'),
('D08F2KGSK8V', 'C08FEE2J8TF', null, NOW() - INTERVAL '5 days');

-- Goals for Vivek's Checkins (SMART and Blockers)
INSERT INTO goals (checkin_id, goal_text, is_smart) VALUES
((SELECT id FROM checkins WHERE slack_user_id = 'D08F2KGSK8V' AND slack_channel_id = 'C08FD2CP3T9' LIMIT 1), 'Complete the UI design for the new feature', TRUE),
((SELECT id FROM checkins WHERE slack_user_id = 'D08F2KGSK8V' AND slack_channel_id = 'C08FEE2J8TF' LIMIT 1), 'Finish the API integration', FALSE),
((SELECT id FROM checkins WHERE slack_user_id = 'D08F2KGSK8V' AND slack_channel_id = 'C08F79MUE04' LIMIT 1), 'Attend the project meeting', TRUE),
((SELECT id FROM checkins WHERE slack_user_id = 'D08F2KGSK8V' AND slack_channel_id = 'C08FD2CP3T9' LIMIT 1), 'Fix the bug reported by the customer', FALSE),
((SELECT id FROM checkins WHERE slack_user_id = 'D08F2KGSK8V' AND slack_channel_id = 'C08FEE2J8TF' LIMIT 1), 'Update the test cases', TRUE);

-- Seed Goal Progress (Status Tracking)
INSERT INTO goal_progress (goal_id, is_met) VALUES
((SELECT id FROM goals WHERE goal_text = 'Complete the UI design for the new feature' LIMIT 1), TRUE),
((SELECT id FROM goals WHERE goal_text = 'Finish the API integration' LIMIT 1), FALSE),
((SELECT id FROM goals WHERE goal_text = 'Attend the project meeting' LIMIT 1), TRUE),
((SELECT id FROM goals WHERE goal_text = 'Fix the bug reported by the customer' LIMIT 1), FALSE),
((SELECT id FROM goals WHERE goal_text = 'Update the test cases' LIMIT 1), TRUE);

-- Seed Data for Checkouts (Goal Progress, Missed, Feelings)
INSERT INTO checkouts (slack_user_id, slack_channel_id, goal_progress_id, feeling, created_at) VALUES
('D08F2KGSK8V', 'C08FD2CP3T9', (SELECT id FROM goal_progress WHERE goal_id = (SELECT id FROM goals WHERE goal_text = 'Complete the UI design for the new feature' LIMIT 1)), 'Satisfied', NOW() - INTERVAL '1 day'),
('D08F2KGSK8V', 'C08FEE2J8TF', (SELECT id FROM goal_progress WHERE goal_id = (SELECT id FROM goals WHERE goal_text = 'Finish the API integration' LIMIT 1)), 'Frustrated', NOW() - INTERVAL '2 days'),
('D08F2KGSK8V', 'C08F79MUE04', (SELECT id FROM goal_progress WHERE goal_id = (SELECT id FROM goals WHERE goal_text = 'Attend the project meeting' LIMIT 1)), 'Neutral', NOW() - INTERVAL '3 days'),
('D08F2KGSK8V', 'C08FD2CP3T9', (SELECT id FROM goal_progress WHERE goal_id = (SELECT id FROM goals WHERE goal_text = 'Fix the bug reported by the customer' LIMIT 1)), 'Disappointed', NOW() - INTERVAL '4 days'),
('D08F2KGSK8V', 'C08FEE2J8TF', (SELECT id FROM goal_progress WHERE goal_id = (SELECT id FROM goals WHERE goal_text = 'Update the test cases' LIMIT 1)), 'Optimistic', NOW() - INTERVAL '5 days');

-- Seed Data for Kajal Check-ins (SMART Goals, Blockers, Feelings)
INSERT INTO checkins (slack_user_id, slack_channel_id, feeling, created_at) VALUES
('D08H3T0DQE4', 'C08FD2CP3T9', 'Feeling stressed but optimistic', NOW() - INTERVAL '1 day'), -- Augeo Checkin
('D08H3T0DQE4', 'C08FEE2J8TF', 'Frustrated', NOW() - INTERVAL '2 days'), -- RepSpark Checkin
('D08H3T0DQE4', 'C08F79MUE04', 'Motivated', NOW() - INTERVAL '3 days'), -- Nigel Checkin
('D08H3T0DQE4', 'C08FD2CP3T9', 'Neutral', NOW() - INTERVAL '4 days'),
('D08H3T0DQE4', 'C08FEE2J8TF', 'Happy', NOW() - INTERVAL '5 days');

-- Goals for Kajal's Checkins (SMART and Blockers)
INSERT INTO goals (checkin_id, goal_text, is_smart) VALUES
((SELECT id FROM checkins WHERE slack_user_id = 'D08H3T0DQE4' AND slack_channel_id = 'C08FD2CP3T9' LIMIT 1), 'Complete QA tests for new feature', TRUE),
((SELECT id FROM checkins WHERE slack_user_id = 'D08H3T0DQE4' AND slack_channel_id = 'C08FEE2J8TF' LIMIT 1), 'Write automated test scripts for the module', FALSE),
((SELECT id FROM checkins WHERE slack_user_id = 'D08H3T0DQE4' AND slack_channel_id = 'C08F79MUE04' LIMIT 1), 'Review user feedback and prioritize bugs', TRUE),
((SELECT id FROM checkins WHERE slack_user_id = 'D08H3T0DQE4' AND slack_channel_id = 'C08FD2CP3T9' LIMIT 1), 'Test the integration between modules', FALSE),
((SELECT id FROM checkins WHERE slack_user_id = 'D08H3T0DQE4' AND slack_channel_id = 'C08FEE2J8TF' LIMIT 1), 'Fix issues found in last sprint’s testing', TRUE);

-- Seed Goal Progress (Status Tracking for Kajal)
INSERT INTO goal_progress (goal_id, is_met) VALUES
((SELECT id FROM goals WHERE goal_text = 'Complete QA tests for new feature' LIMIT 1), TRUE),
((SELECT id FROM goals WHERE goal_text = 'Write automated test scripts for the module' LIMIT 1), FALSE),
((SELECT id FROM goals WHERE goal_text = 'Review user feedback and prioritize bugs' LIMIT 1), TRUE),
((SELECT id FROM goals WHERE goal_text = 'Test the integration between modules' LIMIT 1), FALSE),
((SELECT id FROM goals WHERE goal_text = 'Fix issues found in last sprint’s testing' LIMIT 1), TRUE);

-- Seed Data for Kajal's Checkouts (Goal Progress, Missed, Feelings)
INSERT INTO checkouts (slack_user_id, slack_channel_id, goal_progress_id, feeling, created_at) VALUES
('D08H3T0DQE4', 'C08FD2CP3T9', (SELECT id FROM goal_progress WHERE goal_id = (SELECT id FROM goals WHERE goal_text = 'Complete QA tests for new feature' LIMIT 1)), 'frustrated', NOW() - INTERVAL '1 day'),
('D08H3T0DQE4', 'C08FEE2J8TF', (SELECT id FROM goal_progress WHERE goal_id = (SELECT id FROM goals WHERE goal_text = 'Write automated test scripts for the module' LIMIT 1)), 'frustrated', NOW() - INTERVAL '2 days'),
('D08H3T0DQE4', 'C08F79MUE04', (SELECT id FROM goal_progress WHERE goal_id = (SELECT id FROM goals WHERE goal_text = 'Review user feedback and prioritize bugs' LIMIT 1)), 'happy', NOW() - INTERVAL '3 days'),
('D08H3T0DQE4', 'C08FD2CP3T9', (SELECT id FROM goal_progress WHERE goal_id = (SELECT id FROM goals WHERE goal_text = 'Test the integration between modules' LIMIT 1)), 'happy', NOW() - INTERVAL '4 days'),
('D08H3T0DQE4', 'C08FEE2J8TF', (SELECT id FROM goal_progress WHERE goal_id = (SELECT id FROM goals WHERE goal_text = 'Fix issues found in last sprint’s testing' LIMIT 1)), null, NOW() - INTERVAL '5 days');
