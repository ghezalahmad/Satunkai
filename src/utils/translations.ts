import { Language } from '../types';

type TranslationKey =
    | 'appName'
    | 'home'
    | 'downloads'
    | 'settings'
    | 'pasteUrl'
    | 'detect'
    | 'detecting'
    | 'download'
    | 'downloading'
    | 'openInApp'
    | 'cancel'
    | 'delete'
    | 'share'
    | 'open'
    | 'search'
    | 'noDownloads'
    | 'noDownloadsDesc'
    | 'completed'
    | 'failed'
    | 'pending'
    | 'theme'
    | 'themeSystem'
    | 'themeLight'
    | 'themeDark'
    | 'language'
    | 'english'
    | 'dari'
    | 'pashto'
    | 'privacy'
    | 'privacyNote'
    | 'about'
    | 'version'
    | 'directFile'
    | 'youtube'
    | 'tiktok'
    | 'instagram'
    | 'facebook'
    | 'other'
    | 'complianceTitle'
    | 'complianceDesc'
    | 'adLoading'
    | 'startDownload'
    | 'downloadComplete'
    | 'downloadFailed'
    | 'retry'
    | 'clear';

type Translations = Record<Language, Record<TranslationKey, string>>;

export const translations: Translations = {
    en: {
        appName: 'Satūnkai',
        home: 'Home',
        downloads: 'Downloads',
        settings: 'Settings',
        pasteUrl: 'Paste a URL to download',
        detect: 'Detect',
        detecting: 'Detecting...',
        download: 'Download',
        downloading: 'Downloading...',
        openInApp: 'Open in App',
        cancel: 'Cancel',
        delete: 'Delete',
        share: 'Share',
        open: 'Open',
        search: 'Search downloads...',
        noDownloads: 'No Downloads',
        noDownloadsDesc: 'Your downloads will appear here',
        completed: 'Completed',
        failed: 'Failed',
        pending: 'Pending',
        theme: 'Theme',
        themeSystem: 'System',
        themeLight: 'Light',
        themeDark: 'Dark',
        language: 'Language',
        english: 'English',
        dari: 'دری',
        pashto: 'Pashto',
        privacy: 'Privacy',
        privacyNote: 'Satūnkai respects your privacy. We do not collect or store any personal data. All downloads are stored locally on your device.',
        about: 'About',
        version: 'Version',
        directFile: 'Direct File',
        youtube: 'YouTube',
        tiktok: 'TikTok',
        instagram: 'Instagram',
        facebook: 'Facebook',
        other: 'Unknown',
        complianceTitle: 'Compliance Notice',
        complianceDesc: 'This app only downloads direct media files. Social platform content must be accessed through their official apps.',
        adLoading: 'Loading...',
        startDownload: 'Starting download...',
        downloadComplete: 'Download complete!',
        downloadFailed: 'Download failed',
        retry: 'Retry',
        clear: 'Clear',
    },
    da: {
        appName: 'ساتونکی',
        home: 'خانه',
        downloads: 'دانلودها',
        settings: 'تنظیمات',
        pasteUrl: 'یک لینک برای دانلود وارد کنید',
        detect: 'شناسایی',
        detecting: 'درحال شناسایی...',
        download: 'دانلود',
        downloading: 'درحال دانلود...',
        openInApp: 'باز کردن در برنامه',
        cancel: 'لغو',
        delete: 'حذف',
        share: 'اشتراک',
        open: 'باز کردن',
        search: 'جستجوی دانلودها...',
        noDownloads: 'دانلودی نیست',
        noDownloadsDesc: 'دانلودهای شما اینجا نمایش داده می‌شود',
        completed: 'تکمیل شده',
        failed: 'ناموفق',
        pending: 'درانتظار',
        theme: 'تم',
        themeSystem: 'سیستم',
        themeLight: 'روشن',
        themeDark: 'تاریک',
        language: 'زبان',
        english: 'English',
        dari: 'دری',
        pashto: 'پښتو',
        privacy: 'حریم خصوصی',
        privacyNote: 'ساتونکی به حریم خصوصی شما احترام می‌گذارد. ما هیچ اطلاعات شخصی جمع‌آوری نمی‌کنیم. تمام دانلودها در دستگاه شما ذخیره می‌شوند.',
        about: 'درباره',
        version: 'نسخه',
        directFile: 'فایل مستقیم',
        youtube: 'یوتیوب',
        tiktok: 'تیک‌تاک',
        instagram: 'اینستاگرام',
        facebook: 'فیسبوک',
        other: 'نامشخص',
        complianceTitle: 'اطلاعیه انطباق',
        complianceDesc: 'این برنامه فقط فایل‌های مستقیم را دانلود می‌کند. محتوای شبکه‌های اجتماعی باید از طریق برنامه‌های رسمی آنها دسترسی شود.',
        adLoading: 'درحال بارگذاری...',
        startDownload: 'شروع دانلود...',
        downloadComplete: 'دانلود تکمیل شد!',
        downloadFailed: 'دانلود ناموفق',
        retry: 'تلاش مجدد',
        clear: 'پاک کردن',
    },
    ps: {
        appName: 'ساتونکی',
        home: 'کور',
        downloads: 'ډانلوډونه',
        settings: 'ترتیبات',
        pasteUrl: 'د ډانلوډ لپاره لینک ولیکئ',
        detect: 'پیژندنه',
        detecting: 'پیژندل کیږي...',
        download: 'ډانلوډ',
        downloading: 'ډانلوډ کیږي...',
        openInApp: 'په اپلیکیشن کې پرانیزئ',
        cancel: 'لغوه',
        delete: 'ړنګول',
        share: 'شریکول',
        open: 'پرانیستل',
        search: 'ډانلوډونه ولټوئ...',
        noDownloads: 'هیڅ ډانلوډ نشته',
        noDownloadsDesc: 'ستاسو ډانلوډونه به دلته ښکاره شي',
        completed: 'بشپړ شو',
        failed: 'ناکامه',
        pending: 'انتظار کې',
        theme: 'تیم',
        themeSystem: 'سیسټم',
        themeLight: 'رڼا',
        themeDark: 'تیاره',
        language: 'ژبه',
        english: 'English',
        dari: 'دری',
        pashto: 'پښتو',
        privacy: 'محرمیت',
        privacyNote: 'ساتونکی ستاسو محرمیت ته درناوی کوي. موږ هیڅ شخصي معلومات نه ټولوو. ټول ډانلوډونه ستاسو په وسیله کې ساتل کیږي.',
        about: 'په اړه',
        version: 'نسخه',
        directFile: 'مستقیم فایل',
        youtube: 'یوټیوب',
        tiktok: 'ټیک ټاک',
        instagram: 'انسټاګرام',
        facebook: 'فیسبوک',
        other: 'نامعلوم',
        complianceTitle: 'د موافقت خبرتیا',
        complianceDesc: 'دا اپلیکیشن یوازې مستقیم میډیا فایلونه ډانلوډ کوي.',
        adLoading: 'پورته کیږي...',
        startDownload: 'ډانلوډ پیل شو...',
        downloadComplete: 'ډانلوډ بشپړ شو!',
        downloadFailed: 'ډانلوډ ناکام شو',
        retry: 'بیا هڅه',
        clear: 'پاکول',
    },
};

export function t(key: TranslationKey, language: Language): string {
    return translations[language][key] || translations.en[key] || key;
}

export type { TranslationKey };
