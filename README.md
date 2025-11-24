
# 📘 EncryptLab – Network Security Project

**Sinh viên:** *Thái Sơn*  
**MSSV:** *23521361*  
**Môn học:** *An toàn mạng máy tính – UIT*  

---

## 🔐 1. Giới thiệu
EncryptLab là ứng dụng web giúp sinh viên thực hành và mô phỏng các thuật toán mã hóa trong môn *Network Security*.  
Hệ thống được xây dựng hoàn toàn bằng **HTML + CSS + JavaScript (ES6)**, không sử dụng thư viện ngoài.

---

## 🛠️ 2. Chức năng chính

### 🔑 Thuật toán cổ điển
- **Caesar Cipher** – brute force giải tự động  
- **Vigenère Cipher** – tự động tìm key (Kasiski + tần suất)  
- **Monoalphabetic Substitution** – giải bằng hill climbing  

### 🔐 Thuật toán hiện đại
- **DES** – hỗ trợ **ECB** và **CBC** (CBC bắt buộc IV)  
- **AES** – hỗ trợ **ECB** và **CBC**  

### 🎯 Tính năng bổ sung
- Upload/giải mã file `.txt`  
- Logger hiển thị tiến trình và lỗi  
- Tải về plaintext/ciphertext  
- UI trực quan, bảo toàn ký tự đặc biệt  

---

## 📂 3. Cấu trúc thư mục

```
EncryptLab/
├── index.html
├── styles.css
├── README.md
└── js/
    ├── main.js            # Khởi tạo và điều hướng giao diện
    ├── ui.js              # Render UI + xử lý nút bấm
    ├── utils.js           # Logger và tiện ích
    └── algorithms/
        ├── caesar/        # Thuật toán Caesar
        ├── vigenere/      # Vigenere + cracker
        ├── mono/          # Monoalphabetic cracking
        ├── des/           # DES ECB/CBC
        └── aes/           # AES ECB/CBC
```

---

## ▶️ 4. Cách chạy

### Cách 1 – Chạy trực tiếp
Mở file **index.html** bằng trình duyệt.

### Cách 2 – Dùng PHP local server
```bash
php -S 127.0.0.1:8000
```
Truy cập: http://127.0.0.1:8000

---

## 📜 5. Ghi chú
Ứng dụng chỉ phục vụ mục đích học tập và mô phỏng trong môi trường học phần Network Security.
