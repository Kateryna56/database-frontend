export interface Row {
  fields: string[];
}

export interface Table {
  name: string;
  columnNames: string[];
  columnTypes: string[];
  rows: Row[];
}

export interface Database {
  name: string;
  tables: Table[];
}