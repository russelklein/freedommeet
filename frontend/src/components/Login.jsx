import React, { useState, useRef } from 'react';

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default&backgroundColor=f5f5f5';

// Blocked usernames (admin-related)
const BLOCKED_NAMES = ['admin', 'administrator', 'moderator', 'mod', 'owner', 'support', 'help', 'freedommeet', 'system'];

const isNameBlocked = (name) => {
  const lowerName = name.toLowerCase().replace(/[^a-z]/g, '');
  return BLOCKED_NAMES.some(blocked => 
    lowerName.includes(blocked) || 
    blocked.includes(lowerName)
  );
};

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
        
        // Resize if larger than maxWidth
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to WebP if supported, otherwise JPEG
        let outputType = 'image/webp';
        let compressed = canvas.toDataURL(outputType, quality);
        
        // Fallback to JPEG if WebP not supported (Safari older versions)
        if (compressed.length < 50) {
          outputType = 'image/jpeg';
          compressed = canvas.toDataURL(outputType, quality);
        }
        
        console.log(`Compressed: ${(file.size / 1024).toFixed(0)}KB → ${(compressed.length * 0.75 / 1024).toFixed(0)}KB`);
        resolve(compressed);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export function Login({ onRegister, isConnected }) {
  const [step, setStep] = useState(1); // 1: name & gender, 2: photos & profile
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [gender, setGender] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [age, setAge] = useState('');
  const [photos, setPhotos] = useState([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef(null);

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setName(newName);
    if (isNameBlocked(newName)) {
      setNameError('This name is not available');
    } else {
      setNameError('');
    }
  };

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
        // Compress image to max 800px width, 60% quality
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

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (isNameBlocked(name)) {
      setNameError('This name is not available');
      return;
    }
    if (name.trim() && gender) {
      setStep(2);
    }
  };

  const handleSkip = () => {
    // Can join with just name and gender, but won't appear in Discover
    onRegister({
      name: name.trim(),
      gender,
      photo: DEFAULT_AVATAR,
      photos: [],
      city: '',
      bio: '',
      age: null
    });
  };

  const handleComplete = () => {
    onRegister({
      name: name.trim(),
      gender,
      photo: photos[0] || DEFAULT_AVATAR,
      photos,
      city: city.trim(),
      bio: bio.trim(),
      age: age ? parseInt(age) : null
    });
  };

  const canAppearInDiscover = photos.length >= 3 && city.trim() && bio.trim();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'linear-gradient(180deg, #fff9f7 0%, #faf8f6 100%)'
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '18px',
          background: 'linear-gradient(135deg, #e85d75, #f4a261)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 24px rgba(232, 93, 117, 0.3)'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '28px',
          fontWeight: 600,
          color: '#2d2926',
          marginBottom: '4px'
        }}>
          FreedomMeet
        </h1>
        <p style={{ color: '#8a8482', fontSize: '15px' }}>
          Join our community
        </p>
      </div>

      {/* Connection status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '24px',
        padding: '8px 16px',
        background: isConnected ? 'rgba(74, 190, 122, 0.1)' : 'rgba(232, 93, 117, 0.1)',
        borderRadius: '100px'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: isConnected ? '#4abe7a' : '#e85d75'
        }} />
        <span style={{
          fontSize: '13px',
          color: isConnected ? '#3a9d64' : '#e85d75'
        }}>
          {isConnected ? 'Connected' : 'Connecting...'}
        </span>
      </div>

      {/* Step indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: '#e85d75',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 600,
          fontSize: '14px'
        }}>1</div>
        <div style={{
          width: '40px',
          height: '3px',
          background: step >= 2 ? '#e85d75' : '#e0dbd8',
          borderRadius: '2px'
        }} />
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: step >= 2 ? '#e85d75' : '#e0dbd8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: step >= 2 ? 'white' : '#8a8482',
          fontWeight: 600,
          fontSize: '14px'
        }}>2</div>
      </div>

      {/* Form */}
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: '#fff',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.04)'
      }}>
        {step === 1 ? (
          // Step 1: Name and Gender
          <form onSubmit={handleStep1Submit}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px', color: '#2d2926' }}>
              Let's get started
            </h2>
            <p style={{ color: '#8a8482', fontSize: '14px', marginBottom: '24px' }}>
              Tell us a bit about yourself
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#5c5552',
                marginBottom: '8px'
              }}>
                Your Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="Enter your name"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: nameError ? '2px solid #e85d75' : '2px solid #f0ebe7',
                  fontSize: '16px',
                  background: '#faf8f6'
                }}
              />
              {nameError && (
                <p style={{ color: '#e85d75', fontSize: '13px', marginTop: '6px' }}>
                  {nameError}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#5c5552',
                marginBottom: '12px'
              }}>
                I am a *
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  style={{
                    flex: 1,
                    padding: '16px',
                    borderRadius: '12px',
                    border: gender === 'male' ? '2px solid #e85d75' : '2px solid #f0ebe7',
                    background: gender === 'male' ? 'rgba(232, 93, 117, 0.1)' : '#faf8f6',
                    color: gender === 'male' ? '#e85d75' : '#5c5552',
                    fontWeight: 600,
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>👨</span> Man
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  style={{
                    flex: 1,
                    padding: '16px',
                    borderRadius: '12px',
                    border: gender === 'female' ? '2px solid #e85d75' : '2px solid #f0ebe7',
                    background: gender === 'female' ? 'rgba(232, 93, 117, 0.1)' : '#faf8f6',
                    color: gender === 'female' ? '#e85d75' : '#5c5552',
                    fontWeight: 600,
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>👩</span> Woman
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!name.trim() || !gender || !isConnected}
              style={{
                width: '100%',
                padding: '16px',
                background: (!name.trim() || !gender) ? '#e0dbd8' : 'linear-gradient(135deg, #e85d75, #d94a62)',
                color: 'white',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '16px',
                opacity: (!name.trim() || !gender || !isConnected) ? 0.7 : 1
              }}
            >
              Continue →
            </button>
          </form>
        ) : (
          // Step 2: Photos and Profile
          <>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px', color: '#2d2926' }}>
              Add your photos & profile
            </h2>
            <p style={{ color: '#8a8482', fontSize: '14px', marginBottom: '24px' }}>
              Show others who you are
            </p>

            {/* Photos */}
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
                gap: '8px',
                marginBottom: '8px'
              }}>
                {[0, 1, 2, 3, 4].map(index => (
                  <div
                    key={index}
                    style={{
                      aspectRatio: '1',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      position: 'relative',
                      background: '#faf8f6',
                      border: index < 3 && !photos[index] ? '2px dashed #e85d75' : '2px dashed #e0dbd8'
                    }}
                  >
                    {photos[index] ? (
                      <>
                        <img
                          src={photos[index]}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <button
                          onClick={() => removePhoto(index)}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: index < 3 ? '#e85d75' : '#8a8482',
                          fontSize: '20px'
                        }}
                      >
                        +
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
              
              {isCompressing ? (
                <p style={{ fontSize: '12px', color: '#64b5f6' }}>
                  ⏳ Compressing photos...
                </p>
              ) : (
                <p style={{ fontSize: '12px', color: photos.length >= 3 ? '#4abe7a' : '#e85d75' }}>
                  {photos.length >= 3 
                    ? '✓ Great! You have enough photos for Discover' 
                    : `⚠️ Add ${3 - photos.length} more photo${3 - photos.length > 1 ? 's' : ''} to appear in Discover`
                  }
                </p>
              )}
            </div>

            {/* Age */}
            <div style={{ marginBottom: '16px' }}>
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
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '2px solid #f0ebe7',
                  fontSize: '15px',
                  background: '#faf8f6'
                }}
              />
            </div>

            {/* City */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#5c5552',
                marginBottom: '8px'
              }}>
                City {!city.trim() && <span style={{ color: '#e85d75', fontWeight: 400 }}>(required for Discover)</span>}
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Where are you located?"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '2px solid #f0ebe7',
                  fontSize: '15px',
                  background: '#faf8f6'
                }}
              />
            </div>

            {/* Bio */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#5c5552',
                marginBottom: '8px'
              }}>
                Bio {!bio.trim() && <span style={{ color: '#e85d75', fontWeight: 400 }}>(required for Discover)</span>}
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about yourself..."
                rows={3}
                maxLength={500}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '2px solid #f0ebe7',
                  fontSize: '15px',
                  background: '#faf8f6',
                  resize: 'none'
                }}
              />
            </div>

            {/* Discover status */}
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '20px',
              background: canAppearInDiscover ? 'rgba(74, 190, 122, 0.1)' : 'rgba(232, 93, 117, 0.1)',
              border: canAppearInDiscover ? '1px solid rgba(74, 190, 122, 0.3)' : '1px solid rgba(232, 93, 117, 0.3)'
            }}>
              {canAppearInDiscover ? (
                <p style={{ fontSize: '14px', color: '#3a9d64', fontWeight: 500 }}>
                  ✓ Your profile will appear in Discover for matching!
                </p>
              ) : (
                <p style={{ fontSize: '14px', color: '#d94a62' }}>
                  ⚠️ Must have <strong>3+ photos</strong>, <strong>city</strong>, and <strong>bio</strong> to appear in Discover for matching with others.
                </p>
              )}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleSkip}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#f5f2ef',
                  color: '#5c5552',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '15px'
                }}
              >
                Skip for now
              </button>
              <button
                onClick={handleComplete}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'linear-gradient(135deg, #e85d75, #d94a62)',
                  color: 'white',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '15px'
                }}
              >
                Join Community
              </button>
            </div>

            <p style={{ 
              fontSize: '12px', 
              color: '#8a8482', 
              textAlign: 'center', 
              marginTop: '16px' 
            }}>
              You can still use Chat Rooms, Roulette & Events without a full profile
            </p>
          </>
        )}
      </div>
    </div>
  );
}
