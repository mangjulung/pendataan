
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

  // Check if the AI functionality can be enabled
  const isAIAvailable = !!process.env.API_KEY;

  const handleAddNew = () => {
    setCitizenToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (citizen: Citizen) => {
    setCitizenToEdit(citizen);
    setIsModalOpen(true);
  };
  
  const handleGenerateData = () => {
    if (!isAIAvailable) return;
    const count = parseInt(prompt("Berapa banyak data warga yang ingin Anda generate (maks 10)?", "3") || "0", 10);
    if(count > 0 && count <= 10) {
        generateAndAddCitizens(count);
    } else {
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
        const startPage = Math.max(2, currentPage - 1);
        const endPage = Math.min(totalPages - 1, currentPage + 1);
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        if (currentPage < totalPages - 3) {
            pageNumbers.push('...');
        }
        pageNumbers.push(totalPages);
    }
    
    const uniquePageNumbers = [...new Set(pageNumbers)];

    return uniquePageNumbers.map((page, index) =>
        typeof page === 'number' ? (
        <button
            key={index}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            page === currentPage
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
            {page}
        </button>
        ) : (
        <span key={index} className="px-3 py-1 text-gray-500">
            {page}
        </span>
        )
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 text-gray-800">
        <header className="bg-white shadow-sm sticky top-0 z-40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <UserGroupIcon className="h-8 w-8 text-brand-600"/>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Manajemen Data Warga</h1>
                </div>
            </div>
        </header>

        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-6">
                 <div className="flex flex-col xl:flex-row justify-between items-center gap-4">
                    <div className="w-full flex-grow flex flex-col sm:flex-row flex-wrap items-center gap-3">
                         <input
                            type="text"
                            placeholder="Cari (nama, NIK, alamat)..."
                            value={searchTerm}
                            onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                            className="w-full sm:w-auto flex-grow px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500"
                        />
                         <select value={filterGender} onChange={(e) => {setFilterGender(e.target.value); setCurrentPage(1);}} className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 bg-white">
                            <option value="Semua">Semua Jenis Kelamin</option>
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                         </select>
                         <select value={filterMaritalStatus} onChange={(e) => {setFilterMaritalStatus(e.target.value); setCurrentPage(1);}} className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 bg-white">
                            <option value="Semua">Semua Status</option>
                            <option value="Belum Kawin">Belum Kawin</option>
                            <option value="Kawin">Kawin</option>
                            <option value="Cerai Hidup">Cerai Hidup</option>
                            <option value="Cerai Mati">Cerai Mati</option>
                         </select>
                         <button onClick={handleResetFilters} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors border border-gray-300">Reset</button>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                         <div className="relative" title={!isAIAvailable ? "Fungsi AI tidak tersedia. Mohon konfigurasikan API_KEY." : "Generate data contoh menggunakan AI"}>
                            <button 
                                onClick={handleGenerateData} 
                                disabled={isLoading || !isAIAvailable} 
                                className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-md transition-colors shadow-sm ${
                                    !isAIAvailable 
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                        : 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed'
                                }`}
                            >
                                {isLoading ? <div className="w-5 h-5 border-2 border-yellow-900 border-t-transparent rounded-full animate-spin"></div> : <SparklesIcon className="w-5 h-5"/>}
                                <span>{isLoading ? 'Memproses...' : 'Generate (AI)'}</span>
                            </button>
                         </div>
                        <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white font-semibold rounded-md hover:bg-brand-700 transition-colors shadow-sm">
                            <PlusIcon className="w-5 h-5"/>
                            <span>Tambah Warga</span>
                        </button>
                    </div>
                </div>
                {error && <div className="mt-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded-md">{error}</div>}
                 <div className="mt-4 text-sm text-gray-500">
                    <p>Total <span className="font-semibold">{citizens.length}</span> warga. Data disimpan secara lokal di browser dan akan hilang saat halaman dimuat ulang.</p>
                </div>
            </div>

            <CitizenTable citizens={paginatedCitizens} onEdit={handleEdit} onDelete={deleteCitizen} />

            {totalPages > 0 && (
                 <div className="mt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
                    <div className="mb-2 md:mb-0">
                        Menampilkan <span className="font-semibold">{paginatedCitizens.length > 0 ? startIndex + 1 : 0}</span>-<span className="font-semibold">{startIndex + paginatedCitizens.length}</span> dari <span className="font-semibold">{filteredCitizens.length}</span> hasil
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 rounded-md border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                Sebelumnya
                            </button>
                            <div className="hidden sm:flex items-center gap-2">{renderPageNumbers()}</div>
                             <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 rounded-md border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                Berikutnya
                            </button>
                        </div>
                    )}
                 </div>
            )}
        </main>
      </div>

      <CitizenFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        citizenToEdit={citizenToEdit}
      />
    </>
  );
}

export default App;
