import React, { useState, useMemo } from 'react';
import { Citizen } from './types';
import { useCitizens } from './hooks/useCitizens';
import { CitizenFormModal } from './components/CitizenFormModal';
import { CitizenTable } from './components/CitizenTable';
import { UserGroupIcon } from './components/icons/UserGroupIcon';
import { PlusIcon } from './components/icons/PlusIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';

function App() {
  const { citizens, addCitizen, updateCitizen, deleteCitizen, generateAndAddCitizens, isLoading, error } = useCitizens();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [citizenToEdit, setCitizenToEdit] = useState<Citizen | null>(null);
  
  // State for filtering and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('Semua');
  const [filterMaritalStatus, setFilterMaritalStatus] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleAddNew = () => {
    setCitizenToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (citizen: Citizen) => {
    setCitizenToEdit(citizen);
    setIsModalOpen(true);
  };
  
  const handleGenerateData = () => {
    const count = parseInt(prompt("Berapa banyak data warga yang ingin Anda generate (maks 10)?", "3") || "0", 10);
    if(count > 0 && count <= 10) {
        generateAndAddCitizens(count);
    } else if (count > 10) {
        alert("Harap masukkan angka antara 1 dan 10.");
    }
  }

  const handleSave = (citizenData: Omit<Citizen, 'id'> | Citizen) => {
    if ('id' in citizenData) {
      updateCitizen(citizenData);
    } else {
      addCitizen(citizenData);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterGender('Semua');
    setFilterMaritalStatus('Semua');
    setCurrentPage(1);
  };

  const filteredCitizens = useMemo(() => {
    const lowerCaseSearch = searchTerm.toLowerCase();
    return citizens.filter(c => {
      const fullAddress = `${c.kampung} ${c.rt} ${c.rw} ${c.dusun} ${c.desa}`.toLowerCase();
      return (
        (c.fullName.toLowerCase().includes(lowerCaseSearch) ||
        c.nik.includes(searchTerm) || // NIK is a string of numbers, case doesn't matter
        fullAddress.includes(lowerCaseSearch)) &&
        (filterGender === 'Semua' || c.gender === filterGender) &&
        (filterMaritalStatus === 'Semua' || c.maritalStatus === filterMaritalStatus)
      );
    });
  }, [citizens, searchTerm, filterGender, filterMaritalStatus]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCitizens.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCitizens = filteredCitizens.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }
    } else {
        pageNumbers.push(1);
        if (currentPage > 4) {
            pageNumbers.push('...');
        }
        const startPage = Math.max(2, currentPage - 2);
        const endPage = Math.min(totalPages - 1, currentPage + 2);
        for (let i = startPage; i <= endPage; i++) {
            if(i > 1 && i < totalPages){
                pageNumbers.push(i);
            }
        }
        if (currentPage < totalPages - 3) {
            pageNumbers.push('...');
        }
        pageNumbers.push(totalPages);
    }

    return pageNumbers.map((page, index) =>
      page === '...' ? (
        <span key={index} className="px-4 py-2 text-gray-500">...</span>
      ) : (
        <button
          key={index}
          onClick={() => handlePageChange(page as number)}
          className={`px-4 py-2 rounded-md transition-colors ${
            currentPage === page
              ? 'bg-brand-600 text-white shadow'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          aria-current={currentPage === page ? 'page' : undefined}
        >
          {page}
        </button>
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <UserGroupIcon className="w-10 h-10 text-brand-600" />
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Manajemen Data Warga
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Aplikasi untuk mengelola data warga secara efisien. Data disimpan secara permanen di database.
          </p>
        </header>

        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6" role="alert">
                <p className="font-bold">Terjadi Kesalahan</p>
                <p>{error}</p>
            </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Cari (Nama, NIK, Alamat)..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full lg:col-span-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500"
            />
            <select
              value={filterGender}
              onChange={e => { setFilterGender(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="Semua">Semua Jenis Kelamin</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
            <select
              value={filterMaritalStatus}
              onChange={e => { setFilterMaritalStatus(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="Semua">Semua Status Kawin</option>
              <option value="Belum Kawin">Belum Kawin</option>
              <option value="Kawin">Kawin</option>
              <option value="Cerai Hidup">Cerai Hidup</option>
              <option value="Cerai Mati">Cerai Mati</option>
            </select>
          </div>
           <div className="flex flex-wrap justify-between items-center mt-4 gap-4">
             <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Reset Filter
            </button>
             <div className="flex items-center gap-4">
              <button
                onClick={handleGenerateData}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition-colors disabled:bg-purple-300 disabled:cursor-not-allowed"
              >
                 {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <SparklesIcon className="w-5 h-5" />
                )}
                <span>Generate Data AI</span>
              </button>
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white font-semibold rounded-lg shadow-md hover:bg-brand-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Tambah Warga</span>
              </button>
            </div>
          </div>
        </div>
        
        {isLoading && citizens.length === 0 ? (
           <div className="flex flex-col justify-center items-center text-center py-20 bg-white rounded-lg shadow-md">
                <svg className="animate-spin h-12 w-12 text-brand-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-xl font-semibold text-gray-700">Memuat data warga...</p>
                <p className="text-gray-500">Mohon tunggu sebentar.</p>
           </div>
        ) : (
           <>
              <CitizenTable citizens={paginatedCitizens} onEdit={handleEdit} onDelete={deleteCitizen} />

              {totalPages > 1 && (
                <div className="mt-6 flex justify-center items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-md bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
                    aria-label="Go to Previous Page"
                  >
                    Sebelumnya
                  </button>
                  {renderPageNumbers()}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-md bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
                    aria-label="Go to Next Page"
                  >
                    Selanjutnya
                  </button>
                </div>
              )}
            </>
        )}

      </main>

      <CitizenFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        citizenToEdit={citizenToEdit}
      />
    </div>
  );
}

export default App;
