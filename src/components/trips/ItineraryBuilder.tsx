import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";

export interface ItineraryDay {
  dayNumber: number;
  activities: string;
  notes: string;
}

interface ItineraryBuilderProps {
  days: ItineraryDay[];
  onAddDay: () => void;
  onUpdateDay: (dayNumber: number, activities: string, notes: string) => void;
  onRemoveDay: (dayNumber: number) => void;
}

export function ItineraryBuilder({
  days,
  onAddDay,
  onUpdateDay,
  onRemoveDay,
}: ItineraryBuilderProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Daily Itinerary</h3>
        <Button onClick={onAddDay} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Day
        </Button>
      </div>

      <div className="space-y-3">
        {days.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No days added yet. Click "Add Day" to start planning.
            </CardContent>
          </Card>
        ) : (
          days.map((day) => (
            <Card key={day.dayNumber} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">
                      Day {day.dayNumber}
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveDay(day.dayNumber)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Activities</label>
                  <Input
                    placeholder="e.g., Visit Elmina Castle, Explore Cape Coast, Beach lunch..."
                    value={day.activities}
                    onChange={(e) => onUpdateDay(day.dayNumber, e.target.value, day.notes)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <Textarea
                    placeholder="Additional notes or details about this day..."
                    value={day.notes}
                    onChange={(e) => onUpdateDay(day.dayNumber, day.activities, e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
