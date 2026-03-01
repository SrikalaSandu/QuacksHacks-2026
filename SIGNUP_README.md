# Signup Page Implementation

## Files Created

### Standalone Version (Works Immediately)

- **`signup.html`** - Complete standalone signup page matching `dashboard.html` structure
  - Works without any build setup
  - Open directly in browser
  - Redirects to `dashboard.html` on submit

### React Component Version (For Full App)

- **`src/pages/Signup.jsx`** - React component
- **`src/pages/Signup.css`** - Component styles
- **`src/lib/validation.js`** - Phone validation helper
- **`src/App.jsx`** - Example route configuration

## Features Implemented

### ✅ Design & Styling

- Primary color: `#C7EABB`
- White background (`#FFFFFF`)
- Soft, clean aesthetic matching existing dashboard
- Mobile-first, fully responsive
- Card layout with rounded corners and subtle shadows
- Large touch-friendly inputs and buttons

### ✅ Form Fields

- **Name** (required)
- **Phone Number** (required, E.164 validated)
- **Goals** (multiple, chip-based)
- **Habits** (multiple, chip-based)
- **Check-in Time** (time picker)
- **Timezone** (auto-detected, dropdown)

### ✅ Validation

- E.164 phone format validation (`+1234567890`)
- Inline error messages
- Real-time validation feedback
- Required field checking

### ✅ User Experience

- Progress bar showing completion
- Chip-based input for goals/habits
  - Press Enter or click Add
  - Click ✕ to remove
- Auto-detects browser timezone
- Helpful placeholder text
- Loading state on submit

### ✅ Data Structure

Profile object matches Firestore schema:

```javascript
{
  userId: null,            // Set by backend
  name: "Sarah",
  phoneNumber: "+1234567890",
  goals: ["Goal 1", "Goal 2"],
  habits: ["Habit 1", "Habit 2"],
  checkInTime: "21:00",
  timezone: "America/New_York",
  createdAt: "2026-03-01T..."
}
```

## TODO: Backend Integration

### Line 278 in signup.html:

```javascript
// TODO: Connect to Firestore users collection
const saveUserProfile = async (profile) => {
  console.log("📝 TODO: Save to Firestore users collection:", profile);
  // Replace with:
  // const docRef = await addDoc(collection(db, 'users'), profile);
  // return { success: true, userId: docRef.id };
};
```

### In React version (Signup.jsx, line 8):

```javascript
// TODO: Connect to Firestore users collection
const saveUserProfile = async (profile) => {
  // Replace with actual Firestore call:
  // import { collection, addDoc } from 'firebase/firestore';
  // import { db } from '../lib/firebase';
  //
  // const docRef = await addDoc(collection(db, 'users'), profile);
  // return { success: true, userId: docRef.id };
};
```

## Usage

### Standalone Version

```bash
# Just open in browser
open signup.html
# Or double-click the file
```

### React Version

```bash
# Install dependencies (if not already)
npm install react-router-dom

# Import in App.jsx (already created)
# Navigate to /signup in your app
```

## Phone Number Format

**E.164 Format Required:**

- Starts with `+`
- Country code (1-3 digits)
- Phone number (up to 15 total digits)
- No spaces, dashes, or other characters

**Examples:**

- ✅ `+1234567890` (US)
- ✅ `+442071234567` (UK)
- ✅ `+81312345678` (Japan)
- ❌ `1234567890` (missing +)
- ❌ `+1 (234) 567-8900` (has formatting)

## Testing the Standalone Version

1. Open `signup.html` in your browser
2. Fill out the form:
   - Name: "Sarah"
   - Phone: "+12345678901"
   - Add a few goals
   - Add a few habits
   - Select check-in time
   - Select timezone
3. Click "Create Account"
4. Check browser console for profile data
5. Should redirect to `dashboard.html`

## Customization

### Add More Fields

Edit the form in either file and add to the profile object.

### Change Colors

Update CSS variables:

```css
:root {
  --primary: #c7eabb; /* Your primary color */
  --text-dark: #2d3748; /* Dark text */
  --text-soft: #718096; /* Muted text */
}
```

### Add More Timezones

In the `timezones` array, add any IANA timezone string.

## Integration Checklist

- [ ] Test standalone `signup.html` in browser
- [ ] Verify phone validation works
- [ ] Check chip add/remove functionality
- [ ] Test progress bar updates
- [ ] Connect `saveUserProfile` to Firestore
- [ ] Set up react-router in main app
- [ ] Import Signup component
- [ ] Add route to App.jsx
- [ ] Test navigation to dashboard
- [ ] Handle authentication/userId properly

## Next Steps

1. **Backend:** Connect `saveUserProfile` to Firestore
2. **Auth:** Add authentication before saving
3. **Validation:** Add server-side validation
4. **Error Handling:** Improve error messages
5. **Success State:** Better success confirmation
6. **Profile Editing:** Create edit profile page later
