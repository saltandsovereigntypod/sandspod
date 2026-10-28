import { HolyDayScreen } from '../../../../components/holy/HolyDayScreen';

// A holy day opened from a tradition's section of the Grimoire: the same page as from Today.
export default function GrimoireHolyDay() {
  return <HolyDayScreen back="/grimoire" backLabel="Back to the Grimoire" />;
}
