
import React, { useState, useEffect } from 'react';
import { Citizen } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface CitizenFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (citizen: Omit<Citizen, 'id'> | Citizen) => void;
  citizenToEdit?: Citizen | null;
}

const initialFormState: Omit<Citizen, 'id'> = {
  nik: '',
  kkNumber: '',
  fullName: '',
  placeOfBirth: '',
  dateOfBirth: '',
  gender: 'Laki-laki',
  kampung: '',
  rt: '',
  rw: '',
  dusun: '',
  desa: '',
  religion: 'Islam',
  maritalStatus: 'Belum Kawin',
  occupation: '',
  citizenship: 'WNI',
};

export const CitizenFormModal: React.FC<CitizenFormModalProps> = ({ isOpen, onClose, onSave, citizenToEdit }) => {
  const [formData, setFormData] = useState<Omit<Citizen, 'id'> | Citizen>(initialFormState);

  useEffect(() => {
    if (citizenToEdit) {
      setFormData(citizenToEdit);
    } else {
      setFormData(initialFormState);
    }
  }, [citizenToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">{citizenToEdit ? 'Edit Data Warga' : 'Tambah Warga Baru'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NIK */}
            <div>
              <label htmlFor="nik" className="block text-sm font-medium text-gray-700 mb-1">NIK</label>
              <input type="text" name="nik" id="nik" value={formData.nik} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500" />
            </div>
            {/* KK Number */}
            <div>
              <label htmlFor="kkNumber" className="block text-sm font-medium text-gray-700 mb-1">No. Kartu Keluarga</label>
              <input type="text" name="kkNumber" id="kkNumber" value={formData.kkNumber} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500" />
            </div>
            {/* Full Name */}
            <div className="md:col-span-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500" />
            </div>
            {/* Place of Birth */}
            <div>
              <label htmlFor="placeOfBirth" className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
              <input type="text" name="placeOfBirth" id="placeOfBirth" value={formData.placeOfBirth} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500" />
            </div>
            {/* Date of Birth */}
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
              <input type="date" name="dateOfBirth" id="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500" />
            </div>
            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
              <select name="gender" id="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500">
                <option>Laki-laki</option>
                <option>Perempuan</option>
              </select>
            </div>
            {/* Religion */}
            <div>
              <label htmlFor="religion" className="block text-sm font-medium text-gray-700 mb-1">Agama</label>
              <select name="religion" id="religion" value={formData.religion} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500">
                <option>Islam</option>
                <option>Kristen</option>
                <option>Katolik</option>
                <option>Hindu</option>
                <option>Buddha</option>
                <option>Khonghucu</option>
              </select>
            </div>
            
            {/* Alamat Section */}
            <div className="md:col-span-2 mt-4 pt-4 border-t">
                 <p className="text-lg font-semibold text-gray-800 mb-2">Detail Alamat</p>
            </div>

            {/* Kampung */}
            <div className="md:col-span-2">
              <label htmlFor="kampung" className="block text-sm font-medium text-gray-700 mb-1">Nama Kampung</label>
              <input type="text" name="kampung" id="kampung" value={formData.kampung} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500" />
            </div>
            {/* RT */}
            <div>
                <label htmlFor="rt" className="block text-sm font-medium text-gray-700 mb-1">RT</label>
                <input type="text" name="rt" id="rt" value={formData.rt} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500" placeholder="Contoh: 001" />
            </div>
            {/* RW */}
            <div>
                <label htmlFor="rw" className="block text-sm font-medium text-gray-700 mb-1">RW</label>
                <input type="text" name="rw" id="rw" value={formData.rw} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500" placeholder="Contoh: 005" />
            </div>
            {/* Dusun */}
            <div>
                <label htmlFor="dusun" className="block text-sm font-medium text-gray-700 mb-1">Dusun</label>
                <input type="text" name="dusun" id="dusun" value={formData.dusun} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500" />
            </div>
             {/* Desa */}
             <div>
                <label htmlFor="desa" className="block text-sm font-medium text-gray-700 mb-1">Desa</label>
                <input type="text" name="desa" id="desa" value={formData.desa} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500" />
            </div>

             <div className="md:col-span-2 mt-4 pt-4 border-t"></div>

            {/* Marital Status */}
            <div>
              <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700 mb-1">Status Perkawinan</label>
              <select name="maritalStatus" id="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500">
                <option>Belum Kawin</option>
                <option>Kawin</option>
                <option>Cerai Hidup</option>
                <option>Cerai Mati</option>
              </select>
            </div>
            {/* Occupation */}
            <div>
              <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">Pekerjaan</label>
              <input type="text" name="occupation" id="occupation" value={formData.occupation} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500" />
            </div>
             {/* Citizenship */}
             <div className="md:col-span-2">
              <label htmlFor="citizenship" className="block text-sm font-medium text-gray-700 mb-1">Kewarganegaraan</label>
              <select name="citizenship" id="citizenship" value={formData.citizenship} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500">
                <option>WNI</option>
                <option>WNA</option>
              </select>
            </div>
          </div>
          <div className="p-6 border-t flex justify-end gap-3 sticky bottom-0 bg-gray-50 z-10">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">Batal</button>
            <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 transition-colors shadow-sm">Simpan Data</button>
          </div>
        </form>
      </div>
    </div>
  );
};