import React from 'react'

const Grid: React.FC = () => {
  return (
    <div className="title" draggable={true}>
      <div className="tile-container">
        <div className="tile-header">Grid Element</div>
        <div className="tile-content">Grid Element Content</div>
      </div>          
    </div>
  )
};

export default Grid;
