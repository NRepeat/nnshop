export interface SelectedDepartment {
  id: string;
  shortName: string;
  addressParts?: {
    city?: string;
    street?: string;
    building?: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface NovaPoshtaButtonProps {
  onDepartmentSelect?: (department: SelectedDepartment) => void;
  className?: string;
  initialText?: string;
  initialDescription?: string;
}

export interface NovaPoshtaMessageData {
  placeName: string;
  latitude: string;
  longitude: string;
  domain: string;
  id: string | null;
  [key: string]: any;
}
