import React from 'react';

export function TermsOfService({ onBack }) {
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
          Terms of Service
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

          <Section title="1. Acceptance of Terms">
            By accessing and using FreedomMeet ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
          </Section>

          <Section title="2. Eligibility">
            You must be at least 18 years old to use FreedomMeet. By using the Service, you represent and warrant that you are at least 18 years of age and have the legal capacity to enter into these Terms.
          </Section>

          <Section title="3. Account Registration">
            <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
              <li style={{ marginBottom: '8px' }}>You must provide accurate and complete information when creating your account</li>
              <li style={{ marginBottom: '8px' }}>You are responsible for maintaining the security of your account</li>
              <li style={{ marginBottom: '8px' }}>You may not create accounts for others or transfer your account</li>
              <li style={{ marginBottom: '8px' }}>One account per person is allowed</li>
            </ul>
          </Section>

          <Section title="4. User Conduct">
            You agree NOT to:
            <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
              <li style={{ marginBottom: '8px' }}>Harass, bully, stalk, or intimidate other users</li>
              <li style={{ marginBottom: '8px' }}>Post false, misleading, or deceptive content</li>
              <li style={{ marginBottom: '8px' }}>Share sexually explicit or pornographic content</li>
              <li style={{ marginBottom: '8px' }}>Impersonate another person or entity</li>
              <li style={{ marginBottom: '8px' }}>Use the Service for any illegal purpose</li>
              <li style={{ marginBottom: '8px' }}>Spam or send unsolicited messages</li>
              <li style={{ marginBottom: '8px' }}>Attempt to hack or disrupt the Service</li>
              <li style={{ marginBottom: '8px' }}>Collect information about other users without consent</li>
            </ul>
          </Section>

          <Section title="5. Content">
            <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
              <li style={{ marginBottom: '8px' }}>You retain ownership of content you post</li>
              <li style={{ marginBottom: '8px' }}>You grant us a license to display your content on the Service</li>
              <li style={{ marginBottom: '8px' }}>We may remove content that violates these Terms</li>
              <li style={{ marginBottom: '8px' }}>You are solely responsible for your content</li>
            </ul>
          </Section>

          <Section title="6. Safety">
            <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
              <li style={{ marginBottom: '8px' }}>We do not conduct background checks on users</li>
              <li style={{ marginBottom: '8px' }}>Use caution when meeting people from the Service in person</li>
              <li style={{ marginBottom: '8px' }}>Report suspicious or inappropriate behavior</li>
              <li style={{ marginBottom: '8px' }}>Never share financial information with other users</li>
            </ul>
          </Section>

          <Section title="7. Termination">
            We reserve the right to suspend or terminate your account at any time, with or without notice, for any reason, including violation of these Terms. You may delete your account at any time through the app settings.
          </Section>

          <Section title="8. Disclaimer of Warranties">
            THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE THAT YOU WILL FIND A MATCH OR THAT THE SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE.
          </Section>

          <Section title="9. Limitation of Liability">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
          </Section>

          <Section title="10. Changes to Terms">
            We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the new Terms.
          </Section>

          <Section title="11. Contact">
            If you have questions about these Terms, please contact us through the app's Report Problem feature or at the contact information provided on our website.
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
