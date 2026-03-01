import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';
import { validateE164 } from '../lib/validation';

// TODO: Connect to Firestore users collection
const saveUserProfile = async (profile) => {
  console.log('📝 TODO: Save to Firestore users collection:', profile);
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('✅ Profile would be saved:', profile);
      resolve({ success: true, userId: 'mock-user-' + Date.now() });
    }, 1000);
  });
};

export default function Signup() {
  const navigate = useNavigate();

  // Form state
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [goals, setGoals] = useState([]);
  const [goalInput, setGoalInput] = useState('');
  const [habits, setHabits] = useState([]);
  const [habitInput, setHabitInput] = useState('');
  const [checkInTime, setCheckInTime] = useState('21:00');
  const [timezone, setTimezone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Common timezones
  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Toronto',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Dubai',
    'Australia/Sydney',
    'Pacific/Auckland'
  ];

  // Set default timezone from browser
  useEffect(() => {
    try {
      const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(browserTimezone);
    } catch (e) {
      setTimezone('America/New_York');
    }
  }, []);

  // Phone validation on change
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);
    
    if (value && !validateE164(value)) {
      setPhoneError('Phone must be in E.164 format (e.g., +1234567890)');
    } else {
      setPhoneError('');
    }
  };

  // Add goal
  const addGoal = () => {
    const trimmed = goalInput.trim();
    if (trimmed && !goals.includes(trimmed)) {
      setGoals([...goals, trimmed]);
      setGoalInput('');
    }
  };

  const removeGoal = (goal) => {
    setGoals(goals.filter(g => g !== goal));
  };

  // Add habit
  const addHabit = () => {
    const trimmed = habitInput.trim();
    if (trimmed && !habits.includes(trimmed)) {
      setHabits([...habits, trimmed]);
      setHabitInput('');
    }
  };

  const removeHabit = (habit) => {
    setHabits(habits.filter(h => h !== habit));
  };

  // Calculate progress (simple: how many required fields filled)
  const calculateProgress = () => {
    let filled = 0;
    let total = 4;
    
    if (name.trim()) filled++;
    if (phoneNumber && !phoneError) filled++;
    if (goals.length > 0) filled++;
    if (habits.length > 0) filled++;
    
    return (filled / total) * 100;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }
    
    if (!phoneNumber || phoneError) {
      alert('Please enter a valid phone number in E.164 format');
      return;
    }

    if (goals.length === 0) {
      alert('Please add at least one goal');
      return;
    }

    if (habits.length === 0) {
      alert('Please add at least one habit');
      return;
    }

    setIsSubmitting(true);

    // Build profile object matching Firestore schema
    const profile = {
      userId: null, // Will be set by backend
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      goals: goals,
      habits: habits,
      checkInTime: checkInTime,
      timezone: timezone,
      createdAt: new Date().toISOString()
    };

    try {
      // TODO: Connect to Firestore users collection
      const result = await saveUserProfile(profile);
      
      // Store userId in localStorage for demo purposes
      if (result.userId) {
        localStorage.setItem('userId', result.userId);
      }
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      alert('Error during signup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-header">
        <h1 className="signup-title">Welcome! 👋</h1>
        <p className="signup-subtitle">Let's set up your emotional companion</p>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${calculateProgress()}%` }}></div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div className="form-group">
          <label className="form-label">
            Name <span className="required">*</span>
          </label>
          <input
            type="text"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
          />
        </div>

        {/* Phone Number */}
        <div className="form-group">
          <label className="form-label">
            Phone Number <span className="required">*</span>
          </label>
          <input
            type="tel"
            className={`form-input ${phoneError ? 'error' : ''}`}
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="+1234567890"
            required
          />
          {phoneError && <div className="error-message">{phoneError}</div>}
          <div className="helper-text">
            Required for voice calls (E.164 format: +[country code][number])
          </div>
        </div>

        {/* Goals */}
        <div className="form-group">
          <label className="form-label">
            Goals <span className="required">*</span>
          </label>
          <div className="chip-input-container">
            <input
              type="text"
              className="form-input chip-input"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addGoal();
                }
              }}
              placeholder="Add a goal"
            />
            <button type="button" className="btn-add-chip" onClick={addGoal}>
              Add
            </button>
          </div>
          <div className="chips-container">
            {goals.map((goal, idx) => (
              <div key={idx} className="chip">
                <span>{goal}</span>
                <button
                  type="button"
                  className="chip-remove"
                  onClick={() => removeGoal(goal)}
                  aria-label="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Habits */}
        <div className="form-group">
          <label className="form-label">
            Habits <span className="required">*</span>
          </label>
          <div className="chip-input-container">
            <input
              type="text"
              className="form-input chip-input"
              value={habitInput}
              onChange={(e) => setHabitInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addHabit();
                }
              }}
              placeholder="Add a habit"
            />
            <button type="button" className="btn-add-chip" onClick={addHabit}>
              Add
            </button>
          </div>
          <div className="chips-container">
            {habits.map((habit, idx) => (
              <div key={idx} className="chip">
                <span>{habit}</span>
                <button
                  type="button"
                  className="chip-remove"
                  onClick={() => removeHabit(habit)}
                  aria-label="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Check-in Time */}
        <div className="form-group">
          <label className="form-label">
            Daily Check-in Time <span className="required">*</span>
          </label>
          <input
            type="time"
            className="form-input"
            value={checkInTime}
            onChange={(e) => setCheckInTime(e.target.value)}
            required
          />
          <div className="helper-text">
            When would you like your daily check-in call?
          </div>
        </div>

        {/* Timezone */}
        <div className="form-group">
          <label className="form-label">
            Timezone <span className="required">*</span>
          </label>
          <select
            className="form-select"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            required
          >
            {timezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}
