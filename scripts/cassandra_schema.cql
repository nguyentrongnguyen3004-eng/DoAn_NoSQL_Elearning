-- ==============================================================================
-- HOC PHAN DU LIEU NOSQL - HUIT (KHOA CNTT)
-- SCRIPTS TAO KEYSPACE VA BANG CHO APACHE CASSANDRA
-- NHOM 18: NEN TANG E-LEARNING & LUYEN THI TRAC NGHIEM
-- ==============================================================================

-- 1. TAO KEYSPACE LUU TRU LOG / EVENT HOAT DONG
CREATE KEYSPACE IF NOT EXISTS elearning_logs
WITH replication = {
    'class': 'SimpleStrategy',
    'replication_factor': 1
};

USE elearning_logs;

-- 2. BANG 1: LEARNING_EVENTS
-- Muc tieu: Luu tru nhat ky hoc tap, clickstream, xem video voi tan suat ghi lon theo thoi gian.
-- Partition Key: student_id (gom cac ban ghi cua cung 1 sinh vien ve 1 node vat ly)
-- Clustering Key: event_time DESC, event_id ASC (sap xep su kien moi nhat len dau)
CREATE TABLE IF NOT EXISTS learning_events (
    student_id text,
    event_time timestamp,
    event_id uuid,
    event_type text,       -- 'video_start', 'video_progress', 'video_completed', 'lesson_view', 'quiz_click'
    course_id text,
    lesson_id text,
    session_id text,
    duration_seconds int,
    payload text,          -- Du lieu JSON mo rong (vi du: vi tri video hien tai, thiet bi, browser)
    PRIMARY KEY ((student_id), event_time, event_id)
) WITH CLUSTERING ORDER BY (event_time DESC, event_id ASC);

-- 3. BANG 2: LESSON_ACTIVITY_STATS
-- Muc tieu: Phuc vu truy van thong ke hoat dong theo tung bai hoc theo ngay
-- Partition Key: (course_id, lesson_id)
-- Clustering Key: day text, event_type text
CREATE TABLE IF NOT EXISTS lesson_activity_by_day (
    course_id text,
    lesson_id text,
    day text,              -- YYYY-MM-DD
    event_type text,
    event_count counter,
    PRIMARY KEY ((course_id, lesson_id), day, event_type)
);

-- ==============================================================================
-- DU LIEU MAU SEED DATA CHO CASSANDRA
-- ==============================================================================

INSERT INTO learning_events (student_id, event_time, event_id, event_type, course_id, lesson_id, session_id, duration_seconds, payload)
VALUES ('SV001', '2026-10-14 08:30:00', uuid(), 'lesson_view', 'COURSE_NOSQL', 'LESSON_01', 'SESS_101', 0, '{"device": "Windows", "browser": "Chrome"}');

INSERT INTO learning_events (student_id, event_time, event_id, event_type, course_id, lesson_id, session_id, duration_seconds, payload)
VALUES ('SV001', '2026-10-14 08:31:15', uuid(), 'video_start', 'COURSE_NOSQL', 'LESSON_01', 'SESS_101', 0, '{"video_url": "https://video.huit.edu.vn/nosql-ch1.mp4"}');

INSERT INTO learning_events (student_id, event_time, event_id, event_type, course_id, lesson_id, session_id, duration_seconds, payload)
VALUES ('SV001', '2026-10-14 08:45:00', uuid(), 'video_progress', 'COURSE_NOSQL', 'LESSON_01', 'SESS_101', 825, '{"progress_percent": 50}');

INSERT INTO learning_events (student_id, event_time, event_id, event_type, course_id, lesson_id, session_id, duration_seconds, payload)
VALUES ('SV001', '2026-10-14 09:00:00', uuid(), 'video_completed', 'COURSE_NOSQL', 'LESSON_01', 'SESS_101', 1720, '{"progress_percent": 100}');

INSERT INTO learning_events (student_id, event_time, event_id, event_type, course_id, lesson_id, session_id, duration_seconds, payload)
VALUES ('SV002', '2026-10-14 09:15:00', uuid(), 'lesson_view', 'COURSE_NOSQL', 'LESSON_01', 'SESS_102', 0, '{"device": "MacOS", "browser": "Safari"}');

-- ==============================================================================
-- CAU TRUY VAN MINH CHUNG CHO GIANG VIEN (DEMO TREN CQLSH GUI/CLI)
-- ==============================================================================
-- 1. Truy van co ban: Lay toan bo lich su hoc tap cua sinh vien SV001 sap xep moi nhat
-- SELECT * FROM learning_events WHERE student_id = 'SV001';

-- 2. Truy van nang cao: Lay cac su kien xem video cua SV001 trong khoang thoi gian cu the
-- SELECT event_time, event_type, lesson_id, duration_seconds, payload 
-- FROM learning_events 
-- WHERE student_id = 'SV001' 
--   AND event_time >= '2026-10-14 08:00:00' 
--   AND event_time <= '2026-10-14 10:00:00';
