CREATE DATABASE IF NOT EXISTS swilliams394;
USE swilliams394;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    total_wins INT DEFAULT 0,
    total_moves INT DEFAULT 0,
    highest_difficulty INT DEFAULT 1,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0
);

-- Game sessions table
CREATE TABLE game_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    puzzle_size INT NOT NULL,
    difficulty INT NOT NULL,
    moves INT NOT NULL,
    time_seconds INT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    puzzle_state TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Puzzles table
CREATE TABLE puzzles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    puzzle_size INT NOT NULL,
    difficulty INT NOT NULL,
    initial_state TEXT NOT NULL,
    solution_path TEXT,
    min_moves INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Achievements table
CREATE TABLE achievements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    condition_type VARCHAR(50),
    condition_value INT,
    icon_url VARCHAR(255)
);

-- User achievements table
CREATE TABLE user_achievements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    achievement_id INT NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id)
);

-- Difficulty settings
CREATE TABLE difficulty_settings (
    difficulty INT PRIMARY KEY,
    name VARCHAR(50),
    shuffle_depth INT,
    max_hints INT,
    time_multiplier FLOAT
);

-- Insert default difficulty settings
INSERT INTO difficulty_settings (difficulty, name, shuffle_depth, max_hints, time_multiplier) VALUES
(1, 'Easy', 20, 5, 1.0),
(2, 'Medium', 50, 3, 1.2),
(3, 'Hard', 100, 1, 1.5),
(4, 'Expert', 200, 0, 2.0),
(5, 'Santa\'s Master', 300, 0, 2.5);

-- Insert default achievements
INSERT INTO achievements (name, description, condition_type, condition_value) VALUES
('First Steps', 'Complete your first puzzle', 'puzzles_completed', 1),
('Speed Demon', 'Solve a puzzle in under 60 seconds', 'fast_time', 60),
('Move Master', 'Solve with minimum moves', 'perfect_moves', 1),
('Holiday Pro', 'Complete 10 puzzles', 'puzzles_completed', 10),
('Santa\'s Helper', 'Complete a 10x10 puzzle', 'large_puzzle', 10),
('Streak Starter', 'Get a 3-day streak', 'streak', 3),
('Puzzle Wizard', 'Solve all difficulty levels', 'all_difficulties', 5);