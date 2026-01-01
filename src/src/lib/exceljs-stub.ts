// Stub to replace exceljs if it is accidentally imported
// This prevents the heavy exceljs library from being bundled or loaded from CDN

export class Workbook {
  constructor() {
    console.warn('ExcelJS Stub: Workbook instantiated. Real ExcelJS is disabled.');
  }
  
  xlsx = {
    writeBuffer: async () => {
      console.warn('ExcelJS Stub: writeBuffer called.');
      return new ArrayBuffer(0);
    },
    load: async () => {
      console.warn('ExcelJS Stub: load called.');
      return this;
    }
  };

  addWorksheet() {
    return {
      addRow: () => {},
      columns: [],
      getCell: () => ({ value: '', numFmt: '' }),
      mergeCells: () => {},
    };
  }
  
  get worksheets() {
    return [];
  }
}

export const Formula = {
  // Mock Formula specific things if needed
};

export const ValueType = {
  Null: 0,
  Merge: 1,
  Number: 2,
  String: 3,
  Date: 4,
  Hyperlink: 5,
  Formula: 6,
  SharedString: 7,
  RichText: 8,
  Boolean: 9,
  Error: 10
};

const exceljs = {
  Workbook,
  Formula,
  ValueType
};

export default exceljs;
