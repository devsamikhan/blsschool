export type Language = 'en' | 'ur';

export const translations = {
  en: {
    // General
    "school_name": "Blended Learning School",
    "portal_access": "Portal Access",
    "login": "Login",
    "logout": "Logout",
    
    // Parent Dashboard
    "welcome_back": "Welcome back",
    "guardian_access": "Guardian Access",
    "monitoring": "Monitoring",
    "academic_progress": "academic progress",
    "active_class": "Active Class",
    "attendance": "Attendance",
    "pending_fees": "Pending Fees",
    "latest_standing": "Latest Standing",
    "updated_today": "Updated Today",
    "due_date": "Due: 10th of Month",
    "bulletins": "School Bulletins",
    "toolbox": "Parent Toolbox",
    "detailed_results": "Detailed Results",
    "fee_history": "Fee History",
    "messenger": "Messenger",
    
    // Admissions / Tracker
    "track_journey": "Track Your Journey",
    "enter_id": "Enter your unique tracking ID",
    "verify_status": "Verify Status",
    "status": "Status",
    "submitted": "Submitted",
    "under_review": "Under Review",
    "response_ready": "Response Ready",
    "congratulations": "Congratulations Pioneer!",
    "inquiry_authorized": "Inquiry Authorized",
    
    // Accountant / Principal
    "collected": "Collected",
    "expenses": "Expenses",
    "pending_dues": "Pending Dues",
    "net_income": "Net Income",
    "revenue_leakage": "Revenue Leakage",
    "due_alerts": "Overdue Alerts",
    "academic_heatmap": "Academic Heatmap",
    "performance": "Performance",
    "financial_health": "Financial Health",
    "concession": "Concession",
    "collect_fees": "Collect Fees",
    "record_expense": "Record Expense",
    "notifications": "Notifications",
    "no_notifications": "No new notifications",
    "new_inquiry": "New Inquiry",
    "overdue_fee_alert": "Overdue Fee Alert"
  },
  ur: {
    // General
    "school_name": "بلینڈڈ لرننگ سکول",
    "portal_access": "پورٹل تک رسائی",
    "login": "لاگ ان",
    "logout": "لاگ آؤٹ",
    
    // Parent Dashboard
    "welcome_back": "خوش آمدید",
    "guardian_access": "سرپرست رسائی",
    "monitoring": "نگرانی",
    "academic_progress": "تعلیمی پیشرفت",
    "active_class": "فعال کلاس",
    "attendance": "حاضری",
    "pending_fees": "واجب الادا فیس",
    "latest_standing": "تازہ ترین درجہ",
    "updated_today": "آج کی اپ ڈیٹ",
    "due_date": "تاریخ: مہینے کی 10 تاریخ",
    "bulletins": "سکول کی خبریں",
    "toolbox": "پیرنٹ ٹول باکس",
    "detailed_results": "تفصیلی نتائج",
    "fee_history": "فیس کی ہسٹری",
    "messenger": "میسنجر",
    
    // Admissions / Tracker
    "track_journey": "اپنا سفر ٹریک کریں",
    "enter_id": "اپنی منفرد ٹریکنگ آئی ڈی درج کریں",
    "verify_status": "سٹیٹس چیک کریں",
    "status": "سٹیٹس",
    "submitted": "جمع کرایا گیا",
    "under_review": "زیرِ غور",
    "response_ready": "جواب تیار ہے",
    "congratulations": "مبارک ہو پاینیر!",
    "inquiry_authorized": "درخواست منظور کر لی گئی",

    // Accountant / Principal
    "collected": "جمع شدہ رقم",
    "expenses": "اخراجات",
    "pending_dues": "بقایا جات",
    "net_income": "خالص آمدنی",
    "revenue_leakage": "ضائع شدہ آمدنی",
    "due_alerts": "تاخیر کی اطلاعات",
    "academic_heatmap": "تعلیمی تجزیہ",
    "performance": "کارکردگی",
    "financial_health": "مالی صورتحال",
    "concession": "رعایت",
    "collect_fees": "فیس وصول کریں",
    "record_expense": "اخراجات درج کریں",
    "notifications": "اطلاعات",
    "no_notifications": "کوئی نئی اطلاع نہیں ہے",
    "new_inquiry": "نئی درخواست موصول ہوئی",
    "overdue_fee_alert": "فیس کی تاخیر کا الرٹ"
  }
};

export type Translations = typeof translations;
