import { apiClient } from './api';

export interface Receipt {
  id: string;
  booking_id: string;
  user_id: string;
  receipt_number: string;
  service_name: string;
  booking_type: 'hotel' | 'guide' | 'activity' | 'transport';
  reference_id: string;
  check_in_date?: string;
  check_out_date?: string;
  number_of_guests: number;
  special_requests?: string;
  total_price: number;
  base_rate: number;
  tax_fee: number;
  room_type?: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  booking_status: string;
  notes?: string;
  generated_at: string;
  downloaded_at?: string;
  printed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ReceiptStats {
  total_receipts: number;
  total_amount: number;
  active_months: number;
  last_receipt_date?: string;
}

export const receiptsService = {
  /**
   * Get all receipts for authenticated user
   */
  async getUserReceipts(): Promise<Receipt[]> {
    const response = await apiClient.get('/receipts');
    return response.data?.data || [];
  },

  /**
   * Get specific receipt by ID
   */
  async getReceiptById(id: string): Promise<Receipt> {
    const response = await apiClient.get(`/receipts/${id}`);
    return response.data?.data;
  },

  /**
   * Get receipt by booking ID
   */
  async getReceiptByBookingId(bookingId: string): Promise<Receipt> {
    const response = await apiClient.get(`/receipts/booking/${bookingId}`);
    return response.data?.data;
  },

  /**
   * Get receipt statistics for user
   */
  async getReceiptStats(): Promise<ReceiptStats> {
    const response = await apiClient.get('/receipts/stats/overview');
    return response.data?.data;
  },

  /**
   * Record receipt download
   */
  async recordDownload(receiptId: string): Promise<Receipt> {
    const response = await apiClient.post(`/receipts/${receiptId}/download`);
    return response.data?.data;
  },

  /**
   * Record receipt print
   */
  async recordPrint(receiptId: string): Promise<Receipt> {
    const response = await apiClient.post(`/receipts/${receiptId}/print`);
    return response.data?.data;
  },

  /**
   * Delete receipt
   */
  async deleteReceipt(receiptId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/receipts/${receiptId}`);
    return response.data;
  },

  /**
   * Export receipt as HTML
   */
  exportReceiptAsHTML(receipt: Receipt): string {
    const duration = receipt.check_in_date && receipt.check_out_date
      ? Math.ceil(
          (new Date(receipt.check_out_date).getTime() - new Date(receipt.check_in_date).getTime()) /
          (1000 * 60 * 60 * 24)
        )
      : 0;
    const pricePerDay = duration > 0 ? receipt.total_price / duration : receipt.total_price;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Receipt - ${receipt.receipt_number}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            padding: 40px 20px;
          }
          .receipt-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border: 1px solid #ddd;
            border-radius: 8px;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #333;
          }
          .header h1 {
            font-size: 36px;
            margin-bottom: 10px;
            font-weight: bold;
          }
          .header p {
            color: #666;
            font-size: 14px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
          }
          .info-section h3 {
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #666;
            margin-bottom: 5px;
            margin-top: 15px;
          }
          .info-section p {
            font-weight: 600;
            color: #333;
            font-size: 14px;
          }
          .details-box {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border: 1px solid #ddd;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
            color: #555;
          }
          .detail-row span:last-child {
            font-weight: 600;
            color: #333;
          }
          .price-box {
            background: #f0f4ff;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border: 1px solid #bfd7ff;
          }
          .price-total {
            display: flex;
            justify-content: space-between;
            padding-top: 10px;
            border-top: 2px solid #999;
            font-weight: bold;
            font-size: 16px;
            color: #003399;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            padding-top: 30px;
            border-top: 2px solid #333;
            font-size: 12px;
            color: #666;
          }
          @media print {
            body {
              padding: 0;
            }
            .receipt-container {
              border: none;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <h1>RECEIPT</h1>
            <p>TripEase Ghana</p>
            <p>Your Travel Experience Partner</p>
          </div>

          <div class="info-grid">
            <div class="info-section">
              <h3>Receipt Number</h3>
              <p>${receipt.receipt_number}</p>

              <h3>Receipt Date</h3>
              <p>${new Date(receipt.generated_at).toLocaleDateString()}</p>

              <h3>Status</h3>
              <p style="color: #10b981; text-transform: uppercase;">${receipt.booking_status}</p>
            </div>

            <div class="info-section">
              <h3>Service Type</h3>
              <p>${receipt.booking_type.charAt(0).toUpperCase() + receipt.booking_type.slice(1)}</p>

              <h3>Service Name</h3>
              <p>${receipt.service_name}</p>

              <h3>Confirmation</h3>
              <p style="background: #f0f0f0; padding: 8px 12px; display: inline-block; border-radius: 4px; font-family: monospace;">REF-${receipt.id.substring(0, 8).toUpperCase()}</p>
            </div>
          </div>

          <div class="details-box">
            <h3 style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #333; margin-bottom: 15px;">Booking Details</h3>
            <div class="detail-row">
              <span>Check-in / Start Date:</span>
              <span>${receipt.check_in_date ? new Date(receipt.check_in_date).toLocaleDateString() : '-'}</span>
            </div>
            <div class="detail-row">
              <span>Check-out / End Date:</span>
              <span>${receipt.check_out_date ? new Date(receipt.check_out_date).toLocaleDateString() : '-'}</span>
            </div>
            ${duration > 0 ? `<div class="detail-row">
              <span>Duration:</span>
              <span>${duration} Night${duration !== 1 ? 's' : ''}</span>
            </div>` : ''}
            <div class="detail-row">
              <span>Number of Guests:</span>
              <span>${receipt.number_of_guests}</span>
            </div>
          </div>

          <div class="price-box">
            <h3 style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #003399; margin-bottom: 15px;">Price Details</h3>
            ${duration > 1 ? `
              <div class="detail-row">
                <span>Price per Night:</span>
                <span>GH₵ ${pricePerDay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div class="detail-row">
                <span>Number of Nights:</span>
                <span>× ${duration}</span>
              </div>
            ` : ''}
            <div class="detail-row">
              <span>Taxes & Fees:</span>
              <span>GH₵ ${receipt.tax_fee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div class="price-total">
              <span>Total Amount:</span>
              <span>GH₵ ${receipt.total_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          ${receipt.special_requests ? `
          <div style="background: #fffbeb; border: 1px solid #fcd34d; padding: 16px; border-radius: 8px; margin-bottom: 30px;">
            <p style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #92400e; margin-bottom: 8px;">Special Requests</p>
            <p style="font-size: 13px; color: #555; font-style: italic;">"${receipt.special_requests}"</p>
          </div>
          ` : ''}

          <div class="footer">
            <p>Thank you for choosing TripEase Ghana!</p>
            <p>For inquiries, please contact: support@tripease.gh</p>
            <p style="margin-top: 20px;">Receipt generated on ${new Date(receipt.generated_at).toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
};
