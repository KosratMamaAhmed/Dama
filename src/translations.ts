import { BoardTheme, Difficulty } from './types';

export type Language = 'KU' | 'EN' | 'AR';

export const TRANSLATIONS = {
  KU: {
    TITLE: 'دامەی کوردی',
    START: 'دەستپێکردن',
    RESTART: 'دووبارە کردنەوە',
    BACK: 'بگەڕەوە دواوە (هەنگاوێک)',
    EXIT: 'دەرچوون / ماڵەوە',
    PLAY_AI: 'یاری لەگەڵ ماشێن',
    PLAY_FRIEND: 'یاری لەگەڵ هاوڕێ (ئۆفلاین)',
    PLAYER_1: 'ناوی یاریزانی شین (یەکەم)',
    PLAYER_2: 'ناوی یاریزانی سپی (دووەم)',
    AI_NAME: 'ژیری دەستکرد',
    YOU: 'من',
    FRIEND: 'هاوڕێ',
    TURN_PREFIX: 'سەرەی',
    TURN_SUFFIX: ' : ',
    WINS: 'براوەیە! 🎉',
    MANDATORY: 'دەبێت بەردێک بخۆیت! (ناچاری)',
    EASY: 'ئاسان',
    MEDIUM: 'ناوەند',
    HARD: 'سەخت',
    EXPERT: 'پڕۆفیسۆری دامە 🎓 (ئەستەم)',
    DIFFICULTY: 'ئاستی یاریزانی زیرەک',
    BOARD_THEME: 'دیزاین و ڕەنگی یاریگا',
    LANG_CHOOSE: 'زمان هەڵبژێرە / Select Language',
    PLAY_STORE_MSG: 'بۆ بەکارهێنانێکی باشتر، ئەپی دامەی کوردی لە گووگڵ پلەی دابەزێنە!',
    PLAY_STORE_BTN: 'دابەزاندن لە گوگل پلەی',
    RULES_TITLE: 'یاساکانی یاری دامەی کوردی 📜',
    RULES_PWA: 'بۆ ئایفۆن (PWA) دەتوانیت ئەم لاپەڕەیە بنوسیت بە Add to Home Screen',
    PRIVACY_POLICY: 'سیاسەتی پاراستنی زانیارییەکان (Privacy Policy)',
    THEME_CLASSIC: 'کلاسیک مۆدێرن',
    THEME_EMERALD: 'مرواری سەوز',
    THEME_GOLD: 'زێڕینی پاشایەتی',
    THEME_ROYAL: 'مۆری شاهانە',
    THEME_KURDISH_WOOD: 'دارتەختەی کۆنی کوردی 🪵',
    HINT_BTN: 'ئامۆژگاری / ڕێنوێنی 💡',
    HINT_REVEAL: 'مامۆستای زیرەک پێشنیار دەکات: ',
    LOBBY_ROOM: 'یاری لەگەڵ هاوڕێ (ڕاستەوخۆ) 🔑',
    ROOM_CODE: 'کۆدی ژوورەکەت',
    ROOM_JOIN: 'کۆدی ژووری هاوڕێ بنووسە',
    ROOM_INVITE: 'کۆدەکە بنێرە بۆ هاوڕێکەت بۆ پێکەوە یاری کردن!',
    CHAT_SEND: 'نامەی خێرا',
    REPLAY_MODE: 'سەیرکردنەوەی جوڵەکان (Replay) 🔄',
    REPLAY_PREV: 'جووڵەی پێشوو ◀',
    REPLAY_NEXT: 'جووڵەی داهاتوو ▶',
    REPLAY_EXIT: 'داخستنی سەیرکردنەوە ✕',
    DESIGN_PROFESSOR_TITLE: 'پێشنیاری پڕۆفیسۆری دیزاین 🎨',
    DESIGN_PROFESSOR_CONTENT: 'ئاوێتەکردنی باکگراوندی ڕەشی گەردوونی قووڵ لەگەڵ دوگمەی زێڕینی شاهانەی بریقەدار باشترین کاریگەری سایکۆلۆژی دروست دەکات بۆ پاراستنی تەرکیز و ستراتیژیەت. قەبارەی دوگمەکان و دوورکەوتنەوەیان لە یەکتر (Padding) لەسەر بنەمای "ڕێژەی زێڕین" (Golden Ratio) دیزاین کراوە تا چاوەکان ئارام ببنەوە و هەست بە کۆنتڕۆڵێکی تەواوی یاریگە بکەیت.',
    PLAYSTORE_RULES_TITLE: 'یاساکانی بڵاوکردنەوەی گووگڵ پلەی ستۆر 🤖',
    PLAYSTORE_RULES_CONTENT: `1. **یاسای پاراستنی متمانە و بەکارهێنەر**: قەدەغەکردنی هەموو جۆرە زانیارییەکی زیانبەخش، جنێودان یان دروستکردنی ناڕاستی لە بەشەکانی یارییەکەدا بەبێ جیاوازی.
2. **شەفافییەت و داتای ڕاستەقینە**: نابێت وێنە یان وەسفی درۆینە بەکاربێت کە گوزارشت لە ڕاستی ئەپەکە نەکات. وەسفی ئەپەکە دەبێت بە تەواوی هاوتای یاری نێو مۆبایلەکە بێت.
3. **پاراستنی مافی بڵاوکردنەوە (Copyright)**: رێزگرتن لە مافە فیکرییەکان و دیزاینی فۆنتاکان و لۆگۆکانی نێو یارییەکە و دوورکەوتنەوە لە بەکارهێنانی سەرچاوە یاخود لۆگۆی دزراو یاخود بێ مۆڵەت.
4. **سیاسەتی پاراستنی نهێنی و داتا**: پێویستە بەستەری پاراستنی نهێنی (Privacy Policy) هەمیشە بەردەست بێت بۆ پیشاندانی چۆنیەتی پاسەوانیکردن لە زانیاری کەسیی بەکارهێنەران بە شێوەی سەلامەت.`,
    RULES_CONTENT: `1. **یاسای یەکەم - ناسینەوەی دامەی کوردی**: هەر لایەنێک خاوەنی ١٦ بەردە کە لەسەر ڕووبەڕێکی ٨x٨ ڕیزکراون. بەردەکان لە سەرەتادا لە ڕیزی دووەم و سێیەمی بەکارهێنەر دادەنرێن.
2. **یاسای دووەم - جووڵەی سەرەتایی**: بەردی ئاسایی تەنها بۆ پێشەوە، لای چەپ، و لای ڕاست دەچێت. بەردی ئاسایی هەرگیز بۆ دواوە ناگەڕێتەوە.
3. **یاسای سێیەم - خواردنی ناچاری (مەرج)**: خواردنی بەردی جەنگاوەر ناچارییە! ئەگەر دەرفەتت هەبێت، دەبێت بیخۆیت. ئەگەر زنجیرەیەک خواردن هەبێت، دەبێت بەردەوام بیت تاوەکو هەموویان دەخۆیت.
4. **یاسای چوارەم - شاهانە (پاشا)**: کاتێک بەردێک دەگاتە ڕیزی کۆتایی ڕکابەر، دەبێتە (شا). شا توانای بێسنووری هەیە؛ دەتوانێت بە چوار لایەکەدا بۆ پێشەوە، دواوە، چەپ و ڕاست بڕوات.
5. **یاسای پێنجەم - براوەی یاریەکە**: براوە ئەو کەسەیە کە هەموو بەردەکانی بەرامبەرەکە بخوات یان ڕێگری لە جووڵەی سەرجەم بەردەکانی ڕکابەر بکات بە شێوازێکی تەواو.
6. **یاسای شەشەم - ڕێسای دوا بەرد**: ئەگەر تەنها یەک بەردی یاریزانەکە مایەوە، بە شێوەیەکی خۆکارانە دەبێت بە (شا) لە هەر کوێیەکی یارییەکە بێت بۆ هێز و هاوسەنگی زیاتر.`
  },
  EN: {
    TITLE: 'Kurdish Dama',
    START: 'Start Game',
    RESTART: 'Restart Game',
    BACK: 'Undo (Back 1 Step)',
    EXIT: 'Exit to Home',
    PLAY_AI: 'Play against AI (Robot)',
    PLAY_FRIEND: 'Play with a Friend',
    PLAYER_1: 'Blue Player Name (1st)',
    PLAYER_2: 'White Player Name (2nd)',
    AI_NAME: 'Gemini AI',
    YOU: 'You',
    FRIEND: 'Friend',
    TURN_PREFIX: 'Turn',
    TURN_SUFFIX: ': ',
    WINS: 'is the Winner! 🎉',
    MANDATORY: 'Mandatory capture available!',
    EASY: 'Easy Mode',
    MEDIUM: 'Medium Mode',
    HARD: 'Hard Mode',
    EXPERT: 'Dama Professor 🎓 (Unbeatable)',
    DIFFICULTY: 'AI Difficulty',
    BOARD_THEME: 'Board Skin and Theme',
    LANG_CHOOSE: 'Select Language',
    PLAY_STORE_MSG: 'For the best mobile experience, download Kurdish Dama on Google Play Store!',
    PLAY_STORE_BTN: 'Get it on Google Play',
    RULES_TITLE: 'Kurdish Dama Rules 📜',
    RULES_PWA: 'For iOS users, tap Share then "Add to Home Screen" to install as PWA.',
    PRIVACY_POLICY: 'Privacy Policy',
    THEME_CLASSIC: 'Classic Slate',
    THEME_EMERALD: 'Emerald Oasis',
    THEME_GOLD: 'Golden Royal',
    THEME_ROYAL: 'Royal Amethyst',
    THEME_KURDISH_WOOD: 'Folklore Kurdish Wood 🪵',
    HINT_BTN: 'Get Coach Hint 💡',
    HINT_REVEAL: 'Coach highly recommends: ',
    LOBBY_ROOM: 'Room System & Online Lobby 🔑',
    ROOM_CODE: 'Your Room Code',
    ROOM_JOIN: 'Enter Room Code to Join',
    ROOM_INVITE: 'Share this code with your friend to connect instantly!',
    CHAT_SEND: 'Quick Chat / Emoji',
    REPLAY_MODE: 'Match Replay / Move History 🔄',
    REPLAY_PREV: '◀ Previous Move',
    REPLAY_NEXT: '▶ Next Move',
    REPLAY_EXIT: 'Close Replay ✕',
    DESIGN_PROFESSOR_TITLE: "Design Professor's Recommendation 🎨",
    DESIGN_PROFESSOR_CONTENT: "Blending a deep cosmic obsidian black background with energetic royal gold buttons creates the ultimate psychological environment for focus, cognitive endurance, and state strategy. Elements obey the mathematical Golden Ratio rules to maximize visual balance and tactile satisfaction.",
    PLAYSTORE_RULES_TITLE: "Google Play Store Publishing & Content Policies 🤖",
    PLAYSTORE_RULES_CONTENT: `1. **Safety and Content Integrity**: Absolute prohibition of unauthorized trademark usage, malware introduction, deceptive mechanics, or hate speech within metadata.
2. **Metadata Transparency**: Game descriptions, icons, screenshots, and visual assets must realistically showcase actual gameplay without misrepresentation.
3. **Data Security and Privacy Policy**: Developer must secure personal accounts, present an explicit Privacy Statement, and maintain sandboxed local offline persistence.
4. **Intellectual Property Respect**: All logos, sound resources, fonts, and assets must belong to the author or have legitimate distribution licenses.`,
    RULES_CONTENT: `1. **Rule One - Kurdish Dama Setup**: Each side begins with 16 checkers laid out on a standard 8x8 table, placed strictly on rows 2 and 3 of each side.
2. **Rule Two - Basic Movements**: Regular pieces move orthogonally: strictly forward, left, or right. Regular pieces are never allowed to step backward.
3. **Rule Three - Mandatory Captures**: Committing to a capture-step is obligatory! If you can jump over and eat an opponent piece, you must do so. Long chain jumps must be fully executed.
4. **Rule Four - Sovereign Promotion (King)**: Once a piece reaches the opposite baseline, it is promoted to a King. Kings command unlimited orthogonal range across all world directions.
5. **Rule Five - Victory Criteria**: The round is won by capturing all rival checkers or successfully blockading all of their potential legal movements.
6. **Rule Six - Sole Survivor Privilege**: If a player is reduced to their absolute final checker, it immediately and automatically promotes to a King, enabling active balance.`
  },
  AR: {
    TITLE: 'الدامة الكردية',
    START: 'ابدأ اللعبة',
    RESTART: 'إعادة اللعبة',
    BACK: 'رجوع خطوة واحدة',
    EXIT: 'الخروج للقائمة',
    PLAY_AI: 'اللعب ضد الذكاء الاصطناعي',
    PLAY_FRIEND: 'اللعب مع صديق',
    PLAYER_1: 'اسم لاعب اللون الأزرق',
    PLAYER_2: 'اسم لاعب اللون الأبيض',
    AI_NAME: 'الذكاء الاصطناعي',
    YOU: 'أنا',
    FRIEND: 'صديق',
    TURN_PREFIX: 'دور اللاعب ',
    TURN_SUFFIX: ' : ',
    WINS: 'هو الفائز! 🎉',
    MANDATORY: 'القفز وأكل الحجر إجباري!',
    EASY: 'سهل جداً',
    MEDIUM: 'متوسط الأداء',
    HARD: 'صعب جداً',
    EXPERT: 'بروفيسور الدامة الكردية 🎓 (مستحيل)',
    DIFFICULTY: 'مستوى الصعوبة',
    BOARD_THEME: 'مظهر وخلفية الملعب',
    LANG_CHOOSE: 'اختر اللغة',
    PLAY_STORE_MSG: 'للحصول على أفضل تجربة، حمّل تطبيق الدامة الكردية على متجر Google Play!',
    PLAY_STORE_BTN: 'تنزيل من متجر Google Play',
    RULES_TITLE: 'قواعد وأسس الدامة الكردية 📜',
    RULES_PWA: 'لمستخدمي الآيفون، اضغط على مشاركة واختيار "إضافة إلى الشاشة الرئيسية"',
    PRIVACY_POLICY: 'سياسة الخصوصية وسرية البيانات',
    THEME_CLASSIC: 'کلاسیک عادي',
    THEME_EMERALD: 'الزمرد الأخضر',
    THEME_GOLD: 'الذهبي الملكي',
    THEME_ROYAL: 'البنفسجي الإمبراطوري',
    THEME_KURDISH_WOOD: 'الخشب الكردي الفلكلوري 🪵',
    HINT_BTN: 'صاحب النصيحة 💡',
    HINT_REVEAL: 'المدرب ينصحك بـ: ',
    LOBBY_ROOM: 'نظام الغرف والتحدي أونلاين 🔑',
    ROOM_CODE: 'رمز الغرفة الخاصة بك',
    ROOM_JOIN: 'أدخل رمز الغرفة للانضمام',
    ROOM_INVITE: 'شارك هذا الرمز مع صديقك للاتصال فوراً!',
    CHAT_SEND: 'الدردشة السريعة والرموز',
    REPLAY_MODE: 'إعادة شريط المباراة 🔄',
    REPLAY_PREV: '◀ الحركة السابقة',
    REPLAY_NEXT: '▶ الحركة التالية',
    REPLAY_EXIT: 'إنهاء العرض ✕',
    DESIGN_PROFESSOR_TITLE: "توصية بروفيسور التصميم 🎨",
    DESIGN_PROFESSOR_CONTENT: "دمج خلفية السواد الكوني العميق بلمسات ذهبية ملكية مشعة يخلق البيئة النفسية المثالية للتركيز الذهني والذكاء الاستراتيجي. نتبع بدقة قواعد النسبة الذهبية (Golden Ratio) لتوفير أقصى درجات التوازن البصري والارتجال الإبداعي الممتع للعين.",
    PLAYSTORE_RULES_TITLE: "سياسات وقواعد النشر في متجر جوجل بلاي 🤖",
    PLAYSTORE_RULES_CONTENT: `1. **أمان وثقة المحتوى**: حظر كامل لخطاب الكراهية والممارسات الاحتيالية أو الملفات الضارة وتجنب استدراج المستخدمين بأكاذيب دعائية.
2. **شفافية البيانات الوصفية**: الحفاظ على توافق كامل بين شعارات اللعبة، لقطات الشاشة والوصف التوضيحي مع التجربة الحقيقية داخل التطبيق.
3. **حماية الخصوصية والأمان الرقمي**: التزام مطلق بإدراج رابط سياسة الخصوصية الموثقة وتجنب استبقاء أو تسريب أية بيانات شخصية للمستخدمين خارج النطاق المحلي.
4. **احترام حقوق الملكية الفكرية**: تفادي استخدام أسماء تجارية أو لاند مارك حصرية دون ترخيص صريح من أصحاب الحقوق الأصليين.`,
    RULES_CONTENT: `1. **القاعدة الأولى - تنظيم الدامة الكردية**: يمتلك كل جانب ١٦ حجرًا مصفوفة على رقعة قياسية ٨×٨، توضع في البداية على الصفين الثاني والثالث من كل جانب.
2. **القاعدة الثانية - حركة الأحجار**: تتحرك الأحجار العادية للأمام واليسار واليمين فقط، ويُحظر تمامًا تراجع الحجر العادي للخلف.
3. **القاعدة الثالثة - الأكل الإجباري (القفز المرصود)**: إذا توفرت فرصة لتخطي حجر الخصم وأكله، فالأمر إجباري ومفروض عليك، ويجب إكمال سلاسل القفز المتتالية بالكامل.
4. **القاعدة الرابعة - مرتبة الشاه (الملك)**: عندما يصل الحجر إلى الصف الأخير من جهة الخصم، يُرقى فورًا إلى (شاه). يمتلك الشاه حركة غير محدودة في الاتجاهات الأربعة.
5. **القاعدة الخامسة - معيار الانتصار**: يتم حسم المباراة بالتهام كافة أحجار الخصم أو محاصرتها حتى تنعدم إمكانية القيام بأي حركة قانونية.
6. **القاعدة السادسة - قانون الحجر الأخير المستبسل**: إذا تبقّى حجر واحد يتيم للاعب، يتم ترقيته تلقائيًا إلى رتبة (شاه) لتعزيز الندية والتوازن البصري.`
  }
};
