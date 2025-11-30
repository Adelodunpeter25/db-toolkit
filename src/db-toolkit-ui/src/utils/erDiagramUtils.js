/**
 * Utilities for generating ER diagram from schema
 */
import dagre from 'dagre';

/**
 * Detect foreign key relationships from schema
 */
export function detectRelationships(schema) {
  const relationships = [];

  if (!schema?.databases) return relationships;

  schema.databases.forEach(database => {
    database.tables?.forEach(table => {
      table.columns?.forEach(column => {
        // Detect foreign keys by naming convention or constraints
        if (column.foreign_key) {
          relationships.push({
            id: `${table.name}-${column.name}`,
            source: table.name,
            target: column.foreign_key.table,
            sourceColumn: column.name,
            targetColumn: column.foreign_key.column,
            type: 'foreignKey'
          });
        }
        // Fallback: detect by naming convention (e.g., user_id -> users.id)
        else if (column.name.endsWith('_id')) {
          const targetTable = column.name.replace('_id', 's'); // Simple pluralization
          const tableExists = database.tables?.some(t => t.name === targetTable);
          if (tableExists) {
            relationships.push({
              id: `${table.name}-${column.name}`,
              source: table.name,
              target: targetTable,
              sourceColumn: column.name,
              targetColumn: 'id',
              type: 'inferred'
            });
          }
        }
      });
    });
  });

  return relationships;
}

/**
 * Convert schema to reactflow nodes
 */
export function schemaToNodes(schema) {
  const nodes = [];

  if (!schema?.databases) return nodes;

  schema.databases.forEach(database => {
    database.tables?.forEach((table, index) => {
      nodes.push({
        id: table.name,
        type: 'tableNode',
        position: { x: 0, y: 0 }, // Will be calculated by layout
        data: {
          label: table.name,
          columns: table.columns || [],
          schema: database.name
        }
      });
    });
  });

  return nodes;
}

/**
 * Convert relationships to reactflow edges
 */
export function relationshipsToEdges(relationships) {
  return relationships.map(rel => ({
    id: rel.id,
    source: rel.source,
    target: rel.target,
    type: 'smoothstep',
    animated: rel.type === 'inferred',
    label: `${rel.sourceColumn} → ${rel.targetColumn}`,
    style: { stroke: rel.type === 'inferred' ? '#94a3b8' : '#3b82f6' },
    markerEnd: {
      type: 'arrowclosed',
      color: rel.type === 'inferred' ? '#94a3b8' : '#3b82f6'
    }
  }));
}

/**
 * Auto-layout nodes using dagre
 */
export function getLayoutedElements(nodes, edges, direction = 'TB') {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  const nodeWidth = 250;
  const nodeHeight = 200;

  dagreGraph.setGraph({ 
    rankdir: direction,
    nodesep: 100,
    ranksep: 150
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

/**
 * Find primary key columns
 */
export function getPrimaryKeys(columns) {
  return columns.filter(col => 
    col.primary_key || 
    col.name === 'id' || 
    col.name.toLowerCase().includes('_pk')
  );
}

/**
 * Find foreign key columns
 */
export function getForeignKeys(columns) {
  return columns.filter(col => 
    col.foreign_key || 
    col.name.endsWith('_id')
  );
}
