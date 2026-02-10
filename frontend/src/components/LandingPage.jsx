import React, { useState, useEffect } from 'react';

export function LandingPage({ onGetStarted, onlineCount, onViewTerms, onViewPrivacy }) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  const testimonials = [
    { text: "Finally found my tribe! People here actually share my values.", name: "Sarah, 38", emoji: "💕" },
    { text: "Met my partner here. We connected over our shared beliefs.", name: "Mike & Jessica", emoji: "💍" },
    { text: "Love the conversations here. Real people, real connections.", name: "David, 42", emoji: "✨" },
    { text: "This community feels like home. So refreshing!", name: "Amanda, 35", emoji: "🥰" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #fff9f7 0%, #faf8f6 50%, #fff 100%)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Soft background shapes */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}>
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232, 93, 117, 0.08) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '-10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244, 162, 97, 0.08) 0%, transparent 70%)',
        }} />
      </div>

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 24px'
      }}>
        {/* Header */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #e85d75, #f4a261)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(232, 93, 117, 0.3)'
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <span style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '26px',
              fontWeight: 600,
              color: '#2d2926'
            }}>
              FreedomMeet
            </span>
          </div>

          {onlineCount > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: 'rgba(74, 190, 122, 0.1)',
              borderRadius: '100px',
              border: '1px solid rgba(74, 190, 122, 0.2)'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#4abe7a',
                boxShadow: '0 0 8px #4abe7a'
              }} />
              <span style={{ color: '#3a9d64', fontWeight: 600, fontSize: '14px' }}>
                {onlineCount} online
              </span>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <main style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          paddingTop: '60px',
          paddingBottom: '60px'
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: 'linear-gradient(135deg, rgba(232, 93, 117, 0.1), rgba(244, 162, 97, 0.1))',
            borderRadius: '100px',
            marginBottom: '28px'
          }}>
            <span style={{ fontSize: '16px' }}>🌟</span>
            <span style={{ color: '#e85d75', fontSize: '14px', fontWeight: 600 }}>
              A community for free thinkers
            </span>
          </div>

          {/* Main headline */}
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(36px, 7vw, 60px)',
            fontWeight: 600,
            lineHeight: 1.15,
            marginBottom: '20px',
            maxWidth: '700px',
            color: '#2d2926'
          }}>
            Connect with People
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #e85d75, #f4a261)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Who Share Your Values
            </span>
          </h1>

          {/* Subheadline */}
          <p style={{
            fontSize: '18px',
            color: '#5c5552',
            maxWidth: '550px',
            lineHeight: 1.7,
            marginBottom: '36px'
          }}>
            Join thousands of like-minded singles who value freedom, authenticity, 
            and real human connection. No algorithms. No games. Just genuine people.
          </p>

          {/* CTA Button */}
          <button
            onClick={onGetStarted}
            style={{
              padding: '18px 40px',
              fontSize: '17px',
              fontWeight: 600,
              color: 'white',
              background: 'linear-gradient(135deg, #e85d75, #d94a62)',
              borderRadius: '100px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(232, 93, 117, 0.35)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(232, 93, 117, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(232, 93, 117, 0.35)';
            }}
          >
            Join Our Community
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>

          {/* Trust indicators */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginTop: '28px',
            color: '#8a8482',
            fontSize: '14px'
          }}>
            <span>✓ 100% Free</span>
            <span>✓ Privacy First</span>
            <span>✓ No Censorship</span>
          </div>
        </main>

        {/* Features Section */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          marginBottom: '60px'
        }}>
          <FeatureCard
            icon="🎲"
            title="3-Minute Chats"
            description="Quick, pressure-free conversations. Like each other? Keep chatting!"
            color="#e85d75"
          />
          <FeatureCard
            icon="💬"
            title="Topic Rooms"
            description="Join conversations about health, news, faith, and more."
            color="#4abe7a"
          />
          <FeatureCard
            icon="🎤"
            title="Live Events"
            description="Weekly talks on topics that matter to our community."
            color="#f4a261"
          />
        </section>

        {/* Testimonials */}
        <section style={{
          textAlign: 'center',
          marginBottom: '60px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '24px',
            padding: '40px 32px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            maxWidth: '550px',
            margin: '0 auto',
            border: '1px solid rgba(0,0,0,0.04)'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>
              {testimonials[currentTestimonial].emoji}
            </div>
            
            <p style={{
              fontSize: '20px',
              fontFamily: 'Playfair Display, serif',
              fontStyle: 'italic',
              color: '#2d2926',
              marginBottom: '16px',
              minHeight: '60px',
              lineHeight: 1.5
            }}>
              "{testimonials[currentTestimonial].text}"
            </p>
            
            <p style={{
              color: '#e85d75',
              fontWeight: 600,
              fontSize: '15px'
            }}>
              — {testimonials[currentTestimonial].name}
            </p>

            {/* Dots */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '24px'
            }}>
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTestimonial(i)}
                  style={{
                    width: i === currentTestimonial ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: i === currentTestimonial ? '#e85d75' : '#e0dbd8',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section style={{
          textAlign: 'center',
          paddingBottom: '60px'
        }}>
          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '32px',
            color: '#2d2926',
            marginBottom: '16px'
          }}>
            Ready to find your people?
          </h2>
          <p style={{
            color: '#5c5552',
            marginBottom: '28px',
            fontSize: '16px'
          }}>
            Join a community where you can be yourself.
          </p>
          <button
            onClick={onGetStarted}
            style={{
              padding: '16px 36px',
              fontSize: '16px',
              fontWeight: 600,
              color: 'white',
              background: 'linear-gradient(135deg, #e85d75, #d94a62)',
              borderRadius: '100px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(232, 93, 117, 0.3)'
            }}
          >
            Get Started — It's Free
          </button>
        </section>

        {/* Footer */}
        <footer style={{
          textAlign: 'center',
          padding: '24px 0',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          color: '#8a8482',
          fontSize: '14px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <p>Made with ❤️ for people who value freedom</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button
              onClick={onViewTerms}
              style={{
                color: '#b8a9ad',
                fontSize: '12px',
                background: 'transparent'
              }}
            >
              Terms of Service
            </button>
            <button
              onClick={onViewPrivacy}
              style={{
                color: '#b8a9ad',
                fontSize: '12px',
                background: 'transparent'
              }}
            >
              Privacy Policy
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '20px',
      padding: '28px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      border: '1px solid rgba(0,0,0,0.04)',
      transition: 'all 0.3s ease',
      cursor: 'default'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-6px)';
      e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
    }}
    >
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '16px',
        background: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '26px',
        marginBottom: '18px'
      }}>
        {icon}
      </div>
      <h3 style={{
        fontSize: '18px',
        fontWeight: 600,
        marginBottom: '8px',
        color: '#2d2926'
      }}>
        {title}
      </h3>
      <p style={{
        color: '#5c5552',
        lineHeight: 1.6,
        fontSize: '15px'
      }}>
        {description}
      </p>
    </div>
  );
}
