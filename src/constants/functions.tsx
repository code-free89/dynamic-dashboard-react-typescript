import { palette, tileCatalogs } from ".";

// gets a tile content by name
export const getTileContent = (name: string) => {
    tileCatalogs.forEach((item) => {
        if (item.name === name) {
            return <div style={{ backgroundColor: palette[1] }}>
                {item.tile}
            </div>
        }
    });
};

export const getIndex = (e: HTMLDivElement) => {
    const p = e.parentElement;
    if (p) {
        for (let i = 0; i < p.children.length; i++) {
            if (p.children[i] === e)
                return i;
        }
    }
    return -1;
};

export const isBlankElement = (e: HTMLDivElement) => {
    if (e.children.length === 0) return true;
    return false;
}