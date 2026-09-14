export interface FeedbackConfig {
  /**
   * Embed URL for Google Form, Typeform, Tally, or other form builder.
   * Example: https://docs.google.com/forms/d/e/.../viewform?embedded=true
   */
  formUrl: string;
  /**
   * Direct shareable link (e.g. forms.gle shortlink)
   */
  shareUrl?: string;
  /**
   * Fallback recipient email for direct clergy theological inquiries.
   */
  contactEmail: string;
}

export const FEEDBACK_CONFIG: FeedbackConfig = {
  formUrl: import.meta.env.VITE_FEEDBACK_FORM_URL || 'https://docs.google.com/forms/d/e/1FAIpQLSfUYSSrsng1x0wLYmRsiArvsEbnzIiib_Tz7lwASvjN9Y45Bw/viewform?usp=dialog&embedded=true',
  shareUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSfUYSSrsng1x0wLYmRsiArvsEbnzIiib_Tz7lwASvjN9Y45Bw/viewform?usp=dialog',
  contactEmail: 'pastors@berea.app'
};
