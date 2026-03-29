import { useState } from "react";
import { 
    X, 
    Copy, 
    Check, 
    Twitter, 
    Facebook, 
    Mail,
    Share2,
    MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ShareDestinationProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    destinationName: string;
    url: string;
}

export const ShareDestination = ({ open, onOpenChange, destinationName, url }: ShareDestinationProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    const shareOptions = [
        {
            name: "WhatsApp",
            icon: MessageCircle,
            color: "bg-green-500 hover:bg-green-600",
            href: `https://wa.me/?text=${encodeURIComponent(`Check out ${destinationName} on Trip Management Ghana: ${url}`)}`
        },
        {
            name: "Twitter",
            icon: Twitter,
            color: "bg-sky-500 hover:bg-sky-600",
            href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`I'm planning a visit to ${destinationName}! Check it out on Trip Management Ghana:`)}&url=${encodeURIComponent(url)}`
        },
        {
            name: "Facebook",
            icon: Facebook,
            color: "bg-blue-600 hover:bg-blue-700",
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        },
        {
            name: "Email",
            icon: Mail,
            color: "bg-gray-700 hover:bg-gray-800",
            href: `mailto:?subject=${encodeURIComponent(`Explore ${destinationName} with me`)}&body=${encodeURIComponent(`Hey, look at this amazing spot in Ghana: ${url}`)}`
        }
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-3xl">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-xl bg-primary/10">
                            <Share2 className="h-5 w-5 text-primary" />
                        </div>
                        <DialogTitle className="text-xl font-bold">Share Destination</DialogTitle>
                    </div>
                    <DialogDescription className="text-muted-foreground">
                        Spread the word about {destinationName} with your friends and family.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-4 gap-4 py-6">
                    {shareOptions.map((option) => (
                        <a 
                            key={option.name}
                            href={option.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className={`h-12 w-12 rounded-2xl ${option.color} text-white flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg shadow-black/5`}>
                                <option.icon className="h-6 w-6" />
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{option.name}</span>
                        </a>
                    ))}
                </div>

                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <div className="grid flex-1 gap-2">
                            <label htmlFor="link" className="sr-only">Link</label>
                            <Input
                                id="link"
                                defaultValue={url}
                                readOnly
                                className="rounded-xl bg-muted/50 border-none transition-all focus-visible:ring-primary"
                            />
                        </div>
                        <Button 
                            type="submit" 
                            size="sm" 
                            className="px-6 rounded-xl shadow-lg shadow-primary/20"
                            onClick={handleCopy}
                        >
                            {copied ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                            <span className="ml-2">{copied ? "Copied" : "Copy"}</span>
                        </Button>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Trip Management Ghana helps promote sustainable tourism in local communities.
                </div>
            </DialogContent>
        </Dialog>
    );
};
