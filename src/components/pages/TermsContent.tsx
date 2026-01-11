import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navigation from '../layout/Navigation';

const TermsContent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>{t('common.back', 'Back')}</span>
          </Link>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">
              {t('terms.title', 'Умови використання')}
            </h1>
            <p className="text-muted-foreground text-lg">
              {t('terms.subtitle', 'Будь ласка, уважно ознайомтесь з умовами використання нашого сервісу')}
            </p>
          </div>

          {/* Terms Content */}
          <div className="prose prose-invert max-w-none">
            {/* Section 1 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                1. {t('terms.section1.title', 'Загальні положення')}
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  {t('terms.section1.p1', 'Сайт є інформаційною онлайн-платформою (агрегатором), що надає користувачам доступ до інформації про товари та посилання на сторонні інтернет-магазини й сервіси.')}
                </p>
                <p>
                  {t('terms.section1.p2', 'Сайт не є продавцем, виробником, посередником, платіжним агентом або стороною договору купівлі-продажу між користувачем і продавцем.')}
                </p>
                <p>
                  {t('terms.section1.p3', 'Усі правовідносини щодо купівлі товарів виникають безпосередньо між користувачем і стороннім продавцем.')}
                </p>
                <p>
                  {t('terms.section1.p4', 'Використовуючи сайт, користувач підтверджує, що ознайомився з цими Умовами та погоджується з ними. У разі незгоди користувач зобов\'язаний припинити використання сайту.')}
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                2. {t('terms.section2.title', 'Призначення платформи')}
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  {t('terms.section2.p1', 'Сайт надає можливість переглядати інформацію про товари (назви, описи, ціни, характеристики) та переходити за зовнішніми посиланнями на сайти продавців.')}
                </p>
                <p>
                  {t('terms.section2.p2', 'Сайт не зберігає та не продає товари, не обробляє платежі та не організовує доставку.')}
                </p>
                <p>
                  {t('terms.section2.p3', 'Вся інформація про товари надходить із відкритих джерел або від третіх осіб і може змінюватися без попередження.')}
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                3. {t('terms.section3.title', 'Реєстрація та обліковий запис')}
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  {t('terms.section3.p1', 'Під час реєстрації користувач зобов\'язується надавати достовірну та актуальну інформацію.')}
                </p>
                <p>{t('terms.section3.introResponsibility', 'Користувач несе повну відповідальність за:')}</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>{t('terms.section3.li1', 'збереження логіна та пароля;')}</li>
                  <li>{t('terms.section3.li2', 'усі дії, здійснені під його обліковим записом.')}</li>
                </ul>
                <p className="mt-4">
                  {t('terms.section3.admin', 'Адміністрація має право тимчасово обмежити або повністю заблокувати доступ до акаунту у разі порушення цих Умов або підозрілої активності.')}
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                4. {t('terms.section4.title', 'Магазини та сторонні сервіси')}
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  {t('terms.section4.p1', 'Інформація про ціни, наявність, умови оплати, доставки, повернення та гарантії надається виключно сторонніми продавцями.')}
                </p>
                <p>{t('terms.section4.adminIntro', 'Адміністрація сайту:')}</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>{t('terms.section4.li1', 'не перевіряє магазини на надійність або законність;')}</li>
                  <li>{t('terms.section4.li2', 'не гарантує актуальність чи точність інформації;')}</li>
                  <li>{t('terms.section4.li3', 'не відповідає за виконання зобов\'язань продавцями.')}</li>
                </ul>
                <p className="mt-4">
                  {t('terms.section4.userResponsibility', 'Користувач зобов\'язаний самостійно перевіряти інформацію про продавця перед здійсненням покупки.')}
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                5. {t('terms.section5.title', 'Реклама')}
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  {t('terms.section5.p1', 'На сайті може розміщуватися реклама третіх осіб, зокрема через рекламні мережі (включно з Adsterra).')}
                </p>
                <p>{t('terms.section5.adminIntro', 'Адміністрація не несе відповідальності за:')}</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>{t('terms.section5.li1', 'зміст рекламних матеріалів;')}</li>
                  <li>{t('terms.section5.li2', 'дії рекламодавців;')}</li>
                  <li>{t('terms.section5.li3', 'продукти чи послуги, що рекламуються.')}</li>
                </ul>
              </div>
            </section>

            {/* Section 6 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                6. {t('terms.section6.title', 'Обмеження відповідальності')}
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  {t('terms.section6.p1', 'Сайт надається за принципом «як є», без будь-яких гарантій.')}
                </p>
                <p>{t('terms.section6.adminIntro', 'Адміністрація сайту не несе відповідальності за:')}</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>{t('terms.section6.li1', 'фінансові втрати або будь-які збитки;')}</li>
                  <li>{t('terms.section6.li2', 'якість, безпеку чи відповідність товарів;')}</li>
                  <li>{t('terms.section6.li3', 'оплату, доставку, повернення або гарантійні зобов\'язання;')}</li>
                  <li>{t('terms.section6.li4', 'спори між користувачем і продавцем;')}</li>
                  <li>{t('terms.section6.li5', 'тимчасову недоступність сайту або сторонніх посилань.')}</li>
                </ul>
                <p className="mt-4">
                  {t('terms.section6.userRisk', 'Усі покупки та взаємодії зі сторонніми сайтами здійснюються користувачем на власний ризик.')}
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                7. {t('terms.section7.title', 'Обробка даних і конфіденційність')}
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  {t('terms.section7.p1', 'Сайт обробляє лише мінімально необхідні технічні дані для забезпечення роботи платформи та безпеки.')}
                </p>
                <p>
                  {t('terms.section7.p2', 'Сайт не несе відповідальності за політику конфіденційності сторонніх сайтів, на які ведуть посилання.')}
                </p>
                <p>
                  {t('terms.section7.p3', 'Персональні дані не передаються третім особам, окрім випадків, передбачених законодавством.')}
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                8. {t('terms.section8.title', 'Зміни умов')}
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  {t('terms.section8.p1', 'Адміністрація має право змінювати ці Умови в будь-який час без попереднього повідомлення.')}
                </p>
                <p>
                  {t('terms.section8.p2', 'Актуальна редакція завжди доступна на сайті.')}
                </p>
                <p>
                  {t('terms.section8.p3', 'Подальше використання сайту після внесення змін означає прийняття оновлених Умов.')}
                </p>
              </div>
            </section>

            <section className="mb-8 glass-card p-8">
              <h2 className="text-2xl font-semibold mb-6 text-white border-b border-zinc-800 pb-3">
                9. {t('terms.section9.title', 'Контактна інформація')}
              </h2>
              <div className="space-y-4">
                <p className="text-zinc-300 leading-relaxed">
                  {t('terms.section9.p1', 'З питань, пов\'язаних із цими Умовами, користувач може звернутися через контактні дані, зазначені на сайті.')}
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Link 
                    to="/contacts" 
                    className="btn-glass px-6 py-3 inline-flex items-center gap-2 hover:scale-105 transition-all duration-200"
                  >
                    {t('nav.contacts', 'Контакти')}
                  </Link>
                  <span className="text-sm text-zinc-400">
                    {t('nav.contacts', 'Контактна інформація доступна на сторінці контактів')}
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Last Updated */}
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {t('terms.lastUpdated', 'Останнє оновлення: 10 січня 2026 року')}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsContent;
