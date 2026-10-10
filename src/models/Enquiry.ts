import mongoose, { Document, Schema } from 'mongoose';

export const ENQUIRY_SUBJECTS = ['quote', 'technical', 'order', 'partnership', 'other'] as const;
export const ENQUIRY_STATUSES = ['New', 'Contacted', 'Closed'] as const;

export type EnquirySubject = (typeof ENQUIRY_SUBJECTS)[number];
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

/** A message sent through the storefront's contact form. */
export interface IEnquiry extends Document {
  name: string;
  email: string;
  company?: string;
  subject: EnquirySubject;
  message: string;
  /** Product name when the visitor arrived from a product page's "Request a quote". */
  product?: string;
  /** Quantity from the same link. Free text, since it comes from a query string. */
  quantity?: string;
  status: EnquiryStatus;
  createdAt: Date;
  updatedAt: Date;
}

const EnquirySchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    company: { type: String, trim: true, maxlength: 160 },
    subject: { type: String, enum: ENQUIRY_SUBJECTS, required: true },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    product: { type: String, trim: true, maxlength: 200 },
    quantity: { type: String, trim: true, maxlength: 40 },
    status: { type: String, enum: ENQUIRY_STATUSES, default: 'New' },
  },
  { timestamps: true }
);

// The admin list is newest-first, optionally narrowed to one status.
EnquirySchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IEnquiry>('Enquiry', EnquirySchema);
