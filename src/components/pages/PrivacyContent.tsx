import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Navigation from '@/components/layout/Navigation';

const PrivacyContent = () => {
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
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>{t('common.back')}</span>
          </Link>
          
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 neon-text-strong">
              {t('privacy.title')}
            </h1>
            <p className="text-lg text-zinc-300 mb-6">
              {t('privacy.subtitle')}
            </p>
            <p className="text-sm text-zinc-500">
              {t('privacy.lastUpdated')}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-zinc max-w-none">
            
            {/* Section 1 */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-white border-b border-zinc-800 pb-3">
                1. {t('privacy.section1.title')}
              </h2>
              <div className="space-y-3 text-zinc-300">
                <p className="leading-relaxed">
                  {t('privacy.section1.p1')}
                </p>
                <p className="leading-relaxed">
                  {t('privacy.section1.p2')}
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-white border-b border-zinc-800 pb-3">
                2. {t('privacy.section2.title')}
              </h2>
              <p className="text-zinc-300 mb-4 leading-relaxed">
                {t('privacy.section2.intro')}
              </p>
              <ul className="space-y-2 text-zinc-300 ml-6">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  {t('privacy.section2.li1')}
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  {t('privacy.section2.li2')}
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  {t('privacy.section2.li3')}
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  {t('privacy.section2.li4')}
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-white border-b border-zinc-800 pb-3">
                3. {t('privacy.section3.title')}
              </h2>
              <p className="text-zinc-300 mb-4 leading-relaxed">
                {t('privacy.section3.intro')}
              </p>
              
              <div className="mb-4">
                <h4 className="text-lg font-medium text-white mb-2">{t('privacy.section3.subsection1.title')}</h4>
                <ul className="space-y-2 text-zinc-300 ml-6">
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    {t('privacy.section3.subsection1.li1')}
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    {t('privacy.section3.subsection1.li2')}
                  </li>
                </ul>
              </div>

              <div className="mb-4">
                <h4 className="text-lg font-medium text-white mb-2">{t('privacy.section3.subsection2.title')}</h4>
                <ul className="space-y-2 text-zinc-300 ml-6">
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    {t('privacy.section3.subsection2.li1')}
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    {t('privacy.section3.subsection2.li2')}
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    {t('privacy.section3.subsection2.li3')}
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    {t('privacy.section3.subsection2.li4')}
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    {t('privacy.section3.subsection2.li5')}
                  </li>
                </ul>
              </div>

              <p className="text-zinc-300 leading-relaxed italic">
                {t('privacy.section3.note')}
              </p>
            </section>

            {/* Section 4 */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-white border-b border-zinc-800 pb-3">
                4. {t('privacy.section4.title')}
              </h2>
              <p className="text-zinc-300 mb-4 leading-relaxed">
                {t('privacy.section4.intro')}
              </p>
              <ul className="space-y-2 text-zinc-300 ml-6">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  {t('privacy.section4.li1')}
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  {t('privacy.section4.li2')}
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  {t('privacy.section4.li3')}
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  {t('privacy.section4.li4')}
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-white border-b border-zinc-800 pb-3">
                5. {t('privacy.section5.title')}
              </h2>
              <p className="text-zinc-300 mb-4 leading-relaxed">
                {t('privacy.section5.intro')}
              </p>
              <ul className="space-y-2 text-zinc-300 ml-6">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  {t('privacy.section5.li1')}
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  {t('privacy.section5.li2')}
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  {t('privacy.section5.li3')}
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  {t('privacy.section5.li4')}
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  {t('privacy.section5.li5')}
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-white border-b border-zinc-800 pb-3">
                6. {t('privacy.section6.title')}
              </h2>
              <div className="space-y-3 text-zinc-300">
                <p className="leading-relaxed">
                  {t('privacy.section6.p1')}
                </p>
                <p className="leading-relaxed">
                  {t('privacy.section6.p2')}
                </p>
                <ul className="space-y-2 text-zinc-300 ml-6">
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    {t('privacy.section6.li1')}
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    {t('privacy.section6.li2')}
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    {t('privacy.section6.li3')}
                  </li>
                </ul>
                <p className="leading-relaxed">
                  {t('privacy.section6.p3')}
                </p>
                <p className="leading-relaxed italic">
                  {t('privacy.section6.browserSettings')}
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-white border-b border-zinc-800 pb-3">
                7. {t('privacy.section7.title')}
              </h2>
              <div className="space-y-3 text-zinc-300">
                <p className="leading-relaxed">
                  {t('privacy.section7.p1')}
                </p>
                <p className="leading-relaxed">
                  {t('privacy.section7.intro')}
                </p>
                <ul className="space-y-2 text-zinc-300 ml-6">
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    {t('privacy.section7.li1')}
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    {t('privacy.section7.li2')}
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 8 */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-white border-b border-zinc-800 pb-3">
                8. {t('privacy.section8.title')}
              </h2>
              <div className="space-y-3 text-zinc-300">
                <p className="leading-relaxed">
                  {t('privacy.section8.p1')}
                </p>
                <p className="leading-relaxed">
                  {t('privacy.section8.p2')}
                </p>
                <p className="leading-relaxed">
                  {t('privacy.section8.p3')}
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-white border-b border-zinc-800 pb-3">
                9. {t('privacy.section9.title')}
              </h2>
              <div className="space-y-3 text-zinc-300">
                <p className="leading-relaxed">
                  {t('privacy.section9.intro')}
                </p>
                <ul className="space-y-2 text-zinc-300 ml-6">
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    {t('privacy.section9.li1')}
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    {t('privacy.section9.li2')}
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    {t('privacy.section9.li3')}
                  </li>
                </ul>
                <p className="leading-relaxed">
                  {t('privacy.section9.p2')}
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-white border-b border-zinc-800 pb-3">
                10. {t('privacy.section10.title')}
              </h2>
              <div className="space-y-3 text-zinc-300">
                <p className="leading-relaxed">
                  {t('privacy.section10.intro')}
                </p>
                <ul className="space-y-2 text-zinc-300 ml-6">
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    {t('privacy.section10.li1')}
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    {t('privacy.section10.li2')}
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    {t('privacy.section10.li3')}
                  </li>
                </ul>
                <p className="leading-relaxed italic">
                  {t('privacy.section10.note')}
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-white border-b border-zinc-800 pb-3">
                11. {t('privacy.section11.title')}
              </h2>
              <div className="space-y-3 text-zinc-300">
                <p className="leading-relaxed">
                  {t('privacy.section11.p1')}
                </p>
                <p className="leading-relaxed">
                  {t('privacy.section11.p2')}
                </p>
                <p className="leading-relaxed">
                  {t('privacy.section11.p3')}
                </p>
              </div>
            </section>

            {/* Section 12 - Contact */}
            <section className="mb-12 glass-card p-8">
              <h2 className="text-2xl font-semibold mb-6 text-white border-b border-zinc-800 pb-3">
                12. {t('privacy.section12.title')}
              </h2>
              <p className="text-zinc-300 mb-6 leading-relaxed">
                {t('privacy.section12.p1')}
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link 
                  to="/contacts" 
                  className="btn-glass px-6 py-3 inline-flex items-center gap-2 hover:scale-105 transition-all duration-200"
                >
                  {t('nav.contacts')}
                </Link>
                <span className="text-sm text-zinc-400">
                  Контактна інформація доступна на сторінці контактів
                </span>
              </div>
            </section>

          </div>

          {/* Last Updated */}
          <div className="mt-12 pt-8 border-t border-zinc-800">
            <p className="text-sm text-zinc-500">
              {t('privacy.lastUpdated')}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyContent;
