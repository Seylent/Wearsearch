// Діагностика авторизації - запустіть у консолі браузера
// Відкрийте DevTools (F12) і вставте цей код у Console

console.log('🔍 AUTH DIAGNOSTICS\n================\n');

// 1. Перевірка токена в localStorage
const authData = localStorage.getItem('wearsearch.auth');
const legacyToken = localStorage.getItem('access_token');
const userData = localStorage.getItem('user');

console.log('1️⃣ LocalStorage:');
if (authData) {
  try {
    const parsed = JSON.parse(authData);
    console.log('  ✅ wearsearch.auth:', {
      hasToken: !!parsed.token,
      tokenLength: parsed.token?.length,
      userId: parsed.userId,
      expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt).toISOString() : 'no expiration',
      isExpired: parsed.expiresAt ? Date.now() > parsed.expiresAt : false
    });
  } catch (e) {
    console.log('  ❌ wearsearch.auth: Invalid JSON');
  }
} else {
  console.log('  ❌ wearsearch.auth: NOT FOUND');
}

if (legacyToken) {
  console.log('  ℹ️ access_token (legacy):', legacyToken.substring(0, 20) + '...');
} else {
  console.log('  ℹ️ access_token (legacy): NOT FOUND');
}

if (userData) {
  try {
    const user = JSON.parse(userData);
    console.log('  ✅ user:', { id: user.id, email: user.email, role: user.role });
  } catch (e) {
    console.log('  ❌ user: Invalid JSON');
  }
} else {
  console.log('  ℹ️ user: NOT FOUND');
}

// 2. Перевірка чи токен додається до запитів
console.log('\n2️⃣ Testing Auth Header:');
fetch('/api/v1/auth/me', {
  method: 'GET',
  credentials: 'include'
})
  .then(async (response) => {
    console.log('  Status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('  ✅ Authenticated as:', data);
    } else {
      console.log('  ❌ Not authenticated:', response.statusText);
      response.text().then(text => console.log('  Response:', text));
    }
  })
  .catch((err) => {
    console.log('  ❌ Request failed:', err.message);
  });

// 3. Перевірка cookies
console.log('\n3️⃣ Cookies:');
console.log('  ', document.cookie || 'No cookies found');

// 4. Перевірка environment
console.log('\n4️⃣ Environment:');
console.log('  Current URL:', window.location.href);
console.log('  API Base URL:', window.location.origin + '/api/v1');

console.log('\n================');
console.log('💡 Якщо токен є, але запити все одно 401:');
console.log('   1. Перевірте чи backend отримує header Authorization');
console.log('   2. Перевірте чи backend правильно валідує JWT токен');
console.log('   3. Спробуйте вийти і зайти знову');
console.log('   4. Очистіть localStorage: localStorage.clear()');
