
export interface Citizen {
  id: string;
  nik: string;
  kkNumber: string;
  fullName: string;
  placeOfBirth: string;
  dateOfBirth: string; // YYYY-MM-DD format
  gender: 'Laki-laki' | 'Perempuan';
  kampung: string;
  rt: string;
  rw: string;
  dusun: string;
  desa: string;
  religion: string;
  maritalStatus: 'Belum Kawin' | 'Kawin' | 'Cerai Hidup' | 'Cerai Mati';
  occupation: string;
  citizenship: 'WNI' | 'WNA';
}