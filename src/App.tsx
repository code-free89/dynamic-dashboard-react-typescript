import React, { useEffect, useState } from 'react';
import './App.css';
import { palette, tileCatalogs } from './constants';
import { TileType } from './types';
import Tile from './components/Tile';
import { getIndex, getTileContent } from './constants/functions';
function App() {
  const [blankTile, setBlankTile] = useState<TileType>({
    name: "",
    width: 4,
    key: 1000,
  });
  const [key, setKey] = useState<number>(0);

  // tiles currently in use
  const getTiles = (): Array<TileType> => {
    const tileArray: Array<TileType> = [];
    let row = 0;
    let col = 0;
    for (let i = 0; i < 5; i++) {
      tileArray.push({ name: tileCatalogs[i].name, key: i, width: tileCatalogs[i].width, row: row, col: col, color: tileCatalogs[i].color });
      col += tileCatalogs[i].width;
      if (col > 3) {
        col = 0;
        row++;
      }
    }
    tileArray.push(blankTile);
    setKey(5);
    return tileArray;
  };

  const [isWideMenu, setIsWideMenu] = useState<boolean>(false);
  const [tiles, setTiles] = useState<Array<TileType>>([]);
  const [dragSource, setDragSource] = useState<HTMLDivElement>();
  const [dropTarget, setDropTarget] = useState<HTMLDivElement>();

  // adds a tile to the dashboard
  const addTile = (name: string) => {
    const tileCatalog = tileCatalogs.find((item) => item.name === name);
    setTiles([...tiles, { name: name, key: key, width: tileCatalog ? tileCatalog.width : 1, color: tileCatalog?.color }]);
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

  // drag start
  const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    target.className += " drag-source";
    const dt = event.dataTransfer;
    dt.effectAllowed = "move";
    dt.setData('text', target.innerHTML);
    setDragSource(target);
  }

  // drag over
  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (dragSource) {
      let tile = (event.target as HTMLDivElement).closest(".tile") as HTMLDivElement;
      const blankElement = document.getElementsByClassName("blank-tile")[0];
      if (tile && tile !== dragSource) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
      }
      if (dropTarget !== tile) {
        if (dropTarget && dropTarget !== blankElement)
          dropTarget.className = dropTarget.className.replaceAll(" drag-over", "");
        if (tile)
          setDropTarget(tile);
      }
    }
  }

  // drag end
  const onDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    if (dragSource)
      dragSource.className = dragSource.className.replaceAll(" drag-source", "");
    if (dropTarget)
      dropTarget.className = dropTarget.className.replaceAll(" drag-over", "");
  }

  // drop
  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (dragSource && dropTarget) {
      // finish drag/drop
      event.stopPropagation();
      event.preventDefault();
      // re-order HTML elements (optional here, we're updating the state later)
      const srcIndex = getIndex(dragSource);
      const dstIndex = getIndex(dropTarget);
      dragSource.focus();
      // update state
      let tmpTiles = tiles.slice();
      if (tmpTiles[tmpTiles.length - 1] === blankTile) {
        let tmpTile = tmpTiles[srcIndex];
        tmpTiles[srcIndex] = tmpTiles[dstIndex];
        tmpTiles[dstIndex] = tmpTile;
        setTiles(tmpTiles);
      } else {
        const blankTileIndex = tmpTiles.findIndex((item) => item.name === "");
        const refChild = tmpTiles[srcIndex];
        const newBlankTile = { ...blankTile, key: 1000 };
        setBlankTile(newBlankTile);
        tmpTiles = tmpTiles.filter((item, index) => item.name !== "" && index !== srcIndex);
        tmpTiles.push(newBlankTile);
        tmpTiles.splice(blankTileIndex, 0, refChild);
        reOrder(tmpTiles);
      }
    }
  }

  const reOrder = (tmpTiles: TileType[]) => {
    console.log(tmpTiles);
    
    let row = 0, col = 0;
    tmpTiles.forEach((item, index) => {
      if((col + item.width) > 3) {
        row ++;
        col = 0;
      }
      tmpTiles[index] = { ...tmpTiles[index], row: row, col: col, key: item.name === "" ? 1000 : index };
      col += item.width;
    });
    setTiles(tmpTiles);
  }

  useEffect(() => {
    let srcIndex = 2000;
    let dstIndex = 2000;
    if (dragSource)
      srcIndex = getIndex(dragSource);
    if (dropTarget)
      dstIndex = getIndex(dropTarget);

    // If dropTarget is not blank
    const blankElement = document.getElementsByClassName("blank-tile")[0] as HTMLDivElement;
    if (tiles[srcIndex] && tiles[dstIndex] && dropTarget && dropTarget !== blankElement) {
      if (tiles[srcIndex].width === tiles[dstIndex].width) {
        dropTarget.className += " drag-over";
        const newBlankTile = { ...blankTile, key: 1000 };
        setBlankTile(newBlankTile);
        var tmpTiles = tiles.slice();
        tmpTiles = tmpTiles.filter((item) => item.name !== "");
        tmpTiles.push(newBlankTile);
        setTiles(tmpTiles);
      } else {
        const rowTiles = tiles.filter((item) => item.row === tiles[dstIndex].row);
        const lastTile = rowTiles[rowTiles.length - 1];
        const lastCol = (lastTile.col ?? 0) + lastTile.width;
        console.log(tiles[dstIndex].row, rowTiles);
        // Can't drop
        if ((4 - lastCol) < tiles[srcIndex].width) {
          const newBlankTile = { ...blankTile, key: 500 };
          setBlankTile(newBlankTile);
          let tmpTiles = tiles.slice();
          tmpTiles = tmpTiles.filter((item) => item.name !== "");
          tmpTiles.splice((rowTiles[0].key ?? 0), 0, newBlankTile);
          setTiles(tmpTiles);
          dropTarget.focus();
        } else {
          setBlankTile({ ...blankTile, key: 1000 });
        }
      }
    }
  }, [dropTarget]);

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
                  {item.icon!.map((entity, key) => (<React.Fragment key={`Menu Item ${key}`}>{entity}</React.Fragment>))}
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
                {tiles.map((item, index) => (<Tile header={item.name} content={getTileContent(item.name)} width={item.width} onRemove={() => removeTile(index)} key={`tile-${item.key}`} className={`${item.key === 1000 ? "hidden" : ""}`} color={item.color ?? "0xFFFFFF"} />))}
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
