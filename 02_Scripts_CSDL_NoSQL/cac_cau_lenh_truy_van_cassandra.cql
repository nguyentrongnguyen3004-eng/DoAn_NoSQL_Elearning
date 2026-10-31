-- ==============================================================================
-- TRƯỜNG ĐẠI HỌC CÔNG THƯƠNG TP. HỒ CHÍ MINH (HUIT) - KHOA CÔNG NGHỆ THÔNG TIN
-- HỌC PHẦN: DỮ LIỆU NOSQL (NHÓM 18)
-- TẬP HỢP CÁC CÂU LỆNH TRUY VẤN CQL (CASSANDRA QUERY LANGUAGE) CHO EDUPRO ACADEMY
-- KEYSPACE: elearning_logs
-- BẢNG SỬ DỤNG: learning_events, heartbeat_stream, anti_cheat_logs
-- ==============================================================================

-- ==============================================================================
-- PHẦN 1: QUẢN TRỊ KEYSPACE VÀ KIỂM TRA METADATA CẤU TRÚC
-- ==============================================================================

-- 1.1. Chuyển sang Keyspace nhật ký của dự án
USE elearning_logs;

-- 1.2. Xem thông tin cấu hình Keyspace (Chiến lược sao chép SimpleStrategy / NetworkTopologyStrategy)
DESCRIBE KEYSPACE elearning_logs;

-- 1.3. Xem cấu trúc chi tiết và Partition Key / Clustering Order của các bảng
DESCRIBE TABLE learning_events;
DESCRIBE TABLE heartbeat_stream;
DESCRIBE TABLE anti_cheat_logs;


-- ==============================================================================
-- PHẦN 2: TRUY VẤN BẢNG `learning_events` (NHẬT KÝ HỌC TẬP & SỰ KIỆN TIME-SERIES)
-- Thiết kế: PRIMARY KEY ((student_id), event_time, event_id) WITH CLUSTERING ORDER BY (event_time DESC)
-- ==============================================================================

-- 2.1. Xem toàn bộ nhật ký học tập (có giới hạn LIMIT để tối ưu hiệu năng)
SELECT * FROM learning_events LIMIT 25;

-- 2.2. [TRUY VẤN CHUẨN HIỆU NĂNG CAO]: Lấy toàn bộ lịch sử học tập của 1 sinh viên cụ thể
-- (Truy vấn trực tiếp qua Partition Key `student_id`, tự động sắp xếp theo thời gian mới nhất lên đầu nhờ Clustering Key `event_time DESC`)
SELECT student_id, event_time, event_type, course_id, lesson_id, duration_seconds, payload
FROM learning_events
WHERE student_id = '2001230589'
LIMIT 20;

-- 2.3. [TRUY VẤN DẢI THỜI GIAN (TIME-SERIES SLICE)]: Lấy hoạt động học tập trong một khoảng thời gian
SELECT student_id, event_time, event_type, duration_seconds, payload
FROM learning_events
WHERE student_id = '2001230589'
  AND event_time >= '2026-10-31 00:00:00+0000'
  AND event_time <= '2026-10-31 23:59:59+0000';

-- 2.4. Đếm tổng số sự kiện học tập của một sinh viên cụ thể
SELECT count(*) AS tong_su_kien_hoc_tap
FROM learning_events
WHERE student_id = '2001230589';

-- 2.5. [TRUY VẤN ĐA SINH VIÊN QUA TOÁN TỬ IN]: Lấy dữ liệu của nhiều sinh viên cùng lúc
SELECT student_id, event_time, event_type, duration_seconds
FROM learning_events
WHERE student_id IN ('2001230589', '2001230578', '2001230303')
LIMIT 30;

-- 2.6. [LỌC NÂNG CAO - SỰ KIỆN TỰ HỌC POMODORO]: Xem các phiên tập trung sâu hoàn thành
SELECT student_id, event_time, event_type, duration_seconds, payload
FROM learning_events
WHERE student_id = '2001230589'
  AND event_type = 'POMODORO_SESSION_COMPLETE'
ALLOW FILTERING;

-- 2.7. [LỌC NÂNG CAO - SỰ KIỆN XEM VIDEO & TIMELINE]: Xem tiến độ học video
SELECT student_id, event_time, event_type, course_id, lesson_id, duration_seconds
FROM learning_events
WHERE student_id = '2001230589'
  AND event_type IN ('PLAY_LESSON', 'VIDEO_HEARTBEAT', 'LESSON_COMPLETE')
ALLOW FILTERING;

-- 2.8. [LỌC NÂNG CAO - SỰ KIỆN THI CỬ & CHỐNG GIAN LẬN]: Xem sự kiện phát hiện rời màn hình thi
SELECT student_id, event_time, event_type, duration_seconds, payload
FROM learning_events
WHERE student_id = '2001230589'
  AND event_type = 'EXAM_CHEATING_DETECTED'
ALLOW FILTERING;


-- ==============================================================================
-- PHẦN 3: TRUY VẤN BẢNG `heartbeat_stream` (TELEMETRY NHỊP TIM XEM VIDEO & ANOMALY)
-- Thiết kế: PRIMARY KEY ((session_id), timestamp) WITH CLUSTERING ORDER BY (timestamp DESC)
-- ==============================================================================

-- 3.1. Xem toàn bộ luồng nhịp tim Telemetry
SELECT * FROM heartbeat_stream LIMIT 20;

-- 3.2. Truy vấn toàn bộ nhịp tim trong 1 phiên xem video cụ thể (sắp xếp giảm dần theo thời gian)
SELECT session_id, timestamp, user_id, course_id, lesson_id, video_current_time, is_anomaly
FROM heartbeat_stream
WHERE session_id = 'SESS_IELTS_01';

-- 3.3. [PHÁT HIỆN TUA NHANH BẤT THƯỜNG (ANOMALY DETECTION)]: Lọc các nhịp tim gian lận giờ xem
SELECT session_id, timestamp, user_id, video_current_time, is_anomaly
FROM heartbeat_stream
WHERE session_id = 'SESS_IELTS_01'
  AND is_anomaly = true
ALLOW FILTERING;

-- 3.4. Đếm số lần phát nhịp tim trong một phiên học
SELECT count(*) AS tong_nhip_tim_telemetry
FROM heartbeat_stream
WHERE session_id = 'SESS_IELTS_01';


-- ==============================================================================
-- PHẦN 4: TRUY VẤN BẢNG `anti_cheat_logs` (GIÁM SÁT VI PHẠM PHÒNG THI TRỰC TUYẾN)
-- Thiết kế: PRIMARY KEY ((student_code, exam_id), timestamp) WITH CLUSTERING ORDER BY (timestamp DESC)
-- ==============================================================================

-- 4.1. Xem toàn bộ nhật ký vi phạm phòng thi
SELECT * FROM anti_cheat_logs LIMIT 20;

-- 4.2. [TRUY VẤN CHUẨN PARTITION KEY COMPOSITE]: Xem lịch sử vi phạm của thí sinh trong kỳ thi
SELECT student_code, exam_id, timestamp, violation_type, ip_address, user_agent, details
FROM anti_cheat_logs
WHERE student_code = '2001230589'
  AND exam_id = 'EXAM_01';

-- 4.3. Lọc riêng các lần thí sinh thực hiện chuyển Tab (TAB_SWITCH) hoặc rời màn hình (BLUR)
SELECT student_code, exam_id, timestamp, violation_type, details
FROM anti_cheat_logs
WHERE student_code = '2001230589'
  AND exam_id = 'EXAM_01'
  AND violation_type = 'TAB_SWITCH'
ALLOW FILTERING;

-- 4.4. Đếm tổng số lần vi phạm để xét duyệt khóa bài thi (ngưỡng quá 3 lần vi phạm)
SELECT count(*) AS so_lan_vi_pham
FROM anti_cheat_logs
WHERE student_code = '2001230589'
  AND exam_id = 'EXAM_01';


-- ==============================================================================
-- PHẦN 5: THAO TÁC GHI VÀ QUẢN LÝ DỮ LIỆU NÂNG CAO (DML - INSERT, TTL, WRITETIME)
-- ==============================================================================

-- 5.1. Thêm một bản ghi nhật ký học tập mới (Sử dụng hàm uuid() và toTimestamp(now()))
INSERT INTO learning_events (student_id, event_time, event_id, event_type, course_id, lesson_id, session_id, duration_seconds, payload)
VALUES (
  '2001230589',
  toTimestamp(now()),
  uuid(),
  'PLAY_LESSON',
  '670000000000000000000010',
  'LESSON_02',
  'SESS_DEMO_2026',
  45,
  '{"note": "Học viên đang ôn tập cấu trúc thì Hiện Tại Hoàn Thành"}'
);

-- 5.2. [TÍNH NĂNG TỰ ĐỘNG XÓA DỮ LIỆU - TTL (TIME TO LIVE)]:
-- Ghi nhật ký tự hủy sau 30 ngày (2,592,000 giây) để tiết kiệm dung lượng ổ đĩa
INSERT INTO learning_events (student_id, event_time, event_id, event_type, course_id, lesson_id, session_id, duration_seconds, payload)
VALUES (
  '2001230589',
  toTimestamp(now()),
  uuid(),
  'TEMP_ACTIVITY',
  '670000000000000000000010',
  'LESSON_02',
  'SESS_TEMP_01',
  10,
  '{"auto_expire": true}'
)
USING TTL 2592000;

-- 5.3. Xem thời gian tồn tại còn lại (TTL) và dấu thời gian ghi vật lý (WRITETIME) của bản ghi
SELECT student_id, event_type, TTL(duration_seconds), WRITETIME(event_type)
FROM learning_events
WHERE student_id = '2001230589'
LIMIT 5;

-- 5.4. Xóa toàn bộ lịch sử vi phạm thi của một thí sinh trong kỳ thi cụ thể (Partition Delete)
-- DELETE FROM anti_cheat_logs WHERE student_code = '2001230589' AND exam_id = 'EXAM_01';
