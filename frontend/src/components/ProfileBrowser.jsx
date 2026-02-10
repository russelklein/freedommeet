import React, { useState } from 'react';

export function ProfileBrowser({ 
  activeProfiles = [],
  inactiveProfiles = [],
  totalActive = 0,
  totalInactive = 0,
  userGender = 'male',
  onLike, 
  onLoadMore,
  onFilterChange,
  onBack 
}) {
  const [cityFilter, setCityFilter] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  // Default to opposite gender
  const [showGender, setShowGender] = useState(userGender === 'male' ? 'female' : 'male');

  const handleSearch = () => {
    setCityFilter(searchCity);
    onFilterChange({ city: searchCity, gender: showGender });
  };

  const handleGenderChange = (gender) => {
    setShowGender(gender);
    onFilterChange({ city: cityFilter, gender });
  };

  const clearFilter = () => {
    setCityFilter('');
    setSearchCity('');
    onFilterChange({ gender: showGender });
  };

  const openProfile = (profile) => {
    setSelectedProfile(profile);
    setCurrentPhotoIndex(0);
  };

  const closeProfile = () => {
    setSelectedProfile(null);
    setCurrentPhotoIndex(0);
  };

  const handleLikeFromModal = () => {
    if (selectedProfile) {
      onLike(selectedProfile.id);
      const currentIndex = activeProfiles.findIndex(p => p.id === selectedProfile.id);
      if (currentIndex < activeProfiles.length - 1) {
        setSelectedProfile(activeProfiles[currentIndex + 1]);
        setCurrentPhotoIndex(0);
      } else {
        closeProfile();
      }
    }
  };

  const handleSkip = () => {
    const currentIndex = activeProfiles.findIndex(p => p.id === selectedProfile.id);
    if (currentIndex < activeProfiles.length - 1) {
      setSelectedProfile(activeProfiles[currentIndex + 1]);
      setCurrentPhotoIndex(0);
    } else {
      closeProfile();
    }
  };

  const nextPhoto = () => {
    if (selectedProfile && currentPhotoIndex < selectedProfile.photos.length - 1) {
      setCurrentPhotoIndex(prev => prev + 1);
    }
  };

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prev => prev - 1);
    }
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
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#2d2926' }}>
              Discover
            </h1>
            <p style={{ fontSize: '13px', color: '#8a8482' }}>
              {totalActive} active • {totalInactive} inactive
            </p>
          </div>
        </div>
        
        {/* Gender Toggle */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => handleGenderChange('female')}
            style={{
              padding: '8px 14px',
              borderRadius: '100px',
              fontSize: '13px',
              fontWeight: 600,
              background: showGender === 'female' ? '#e85d75' : '#f5f2ef',
              color: showGender === 'female' ? 'white' : '#8a8482'
            }}
          >
            👩 Women
          </button>
          <button
            onClick={() => handleGenderChange('male')}
            style={{
              padding: '8px 14px',
              borderRadius: '100px',
              fontSize: '13px',
              fontWeight: 600,
              background: showGender === 'male' ? '#64b5f6' : '#f5f2ef',
              color: showGender === 'male' ? 'white' : '#8a8482'
            }}
          >
            👨 Men
          </button>
        </div>
      </header>

      {/* Search/Filter */}
      <div style={{
        padding: '16px 20px',
        background: '#fff',
        borderBottom: '1px solid rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            placeholder="Filter by city..."
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '12px',
              border: '2px solid #f0ebe7',
              fontSize: '15px',
              background: '#faf8f6'
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            style={{
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #e85d75, #d94a62)',
              color: 'white',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '14px'
            }}
          >
            Search
          </button>
        </div>
        
        {cityFilter && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '12px'
          }}>
            <span style={{
              padding: '6px 12px',
              background: 'rgba(232, 93, 117, 0.1)',
              color: '#e85d75',
              borderRadius: '100px',
              fontSize: '13px',
              fontWeight: 500
            }}>
              📍 {cityFilter}
            </span>
            <button
              onClick={clearFilter}
              style={{
                color: '#8a8482',
                fontSize: '13px',
                textDecoration: 'underline'
              }}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Active Profiles */}
      <div style={{ padding: '16px' }}>
        {activeProfiles.length === 0 && inactiveProfiles.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#8a8482'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>No profiles found</p>
            <p style={{ fontSize: '14px' }}>Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {/* Active profiles - larger, sorted by recent login */}
            {activeProfiles.length > 0 && (
              <>
                <h2 style={{ 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  color: '#4abe7a', 
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#4abe7a'
                  }} />
                  Active Recently ({totalActive})
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                  gap: '10px',
                  marginBottom: '24px'
                }}>
                  {activeProfiles.map(profile => (
                    <ProfileCard
                      key={profile.id}
                      profile={profile}
                      onView={() => openProfile(profile)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Inactive profiles - smaller, grayed out */}
            {inactiveProfiles.length > 0 && (
              <>
                <h2 style={{ 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  color: '#b8a9ad', 
                  marginBottom: '10px',
                  marginTop: '16px'
                }}>
                  ⏳ Not active for 2+ weeks ({totalInactive})
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
                  gap: '6px'
                }}>
                  {inactiveProfiles.map(profile => (
                    <InactiveProfileCard
                      key={profile.id}
                      profile={profile}
                      onView={() => openProfile(profile)}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Profile Modal */}
      {selectedProfile && (
        <ProfileModal
          profile={selectedProfile}
          currentPhotoIndex={currentPhotoIndex}
          onNextPhoto={nextPhoto}
          onPrevPhoto={prevPhoto}
          onLike={handleLikeFromModal}
          onSkip={handleSkip}
          onClose={closeProfile}
        />
      )}
    </div>
  );
}

function ProfileCard({ profile, onView }) {
  const mainPhoto = profile.photos?.[0] || profile.photo;
  
  return (
    <div 
      onClick={onView}
      style={{
        background: '#fff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.04)',
        cursor: 'pointer'
      }}
    >
      <div style={{
        aspectRatio: '1',
        background: `url(${mainPhoto}) center/cover`,
        position: 'relative'
      }}>
        {profile.isOnline && (
          <div style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#4abe7a',
            border: '2px solid #fff'
          }} />
        )}
        {profile.photos?.length > 1 && (
          <div style={{
            position: 'absolute',
            top: '6px',
            left: '6px',
            padding: '2px 5px',
            background: 'rgba(0,0,0,0.6)',
            borderRadius: '4px',
            color: 'white',
            fontSize: '9px',
            fontWeight: 600
          }}>
            {profile.photos.length}
          </div>
        )}
      </div>
      <div style={{ padding: '8px' }}>
        <p style={{ 
          color: '#2d2926', 
          fontWeight: 600, 
          fontSize: '13px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {profile.name}{profile.age ? `, ${profile.age}` : ''}
        </p>
        {profile.city && (
          <p style={{ 
            color: '#8a8482', 
            fontSize: '11px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            📍 {profile.city}
          </p>
        )}
      </div>
    </div>
  );
}

function InactiveProfileCard({ profile, onView }) {
  const mainPhoto = profile.photos?.[0] || profile.photo;
  
  return (
    <div 
      onClick={onView}
      style={{
        background: '#f5f2ef',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'pointer',
        opacity: 0.7
      }}
    >
      <div style={{
        aspectRatio: '1',
        background: `url(${mainPhoto}) center/cover`,
        filter: 'grayscale(30%)'
      }} />
      <div style={{ padding: '4px' }}>
        <p style={{ 
          color: '#8a8482', 
          fontWeight: 500, 
          fontSize: '10px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          textAlign: 'center'
        }}>
          {profile.name}
        </p>
      </div>
    </div>
  );
}

function ProfileModal({ profile, currentPhotoIndex, onNextPhoto, onPrevPhoto, onLike, onSkip, onClose }) {
  const photos = profile.photos || [profile.photo];
  const currentPhoto = photos[currentPhotoIndex] || photos[0];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.9)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        color: 'white'
      }}>
        <button
          onClick={onClose}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '20px'
          }}
        >
          ✕
        </button>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: 600, fontSize: '18px' }}>
            {profile.name}{profile.age ? `, ${profile.age}` : ''}
          </p>
          {profile.city && (
            <p style={{ fontSize: '14px', opacity: 0.8 }}>📍 {profile.city}</p>
          )}
          {profile.isInactive && (
            <p style={{ fontSize: '12px', color: '#ffa726', marginTop: '4px' }}>
              ⏳ Not active for 2+ weeks
            </p>
          )}
        </div>
        <div style={{ width: '40px' }} />
      </div>

      {/* Photo */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: '0 20px'
      }}>
        {currentPhotoIndex > 0 && (
          <button
            onClick={onPrevPhoto}
            style={{
              position: 'absolute',
              left: '20px',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px',
              zIndex: 10
            }}
          >
            ‹
          </button>
        )}

        <img
          src={currentPhoto}
          alt={profile.name}
          style={{
            maxWidth: '100%',
            maxHeight: '60vh',
            borderRadius: '16px',
            objectFit: 'contain'
          }}
        />

        {currentPhotoIndex < photos.length - 1 && (
          <button
            onClick={onNextPhoto}
            style={{
              position: 'absolute',
              right: '20px',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px',
              zIndex: 10
            }}
          >
            ›
          </button>
        )}
      </div>

      {/* Photo dots */}
      {photos.length > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '6px',
          padding: '12px'
        }}>
          {photos.map((_, index) => (
            <div
              key={index}
              style={{
                width: index === currentPhotoIndex ? '20px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: index === currentPhotoIndex ? '#e85d75' : 'rgba(255,255,255,0.4)'
              }}
            />
          ))}
        </div>
      )}

      {/* Bio */}
      {profile.bio && (
        <div style={{
          padding: '0 20px 16px',
          maxHeight: '120px',
          overflow: 'auto'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <p style={{ color: 'white', fontSize: '15px', lineHeight: 1.6 }}>
              {profile.bio}
            </p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        padding: '20px',
        paddingBottom: '40px'
      }}>
        <button
          onClick={onSkip}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            color: 'white'
          }}
        >
          ✕
        </button>
        <button
          onClick={onLike}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #e85d75, #d94a62)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            boxShadow: '0 8px 24px rgba(232, 93, 117, 0.4)'
          }}
        >
          ❤️
        </button>
      </div>
    </div>
  );
}
