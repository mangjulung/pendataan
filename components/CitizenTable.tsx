
import React from 'react';
import { Citizen } from '../types';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';

interface CitizenTableProps {
  citizens: Citizen[];
  onEdit: (citizen: Citizen) => void;
  onDelete: (id: string) => void;
}

export const CitizenTable: React.FC<CitizenTableProps> = ({ citizens, onEdit, onDelete }) => {

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIK</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Kelamin</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tempat, Tanggal Lahir</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alamat</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {citizens.length > 0 ? (
              citizens.map((citizen) => {
                const fullAddress = `Kp. ${citizen.kampung}, RT ${citizen.rt}/${citizen.rw}, ${citizen.dusun}, Desa ${citizen.desa}`;
                return (
                <tr key={citizen.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{citizen.fullName}</div>
                    <div className="text-sm text-gray-500">{citizen.occupation}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{citizen.nik}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{citizen.gender}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{citizen.placeOfBirth}, {formatDate(citizen.dateOfBirth)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={fullAddress}>{fullAddress}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center gap-4">
                      <button onClick={() => onEdit(citizen)} className="text-brand-600 hover:text-brand-900 transition-colors" aria-label={`Edit ${citizen.fullName}`}>
                        <EditIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => onDelete(citizen.id)} className="text-red-600 hover:text-red-900 transition-colors" aria-label={`Delete ${citizen.fullName}`}>
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )})
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <p className="text-lg">Data tidak ditemukan.</p>
                  <p className="text-sm">Silakan tambahkan data warga baru atau generate data menggunakan AI.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};