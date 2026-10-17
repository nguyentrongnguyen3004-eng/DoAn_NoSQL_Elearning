# 🎓 NỀN TẢNG HỌC TẬP TRỰC TUYẾN & THI TRẮC NGHIỆM ĐA CƠ SỞ DỮ LIỆU NOSQL (E-LEARNING & QUIZ PLATFORM)

> **Học phần:** Dữ liệu NoSQL (Lớp 14DH) - Khoa Công nghệ Thông tin - Trường Đại học Công Thương TP.HCM (HUIT)  
> **Giảng viên hướng dẫn:** TS. Nguyễn Thị Định  
> **Nhóm thực hiện:** Nhóm 18  

---

## 📌 1. Yêu cầu cài đặt trước (Prerequisites)
Để chạy được toàn bộ đồ án, máy tính cần cài sẵn 2 phần mềm:
1. **Node.js** (Phiên bản v18 trở lên): [https://nodejs.org/](https://nodejs.org/)
2. **Docker Desktop** (Bắt buộc để chạy 4 CSDL NoSQL): [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

---

## 🚀 2. Các bước khởi chạy dự án (Dành cho thành viên mới)

### Bước 1: Clone mã nguồn về máy
Mở Terminal / PowerShell và gõ:
```bash
git clone https://github.com/nguyentrongnguyen3004-eng/DoAn_NoSQL_Elearning.git
cd DoAn_NoSQL_Elearning
```

### Bước 2: Cài đặt thư viện Node.js
```bash
npm install
```

### Bước 3: Tạo file cấu hình môi trường (.env)
Copy file cấu hình mẫu `.env.example` thành file `.env`:
* **Trên Windows (PowerShell):**
  ```powershell
  copy .env.example .env
  ```
* **Hoặc trên Linux / Mac:**
  ```bash
  cp .env.example .env
  ```

### Bước 4: Khởi động 4 CSDL NoSQL bằng Docker
*Đảm bảo ứng dụng **Docker Desktop** trên máy tính đã được bật (đèn xanh).*  
Chạy lệnh sau để Docker tự động tải và kích hoạt cùng lúc 4 CSDL (MongoDB, Redis, Cassandra, Neo4j):
```bash
docker compose up -d
```
> ⏱️ *Lần đầu chạy, Docker sẽ tải images về khoảng 2 - 3 phút. Sau khi xong, cả 4 container sẽ sáng đèn xanh.*

### Bước 5: Nạp dữ liệu mẫu ban đầu (Seed Data)
Chạy script tự động khởi tạo bảng, quan hệ đồ thị và dữ liệu ban đầu cho các CSDL:
```bash
npm run seed:mongo
```
*(Dữ liệu mẫu cho Cassandra và Neo4j nằm sẵn trong thư mục `scripts/cassandra_schema.cql` và `scripts/neo4j_graph.cypher`).*

### Bước 6: Khởi động Server ứng dụng
```bash
npm start
```
Màn hình sẽ hiển thị:
```text
🚀 Server dang chay tai: http://localhost:5050
```

---

## 🌐 3. Trải nghiệm hệ thống trên trình duyệt

* **Giao diện Web học tập & thi trắc nghiệm:** Truy cập 👉 **[http://localhost:5050](http://localhost:5050)**
* **Trình quản trị Đồ thị Neo4j Browser:** Truy cập 👉 **[http://localhost:7474](http://localhost:7474)**
  - *Username:* `neo4j`
  - *Password:* `nosql_project_2026`

---

## 🛠️ 4. Kiểm thử tự động (Automated Verification)
Để kiểm tra trạng thái hoạt động và tính toàn vẹn của cả 4 CSDL, chạy bộ kiểm thử tự động 14 Test Cases:
```bash
node scripts/automated_tests.js
```
Kết quả đạt chuẩn: **14/14 Test Cases Passed (100% PASS)**.

---

## 📚 5. Cấu trúc 4 CSDL NoSQL trong Đồ án
1. **MongoDB (Port 27017):** Lưu nghiệp vụ chính (Khóa học, bài giảng, ngân hàng câu hỏi, đề thi, kết quả thi).
2. **Redis (Port 6379):** Cache tốc độ cao, đếm ngược phòng thi (TTL), tráo câu hỏi chống gian lận, bảng xếp hạng Real-time.
3. **Apache Cassandra (Port 9042):** Lưu chuỗi sự kiện và lịch sử tương tác học tập (Time-Series Telemetry).
4. **Neo4j (Port 7474 / 7687):** Đồ thị tri thức môn học, quan hệ điều kiện tiên quyết và gợi ý lộ trình học tập.
