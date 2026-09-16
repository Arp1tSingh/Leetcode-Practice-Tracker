import { ImageResponse } from 'next/og';

export const alt = 'LeetCode FSRS - Spaced Repetition for Developers';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundColor: '#090a0f',
          backgroundImage:
            'radial-gradient(circle at 25% 25%, rgba(56, 189, 248, 0.15), transparent 45%), radial-gradient(circle at 80% 70%, rgba(99, 102, 241, 0.15), transparent 50%)',
          padding: '80px',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          border: '12px solid #181b26',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              fontSize: '18px',
              fontWeight: 800,
              letterSpacing: '-0.05em',
            }}
          >
            LC
          </div>
          <div
            style={{
              display: 'flex',
              padding: '6px 16px',
              borderRadius: '999px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              color: '#93c5fd',
              textTransform: 'uppercase',
            }}
          >
            FSRS Scheduling Engine
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h1
            style={{
              fontSize: '68px',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              margin: 0,
              background: 'linear-gradient(to bottom right, #ffffff, #94a3b8)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            LeetCode FSRS
          </h1>
          <p
            style={{
              fontSize: '28px',
              color: '#94a3b8',
              margin: 0,
              maxWidth: '850px',
              lineHeight: 1.4,
            }}
          >
            Make every solved problem easier to retrieve. Turn one-off solves into a durable spaced repetition practice loop.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '28px',
          }}
        >
          <div style={{ display: 'flex', gap: '24px' }}>
            <span style={{ fontSize: '18px', color: '#cbd5e1', fontWeight: 500 }}>
              • Spaced Repetition (FSRS-5)
            </span>
            <span style={{ fontSize: '18px', color: '#cbd5e1', fontWeight: 500 }}>
              • Pattern Mastery Matrix
            </span>
            <span style={{ fontSize: '18px', color: '#cbd5e1', fontWeight: 500 }}>
              • Submission Sync
            </span>
          </div>
          <span style={{ fontSize: '18px', color: '#64748b', fontWeight: 600 }}>
            leetcode-fsrs.vercel.app
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
