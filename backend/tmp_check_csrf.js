import { doubleCsrf } from 'csrf-csrf';
const csrf = doubleCsrf({
    getSecret: () => 'secret',
    cookieName: 'ps-csrf-secret',
    cookieOptions: { httpOnly: true, sameSite: 'none', secure: true },
    size: 64,
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
    getSessionIdentifier: (req) => 'anon',
    getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'],
});
console.log('Keys in csrf object:', Object.keys(csrf));
process.exit();
