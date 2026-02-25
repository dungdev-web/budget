# 💰 Budget Tracker Pro

Ứng dụng quản lý chi tiêu cá nhân hiện đại với Firebase, React, và Chart.js

## Tính năng nổi bật

### Tính năng cơ bản
- ✅ Đăng nhập bằng Google Firebase Authentication
- ✅ Thêm, sửa, xóa giao dịch
- ✅ Phân loại giao dịch theo 8 danh mục
- ✅ Tìm kiếm và lọc giao dịch
- ✅ Theo dõi thu nhập, chi tiêu, số dư

### Tính năng nâng cao
- **Biểu đồ tròn**: Chi tiêu theo danh mục
- **Biểu đồ xu hướng**: Thu nhập vs Chi tiêu theo tháng
- **Phân tích chi tiết**: 
  - Trung bình chi tiêu mỗi ngày
  - Giao dịch lớn nhất/nhỏ nhất
  - Tỷ lệ chi tiêu theo từng danh mục
- 💾 **Xuất Excel**: Export toàn bộ dữ liệu

### UI/UX
- Gradient màu sắc hiện đại
- 3 chế độ xem: Danh sách, Biểu đồ, Phân tích
- Responsive hoàn toàn
- Real-time updates
- Smooth animations

## Cài đặt

### 1. Cài đặt dependencies

```bash
npm install firebase
npm install chart.js react-chartjs-2
npm install xlsx file-saver
npm install lucide-react
```

Hoặc

```bash
yarn add firebase chart.js react-chartjs-2 xlsx file-saver lucide-react
```

### 2. Cấu hình Firebase

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Tạo project mới
3. Bật **Authentication** → Chọn Google Sign-In
4. Bật **Firestore Database**
5. Copy cấu hình Firebase và paste vào file `firebase.js`

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 3. Cấu hình Firestore Rules

Vào Firestore → Rules và cập nhật:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /transactions/{transaction} {
      allow read, write: if request.auth != null && 
                         request.auth.uid == resource.data.uid;
      allow create: if request.auth != null;
    }
  }
}
```

### 4. Chạy ứng dụng

```bash
npm run dev
# hoặc
yarn dev
```

## Cấu trúc Project

```
budget-tracker-pro/
├── App.jsx                    # Component chính
├── firebase.js                # Firebase configuration
├── ExpensePieChart.jsx        # Biểu đồ tròn chi tiêu
├── MonthlyTrendChart.jsx      # Biểu đồ xu hướng theo tháng
├── CategoryBarChart.jsx       # Biểu đồ cột so sánh danh mục
├── AnalyticsPanel.jsx         # Panel phân tích chi tiết
└── README.md                  # Tài liệu
```

## Components

### 1. ExpensePieChart
- Hiển thị phân bố chi tiêu theo 8 danh mục
- Tự động tính phần trăm và tổng chi tiêu
- Responsive và có tooltip chi tiết

### 2. MonthlyTrendChart
- Biểu đồ đường theo dõi thu/chi theo tháng
- Hiển thị số dư mỗi tháng
- Thống kê trung bình thu/chi/tiết kiệm

### 3. CategoryBarChart
- So sánh thu nhập vs chi tiêu theo danh mục
- Top 3 danh mục chi tiêu nhiều nhất
- Tính chênh lệch thu chi

### 4. AnalyticsPanel
- Phân tích chi tiết với nhiều chỉ số
- Tỷ lệ tiết kiệm với gợi ý thông minh
- Dự báo thu chi cuối tháng
- Insights tự động

## Cấu trúc dữ liệu Firestore

```javascript
transactions {
  id: "auto-generated",
  text: "Mua sắm tạp hóa",
  amount: -150000,
  category: "food",
  date: "2026-01",
  uid: "user-id",
  createdAt: Timestamp
}
```

## Danh mục

| Icon | Tên | Code |
|------|-----|------|
| 🍜 | Ăn uống | food |
| 🚗 | Đi lại | travel |
| 🛍 | Mua sắm | shopping |
| 🎮 | Giải trí | entertainment |
| 💊 | Sức khỏe | health |
| 📚 | Giáo dục | education |
| 💡 | Hóa đơn | bills |
| 📦 | Khác | other |

## Cách sử dụng

### Thêm giao dịch
1. Nhập mô tả
2. Nhập số tiền (dương = thu nhập, âm = chi tiêu)
3. Chọn danh mục
4. Chọn tháng
5. Nhấn "Thêm giao dịch"

### Sửa giao dịch
- Click icon bên cạnh giao dịch
- Chỉnh sửa mô tả hoặc số tiền
- Click ✓ để lưu hoặc ✕ để hủy

### Xem báo cáo
- **Danh sách**: Xem tất cả giao dịch với tìm kiếm và lọc
- **Biểu đồ**: Phân tích trực quan qua charts
- **Phân tích**: Thống kê chi tiết và insights

### Xuất Excel
- Click "Xuất Excel" để download file .xlsx
- File bao gồm tất cả giao dịch với đầy đủ thông tin

## 🔒 Bảo mật

- Chỉ user đã đăng nhập mới xem được data
- Mỗi user chỉ xem được giao dịch của mình
- Firestore Rules bảo vệ dữ liệu
- Google Sign-In an toàn

## Tính năng sắp tới

- [ ] Đặt mục tiêu chi tiêu
- [ ] Nhắc nhở thanh toán hóa đơn
- [ ] Multi-currency support
- [ ] Dark/Light mode toggle
- [ ] PWA support
- [ ] Backup & Restore
- [ ] Shared budgets

## Credits

- React + Vite
- Firebase
- Chart.js
- Lucide Icons
- Tailwind CSS
- XLSX.js
- File-Saver

---

