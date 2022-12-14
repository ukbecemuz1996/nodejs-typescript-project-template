import { join } from 'path';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';

i18next
    .use(middleware.LanguageDetector)
    .use(Backend)
    .init({
        debug: false,
        detection: {
            order: ['querystring'],
            lookupQuerystring: 'lng',
        },
        ns: ['auth'],
        preload: ['en'],
        lng: 'en',
        fallbackLng: 'en',
        backend: {
            loadPath: join(__dirname, '/locales/{{lng}}/{{ns}}.json'),
        },
    });

export default i18next;
