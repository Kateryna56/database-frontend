import React, { useState, useEffect } from 'react';
import './App.css';
import { Database, Table } from './models';
import { toast } from 'react-toastify';

const App = () => {
  const [databaseName, setDatabaseName] = useState('');
  const [tableName, setTableName] = useState('');
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>(''); // State for the currently selected table
  const [data, setData] = useState<Table | null>(null);
  const [newRowData, setNewRowData] = useState<string[]>([]); // State for new row input values as array

  const [columnName, setColumnName] = useState(''); // New column name
  const [columnType, setColumnType] = useState(''); // New column type

  const [editRowData, setEditRowData] = useState<string[]>([]); // State for editing a row
  const [editRowIndex, setEditRowIndex] = useState<number | null>(null); // State for selected row index to edit
  const [deleteRowIndex, setDeleteRowIndex] = useState<number | null>(null); // State for row index to delete

  const [joinTable1, setJoinTable1] = useState<string>(''); // State for first join table
  const [joinColumn1, setJoinColumn1] = useState<string>(''); // State for first join column
  const [joinTable2, setJoinTable2] = useState<string>(''); // State for second join table
  const [joinColumn2, setJoinColumn2] = useState<string>(''); // State for second join column

  const [table1Columns, setTable1Columns] = useState<string[]>([]);
  const [table2Columns, setTable2Columns] = useState<string[]>([]);

  useEffect(() => {
    loadTables();
  }, []);

  // Create a new database
  const createDatabase = async () => {
    await fetch('http://localhost:5138/api/database', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(databaseName),
    });
    loadTables();
  };

  // Create a new table
  const createTable = async () => {
    await fetch(`http://localhost:5138/api/tables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tableName),
    });
    loadTables();
  };

  // Add a new column to the selected table
  const addColumn = async () => {
    if (!selectedTable || !columnName || !columnType) return;

    await fetch(`http://localhost:5138/api/tables/${selectedTable}/column?columnName=${columnName}&dataType=${columnType}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    loadTable(); // Reload table data to reflect new column
  };

  // Load all tables
  const loadTables = async () => {
    try {
      const response = await fetch('http://localhost:5138/api/tables');
      if (response.ok) {
        const tableData = await response.json();
        setTables(tableData);
        if (tableData.length > 0) {
          setSelectedTable(tableData[0]); // Automatically select the first table
        }
      } else {
        toast.error(`Failed to load tables: ${response.statusText}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    } catch (error) {
      toast.error('Error loading tables:', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  const loadColumnsForTable = async (table: string) => {
    try {
      const response = await fetch(`http://localhost:5138/api/tables/${table}`);
      if (response.ok) {
        const table = await response.json() as Table;
        return table.columnNames;
      } else {
        toast.error(`Failed to load columns for ${table}: ${response.statusText}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    } catch (error) {
      toast.error(`Error loading columns for ${table}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };


  // Load the selected table
  const loadTable = async () => {
    if (!selectedTable) return;
    try {
      const response = await fetch(`http://localhost:5138/api/tables/${selectedTable}`);
      if (response.ok) {
        const tableData = await response.json() as Table;
        setData(tableData);
        setNewRowData(new Array(tableData.columnNames.length).fill('')); // Initialize newRowData with an empty array
      } else {
        toast.error(`Failed to load table: ${response.statusText}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    } catch (error) {
      toast.error('Error loading table:', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  // Add a new row to the selected table
  const addRow = async () => {
    if (!selectedTable || !newRowData.length) return;
    try {
      const response = await fetch(`http://localhost:5138/api/rows/${selectedTable}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRowData),
      });
      if (response.status === 200) {
        loadTable(); // Reload the database after adding a row
      } else {
        toast.error(`Failed to add row: validation error`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    } catch (error) {
      toast.error('Error adding row:', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  // Handle input change for new row data
  const handleRowInputChange = (index: number, value: string) => {
    const updatedRowData = [...newRowData];
    updatedRowData[index] = value;
    setNewRowData(updatedRowData);
  };

  useEffect(() => {
    loadTable();
  }, [selectedTable]);

  useEffect(() => {
    const fetchColumnsForJoinTables = async () => {
      if (joinTable1) {
        const columns1 = await loadColumnsForTable(joinTable1);
        setTable1Columns(columns1 || []);
      }
      if (joinTable2) {
        const columns2 = await loadColumnsForTable(joinTable2);
        setTable2Columns(columns2 || []);
      }
    };

    fetchColumnsForJoinTables();
  }, [joinTable1, joinTable2]);

  const loadRowForEdit = (rowIndex: number) => {
    if (data && data.rows && data.rows.length > rowIndex) {
      const rowToEdit = data.rows[rowIndex];
      setEditRowData(rowToEdit.fields);
      setEditRowIndex(rowIndex);
    }
  };

  const updateRow = async () => {
    if (editRowIndex === null || !selectedTable || !editRowData.length) return;
    try {
      const response = await fetch(`http://localhost:5138/api/rows/${selectedTable}/${editRowIndex}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editRowData),
      });
      if (response.status === 200) {
        loadTable();
        setEditRowIndex(null);
      } else {
        toast.error(`Failed to add row: validation error`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    } catch (error) {
      toast.error('Error updating row:', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  // Delete a row by index
  const deleteRow = async () => {
    if (deleteRowIndex === null || !selectedTable) return;
    try {
      const response = await fetch(`http://localhost:5138/api/rows/${selectedTable}/${deleteRowIndex}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.status === 200) {
        loadTable();
        setDeleteRowIndex(null);
      } else {
        toast.error(`Failed to delete row: validation error`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    } catch (error) {
      toast.error('Error deleting row:', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  const handleEditRowInputChange = (index: number, value: string) => {
    const updatedRowData = [...editRowData];
    updatedRowData[index] = value;
    setEditRowData(updatedRowData);
  };

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>, edit = false) => {
    const file = e.target.files?.[0]; // Get the first selected file
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result;
        if (typeof content === 'string') {
          if (edit) {
            handleEditRowInputChange(index, content);
          } else {
            handleRowInputChange(index, content);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const joinTables = async () => {
    if (!joinTable1 || !joinColumn1 || !joinTable2 || !joinColumn2) return;

    try {
      const response = await fetch(`http://localhost:5138/api/tables/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          joinTable1,
          joinColumn1,
          joinTable2,
          joinColumn2,
        }),
      });

      if (response.ok) {
        loadTables();
        toast.success('Tables joined successfully!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      } else {
        toast.error(`Failed to join tables: ${response.statusText}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    } catch (error) {
      toast.error('Error joining tables:', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', padding: "0px 20px" }}>
      <div>
        <h1>Database Manager</h1>

        <div>
          <h2>Create Database</h2>
          <input
            type="text"
            placeholder="Database Name"
            value={databaseName}
            onChange={(e) => setDatabaseName(e.target.value)}
          />
          <button onClick={createDatabase}>Create Database</button>
        </div>

        <div>
          <h2>Create Table</h2>
          <input
            type="text"
            placeholder="Table Name"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
          />
          <button onClick={createTable}>Create Table</button>
        </div>

        <div>
          <h2>Select Table:</h2>
          <select
            id="tableSelect"
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
          >
            {tables && tables.map((table) => (
              <option key={table} value={table}>
                {table}
              </option>
            ))}
          </select>
        </div>

        <div>
          <h2>Data for Table: {selectedTable}</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      </div>

      <div>
        <div>
          <h2>Add Column</h2>
          <input
            type="text"
            placeholder="Column Name"
            value={columnName}
            onChange={(e) => setColumnName(e.target.value)}
          />
          <select
            value={columnType}
            onChange={(e) => setColumnType(e.target.value)}
          >
            <option value="">Select Type</option>
            <option value="integer">Integer</option>
            <option value="real">Real</option>
            <option value="char">Char</option>
            <option value="string">String</option>
            <option value="textFile">Text File</option>
            <option value="integerInvl">Integer Interval</option>
          </select>

          <button onClick={addColumn}>Add Column</button>
        </div>

        <div>
          <h2>Add Row</h2>
          {data && data.columnNames && data.columnNames.map((name, index) => (
            <div key={index}>
              <label>{name}</label>
              {data.columnTypes[index] === 'textFile' ? (
                <input
                  type="file"
                  accept=".txt"
                  onChange={(e) => handleFileChange(index, e)}
                />
              ) : (
                <input
                  type="text"
                  value={newRowData[index] || ''}
                  onChange={(e) => handleRowInputChange(index, e.target.value)}
                />
              )}
            </div>
          ))}
          <button onClick={addRow}>Add Row</button>
        </div>

        <div>
          <h2>Edit Row</h2>
          <input
            type="number"
            placeholder="Row Number"
            value={editRowIndex !== null ? editRowIndex : ''}
            onChange={(e) => setEditRowIndex(parseInt(e.target.value))}
          />
          <button onClick={() => editRowIndex !== null && loadRowForEdit(editRowIndex)}>Load Row</button>

          {editRowIndex !== null && data && data.columnNames.map((name, index) => (
            <div key={index}>
              <label>{name}</label>
              {data.columnTypes[index] === 'textFile' ? (
                <input
                  type="file"
                  accept=".txt"
                  onChange={(e) => handleFileChange(index, e, true)}
                />
              ) : (
                <input
                  type="text"
                  value={editRowData[index] || ''}
                  onChange={(e) => handleEditRowInputChange(index, e.target.value)}
                />
              )}
            </div>
          ))}
          {editRowIndex !== null && <button onClick={updateRow}>Update Row</button>}
        </div>

        <div>
          <h2>Delete Row</h2>
          <input
            type="number"
            placeholder="Row Number"
            value={deleteRowIndex !== null ? deleteRowIndex : ''}
            onChange={(e) => setDeleteRowIndex(parseInt(e.target.value))}
          />
          <button onClick={deleteRow}>Delete Row</button>
        </div>

        <div>
          <h2>Join Tables</h2>

          <div>
            <label>Join Table 1</label>
            <select
              value={joinTable1}
              onChange={(e) => setJoinTable1(e.target.value)}
            >
              <option value="">Select Table 1</option>
              {tables.map((table) => (
                <option key={table} value={table}>
                  {table}
                </option>
              ))}
            </select>

            {joinTable1 && (
              <>
                <label>Select Column from {joinTable1}</label>
                <select
                  value={joinColumn1}
                  onChange={(e) => setJoinColumn1(e.target.value)}
                >
                  <option value="">Select Column</option>
                  {table1Columns.map((column) => (
                    <option key={column} value={column}>
                      {column}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>

          <div>
            <label>Join Table 2</label>
            <select
              value={joinTable2}
              onChange={(e) => setJoinTable2(e.target.value)}
            >
              <option value="">Select Table 2</option>
              {tables.map((table) => (
                <option key={table} value={table}>
                  {table}
                </option>
              ))}
            </select>

            {joinTable2 && (
              <>
                <label>Select Column from {joinTable2}</label>
                <select
                  value={joinColumn2}
                  onChange={(e) => setJoinColumn2(e.target.value)}
                >
                  <option value="">Select Column</option>
                  {table2Columns.map((column) => (
                    <option key={column} value={column}>
                      {column}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>

          <button onClick={joinTables}>Join Tables</button>
        </div>

      </div>
    </div>
  );
};

export default App;
