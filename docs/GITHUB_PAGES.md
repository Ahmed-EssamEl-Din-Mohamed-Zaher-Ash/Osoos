# النشر على GitHub Pages

المشروع مجهز للنشر تلقائيًا من فرع `main` بواسطة GitHub Actions. يبني سير العمل
نسخة الإنتاج، يشغل فحوص المشروع، ثم ينشر محتويات `dist` على GitHub Pages.

## الرفع لأول مرة

1. أنشئ مستودعًا فارغًا على GitHub، ولا تضف إليه README أو `.gitignore`.
2. من داخل مجلد `react-migration` اربط المستودع وارفع فرع `main`:

   ```powershell
   git remote add origin https://github.com/USERNAME/REPOSITORY.git
   git push -u origin main
   ```

3. افتح المستودع على GitHub، ثم انتقل إلى:
   `Settings` → `Pages` → `Build and deployment`.
4. اختر `GitHub Actions` في حقل `Source`.
5. افتح تبويب `Actions` وتابع سير العمل المسمى `Deploy to GitHub Pages`.

بعد نجاح النشر سيكون الرابط غالبًا:

```text
https://USERNAME.github.io/REPOSITORY/
```

كل رفع لاحق إلى `main` يعيد الفحص والبناء والنشر تلقائيًا. ويمكن تشغيل النشر
يدويًا من تبويب `Actions` عبر `Run workflow`.

## ملاحظات

- قيمة `base` في Vite هي `./`، ولذلك تعمل ملفات JavaScript وCSS داخل مسار
  المستودع الفرعي من دون كتابة اسم المستودع داخل الكود.
- لا ترفع مجلد `dist` يدويًا؛ سير العمل يبنيه وينشره تلقائيًا.
- إذا كان المستودع خاصًا، فتأكد أن خطة حساب GitHub تسمح بـ Pages للمستودعات
  الخاصة.
