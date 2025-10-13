import { motion } from "framer-motion";
import {PlusCircle} from 'lucide-react'
function SectionCard({ title, icon, children, buttonLabel, buttonColor, onButtonClick }) {
  return (
    <motion.div
      className='bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition'
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-semibold flex items-center gap-2 text-gray-800'>
          {icon} {title}
        </h2>
        {buttonLabel && (
          <button
            onClick={onButtonClick}
            className={`flex items-center gap-2 bg-${buttonColor}-600 text-white px-4 py-2 rounded-lg hover:bg-${buttonColor}-700 transition`}
          >
            <PlusCircle size={18} /> {buttonLabel}
          </button>
        )}
      </div>
      {children}
    </motion.div>
  );
}
export default SectionCard