import React, { useState } from 'react';

const SUGGESTED_ROOMS = [
  { name: 'Flat Earth', icon: '🌍', description: 'Discuss alternative earth theories' },
  { name: 'Natural Health', icon: '🌿', description: 'Holistic wellness and remedies' },
  { name: 'Moon Landing', icon: '🌙', description: 'Space exploration discussions' },
  { name: 'Fitness & Nutrition', icon: '💪', description: 'Health and workout tips' },
  { name: 'Faith & Spirituality', icon: '✨', description: 'Spiritual conversations' },
  { name: 'Homesteading', icon: '🏡', description: 'Self-sufficient living' },
  { name: 'Crypto & Finance', icon: '💰', description: 'Financial freedom discussions' },
  { name: 'Parenting', icon: '👨‍👧', description: 'Tips for freedom-minded parents' },
];

export function RoomList({ rooms, isAdmin, onJoinRoom, onCreateRoom, onCreateDefaultRoom, onUpdateRoom, onDeleteRoom, onBack }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [isCreatingDefault, setIsCreatingDefault] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', description: '', icon: '💬' });

  const icons = ['💬', '💕', '💖', '🏕️', '🍷', '💪', '🎮', '📚', '🎵', '✈️', '🎨', '🐕', '☕', '🎭', '🌙', '⭐', '🌍', '🌿', '💰', '🏡', '✨', '👨‍👧'];

  const handleCreate = (e) => {
    e.preventDefault();
    if (newRoom.name.trim()) {
      if (isCreatingDefault && isAdmin) {
        onCreateDefaultRoom(newRoom);
      } else {
        onCreateRoom(newRoom);
      }
      setShowCreateModal(false);
      setIsCreatingDefault(false);
      setNewRoom({ name: '', description: '', icon: '💬' });
    }
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (showEditModal && newRoom.name.trim()) {
      onUpdateRoom(showEditModal.id, newRoom);
      setShowEditModal(null);
      setNewRoom({ name: '', description: '', icon: '💬' });
    }
  };

  const openEditModal = (room) => {
    setNewRoom({ name: room.name, description: room.description || '', icon: room.icon });
    setShowEditModal(room);
  };

  const defaultRooms = rooms.filter(r => r.isDefault);
  const customRooms = rooms.filter(r => !r.isDefault);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #fff9f7 0%, #faf8f6 100%)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onBack}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-full)',
              background: '#f5f2ef',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2d2926" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              fontWeight: 600,
              background: 'linear-gradient(135deg, var(--text-primary), var(--accent-primary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Chat Rooms
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {rooms.length} rooms available
            </p>
          </div>
        </div>
        
        <button
          onClick={() => { setShowCreateModal(true); setIsCreatingDefault(false); }}
          style={{
            padding: '12px 20px',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            borderRadius: 'var(--radius-full)',
            color: 'white',
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(232, 93, 117, 0.3)',
            transition: 'all 0.2s'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Room
        </button>
      </header>

      {/* Room list */}
      <div style={{
        flex: 1,
        padding: '24px 20px',
        overflowY: 'auto'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          
          {/* Admin panel */}
          {isAdmin && (
            <div style={{
              marginBottom: '24px',
              padding: '16px 20px',
              background: 'linear-gradient(135deg, rgba(232, 93, 117, 0.1), rgba(244, 162, 97, 0.1))',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '14px' }}>Admin Mode</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>You can manage all rooms</p>
                </div>
              </div>
              <button
                onClick={() => { setShowCreateModal(true); setIsCreatingDefault(true); }}
                style={{
                  padding: '10px 16px',
                  background: 'var(--accent-primary)',
                  borderRadius: 'var(--radius-md)',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                + Default Room
              </button>
            </div>
          )}

          {/* Official Rooms Section */}
          {defaultRooms.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '4px',
                  height: '20px',
                  background: 'linear-gradient(180deg, var(--accent-primary), var(--accent-secondary))',
                  borderRadius: '2px'
                }} />
                <h2 style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Official Rooms
                </h2>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '12px'
              }}>
                {defaultRooms.map((room) => (
                  <RoomCard 
                    key={room.id} 
                    room={room} 
                    isAdmin={isAdmin}
                    onJoin={() => onJoinRoom(room.id)}
                    onEdit={() => openEditModal(room)}
                    onDelete={() => onDeleteRoom(room.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Community Rooms Section */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '4px',
                height: '20px',
                background: 'linear-gradient(180deg, var(--success), #4ade80)',
                borderRadius: '2px'
              }} />
              <h2 style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Community Rooms
              </h2>
            </div>
            
            {customRooms.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '12px'
              }}>
                {customRooms.map((room) => (
                  <RoomCard 
                    key={room.id} 
                    room={room}
                    isAdmin={isAdmin}
                    onJoin={() => onJoinRoom(room.id)}
                    onEdit={() => openEditModal(room)}
                    onDelete={() => onDeleteRoom(room.id)}
                  />
                ))}
              </div>
            ) : (
              <div style={{
                padding: '40px 20px',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center',
                border: '2px dashed var(--border-subtle)'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '28px'
                }}>
                  🌱
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  No community rooms yet
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  Be the first to create one!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Room Modal */}
      {(showCreateModal || showEditModal) && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 100
          }}
          onClick={() => { setShowCreateModal(false); setShowEditModal(null); }}
        >
          <div 
            className="slide-up"
            style={{
              width: '100%',
              maxWidth: '440px',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                {newRoom.icon}
              </div>
              <div>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '20px',
                  fontWeight: 600
                }}>
                  {showEditModal ? 'Edit Room' : isCreatingDefault ? 'New Official Room' : 'Create Room'}
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {showEditModal ? 'Update room details' : 'Set up your new space'}
                </p>
              </div>
            </div>

            <form onSubmit={showEditModal ? handleUpdate : handleCreate}>
              {/* Icon picker */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '10px'
                }}>
                  Room Icon
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(8, 1fr)',
                  gap: '6px'
                }}>
                  {icons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewRoom({ ...newRoom, icon })}
                      style={{
                        aspectRatio: '1',
                        fontSize: '20px',
                        background: newRoom.icon === icon 
                          ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' 
                          : 'var(--bg-elevated)',
                        borderRadius: 'var(--radius-md)',
                        border: '2px solid transparent',
                        transition: 'all 0.15s',
                        transform: newRoom.icon === icon ? 'scale(1.1)' : 'scale(1)'
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Room name */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '8px'
                }}>
                  Room Name
                </label>
                <input
                  type="text"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  placeholder="e.g., Book Lovers Club"
                  maxLength={50}
                  autoFocus
                  style={{ 
                    fontSize: '15px',
                    background: 'var(--bg-primary)',
                    border: '2px solid var(--border-subtle)',
                    padding: '14px 16px'
                  }}
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '8px'
                }}>
                  Description
                </label>
                <input
                  type="text"
                  value={newRoom.description}
                  onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                  placeholder="What's this room about?"
                  maxLength={200}
                  style={{ 
                    fontSize: '15px',
                    background: 'var(--bg-primary)',
                    border: '2px solid var(--border-subtle)',
                    padding: '14px 16px'
                  }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setShowEditModal(null); }}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newRoom.name.trim()}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: newRoom.name.trim() 
                      ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
                      : 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '14px',
                    boxShadow: newRoom.name.trim() ? '0 4px 15px rgba(232, 93, 117, 0.3)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {showEditModal ? 'Save Changes' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function RoomCard({ room, isAdmin, onJoin, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const canEdit = isAdmin;
  const canDelete = isAdmin;

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = room.isDefault ? 'var(--accent-primary)' : 'var(--success)';
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 24px -8px rgba(0,0,0,0.4)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        setShowMenu(false);
      }}
    >
      <div style={{
        height: '6px',
        background: room.isDefault 
          ? 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))'
          : 'linear-gradient(90deg, var(--success), #4ade80)'
      }} />
      
      <div style={{ padding: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px'
          }}>
            {room.icon}
          </div>

          {(canEdit || canDelete) && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  background: showMenu ? 'var(--bg-elevated)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--text-muted)">
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
              </button>

              {showMenu && (
                <div 
                  className="fade-in"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: '4px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '4px',
                    minWidth: '120px',
                    zIndex: 20,
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)'
                  }}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(); setShowMenu(false); }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      textAlign: 'left',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (confirm(`Delete "${room.name}"?`)) onDelete();
                      setShowMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      textAlign: 'left',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px',
                      color: 'var(--error)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(232,93,117,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <h3 style={{
          fontSize: '16px',
          fontWeight: 600,
          marginBottom: '4px',
          color: 'var(--text-primary)'
        }}>
          {room.name}
        </h3>
        
        <p style={{
          fontSize: '13px',
          color: 'var(--text-muted)',
          marginBottom: '16px',
          minHeight: '36px',
          lineHeight: '1.4',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {room.description || 'No description'}
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: 'var(--radius-full)',
              background: room.memberCount > 0 ? 'var(--success)' : 'var(--text-muted)',
              boxShadow: room.memberCount > 0 ? '0 0 8px var(--success)' : 'none'
            }} />
            <span style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              fontWeight: 500
            }}>
              {room.memberCount || 0} online
            </span>
          </div>

          <button
            onClick={onJoin}
            style={{
              padding: '8px 16px',
              background: room.isDefault 
                ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
                : 'var(--success)',
              borderRadius: 'var(--radius-full)',
              color: 'white',
              fontSize: '13px',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
}
