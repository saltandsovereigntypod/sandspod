import { Redirect } from 'expo-router';

// My Shelves now lives on the Altar page, as its Shelves tab.
export default function MyShelvesRedirect() {
  return <Redirect href={{ pathname: '/altar', params: { tab: 'shelves' } }} />;
}
