import React, { useEffect, useState } from 'react';
import './App.css';
import { palette, tileCatalogs } from './constants';
import { TileType } from './types';
import Tile from './components/Tile';
function App() {
  const [key, setKey] = useState<number>(0);

  // tiles currently in use
  const getTiles = (): Array<TileType> => {
    const tileArray: Array<TileType> = [];
    for (let i = 0; i < 5; i++) {
      tileArray.push({ name: tileCatalogs[i].name, key: i, width: tileCatalogs[i].width });
    }
    setKey(5);
    return tileArray;
  };

  const [isWideMenu, setIsWideMenu] = useState<boolean>(false);
  const [tiles, setTiles] = useState<Array<TileType>>([]);
  const [dragSource, setDragSource] = useState<HTMLDivElement>();
  const [dropTarget, setDropTarget] = useState<HTMLDivElement>();

  // gets a tile content by name
  const getTileContent = (name: string) => {
    tileCatalogs.forEach((item) => {
      if (item.name === name) {
        return <div style={{ backgroundColor: palette[1] }}>
          {item.tile}
        </div>
      }
    });
  };

  // adds a tile to the dashboard
  const addTile = (name: string) => {
    const tileCatalog = tileCatalogs.find((item) => item.name === name);
    setTiles([...tiles, { name: name, key: key, width: tileCatalog ? tileCatalog.width : "full" }]);
    setKey(key + 1);
  };

  // removes a tile from the dashboard
  const removeTile = (tileIndex: number) => {
    setTiles(tiles.filter((item, index) => index !== tileIndex));
  };

  // initialize component after it has been mounted
  useEffect(() => {
    setTiles(getTiles());
  }, []);

  const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    target.className += " drag-source";
    const dt = event.dataTransfer;
    dt.effectAllowed = "move";
    dt.setData('text', target.innerHTML);
    setDragSource(target);
  }

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (dragSource) {
      let tile = (event.target as HTMLDivElement).closest(".tile") as HTMLDivElement;
      if (tile !== dragSource && dragSource && tile && tile !== dragSource) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
      }
      if (tile !== dragSource && dropTarget !== tile) {
        if (dropTarget) {
          dropTarget.className = dropTarget.className.replaceAll("drag-over", "");
        }
        if (tile)
          setDropTarget(tile);
      }
    }
  }

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (dragSource && dropTarget) {
      // finish drag/drop
      event.stopPropagation();
      event.preventDefault();
      // re-order HTML elements (optional here, we're updating the state later)
      const srcIndex = getIndex(dragSource);
      const dstIndex = getIndex(dropTarget);
      const refChild = srcIndex > dstIndex ? dropTarget : dropTarget.nextElementSibling;
      if(dragSource.parentElement)
        dragSource.parentElement.insertBefore(dragSource, refChild);
      // focus and view on the tile that was dragged
      dragSource.focus();
      // update state
      let tmpTiles = tiles.slice();
      let tmpTile = tmpTiles[srcIndex];
      tmpTiles[srcIndex] = tmpTiles[dstIndex];
      tmpTiles[dstIndex] = tmpTile;
      setTiles(tmpTiles);
    }
  }

  const onDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    if(dragSource)
      dragSource.className = dragSource.className.replaceAll("drag-source", "");
    if(dropTarget)
    dropTarget.className = dropTarget.className.replaceAll("drag-over", "");
  }

  useEffect(() => {
    if (dropTarget) {
      dropTarget.className += " drag-over";
    }
  }, [dropTarget]);

  function getIndex(e: HTMLDivElement) {
    const p = e.parentElement;
    if(p) {
      for (let i = 0; i < p.children.length; i++) {
          if (p.children[i] === e)
              return i;
      }
    }
    return -1;
  }

  return (
    <div className="container">
      <div className={`menu ${isWideMenu ? 'menu--open' : ''}`}>
        <div className={'menu-toggle' + (isWideMenu ? ' menu--open' : '')} onClick={() => setIsWideMenu(!isWideMenu)}>
          <svg width="30" height="20" viewBox="0 0 30 20" fill={palette[2]}>
            <rect x="10" y="5" width="11" height="1" />
            <rect x="10" y="15" width="11" height="1" />
            <polygon points="29.48 10.27 24.23 5.03 23.52 5.73 27.79 10 10 10 10 11 27.79 11 23.52 15.27 24.23 15.97 29.48 10.73 29.7 10.5 29.48 10.27" />
          </svg>
        </div>
        <React.Fragment>
          {
            tileCatalogs.map((item) => (
              <div key={`Menu ${item.name}`} className="menu-item" title={item.name} onClick={() => addTile(item.name)}>
                <svg width="64" height="64" viewBox="0 0 64 64">
                  {item.icon.map((entity, key) => (<React.Fragment key={`Menu Item ${key}`}>{entity}</React.Fragment>))}
                </svg>
                <div className="menu-item-name">{item.name}</div>
              </div>
            ))
          }
        </React.Fragment>
      </div>
      <div className="hr" />
      <div className="content">
        <div className="dashboard" onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} onDragEnd={onDragEnd}>
          {
            tiles.length ? (
              <React.Fragment>
                {tiles.map((item, index) => (<Tile header={item.name} content={getTileContent(item.name)} width={item.width} onRemove={() => removeTile(index)} key={`tile-${item.key}`} />))}
              </React.Fragment>
            ) : (
              <div className="blank">
                <svg width="24" height="24" viewBox="0 0 24 24" fill={palette[0]}>
                  <path d="M4,2H20A2,2 0 0,1 22,4V16A2,2 0 0,1 20,18H16L12,22L8,18H4A2,2 0 0,1 2,16V4A2,2 0 0,1 4,2M4,4V16H8.83L12,19.17L15.17,16H20V4H4M11,6H13V9H16V11H13V14H11V11H8V9H11V6Z" />
                </svg>
                <div>Click on an item on the menu bar to add the new tile to the dashboard.</div>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}

export default App;
