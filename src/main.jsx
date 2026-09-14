import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { supabase } from './supabaseClient';
import './styles.css';

const navItems = [
  ['home', 'Home', '⌂'], ['ask', 'Ask Campus', '◌'], ['clubs', 'Clubs & Societies', '♧'],
  ['opportunities', 'Opportunities', '☆'], ['calendar', 'Calendar', '▣'], ['announcements', 'Announcements', '♢'], ['profile', 'Profile', '○']
];
const priorities = [
  { tag: 'HIGH PRIORITY', title: 'AI Club Registration', meta: 'Closes tomorrow · 11:59 PM', action: 'Register', tone: 'pink', icon: '◈' },
  { tag: 'HIGH PRIORITY', title: 'Timetable Update', meta: 'From today · 12:00 PM', action: 'View Changes', tone: 'orange', icon: '▣' },
  { tag: 'RECOMMENDED FOR YOU', title: 'Web Development Workshop', meta: '26th month · First Year · IT', action: 'Learn More', tone: 'green', icon: '▤' },
  { tag: 'AI ASSISTANT', title: 'Ask Campus', meta: 'Get a quick answer', action: 'Chat Now', tone: 'blue', icon: '✦' }
];
const week = [
  { day: '14', mon: 'Sep', title: 'Club registration', type: 'High priority', tone: 'pink' },
  { day: '16', mon: 'Sep', title: 'Web Development Workshop', type: 'DT Dept.', tone: 'orange' },
  { day: '18', mon: 'Sep', title: 'Society orientation', type: 'General', tone: 'green' },
  { day: '21', mon: 'Sep', title: 'Scholarship form', type: 'Deadline', tone: 'red' }
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function Onboarding({ onDone }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim()) {
      setError('Please fill in both fields.');
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const igdtuwDomains = ['igdtuw.ac.in', 'igdtuw.ac', 'igdtuwimt.ac.in'];
    const domain = trimmedEmail.split('@')[1] || '';
    if (!igdtuwDomains.includes(domain)) {
      setError('Please use your IGDTUW college email (e.g. name@igdtuw.ac.in).');
      return;
    }

    setLoading(true);
    try {
      const { data: existing } = await supabase
        .from('students')
        .select('id, name, email')
        .eq('email', trimmedEmail)
        .maybeSingle();

      if (existing) {
        localStorage.setItem('uniradar_student', JSON.stringify(existing));
        onDone(existing);
      } else {
        const { data, error: insertError } = await supabase
          .from('students')
          .insert({ name: name.trim(), email: trimmedEmail })
          .select('id, name, email')
          .single();

        if (insertError) throw insertError;
        localStorage.setItem('uniradar_student', JSON.stringify(data));
        onDone(data);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-screen">
      <div className="onboarding-card">
        <div className="onboarding-brand">
          <div className="brand-mark">◆</div>
          <strong>Uniradar</strong>
        </div>
        <h1>Welcome to Uniradar</h1>
        <p>Your AI Campus Assistant for IGDTUW students.</p>
        <p className="onboarding-sub">Enter your details to get started.</p>
        <form onSubmit={handleSubmit} className="onboarding-form">
          <label>
            <span>Full Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Honey Sharma"
              autoComplete="off"
            />
          </label>
          <label>
            <span>College Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. honey@igdtuw.ac.in"
              autoComplete="off"
            />
            <small>We verify that you're an IGDTUW student using your college email.</small>
          </label>
          {error && <div className="onboarding-error">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Get Started'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Sidebar({ active, onNavigate }) {
  return <aside className="sidebar">
    <div className="brand"><div className="brand-mark">◆</div><div><strong>Uniradar</strong><small>Your AI Campus Assistant</small></div></div>
    <nav>{navItems.map(([id, label, icon]) => <button key={id} className={active === id ? 'nav-item active' : 'nav-item'} onClick={() => onNavigate(id)}><span>{icon}</span>{label}</button>)}</nav>
    <div className="sidebar-foot"><div className="spark">✦</div><p>Everything announced.<br/>Finally understood.</p></div>
  </aside>;
}

function Topbar({ active, onMenu, student, onSignOut }) {
  const label = navItems.find(([id]) => id === active)?.[1] || 'Home';
  const initial = student ? student.name.charAt(0).toUpperCase() : 'R';
  return <header className="topbar"><button className="mobile-menu" onClick={onMenu}>☰</button><div className="crumb">Uniradar <span>/</span> {label}</div><div className="top-actions"><button className="search">⌕ <span>Search anything...</span></button><button className="icon-button">♧</button><button className="avatar" onClick={onSignOut} title="Sign out">{initial}</button></div></header>;
}

function Home({ onNavigate, student }) {
  return <div className="page home-page">
    <div className="welcome"><div><p className="eyebrow">MONDAY, 14 SEPTEMBER 2025</p><h1>{getGreeting()}, {student ? student.name.split(' ')[0] : 'Honey'}! <span>✦</span></h1><p>Here's what matters to you today.</p></div><div className="streak"><span>✧</span><div><b>3 day streak</b><small>Keep exploring campus</small></div></div></div>
    <div className="summary-row"><Summary icon="◉" title="2 Actions Required" text="Don't miss these important updates!" tone="pink"/><Summary icon="✦" title="3 Relevant Opportunities" text="Based on your interests & profile" tone="blue"/><Summary icon="★" title="5 New Announcements" text="Since your last visit" tone="green"/></div>
    <section><SectionTitle title="Priority for You" link="View all"/><div className="priority-grid">{priorities.map((item) => <article className="priority-card" key={item.title}><div className={`card-icon ${item.tone}`}>{item.icon}</div><span className={`tag ${item.tone}`}>{item.tag}</span><h3>{item.title}</h3><p>{item.meta}</p><button onClick={() => item.title === 'Ask Campus' ? onNavigate('ask') : null}>{item.action} <b>→</b></button></article>)}</div></section>
    <section><SectionTitle title="Your Week" link="View calendar"/><div className="week-grid">{week.map(item => <article className="week-card" key={item.title}><div className={`date-dot ${item.tone}`}></div><b>{item.day} <small>{item.mon}</small></b><h3>{item.title}</h3><p>{item.type}</p></article>)}</div></section>
  </div>;
}
function Summary({ icon, title, text, tone }) { return <div className={`summary ${tone}`}><span>{icon}</span><div><b>{title}</b><small>{text}</small></div><i>›</i></div>; }
function SectionTitle({ title, link }) { return <div className="section-title"><h2><span>✦</span>{title}</h2><button>{link} <b>→</b></button></div>; }

function AskCampus({ student }) {
  const [value, setValue] = useState('');
  const [sent, setSent] = useState(false);
  const firstName = student ? student.name.split(' ')[0] : 'Honey';
  return <div className="page ask-page"><div className="page-heading"><p className="eyebrow">YOUR PERSONAL CAMPUS GUIDE</p><h1>Ask Campus</h1><p>Ask anything about college. Get quick, accurate answers.</p></div><div className="chat-shell"><div className="chat-intro"><div className="bot-avatar">✦</div><div><b>Hi {firstName}, I'm Uniradar.</b><p>I can help you find events, clubs, deadlines and anything else about your campus.</p></div></div><div className="suggestions"><button onClick={() => setValue('What events are happening this month?')}>What events are happening this month?</button><button onClick={() => setValue('Show me clubs I might like')}>Show me clubs I might like</button><button onClick={() => setValue('What deadlines are coming up?')}>What deadlines are coming up?</button></div>{sent && <div className="answer"><b>Here's what I found for you.</b><p>There are 3 upcoming events this month, including the Web Development Workshop on 16 September. You can find all the details in your calendar.</p></div>}<div className="chat-input"><input value={value} onChange={e => setValue(e.target.value)} placeholder="Ask a question..." onKeyDown={e => e.key === 'Enter' && value && setSent(true)}/><button onClick={() => value && setSent(true)}>↗</button></div></div></div>;
}

function Calendar() { return <div className="page"><div className="page-heading"><p className="eyebrow">STAY AHEAD</p><h1>Calendar</h1><p>All your important dates in one place.</p></div><div className="calendar-layout"><div className="month-card"><div className="month-head"><b>September 2025</b><span>‹ &nbsp; ›</span></div><div className="calendar-days">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <b key={d}>{d}</b>)}{Array.from({length:35}, (_, i) => <span className={i === 14 ? 'selected' : i === 13 || i === 16 ? 'marked' : ''} key={i}>{i < 1 ? '' : i}</span>)}</div></div><div className="upcoming"><div className="month-head"><b>Upcoming Events</b><button>View all →</button></div>{week.map(item => <div className="event-row" key={item.title}><div className={`event-date ${item.tone}`}><b>{item.day}</b><small>{item.mon}</small></div><div><b>{item.title}</b><small>2:00 PM · CSE Seminar Hall</small></div><span className={`tag ${item.tone}`}>{item.type}</span></div>)}</div></div></div>; }

function ProfilePage({ student, onSignOut }) {
  return <div className="page"><div className="page-heading"><p className="eyebrow">YOUR ACCOUNT</p><h1>Profile</h1><p>Make Uniradar work better for you.</p></div><div className="profile-card"><div className="profile-avatar">{student ? student.name.charAt(0).toUpperCase() : 'R'}</div><div className="profile-info"><b>{student ? student.name : 'Student'}</b><small>{student ? student.email : ''}</small><span className="tag green">IGDTUW Verified</span></div><button className="sign-out-btn" onClick={onSignOut}>Sign Out</button></div></div>;
}

function GenericPage({ title, subtitle, type }) { return <div className="page"><div className="page-heading"><p className="eyebrow">UNIRADAR DISCOVER</p><h1>{title}</h1><p>{subtitle}</p></div><div className="feature-grid">{['Coding Club','Dramatics Society','Sports Club','Photography Society','Green Campus Club','Robotics Club'].map((x, i) => <article className="feature-card" key={x}><div className={`club-icon c${i}`}>{['◉','◌','✦','▣','♧','◇'][i]}</div><div><b>{x}</b><p>{type === 'clubs' ? 'Connect with students who share your interests.' : 'Explore this week\u2019s most relevant opportunities.'}</p></div><button>{type === 'clubs' ? 'Join' : 'Explore'} →</button></article>)}</div></div>; }

function App() {
  const [student, setStudent] = useState(null);
  const [checking, setChecking] = useState(true);
  const [active, setActive] = useState('home');
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('uniradar_student');
    if (saved) {
      try { setStudent(JSON.parse(saved)); } catch {}
    }
    setChecking(false);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('uniradar_student');
    setStudent(null);
    setActive('home');
  };

  const navigate = id => { setActive(id); setMobile(false); };

  if (checking) return null;

  if (!student) return <Onboarding onDone={setStudent} />;

  const content = active === 'home' ? <Home onNavigate={navigate} student={student}/> : active === 'ask' ? <AskCampus student={student}/> : active === 'calendar' ? <Calendar/> : active === 'clubs' ? <GenericPage title="Clubs & Societies" subtitle="Explore, join, and be part of something amazing!" type="clubs"/> : active === 'opportunities' ? <GenericPage title="Opportunities" subtitle="Discover events, workshops, internships and more!" type="opportunities"/> : active === 'profile' ? <ProfilePage student={student} onSignOut={handleSignOut}/> : active === 'announcements' ? <GenericPage title="Announcements" subtitle="Everything important, in one clear place." type="announcements"/> : <GenericPage title="Profile" subtitle="Make Uniradar work better for you." type="profile"/>;

  return <div className="app"><div className={mobile ? 'sidebar-wrap open' : 'sidebar-wrap'}><Sidebar active={active} onNavigate={navigate}/></div><main><Topbar active={active} onMenu={() => setMobile(!mobile)} student={student} onSignOut={handleSignOut}/>{content}</main></div>;
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
