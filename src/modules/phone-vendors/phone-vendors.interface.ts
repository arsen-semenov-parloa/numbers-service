export interface PhoneVendorService {
  buyNumbers: (
    count: number,
    region: string,
    customerId: string,
  ) => Promise<any[]>;
}
