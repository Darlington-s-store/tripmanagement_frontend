import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Booking } from "@/services/admin";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Mail, Phone, MapPin, CreditCard, Clock, MessageSquare } from "lucide-react";

interface BookingDialogProps {
    booking: Booking | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdateStatus: (id: string, status: string) => void;
}

const statusColors: Record<string, string> = {
    confirmed: "bg-success/10 text-success",
    pending: "bg-warning/10 text-warning",
    cancelled: "bg-destructive/10 text-destructive",
    completed: "bg-info/10 text-info",
};

const BookingDialog = ({ booking, open, onOpenChange, onUpdateStatus }: BookingDialogProps) => {
    if (!booking) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold font-display">Booking Details</DialogTitle>
                        <Badge className={statusColors[booking.status]}>{booking.status}</Badge>
                    </div>
                    <DialogDescription className="font-mono">ID: {booking.id}</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    {/* Customer Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <User className="h-4 w-4" /> Customer Information
                        </h3>
                        <div className="space-y-2">
                            <p className="font-medium text-lg">{booking.customer_name || 'Guest User'}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" /> {booking.email || 'No email provided'}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4" /> {booking.phone || 'No phone provided'}
                            </div>
                        </div>

                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 pt-2">
                            <CreditCard className="h-4 w-4" /> Payment Details
                        </h3>
                        <div className="bg-muted/50 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-muted-foreground">Total Price</span>
                                <span className="font-bold text-primary text-lg">GH₵{Number(booking.total_price).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Status</span>
                                <span className="text-sm font-medium">Paid via Mobile Money</span>
                            </div>
                        </div>
                    </div>

                    {/* Service Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <MapPin className="h-4 w-4" /> Trip Details
                        </h3>
                        <div className="space-y-2">
                            <p className="font-medium text-lg">{booking.service_name || 'Booking Reference'}</p>
                            <Badge variant="outline" className="capitalize">{booking.booking_type}</Badge>

                            <div className="grid grid-cols-1 gap-2 mt-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        {new Date(booking.check_in_date).toLocaleDateString()}
                                        {booking.check_out_date && ` - ${new Date(booking.check_out_date).toLocaleDateString()}`}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <User className="h-4 w-4" /> {booking.number_of_guests} Guest{booking.number_of_guests > 1 ? 's' : ''}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" /> Booked on {new Date(booking.created_at).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {booking.special_requests && (
                            <div className="mt-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-2">
                                    <MessageSquare className="h-4 w-4" /> Special Requests
                                </h3>
                                <p className="text-sm bg-warning/5 border border-warning/10 rounded-lg p-3 text-muted-foreground italic">
                                    "{booking.special_requests}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="flex sm:justify-between items-center border-t pt-4">
                    <div className="flex gap-2">
                        {booking.status === 'pending' && (
                            <Button
                                className="bg-success hover:bg-success/90 text-white"
                                onClick={() => {
                                    onUpdateStatus(booking.id, 'confirmed');
                                    onOpenChange(false);
                                }}
                            >
                                Confirm Booking
                            </Button>
                        )}
                        {booking.status !== 'cancelled' && (
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    onUpdateStatus(booking.id, 'cancelled');
                                    onOpenChange(false);
                                }}
                            >
                                Cancel Booking
                            </Button>
                        )}
                    </div>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default BookingDialog;
