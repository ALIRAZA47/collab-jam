export type Tool = 'select' | 'rect' | 'circle' | 'text' | 'note' | 'pencil' | 'arrow' | 'line' | 'triangle' | 'eraser';

export interface Point {
    x: number;
    y: number;
}

export interface Shape {
    id: string;
    type: Tool;
    x: number;
    y: number;
    width?: number;
    height?: number;
    text?: string;
    color: string;
    note?: string;
}

export interface Cursor {
    userId: string;
    x: number;
    y: number;
    color: string;
    username?: string;
}
