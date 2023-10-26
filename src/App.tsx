import React, { FC, useEffect, useState } from "react";
import uuid from "react-uuid";
import { ITreeData, ITreeNode, ITreeNode2 } from "./types/TreeDataTypes";

const treeData: ITreeData[] = [
  {
    id: 1,
    name: "Камера 1",
    contains: [
      {
        id: 2,
        name: "Камера 2",
        contains: [
          {
            id: 3,
            name: "Камера 3",
          },
          {
            id: 4,
            name: "Камера 4",
          },
        ],
      },
      {
        id: 5,
        name: "Камера 5",
      },
    ],
  },
];

const recursion = (tree: ITreeNode[]): ITreeNode[] => {
  if (!tree) return [];

  return tree.map((node: ITreeNode) => {
    const newNode = {
      ...node,
    };

    if (node.contains) {
      newNode.contains = recursion(node.contains);
    }

    return newNode;
  });
};

const App: FC = () => {
  const [tree, setTree] = useState<ITreeData[]>([]);
  const [initialState] = useState<ITreeData[]>(treeData);

  useEffect(() => {
    setTree(recursion(treeData));
  }, []);

  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  const handleExpand = (nodeId: number) => {
    setExpandedNodes((prevExpandedNodes) => {
      const newExpandedNodes = new Set(prevExpandedNodes);
      if (newExpandedNodes.has(nodeId)) {
        newExpandedNodes.delete(nodeId);
      } else {
        newExpandedNodes.add(nodeId);
      }
      return newExpandedNodes;
    });
  };

  const handleReset = (): void => {
    setTree(recursion(initialState));
    setExpandedNodes(new Set());
  };

  const [activeNodeId, setActiveNodeId] = useState<number>(1);
  const [activeNodeName, setActiveNodeName] = useState<string>("");
  const [isEditing, setIsEditing] = useState<{ [key: number]: boolean }>({});
  const [editValues, setEditValues] = useState<{ [key: number]: string }>({});

  const handleStartEdit = (nodeId: number, nodeName: string): void => {
    const updatedIsEditing = { ...isEditing, [nodeId]: true };
    setIsEditing(updatedIsEditing);
    const updatedEditValues = { ...editValues, [nodeId]: nodeName };
    setEditValues(updatedEditValues);
  };

  const handleUpdateName = (nodeId: number, newName: string) => {
    const updateNameRecursively = (nodes: ITreeNode[]): ITreeNode[] => {
      return nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            name: newName,
          };
        } else if (node.contains) {
          return {
            ...node,
            contains: updateNameRecursively(node.contains),
          };
        } else {
          return node;
        }
      });
    };

    setTree((prevTree) => updateNameRecursively(prevTree));
    const updatedIsEditing = { ...isEditing, [nodeId]: false };
    setIsEditing(updatedIsEditing);
  };

  const addNode = (parentId: number | null) => {
    const addNodeRecursively = (nodes: ITreeNode2[]): ITreeNode2[] => {
      return nodes.map((node: ITreeNode) => {
        if (node.id === parentId) {
          const newNodeName = `Камера ${
            node.contains ? node.contains.length + 1 : 1
          }`;
          return {
            ...node,
            contains: [
              ...(node.contains || []),
              {
                id: uuid(),
                name: newNodeName,
              },
            ],
          };
        } else if (node.contains) {
          return {
            ...node,
            contains: addNodeRecursively(node.contains),
          };
        } else {
          return node;
        }
      });
    };
    setTree((prevTree) => addNodeRecursively(prevTree));
  };

  const deleteNode = (nodeId: number) => {
    const deleteNodeRecursively = (nodes: ITreeNode[]): ITreeNode[] => {
      return nodes.filter((node) => {
        if (node.id === nodeId) {
          return false;
        }
        if (node.contains) {
          node.contains = deleteNodeRecursively(node.contains);
        }
        return true;
      });
    };

    const updatedTree = deleteNodeRecursively(tree);
    setTree(updatedTree);
  };

  const buildTree = (nodes: ITreeNode[]): JSX.Element[] => {
    const mappedNodes = nodes.map((node) => {
      const isExpanded = expandedNodes.has(node.id);

      return (
        <div key={node.id} style={{ marginLeft: "50px" }}>
          <span onClick={() => handleExpand(node.id)}>
            {isExpanded ? "▼ " : "► "}
          </span>
          {isEditing[node.id] ? (
            <input
              value={editValues[node.id] ?? node.name}
              onChange={(e) => {
                const updatedEditValues = {
                  ...editValues,
                  [node.id]: e.target.value,
                };
                setEditValues(updatedEditValues);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleUpdateName(node.id, editValues[node.id]);
                }
              }}
            />
          ) : (
            <span
              onClick={() => {
                setActiveNodeId(node.id);
                setActiveNodeName(node.name);
              }}
              className={activeNodeId === node.id ? "active" : ""}
            >
              {node.name}
            </span>
          )}
          {isExpanded && node.contains ? buildTree(node.contains) : null}
        </div>
      );
    });
    return mappedNodes;
  };

  return (
    <React.Fragment>
      <header className="header">
        <img src="/src/assets/mcc-logo.svg" />
      </header>
      <body className="body">
        <div className="tree">
          {tree.length ? buildTree(tree) : "Нет дерева"}
        </div>
      </body>
      <footer className="footer">
        <button onClick={() => addNode(activeNodeId)}>Add</button>
        <button onClick={() => deleteNode(activeNodeId)}>Remove</button>
        <button onClick={() => handleStartEdit(activeNodeId, activeNodeName)}>
          Edit
        </button>
        <button
          onClick={() => {
            handleReset();
          }}
        >
          Reset
        </button>
      </footer>
    </React.Fragment>
  );
};

export default App;
