import { ref, set, get, child } from "firebase/database";
import { database } from "../firebaseConfig";

//-------- get date from 1 year ago -------------
export const getDate365DaysAgo = () => {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 365);

    // Format to YYYY-MM-DD
    const year = pastDate.getFullYear();
    const month = String(pastDate.getMonth() + 1).padStart(2, '0');
    const day = String(pastDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

// get market time
export const isStockMarketOpen= (dateString) => {
    const date = new Date(dateString);
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday
    const hours = date.getHours(); // 0 - 23
  
    const isWeekend = day === 0 || day === 6;
    const isMarketHours = hours >= 9 && hours < 17; // 9AM to 5PM
  
    return !isWeekend && isMarketHours;
}

// get today's date
export const getCurrentDate = () => {
    const today = new Date();
  
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
}
  