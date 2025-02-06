export interface PhoneVendorService {
  buyNumbers: (count: number, region: string) => Promise<any[]>;
}
