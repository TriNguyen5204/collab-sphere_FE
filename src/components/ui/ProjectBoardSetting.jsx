import React from 'react'
import { EllipsisVertical } from 'lucide-react'

const ProjectBoardSetting = () => {
  return (
    <div className="flex items-center">
      <button className="ml-2 p-1 rounded hover:bg-gray-100">
        <EllipsisVertical />
      </button>
    </div>
  )
}

export default ProjectBoardSetting