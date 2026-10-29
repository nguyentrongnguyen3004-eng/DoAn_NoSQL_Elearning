# 📋 BỘ 20 CÂU LỆNH TRUY VẤN MINH CHỨNG CHƯƠNG 5 CHO 4 HỆ CSDL NOSQL
> **Dành cho:** Thành viên phụ trách làm Chương 5 (Chụp ảnh màn hình kết quả trên GUI Tool)  
> **Quy chuẩn:** Đúng tối thiểu **10 truy vấn cơ bản** và **10 truy vấn nâng cao**, chia đều cho cả 4 hệ quản trị: MongoDB, Redis, Cassandra, Neo4j.

---

## PHẦN 1: 10 TRUY VẤN CƠ BẢN (BASIC QUERIES)

### 🍃 1. MongoDB (Thực hiện trên MongoDB Compass - Collection `courses`, `questions`, `users`)
* **Câu 1.1 (Lọc & Sắp xếp):** Tìm tất cả các khóa học thuộc danh mục IELTS có trạng thái Published, sắp xếp theo học phí giảm dần.
  ```json
  // Filter:
  { "category": "IELTS", "isPublished": true }
  // Sort:
  { "price": -1 }
  ```
* **Câu 1.2 (Đếm & Điều kiện):** Đếm số lượng câu hỏi trắc nghiệm có mức độ khó là "hard".
  ```json
  // Filter:
  { "difficulty": "hard" }
  ```
* **Câu 1.3 (Cập nhật):** Tăng 100 điểm thưởng XP cho sinh viên `2001230589`.
  ```javascript
  db.users.updateOne(
    { "studentId": "2001230589" },
    { $inc: { "xp": 100 } }
  );
  ```

---

### ⚡ 2. Redis (Thực hiện trên RedisInsight - Workbench CLI)
* **Câu 2.1 (Key-Value có TTL):** Lưu cache danh mục khóa học với thời gian hết hạn 30 phút (1800 giây).
  ```redis
  SETEX cache:courses:catalog 1800 "{\"status\":\"cached\",\"total\":12}"
  TTL cache:courses:catalog
  ```
* **Câu 2.2 (Hash - Lưu câu trả lời thi thời gian thực):** Lưu đáp án học viên chọn vào Hash của đề thi.
  ```redis
  HSET exam:670000000000000000000040:answers:2001230589 q_01 "B" q_02 "C" q_03 "A"
  HGETALL exam:670000000000000000000040:answers:2001230589
  ```
* **Câu 2.3 (Set - Quản lý IP bị chặn / Token Blacklist):** Thêm IP vi phạm gian lận thi cử vào danh sách đen và kiểm tra.
  ```redis
  SADD security:blacklist:ips "192.168.1.105" "10.0.0.99"
  SISMEMBER security:blacklist:ips "192.168.1.105"
  ```

---

### 👁️ 3. Apache Cassandra (Thực hiện trên TablePlus - CQL Editor)
* **Câu 3.1 (Insert Time-Series Log):** Thêm một bản ghi log xem bài giảng của học viên.
  ```sql
  INSERT INTO elearning_tracking.learning_events (
    student_id, event_time, course_id, lesson_id, event_type, video_progress, duration_seconds
  ) VALUES (
    '2001230589', toTimestamp(now()), 'COURSE_01', 'LESSON_01', 'VIDEO_PLAY', 120, 1800
  );
  ```
* **Câu 3.2 (Select theo Partition Key):** Truy vấn 10 sự kiện học tập gần nhất của sinh viên theo đúng Partition Key `student_id`.
  ```sql
  SELECT student_id, event_time, course_id, lesson_id, event_type, video_progress 
  FROM elearning_tracking.learning_events 
  WHERE student_id = '2001230589' 
  LIMIT 10;
  ```

---

### 🕸️ 4. Neo4j (Thực hiện trên Neo4j Desktop / Neo4j Browser)
* **Câu 4.1 (Truy vấn nốt theo điều kiện):** Lấy danh sách các khóa học nâng cao có số tín chỉ >= 3.
  ```cypher
  MATCH (c:Course)
  WHERE c.level = 'Nâng cao' AND c.credits >= 3
  RETURN c.id AS MaKhoaHoc, c.name AS TenKhoaHoc, c.credits AS TinChi;
  ```
* **Câu 4.2 (Truy vấn quan hệ đơn bước):** Liệt kê các bài học thuộc về khóa học IELTS Masterclass (COURSE_01).
  ```cypher
  MATCH (c:Course {id: 'COURSE_01'})-[:CONTAINS]->(l:Lesson)
  RETURN c.name AS KhoaHoc, l.order AS ThuTu, l.title AS TenBaiHoc
  ORDER BY l.order ASC;
  ```

---
---

## PHẦN 2: 10 TRUY VẤN NÂNG CAO (ADVANCED QUERIES)

### 🍃 1. MongoDB (Aggregation Pipeline & Complex Document Updates)
* **Câu 5.1 (Aggregation $group & $avg):** Thống kê điểm thi trung bình, điểm cao nhất, điểm thấp nhất và số lượt làm bài theo từng đề thi.
  ```javascript
  db.results.aggregate([
    {
      $group: {
        _id: "$examId",
        diemTrungBinh: { $avg: "$score" },
        diemCaoNhat: { $max: "$score" },
        diemThapNhat: { $min: "$score" },
        soLuotThi: { $sum: 1 }
      }
    },
    { $sort: { soLuotThi: -1 } }
  ]);
  ```
* **Câu 5.2 (Aggregation $lookup đa Collection):** Kết hợp bảng kết quả thi (`results`) với thông tin học viên (`users`) để xuất báo cáo xếp loại.
  ```javascript
  db.results.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userInfo"
      }
    },
    { $unwind: "$userInfo" },
    {
      $project: {
        _id: 1,
        score: 1,
        passed: 1,
        "studentName": "$userInfo.fullName",
        "studentCode": "$userInfo.studentId",
        submittedAt: 1
      }
    },
    { $limit: 5 }
  ]);
  ```
* **Câu 5.3 (Cập nhật mảng nhúng sâu $addToSet):** Thêm một tài liệu bài giảng PDF vào danh sách tài liệu đính kèm của khóa học mà không bị trùng lặp.
  ```javascript
  db.courses.updateOne(
    { "code": "COURSE_01" },
    {
      $addToSet: {
        "handouts": {
          "title": "IELTS Writing Task 2 Band 8.0 Template",
          "fileUrl": "https://storage.edupro.vn/handouts/ielts_task2.pdf",
          "uploadedAt": new Date()
        }
      }
    }
  );
  ```

---

### ⚡ 2. Redis (Sorted Set Leaderboard & Sliding Window Rate Limiting)
* **Câu 6.1 (Bảng xếp hạng tuần Real-time bằng Sorted Set):** Lấy Top 3 học viên có điểm thi đua cao nhất kèm điểm số tương ứng.
  ```redis
  ZREVRANGE leaderboard:weekly 0 2 WITHSCORES
  ```
* **Câu 6.2 (Thuật toán giới hạn tần suất truy cập trượt - Sliding Window Rate Limiter):** Ghi nhận timestamp request và đếm số lượng truy cập trong 60 giây qua của IP khách hàng để chống DDoS/Spam.
  ```redis
  ZADD rate_limit:192.168.1.50 1730188800 "req_1730188800"
  ZREMRANGEBYSCORE rate_limit:192.168.1.50 0 1730188740
  ZCARD rate_limit:192.168.1.50
  ```

---

### 👁️ 3. Apache Cassandra (Time-Series Analytics & Anti-Cheat Log với TTL)
* **Câu 7.1 (Time-Series Retention Curve):** Phân tích tỷ lệ xem video của sinh viên theo các mốc thời gian để vẽ đường cong giữ chân người học.
  ```sql
  SELECT student_id, lesson_id, video_progress, duration_seconds, event_time
  FROM elearning_tracking.learning_events
  WHERE student_id = '2001230589'
  ORDER BY event_time DESC
  LIMIT 20;
  ```
* **Câu 7.2 (Ghi log vi phạm gian lận thi cử với cơ chế tự hủy TTL):** Lưu nhật ký chuyển tab/thoát toàn màn hình của thí sinh, bản ghi tự động xóa sau 7 ngày (604800 giây).
  ```sql
  INSERT INTO elearning_tracking.exam_violations (
    student_id, exam_id, violation_time, violation_type, warning_count
  ) VALUES (
    '2001230589', 'EXAM_IELTS_01', toTimestamp(now()), 'TAB_SWITCH', 2
  ) USING TTL 604800;
  ```

---

### 🕸️ 4. Neo4j (Graph Pattern Matching, Shortest Path & Social Recommendation)
* **Câu 8.1 (Gợi ý lộ trình học tập đa tầng - Multi-hop Learning Path):** Tìm toàn bộ chuỗi các bài học điều kiện tiên quyết cần hoàn thành để được học bài học nâng cao `LESSON_05`.
  ```cypher
  MATCH path = (start:Lesson)-[:PREREQUISITE_OF*]->(target:Lesson {id: 'LESSON_05'})
  RETURN [n in nodes(path) | n.title] AS LoTrinhTienQuyet;
  ```
* **Câu 8.2 (Thuật toán gợi ý Bạn Cùng Tiến - Study Buddies):** Khai phá các bạn học cùng đăng ký chung nhiều khóa học nhất (Co-enrollment Intersection) để gợi ý kết bạn học nhóm.
  ```cypher
  MATCH (me:User {id: '2001230589'})-[:ENROLLED_IN]->(c:Course)<-[:ENROLLED_IN]-(peer:User)
  WHERE me <> peer
  RETURN peer.fullName AS BanCungTien,
         peer.targetBand AS MucTieuBand,
         collect(c.name) AS CacKhoaHocChung,
         count(c) AS SoKhoaChung
  ORDER BY SoKhoaChung DESC;
  ```
* **Câu 8.3 (Tìm đường đi ngắn nhất giữa 2 khóa học - Shortest Path):** Tìm lộ trình chuyển tiếp nhanh nhất từ khóa Ngữ Pháp (COURSE_03) lên khóa IELTS Masterclass (COURSE_01).
  ```cypher
  MATCH path = shortestPath((c1:Course {id: 'COURSE_03'})-[:PREREQUISITE_OF*]->(c2:Course {id: 'COURSE_01'}))
  RETURN path;
  ```

---
*File này đã được lưu tại: `03_Tai_Lieu_Do_An/06_Bao_Cao_Ket_Qua_Do_An/DANH_SACH_20_CAU_TRUY_VAN_CHUONG_5.md`.*
