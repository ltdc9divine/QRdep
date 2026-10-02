export interface Bank {
  code: string;
  name: string;
  shortName: string;
  logo: string;
  bin: string;
}

export interface QRFormData {
  bankCode: string;
  accountNumber: string;
  accountName: string;
  templateId: string;
}