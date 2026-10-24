-- ==============================================================================
-- HOC PHAN DU LIEU NOSQL - HUIT (KHOA CNTT)
-- SCRIPTS TAO KEYSPACE VA BANG CHO APACHE CASSANDRA
-- NHOM 18: NEN TANG E-LEARNING TIENG ANH & LUYEN THI QUOC TE (EDUPRO ENGLISH)
-- ==============================================================================

-- 1. TAO KEYSPACE LUU TRU LOG / EVENT HOAT DONG
CREATE KEYSPACE IF NOT EXISTS elearning_logs
WITH replication = {
    'class': 'SimpleStrategy',
    'replication_factor': 1
};

USE elearning_logs;

-- 2. BANG 1: LEARNING_EVENTS
-- Muc tieu: Luu tru nhat ky hoc tap, clickstream, xem video bai giang Tieng Anh voi tan suat ghi lon theo thoi gian.
-- Partition Key: student_id (gom cac ban ghi cua cung 1 sinh vien ve 1 node vat ly)
-- Clustering Key: event_time DESC, event_id ASC (sap xep su kien moi nhat len dau)
CREATE TABLE IF NOT EXISTS learning_events (
    student_id text,
    event_time timestamp,
    event_id uuid,
    event_type text,       -- 'PLAY_LESSON', 'VIDEO_PROGRESS', 'LESSON_COMPLETE', 'QUIZ_START'
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
-- DU LIEU MAU SEED DATA CHO CASSANDRA (EDUPRO ENGLISH)
-- ==============================================================================

INSERT INTO learning_events (student_id, event_time, event_id, event_type, course_id, lesson_id, session_id, duration_seconds, payload)
VALUES ('2001230589', '2026-10-24 08:30:00', uuid(), 'PLAY_LESSON', '670000000000000000000010', '670000000000000000000021', 'SESS_IELTS_01', 0, '{"course": "IELTS Masterclass 7.5+", "lesson": "Overview & Band Descriptors"}');

INSERT INTO learning_events (student_id, event_time, event_id, event_type, course_id, lesson_id, session_id, duration_seconds, payload)
VALUES ('2001230589', '2026-10-24 08:45:00', uuid(), 'VIDEO_PROGRESS', '670000000000000000000010', '670000000000000000000021', 'SESS_IELTS_01', 900, '{"progress_percent": 50, "skill": "IELTS Reading Skimming"}');

INSERT INTO learning_events (student_id, event_time, event_id, event_type, course_id, lesson_id, session_id, duration_seconds, payload)
VALUES ('2001230589', '2026-10-24 09:05:00', uuid(), 'LESSON_COMPLETE', '670000000000000000000010', '670000000000000000000021', 'SESS_IELTS_01', 2100, '{"progress_percent": 100, "completed": true}');

INSERT INTO learning_events (student_id, event_time, event_id, event_type, course_id, lesson_id, session_id, duration_seconds, payload)
VALUES ('2001230578', '2026-10-24 09:15:00', uuid(), 'PLAY_LESSON', '670000000000000000000011', '670000000000000000000025', 'SESS_TOEIC_02', 300, '{"course": "TOEIC 4 Ky Nang 850+", "lesson": "Listening Part 1-2"}');

-- ==============================================================================
-- CAU TRUY VAN MINH CHUNG CHO GIANG VIEN (DEMO TREN CQLSH GUI/CLI)
-- ==============================================================================
-- 1. Truy van co ban: Lay toan bo lich su hoc tap Tieng Anh cua sinh vien 2001230589 sap xep moi nhat
-- SELECT * FROM learning_events WHERE student_id = '2001230589';

-- 2. Truy van nang cao: Lay cac su kien xem video cua 2001230589 trong khoang thoi gian cu the
-- SELECT event_time, event_type, lesson_id, duration_seconds, payload 
-- FROM learning_events 
-- WHERE student_id = '2001230589' 
--   AND event_time >= '2026-10-24 08:00:00' 
--   AND event_time <= '2026-10-24 10:00:00';
