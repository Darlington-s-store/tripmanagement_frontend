import { Hotel } from "@/services/hotels";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HotelCardProps {
  hotel: Hotel;
}

export function HotelCard({ hotel }: HotelCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {hotel.image_url && (
        <div className="w-full h-48 bg-muted overflow-hidden">
          <img
            src={hotel.image_url}
            alt={hotel.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg">{hotel.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="w-4 h-4" />
              {hotel.location}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold">{Number(hotel.rating).toFixed(1)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {hotel.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{hotel.description}</p>
        )}

        {hotel.amenities && (
          <div className="flex flex-wrap gap-1">
            {hotel.amenities.split(",").slice(0, 3).map((amenity, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {amenity.trim()}
              </Badge>
            ))}
          </div>
        )}

        <div className="pt-2 border-t">
          <p className="text-2xl font-bold mb-3">
            GH₵ {Number(hotel.price_per_night).toFixed(2)}
            <span className="text-sm text-muted-foreground font-normal">/night</span>
          </p>
          <Button
            onClick={() => navigate(`/hotels/${hotel.id}`)}
            className="w-full"
          >
            View Details & Book
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
