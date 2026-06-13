import { latest } from './data.js';

export function updateKPI(data) {
    document.getElementById('electricityValue').innerHTML = latest(data.electricity) + ' kWh';
    document.getElementById('waterValue').innerHTML = latest(data.water) + ' L';
    document.getElementById('wifiValue').innerHTML = latest(data.wifi);
    document.getElementById('attendanceValue').innerHTML = latest(data.attendance) + '%';
    document.getElementById('co2Value').innerHTML = latest(data.co2) + ' kg';
}
