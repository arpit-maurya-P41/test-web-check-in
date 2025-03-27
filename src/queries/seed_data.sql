-- 1️⃣ Insert Roles
INSERT INTO roles (role_name) VALUES 
('Admin'), 
('Developer'), 
('QA');

-- 2️⃣ Insert Teams
INSERT INTO teams (name, slack_channel_id) VALUES 
('Augeo', 'C08FD2CP3T9'), 
('RepSpark', 'C08FEE2J8TF'), 
('Nigel', 'C08F79MUE04');

-- 3️⃣ Insert Users
INSERT INTO users (email, password, slack_user_id) VALUES 
('vivek@example.com', 'password', 'D08F2KGSK8V'),
('kajal@example.com', 'password', 'D08H3T0DQE4');

-- 4️⃣ User-Role Mapping
INSERT INTO user_role_mapping (user_id, role_id) VALUES 
(1, 1), -- Vivek -> Admin
(1, 2), -- Vivek -> Developer
(2, 3); -- Kajal -> QA

-- 5️⃣ User-Team Mapping
INSERT INTO user_team_mapping (user_id, team_id) VALUES 
(1, 1), (1, 2), (1, 3), -- Vivek -> All teams
(2, 1), (2, 2), (2, 3); -- Kajal -> All teams

-- 6️⃣ Sample Check-ins (Assuming current date is today)
INSERT INTO checkins (slack_user_id, slack_channel_id, goals, blockers, feeling, is_smart_goal, date) VALUES 
('U001', 'C001', 'Complete API integration', 'None', 'happy', TRUE, CURRENT_DATE),
('U001', 'C002', 'Fix UI issues', 'Pending API response', 'neutral', FALSE, CURRENT_DATE),
('U002', 'C003', 'Test authentication module', 'Login issue', 'frustrated', TRUE, CURRENT_DATE);

-- 7️⃣ Sample Check-outs (Assuming current date is today)
INSERT INTO checkouts (slack_user_id, slack_channel_id, updates, blockers, goals_met, feeling, date) VALUES 
('U001', 'C001', 'API integration completed', 'None', TRUE, 'happy', CURRENT_DATE),
('U001', 'C002', 'Fixed UI issues', 'Still waiting for API response', FALSE, 'neutral', CURRENT_DATE),
('U002', 'C003', 'Tested authentication, found bugs', 'Login issue persists', FALSE, 'frustrated', CURRENT_DATE);

-- 8️⃣ Sample Sessions (Assuming expiry after 24 hours)
INSERT INTO sessions (user_id, expires_at) VALUES 
(1, NOW() + INTERVAL '1 day'),
(2, NOW() + INTERVAL '1 day');

-- Delete old checkins and checkouts before inserting new data
DELETE FROM checkins;
DELETE FROM checkouts;

-- ✅ January 2025 Check-ins (Includes SMART & non-SMART goals, blockers & no blockers)
INSERT INTO checkins (slack_user_id, slack_channel_id, goals, blockers, feeling, is_smart_goal, date) VALUES 
('D08F2KGSK8V', 'C08FD2CP3T9', 'Plan API structure', 'None', 'happy', TRUE, '2025-01-02'),
('D08F2KGSK8V', 'C08FEE2J8TF', 'Fix UI issues', 'API response delayed', 'neutral', FALSE, '2025-01-03'),
('D08H3T0DQE4', 'C08F79MUE04', 'Run regression tests', 'Environment not stable', 'frustrated', TRUE, '2025-01-04'),
('D08F2KGSK8V', 'C08FD2CP3T9', 'Code refactoring', 'None', 'excited', TRUE, '2025-01-05');

-- ✅ January 2025 Check-outs (Missed one checkout)
INSERT INTO checkouts (slack_user_id, slack_channel_id, updates, blockers, goals_met, feeling, date) VALUES 
('D08F2KGSK8V', 'C08FD2CP3T9', 'API structure completed', 'None', TRUE, 'happy', '2025-01-02'),
('D08F2KGSK8V', 'C08FEE2J8TF', 'UI fixes pending', 'API response still delayed', FALSE, 'neutral', '2025-01-03'),
-- ('D08H3T0DQE4', 'C08F79MUE04', 'Missed checkout', NULL, FALSE, NULL, '2025-01-04'),  -- Kajal missed checkout
('D08F2KGSK8V', 'C08FD2CP3T9', 'Refactoring done', 'None', TRUE, 'excited', '2025-01-05');

-- ✅ February 2025 Check-ins (Missed one check-in)
INSERT INTO checkins (slack_user_id, slack_channel_id, goals, blockers, feeling, is_smart_goal, date) VALUES 
('D08F2KGSK8V', 'C08F79MUE04', 'Improve database indexing', 'None', 'happy', TRUE, '2025-02-10'),
-- ('D08H3T0DQE4', 'C08FEE2J8TF', 'Missed check-in', NULL, NULL, FALSE, '2025-02-11'),  -- Kajal missed check-in
('D08F2KGSK8V', 'C08FD2CP3T9', 'Enhance error logging', 'Error logs unclear', 'neutral', FALSE, '2025-02-12'),
('D08H3T0DQE4', 'C08F79MUE04', 'Run security tests', 'Security team not available', 'frustrated', TRUE, '2025-02-13');

-- ✅ February 2025 Check-outs
INSERT INTO checkouts (slack_user_id, slack_channel_id, updates, blockers, goals_met, feeling, date) VALUES 
('D08F2KGSK8V', 'C08F79MUE04', 'Indexing improved', 'None', TRUE, 'happy', '2025-02-10'),
('D08F2KGSK8V', 'C08FD2CP3T9', 'Error logs improved', 'Still needs clarity', FALSE, 'neutral', '2025-02-12'),
('D08H3T0DQE4', 'C08F79MUE04', 'Security tests started', 'Team still unavailable', FALSE, 'frustrated', '2025-02-13');

-- ✅ March 2025 Check-ins (Daily logs for Vivek & Kajal)
INSERT INTO checkins (slack_user_id, slack_channel_id, goals, blockers, feeling, is_smart_goal, date) VALUES 
-- Week 1
('D08F2KGSK8V', 'C08FD2CP3T9', 'Optimize database queries', 'Slow queries in logs', 'neutral', TRUE, '2025-03-01'),
('D08H3T0DQE4', 'C08FEE2J8TF', 'Review bug reports', 'None', 'happy', FALSE, '2025-03-01'),
('D08F2KGSK8V', 'C08F79MUE04', 'Implement caching mechanism', 'Redis config issue', 'frustrated', TRUE, '2025-03-02'),
('D08H3T0DQE4', 'C08FD2CP3T9', 'Automate test cases', 'None', 'excited', TRUE, '2025-03-02'),
('D08F2KGSK8V', 'C08FEE2J8TF', 'Refactor authentication module', 'Token expiry issues', 'neutral', TRUE, '2025-03-03'),
('D08H3T0DQE4', 'C08F79MUE04', 'Check regression test results', 'Flaky test cases', 'frustrated', FALSE, '2025-03-03'),
-- Missed Check-in
-- ('D08F2KGSK8V', 'C08FD2CP3T9', 'Missed check-in', NULL, NULL, FALSE, '2025-03-04'),
('D08H3T0DQE4', 'C08FEE2J8TF', 'Review new test automation framework', 'None', 'happy', TRUE, '2025-03-04'),

-- Week 2
('D08F2KGSK8V', 'C08F79MUE04', 'Optimize API response time', 'Large payloads', 'neutral', TRUE, '2025-03-05'),
('D08H3T0DQE4', 'C08FD2CP3T9', 'Verify UI behavior on different browsers', 'None', 'happy', FALSE, '2025-03-05'),
('D08F2KGSK8V', 'C08FEE2J8TF', 'Implement role-based access control', 'None', 'excited', TRUE, '2025-03-06'),
('D08H3T0DQE4', 'C08F79MUE04', 'Test database backup scripts', 'Backup failures', 'frustrated', TRUE, '2025-03-06'),
-- Missed Check-in
-- ('D08F2KGSK8V', 'C08FD2CP3T9', 'Missed check-in', NULL, NULL, FALSE, '2025-03-07'),
('D08H3T0DQE4', 'C08FEE2J8TF', 'Evaluate API rate limiting strategies', 'None', 'happy', TRUE, '2025-03-07'),

-- Week 3
('D08F2KGSK8V', 'C08F79MUE04', 'Improve error handling in services', 'None', 'happy', TRUE, '2025-03-08'),
('D08H3T0DQE4', 'C08FD2CP3T9', 'Verify email notification functionality', 'SMTP issues', 'neutral', FALSE, '2025-03-08'),
('D08F2KGSK8V', 'C08FEE2J8TF', 'Set up CI/CD pipelines', 'Jenkins config error', 'frustrated', TRUE, '2025-03-09'),
('D08H3T0DQE4', 'C08F79MUE04', 'Run load testing', 'None', 'excited', TRUE, '2025-03-09'),

-- Week 4
('D08F2KGSK8V', 'C08FD2CP3T9', 'Update API documentation', 'None', 'neutral', FALSE, '2025-03-10'),
('D08H3T0DQE4', 'C08FEE2J8TF', 'Perform security vulnerability assessment', 'None', 'happy', TRUE, '2025-03-10');

-- ✅ March 2025 Check-outs (Including missed check-outs)
INSERT INTO checkouts (slack_user_id, slack_channel_id, updates, blockers, goals_met, feeling, date) VALUES 
-- Week 1
('D08F2KGSK8V', 'C08FD2CP3T9', 'Optimized queries, improved response time', 'Still some slow queries', TRUE, 'neutral', '2025-03-01'),
('D08H3T0DQE4', 'C08FEE2J8TF', 'Reviewed bug reports, triaged 10 issues', 'None', TRUE, 'happy', '2025-03-01'),
('D08F2KGSK8V', 'C08F79MUE04', 'Implemented caching, some config issues remain', 'Redis config issue', FALSE, 'frustrated', '2025-03-02'),
('D08H3T0DQE4', 'C08FD2CP3T9', 'Automated test cases added', 'None', TRUE, 'excited', '2025-03-02'),
('D08F2KGSK8V', 'C08FEE2J8TF', 'Auth module refactored, token issue persists', 'Token expiry issues', FALSE, 'neutral', '2025-03-03'),
-- Missed Check-out
-- ('D08H3T0DQE4', 'C08F79MUE04', 'Missed checkout', NULL, FALSE, NULL, '2025-03-03'),

-- Week 2
('D08F2KGSK8V', 'C08F79MUE04', 'Optimized API response', 'Payload still large', FALSE, 'neutral', '2025-03-05'),
('D08H3T0DQE4', 'C08FD2CP3T9', 'UI verified on all browsers', 'None', TRUE, 'happy', '2025-03-05'),
('D08F2KGSK8V', 'C08FEE2J8TF', 'RBAC implemented successfully', 'None', TRUE, 'excited', '2025-03-06'),

-- Week 3
('D08F2KGSK8V', 'C08F79MUE04', 'Error handling improved', 'None', TRUE, 'happy', '2025-03-08'),
('D08H3T0DQE4', 'C08FD2CP3T9', 'Email notifications working, SMTP fixed', 'None', TRUE, 'neutral', '2025-03-08'),

-- Week 4
('D08F2KGSK8V', 'C08FD2CP3T9', 'Updated API documentation', 'None', TRUE, 'neutral', '2025-03-10'),
('D08H3T0DQE4', 'C08FEE2J8TF', 'Security vulnerabilities reported', 'None', TRUE, 'happy', '2025-03-10');
