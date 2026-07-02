import * as XLSX from 'xlsx';
import { BloodSugarEntry, MealType, TimePoint } from '@/types';
import { getBloodSugarStatus } from './bloodSugarUtils';
import { v4 as uuidv4 } from 'uuid';

export interface ExcelRowData {
  date: string;
  emptyStomach?: { time: string; value: number };
  breakfast?: { food: string; exercise: string };
  breakfast1h?: { time: string; value: number };
  breakfast2h?: { time: string; value: number };
  lunchBefore?: { time: string; value: number };
  lunch?: { food: string; exercise: string };
  lunch1h?: { time: string; value: number };
  lunch2h?: { time: string; value: number };
  dinnerBefore?: { time: string; value: number };
  dinner?: { food: string; exercise: string };
  dinner1h?: { time: string; value: number };
  dinner2h?: { time: string; value: number };
  bedtime?: { time: string; value: number };
}

export interface SimpleRow {
  date: string;
  time: string;
  value: number;
  food: string;
  exercise: string;
}

export function parseExcelFile(file: File): Promise<BloodSugarEntry[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: false });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        console.log('=== Excel File Analysis ===');
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        console.log('JSON data length:', jsonData.length);
        if (jsonData.length > 0) {
          console.log('First row:', jsonData[0]);
          console.log('First row keys:', Object.keys(jsonData[0]));
        }
        
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        console.log('Raw data rows:', rawData.length);
        if (rawData.length > 0) {
          console.log('Raw row 0:', rawData[0]);
        }
        if (rawData.length > 1) {
          console.log('Raw row 1:', rawData[1]);
        }
        if (rawData.length > 2) {
          console.log('Raw row 2:', rawData[2]);
        }
        
        const formatType = detectFormatType(rawData);
        console.log('Detected format type:', formatType);
        
        let entries: BloodSugarEntry[] = [];
        
        if (formatType === 'simple') {
          const rows = parseSimpleFormat(rawData);
          entries = parseSimpleRowsToEntries(rows);
        } else {
          const rows = parseComplexFormat(rawData, jsonData);
          entries = convertToEntries(rows);
        }
        
        console.log('=== Parsing Complete ===');
        console.log('Total entries:', entries.length);
        if (entries.length > 0) {
          console.log('First entry:', entries[0]);
        }
        
        resolve(entries);
      } catch (error) {
        console.error('Parse error:', error);
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function detectFormatType(rawData: any[][]): 'simple' | 'complex' {
  if (rawData.length < 2) return 'simple';
  
  const header1 = rawData[0];
  const header2 = rawData[1];
  
  const hasSecondHeader = header2 && header2.some(cell => cell && String(cell).trim() !== '');
  
  if (!hasSecondHeader) {
    return 'simple';
  }
  
  const hasGroupHeaders = header1.some(cell => {
    const str = String(cell || '').trim();
    return str === '空腹' || str === '早餐+运动' || str === '早餐后1小时' || 
           str === '早餐后2小时' || str === '午餐前' || str === '午餐+运动' ||
           str === '午餐后1小时' || str === '午餐后2小时' || str === '晚餐前' ||
           str === '晚餐+运动' || str === '晚餐后1小时' || str === '晚餐后2小时' ||
           str === '睡前';
  });
  
  if (hasGroupHeaders) {
    return 'complex';
  }
  
  return 'simple';
}

function parseSimpleFormat(rawData: any[][]): SimpleRow[] {
  const rows: SimpleRow[] = [];
  
  let headerRowIndex = 0;
  let dataStartIndex = 1;
  
  while (headerRowIndex < rawData.length) {
    const row = rawData[headerRowIndex];
    if (row && row[0] && String(row[0]).trim() === '日期') {
      break;
    }
    headerRowIndex++;
    dataStartIndex++;
  }
  
  const headers = rawData[headerRowIndex] || [];
  console.log('Simple format headers:', headers);
  
  const dateCol = findColumnIndex(headers, ['日期', 'Date', 'date', '时间']);
  const timeCol = findColumnIndex(headers, ['时间', 'Time', 'time', '记录时间', '测量时间']);
  const valueCol = findColumnIndex(headers, ['血糖', '血糖值', 'Blood Sugar', 'blood_sugar', 'value']);
  const foodCol = findColumnIndex(headers, ['餐食', '餐食内容', '食物', 'Food', 'food', '餐']);
  const exerciseCol = findColumnIndex(headers, ['运动', '运动情况', 'Exercise', 'exercise', '活动']);
  
  console.log('Column indices:', { dateCol, timeCol, valueCol, foodCol, exerciseCol });
  
  for (let i = dataStartIndex; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row || !row[0]) continue;
    
    const date = parseDateValue(row[dateCol]);
    if (!date || date === '日期') {
      console.log(`Row ${i}: Skipping due to invalid date:`, row[dateCol]);
      continue;
    }
    
    const time = parseTimeValueFromCell(row[timeCol]);
    const value = parseBloodSugarValueFromCell(row[valueCol]);
    const food = parseStringValueFromCell(row[foodCol]);
    const exercise = parseStringValueFromCell(row[exerciseCol]);
    
    if (value <= 0 && !time) {
      console.log(`Row ${i}: Skipping due to missing value and time`);
      continue;
    }
    
    rows.push({ date, time, value, food, exercise });
    console.log(`Row ${i}: date=${date}, time=${time}, value=${value}, food=${food}, exercise=${exercise}`);
  }
  
  return rows;
}

function findColumnIndex(headers: any[], possibleNames: string[]): number {
  for (let i = 0; i < headers.length; i++) {
    const header = String(headers[i] || '').trim();
    if (possibleNames.some(name => header.includes(name) || name.includes(header))) {
      return i;
    }
  }
  return -1;
}

function parseSimpleRowsToEntries(rows: SimpleRow[]): BloodSugarEntry[] {
  const entries: BloodSugarEntry[] = [];
  
  rows.forEach((row) => {
    let mealType: MealType = 'breakfast';
    let timePoint: TimePoint | null = null;
    
    if (row.time) {
      const [hours, minutes] = row.time.split(':').map(Number);
      mealType = detectMealType(hours, minutes);
      timePoint = detectTimePoint(hours, minutes, mealType);
    }
    
    const entry: BloodSugarEntry = {
      id: uuidv4(),
      date: row.date,
      time: row.time || '00:00',
      mealType,
      timePoint,
      value: row.value,
      food: row.food,
      exercise: row.exercise,
      status: getBloodSugarStatus(row.value, mealType, timePoint),
      createdAt: Date.now(),
    };
    
    entries.push(entry);
  });
  
  entries.sort((a, b) => {
    const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateCompare !== 0) return dateCompare;
    return b.time.localeCompare(a.time);
  });
  
  return entries;
}

function detectMealType(hours: number, minutes: number): MealType {
  const totalMinutes = hours * 60 + minutes;
  
  if (totalMinutes >= 360 && totalMinutes < 600) return 'emptyStomach';
  if (totalMinutes >= 600 && totalMinutes < 690) return 'breakfast';
  if (totalMinutes >= 690 && totalMinutes < 780) return 'breakfast';
  if (totalMinutes >= 780 && totalMinutes < 900) return 'lunch';
  if (totalMinutes >= 900 && totalMinutes < 1050) return 'lunch';
  if (totalMinutes >= 1050 && totalMinutes < 1170) return 'lunch';
  if (totalMinutes >= 1170 && totalMinutes < 1320) return 'dinner';
  if (totalMinutes >= 1320 && totalMinutes < 1500) return 'dinner';
  if (totalMinutes >= 1500 && totalMinutes < 1560) return 'dinner';
  return 'bedtime';
}

function detectTimePoint(hours: number, minutes: number, mealType: MealType): TimePoint | null {
  const totalMinutes = hours * 60 + minutes;
  
  switch (mealType) {
    case 'emptyStomach':
      return null;
    case 'breakfast':
      if (totalMinutes < 660) return null;
      if (totalMinutes < 720) return '1h';
      return '2h';
    case 'lunch':
      if (totalMinutes < 900) return null;
      if (totalMinutes < 960) return '1h';
      return '2h';
    case 'dinner':
      if (totalMinutes < 1320) return null;
      if (totalMinutes < 1380) return '1h';
      return '2h';
    case 'bedtime':
      return null;
    default:
      return null;
  }
}

function parseComplexFormat(rawData: any[][], jsonData: any[]): ExcelRowData[] {
  const rows: ExcelRowData[] = [];
  
  let header1Index = 0;
  let header2Index = 1;
  let dataStartIndex = 2;
  
  while (header1Index < rawData.length) {
    const row = rawData[header1Index];
    if (row && row[0] && String(row[0]).trim() === '日期') {
      break;
    }
    header1Index++;
    header2Index++;
    dataStartIndex++;
  }
  
  const header1 = rawData[header1Index] || [];
  const header2 = rawData[header2Index] || [];
  
  console.log('Complex format header1:', header1);
  console.log('Complex format header2:', header2);
  
  const columnMap = buildColumnMap(header1, header2);
  console.log('Column map:', columnMap);
  
  for (let i = dataStartIndex; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row || !row[0]) continue;
    
    const date = parseDateValue(row[0]);
    if (!date || date === '日期') {
      console.log(`Row ${i}: Skipping due to invalid date:`, row[0]);
      continue;
    }
    
    const rowData: ExcelRowData = { date };
    
    if (columnMap.emptyStomach) {
      const time = parseTimeValueFromCell(row[columnMap.emptyStomach.time]);
      const value = parseBloodSugarValueFromCell(row[columnMap.emptyStomach.value]);
      if (time || value > 0) {
        rowData.emptyStomach = { time, value };
      }
    }
    
    if (columnMap.breakfast) {
      const food = parseStringValueFromCell(row[columnMap.breakfast.food]);
      const exercise = parseStringValueFromCell(row[columnMap.breakfast.exercise]);
      if (food || exercise) {
        rowData.breakfast = { food, exercise };
      }
    }
    
    if (columnMap.breakfast1h) {
      const time = parseTimeValueFromCell(row[columnMap.breakfast1h.time]);
      const value = parseBloodSugarValueFromCell(row[columnMap.breakfast1h.value]);
      if (time || value > 0) {
        rowData.breakfast1h = { time, value };
      }
    }
    
    if (columnMap.breakfast2h) {
      const time = parseTimeValueFromCell(row[columnMap.breakfast2h.time]);
      const value = parseBloodSugarValueFromCell(row[columnMap.breakfast2h.value]);
      if (time || value > 0) {
        rowData.breakfast2h = { time, value };
      }
    }
    
    if (columnMap.lunchBefore) {
      const time = parseTimeValueFromCell(row[columnMap.lunchBefore.time]);
      const value = parseBloodSugarValueFromCell(row[columnMap.lunchBefore.value]);
      if (time || value > 0) {
        rowData.lunchBefore = { time, value };
      }
    }
    
    if (columnMap.lunch) {
      const food = parseStringValueFromCell(row[columnMap.lunch.food]);
      const exercise = parseStringValueFromCell(row[columnMap.lunch.exercise]);
      if (food || exercise) {
        rowData.lunch = { food, exercise };
      }
    }
    
    if (columnMap.lunch1h) {
      const time = parseTimeValueFromCell(row[columnMap.lunch1h.time]);
      const value = parseBloodSugarValueFromCell(row[columnMap.lunch1h.value]);
      if (time || value > 0) {
        rowData.lunch1h = { time, value };
      }
    }
    
    if (columnMap.lunch2h) {
      const time = parseTimeValueFromCell(row[columnMap.lunch2h.time]);
      const value = parseBloodSugarValueFromCell(row[columnMap.lunch2h.value]);
      if (time || value > 0) {
        rowData.lunch2h = { time, value };
      }
    }
    
    if (columnMap.dinnerBefore) {
      const time = parseTimeValueFromCell(row[columnMap.dinnerBefore.time]);
      const value = parseBloodSugarValueFromCell(row[columnMap.dinnerBefore.value]);
      if (time || value > 0) {
        rowData.dinnerBefore = { time, value };
      }
    }
    
    if (columnMap.dinner) {
      const food = parseStringValueFromCell(row[columnMap.dinner.food]);
      const exercise = parseStringValueFromCell(row[columnMap.dinner.exercise]);
      if (food || exercise) {
        rowData.dinner = { food, exercise };
      }
    }
    
    if (columnMap.dinner1h) {
      const time = parseTimeValueFromCell(row[columnMap.dinner1h.time]);
      const value = parseBloodSugarValueFromCell(row[columnMap.dinner1h.value]);
      if (time || value > 0) {
        rowData.dinner1h = { time, value };
      }
    }
    
    if (columnMap.dinner2h) {
      const time = parseTimeValueFromCell(row[columnMap.dinner2h.time]);
      const value = parseBloodSugarValueFromCell(row[columnMap.dinner2h.value]);
      if (time || value > 0) {
        rowData.dinner2h = { time, value };
      }
    }
    
    if (columnMap.bedtime) {
      const time = parseTimeValueFromCell(row[columnMap.bedtime.time]);
      const value = parseBloodSugarValueFromCell(row[columnMap.bedtime.value]);
      if (time || value > 0) {
        rowData.bedtime = { time, value };
      }
    }
    
    rows.push(rowData);
    console.log(`Row ${i}: parsed data:`, rowData);
  }
  
  return rows;
}

interface ColumnMap {
  emptyStomach?: { time: number; value: number };
  breakfast?: { food: number; exercise: number };
  breakfast1h?: { time: number; value: number };
  breakfast2h?: { time: number; value: number };
  lunchBefore?: { time: number; value: number };
  lunch?: { food: number; exercise: number };
  lunch1h?: { time: number; value: number };
  lunch2h?: { time: number; value: number };
  dinnerBefore?: { time: number; value: number };
  dinner?: { food: number; exercise: number };
  dinner1h?: { time: number; value: number };
  dinner2h?: { time: number; value: number };
  bedtime?: { time: number; value: number };
}

function buildColumnMap(header1: any[], header2: any[]): ColumnMap {
  const map: ColumnMap = {};
  let currentGroup = '';
  
  for (let i = 0; i < header1.length; i++) {
    const group = String(header1[i] || '').trim();
    const sub = String(header2[i] || '').trim();
    
    if (group) {
      currentGroup = group;
    }
    
    if (!sub && !group) continue;
    
    switch (currentGroup) {
      case '空腹':
        if (!map.emptyStomach) map.emptyStomach = { time: -1, value: -1 };
        if (sub.includes('时间')) map.emptyStomach.time = i;
        if (sub.includes('血糖') || (!sub && typeof header2[i] === 'number')) map.emptyStomach.value = i;
        break;
        
      case '早餐+运动':
        if (!map.breakfast) map.breakfast = { food: -1, exercise: -1 };
        if (sub.includes('早餐')) map.breakfast.food = i;
        if (sub.includes('运动')) map.breakfast.exercise = i;
        break;
        
      case '早餐后1小时':
        if (!map.breakfast1h) map.breakfast1h = { time: -1, value: -1 };
        if (sub.includes('时间')) map.breakfast1h.time = i;
        if (sub.includes('血糖') || (!sub && typeof header2[i] === 'number')) map.breakfast1h.value = i;
        break;
        
      case '早餐后2小时':
        if (!map.breakfast2h) map.breakfast2h = { time: -1, value: -1 };
        if (sub.includes('时间')) map.breakfast2h.time = i;
        if (sub.includes('血糖') || (!sub && typeof header2[i] === 'number')) map.breakfast2h.value = i;
        break;
        
      case '午餐前':
        if (!map.lunchBefore) map.lunchBefore = { time: -1, value: -1 };
        if (sub.includes('时间')) map.lunchBefore.time = i;
        if (sub.includes('血糖') || (!sub && typeof header2[i] === 'number')) map.lunchBefore.value = i;
        break;
        
      case '午餐+运动':
        if (!map.lunch) map.lunch = { food: -1, exercise: -1 };
        if (sub.includes('午餐')) map.lunch.food = i;
        if (sub.includes('运动')) map.lunch.exercise = i;
        break;
        
      case '午餐后1小时':
        if (!map.lunch1h) map.lunch1h = { time: -1, value: -1 };
        if (sub.includes('时间')) map.lunch1h.time = i;
        if (sub.includes('血糖') || (!sub && typeof header2[i] === 'number')) map.lunch1h.value = i;
        break;
        
      case '午餐后2小时':
        if (!map.lunch2h) map.lunch2h = { time: -1, value: -1 };
        if (sub.includes('时间')) map.lunch2h.time = i;
        if (sub.includes('血糖') || (!sub && typeof header2[i] === 'number')) map.lunch2h.value = i;
        break;
        
      case '晚餐前':
        if (!map.dinnerBefore) map.dinnerBefore = { time: -1, value: -1 };
        if (sub.includes('时间')) map.dinnerBefore.time = i;
        if (sub.includes('血糖') || (!sub && typeof header2[i] === 'number')) map.dinnerBefore.value = i;
        break;
        
      case '晚餐+运动':
        if (!map.dinner) map.dinner = { food: -1, exercise: -1 };
        if (sub.includes('晚餐')) map.dinner.food = i;
        if (sub.includes('运动')) map.dinner.exercise = i;
        break;
        
      case '晚餐后1小时':
        if (!map.dinner1h) map.dinner1h = { time: -1, value: -1 };
        if (sub.includes('时间')) map.dinner1h.time = i;
        if (sub.includes('血糖') || (!sub && typeof header2[i] === 'number')) map.dinner1h.value = i;
        break;
        
      case '晚餐后2小时':
        if (!map.dinner2h) map.dinner2h = { time: -1, value: -1 };
        if (sub.includes('时间')) map.dinner2h.time = i;
        if (sub.includes('血糖') || (!sub && typeof header2[i] === 'number')) map.dinner2h.value = i;
        break;
        
      case '睡前':
        if (!map.bedtime) map.bedtime = { time: -1, value: -1 };
        if (sub.includes('时间')) map.bedtime.time = i;
        if (sub.includes('血糖') || (!sub && typeof header2[i] === 'number')) map.bedtime.value = i;
        break;
    }
  }
  
  return map;
}

function parseDateValue(val: any): string {
  if (val === undefined || val === null || val === '') return '';
  
  if (val instanceof Date) {
    const year = val.getFullYear();
    const month = String(val.getMonth() + 1).padStart(2, '0');
    const day = String(val.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  if (typeof val === 'number') {
    const excelDate = val;
    const ms = (excelDate - 25569) * 86400 * 1000;
    const date = new Date(ms);
    date.setHours(date.getHours() + 8);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  let dateStr = String(val).trim().split(' ')[0];
  
  if (/^\d+$/.test(dateStr)) {
    const excelDate = parseFloat(dateStr);
    const ms = (excelDate - 25569) * 86400 * 1000;
    const date = new Date(ms);
    date.setHours(date.getHours() + 8);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  if (!dateStr.includes('-') && !dateStr.includes('/')) {
    const parts = dateStr.match(/(\d{4})(\d{2})(\d{2})/);
    if (parts) {
      return `${parts[1]}-${parts[2]}-${parts[3]}`;
    }
  }
  
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateStr;
  }
  
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [first, second, third] = parts.map(p => parseInt(p, 10));
      
      if (first > 1000) {
        return `${first}-${String(second).padStart(2, '0')}-${String(third).padStart(2, '0')}`;
      } else if (third > 1000) {
        return `${third}-${String(first).padStart(2, '0')}-${String(second).padStart(2, '0')}`;
      } else {
        return `${new Date().getFullYear()}-${String(first).padStart(2, '0')}-${String(second).padStart(2, '0')}`;
      }
    }
  }
  
  return dateStr;
}

function parseTimeValueFromCell(val: any): string {
  if (val === undefined || val === null || val === '') return '';
  
  if (val instanceof Date) {
    const hours = val.getHours();
    const minutes = val.getMinutes();
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
  
  const str = String(val).trim();
  
  const timeMatch = str.match(/(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    return `${String(parseInt(timeMatch[1], 10)).padStart(2, '0')}:${timeMatch[2]}`;
  }
  
  if (typeof val === 'number' && val > 0 && val < 1) {
    const totalMinutes = Math.round(val * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
  
  return str;
}

function parseBloodSugarValueFromCell(val: any): number {
  if (val === undefined || val === null || val === '') return 0;
  
  if (typeof val === 'number') {
    if (val > 100 || val < 0) {
      return 0;
    }
    return parseFloat(val.toFixed(2));
  }
  
  const str = String(val).trim();
  
  const numMatch = str.match(/[\d.]+/);
  if (numMatch) {
    const num = parseFloat(numMatch[0]);
    if (!isNaN(num) && num > 0 && num <= 100) {
      return parseFloat(num.toFixed(2));
    }
  }
  
  return 0;
}

function parseStringValueFromCell(val: any): string {
  if (val === undefined || val === null || val === '') return '';
  const str = String(val).trim();
  if (str === 'undefined' || str === 'null') return '';
  return str;
}

function convertToEntries(rows: ExcelRowData[]): BloodSugarEntry[] {
  const entries: BloodSugarEntry[] = [];
  
  rows.forEach((row) => {
    const createEntry = (mealType: MealType, timePoint: TimePoint | null, time: string, value: number, food: string, exercise: string) => {
      if (value <= 0 && !time) return;
      
      const entry: BloodSugarEntry = {
        id: uuidv4(),
        date: row.date,
        time: time || '00:00',
        mealType,
        timePoint,
        value: value || 0,
        food,
        exercise,
        status: getBloodSugarStatus(value || 0, mealType, timePoint),
        createdAt: Date.now(),
      };
      entries.push(entry);
    };
    
    if (row.emptyStomach) {
      createEntry('emptyStomach', null, row.emptyStomach.time, row.emptyStomach.value, '', '');
    }
    
    if (row.breakfast1h) {
      createEntry('breakfast', '1h', row.breakfast1h.time, row.breakfast1h.value, row.breakfast?.food || '', row.breakfast?.exercise || '');
    }
    if (row.breakfast2h) {
      createEntry('breakfast', '2h', row.breakfast2h.time, row.breakfast2h.value, row.breakfast?.food || '', row.breakfast?.exercise || '');
    }
    
    if (row.lunchBefore) {
      createEntry('lunch', null, row.lunchBefore.time, row.lunchBefore.value, '', '');
    }
    if (row.lunch1h) {
      createEntry('lunch', '1h', row.lunch1h.time, row.lunch1h.value, row.lunch?.food || '', row.lunch?.exercise || '');
    }
    if (row.lunch2h) {
      createEntry('lunch', '2h', row.lunch2h.time, row.lunch2h.value, row.lunch?.food || '', row.lunch?.exercise || '');
    }
    
    if (row.dinnerBefore) {
      createEntry('dinner', null, row.dinnerBefore.time, row.dinnerBefore.value, '', '');
    }
    if (row.dinner1h) {
      createEntry('dinner', '1h', row.dinner1h.time, row.dinner1h.value, row.dinner?.food || '', row.dinner?.exercise || '');
    }
    if (row.dinner2h) {
      createEntry('dinner', '2h', row.dinner2h.time, row.dinner2h.value, row.dinner?.food || '', row.dinner?.exercise || '');
    }
    
    if (row.bedtime) {
      createEntry('bedtime', null, row.bedtime.time, row.bedtime.value, '', '');
    }
  });
  
  entries.sort((a, b) => {
    const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateCompare !== 0) return dateCompare;
    return b.time.localeCompare(a.time);
  });
  
  return entries;
}

export function exportToExcel(entries: BloodSugarEntry[]): void {
  const groupedByDate = entries.reduce((acc, entry) => {
    if (!acc[entry.date]) {
      acc[entry.date] = {
        date: entry.date,
        emptyStomach: null as { time: string; value: number } | null,
        breakfast: { food: '', exercise: '' },
        breakfast1h: null as { time: string; value: number } | null,
        breakfast2h: null as { time: string; value: number } | null,
        lunchBefore: null as { time: string; value: number } | null,
        lunch: { food: '', exercise: '' },
        lunch1h: null as { time: string; value: number } | null,
        lunch2h: null as { time: string; value: number } | null,
        dinnerBefore: null as { time: string; value: number } | null,
        dinner: { food: '', exercise: '' },
        dinner1h: null as { time: string; value: number } | null,
        dinner2h: null as { time: string; value: number } | null,
        bedtime: null as { time: string; value: number } | null,
      };
    }
    
    const group = acc[entry.date];
    
    switch (entry.mealType) {
      case 'emptyStomach':
        group.emptyStomach = { time: entry.time, value: entry.value };
        break;
      case 'breakfast':
        if (!entry.timePoint) {
          group.breakfast.food = entry.food;
          group.breakfast.exercise = entry.exercise;
        } else if (entry.timePoint === '1h') {
          group.breakfast1h = { time: entry.time, value: entry.value };
          group.breakfast.food = group.breakfast.food || entry.food;
          group.breakfast.exercise = group.breakfast.exercise || entry.exercise;
        } else {
          group.breakfast2h = { time: entry.time, value: entry.value };
          group.breakfast.food = group.breakfast.food || entry.food;
          group.breakfast.exercise = group.breakfast.exercise || entry.exercise;
        }
        break;
      case 'lunch':
        if (!entry.timePoint) {
          group.lunchBefore = { time: entry.time, value: entry.value };
        } else if (entry.timePoint === '1h') {
          group.lunch1h = { time: entry.time, value: entry.value };
          group.lunch.food = group.lunch.food || entry.food;
          group.lunch.exercise = group.lunch.exercise || entry.exercise;
        } else {
          group.lunch2h = { time: entry.time, value: entry.value };
          group.lunch.food = group.lunch.food || entry.food;
          group.lunch.exercise = group.lunch.exercise || entry.exercise;
        }
        break;
      case 'dinner':
        if (!entry.timePoint) {
          group.dinnerBefore = { time: entry.time, value: entry.value };
        } else if (entry.timePoint === '1h') {
          group.dinner1h = { time: entry.time, value: entry.value };
          group.dinner.food = group.dinner.food || entry.food;
          group.dinner.exercise = group.dinner.exercise || entry.exercise;
        } else {
          group.dinner2h = { time: entry.time, value: entry.value };
          group.dinner.food = group.dinner.food || entry.food;
          group.dinner.exercise = group.dinner.exercise || entry.exercise;
        }
        break;
      case 'bedtime':
        group.bedtime = { time: entry.time, value: entry.value };
        break;
    }
    
    return acc;
  }, {} as Record<string, ExcelRowData>);
  
  const sortedDates = Object.keys(groupedByDate).sort();
  const data: any[][] = [
    ['日期', '空腹', '', '早餐+运动', '', '早餐后1小时', '', '早餐后2小时', '', '午餐前', '', '午餐+运动', '', '午餐后1小时', '', '午餐后2小时', '', '晚餐前', '', '晚餐+运动', '', '晚餐后1小时', '', '晚餐后2小时', '', '睡前', ''],
    ['', '时间', '血糖', '早餐', '运动', '时间', '血糖', '时间', '血糖', '时间', '血糖', '午餐', '运动', '时间', '血糖', '时间', '血糖', '时间', '血糖', '晚餐', '运动', '时间', '血糖', '时间', '血糖', '时间', '血糖'],
  ];
  
  sortedDates.forEach((date) => {
    const row = groupedByDate[date];
    data.push([
      row.date,
      row.emptyStomach?.time || '',
      row.emptyStomach?.value || '',
      row.breakfast?.food || '',
      row.breakfast?.exercise || '',
      row.breakfast1h?.time || '',
      row.breakfast1h?.value || '',
      row.breakfast2h?.time || '',
      row.breakfast2h?.value || '',
      row.lunchBefore?.time || '',
      row.lunchBefore?.value || '',
      row.lunch?.food || '',
      row.lunch?.exercise || '',
      row.lunch1h?.time || '',
      row.lunch1h?.value || '',
      row.lunch2h?.time || '',
      row.lunch2h?.value || '',
      row.dinnerBefore?.time || '',
      row.dinnerBefore?.value || '',
      row.dinner?.food || '',
      row.dinner?.exercise || '',
      row.dinner1h?.time || '',
      row.dinner1h?.value || '',
      row.dinner2h?.time || '',
      row.dinner2h?.value || '',
      row.bedtime?.time || '',
      row.bedtime?.value || '',
    ]);
  });
  
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
  const now = new Date();
  const fileName = `血糖记录_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.xlsx`;
  
  XLSX.writeFile(workbook, fileName);
}

export function exportToJSON(entries: BloodSugarEntry[]): void {
  const data = JSON.stringify({ records: entries }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const now = new Date();
  const fileName = `血糖记录_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.json`;
  
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}