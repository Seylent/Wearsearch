'use client';

export default function TestPage() {
  return (
    <div style={{ padding: '50px', textAlign: 'center', background: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>✅ Тестова сторінка працює!</h1>
      <p style={{ fontSize: '24px' }}>Якщо ви бачите це, сервер працює правильно.</p>
      <p style={{ fontSize: '18px', marginTop: '20px' }}>URL: /test</p>
      <a href="/" style={{ color: '#4a9eff', fontSize: '20px', marginTop: '30px', display: 'block' }}>← Повернутись на головну</a>
    </div>
  );
}
