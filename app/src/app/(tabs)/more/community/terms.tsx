import { MoreScreen, Paragraphs } from '../../../../components/more/ui';
import { SUBMISSION_TERMS } from '../../../../lib/community/model';

export default function SubmissionTerms() {
  return (
    <MoreScreen title="Submission Terms" eyebrow="Salt & Sovereignty" back="/more/community/offer" backLabel="Back to your offering">
      <Paragraphs items={SUBMISSION_TERMS} />
    </MoreScreen>
  );
}
