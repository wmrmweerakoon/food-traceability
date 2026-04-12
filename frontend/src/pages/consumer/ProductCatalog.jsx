import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { consumerAPI } from '../../api/consumer';
import { 
  ShoppingBag, 
  Search, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  ShieldCheck, 
  Filter, 
  ArrowUpRight,
  TrendingUp,
  Loader2,
  Package,
  BadgeCheck
} from 'lucide-react';

function ProductCatalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await consumerAPI.getAllProducts({ category: filter === 'all' ? '' : filter });
        if (response.success) {
          setProducts(response.data);
        } else {
          setError('Failed to load product catalog.');
        }
      } catch (err) {
        console.error('Error fetching catalog:', err);
        setError('An error occurred while connecting to the marketplace.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filter]);

  const filteredProducts = products.filter(p => 
    p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.store?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = ['all', 'Vegetables', 'Fruits', 'Dairy', 'Grains', 'Groceries'];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Accessing Marketplace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-['Outfit',sans-serif] pb-24">
      {/* 🚀 Header / Hero Section */}
      <div className="bg-white border-b border-slate-200 pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-emerald-600 px-3 py-1 rounded-full flex items-center">
                  <ShoppingBag className="w-3 h-3 text-white mr-2" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Global Marketplace</span>
                </div>
                <div className="bg-slate-100 px-3 py-1 rounded-full flex items-center border border-slate-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 mr-2" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">100% Traceable</span>
                </div>
              </div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight mb-6">
                Verified Freshness, <br />
                <span className="text-emerald-600">Directly From Origin.</span>
              </h1>
              <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-lg">
                Browse our curated selection of verified products. Every item carries a 
                digital passport ensuring its authenticity and quality.
              </p>
            </div>
            
            <div className="flex flex-col gap-4">
               <div className="bg-emerald-900 rounded-3xl p-6 text-white flex items-center space-x-4 shadow-xl">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                     <TrendingUp className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                     <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">Network Live</p>
                     <p className="text-xl font-black">{products.length} Active Batches</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🛠️ Filters & Search */}
      <div className="max-w-7xl mx-auto px-6 -mt-8">
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200 border border-slate-100 p-4 md:p-6 mb-12 flex flex-col lg:flex-row gap-6">
          <div className="flex-grow relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by product or store..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl pl-16 pr-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            <div className="flex items-center text-slate-400 px-3 border-r border-slate-200 mr-2">
               <Filter className="w-4 h-4 mr-2" />
               <span className="text-[10px] font-black uppercase tracking-widest">Topics</span>
            </div>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`flex-none px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  filter === cat 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-400/20' 
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 📦 Product Grid */}
        {error ? (
          <div className="bg-rose-50 border border-rose-100 rounded-3xl p-12 text-center">
            <p className="text-rose-600 font-black">{error}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-[3rem] p-24 text-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-slate-300" />
             </div>
             <h3 className="text-xl font-black text-slate-900 mb-2">No Verified Items Found</h3>
             <p className="text-slate-500 font-medium">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div 
                key={product._id} 
                className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-emerald-900/5 hover:-translate-y-2 transition-all duration-500 flex flex-col"
              >
                {/* Visual Header */}
                <div className="p-8 pb-4 relative">
                  <div className="absolute top-8 right-8">
                     <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl flex items-center border border-emerald-100">
                        <BadgeCheck className="w-3.5 h-3.5 mr-1.5 shadow-sm" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{product.qualityGrade || 'Verified'}</span>
                     </div>
                  </div>
                  
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                     <Package className="w-8 h-8 text-emerald-600" />
                  </div>
                  
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">
                    {product.productName}
                  </h3>
                  <div className="flex items-center text-xs font-black text-slate-400 uppercase tracking-widest">
                     <ShoppingBag className="w-3 h-3 mr-1.5" />
                     {product.category || 'Agri Product'}
                  </div>
                </div>

                {/* Content */}
                <div className="px-8 pb-8 space-y-6 flex-grow">
                   <div className="flex items-center justify-between py-4 border-y border-slate-50">
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Local Value</p>
                         <p className="text-2xl font-black text-slate-900">
                            <span className="text-emerald-600">{product.currency}</span> {product.unitPrice.toFixed(0)}
                         </p>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Available at</p>
                         <p className="text-sm font-black text-slate-800">{product.store?.name}</p>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <div className="flex items-center text-sm font-medium text-slate-600">
                         <MapPin className="w-4 h-4 mr-3 text-slate-400" />
                         <span className="truncate">{product.store?.location}</span>
                      </div>
                      <div className="flex items-center text-sm font-medium text-slate-600">
                         <Calendar className="w-4 h-4 mr-3 text-slate-400" />
                         <span>Harvested: {new Date(product.harvestDate).toLocaleDateString()}</span>
                      </div>
                   </div>
                </div>

                {/* Action */}
                <div className="px-8 pb-8">
                   <Link 
                    to={`/trace/${product.batchId}`}
                    className="w-full bg-slate-900 text-white flex items-center justify-center py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] group-hover:bg-emerald-600 transition-colors"
                   >
                     Verify Product Journey
                     <ArrowUpRight className="w-4 h-4 ml-2" />
                   </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🗺️ Footer Promo */}
      <div className="max-w-7xl mx-auto px-6 mt-24">
         <div className="bg-emerald-900 rounded-[3rem] p-12 lg:p-16 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
               <ShieldCheck className="w-96 h-96 -ml-20 -mt-20" />
            </div>
            <div className="relative z-10 max-w-2xl mx-auto">
               <h2 className="text-4xl font-black mb-6 tracking-tight">Support Transparent Agriculture</h2>
               <p className="text-emerald-100 text-lg mb-10 leading-relaxed font-medium">
                 By choosing verified products, you are directly supporting farmers who prioritize soil health, 
                 food safety, and ethical logistics. Join the movement for a cleaner food chain.
               </p>
               <button className="bg-white text-emerald-900 px-10 py-5 rounded-3xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl">
                 Become a Verified Partner
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}

export default ProductCatalog;
