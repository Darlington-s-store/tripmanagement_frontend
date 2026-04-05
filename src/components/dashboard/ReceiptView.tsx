import { useState } from "react";
import { Download, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Booking } from "@/services/bookings";
import { Receipt, receiptsService } from "@/services/receipts";
import { toast } from "sonner";

interface ReceiptViewProps {
  booking?: Booking;
  receipt?: Receipt;
  onClose: () => void;
}

const ReceiptView = ({ booking, receipt, onClose }: ReceiptViewProps) => {
  const [isPrinting, setIsPrinting] = useState(false);
  
  // Use receipt if provided, otherwise build from booking
  const receiptData = receipt || booking as any;

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      window.print();
      
      // Record print in backend if receipt ID is available
      if (receipt?.id) {
        await receiptsService.recordPrint(receipt.id);
      }
    } catch (error) {
      console.error("Error printing receipt:", error);
      toast.error("Failed to print receipt");
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      // Generate PDF content
      const receiptContent = generateReceiptHTML(receiptData);
      
      // Record download in backend if receipt ID is available
      if (receipt?.id) {
        await receiptsService.recordDownload(receipt.id);
      }
      
      // Create a new window for PDF generation
      const printWindow = window.open("", "", "height=500,width=800");
      if (printWindow) {
        printWindow.document.write(receiptContent);
        printWindow.document.close();
        
        // Use browser's print API to save as PDF
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
      
      toast.success("Receipt downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to download receipt");
    }
  };

  const calculateDuration = () => {
    if (!receiptData.check_in_date || !receiptData.check_out_date) return 0;
    const start = new Date(receiptData.check_in_date).getTime();
    const end = new Date(receiptData.check_out_date).getTime();
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  const duration = calculateDuration();
  const pricePerDay = duration > 0 ? Number(receiptData.total_price) / duration : Number(receiptData.total_price);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:rounded-none">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between print:hidden">
          <h2 className="text-2xl font-bold">Receipt</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-8 print:p-4">
          {/* Receipt Header */}
          <div className="text-center mb-8 pb-8 border-b-2 border-slate-300">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">RECEIPT</h1>
            <p className="text-slate-600">TripEase Ghana</p>
            <p className="text-sm text-slate-500 mt-2">Your Travel Experience Partner</p>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Receipt Details */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-1">Receipt Number</p>
              <p className="text-lg font-bold text-slate-900">{receiptData.id.substring(0, 12).toUpperCase()}</p>

              <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mt-4 mb-1">Receipt Date</p>
              <p className="font-semibold text-slate-900">{new Date(receiptData.created_at).toLocaleDateString()}</p>

              <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mt-4 mb-1">Status</p>
              <p className="font-semibold text-emerald-600 uppercase">{receiptData.status}</p>
            </div>

            {/* Service Details */}
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-1">Service Type</p>
              <p className="text-lg font-bold text-slate-900 capitalize">{receiptData.booking_type}</p>

              <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mt-4 mb-1">Service Name</p>
              <p className="font-semibold text-slate-900">{receiptData.service_name}</p>

              <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mt-4 mb-1">Confirmation</p>
              <p className="font-mono bg-slate-100 px-3 py-2 rounded text-sm font-bold text-slate-900 inline-block">
                REF-{receiptData.id.substring(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Booking Details */}
          <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700 mb-4">Booking Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-700">Check-in / Start Date:</span>
                <span className="font-semibold text-slate-900">
                  {receiptData.check_in_date
                    ? new Date(receiptData.check_in_date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700">Check-out / End Date:</span>
                <span className="font-semibold text-slate-900">
                  {receiptData.check_out_date
                    ? new Date(receiptData.check_out_date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '-'}
                </span>
              </div>
              {duration > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Duration:</span>
                  <span className="font-semibold text-slate-900">{duration} Night{duration !== 1 ? 's' : ''}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-700">Number of Guests:</span>
                <span className="font-semibold text-slate-900">{receiptData.number_of_guests || 1}</span>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="text-sm font-bold uppercase tracking-widest text-blue-900 mb-4">Price Details</h3>
            <div className="space-y-2">
              {duration > 1 && (
                <>
                  <div className="flex justify-between text-slate-700">
                    <span>Price per Night:</span>
                    <span className="font-semibold">GH₵ {pricePerDay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Number of Nights:</span>
                    <span className="font-semibold">× {duration}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-slate-700">
                <span>Taxes & Fees (15%):</span>
                <span className="font-semibold">GH₵ {(Number(receiptData.total_price) * 0.15).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t-2 border-blue-300 pt-2 flex justify-between text-lg font-bold text-blue-900">
                <span>Total Amount:</span>
                <span>GH₵ {Number(receiptData.total_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Special Requests */}
          {receiptData.special_requests && (
            <div className="mb-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-900 mb-2">Special Requests</p>
              <p className="text-slate-700 italic">" {receiptData.special_requests} "</p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t-2 border-slate-300 pt-8 text-center space-y-3">
            <p className="text-sm text-slate-600">Thank you for choosing TripEase Ghana!</p>
            <p className="text-xs text-slate-500">For inquiries, please contact: support@tripease.gh</p>
            <p className="text-xs text-slate-400 mt-4">
              Receipt generated on {new Date().toLocaleString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex gap-3 print:hidden">
          <Button
            onClick={handlePrint}
            disabled={isPrinting}
            className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Printer className="h-4 w-4" />
            {isPrinting ? "Printing..." : "Print Receipt"}
          </Button>
          <Button
            onClick={handleDownloadPDF}
            className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Close
          </Button>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white;
            margin: 0;
            padding: 0;
          }
          .fixed {
            position: static;
            background: white;
          }
        }
      `}</style>
    </div>
  );
};

// Helper function to generate receipt HTML for PDF download
function generateReceiptHTML(booking: Booking): string {
  const duration = booking.check_in_date && booking.check_out_date
    ? Math.ceil(
        (new Date(booking.check_out_date).getTime() - new Date(booking.check_in_date).getTime()) /
        (1000 * 60 * 60 * 24)
      )
    : 0;
  const pricePerDay = duration > 0 ? Number(booking.total_price) / duration : Number(booking.total_price);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Receipt - ${booking.id}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
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
        .details-box h3 {
          font-size: 11px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #333;
          margin-bottom: 15px;
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
        .price-box h3 {
          font-size: 11px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #003399;
          margin-bottom: 15px;
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
            max-width: 100%;
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
            <p>${booking.id.substring(0, 12).toUpperCase()}</p>

            <h3>Receipt Date</h3>
            <p>${new Date(booking.created_at).toLocaleDateString()}</p>

            <h3>Status</h3>
            <p style="color: #10b981; text-transform: uppercase;">${booking.status}</p>
          </div>

          <div class="info-section">
            <h3>Service Type</h3>
            <p>${booking.booking_type.charAt(0).toUpperCase() + booking.booking_type.slice(1)}</p>

            <h3>Service Name</h3>
            <p>${booking.service_name}</p>

            <h3>Confirmation</h3>
            <p style="background: #f0f0f0; padding: 8px 12px; display: inline-block; border-radius: 4px; font-family: monospace;">REF-${booking.id.substring(0, 8).toUpperCase()}</p>
          </div>
        </div>

        <div class="details-box">
          <h3>Booking Details</h3>
          <div class="detail-row">
            <span>Check-in / Start Date:</span>
            <span>${booking.check_in_date ? new Date(booking.check_in_date).toLocaleDateString() : '-'}</span>
          </div>
          <div class="detail-row">
            <span>Check-out / End Date:</span>
            <span>${booking.check_out_date ? new Date(booking.check_out_date).toLocaleDateString() : '-'}</span>
          </div>
          ${duration > 0 ? `<div class="detail-row">
            <span>Duration:</span>
            <span>${duration} Night${duration !== 1 ? 's' : ''}</span>
          </div>` : ''}
          <div class="detail-row">
            <span>Number of Guests:</span>
            <span>${booking.number_of_guests || 1}</span>
          </div>
        </div>

        <div class="price-box">
          <h3>Price Details</h3>
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
            <span>Taxes & Fees (15%):</span>
            <span>GH₵ ${(Number(booking.total_price) * 0.15).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div class="price-total">
            <span>Total Amount:</span>
            <span>GH₵ ${Number(booking.total_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        ${booking.special_requests ? `
        <div style="background: #fffbeb; border: 1px solid #fcd34d; padding: 16px; border-radius: 8px; margin-bottom: 30px;">
          <p style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #92400e; margin-bottom: 8px;">Special Requests</p>
          <p style="font-size: 13px; color: #555; font-style: italic;">"${booking.special_requests}"</p>
        </div>
        ` : ''}

        <div class="footer">
          <p>Thank you for choosing TripEase Ghana!</p>
          <p>For inquiries, please contact: support@tripease.gh</p>
          <p style="margin-top: 20px;">Receipt generated on ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export default ReceiptView;
