import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MessageSquare, Send, CheckCircle, User, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { consumerAPI } from '../api/consumer';
import { useAuth } from '../context/AuthContext';

function FeedbackSection({ batchId }) {
  const { user, isAuthenticated } = useAuth();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (batchId) {
      loadReviews();
    }
  }, [batchId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await consumerAPI.getFeedback(batchId);
      if (response.success) {
        setReviews(response.data.reviews || []);
        setSummary({
          averageRating: response.data.averageRating,
          totalReviews: response.data.totalReviews
        });
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setMessage({ text: 'Please select a star rating', type: 'error' });
      return;
    }

    setSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await consumerAPI.submitFeedback(batchId, {
        rating,
        comment,
        consumerId: user?._id
      });

      if (response.success) {
        setMessage({ text: 'Thank you for your verified review!', type: 'success' });
        setRating(0);
        setComment('');
        loadReviews(); // Refresh the list
      }
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Failed to submit feedback', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Verified Reviews</h2>
          </div>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Consumer Insights & Feedback</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center shadow-sm">
          <div className="text-center px-4 border-r border-slate-100">
            <p className="text-3xl font-black text-slate-900 leading-none">{summary.averageRating}</p>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Avg Rating</p>
          </div>
          <div className="px-4">
             <div className="flex space-x-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-3 h-3 ${star <= Math.round(summary.averageRating) ? 'fill-emerald-600 text-emerald-600' : 'text-slate-200'}`} 
                  />
                ))}
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{summary.totalReviews} Reviews</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* 📝 Submit Feedback Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm sticky top-24">
            <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Share Your Experience</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Overall Rating</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      className="transition-transform active:scale-95 focus:outline-none"
                    >
                      <Star 
                        className={`w-8 h-8 transition-colors duration-200 ${
                          star <= (hover || rating) ? 'fill-emerald-600 text-emerald-600' : 'text-slate-100'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Review Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about the product quality..."
                  className="w-full rounded-2xl border border-slate-200 p-4 min-h-[120px] focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition font-medium text-slate-900"
                  required
                />
              </div>

              {message.text && (
                <div className={`p-4 rounded-xl text-xs font-bold flex items-center ${
                  message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                }`}>
                  {message.type === 'success' ? <CheckCircle className="w-4 h-4 mr-2" /> : <AlertCircle className="w-4 h-4 mr-2" />}
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Submit Review</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>

              {!isAuthenticated() && (
                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-wider">
                  Post anonymously or <Link to="/login" className="text-emerald-600 hover:underline">sign in</Link>
                </p>
              )}
            </form>
          </div>
        </div>

        {/* 📋 Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center opacity-40">
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 p-20 text-center">
               <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
               <p className="text-slate-500 font-bold mb-1">No reviews yet</p>
               <p className="text-slate-400 text-sm">Be the first to share your experience with this batch.</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-500">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                      <User className="w-6 h-6 text-slate-300" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900">
                        {review.consumerId?.name || 'Verified Consumer'}
                      </p>
                      <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                        <Calendar className="w-3 h-3 mr-1.5" />
                        {new Date(review.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-3 h-3 ${star <= review.rating ? 'fill-emerald-600 text-emerald-600' : 'text-slate-200'}`} 
                      />
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed font-medium">
                  "{review.comment}"
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default FeedbackSection;
