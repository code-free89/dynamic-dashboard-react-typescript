import React, { useEffect, useState } from 'react';
import './App.css';
import { palette, testCatalogs, tileCatalogs } from './constants';
import { TileType } from './types';
import Tile from './components/Tile';
import { getIndex, getTileContent, isBlankElement } from './constants/functions';
function App() {

  const reOrder = (srcTiles: TileType[]) => {
    // remove empty row
    for(let i = 0; srcTiles.length && i <= (srcTiles[srcTiles.length - 1].row ?? 10); i ++) {
      const rowTiles = srcTiles.filter((item) => item.row === i);
      const noEmptyIndex = rowTiles.findIndex((item) => item.name !== "");
      if(noEmptyIndex === -1) {
        srcTiles.splice(srcTiles.findIndex((item) => item.row === i), rowTiles.length);
      }
    }
    let row = 0, col = 0;
    const tmpTiles: TileType[] = [];
    let index = 0;
    for (let i = 0; i < srcTiles.length; i++) {
      if (srcTiles[i].name === "" && srcTiles[i].width > 1) {
        for (let j = 0; j < srcTiles[i].width; j++) {
          tmpTiles.push({
            name: "",
            key: index,
            width: 1,
            row: row,
            col: col + j,
            type: "real",
            color: "transparent",
          });
          index++;
        }
      } else {
        tmpTiles.push({
          ...srcTiles[i],
          key: index,
          row: row,
          col: col,
          type: "real",
        });
        index++;
      }
      col += srcTiles[i].width;
      if (srcTiles[i + 1]) {
        if ((col + srcTiles[i + 1].width) > 4) {
          for (let j = col; j < 4; j++) {
            tmpTiles.push({
              key: index,
              name: "",
              width: 1,
              row: row,
              col: j,
              color: "transparent",
              type: "real",
            });
            index++;
          }
          row++;
          col = 0;
        }
      } else {
        for (let j = col; j < 4; j++) {
          tmpTiles.push({
            key: index,
            name: "",
            width: 1,
            row: row,
            col: col,
            color: "transparent",
            type: "real",
          });
          index++;
        }
      }
    };
    return tmpTiles;
  }

  // tiles currently in use
  const getTiles = (): Array<TileType> => {
    const tileArray: Array<TileType> = [];
    for (let i = 0; i < testCatalogs.length; i++) {
      tileArray.push({
        name: testCatalogs[i].name,
        width: testCatalogs[i].width,
        color: testCatalogs[i].color,
        type: testCatalogs[i].type,
      });
    }
    return reOrder(tileArray);
  };

  const [isWideMenu, setIsWideMenu] = useState<boolean>(false);
  const [tiles, setTiles] = useState<Array<TileType>>([]);
  const [dragSource, setDragSource] = useState<HTMLDivElement>();
  const [dropTarget, setDropTarget] = useState<HTMLDivElement>();

  // adds a tile to the dashboard
  const addTile = (name: string) => {
    const tileCatalog = tileCatalogs.find((item) => item.name === name);
    if (tileCatalog) {
      let tmpTiles = tiles.filter((item) => item.name !== "" || item.type === "real");
      let i = tmpTiles.length - 1;
      while (i >= 0) {
        if (tmpTiles[i].name === "") tmpTiles.pop();
        else break;
        i--;
      }
      tmpTiles.push(tileCatalog);
      tmpTiles = reOrder(tmpTiles);
      setTiles(tmpTiles);
    }
  };

  // removes a tile from the dashboard
  const removeTile = (tileIndex: number) => {
    let tmpTiles = tiles.filter((item, index) => index !== tileIndex && (item.name !== "" || item.type === "real"));
    tmpTiles = reOrder(tmpTiles);
    setTiles(tmpTiles);
  };

  // initialize component after it has been mounted
  useEffect(() => {
    setTiles(getTiles());
  }, []);

  // drag start
  const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    if (!target.className.includes("blank-tile")) {
      target.className += " drag-source";
      const dt = event.dataTransfer;
      dt.effectAllowed = "move";
      dt.setData('text', target.innerHTML);
      setDragSource(target);
    }
  }

  // drag over
  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (dragSource) {
      let tile = (event.target as HTMLDivElement).closest(".tile") as HTMLDivElement;
      if (tile && tile !== dragSource) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
      }
      if (tile && dropTarget !== tile) {
        // drop target should be changed
        let tmpTiles = tiles.slice();
        if (tiles[getIndex(tile)].type === "real") {
          // current drop target is real
          if (dropTarget && getIndex(dropTarget) !== -1 && tiles[getIndex(dropTarget)].type === "fake" && tiles[getIndex(dropTarget)].width !== 4) {
            // if previous dropTarget is fake, should recover real elements
            const dropElement = tiles[getIndex(dropTarget)];
            const dropIndex = getIndex(dropTarget);
            tmpTiles.splice(dropIndex, 1);
            for (let i = 0; i < dropElement.width; i++)
              tmpTiles.splice(dropIndex, 0, {
                name: "",
                type: "real",
                width: 1,
                row: tiles[getIndex(dropTarget)].row,
                col: tiles[getIndex(dropTarget)].col,
              });
          }
          tmpTiles = tmpTiles.filter((item) => item.name !== "" || item.type === "real");
          tmpTiles = reOrder(tmpTiles);
          setTiles(tmpTiles);
        }
        if (dropTarget) {
          if (dropTarget.children.length)
            dropTarget.className = dropTarget.className.replaceAll(" drag-over", "");
          else {
            if (!dropTarget.className.includes("blank-tile"))
              dropTarget.className += " blank-tile";
          }
        }
        if (tile)
          setDropTarget(tile);
      }
    }
  }

  // drag end
  const onDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    setTiles(tiles.filter((item) => item.type !== "fake"));
    if (dragSource)
      dragSource.className = dragSource.className.replaceAll(" drag-source", "");
    if (dropTarget) {
      if (dropTarget.children.length)
        dropTarget.className = dropTarget.className.replaceAll(" drag-over", "");
      else if (!dropTarget.className.includes("blank-tile"))
        dropTarget.className += " blank-tile";
    }
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
      if (!isBlankElement(dropTarget)) {
        // drop target is not blank
        if (tiles[srcIndex].width === tiles[dstIndex].width || tiles[srcIndex].row === tiles[dstIndex].row) {
          // drag & drop width is same
          let tmpTile = tmpTiles[srcIndex];
          tmpTiles[srcIndex] = {
            ...tmpTiles[dstIndex]
          };
          tmpTiles[dstIndex] = tmpTile;
        } else {
          // drag width != drop width
          if(dropTarget.className.includes("drag-over")) {
            let tmpTile = tmpTiles[srcIndex];
            tmpTiles[srcIndex] = tmpTiles[dstIndex];
            tmpTiles[dstIndex] = tmpTile;
          } else {
            let i = dstIndex;
            for (; i < tmpTiles.length; i ++) {
              if (tmpTiles[i].row !== tmpTiles[dstIndex].row) break;
            }
            let tmpTile = tmpTiles[srcIndex];
            tmpTiles.splice(srcIndex, 1);
            tmpTiles.splice(i, 0, tmpTile);
          }
        }
      } else {
        // drop target is blank
        if (tiles[srcIndex].width === tiles[dstIndex].width || tiles[srcIndex].row === tiles[dstIndex].row) {
          // drag & drop width is same
          let tmpTile = tmpTiles[srcIndex];
          tmpTiles[srcIndex] = {
            name: "",
            type: "real",
            width: tmpTiles[dstIndex].width,
            row: tmpTile.row,
            col: tmpTile.col,
          };
          tmpTiles[dstIndex] = {
            ...tmpTile,
            row: tmpTiles[dstIndex].row,
            col: tmpTiles[dstIndex].col,
          };
        }
      }
      tmpTiles = tmpTiles.filter((item) => item.name !== "" || item.type === "real");
      tmpTiles = reOrder(tmpTiles);

      setTiles(tmpTiles);
    }
  }

  useEffect(() => {
    let srcIndex = 2000;
    let dstIndex = 2000;
    if (dragSource)
      srcIndex = getIndex(dragSource);
    if (dropTarget)
      dstIndex = getIndex(dropTarget);

    if (!tiles[srcIndex] || !tiles[dstIndex] || !dropTarget) return;
    if (!isBlankElement(dropTarget)) {
      // If dropTarget is not blank
      if (tiles[srcIndex].width === tiles[dstIndex].width || tiles[srcIndex].row === tiles[dstIndex].row) {
        // drag & drop target has same width
        dropTarget.className += " drag-over";
      } else if (tiles[srcIndex].width > tiles[dstIndex].width) {
        // drag width > drop width
        let blankTileCount = 0, i;
        for (i = dstIndex; i < tiles.length; i++) {
          if ((tiles[i].row ?? 0) > (tiles[dstIndex].row ?? 0)) break;
          if (tiles[i].name === "") blankTileCount++;
        }
        if (tiles[srcIndex].width > blankTileCount + 1) {
          // can't drop
          let tmpTiles = tiles.slice();
          tmpTiles.splice(i, 0, {
            name: "",
            width: 4,
            type: "fake",
            row: (tiles[dstIndex].row ?? 0) + 1,
          });
          setTiles(tmpTiles);
        } else {
          // can drop
          dropTarget.className += " drag-over";
        }
      } else {
        // drag width < drop width
        let blankTileCount = 0, i;
        for (i = srcIndex; i < tiles.length; i++) {
          if ((tiles[i].row ?? 0) > (tiles[srcIndex].row ?? 0)) break;
          if (tiles[i].name === "") blankTileCount++;
        }
        if (tiles[dstIndex].width <= blankTileCount + 1) {
          // can drop
          dropTarget.className += " drag-over";
        } else {
          // can't drop
          let tmpTiles = tiles.slice();
          tmpTiles.splice((tiles[dstIndex].key ?? 0) + 1, 0, {
            name: "",
            width: 4,
            type: "fake",
            row: (tiles[dstIndex].row ?? 0) + 1,
          });
          setTiles(tmpTiles);
        }
      }
    } else {
      // If drop element is blank element
      if (tiles[srcIndex].width === tiles[dstIndex].width || tiles[srcIndex].row === tiles[dstIndex].row) {
        // drag & drop width is same
        dropTarget.className = dropTarget.className.replaceAll(" blank-tile", "");
      } else if (tiles[srcIndex].width > tiles[dstIndex].width) {
        // drag width > drop width
        let blankElementCount = 0, i = dstIndex, startIndex = dstIndex, endIndex = dstIndex;
        for (; tiles[i] && (tiles[i].row ?? 0) === (tiles[dstIndex].row ?? 0); i++) {
          if (tiles[i].name !== "") break;
          blankElementCount++;
        }
        if (blankElementCount >= tiles[srcIndex].width) endIndex = startIndex + tiles[srcIndex].width - 1;
        else {
          endIndex = i - 1;
          for (i = dstIndex - 1; (tiles[i].row ?? 0) === (tiles[dstIndex].row ?? 0); i--) {
            if (tiles[i].name !== "") break;
            blankElementCount++;
          }
          if (blankElementCount >= tiles[srcIndex].width)
            startIndex = endIndex - tiles[srcIndex].width + 1;
        }
        if ((endIndex - startIndex + 1) === tiles[srcIndex].width) {
          // can drop
          let tmpTiles = tiles.slice();
          tmpTiles.splice(startIndex, tiles[srcIndex].width);
          tmpTiles.splice(startIndex, 0, {
            name: "",
            width: tiles[srcIndex].width,
            type: "fake",
            row: tiles[dstIndex].row,
          });
          setTiles(tmpTiles);
        } else {
          // can't drop
          let tmpTiles = tiles.slice();
          tmpTiles.splice(endIndex + 1, 0, {
            name: "",
            width: 4,
            type: "fake",
            row: (tiles[dstIndex].row ?? 0) + 1,
          });
          setTiles(tmpTiles);
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
                {tiles.map((item, index) => (<Tile header={item.name} content={getTileContent(item.name)} width={item.width} onRemove={() => removeTile(index)} key={`tile-${item.key}`} className={`${item.key === 1000 ? "hidden" : ""}`} color={item.color ?? "0xFFFFFF"} type={item.type} />))}
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
