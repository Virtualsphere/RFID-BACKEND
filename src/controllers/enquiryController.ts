import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Enquiry, { ENQUIRY_STATUSES, ENQUIRY_SUBJECTS } from '../models/Enquiry';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * A phone number as people type it ("+91 98765-43210", "(022) 2345 6789"):
 * 10 to 15 digits, from an Indian number without its country code to the
 * longest international one. Mirrors isPhoneNumber in the storefront's
 * src/lib/phone.ts.
 */
const isPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, '').length;
  return /^\+?[\d\s().-]+$/.test(value) && digits >= 10 && digits <= 15;
};

/** Trimmed string from an untrusted body field, or '' when it isn't a string. */
const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

// @route   POST /api/enquiries
// @desc    Save a contact-form message (public)
export const createEnquiry = async (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};

    // Honeypot: the form carries a field that is hidden from people, so only a
    // bot fills it in. Answer as if it worked so the bot learns nothing.
    if (text(body.website)) {
      return res.status(201).json({ message: 'Thanks, we have your message.' });
    }

    const name = text(body.name);
    const email = text(body.email);
    const phone = text(body.phone);
    const message = text(body.message);
    const subject = text(body.subject);

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: 'Name, email, phone number and message are required.' });
    }
    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }
    if (!isPhoneNumber(phone)) {
      return res.status(400).json({
        message: 'Please enter a valid phone number. Outside India, include your country code.',
      });
    }
    const validSubject = ENQUIRY_SUBJECTS.find((s) => s === subject);
    if (!validSubject) {
      return res.status(400).json({ message: 'Please choose a subject.' });
    }

    await Enquiry.create({
      name,
      email,
      phone,
      company: text(body.company) || undefined,
      subject: validSubject,
      message,
      product: text(body.product) || undefined,
      quantity: text(body.quantity) || undefined,
    });

    res.status(201).json({ message: 'Thanks, we have your message.' });
  } catch (error: any) {
    // Over-long fields are the visitor's to fix; anything else is ours.
    if (error?.name === 'ValidationError') {
      return res.status(400).json({ message: 'One of the fields is too long. Please shorten it and try again.' });
    }
    console.error('Error saving enquiry:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @route   GET /api/enquiries
// @desc    List enquiries, newest first (ADMIN ONLY). ?status= narrows to one status.
export const getEnquiries = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit as string, 10) || 50));
    const status = req.query.status as string | undefined;

    const filter: Record<string, unknown> = {};
    if (status) {
      if (!(ENQUIRY_STATUSES as readonly string[]).includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      filter.status = status;
    }

    const [enquiries, total] = await Promise.all([
      Enquiry.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Enquiry.countDocuments(filter),
    ]);

    res.json({ enquiries, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @route   PUT /api/enquiries/:id/status
// @desc    Mark an enquiry New / Contacted / Closed (ADMIN ONLY)
export const updateEnquiryStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body ?? {};
    if (!(ENQUIRY_STATUSES as readonly string[]).includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    res.json(enquiry);
  } catch (error) {
    console.error('Error updating enquiry status:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @route   DELETE /api/enquiries/:id
// @desc    Delete an enquiry (ADMIN ONLY)
export const deleteEnquiry = async (req: Request, res: Response) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    res.json({ message: 'Enquiry deleted' });
  } catch (error) {
    console.error('Error deleting enquiry:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
