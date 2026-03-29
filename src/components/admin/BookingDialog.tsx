import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Booking } from "@/services/admin";
import { Badge } from "@/components/ui/badge";
import { 
    Calendar, 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    CreditCard, 
    Clock, 
    MessageSquare, 
    X, 
    CheckCircle2, 
    AlertCircle,
    Receipt,
    ClipboardList,
    ArrowRight
} from "lucide-react";

interface BookingDialogProps {
    booking: Booking | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdateStatus: (id: string, status: string) => void;
}

const statusColors: Record<string, string> = {
    confirmed: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    pending: "bg-amber-500/10 text-amber-600 border-amber-200",
    cancelled: "bg-rose-500/10 text-rose-600 border-rose-200",
    completed: "bg-blue-500/10 text-blue-600 border-blue-200",
};

const BookingDialog = ({ booking, open, onOpenChange, onUpdateStatus }: BookingDialogProps) => {
    if (!booking) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-transparent border-none shadow-none">
                <div className="bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-[2.5rem] shadow-2xl flex flex-col w-full max-h-[85vh] overflow-hidden">
                    {/* Premium Header */}
                    <div className="px-8 pt-8 pb-4 shrink-0 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-transparent sticky top-0 z-10 flex flex-row justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                                    <div className="p-2.5 bg-indigo-600 text-white flex items-center justify-center rounded-2xl shadow-lg shadow-indigo-500/20">
                                        <ClipboardList className="w-5 h-5" />
                                    </div>
                                    Reservation Detail
                                </h2>
                                <Badge variant="outline" className={`rounded-xl px-3 py-1 font-black uppercase tracking-widest text-[10px] ${statusColors[booking.status]}`}>
                                    {booking.status}
                                </Badge>
                            </div>
                            <p className="text-slate-500 text-sm font-mono flex items-center gap-2">
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">ID: {booking.id}</span>
                                <span className="text-slate-300">•</span>
                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(booking.created_at).toLocaleDateString()}</span>
                            </p>
                        </div>
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => onOpenChange(false)} 
                            className="rounded-full hover:bg-slate-100 transition-colors -mt-2"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Customer & Payment Column */}
                            <div className="space-y-8">
                                <section>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-5">
                                        <User className="h-3.5 w-3.5 text-indigo-500" /> Passenger Information
                                    </h3>
                                    <div className="bg-slate-50/50 border border-slate-100 rounded-[1.5rem] p-5 space-y-4">
                                        <div>
                                            <p className="text-lg font-bold text-slate-900">{booking.customer_name || 'Guest User'}</p>
                                            <p className="text-indigo-600 text-sm font-semibold">{booking.booking_type} • {booking.reference_id}</p>
                                        </div>
                                        <div className="space-y-2 pt-2 border-t border-slate-200/50">
                                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-sm">
                                                    <Mail className="h-3.5 w-3.5" />
                                                </div>
                                                <span className="font-medium">{booking.email || 'No email provided'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-sm">
                                                    <Phone className="h-3.5 w-3.5" />
                                                </div>
                                                <span className="font-medium tracking-wide">{booking.phone || 'No phone provided'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-5">
                                        <Receipt className="h-3.5 w-3.5 text-indigo-500" /> Financial Summary
                                    </h3>
                                    <div className="bg-indigo-600 rounded-[1.5rem] p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                            <CreditCard className="w-20 h-20 rotate-12" />
                                        </div>
                                        <div className="relative z-10">
                                            <p className="text-indigo-100 text-xs font-black uppercase tracking-widest mb-1">Total Transaction Amount</p>
                                            <p className="text-3xl font-black mb-4">GH₵{Number(booking.total_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                            <div className="flex items-center gap-2 bg-white/10 w-fit px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/20">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                                <span className="text-xs font-bold uppercase tracking-wide">Paid via MTN MoMo</span>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Service Details Column */}
                            <div className="space-y-8">
                                <section>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-5">
                                        <MapPin className="h-3.5 w-3.5 text-indigo-500" /> Booking Itinerary
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="p-5 rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
                                            <p className="text-base font-bold text-slate-900 mb-1 leading-snug">{booking.service_name || 'Generic Booking Item'}</p>
                                            <div className="flex items-center gap-2 mb-4">
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{booking.booking_type}</Badge>
                                                <Badge variant="outline" className="rounded-lg text-[10px] font-bold text-slate-400 border-slate-200">REF: {booking.reference_id}</Badge>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                                        <Calendar className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Scheduled Dates</p>
                                                        <p className="text-sm font-bold text-slate-700">
                                                            {new Date(booking.check_in_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            {booking.check_out_date && (
                                                                <>
                                                                    <ArrowRight className="inline w-3 h-3 mx-2 text-slate-300" />
                                                                    {new Date(booking.check_out_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                </>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                                                        <User className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Capacity</p>
                                                        <p className="text-sm font-bold text-slate-700">{booking.number_of_guests} Individual{booking.number_of_guests > 1 ? 's' : ''}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {booking.special_requests && (
                                            <div className="p-5 rounded-[1.5rem] bg-rose-50/50 border border-rose-100/50">
                                                <div className="flex items-center gap-2 mb-2 text-rose-600">
                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Special Requests</span>
                                                </div>
                                                <p className="text-sm text-slate-600 font-medium italic leading-relaxed">
                                                    "{booking.special_requests}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>

                    {/* Premium Sticky Footer */}
                    <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 shrink-0 flex items-center justify-between rounded-b-[2.5rem] z-10 sticky bottom-0">
                        <div className="flex gap-2">
                            {booking.status === 'pending' && (
                                <Button
                                    className="rounded-xl h-11 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[11px] shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2"
                                    onClick={() => {
                                        onUpdateStatus(booking.id, 'confirmed');
                                        onOpenChange(false);
                                    }}
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Validate & Confirm
                                </Button>
                            )}
                            {booking.status !== 'cancelled' && (
                                <Button
                                    variant="outline"
                                    className="rounded-xl h-11 px-6 border-rose-200 text-rose-600 hover:bg-rose-50 font-bold uppercase tracking-widest text-[11px] transition-all flex items-center gap-2"
                                    onClick={() => {
                                        onUpdateStatus(booking.id, 'cancelled');
                                        onOpenChange(false);
                                    }}
                                >
                                    <AlertCircle className="w-4 h-4" />
                                    Void Order
                                </Button>
                            )}
                        </div>
                        <Button 
                            variant="ghost" 
                            onClick={() => onOpenChange(false)}
                            className="rounded-xl h-11 px-6 text-slate-400 font-bold hover:bg-slate-100 transition-all uppercase tracking-widest text-[11px]"
                        >
                            Return to List
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default BookingDialog;
