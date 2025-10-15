import { motion } from "framer-motion";
import { X } from 'lucide-react'
function Modal({ title, children, onClose }) {
  return (
    <motion.div
      className='fixed inset-0 bg-black/50 flex justify-center items-center z-50 backdrop-blur-sm'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className='bg-white rounded-xl shadow-xl w-11/12 max-w-2xl p-6 relative overflow-hidden'
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-gray-500 hover:text-gray-800'
        >
          <X size={20} />
        </button>
        <h2 className='text-xl font-semibold mb-4 text-gray-800'>{title}</h2>
        <div className='overflow-y-auto max-h-[60vh]'>{children}</div>
      </motion.div>
    </motion.div>
  );
}
export default Modal