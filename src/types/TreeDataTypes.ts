export type Root = ITreeData[];

export interface ITreeData {
  id: number;
  name: string;
  contains?: ITreeNode[];
}

export interface ITreeNode {
  id: number;
  name: string;
  contains?: ITreeNode2[];
}

export interface ITreeNode2 {
  id: number;
  name: string;
}
