import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, BookOpen, UserCheck, Smartphone, ExternalLink, X } from 'lucide-react';

interface ModalProps {
  lang: 'KU' | 'EN' | 'AR';
  onClose: () => void;
}

export function PlayStorePoliciesModal({ lang, onClose }: ModalProps) {
  const isRtl = lang === 'KU' || lang === 'AR';
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[110] p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: -15 }}
        className="w-full max-w-lg bg-neutral-900 border border-cyan-500/20 rounded-3xl p-6 relative max-h-[85vh] overflow-y-auto shadow-[0_20px_50px_rgba(6,182,212,0.15)] flex flex-col font-sans"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-xl bg-white/5 active:scale-95 transition-all cursor-pointer z-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/35">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">
              {lang === 'KU' ? 'یاسا و مەرجەکانی فەرمی گۆگڵ پڵەی' : lang === 'AR' ? 'شروط وسياسات غوغل بلاي' : 'Google Play Developer Policies'}
            </h2>
            <p className="text-[10px] text-cyan-400 font-extrabold tracking-widest uppercase">
              {lang === 'KU' ? 'پێوانە یاساییەکان' : lang === 'AR' ? 'امتثال المتجر الرسمي' : 'Compliance Hub'}
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-5 text-neutral-300 overflow-y-auto text-sm leading-relaxed pr-1">
          {/* Section 1: Privacy and Local Data Safety */}
          <div className="bg-neutral-950/40 border border-white/5 p-4 rounded-2xl">
            <h3 className="text-white font-black mb-1.5 text-xs sm:text-sm flex items-center gap-2">
              <span className="text-cyan-400">●</span>
              {lang === 'KU' ? 'تایبەتێتی و پاراستنی زانیارییەکان (Privacy Policy)' : lang === 'AR' ? 'سياسة الخصوصية وأمان البيانات' : 'Privacy Policy & Local Cache Data'}
            </h3>
            <p className="text-xs text-neutral-405 leading-relaxed">
              {lang === 'KU' ? 
                'ئێمە زۆر بەجدی تێڕوانین لە سەر تایبەتێتی بەکارهێنەرانمان دەکەین. ئەم بەرنامەیە بە هیچ سەرچاوەیەکی دەرەکییەوە پەیوەندیدار نییە و هیچ زانیارییەکی کەسیی، وێنە، ناو یان شوێنی جوگرافیی بەکارهێنەر کۆناکاتەوە و نانێرێت بۆ هیچ سێرڤەرێک. هەموو زانیارییە ناوخۆییەکانی وەک ژمارەی دراوەکان (کۆین) تەنها لەسەر ئامێری مۆبایلەکەت بە توندی وەک کاش پاشەکەوت دەکرێن.' : 
                lang === 'AR' ? 
                'نحن في تطبيق دامة نهتم بخصوصية مستخدمينا لأبعد الحدود. هذا التطبيق يعمل بشكل محلي 100٪ ولا يقوم بجمع، تخزين، أو نقل أي بيانات شخصية، صور أو ملفات تخص المستخدم. جميع بياناتك مثل كمية الكوينز والمستويات محفوظة بأمان داخل جهازك فقط.' :
                'We take user privacy extremely seriously. This application operates entirely offline and does not harvest, store, or transmit any client information, photos, files, or locations to outer servers. All in-game coins, achievements, and customizations are cached locally and securely on your phone.'
              }
            </p>
          </div>

          {/* Section 2: Family friendly & Children Safety */}
          <div className="bg-neutral-950/40 border border-white/5 p-4 rounded-2xl">
            <h3 className="text-white font-black mb-1.5 text-xs sm:text-sm flex items-center gap-2">
              <span className="text-cyan-400">●</span>
              {lang === 'KU' ? 'سەلامەتی منداڵان و خێزان (Family & Safe Use)' : lang === 'AR' ? 'أمان العائلة والأطفال' : 'Children Safety & Content Ratings'}
            </h3>
            <p className="text-xs text-neutral-405 leading-relaxed">
              {lang === 'KU' ? 
                'یارییەکە گونجاوە بۆ سەرجەم گەورە ساڵان و منداڵان (شیاو بۆ هەموو تەمەنەکان PEGI 3). بە هیچ شێوازێک یاسای خراپ، قومار، توندوتیژی یان پەیوەندی بێ بنەمای تێدا نییە. دڵنیای تەواو دەدەین بە باوان کە ژینگەکەی پارێزراوە.' : 
                lang === 'AR' ? 
                'تصنيف المحتوى آمن تماماً للعائلات والأطفال (PEGI 3). لا يحتوي التطبيق على أي نوع من العنف، المحتوى الحساس أو المحاكاة الخبيثة. نضمن بيئة آمنة دائماً.' :
                'This checker game is fully compliant with Play Store family policies (rated PEGI 3). It contains absolutely zero depictions of violence, gambling simulations, or mature themes. Parents can rest assured that this environment is completely secure.'
              }
            </p>
          </div>

          {/* Section 3: Legal Disclaimers & Google Guidelines */}
          <div className="bg-neutral-950/40 border border-white/5 p-4 rounded-2xl">
            <h3 className="text-white font-black mb-1.5 text-xs sm:text-sm flex items-center gap-2">
              <span className="text-cyan-400">●</span>
              {lang === 'KU' ? 'یاسا فەرمییەکانی گەشەپێدەری گوگڵ (Google Policy Terms)' : lang === 'AR' ? 'سياسات النشر والملكية الفكرية' : 'Google Developer Distribution Compliance'}
            </h3>
            <p className="text-xs text-neutral-405 leading-relaxed">
              {lang === 'KU' ? 
                'ئەم یارییە بە تەواوی دان بە مەرجەکانی بڵاوکردنەوەی دادەنێت. بەکارهێنەران لێی بەرپرس نین لە پێدانی پارە یان بەشداری زۆرەملێ. هەروەها بەرنامەکە نەرمەکاڵایەکی سەلامەت و باوەڕپێکراوە کە گەشەی پێدراوە بەبێ کێشەی سیستەمی.' : 
                lang === 'AR' ? 
                'تلتزم اللعبة بكافة بنود Google Play Developer Agreement. لا يوجد بيع إجباري أو وصول لبيانات حساسة من دون مبرر. التطبيق مضمون وموثق.' :
                'This asset complies natively with Google Play Developer Distribution agreements. There are no deceptive subscriptions, dynamic paywalls, or unnecessary tracking SDKs.'
              }
            </p>
          </div>

          {/* Section 4: Android Studio Required Permissions & Manifest Integration */}
          <div className="bg-neutral-950/40 border border-white/5 p-4 rounded-2xl">
            <h3 className="text-white font-black mb-1.5 text-xs sm:text-sm flex items-center gap-2">
              <span className="text-cyan-400">●</span>
              {lang === 'KU' ? 'یاساکانی ئەندرۆید ستۆدیۆ و مۆڵەتە پێویستەکان (Android Permissions Guide)' : lang === 'AR' ? 'أذونات أندرويد وتهيئة مانيفست' : 'Android Studio Permissions & Manifest Config'}
            </h3>
            <div className="text-xs text-neutral-300 space-y-2 leading-relaxed">
              <p>
                {lang === 'KU' ? 
                  'بۆ بڵاوکردنەوەی بەرنامەکە بە شێوەیەکی فەرمی لە سەر ئامێرەکانی ئەندرۆید لە ڕێگەی Android Studio، پێویستە ئەم لۆکاڵ مۆڵەتانەی خوارەوە لە فایلی AndroidManifest.xml جێگیر بکرێت بۆ دڵنیابوون لە کارکردنی بێ کێشەی دۆخی ئۆفلاین:' : 
                  lang === 'AR' ? 
                  'لتهيئة التطبيق للعمل بكفاءة تامة على متجر غوغل بلاي عبر Android Studio، يوصى بإدراج الأذونات البرمجية التالية داخل ملف AndroidManifest.xml لضمان استقرار وضع الأوفلاين واللمس التفاعلي:' : 
                  'To properly bundle this offline-first application as an APK/AAB inside Android Studio, declare these low-level API permissions inside your AndroidManifest.xml to authorize haptic engines and service states:'
                }
              </p>
              <div className="bg-black/40 p-2.5 rounded-lg border border-white/5 font-mono text-[9.5px] text-cyan-300 space-y-1">
                <div>&lt;uses-permission android:name="android.permission.VIBRATE" /&gt; <span className="text-neutral-500 text-[9px] font-sans">({lang === 'KU' ? 'بۆ لەرینەوە و هەستی ڕیالیزم لە کاتی لێدانی بەردەکان' : lang === 'AR' ? 'للرجوع الحسّي عند تحريك الحجر' : 'Haptic feedback on captures'})</span></div>
                <div>&lt;uses-permission android:name="android.permission.WAKE_LOCK" /&gt; <span className="text-neutral-500 text-[9px] font-sans">({lang === 'KU' ? 'بۆ ڕێگری لە کوژانەوەی شاشە لە کاتی بیرکردنەوەی ژیری دەستکرد' : lang === 'AR' ? 'لمنع إطفاء الشاشة أثناء التفكير اللحظي' : 'Prevent sleep mode during AI analysis'})</span></div>
                <div>&lt;uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" /&gt; <span className="text-neutral-500 text-[9px] font-sans">({lang === 'KU' ? 'بۆ کۆنتڕۆڵکردنی دۆخی پەیوەندی و کاراکردنی خۆکاری کاش بە شێوەی ئۆفلاین' : lang === 'AR' ? 'للتحقق من شبكة الجهاز وتفعيل الكاش التلقائي' : 'Graceful cache fallback check'})</span></div>
              </div>
            </div>
          </div>

          {/* Section 5: Future Offline Feature Core Vision for Senior Gaming Engineers */}
          <div className="bg-gradient-to-r from-cyan-950/15 to-neutral-950 border border-cyan-500/20 p-4 rounded-2xl relative overflow-hidden">
            <h3 className="text-white font-black mb-1.5 text-xs sm:text-sm flex items-center gap-2">
              <span className="text-cyan-400">●</span>
              {lang === 'KU' ? 'نەخشەی داهاتووی یاری بە شێوەی ئۆفلاین (Offline Future Roadmap)' : lang === 'AR' ? 'الخطة الهندسية المستقبلية للأوفلاين' : 'Future Offline Engineering Core Vision'}
            </h3>
            <div className="text-xs text-neutral-350 space-y-2 leading-relaxed">
              <p className="font-semibold text-cyan-400 text-[10.5px]">
                {lang === 'KU' ? 'ڕوانگەی یارییەکی ئۆفلاینی تەواو و نایاب (AAA Off-Grid Standard):' : lang === 'AR' ? 'خطتنا الاحترافية لتعزيز الألعاب المحلية:' : 'The Definitive On-Device Gaming Blueprint:'}
              </p>
              <ul className="list-disc pr-4 space-y-1.5 text-neutral-350 text-[11px]">
                <li>
                  <strong>{lang === 'KU' ? 'یاری دەستبەجێ بە بێ تەل (Bluetooth P2P Matchmaking):' : lang === 'AR' ? 'اللعب اللاسلكي المحلي البسيط:' : 'Bluetooth P2P Multiplayer:'}</strong>{' '}
                  {lang === 'KU' ? 'توانای یاری کردن لەگەڵ هاوڕێی نزیکت بە بەکارهێنانی بلوتوز یان خاڵی گەرمی ناوخۆیی بە بێ نیاز بە ئینتەرنێت.' : lang === 'AR' ? 'القدرة على خوض تحديات ثنائية مع أصدقائك عبر البلوتوث من دون مغادرة وضع الطيران.' : 'Enabling seamless dual play with nearby peers using offline direct Bluetooth protocols.'}
                </li>
                <li>
                  <strong>{lang === 'KU' ? 'پاڵەوانێتی خێزانی ناوخۆیی (Offline Grand Championship):' : lang === 'AR' ? 'نظام البطولات التنافسية المحتفظ:' : 'Offline Bracket Generator:'}</strong>{' '}
                  {lang === 'KU' ? 'سیستەمێکی هۆشمەند بۆ دروستکردنی پاڵەوانێتی خولیی بۆ ٤، ٨، یان ١٦ یاریزان لە سەر هەمان ئامێر بە تۆمارکردنی ناوەکان بە شێوەی لۆکاڵ.' : lang === 'AR' ? 'توليد جداول بطولات الدامة التلقائية للمجالس العائلية وحفظ الترتيب محلياً.' : 'Autonomous bracket generation for local 4, 8, or 16 player cozy family tournaments.'}
                </li>
                <li>
                  <strong>{lang === 'KU' ? 'مۆدی دەنگ و کۆمێنتار فۆلکلۆر (Sorani/Kurmanji Audio Commentary):' : lang === 'AR' ? 'الأصوات والتعليقات الشعبية الكردية:' : 'National Folk Commentary Engine:'}</strong>{' '}
                  {lang === 'KU' ? 'تۆمارکردنی دەنگی ڕاستەقینەی فۆلکلۆر لە کاتی خواردنی بەردەکان یان بوون بە پاشا بە زاراوەکانی سۆرانی و کرمانجی بە بەکارهێنانی سەرچاوە ناوخۆییەکان.' : lang === 'AR' ? 'إضافة تعليقات صوتية حماسية ممتعة باللهجات الكردية عند الترقية لملك أو التهام حجر الخصم.' : 'Integrating localized voice recordings triggering on crown drops or triple captures.'}
                </li>
                <li>
                  <strong>{lang === 'KU' ? 'تۆماری فایلی یارییەکان (PGN Game Playback Database):' : lang === 'AR' ? 'محلل سجلات المباريات الأوفلاين:' : 'PGN Offline Playback Coach:'}</strong>{' '}
                  {lang === 'KU' ? 'پاشەکەوتکردنی هەموو یارییە کۆنەکانت بەبێ هێڵ و پێداچوونەوەی ورد بە تەواوی ئاستی جموجۆڵەکانت بۆ باشترکردنی تەکتیکەکانت.' : lang === 'AR' ? 'حفظ الألعاب الفائتة ومراجعتها خطوة بخطوة للوقوف على أخطائك الاستراتيجية محلياً.' : 'Saving on-device match files to step through critical steps and study strategic blunders.'}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-3.5 mt-3 flex justify-between items-center text-[10px] text-neutral-400 font-extrabold text-center shrink-0">
          <span>{lang === 'KU' ? 'سیاسەتی پاراستنی وەشانی فەرمی' : lang === 'AR' ? 'النسخة المعتمدة بامتياز' : 'Official Play Store Version Status'}</span>
          <span className="text-cyan-455">v2.1.0 • SECURE PRO</span>
        </div>
      </motion.div>
    </div>
  );
}

export function DamaRulesModal({ lang, onClose }: ModalProps) {
  const isRtl = lang === 'KU' || lang === 'AR';
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[110] p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: -15 }}
        className="w-full max-w-lg bg-neutral-900 border border-amber-500/20 rounded-3xl p-6 relative max-h-[85vh] overflow-y-auto shadow-[0_20px_50px_rgba(245,158,11,0.15)] flex flex-col font-sans"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-xl bg-white/5 active:scale-95 transition-all cursor-pointer z-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/35">
            <BookOpen className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">
              {lang === 'KU' ? 'ڕێسا و یاساکانی فەرمی یاری دامە' : lang === 'AR' ? 'قواعد وقوانين لعبة الدامة الرسمية' : 'Official Rules of Kurd Dama'}
            </h2>
            <p className="text-[10px] text-amber-400 font-extrabold tracking-widest uppercase">
              {lang === 'KU' ? 'ڕێنمایی گشتی یاری' : lang === 'AR' ? 'دليل اللعب الاحترافي' : 'Rulebook Guide'}
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-4 text-neutral-300 overflow-y-auto text-sm leading-relaxed pr-1 text-justify">
          <div className="space-y-3.5">
            {/* Rule 1 */}
            <div className="bg-neutral-950/30 border border-white/5 p-3.5 rounded-xl">
              <p className="font-extrabold text-amber-400 text-xs uppercase mb-1">{lang === 'KU' ? 'ڕێسای یەکەم: شوێن و ڕێزبەندی' : lang === 'AR' ? 'القاعدة الأولى: التركيب المبدئي' : 'Rule 1: Placement'}</p>
              <p className="text-xs">
                {lang === 'KU' ? 
                  'هەر یاریزانێک لە دەستپێکدا خاوەنی ١٦ بەردە، کە لەسەر خانەکانی ڕیزی دووەم و سێیەمی تەختەکەی ڕێکدەخرێن بە تەواوی ئاسۆیی.' : 
                  lang === 'AR' ? 
                  'يملك كل لاعب في البداية ١٦ حجرًا، يتم ترتيبها بالكامل على الصفين الثاني والثالث من جهة اللاعب بشكل أفقي.' : 
                  'Each player starts with 16 checkers, neatly arranged on the second and third rows of their respective board sides.'
                }
              </p>
            </div>

            {/* Rule 2 */}
            <div className="bg-neutral-950/30 border border-white/5 p-3.5 rounded-xl">
              <p className="font-extrabold text-amber-400 text-xs uppercase mb-1">{lang === 'KU' ? 'ڕێسای دووەم: ئاڕاستەی جوڵە' : lang === 'AR' ? 'القاعدة الثانية: اتجاه التحريك' : 'Rule 2: Movement direction'}</p>
              <p className="text-xs">
                {lang === 'KU' ? 
                  'بەردە ئاساییەکان تەنها بەرەو پێشەوە، چەپ و ڕاست دەڕۆن. بە هیچ جۆرێک بۆ دواوە ناڕۆن و لە خشتە لارەکان تێنەپەڕ دەبن.' : 
                  lang === 'AR' ? 
                  'تتحرك الأحجار العادية فقط للأمام، لليسار، ولليمين. لا تتحرك مطلقاً للخلف أو بشكل قطري مائل.' : 
                  'Normal pieces move only straight forward, to the left, or to the right. They are strictly forbidden from moving backward or diagonally.'
                }
              </p>
            </div>

            {/* Rule 3 */}
            <div className="bg-neutral-950/30 border border-white/5 p-3.5 rounded-xl">
              <p className="font-extrabold text-amber-400 text-xs uppercase mb-1">{lang === 'KU' ? 'ڕێسای سێیەم: لێدانی بێبەزەیی (زۆرەملێ)' : lang === 'AR' ? 'القاعدة الثالثة: القفز الإجباري المدمر' : 'Rule 3: Mandatory Jumps'}</p>
              <p className="text-xs">
                {lang === 'KU' ? 
                  'ئەگەر بەردێکت لە خانەیەکی بەتاڵ نزیک بوو کە بەردی دوژمنی لە نێواندایە، بازدان و خواردنی بەردی ڕکابەر زۆرەملێیە! ئەگەر چەند زنجیرە لێدانێک لەسەر یەک هەبن، پێویستە هەموویان بکەیت تا تەواو بێت.' : 
                  lang === 'AR' ? 
                  'إذا وجد حجر بجانب حجر الخصم ومن ورائه خانة فارغة، فالقفز وأكل الحجر إلزامي بقوة القانون! وإذا توفرت سلسلة قفزات متعددة، فيجب تصفيتها بالكامل حتى النهاية.' : 
                  'If an opponent piece borders your piece with an empty space behind, jumping over and capturing the piece is strictly mandatory! Multiple chained captures must be continuous.'
                }
              </p>
            </div>

            {/* Rule 4 */}
            <div className="bg-neutral-950/30 border border-white/5 p-3.5 rounded-xl">
              <p className="font-extrabold text-amber-400 text-xs uppercase mb-1">{lang === 'KU' ? 'ڕێسای چوارەم: بوون بە شا (پاشا)' : lang === 'AR' ? 'القاعدة الرابعة: الترقية إلى درجة الملك' : 'Rule 4: Promotion to King'}</p>
              <p className="text-xs">
                {lang === 'KU' ? 
                  'کاتیک بەردێکی ئاسایی دەگاتە کۆتا هاندەر یان هێڵی ڕکابەر، پلەکەی بەرز دەبێتەوە بۆ "شا". شا توانای بێسنووری هەیە بە بازدان بەسەر چەندین خانەدا بۆ پاش و پێش و لایەکان بە بێ سنووری مەودا.' : 
                  lang === 'AR' ? 
                  'عندما ينجح الحجر في بلوغ الصف الأخير للخصم، يترقى فوراً لدرجة ملك (دامة). الملك لديه قدرة خارقة للتحرك بأي عدد من الخانات للخلف والأمام والجانبين من دون تقييد.' : 
                  'Upon reaching the baseline of the grid, a piece is crowned a King (Dama). The King gains infinite reach ranges: sliding in any direction (straight backward, forward, left and right) to strike from afar.'
                }
              </p>
            </div>

            {/* Rule 5 */}
            <div className="bg-neutral-950/30 border border-white/5 p-3.5 rounded-xl">
              <p className="font-extrabold text-amber-400 text-xs uppercase mb-1">
                {lang === 'KU' ? 'ڕێسای پێنجەم: گەڕانەوە نییە! (قانون لا تراجع)' : lang === 'AR' ? 'القاعدة الخامسة: ممنوع التراجع (No Undo)' : 'Rule 5: No Undo Policy'}
              </p>
              <p className="text-xs">
                {lang === 'KU' ? 
                  'لە یاری دامەی کوردیی ڕەسەندا، پێویستە بە تەواوی بەرپرسیارێتی هەر جموجۆڵێک بگریتە ئەستۆ! هیچ توانایەک یان دوگمەیەکی گەڕانەوە بۆ پێشوو (Undo) بوونی نییە بۆ هێشتنەوەی گەرموگوڕی و هەیبەتی ڕاستەقینەی یارییەکە.' : 
                  lang === 'AR' ? 
                  'في لعبة الدامة الكردستانية الشعبية، بمجرد تحريك الحجر لا يمكن التراجع عن الخطوة أبداً! اللعبة خالية تماماً من زر التراجع (Undo) لضمان النزاهة والمنافسة العادلة.' : 
                  'In local Kurdish Dama tournament regulations, once you make a move, it is final! There is no Undo button or backward action permitted, training players to plan steps ahead.'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-3 mt-3 flex justify-between items-center text-[10px] text-neutral-400 font-extrabold text-center shrink-0">
          <span>{lang === 'KU' ? 'یاساکانی فیدراسیۆنی دامەی کوردی' : lang === 'AR' ? 'قوانين اتحاد الدامة الكردستاني' : 'Kurdish Dama Federation Rules Approved'}</span>
          <span className="text-amber-455">★ PROFESSIONAL</span>
        </div>
      </motion.div>
    </div>
  );
}

export function AboutUsPortfolioModal({ lang, onClose }: ModalProps) {
  const isRtl = lang === 'KU' || lang === 'AR';
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[110] p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: -15 }}
        className="w-full max-w-lg bg-neutral-900 border border-indigo-500/20 rounded-3xl p-6 relative max-h-[85vh] overflow-y-auto shadow-[0_20px_50px_rgba(99,102,241,0.15)] flex flex-col font-sans"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-xl bg-white/5 active:scale-95 transition-all cursor-pointer z-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/35">
            <UserCheck className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">
              {lang === 'KU' ? 'دەربارەی گەشەپێدەر و بەرهەمەکانمان' : lang === 'AR' ? 'حول المطور وتطبيقاتنا الفنية' : 'About Developer & Apps Portfolio'}
            </h2>
            <p className="text-[10px] text-indigo-400 font-extrabold tracking-widest uppercase">
              {lang === 'KU' ? 'بیناسە و پشتگیری بەکە' : lang === 'AR' ? 'فريق فاميلي تكنولوجي' : 'Creative Studio'}
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-4 text-neutral-300 overflow-y-auto text-sm leading-relaxed pr-1 text-justify">
          <div className="bg-gradient-to-br from-indigo-950/20 to-neutral-950 border border-indigo-500/10 p-4 rounded-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-white font-black mb-1.5 text-xs sm:text-sm flex items-center gap-1.5">
                <span>🌟</span>
                {lang === 'KU' ? 'ئێمە کێین؟' : lang === 'AR' ? 'من نحن؟' : 'Who We Are'}
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {lang === 'KU' ? 
                  'ئێمە گروپێکی سەربەخۆین کە تایبەتمەندین بە بوژاندنەوە و نوێکردنەوەی چاند و کلتور و فۆلکلۆری نەتەوەیی بە فۆرمێکی دیجیتاڵی مۆدێرن و شاهانە. هەمیشە هەوڵدەدەین بەرهەمی نایاب، بێ ڕیکلامی بێزارکەر، و خێرا بگەیەنینە دەستی یاریزانانی کورد لە سەرانسەری جیهان.' : 
                  lang === 'AR' ? 
                  'نحن فريق فني متميز نهدف إلى تقديم الألعاب الفلكلورية والخدمات التعليمية في واجهات عصرية فاخرة وأداء محلي وخفيف على جميع أجهزة الموبايل لتقديم الفائدة العظمى.' : 
                  'We are an independent creative team dedicated to restoring cultural classics, folk narratives, and traditional board games inside pristine pixel-perfect structures. Our focus remains on user experience, offline support, zero ad clutter, and extremely rich native details.'
                }
              </p>
            </div>
            {/* Glowing background bubble */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl" />
          </div>

          <div className="bg-neutral-950/30 border border-white/5 p-4 rounded-2xl">
            <h3 className="text-white font-black mb-1.5 text-xs sm:text-sm flex items-center gap-1.5">
              <span>📱</span>
              {lang === 'KU' ? 'بەرهەمە بەسوودەکانی ترمان (My Other Apps)' : lang === 'AR' ? 'بقية مشاريعنا على المتجر' : 'Our Digital Solutions Ecosystem'}
            </h3>
            <p className="text-xs text-neutral-401 mb-3">
              {lang === 'KU' ? 
                'ئێمە خاوەنی کۆمەڵێکی فراوان لە نەرمەکاڵا و تاقیکردنەوە بیرکاری، کاتژمێری فەرمی، حاسیبەی خانوبەرە، و پرۆگرامی فێرکاری پێشکەوتووین لەسەر گوگڵ پڵەی ستۆر.' : 
                lang === 'AR' ? 
                'نملك حزمة واسعة من الآلات الحاسبة المتقدمة، برامج الكرونومتر، وتجربة رصد السجلات الكردية الرسمية المتوفرة للجميع مجاناً.' : 
                'We manage a broad stack of application models from scientific calculators and chronological track keepers to high-end educational kits designed with supreme reliability.'
              }
            </p>
            
            <a 
              href="https://play.google.com/store" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:scale-[1.02] active:scale-95 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-500/10 cursor-pointer border border-indigo-400/20"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{lang === 'KU' ? 'سەردانی پەیجی فەرمیی لە پلەی ستۆر' : lang === 'AR' ? 'تصفح صفحة الألعاب على غوغل بلاي' : 'Browse Play Store Portfolio'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="border-t border-white/5 pt-3 mt-3 flex justify-between items-center text-[10px] text-neutral-400 font-extrabold text-center shrink-0">
          <span>{lang === 'KU' ? 'گەشەپێدراوی سەلمێنراو' : lang === 'AR' ? 'صنع بحب للمستخدمين' : 'Developed with Integrity'}</span>
          <span className="text-indigo-400">© 2026 PRO GAMING</span>
        </div>
      </motion.div>
    </div>
  );
}
