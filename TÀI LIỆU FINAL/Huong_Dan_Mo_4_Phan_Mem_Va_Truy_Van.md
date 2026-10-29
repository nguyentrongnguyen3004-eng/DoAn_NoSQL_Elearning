# 🖥️ HƯỚNG DẪN MỞ 4 PHẦN MỀM GIAO DIỆN & CÂU LỆNH TRUY VẤN KHI BÁO CÁO VỚI GIẢNG VIÊN

> **Dành cho:** Buổi báo cáo / bảo vệ đồ án NoSQL (Khoa CNTT - HUIT)  
> Khi cô yêu cầu: *"Em mở 4 phần mềm tương ứng của 4 hệ CSDL lên và chạy thử câu truy vấn bên trong cho cô xem."*

---

## 🍃 1. MONGODB ➔ PHẦN MỀM: "MongoDB Compass"

### Cách mở phần mềm:
* Bấm phím **Windows** (Start Menu) ➔ Gõ tìm **MongoDB Compass** ➔ Bấm mở.
* Hoặc chạy file **`Mo_4_Phan_Mem_CSDL.bat`** ở thư mục gốc và bấm số **1**.

### Cách kết nối:
* Tại ô **URI**, để mặc định: `mongodb://localhost:27017`
* Bấm nút xanh **Connect**.

### Thao tác demo cho cô xem:
1. Nhìn cột bên trái, chọn CSDL: **`elearning_nosql`**
2. Bấm vào collection: **`courses`**
3. Tại thanh tìm kiếm **Filter**, gõ câu truy vấn:
   ```json
   { "category": "IELTS" }
   ```
   ➔ Bấm **Find** (hiển thị danh sách các khóa học IELTS).
4. Bấm vào collection: **`exams`** hoặc **`results`** để cho cô thấy kết quả làm bài thi của học viên được lưu dạng Document JSON.

---

## ⚡ 2. REDIS ➔ PHẦN MỀM: "Redis Insight"

### Cách mở phần mềm:
* **Bước 1 (Bật Server):** Vào thư mục `02_Scripts_CSDL_NoSQL`, nhấp đúp file **`Bat_Redis_Server.bat`** để bật Redis Server (Cổng 6379).
* **Bước 2 (Mở GUI):** Bấm phím **Windows** (Start Menu) ➔ Gõ tìm **Redis Insight** ➔ Bấm mở.
* Hoặc chạy file **`Mo_4_Phan_Mem_CSDL.bat`** ở thư mục gốc và bấm số **2**.

### Cách kết nối:
* Bấm **Add Redis Database** ➔ Nhập Host: `127.0.0.1`, Port: `6379`, Name: `EduPro Redis` ➔ Bấm **Add Database**.

### Thao tác demo cho cô xem:
1. Mở mục **Key List** (hoặc thanh Workbench bên dưới):
2. Thấy các Key thực tế:
   * `exam:670000000000000000000040:answers:*` (Hash lưu câu trả lời thi thời gian thực).
   * `leaderboard:weekly` (Sorted Set lưu điểm thi đua).
   * `security:blacklist` (Set IP bị tường lửa cách ly).
3. Tại thanh lệnh CLI ở góc dưới màn hình, gõ:
   ```redis
   KEYS *
   ZREVRANGE leaderboard:weekly 0 -1 WITHSCORES
   ```
   ➔ Nhấn Enter (hiển thị bảng xếp hạng điểm thi thời gian thực từ cấu trúc ZSET).

---

## 👁️ 3. APACHE CASSANDRA ➔ PHẦN MỀM: "TablePlus" (Khuyên dùng) / "DBeaver"

### Cách mở TablePlus:
* **Bước 1 (Bật Server):** Vào thư mục `02_Scripts_CSDL_NoSQL`, nhấp đúp file **`Bat_Cassandra_Server.bat`** để khởi động Cassandra Server (Cổng 9042).
* **Bước 2 (Mở GUI):** Bấm phím **Windows** (Start Menu) ➔ Gõ tìm **TablePlus** ➔ Bấm mở.
* Hoặc chạy file **`Mo_4_Phan_Mem_CSDL.bat`** ở thư mục gốc và bấm số **3**.

### Cách kết nối Cassandra trên TablePlus:
1. Mở TablePlus ➔ Click vào **Create a new connection...** (hoặc dấu cộng `+`).
2. Chọn biểu tượng **Apache Cassandra**.
3. Điền thông số kết nối:
   * **Name:** `EduPro Cassandra`
   * **Host / Socket:** `127.0.0.1` (hoặc `localhost`)
   * **Port:** `9042`
   * **User / Password:** Để trống (Cassandra dev cục bộ không yêu cầu mật khẩu).
   * **Keyspace:** `elearning_tracking` (hoặc để trống để xem tất cả).
4. Bấm **Test** (thấy hiện chữ màu xanh lá *Connection OK*) ➔ Bấm **Connect**.

### Thao tác demo trên TablePlus cho cô xem:
1. **Xem bảng dữ liệu trực quan:**
   * Cột bên trái hiện keyspace `elearning_tracking`.
   * Nhấp đúp vào bảng **`learning_events`**: TablePlus hiển thị toàn bộ hàng dữ liệu log xem video và tiến trình học tập dạng bảng tính (spreadsheet) rất đẹp mắt.
2. **Chạy câu lệnh truy vấn CQL:**
   * Bấm phím **`Ctrl + E`** (hoặc icon SQL/Query) để mở khung soạn thảo CQL.
   * Dán câu truy vấn CQL theo Partition Key:
     ```sql
     SELECT * FROM elearning_tracking.learning_events 
     WHERE student_id = '2001230589' 
     LIMIT 10;
     ```
   * Bấm **`Ctrl + Enter`** (hoặc nút Run): Dữ liệu time-series của sinh viên 2001230589 sẽ xuất hiện ngay lập tức bên dưới.

*(Ghi chú: Nếu muốn dùng DBeaver, máy bạn cũng đã có sẵn DBeaver Community, mở bằng Start Menu hoặc bấm số 4 trong file `Mo_4_Phan_Mem_CSDL.bat`).*

---

## 🕸️ 4. NEO4J ➔ PHẦN MỀM: "Neo4j Desktop 2" & "Neo4j Browser"

### Cách mở phần mềm:
* Bấm phím **Windows** (Start Menu) ➔ Gõ tìm **Neo4j Desktop 2** ➔ Bấm mở.
* Hoặc chạy file **`Mo_4_Phan_Mem_CSDL.bat`** ở thư mục gốc và bấm số **5** (hoặc số **6** để mở Web Browser).
* Hoặc truy cập trực tiếp Web GUI cực kỳ đẹp mắt tại: **`http://localhost:7474`**

### Cách đăng nhập trên Neo4j Browser (`http://localhost:7474`):
* **Connect URL:** `bolt://localhost:7687`
* **Username:** `neo4j`
* **Password:** `nosql_project_2026` (hoặc mật khẩu bạn đã tạo)

### Thao tác demo cho cô xem:
1. Tại thanh Cypher command ở trên cùng, gõ câu lệnh truy vấn mạng đồ thị:
   ```cypher
   MATCH (n) RETURN n LIMIT 25;
   ```
   ➔ Nhấn **Play** (Icon tam giác xanh): Màn hình sẽ bung ra các quả bóng tròn (Nodes) nhiều màu sắc kết nối với nhau qua các đường mũi tên quan hệ (Edges).
2. Demo truy vấn lộ trình học tập (Learning Path):
   ```cypher
   MATCH (s:Skill)-[r:REQUIRES]->(pre:Skill)
   RETURN s.name, pre.name;
   ```
3. Demo gợi ý bạn cùng tiến (Study Buddies):
   ```cypher
   MATCH (u1:Student)-[:ENROLLED_IN]->(c:Course)<-[:ENROLLED_IN]-(u2:Student)
   RETURN u1.fullName, c.title, u2.fullName;
   ```

---
*Chúc bạn có buổi báo cáo đồ án tự tin và đạt điểm 10 tuyệt đối!*
