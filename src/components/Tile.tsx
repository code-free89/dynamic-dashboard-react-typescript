import React from 'react';
import classNames from 'classnames';

type Props = {
  header: string;
  content: any;
  onRemove: any;
  width: number;
  className: string;
  color: string;
};

const Tile: React.FC<Props> = ({ header, content, onRemove, width, className, color }) => {
  return header === "" ? (
    <div className={classNames(`tile blank-tile w-x${width} drag-over`, className)}></div>
  ) : (
    <div className={`tile w-x${width}`} draggable={true} style={{backgroundColor: color}}>
      <div className="tile-container">
        <div className="tile-header">{header}</div>
        <div className="buttons">
          <div className="button" title="Close Tile" onClick={() => onRemove()}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M12.71,12l4.64-4.65a.49.49,0,1,0-.7-.7L12,11.29,7.35,6.65a.49.49,0,0,0-.7.7L11.29,12,6.65,16.65a.48.48,0,0,0,0,.7.48.48,0,0,0,.7,0L12,12.71l4.65,4.64a.48.48,0,0,0,.7,0,.48.48,0,0,0,0-.7Z"/>
            </svg>
          </div>
        </div>
      </div>
      <div className="tile-content">{header}</div>
    </div>
  );
};

export default Tile;
