import React from 'react';

export function PrivacyPolicy({ onBack }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#faf8f6'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 20px',
        background: '#fff',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <button
          onClick={onBack}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#f5f2ef',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2d2926" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#2d2926' }}>
          Privacy Policy
        </h1>
      </header>

      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '24px 20px'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <p style={{ color: '#8a8482', marginBottom: '24px' }}>
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <Section title="1. Introduction">
            FreedomMeet ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our dating platform.
          </Section>

          <Section title="2. Information We Collect">
            <strong>Information you provide:</strong>
            <ul style={{ paddingLeft: '20px', marginTop: '8px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>Name and age</li>
              <li style={{ marginBottom: '8px' }}>Gender</li>
              <li style={{ marginBottom: '8px' }}>Profile photos</li>
              <li style={{ marginBottom: '8px' }}>City/location</li>
              <li style={{ marginBottom: '8px' }}>Bio/about me text</li>
              <li style={{ marginBottom: '8px' }}>Messages sent through the platform</li>
            </ul>

            <strong>Information collected automatically:</strong>
            <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
              <li style={{ marginBottom: '8px' }}>Login activity and timestamps</li>
              <li style={{ marginBottom: '8px' }}>Device type and browser information</li>
              <li style={{ marginBottom: '8px' }}>Usage patterns within the app</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
              <li style={{ marginBottom: '8px' }}>To create and manage your profile</li>
              <li style={{ marginBottom: '8px' }}>To match you with other users</li>
              <li style={{ marginBottom: '8px' }}>To enable communication between users</li>
              <li style={{ marginBottom: '8px' }}>To improve and personalize the Service</li>
              <li style={{ marginBottom: '8px' }}>To enforce our Terms of Service</li>
              <li style={{ marginBottom: '8px' }}>To respond to your inquiries and support requests</li>
              <li style={{ marginBottom: '8px' }}>To send important service notifications</li>
            </ul>
          </Section>

          <Section title="4. Information Sharing">
            <strong>We share your information with:</strong>
            <ul style={{ paddingLeft: '20px', marginTop: '8px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}><strong>Other users</strong> - Your profile information is visible to other users of the platform</li>
              <li style={{ marginBottom: '8px' }}><strong>Service providers</strong> - Third parties who help us operate the Service (hosting, analytics)</li>
              <li style={{ marginBottom: '8px' }}><strong>Legal requirements</strong> - When required by law or to protect our rights</li>
            </ul>

            <strong>We do NOT:</strong>
            <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
              <li style={{ marginBottom: '8px' }}>Sell your personal information to third parties</li>
              <li style={{ marginBottom: '8px' }}>Share your messages with anyone except the intended recipient</li>
              <li style={{ marginBottom: '8px' }}>Use your photos for advertising without permission</li>
            </ul>
          </Section>

          <Section title="5. Data Retention">
            <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
              <li style={{ marginBottom: '8px' }}>Active profiles are retained while your account is active</li>
              <li style={{ marginBottom: '8px' }}>Inactive profiles (no login for 30 days) may be automatically removed</li>
              <li style={{ marginBottom: '8px' }}>Chat messages are ephemeral and not permanently stored</li>
              <li style={{ marginBottom: '8px' }}>You can delete your account and data at any time</li>
            </ul>
          </Section>

          <Section title="6. Your Rights">
            You have the right to:
            <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
              <li style={{ marginBottom: '8px' }}><strong>Access</strong> - View the personal data we hold about you</li>
              <li style={{ marginBottom: '8px' }}><strong>Correct</strong> - Update or correct your information</li>
              <li style={{ marginBottom: '8px' }}><strong>Delete</strong> - Delete your account and associated data</li>
              <li style={{ marginBottom: '8px' }}><strong>Restrict</strong> - Limit how we use your data</li>
              <li style={{ marginBottom: '8px' }}><strong>Object</strong> - Object to certain processing of your data</li>
            </ul>
          </Section>

          <Section title="7. Data Security">
            We implement appropriate security measures to protect your information, including:
            <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
              <li style={{ marginBottom: '8px' }}>Encrypted data transmission (HTTPS)</li>
              <li style={{ marginBottom: '8px' }}>Secure server infrastructure</li>
              <li style={{ marginBottom: '8px' }}>Regular security assessments</li>
              <li style={{ marginBottom: '8px' }}>Limited employee access to user data</li>
            </ul>
          </Section>

          <Section title="8. Cookies and Tracking">
            We use local storage and cookies to:
            <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
              <li style={{ marginBottom: '8px' }}>Keep you logged in</li>
              <li style={{ marginBottom: '8px' }}>Remember your preferences</li>
              <li style={{ marginBottom: '8px' }}>Analyze usage patterns</li>
            </ul>
          </Section>

          <Section title="9. Children's Privacy">
            FreedomMeet is not intended for users under 18 years of age. We do not knowingly collect information from children. If we discover we have collected information from a child, we will delete it immediately.
          </Section>

          <Section title="10. International Users">
            Your information may be transferred to and processed in countries other than your own. By using the Service, you consent to this transfer.
          </Section>

          <Section title="11. Changes to This Policy">
            We may update this Privacy Policy from time to time. We will notify you of significant changes through the app or by email.
          </Section>

          <Section title="12. Contact Us">
            If you have questions about this Privacy Policy or your data, please contact us through the app's Report Problem feature.
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h2 style={{
        fontSize: '16px',
        fontWeight: 600,
        color: '#2d2926',
        marginBottom: '12px'
      }}>
        {title}
      </h2>
      <div style={{
        fontSize: '15px',
        color: '#5c5552',
        lineHeight: 1.7
      }}>
        {children}
      </div>
    </div>
  );
}
