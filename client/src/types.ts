export type UserRole = "donor" | "volunteer";

export type DonationStatus =
  | "PENDING"
  | "ASSIGNED"
  | "PICKED_UP"
  | "DELIVERED"
  | "CANCELLED";
export type FoodCategory =
  | "Cooked Meals"
  | "Groceries"
  | "Bakery"
  | "Fruits"
  | "Mixed";

export type DonationItem = {
  name: string;
  quantity: number;
  unit: "packs" | "kg" | "plates" | "boxes";
};

export type Location = {
  label: string;
  address: string;
  lat: number;
  lng: number;
};

export type Donation = {
  id: string;
  donorName: string;
  donorPhoneMasked: string;
  createdAt: string;
  pickupBy: string;
  status: DonationStatus;
  category: FoodCategory;
  servingsEstimate: number;
  items: DonationItem[];
  pickupLocation: Location;
  notes?: string;
  dietaryTags?: string[];
  assignedVolunteer?: { id: string; name: string; phoneMasked: string };
};

export type TaskStep = "READY" | "STARTED" | "PICKED_UP" | "DELIVERED";

export type Task = {
  id: string;
  donationId: string;
  volunteerId: string;
  step: TaskStep;
  checklist: {
    sealed: boolean;
    labelled: boolean;
    noLeak: boolean;
    onTime: boolean;
    note?: string;
  };
  updatedAt: string;
};

export type Role = "DONOR" | "VOLUNTEER";

export type BaseUser = {
  id: string;
  role: Role;
  username: string;
  createdAt: string;
};

export type DonorProfile = {
  fullName: string;
  phone: string;
  organization?: string;

  // safer than full Aadhaar
  aadhaarLast4?: string;
  aadhaarConsent: boolean;

  // demo upload fields (store as data URLs in mock)
  idFrontImage?: string; // base64/dataUrl
  idBackImage?: string; // base64/dataUrl
};

export type VolunteerProfile = {
  fullName: string;
  phone: string;
  city?: string;
  hasVehicle?: boolean;
};

export type User =
  | (BaseUser & { role: "DONOR"; donor: DonorProfile })
  | (BaseUser & { role: "VOLUNTEER"; volunteer: VolunteerProfile });

export type AuthSession = {
  token: string;
  userId: string;
};
