import { Redirect } from 'expo-router';

// Google sign-in returns here on phones. The in-app browser normally catches
// the link first; if the app opens it instead, go home and let the session decide.
export default function AuthCallback() {
  return <Redirect href="/" />;
}
