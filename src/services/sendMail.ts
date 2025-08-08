import { apiUrl } from '@/services/index';

// Send quote request
export const sendQuoteRequest = async (payload: {
  name: string;
  phone: string;
  email: string;
  company: string;
  items: any[];
}) => {
  const response = await fetch(`${apiUrl}/quote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error('Failed to send quote request');
  }
  return response.json();
};

// Send general enquiry
export const sendEnquiry = async (payload: {
  name: string;
  phone: string;
  email: string;
  company: string;
  message: string;
}) => {
  const response = await fetch(`${apiUrl}/enquiry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error('Failed to send enquiry');
  }
  return response.json();
};
