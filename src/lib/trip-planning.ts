export interface TripPlanningDetails {
  mainTransport?: {
    mode?: string;
    provider?: string;
    reference?: string;
    notes?: string;
  };
  preferences?: {
    travelStyle?: string;
    accommodationPreference?: string;
  };
  interests?: string[];
  wishlist?: {
    sideAttractions?: string;
    accommodation?: string;
    transport?: string;
  };
}

export interface NormalizedTripPlanning {
  summary: string;
  transit: {
    mode?: string;
    provider?: string;
    ref?: string;
    notes?: string;
  };
  preferences: {
    style?: string;
    stay?: string;
  };
  interests: string[];
  wishlist: {
    attractions?: string;
    hotels?: string;
    transport?: string;
  };
  extra: string[];
}

function parsePipeFields(line: string) {
  return line
    .split("|")
    .map((part) => part.trim())
    .reduce<Record<string, string>>((accumulator, part) => {
      const [key, ...rest] = part.split(":");

      if (rest.length === 0) return accumulator;

      accumulator[key.trim().toLowerCase()] = rest.join(":").trim();
      return accumulator;
    }, {});
}

export function parseLegacyTripDescription(description?: string): NormalizedTripPlanning {
  const result: NormalizedTripPlanning = {
    summary: "",
    transit: {},
    preferences: {},
    interests: [],
    wishlist: {},
    extra: [],
  };

  if (!description) return result;

  const lines = description
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (line === "--- PRIMARY TRANSIT ---" || line === "--- TRIP PREFERENCES ---") {
      continue;
    }

    if (line.startsWith("Mode:")) {
      const fields = parsePipeFields(line);
      result.transit = {
        mode: fields.mode,
        provider: fields.provider,
        ref: fields.ref,
      };
      continue;
    }

    if (line.startsWith("Style:")) {
      const fields = parsePipeFields(line);
      result.preferences = {
        style: fields.style,
        stay: fields.stay,
      };
      continue;
    }

    if (line.startsWith("Interests:")) {
      result.interests = line
        .replace("Interests:", "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      continue;
    }

    if (line.startsWith("Attractions Wishlist:")) {
      result.wishlist.attractions = line.replace("Attractions Wishlist:", "").trim();
      continue;
    }

    if (line.startsWith("Hotel Wishlist:")) {
      result.wishlist.hotels = line.replace("Hotel Wishlist:", "").trim();
      continue;
    }

    if (line.startsWith("Transport Wishlist:")) {
      result.wishlist.transport = line.replace("Transport Wishlist:", "").trim();
      continue;
    }

    if (!result.summary) {
      result.summary = line;
    } else {
      result.extra.push(line);
    }
  }

  return result;
}

export function hasTripPlanningDetails(details?: TripPlanningDetails | null) {
  return Boolean(
    details &&
      (
        details.mainTransport?.mode ||
        details.mainTransport?.provider ||
        details.mainTransport?.reference ||
        details.mainTransport?.notes ||
        details.preferences?.travelStyle ||
        details.preferences?.accommodationPreference ||
        (Array.isArray(details.interests) && details.interests.length > 0) ||
        details.wishlist?.sideAttractions ||
        details.wishlist?.accommodation ||
        details.wishlist?.transport
      )
  );
}

export function normalizeTripPlanning(
  details?: TripPlanningDetails | null,
  description?: string
): NormalizedTripPlanning {
  const legacy = parseLegacyTripDescription(description);

  if (!hasTripPlanningDetails(details)) {
    return legacy;
  }

  return {
    summary: description?.trim() || legacy.summary,
    transit: {
      mode: details?.mainTransport?.mode || legacy.transit.mode,
      provider: details?.mainTransport?.provider || legacy.transit.provider,
      ref: details?.mainTransport?.reference || legacy.transit.ref,
      notes: details?.mainTransport?.notes || legacy.transit.notes,
    },
    preferences: {
      style: details?.preferences?.travelStyle || legacy.preferences.style,
      stay: details?.preferences?.accommodationPreference || legacy.preferences.stay,
    },
    interests:
      Array.isArray(details?.interests) && details!.interests!.length > 0
        ? details!.interests!.map((item) => item.trim()).filter(Boolean)
        : legacy.interests,
    wishlist: {
      attractions: details?.wishlist?.sideAttractions || legacy.wishlist.attractions,
      hotels: details?.wishlist?.accommodation || legacy.wishlist.hotels,
      transport: details?.wishlist?.transport || legacy.wishlist.transport,
    },
    extra: legacy.extra,
  };
}
