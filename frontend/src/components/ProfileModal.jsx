import React, { useState } from 'react';

export function ProfileModal({ user, onClose, isOwnProfile, onUpdateProfile }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editCity, setEditCity] = useState(user.city || '');
  const [editBio, setEditBio] = useState(user.bio || '');

  // Combine main photo with additional photos
  const allPhotos = [user.photo, ...(user.photos || [])].filter(Boolean);
  
  // Remove duplicates (in case main photo is also in photos array)
  const uniquePhotos = [...new Set(allPhotos)];

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % uniquePhotos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + uniquePhotos.length) % uniquePhotos.length);
  };

  const handleSave = () => {
    if (onUpdateProfile) {
      onUpdateProfile({
        city: editCity,
        bio: editBio
      });
    }
    setIsEditing(false);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 200
      }}
      onClick={onClose}
    >
      <div 
        className="slide-up"
        style={{
          width: '100%',
          maxWidth: '400px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Photo gallery */}
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1',
          background: 'var(--bg-primary)'
        }}>
          <img
            src={uniquePhotos[currentPhotoIndex]}
            alt={user.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />

          {/* Photo navigation */}
          {uniquePhotos.length > 1 && (
            <>
              {/* Dots indicator */}
              <div style={{
                position: 'absolute',
                top: '12px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '6px'
              }}>
                {uniquePhotos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPhotoIndex(index)}
                    style={{
                      width: index === currentPhotoIndex ? '24px' : '8px',
                      height: '8px',
                      borderRadius: 'var(--radius-full)',
                      background: index === currentPhotoIndex ? 'white' : 'rgba(255,255,255,0.5)',
                      transition: 'all 0.2s'
                    }}
                  />
                ))}
              </div>

              {/* Prev/Next buttons */}
              <button
                onClick={prevPhoto}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                onClick={nextPhoto}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Photo count badge */}
          {uniquePhotos.length > 1 && (
            <div style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              padding: '6px 12px',
              background: 'rgba(0,0,0,0.6)',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              color: 'white',
              fontWeight: 500
            }}>
              {currentPhotoIndex + 1} / {uniquePhotos.length}
            </div>
          )}
        </div>

        {/* Profile info */}
        <div style={{ padding: '20px' }}>
          {isEditing ? (
            // Edit mode
            <div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: '6px'
                }}>
                  City
                </label>
                <input
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  placeholder="Your city"
                  maxLength={100}
                  style={{ fontSize: '14px', padding: '10px 12px' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: '6px'
                }}>
                  About
                </label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell people about yourself"
                  maxLength={500}
                  rows={3}
                  style={{
                    fontSize: '14px',
                    padding: '10px 12px',
                    resize: 'none',
                    fontFamily: 'var(--font-body)'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setIsEditing(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-secondary)',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'var(--accent-primary)',
                    borderRadius: 'var(--radius-md)',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 600
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            // View mode
            <>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <div>
                  <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '24px',
                    fontWeight: 600,
                    marginBottom: '4px'
                  }}>
                    {user.name}
                  </h2>
                  {user.city && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--text-secondary)',
                      fontSize: '14px'
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {user.city}
                    </div>
                  )}
                </div>

                {isOwnProfile && (
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      padding: '8px 12px',
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-secondary)',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                  </button>
                )}
              </div>

              {user.bio ? (
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  {user.bio}
                </p>
              ) : (
                <p style={{
                  color: 'var(--text-muted)',
                  fontSize: '14px',
                  fontStyle: 'italic'
                }}>
                  {isOwnProfile ? 'Add a bio to tell others about yourself' : 'No bio yet'}
                </p>
              )}

              {/* Thumbnail strip */}
              {uniquePhotos.length > 1 && (
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-subtle)'
                }}>
                  {uniquePhotos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPhotoIndex(index)}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        border: index === currentPhotoIndex 
                          ? '2px solid var(--accent-primary)' 
                          : '2px solid transparent',
                        opacity: index === currentPhotoIndex ? 1 : 0.6,
                        transition: 'all 0.2s'
                      }}
                    >
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
