# Teyssir ERP — React + Vite + Capacitor

هذه النسخة تحوّل المشروع الأصلي إلى **واجهة React حديثة** مع الحفاظ على نظام Teyssir ERP الحالي داخل مساحة العمل، بحيث لا تضيع الوظائف الحالية أثناء الانتقال التدريجي إلى React.

## ما تم إنجازه

- React + Vite
- واجهة Shell احترافية جديدة
- Sidebar responsive للكمبيوتر والهاتف
- تبديل العربية / الفرنسية
- Dark / Light mode
- تنقل سريع إلى وحدات ERP الموجودة
- PWA manifest
- Vercel SPA configuration
- Capacitor configuration جاهزة لـ Android Studio
- المشروع الأصلي محفوظ داخل `public/erp/`
- Firebase / Firestore / PDF / Chart.js / EmailJS الموجودة في المشروع الأصلي بقيت متاحة داخل نسخة ERP

## التشغيل

```bash
npm install
npm run dev
```

## Vercel

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```

`vercel.json` موجود لتوجيه مسارات React إلى `index.html`.

## Android Studio / AAB

بعد تثبيت Node.js:

```bash
npm install
npm run cap:sync
npx cap add android
npx cap sync android
npx cap open android
```

إذا تم إنشاء مجلد Android سابقاً يكفي:

```bash
npm run cap:sync
npx cap open android
```

ثم من Android Studio:

**Build → Generate Signed Bundle / APK → Android App Bundle**

وينتج ملف AAB موقّع للنشر على Google Play.

### Application ID

```text
mr.teyssir.erp
```

## ملاحظة معمارية مهمة

تم اعتماد مرحلة انتقالية آمنة: React هو التطبيق الرئيسي والـERP الأصلي يعمل داخله محلياً. هذا يحافظ على وظائف النظام الحالية، ويتيح بعد ذلك نقل كل Module تدريجياً إلى React بدون إعادة بناء النظام من الصفر.

## ملفات مهمة

- `src/main.jsx` — الواجهة الرئيسية React
- `src/styles.css` — التصميم
- `public/erp/` — نسخة Teyssir ERP الحالية
- `capacitor.config.ts` — إعداد Android
- `vercel.json` — إعداد Vercel
- `manifest.webmanifest` — PWA
## Firebase configuration and GitHub secret warning

The legacy ERP no longer contains a hardcoded Firebase API key. The file `public/erp/firebase-config.js` is generated during `npm run dev` / `npm run build` from `VITE_FIREBASE_*` environment variables and is ignored by Git.

### Local / Vercel
1. Copy `.env.example` to `.env.local` and fill in the Firebase client configuration from the Firebase Console.
2. For Vercel, add the same `VITE_FIREBASE_*` variables under Project Settings → Environment Variables, then redeploy.
3. For Android/Capacitor, run the build with those variables present; the Firebase client configuration is bundled into the app.

Firebase client API keys are public identifiers, not authorization credentials. Firebase recommends API restrictions, Security Rules, and App Check. Do not place Firebase service-account private keys, FCM server keys, Gemini Developer API keys, or other server secrets in this frontend.

If the old key was already committed to Git history, removing it from the current source does not erase that history. Review the GitHub secret-scanning alert and rotate/restrict the key as appropriate, then clean the old value from repository history before pushing the cleaned project.

