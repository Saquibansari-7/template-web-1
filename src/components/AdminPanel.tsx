import { useState, useEffect } from 'react';
import { useWebsiteContext } from '../context/WebsiteContext';
import { syncContentToDOM, updateCountdown } from '../utils/contentSync';

function AdminPanel({ onClose }: { onClose: () => void }) {
  const { content, sections, updateContent, updateNestedContent, updateSection, saveContent, uploadImage } = useWebsiteContext();
  const [toast, setToast] = useState('');
  const [local, setLocal] = useState({ ...content });

  useEffect(() => {
    setLocal({ ...content });
  }, [content]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleSave = async () => {
    try {
      await saveContent('default');
      showToast('Changes saved successfully!');
    } catch {
      showToast('Save failed.');
    }
  };

  const handleFileUpload = async (file: File) => {
    const url = await uploadImage(file);
    if (url) {
      showToast('Image uploaded');
    }
    return url;
  };

  return (
    <div>
      {/* COUPLE NAMES */}
      <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#c9a84c' }}>💍 Couple Names</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Name 1</label>
            <input
              value={local.couple.name1}
              onChange={(e) => setLocal({ ...local, couple: { ...local.couple, name1: e.target.value } })}
              style={{ width: '100%', background: '#222', border: '1px solid #444', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Name 2</label>
            <input
              value={local.couple.name2}
              onChange={(e) => setLocal({ ...local, couple: { ...local.couple, name2: e.target.value } })}
              style={{ width: '100%', background: '#222', border: '1px solid #444', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* HERO */}
      <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#c9a84c' }}>🖼 Hero Section</h3>
          <div
            onClick={() => updateSection('hero', !sections.hero)}
            style={{
              width: 48,
              height: 26,
              borderRadius: 13,
              background: sections.hero ? '#c9a84c' : '#333',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background .3s',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 3,
                left: 3,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#fff',
                transform: sections.hero ? 'translateX(22px)' : 'translateX(0)',
                transition: 'transform .3s',
              }}
            />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Subtitle</label>
          <input
            value={local.hero.subtitle}
            onChange={(e) => setLocal({ ...local, hero: { ...local.hero, subtitle: e.target.value } })}
            style={{ width: '100%', background: '#222', border: '1px solid #444', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Date Text</label>
            <input
              value={local.hero.date}
              onChange={(e) => setLocal({ ...local, hero: { ...local.hero, date: e.target.value } })}
              style={{ width: '100%', background: '#222', border: '1px solid #444', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Location Text</label>
            <input
              value={local.hero.location}
              onChange={(e) => setLocal({ ...local, hero: { ...local.hero, location: e.target.value } })}
              style={{ width: '100%', background: '#222', border: '1px solid #444', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}
            />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Background Image URL</label>
          <input
            value={local.hero.image}
            onChange={(e) => setLocal({ ...local, hero: { ...local.hero, image: e.target.value } })}
            style={{ width: '100%', background: '#222', border: '1px solid #444', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Or Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                const url = await handleFileUpload(file);
                if (url) setLocal({ ...local, hero: { ...local.hero, image: url } });
              }
            }}
            style={{ color: '#ccc', fontSize: 14 }}
          />
        </div>
      </div>

      {/* INVITATION CARD */}
      <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#c9a84c' }}>💌 Invitation Card</h3>
          <div
            onClick={() => updateSection('invitationCard', !sections.invitationCard)}
            style={{
              width: 48,
              height: 26,
              borderRadius: 13,
              background: sections.invitationCard ? '#c9a84c' : '#333',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background .3s',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 3,
                left: 3,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#fff',
                transform: sections.invitationCard ? 'translateX(22px)' : 'translateX(0)',
                transition: 'transform .3s',
              }}
            />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Card Image URL</label>
          <input
            value={local.invitationCard.image}
            onChange={(e) => setLocal({ ...local, invitationCard: { ...local.invitationCard, image: e.target.value } })}
            style={{ width: '100%', background: '#222', border: '1px solid #444', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none', marginBottom: 8 }}
          />
        </div>
      </div>

      {/* SAVE THE DATE */}
      <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#c9a84c' }}>📅 Save The Date</h3>
          <div
            onClick={() => updateSection('saveTheDate', !sections.saveTheDate)}
            style={{
              width: 48,
              height: 26,
              borderRadius: 13,
              background: sections.saveTheDate ? '#c9a84c' : '#333',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background .3s',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 3,
                left: 3,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#fff',
                transform: sections.saveTheDate ? 'translateX(22px)' : 'translateX(0)',
                transition: 'transform .3s',
              }}
            />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Heading</label>
          <input
            value={local.saveTheDate.heading}
            onChange={(e) => setLocal({ ...local, saveTheDate: { ...local.saveTheDate, heading: e.target.value } })}
            style={{ width: '100%', background: '#222', border: '1px solid #444', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Quote / Description</label>
          <textarea
            value={local.saveTheDate.quote}
            onChange={(e) => setLocal({ ...local, saveTheDate: { ...local.saveTheDate, quote: e.target.value } })}
            style={{ width: '100%', background: '#222', border: '1px solid #444', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none', minHeight: 80, resize: 'vertical' }}
          />
        </div>
      </div>

      {/* COUNTDOWN */}
      <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#c9a84c' }}>⏰ Countdown Timer</h3>
          <div
            onClick={() => updateSection('countdown', !sections.countdown)}
            style={{
              width: 48,
              height: 26,
              borderRadius: 13,
              background: sections.countdown ? '#c9a84c' : '#333',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background .3s',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 3,
                left: 3,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#fff',
                transform: sections.countdown ? 'translateX(22px)' : 'translateX(0)',
                transition: 'transform .3s',
              }}
            />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Target Date & Time</label>
          <input
            type="datetime-local"
            value={local.countdown.targetDate.slice(0, 16)}
            onChange={(e) => setLocal({ ...local, countdown: { ...local.countdown, targetDate: e.target.value + ':00' } })}
            style={{ width: '100%', background: '#222', border: '1px solid #444', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Heading</label>
          <input
            value={local.countdown.heading}
            onChange={(e) => setLocal({ ...local, countdown: { ...local.countdown, heading: e.target.value } })}
            style={{ width: '100%', background: '#222', border: '1px solid #444', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}
          />
        </div>
      </div>

      {/* OUR STORY */}
      <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#c9a84c' }}>📖 Our Story</h3>
          <div
            onClick={() => updateSection('story', !sections.story)}
            style={{
              width: 48,
              height: 26,
              borderRadius: 13,
              background: sections.story ? '#c9a84c' : '#333',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background .3s',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 3,
                left: 3,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#fff',
                transform: sections.story ? 'translateX(22px)' : 'translateX(0)',
                transition: 'transform .3s',
              }}
            />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Heading</label>
          <input
            value={local.story.heading}
            onChange={(e) => setLocal({ ...local, story: { ...local.story, heading: e.target.value } })}
            style={{ width: '100%', background: '#222', border: '1px solid #444', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Paragraph 1</label>
          <textarea
            value={local.story.paragraph1}
            onChange={(e) => setLocal({ ...local, story: { ...local.story, paragraph1: e.target.value } })}
            style={{ width: '100%', background: '#222', border: '1px solid #444', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none', minHeight: 80, resize: 'vertical' }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Paragraph 2</label>
          <textarea
            value={local.story.paragraph2}
            onChange={(e) => setLocal({ ...local, story: { ...local.story, paragraph2: e.target.value } })}
            style={{ width: '100%', background: '#222', border: '1px solid #444', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none', minHeight: 80, resize: 'vertical' }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Image URL</label>
          <input
            value={local.story.image}
            onChange={(e) => setLocal({ ...local, story: { ...local.story, image: e.target.value } })}
            style={{ width: '100%', background: '#222', border: '1px solid #444', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Or Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                const url = await handleFileUpload(file);
                if (url) setLocal({ ...local, story: { ...local.story, image: url } });
              }
            }}
            style={{ color: '#ccc', fontSize: 14 }}
          />
        </div>
      </div>

      {/* EVENTS */}
      <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#c9a84c' }}>🎉 Event Details</h3>
          <div
            onClick={() => updateSection('events', !sections.events)}
            style={{
              width: 48,
              height: 26,
              borderRadius: 13,
              background: sections.events ? '#c9a84c' : '#333',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background .3s',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 3,
                left: 3,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#fff',
                transform: sections.events ? 'translateX(22px)' : 'translateX(0)',
                transition: 'transform .3s',
              }}
            />
          </div>
        </div>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>Ceremony, Reception &amp; Location info</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div>
            <p style={{ fontWeight: 600, marginBottom: 8, color: '#ddd' }}>Ceremony</p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Time</label>
              <input
                value={local.events.ceremony.time}
                onChange={(e) => setLocal({ ...local, events: { ...local.events, ceremony: { ...local.events.ceremony, time: e.target.value } } })}
                style={{ width: '100%', background: '#222', border: '1px solid #444', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Venue</label>
              <input
                value={local.events.ceremony.venue}
                onChange={(e) => setLocal({ ...local, events: { ...local.events, ceremony: { ...local.events.ceremony, venue: e.target.value } } })}
                style={{ width: '100%', background: '#222', border: '1px solid #444', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Location</label>
              <input
                value={local.events.ceremony.location}
                onChange={(e) => setLocal({ ...local, events: { ...local.events, ceremony: { ...local.events.ceremony, location: e.target.value } } })}
                style={{ width: '100%', background: '#222', border: '1px solid #444', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}
              />
            </div>
          </div>
          <div>
            <p style={{ fontWeight: 600, marginBottom: 8, color: '#ddd' }}>Reception</p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Time</label>
              <input
                value={local.events.reception.time}
                onChange={(e) => setLocal({ ...local, events: { ...local.events, reception: { ...local.events.reception, time: e.target.value } } })}
                style={{ width: '100%', background: '#222', border: '1px solid #444', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Venue</label>
              <input
                value={local.events.reception.venue}
                onChange={(e) => setLocal({ ...local, events: { ...local.events, reception: { ...local.events.reception, venue: e.target.value } } })}
                style={{ width: '100%', background: '#222', border: '1px solid #444', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Location</label>
              <input
                value={local.events.reception.location}
                onChange={(e) => setLocal({ ...local, events: { ...local.events, reception: { ...local.events.reception, location: e.target.value } } })}
                style={{ width: '100%', background: '#222', border: '1px solid #444', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}
              />
            </div>
          </div>
          <div>
            <p style={{ fontWeight: 600, marginBottom: 8, color: '#ddd' }}>Location</p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Address</label>
              <input
                value={local.events.mapLocation.address}
                onChange={(e) => setLocal({ ...local, events: { ...local.events, mapLocation: { ...local.events.mapLocation, address: e.target.value } } })}
                style={{ width: '100%', background: '#222', border: '1px solid #444', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>City</label>
              <input
                value={local.events.mapLocation.city}
                onChange={(e) => setLocal({ ...local, events: { ...local.events, mapLocation: { ...local.events.mapLocation, city: e.target.value } } })}
                style={{ width: '100%', background: '#222', border: '1px solid #444', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Region</label>
              <input
                value={local.events.mapLocation.region}
                onChange={(e) => setLocal({ ...local, events: { ...local.events, mapLocation: { ...local.events.mapLocation, region: e.target.value } } })}
                style={{ width: '100%', background: '#222', border: '1px solid #444', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* GALLERY */}
      <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#c9a84c' }}>📸 Gallery</h3>
          <div
            onClick={() => updateSection('gallery', !sections.gallery)}
            style={{
              width: 48,
              height: 26,
              borderRadius: 13,
              background: sections.gallery ? '#c9a84c' : '#333',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background .3s',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 3,
                left: 3,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#fff',
                transform: sections.gallery ? 'translateX(22px)' : 'translateX(0)',
                transition: 'transform .3s',
              }}
            />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
          {local.gallery.images.map((url, i) => (
            <div key={i} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', aspectRatio: 1, background: '#222' }}>
              <img src={url} alt={`Gallery ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                onClick={() => {
                  const newImages = [...local.gallery.images];
                  newImages.splice(i, 1);
                  setLocal({ ...local, gallery: { ...local.gallery, images: newImages } });
                }}
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  background: 'rgba(220,38,38,.9)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  cursor: 'pointer',
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <input
            id="gallery-url-input"
            placeholder="Paste image URL..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const input = e.target as HTMLInputElement;
                if (input.value.trim()) {
                  setLocal({ ...local, gallery: { ...local.gallery, images: [...local.gallery.images, input.value.trim()] } });
                  input.value = '';
                }
              }
            }}
            style={{ flex: 1, background: '#222', border: '1px solid #444', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}
          />
        </div>
        <div style={{ marginTop: 8 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Upload Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={async (e) => {
              const files = Array.from(e.target.files || []);
              for (const file of files) {
                const url = await handleFileUpload(file);
                if (url) setLocal({ ...local, gallery: { ...local.gallery, images: [...local.gallery.images, url] } });
              }
            }}
            style={{ color: '#ccc', fontSize: 14 }}
          />
        </div>
      </div>

      {/* QUOTE */}
      <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#c9a84c' }}>💬 Quote</h3>
          <div
            onClick={() => updateSection('quote', !sections.quote)}
            style={{
              width: 48,
              height: 26,
              borderRadius: 13,
              background: sections.quote ? '#c9a84c' : '#333',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background .3s',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 3,
                left: 3,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#fff',
                transform: sections.quote ? 'translateX(22px)' : 'translateX(0)',
                transition: 'transform .3s',
              }}
            />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Quote Text</label>
          <textarea
            value={local.quote.text}
            onChange={(e) => setLocal({ ...local, quote: { ...local.quote, text: e.target.value } })}
            style={{ width: '100%', background: '#222', border: '1px solid #444', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none', minHeight: 80, resize: 'vertical' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Author</label>
          <input
            value={local.quote.author}
            onChange={(e) => setLocal({ ...local, quote: { ...local.quote, author: e.target.value } })}
            style={{ width: '100%', background: '#222', border: '1px solid #444', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}
          />
        </div>
      </div>

      {/* RSVP */}
      <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#c9a84c' }}>✉️ RSVP</h3>
          <div
            onClick={() => updateSection('rsvp', !sections.rsvp)}
            style={{
              width: 48,
              height: 26,
              borderRadius: 13,
              background: sections.rsvp ? '#c9a84c' : '#333',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background .3s',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 3,
                left: 3,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#fff',
                transform: sections.rsvp ? 'translateX(22px)' : 'translateX(0)',
                transition: 'transform .3s',
              }}
            />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Heading</label>
          <input
            value={local.rsvp.heading}
            onChange={(e) => setLocal({ ...local, rsvp: { ...local.rsvp, heading: e.target.value } })}
            style={{ width: '100%', background: '#222', border: '1px solid #444', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Deadline Text</label>
          <input
            value={local.rsvp.deadline}
            onChange={(e) => setLocal({ ...local, rsvp: { ...local.rsvp, deadline: e.target.value } })}
            style={{ width: '100%', background: '#222', border: '1px solid #444', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>WhatsApp Number (with country code)</label>
          <input
            value={local.rsvp.whatsapp}
            onChange={(e) => setLocal({ ...local, rsvp: { ...local.rsvp, whatsapp: e.target.value } })}
            style={{ width: '100%', background: '#222', border: '1px solid #444', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}
          />
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#c9a84c' }}>📎 Footer</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Date Display</label>
            <input
              value={local.footer.date}
              onChange={(e) => setLocal({ ...local, footer: { ...local.footer, date: e.target.value } })}
              style={{ width: '100%', background: '#222', border: '1px solid #444', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Tagline</label>
            <input
              value={local.footer.tagline}
              onChange={(e) => setLocal({ ...local, footer: { ...local.footer, tagline: e.target.value } })}
              style={{ width: '100%', background: '#222', border: '1px solid #444', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* SAVE */}
      <div style={{ textAlign: 'center', padding: '24px 0 48px' }}>
        <button
          onClick={handleSave}
          style={{
            background: '#c9a84c',
            color: '#111',
            padding: '16px 64px',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer',
            letterSpacing: '.04em',
          }}
        >
          💾 Save All Changes
        </button>
      </div>

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: '#16a34a',
            color: '#fff',
            padding: '14px 28px',
            borderRadius: 10,
            fontWeight: 500,
            opacity: 1,
            transform: 'translateY(0)',
            zIndex: 999,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
