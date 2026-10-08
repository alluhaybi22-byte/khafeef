# خفيف — AI Arabic Grading + Make.com (Draft)

Status: DEVELOPMENT ONLY. No deployment, no changes to main.

## Goal
Correct Arabic handwritten student worksheets, dictation, copying, short answers, multiple choice, and writing using a vision-capable AI model. Route illegible, ambiguous, rubric-sensitive, or inconsistent answers to a teacher for review. Save approved outcomes and trigger Make.com automation.

## Architecture
- Existing PWA is preserved. Add separate UI screens for class roster, upload, answer key/rubric, correction queue, results, and exports.
- Secure backend performs PDF/image preprocessing, question segmentation, AI handwriting transcription, rubric scoring, and validation.
- Never expose AI provider keys or Make webhook URLs in browser JavaScript.
- Teacher review queue stores source image crop, transcription, AI suggested score, rationale, review reason, and teacher override.
- Per-question states: auto_graded | needs_review | teacher_approved | failed.
- Overall report remains pending while required reviews remain unresolved.
- Make receives minimal, approved structured results only, not raw student handwriting or personally identifying data unless separately configured and authorized.
- Use stable opaque student_id, exam_id, question_id, job_id; enforce idempotency on job_id and event_id.
- Store an audit trail of AI model/version, rubric version, timestamp, and any human overrides.
- Protect school data with access controls, retention policy, encryption, and explicit provider review.

## Make.com Scenario (to configure in user's account)
1. Webhooks > Custom webhook: receive `grading.approved.v1` from secure backend.
2. Validate signature/secret server-side at the integration gateway; reject duplicates by event_id.
3. Router:
   - update grade register;
   - generate PDF student/class reports;
   - aggregate skill/error analysis;
   - draft remediation plans for teacher approval.
4. Error handler/retry and notification; never silently lose results.

Example event (SYNTHETIC, no real student data):
```json
{
  "event_type": "grading.approved.v1",
  "event_id": "evt_demo_001",
  "job_id": "job_demo_001",
  "student_id": "student_demo_001",
  "exam_id": "exam_demo_001",
  "rubric_version": "1",
  "score": 8,
  "max_score": 10,
  "reviewed_question_count": 2,
  "approved_at": "2026-10-08T00:00:00Z"
}
```

## Validation
- Test with synthetic samples first; then authorized representative Arabic primary-school handwriting samples.
- Measure transcription character error rate, grading agreement with teachers, false auto-approval rate, and manual review load by question type.
- Confidence scores are not calibrated probabilities by default; use rules and independent checks to determine review eligibility.
- Do not enable production automation or deploy without explicit user approval.

## Pending prerequisites
- User creates Make Custom Webhook and configures credentials privately.
- Choose AI vision provider and storage architecture after privacy/cost evaluation.
- Design in Figma and implement UI on this feature branch.
