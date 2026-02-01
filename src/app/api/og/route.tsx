import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Wearsearch';
  const price = searchParams.get('price');
  const currency = searchParams.get('currency') || 'UAH';
  const image = searchParams.get('image');

  const priceLine = price ? `${price} ${currency}` : 'Compare prices on Wearsearch';

  return new ImageResponse(
    <div
      style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1c1c1c 100%)',
        color: 'white',
        padding: '48px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          flex: '1 1 0%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          paddingRight: '32px',
        }}
      >
        <div style={{ fontSize: '28px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          Wearsearch
        </div>
        <div>
          <div
            style={{
              fontSize: '64px',
              fontWeight: 700,
              lineHeight: 1.05,
              marginBottom: '20px',
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: '32px', opacity: 0.85 }}>{priceLine}</div>
        </div>
        <div style={{ fontSize: '18px', opacity: 0.6 }}>wearsearch.com</div>
      </div>
      <div
        style={{
          width: '420px',
          height: '534px',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '28px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {image ? (
          <img src={image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ fontSize: '20px', opacity: 0.7 }}>No image</div>
        )}
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  );
}
