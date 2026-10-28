import { HolyDayScreen } from '../../../../components/holy/HolyDayScreen';

// A coven's holy day, opened from its holidays on the Coven tab: the same page as from Today.
export default function CovenHolyDay() {
  return <HolyDayScreen back="/coven" backLabel="Back to Covens" />;
}
