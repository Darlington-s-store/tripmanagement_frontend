import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-foreground text-background">
    <div className="container py-12">
      <div className="grid gap-8 md:grid-cols-4">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <MapPin className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">
              TripEase Ghana
            </span>
          </div>
          <p className="text-sm opacity-70">
            Your one-stop platform for discovering and booking travel experiences across Ghana.
          </p>
          <div className="mt-4 flex gap-3">
            <a href="#" className="rounded-full bg-background/10 p-2 transition-colors hover:bg-primary">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="#" className="rounded-full bg-background/10 p-2 transition-colors hover:bg-primary">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="#" className="rounded-full bg-background/10 p-2 transition-colors hover:bg-primary">
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-display font-semibold">Explore</h4>
          <ul className="space-y-2 text-sm opacity-70">
            <li><Link to="/hotels" className="hover:text-primary">Hotels</Link></li>
            <li><Link to="/attractions" className="hover:text-primary">Attractions</Link></li>
            <li><Link to="/guides" className="hover:text-primary">Tour Guides</Link></li>
            <li><Link to="/transport" className="hover:text-primary">Transport</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-display font-semibold">Company</h4>
          <ul className="space-y-2 text-sm opacity-70">
            <li><Link to="/about" className="hover:text-primary">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
            <li><Link to="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-primary">Terms of Service</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-display font-semibold">Contact</h4>
          <ul className="space-y-2 text-sm opacity-70">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +233 20 123 4567</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@tripease.gh</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Accra, Ghana</li>
          </ul>
        </div>
      </div>

      <div className="mt-8 border-t border-background/10 pt-6 text-center text-sm opacity-50">
        &copy; {new Date().getFullYear()} TripEase Ghana. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
