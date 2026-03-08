import { useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";

const Contact = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            toast.success("Message sent successfully! We will get back to you soon.");
            (e.target as HTMLFormElement).reset();
        }, 1500);
    };

    return (
        <Layout>
            <section className="bg-gradient-primary py-16 text-primary-foreground">
                <div className="container text-center">
                    <h1 className="mb-4 font-display text-4xl font-bold md:text-5xl">Contact Us</h1>
                    <p className="mx-auto max-w-2xl text-lg text-primary-foreground/90">
                        Have questions or need help? Our team is here for you. Drop us a message and we'll respond as soon as possible.
                    </p>
                </div>
            </section>

            <section className="py-20">
                <div className="container">
                    <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2">
                        {/* Contact Information */}
                        <div>
                            <h2 className="mb-6 font-display text-3xl font-bold">Get in Touch</h2>
                            <p className="mb-8 text-muted-foreground">
                                Whether you're planning a trip, looking to become a partner, or experiencing technical issues, we're ready to assist.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                        <MapPin className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-lg font-bold">Office Address</h3>
                                        <p className="text-muted-foreground">12 Independence Avenue<br />Ridge, Accra<br />Ghana</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                        <Phone className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-lg font-bold">Phone</h3>
                                        <p className="text-muted-foreground">+233 20 123 4567<br />Mon-Fri 8am-6pm GMT</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                        <Mail className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-lg font-bold">Email</h3>
                                        <p className="text-muted-foreground">support@tripease.gh<br />partners@tripease.gh</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="rounded-2xl border border-border bg-card p-8 shadow-primary-md">
                            <h3 className="mb-6 font-display text-2xl font-bold">Send a Message</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label htmlFor="firstName" className="text-sm font-medium leading-none">First Name</label>
                                        <Input id="firstName" required placeholder="Kwame" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="lastName" className="text-sm font-medium leading-none">Last Name</label>
                                        <Input id="lastName" required placeholder="Mensah" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium leading-none">Email</label>
                                    <Input id="email" type="email" required placeholder="kwame@example.com" />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="subject" className="text-sm font-medium leading-none">Subject</label>
                                    <Input id="subject" required placeholder="How can we help?" />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium leading-none">Message</label>
                                    <Textarea id="message" required placeholder="Provide details here..." className="min-h-[120px]" />
                                </div>

                                <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                                    <Send className="h-4 w-4" />
                                    {isSubmitting ? "Sending..." : "Send Message"}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default Contact;
