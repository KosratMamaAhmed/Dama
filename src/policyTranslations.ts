export interface PolicyTranslations {
  title: string;
  intro: string;
  dataTitle: string;
  dataContent: string;
  offTitle: string;
  offContent: string;
  adTitle: string;
  adContent: string;
  conTitle: string;
  conContent: string;
}

export const POLICY_TRANSLATIONS: Record<'KU' | 'EN' | 'AR', PolicyTranslations> = {
  KU: {
    title: 'سیاسەتی پاراستنی زانیارییەکان',
    intro: 'ئەم ئەپڵیکەیشنە بە تەواوی ئۆفلاین کاردەکات و هیچ زانیارییەکی کەسی تۆ کۆناکاتەوە.',
    dataTitle: '١. زانیارییە کۆکراوەکان',
    dataContent: 'ئێمە هیچ زانیارییەکی مۆبایل، ناو، یان شوێنی جوگرافی کۆناکەینەوە و هیچ سێرڤەرێکی دەرەکیمان نییە.',
    offTitle: '٢. کارکردنی ئۆفلاین',
    offContent: 'هەموو یارییەکان ڕاستەوخۆ لەسەر ئامێرەکەت پاشەکەوت و جێبەجێ دەبن بەبێ هێڵی ئینتەرنێت.',
    adTitle: '٣. ڕیکلام و ناسنامە',
    adContent: 'ئەپەکە هیچ نیشانەیەکی ڕیکلام یان شوێنکەوتنی بۆ بەکارهێنەر تێدا نییە.',
    conTitle: '٤. پەیوەندی',
    conContent: 'ئەگەر پرسیارێکت هەیە، دەتوانیت پەیوەندیمان پێوە بکەیت لە ڕێگەی darmanzany2026@gmail.com.',
  },
  EN: {
    title: 'Privacy Policy',
    intro: 'This application works fully offline and does not collect any personal data.',
    dataTitle: '1. Information Collection',
    dataContent: 'We do not collect any personal device identifiers, names, or location data. Everything is strictly local.',
    offTitle: '2. Offline Execution',
    offContent: 'All games are computed directly on your system and stored temporarily in client memory.',
    adTitle: '3. Ads and Analytics',
    adContent: 'No third-party trackers or advertisements are integrated inside this application.',
    conTitle: '4. Contact',
    conContent: 'If you have any questions, please contact us at darmanzany2026@gmail.com.',
  },
  AR: {
    title: 'سياسة الخصوصية وسرية البيانات',
    intro: 'هذا التطبيق يعمل بدون إنترنت تماماً ولا يجمع أي بيانات شخصية تخص المستخدم.',
    dataTitle: '١. جمع البيانات زالخصوصية',
    dataContent: 'نحن لا نتحفظ على أي هويات تخص الجهاز الذكي أو أسماء اللاعبين أو المواقع الجغرافية.',
    offTitle: '٢. تشغيل أوفلاين',
    offContent: 'كل المباريات تحسب برمجياً على معالج جهازك الشخصي دون الحاجة لإرسالها لأي خوادم خارجية.',
    adTitle: '٣. الإعلانات والتحليلات',
    adContent: 'هذا التطبيق خالٍ تماماً من أي برمجيات تتبع أو إعلانات ربحية.',
    conTitle: '٤. تواصل معنا',
    conContent: 'لأي استفسار يرجى مراسلتنا فوراً عبر البريد الإلكتروني darmanzany2026@gmail.com.',
  }
};
