# 📋 تخته‌ی اسکراب - راهنمای راه‌اندازی

## 🚀 شروع سریع

### ۱. درخواست‌های سیستم
- **.NET 10**: برای اجرای Backend API
- **SQL Server** (LocalDB یا دیگر): برای ذخیره‌ی داده‌ها
- **مرورگر مدرن**: Chrome, Firefox, Edge, Safari

### ۲. راه‌اندازی Backend

```bash
# راه‌اندازی پروژه .NET
dotnet build
dotnet run

# API تحت https://localhost:7125 اجرا می‌شود
```

#### نکات مهم:
- ✅ CORS فعال است ➜ فرانت‌اند می‌تواند API را فراخوانی کند
- ✅ Swagger UI فعال است ➜ https://localhost:7125/swagger/index.html

### ۳. تست فرانت‌اند

#### گزینه الف: فایل محلی (سریع‌ترین)
```
1. فایل Frontend/index.html را در مرورگر باز کنید
   (دابل‌کلیک یا Drag & Drop به مرورگر)

2. یا از Terminal:
   - Windows: start ScrumBoardAPI\Frontend\index.html
   - macOS: open ScrumBoardAPI/Frontend/index.html
   - Linux: xdg-open ScrumBoardAPI/Frontend/index.html
```

#### گزینه ب: سرور محلی (بهتر است)
```bash
# Python 3
cd ScrumBoardAPI/Frontend
python -m http.server 8000

# سپس به http://localhost:8000 بروید
```

```bash
# یا Node.js
npm install -g http-server
cd ScrumBoardAPI/Frontend
http-server

# یا http://localhost:8080 بروید
```

### ۴. قابلیت‌های دستیاب

✨ **ویژگی‌های اصلی:**
- 📊 **مدیریت تخته‌ها**: ایجاد/حذف/انتخاب تخته‌های مختلف
- 📌 **ستون‌های سازماندهی**: ایجاد ستون‌ها با موقعیت‌های قابل‌تغییر
- 📝 **تسک‌های جزئیات‌دار**:
  - عنوان و توضیح
  - اولویت (کم/متوسط/بالا/بسیار بالا)
  - نسبت‌دهی به مسئول
  - برآورد زمان (ساعت)
  - تاریخ سررسید
- 🎯 **Drag & Drop**: تسک‌ها را بین ستون‌ها بکشید
- 🔍 **جستجو**: جستجو در نام تخته‌ها
- 🎨 **فیلتر**: اولویت، مسئول، وضعیت، و تسک‌های سررسید گذشته
- 📈 **آمار و نمودار**: نمایش توزیع تسک‌ها و اولویت‌ها
- ⚙️ **تنظیمات**: تم (روشن/تاریک)، آپدیت خودکار هر ۳۰ ثانیه
- 💽 **ذخیره‌ی تنظیمات**: به‌کار گذاری تنظیمات محفوظ locally

### ۵. نقشه‌ی فایل‌ها

```
ScrumBoardAPI/
├── Frontend/
│   ├── index.html          ← صفحه‌ی اصلی (Farsi 🇮🇷, RTL)
│   ├── style.css           ← طراحی Premium Dark Theme
│   ├── app.js              ← منطق پیشرفته (API, DnD, Filters, Stats)
│   └── Shabnam.ttf         ← [اختیاری] فونت فارسی محلی
├── Program.cs              ← تنظیمات CORS و Services
├── Controllers/
│   ├── BoardsController.cs
│   ├── ColumnsController.cs
│   └── TaskCardsController.cs
├── Entities/
│   ├── Board.cs
│   ├── Column.cs
│   └── TaskCard.cs
├── Data/
│   └── AppDbContext.cs
└── Properties/
    └── launchSettings.json
```

### ۶. مثال استفاده

#### ایجاد تخته جدید:
1. کلیک بر "تخته جدید"
2. نام و توضیح وارد کنید
3. "ایجاد تخته" کلیک کنید ✅

#### افزودن ستون:
1. تخته‌ای انتخاب کنید
2. "افزودن ستون" کلیک کنید
3. نام ستون وارد کنید (مثلاً: "انجام می‌شود")
4. موقعیت را مشخص کنید
5. "ایجاد ستون" کلیک کنید ✅

#### ایجاد تسک:
1. کلیک بر "+" در رأس ستون‌ها
2. اطلاعات تسک را پر کنید:
   - عنوان ⚠️ (الزامی)
   - توضیح (اختیاری)
   - اولویت
   - مسئول (اختیاری)
   - تاریخ سررسید (اختیاری)
   - برآورد ساعت (اختیاری)
3. "ایجاد تسک" کلیک کنید ✅

#### جابجایی تسک (Drag & Drop):
1. هر تسک را کلیک و نگه دارید
2. به ستون دیگری بکشید
3. رها کنید! سیستم خودکار آپدیت می‌کند ✅

### ۷. حل مسائل

#### ❌ خطای CORS
```
مشکل: API پاسخ نمی‌دهد یا CORS error دیده می‌شود
حل: 
  1. اطمینان حاصل کنید backend روی https://localhost:7125 اجرا می‌شود
  2. Program.cs شامل app.UseCors("AllowAll"); است
  3. مرورگر را Refresh کنید (Ctrl+Shift+R یا Cmd+Shift+R)
```

#### ❌ فونت‌های فارسی نادرست نمایش داده می‌شوند
```
مشکل: متن‌های فارسی ترکیب‌نشده‌ی است
حل:
  1. اطمینان حاصل کنید style.css شامل @import Google Fonts است
  2. Cache مرورگر را پاک کنید
  3. Refresh کنید
  4. اگر مشکل ادامه دارد: 
     - Shabnam.ttf را در Frontend/ قرار دهید
     - style.css را برای استفاده‌ی محلی تغییر دهید
```

#### ❌ Drag & Drop کار نمی‌کند
```
مشکل: تسک‌ها جابجا نمی‌شوند
حل:
  1. عناصر HTML با data-task-id و data-column-id وجود دارند؟
  2. دکنسول browser (F12) را باز کنید و errors را بررسی کنید
  3. API endpoints گویا درست کار می‌کنند؟ (برای PUT /taskcards/{id})
```

#### ❌ داده‌ها ذخیره نمی‌شوند
```
مشکل: بعد از رفریش صفحه داده‌ها محو می‌شوند
حل:
  1. Database connection string تنظیم شده است؟
  2. Migration‌ها اجرا شده‌اند؟ (dotnet ef database update)
  3. SQL Server running است؟
```

### ۸. فناوری‌های استفاده‌شده

| بخش | فناوری |
|------|----------|
| **Backend** | ASP.NET Core 10, EF Core, SQL Server |
| **Frontend** | HTML5, CSS3 (Glassmorphism), Vanilla JS (ES6+) |
| **فونت** | Vazirmatn (Google Fonts) - Persian |
| **RTL** | HTML lang="fa" dir="rtl" |
| **Drag & Drop** | HTML5 DataTransfer API |
| **API Communication** | Fetch API (async/await) |
| **Storage** | localStorage (settings) + SQL Server (data) |

### ۹. API Endpoints

```
BASE: https://localhost:7125/api

BOARDS:
  GET    /boards              → لیست تمام تخته‌ها
  POST   /boards              → ایجاد تخته جدید
  GET    /boards/{id}         → گرفتن تخته‌ی خاص
  PUT    /boards/{id}         → به‌روزرسانی تخته
  DELETE /boards/{id}         → حذف تخته

COLUMNS:
  GET    /columns/board/{boardId}  → ستون‌های یک تخته
  POST   /columns              → ایجاد ستون
  PUT    /columns/{id}         → به‌روزرسانی ستون
  DELETE /columns/{id}         → حذف ستون

TASKCARDS:
  GET    /taskcards/column/{columnId}  → تسک‌های یک ستون
  POST   /taskcards            → ایجاد تسک
  PUT    /taskcards/{id}       → به‌روزرسانی/جابجایی تسک
  DELETE /taskcards/{id}       → حذف تسک
```

### ۱۰. توسعه بیشتر (IDEAS)

💡 **ایجادهای آينده:**
- [ ] احراز هویت (Login/Register)
- [ ] مجوزهای کاربری (Admin, Teams, Guests)
- [ ] نظر‌ها و @mentions در تسک‌ها
- [ ] تاریخچه‌ی تغییرات (Activity Log)
- [ ] اعلانات Real-time (WebSocket/SignalR)
- [ ] Sprints و Releases
- [ ] گزارش‌های پیشرفته‌ی Burndown
- [ ] Integration با Git/GitHub
- [ ] Export به PDF/Excel

---

✨ **خوش‌آمدید به تخته‌ی اسکراب فارسی!**

سوال یا مشکلی دارید؟ فصل حل مسائل را ببینید! 🎯
