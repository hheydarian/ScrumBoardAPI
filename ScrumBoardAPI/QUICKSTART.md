# 🚀 تخته‌ی اسکراب - دستور شروع سریع

## ✅ وضعیت سیستم

✨ **همه چیز آماده است!**

```
Backend:  ✅ ASP.NET Core 10 API + SQL Server
Frontend: ✅ Persian UI + RTL + Glassmorphism Design
Database: ✅ Migrated with Assignee & Estimate fields
```

---

## 🎯 مرحله‌ی اول: شروع Backend

### 1️⃣ باز کردن Terminal

```powershell
# تغییر وضعیت دایرکتوری
cd E:\CSharp\pr-Console\ScrumBoardAPI\ScrumBoardAPI

# یا در مسیر فایل project.csproj
```

### 2️⃣ اجرای API

```bash
dotnet run
# یا
dotnet build && dotnet run
```

**انتظار داشته باشید تا این پیام ظاهر شود:**
```
Now listening on: https://localhost:7125
```

✅ **API آماده است!**

### 3️⃣ تست API (Swagger)

```
→ https://localhost:7125/swagger/index.html
```

---

## 🎨 مرحله‌ی دوم: باز کردن Frontend

### گزینه ۱: Direct (سریع‌ترین)

```
1. فایل باز کنید: ScrumBoardAPI/Frontend/index.html
2. دابل‌کلیک + مرورگر را انتخاب کنید
```

### گزینه ۲: Local Server (توصیه شده)

**با Python:**
```bash
cd ScrumBoardAPI/Frontend
python -m http.server 8000

# سپس: http://localhost:8000
```

**یا Node.js:**
```bash
npm install -g http-server
cd ScrumBoardAPI/Frontend
http-server

# سپس: http://localhost:8080
```

---

## 🎬 اولین پروژه

### ۱. ایجاد تخته
- کلیک: **"تخته جدید"**
- وارد کنید: 
  - نام: **"پروژه‌ی من"**
  - توضیح: **"اولین تخته‌ی اسکراب"**
- کلیک: **"ایجاد تخته"** ✅

### ۲. افزودن ستون‌ها

**ستون ۱:**
- کلیک: **"افزودن ستون"**
- نام: **"انجام می‌شود"**
- موقعیت: **0**
- کلیک: **"ایجاد ستون"** ✅

**ستون ۲:**
- نام: **"درحال انجام"**
- موقعیت: **1**

**ستون ۳:**
- نام: **"تکمیل‌شده"**
- موقعیت: **2**

### ۳. افزودن تسک

**تسک ۱:**
- کلیک: **➕** (کنار هر ستون)
- عنوان: **"کار‌های اساسی را انجام دهید"**
- توضیح: **"تمام داده‌های پایگاه را تست کنید"**
- اولویت: **بالا**
- مسئول: **"احمد"**
- تاریخ سررسید: **انتخاب تاریخ**
- برآورد ساعت: **5**
- کلیک: **"ایجاد تسک"** ✅

**تسک ۲:**
- عنوان: **"طراحی رابط کاربری"**
- اولویت: **متوسط**
- کلیک: **"ایجاد تسک"** ✅

### ۴. Drag & Drop

```
1. تسکی را کلیک و نگه دارید
2. به ستون دیگری بکشید
3. رها کنید! 
   → Backend خودکار بروزرسانی می‌شود ✅
```

---

## 🎨 ویژگی‌های پیشرفته

### 📊 آمار و نمودار
- کلیک: **📊** (گوشه‌ی بالا)
- ببینید:
  - کل تسک‌ها
  - درحال انجام
  - تکمیل‌شده
  - توزیع اولویت

### 🔍 فیلتر
- کلیک: **🔍** (کنار "افزودن ستون")
- فیلتر بر اساس:
  - اولویت
  - مسئول
  - وضعیت
  - تسک‌های سررسید گذشته

### ⚙️ تنظیمات
- کلیک: **⚙️** (گوشه‌ی سایدبار)
- تنظیم کنید:
  - تم (روشن/تاریک)
  - آپدیت خودکار
  - دیدن تسک‌های تکمیل‌شده

---

## 🔧 API Endpoints

### Boards
```
GET    /api/boards              → کل تخته‌ها
POST   /api/boards              → ایجاد تخته
GET    /api/boards/{id}         → یک تخته
PUT    /api/boards/{id}         → به‌روزرسانی
DELETE /api/boards/{id}         → حذف
```

### Columns
```
GET    /api/columns/board/{id}  → ستون‌های یک تخته
POST   /api/columns             → ایجاد ستون
PUT    /api/columns/{id}        → به‌روزرسانی
DELETE /api/columns/{id}        → حذف
```

### TaskCards
```
GET    /api/taskcards/column/{id}  → تسک‌های یک ستون
POST   /api/taskcards              → ایجاد تسک
PUT    /api/taskcards/{id}         → به‌روزرسانی/جابجایی
DELETE /api/taskcards/{id}         → حذف
```

---

## 📋 مثال cURL

### ایجاد تسک

```bash
curl -X POST https://localhost:7125/api/taskcards \
  -H "Content-Type: application/json" \
  -d '{
    "title": "مثال تسک",
    "description": "این یک تسک نمونه است",
    "priority": "High",
    "dueDate": "2025-12-31",
    "assignee": "علی",
    "estimate": 3.5,
    "columnId": 1
  }' \
  -k
```

### جابجایی تسک

```bash
curl -X PUT https://localhost:7125/api/taskcards/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "مثال تسک",
    "description": "این یک تسک نمونه است",
    "priority": "High",
    "dueDate": "2025-12-31",
    "assignee": "علی",
    "estimate": 3.5,
    "columnId": 2
  }' \
  -k
```

---

## ⚠️ حل مسائل عمومی

### ❌ نمی‌توانم تسک‌ها را مشاهده کنم

```
1. Backend روی؟ (https://localhost:7125)
2. CORS فعال است؟ (Program.cs)
3. Browser Cache پاک شد؟ (Ctrl+Shift+R)
4. Console (F12) خطایی نشان می‌دهد؟
```

### ❌ Drag & Drop کار نمی‌کند

```
1. دستور صحیح است؟
   - Click → Hold → Drag → Release

2. API endpoint فعال است؟
   PUT /api/taskcards/{id}

3. Swagger تست کنید:
   https://localhost:7125/swagger
```

### ❌ فونت‌ها غلط نمایش داده می‌شوند

```
1. Google Fonts load شده؟
2. Cache Browser: Ctrl+Shift+R
3. یا Shabnam.ttf را در Frontend/ قرار دهید
```

---

## 📝 نکات مهم

⭐ **Database:** 
- Assignee و Estimate با موفقیت اضافه شدند
- Migration اعمال شده (✅)

⭐ **Controller:** 
- تمام endpoint‌ها از فیلدهای جدید پشتیبانی می‌کنند

⭐ **Frontend:**
- فارسی ۱۰۰٪
- RTL آماده
- تمام ویژگی‌ها کار می‌کنند

⭐ **CORS:**
- AllowAnyOrigin فعال است
- AllowAnyHeader و AllowAnyMethod

---

## 🎓 مراحل بعدی

### اگر می‌خواهید بیشتر توسعه دهید:

1. **احراز هویت**: JWT Token Implementation
2. **نقش‌های کاربری**: Admin, Member, Viewer
3. **Real-time**: SignalR برای به‌روزرسانی لحظه‌ای
4. **Analytics**: Burndown charts و metrics
5. **Integration**: GitHub/GitLab Hooks

---

## 💬 سوال؟

سوال یا مشکلی دارید؟ 📧

**Endpoints برای تست:**
- REST: Swagger یا Postman
- Frontend: http://localhost:8000

**درایو مشکل؟**
1. Terminal را ببندید/باز کنید
2. Cache browser را پاک کنید
3. اپلیکیشن را دوباره شروع کنید

---

**🎉 خوش‌آمدید به تخته‌ی اسکراب فارسی!**

*v1.0 - با ❤️ ساخته شده*
