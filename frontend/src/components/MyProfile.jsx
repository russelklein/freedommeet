import React, { useState, useRef } from 'react';

// Compress and resize image
const compressImage = (file, maxWidth = 800, quality = 0.6) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        let outputType = 'image/webp';
        let compressed = canvas.toDataURL(outputType, quality);
        
        if (compressed.length < 50) {
          outputType = 'image/jpeg';
          compressed = canvas.toDataURL(outputType, quality);
        }
        
        resolve(compressed);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export function MyProfile({ user, onUpdateProfile, onDeleteProfile, onLogout, onBack }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [gender, setGender] = useState(user.gender || '');
  const [city, setCity] = useState(user.city || '');
  const [bio, setBio] = useState(user.bio || '');
  const [age, setAge] = useState(user.age || '');
  const [photos, setPhotos] = useState(user.photos || []);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef(null);

  const mainPhoto = photos[0] || user.photo;
  const canAppearInDiscover = photos.length >= 3 && city.trim() && bio.trim();

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    if (files.length + photos.length > 5) {
      alert('Maximum 5 photos allowed');
      return;
    }

    setIsCompressing(true);
    
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        alert(`Photo "${file.name}" is too large. Max 10MB.`);
        continue;
      }
      
      try {
        const compressed = await compressImage(file, 800, 0.6);
        setPhotos(prev => [...prev, compressed]);
      } catch (err) {
        console.error('Failed to compress image:', err);
        alert(`Failed to process "${file.name}"`);
      }
    }
    
    setIsCompressing(false);
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdateProfile({
      name,
      gender,
      city,
      bio,
      age: age ? parseInt(age) : null,
      photos,
      photo: photos[0] || user.photo
    });
    setIsSaving(false);
    setIsEditing(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #fff9f7 0%, #faf8f6 100%)'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            My Profile
          </h1>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #e85d75, #d94a62)',
              color: 'white',
              borderRadius: '100px',
              fontWeight: 600,
              fontSize: '14px'
            }}
          >
            Edit Profile
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '10px 20px',
              background: isSaving ? '#ccc' : 'linear-gradient(135deg, #4abe7a, #3a9d64)',
              color: 'white',
              borderRadius: '100px',
              fontWeight: 600,
              fontSize: '14px'
            }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        )}
      </header>

      <div style={{ padding: '24px 20px', maxWidth: '500px', margin: '0 auto' }}>
        {/* Main Photo */}
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1',
          maxWidth: '300px',
          margin: '0 auto 24px',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <img
            src={mainPhoto}
            alt={name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          {!mainPhoto && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: '#f5f2ef',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8a8482',
              fontSize: '48px'
            }}>
              👤
            </div>
          )}
        </div>

        {/* Photo Gallery (Edit Mode) */}
        {isEditing && (
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#5c5552',
              marginBottom: '12px'
            }}>
              Photos ({photos.length}/5)
            </label>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '10px'
            }}>
              {photos.map((photo, index) => (
                <div
                  key={index}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <img
                    src={photo}
                    alt=""
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <button
                    onClick={() => removePhoto(index)}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ×
                  </button>
                  {index === 0 && (
                    <div style={{
                      position: 'absolute',
                      bottom: '4px',
                      left: '4px',
                      padding: '2px 6px',
                      background: '#e85d75',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 600,
                      borderRadius: '4px'
                    }}>
                      Main
                    </div>
                  )}
                </div>
              ))}
              
              {photos.length < 5 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '12px',
                    border: '2px dashed #d0cbc8',
                    background: '#faf8f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    color: '#8a8482',
                    cursor: 'pointer'
                  }}
                >
                  +
                </button>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />
            
            <p style={{ fontSize: '12px', color: '#8a8482', marginTop: '8px' }}>
              Tip: Your first photo is your main profile picture
            </p>
          </div>
        )}

        {/* Profile Info */}
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
        }}>
          {isEditing ? (
            // Edit Mode
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#5c5552',
                  marginBottom: '8px'
                }}>
                  Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '2px solid #f0ebe7',
                    fontSize: '16px',
                    background: '#faf8f6'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#5c5552',
                  marginBottom: '8px'
                }}>
                  Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Your age"
                  min="18"
                  max="99"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '2px solid #f0ebe7',
                    fontSize: '16px',
                    background: '#faf8f6'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#5c5552',
                  marginBottom: '8px'
                }}>
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Where are you located?"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '2px solid #f0ebe7',
                    fontSize: '16px',
                    background: '#faf8f6'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#5c5552',
                  marginBottom: '8px'
                }}>
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell others about yourself..."
                  rows={4}
                  maxLength={500}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '2px solid #f0ebe7',
                    fontSize: '16px',
                    background: '#faf8f6',
                    resize: 'none'
                  }}
                />
                <p style={{ fontSize: '12px', color: '#8a8482', textAlign: 'right', marginTop: '4px' }}>
                  {bio.length}/500
                </p>
              </div>

              <button
                onClick={() => {
                  setIsEditing(false);
                  setName(user.name || '');
                  setCity(user.city || '');
                  setBio(user.bio || '');
                  setAge(user.age || '');
                  setPhotos(user.photos || []);
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  marginTop: '16px',
                  background: '#f5f2ef',
                  color: '#5c5552',
                  borderRadius: '12px',
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            // View Mode
            <>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: 600, color: '#2d2926', marginBottom: '4px' }}>
                  {user.name}{user.age ? `, ${user.age}` : ''}
                </h2>
                {user.city && (
                  <p style={{ fontSize: '16px', color: '#8a8482' }}>
                    📍 {user.city}
                  </p>
                )}
              </div>

              {user.bio ? (
                <div style={{
                  padding: '16px',
                  background: '#faf8f6',
                  borderRadius: '12px',
                  marginBottom: '20px'
                }}>
                  <p style={{ color: '#5c5552', lineHeight: 1.6 }}>{user.bio}</p>
                </div>
              ) : (
                <div style={{
                  padding: '24px',
                  background: '#faf8f6',
                  borderRadius: '12px',
                  textAlign: 'center',
                  marginBottom: '20px'
                }}>
                  <p style={{ color: '#8a8482' }}>No bio yet</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      marginTop: '8px',
                      color: '#e85d75',
                      fontWeight: 600,
                      fontSize: '14px'
                    }}
                  >
                    Add a bio →
                  </button>
                </div>
              )}

              {/* Photo count */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                background: photos.length > 0 ? 'rgba(74, 190, 122, 0.1)' : 'rgba(232, 93, 117, 0.1)',
                borderRadius: '12px'
              }}>
                <div>
                  <p style={{ fontWeight: 600, color: '#2d2926' }}>
                    {photos.length > 0 ? `${photos.length} photo${photos.length > 1 ? 's' : ''}` : 'No photos'}
                  </p>
                  <p style={{ fontSize: '13px', color: '#8a8482' }}>
                    {photos.length > 0 ? 'Your profile is visible to others' : 'Add photos to appear in Discover'}
                  </p>
                </div>
                {photos.length === 0 && (
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      padding: '10px 16px',
                      background: '#e85d75',
                      color: 'white',
                      borderRadius: '100px',
                      fontWeight: 600,
                      fontSize: '13px'
                    }}
                  >
                    Add Photos
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* All Photos (View Mode) */}
        {!isEditing && photos.length > 1 && (
          <div style={{ marginTop: '24px' }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#8a8482',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '12px'
            }}>
              All Photos
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px'
            }}>
              {photos.map((photo, index) => (
                <div
                  key={index}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}
                >
                  <img
                    src={photo}
                    alt=""
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logout button */}
        {!isEditing && onLogout && (
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              marginTop: '32px',
              padding: '14px',
              background: '#f5f2ef',
              color: '#e85d75',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '15px'
            }}
          >
            Log Out
          </button>
        )}

        {/* Delete Profile */}
        {!isEditing && onDeleteProfile && (
          <button
            onClick={onDeleteProfile}
            style={{
              width: '100%',
              marginTop: '12px',
              padding: '14px',
              background: 'transparent',
              color: '#b8a9ad',
              borderRadius: '12px',
              fontWeight: 500,
              fontSize: '14px'
            }}
          >
            Delete My Profile
          </button>
        )}
      </div>
    </div>
  );
}
