// Data model and configuration
export const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const margin = { top: 30, right: 40, bottom: 55, left: 60 };
export const width = 700;
export const height = 330;

export const campusData = {
  'All Buildings': {
    electricity: [220, 250, 230, 270, 300, 320, 350],
    water: [100, 110, 105, 120, 130, 125, 140],
    wifi: [500, 550, 600, 650, 620, 700, 750],
    attendance: [85, 90, 88, 92, 95, 93, 96],
    co2: [50, 55, 53, 58, 60, 65, 68],
  },
  Library: {
    electricity: [180, 200, 195, 230, 250, 270, 290],
    water: [80, 85, 90, 88, 95, 100, 110],
    wifi: [420, 450, 470, 500, 520, 540, 560],
    attendance: [90, 92, 93, 94, 95, 94, 95],
    co2: [40, 43, 45, 46, 48, 50, 52],
  },
  Engineering: {
    electricity: [260, 280, 270, 320, 350, 370, 390],
    water: [120, 125, 130, 135, 145, 150, 155],
    wifi: [600, 630, 650, 680, 700, 730, 760],
    attendance: [82, 84, 85, 86, 88, 87, 88],
    co2: [60, 62, 63, 68, 72, 75, 78],
  },
  Business: {
    electricity: [160, 170, 165, 180, 190, 200, 210],
    water: [70, 72, 74, 76, 78, 80, 82],
    wifi: [350, 370, 390, 410, 430, 450, 470],
    attendance: [78, 80, 81, 82, 83, 82, 82],
    co2: [35, 37, 36, 39, 40, 42, 43],
  },
  Science: {
    electricity: [210, 230, 225, 250, 270, 290, 310],
    water: [95, 100, 98, 110, 115, 120, 125],
    wifi: [480, 500, 520, 540, 560, 580, 600],
    attendance: [86, 88, 89, 90, 91, 90, 91],
    co2: [48, 50, 51, 54, 56, 59, 61],
  },
};

export function latest(arr) {
  return arr[arr.length - 1];
}

// Simulation helper: start a buffered update loop and call handler after updates
export function startSimulation(
  getSelectedBuilding,
  onTick,
  intervalMs = 1000
) {
  let running = true;
  const id = setInterval(() => {
    if (!running) return;
    const selected = getSelectedBuilding();
    const data = campusData[selected];

    data.electricity.push(Math.floor(Math.random() * 80) + 250);
    data.electricity.shift();

    data.water.push(Math.floor(Math.random() * 40) + 100);
    data.water.shift();

    data.wifi.push(Math.floor(Math.random() * 200) + 550);
    data.wifi.shift();

    data.attendance.push(Math.floor(Math.random() * 15) + 82);
    data.attendance.shift();

    data.co2.push(Math.floor(Math.random() * 30) + 50);
    data.co2.shift();

    if (typeof onTick === 'function') onTick();
  }, intervalMs);

  return {
    stop() {
      running = false;
      clearInterval(id);
    },
    start() {
      running = true;
    },
  };
}
